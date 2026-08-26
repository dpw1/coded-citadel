/* global SUPABASE_URL, SUPABASE_ANON_KEY, Toastify */

const YFP_UNLIMITED = 9999

let yfpInitDone = false
let yfpProfileCache = []
let yfpSortKey = 'created'
let yfpSortDir = 'desc'

function yfpUtcMonth() {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

function yfpUsage(row) {
  const data = row && row.data && typeof row.data === 'object' ? row.data : {}
  return {
    month: String(data.month || row.usage_month || ''),
    searches: Number(data.searches ?? row.searches_this_month ?? 0),
    searchCap: Number(row.monthly_quota ?? data.searchCap ?? 25),
    exports: Number(data.exports || 0),
    exportCap: Number(data.exportCap || 5),
  }
}

function yfpIsUnlimited(row) {
  const grant = row.grant_until ? Date.parse(row.grant_until) : NaN
  const usage = yfpUsage(row)
  return (
    row.is_lifetime === true ||
    row.is_paying === true ||
    usage.searchCap >= YFP_UNLIMITED ||
    (Number.isFinite(grant) && grant > Date.now())
  )
}

function yfpAnonKey() {
  return String(window.SUPABASE_ANON_KEY || '').trim()
}

function yfpHeaders() {
  const key = yfpAnonKey()
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }
}

function yfpRest(path) {
  return `${String(window.SUPABASE_URL || SUPABASE_URL || '').replace(/\/+$/, '')}/rest/v1/${path}`
}

async function yfpCopyText(text) {
  const value = String(text || '')
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(value)
      return
    }
  } catch {
    /* file:// and some browsers need the execCommand fallback */
  }
  const ta = document.createElement('textarea')
  ta.value = value
  ta.setAttribute('readonly', '')
  ta.style.position = 'fixed'
  ta.style.left = '-9999px'
  document.body.appendChild(ta)
  ta.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(ta)
  if (!ok) throw new Error('copy failed')
}

function yfpToast(message, type) {
  const colors = {
    success: '#16a34a',
    error: '#dc2626',
    warning: '#d97706',
    info: '#2563eb',
  }
  const text = String(message || '').trim()
  if (!text) return
  if (typeof Toastify === 'function') {
    Toastify({
      text,
      duration: 3200,
      gravity: 'bottom',
      position: 'right',
      close: true,
      stopOnFocus: true,
      style: {
        background: colors[type] || colors.info,
        color: '#fff',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,.28)',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
    }).showToast()
    return
  }
  console[type === 'error' ? 'error' : 'log'](text)
}

function yfpGenerateCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(4))
  const hex = [...bytes].map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join('')
  return `YFP-${hex.slice(0, 4)}-${hex.slice(4, 8)}`
}

function yfpNormalizeGiftName(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
}

function yfpGiftNameTaken(name, exceptId) {
  const wanted = yfpNormalizeGiftName(name)
  if (!wanted) return false
  return [...document.querySelectorAll('#yt-gifts-body [data-gift-id]')].some((tr) => {
    if (exceptId && tr.dataset.giftId === exceptId) return false
    return yfpNormalizeGiftName(tr.querySelector('.yt-gift-code-input')?.value) === wanted
  })
}

function yfpFillGiftName() {
  const input = document.getElementById('yt-gift-name')
  if (input) input.value = yfpGenerateCode()
}

function yfpGiftError(err) {
  const msg = err instanceof Error ? err.message : String(err)
  if (/duplicate key|unique constraint|already exists|23505/i.test(msg)) {
    return 'That gift name is already in use.'
  }
  return msg
}

async function yfpFetchJson(url, options) {
  const res = await fetch(url, options)
  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = text
  }
  if (!res.ok) {
    const msg = json?.message || json?.error || text || res.statusText
    throw new Error(msg || `HTTP ${res.status}`)
  }
  return json
}

async function yfpLoadProfiles() {
  try {
    const viaRpc = await yfpFetchJson(`${yfpRest('rpc/yt_filter_pro_admin_list_profiles')}`, {
      method: 'POST',
      headers: yfpHeaders(),
      body: '{}',
    })
    if (Array.isArray(viaRpc)) return viaRpc
  } catch {
    /* RPC missing until SQL is re-run — fall back to table select */
  }
  return yfpFetchJson(`${yfpRest('yt_filter_pro_profiles')}?select=*&order=created_at.desc`, {
    headers: yfpHeaders(),
  })
}

async function yfpLoadGifts() {
  return yfpFetchJson(
    `${yfpRest('yt_filter_pro_gift_codes')}?select=*,yt_filter_pro_gift_redemptions(email,redeemed_at)&order=created_at.desc`,
    { headers: yfpHeaders() },
  )
}

function yfpEmailBlacklisted(email) {
  if (typeof window.isYtEmailBlacklisted === 'function') {
    return window.isYtEmailBlacklisted(email)
  }
  return false
}

function yfpDateMs(value) {
  if (!value) return 0
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : 0
}

function yfpRelativeLabel(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  const diffMs = Date.now() - d.getTime()
  const future = diffMs < 0
  const abs = Math.abs(diffMs)
  const sec = Math.round(abs / 1000)
  const min = Math.round(sec / 60)
  const hr = Math.round(min / 60)
  const day = Math.round(hr / 24)
  const week = Math.round(day / 7)
  const month = Math.round(day / 30)
  const year = Math.round(day / 365)
  let label
  if (sec < 45) label = 'just now'
  else if (min < 60) label = `${min} minute${min === 1 ? '' : 's'}`
  else if (hr < 24) label = `${hr} hour${hr === 1 ? '' : 's'}`
  else if (day < 7) label = `${day} day${day === 1 ? '' : 's'}`
  else if (week < 5) label = `${week} week${week === 1 ? '' : 's'}`
  else if (month < 12) label = `${month} month${month === 1 ? '' : 's'}`
  else label = `${year} year${year === 1 ? '' : 's'}`
  if (label === 'just now') return label
  return future ? `in ${label}` : `${label} ago`
}

function yfpFormatDateRelative(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const yyyy = d.getUTCFullYear()
  const absolute = `${dd}-${mm}-${yyyy}`
  const relative = yfpRelativeLabel(value)
  return relative ? `${absolute} (${relative})` : absolute
}

function yfpUsedThisMonth(row) {
  const usage = yfpUsage(row)
  return usage.month === yfpUtcMonth() ? usage.searches : 0
}

function yfpSortValue(row, key) {
  const usage = yfpUsage(row)
  switch (key) {
    case 'email':
      return String(row.email || '').toLowerCase()
    case 'quota':
      return Number.isFinite(usage.searchCap) ? usage.searchCap : 0
    case 'used':
      return yfpUsedThisMonth(row)
    case 'paying':
      return row.is_paying ? 1 : 0
    case 'lifetime':
      return row.is_lifetime ? 1 : 0
    case 'grant':
      return yfpDateMs(row.grant_until)
    case 'created':
      return yfpDateMs(row.created_at)
    default:
      return 0
  }
}

function yfpSortedRows(rows) {
  return [...rows].sort((a, b) => {
    const av = yfpSortValue(a, yfpSortKey)
    const bv = yfpSortValue(b, yfpSortKey)
    let cmp = 0
    if (typeof av === 'string' || typeof bv === 'string') {
      cmp = String(av).localeCompare(String(bv))
    } else {
      cmp = av - bv
    }
    if (cmp === 0) cmp = String(a.email || '').localeCompare(String(b.email || ''))
    return yfpSortDir === 'asc' ? cmp : -cmp
  })
}

function yfpSyncSortHeaders() {
  document.querySelectorAll('#yt-loggedin-table-wrap .admin__users-sort').forEach((btn) => {
    const key = btn.dataset.sort
    if (key === yfpSortKey) {
      btn.setAttribute('aria-sort', yfpSortDir === 'asc' ? 'ascending' : 'descending')
    } else {
      btn.removeAttribute('aria-sort')
    }
  })
}

function yfpRenderProfiles(rows) {
  yfpProfileCache = Array.isArray(rows) ? rows : []
  const visible = yfpProfileCache.filter((row) => !yfpEmailBlacklisted(row.email))
  const query = String(document.getElementById('yt-loggedin-search')?.value || '')
    .trim()
    .toLowerCase()
  const filtered = visible.filter((row) => {
    if (!query) return true
    return String(row.email || '').toLowerCase().includes(query)
  })
  const unlimited = visible.filter(yfpIsUnlimited).length
  const paying = visible.filter((row) => row.is_paying).length
  const setKpi = (id, value) => {
    const el = document.getElementById(id)
    if (el) el.textContent = String(value)
  }
  setKpi('kpi-yt-loggedin-total', visible.length.toLocaleString('en-US'))
  setKpi('kpi-yt-loggedin-unlimited', unlimited.toLocaleString('en-US'))
  setKpi('kpi-yt-loggedin-paying', paying.toLocaleString('en-US'))

  const kpis = document.getElementById('yt-loggedin-kpis')
  const toolbar = document.getElementById('yt-loggedin-toolbar')
  const wrap = document.getElementById('yt-loggedin-table-wrap')
  const empty = document.getElementById('yt-loggedin-empty')
  const body = document.getElementById('yt-loggedin-body')
  if (kpis) kpis.hidden = false
  if (toolbar) toolbar.hidden = false
  if (!body) return

  if (!filtered.length) {
    if (wrap) wrap.hidden = true
    if (empty) {
      empty.hidden = false
      empty.textContent = visible.length
        ? 'No users match this filter.'
        : 'No logged-in users yet. They appear here after Google sign-in.'
    }
    body.innerHTML = ''
    return
  }
  if (empty) empty.hidden = true
  if (wrap) wrap.hidden = false
  yfpSyncSortHeaders()
  const sorted = yfpSortedRows(filtered)
  body.innerHTML = sorted
    .map((row) => {
      const usage = yfpUsage(row)
      const used = yfpUsedThisMonth(row)
      const quota = Number.isFinite(usage.searchCap) ? usage.searchCap : 0
      const grant = yfpFormatDateRelative(row.grant_until)
      const created = yfpFormatDateRelative(row.created_at)
      const grantTitle = row.grant_until ? String(row.grant_until) : ''
      const createdTitle = row.created_at ? String(row.created_at) : ''
      return `<tr data-user-id="${String(row.user_id).replace(/"/g, '')}">
        <td>${escapeHtmlAdmin(row.email || '')}</td>
        <td class="yt-quota-cell">
          <button type="button" class="yt-quota-display">${quota}</button>
          <input type="number" class="admin__users-search yt-quota-input" min="0" value="${quota}" hidden />
        </td>
        <td class="admin__users-num">${used}</td>
        <td><span class="admin__users-pill ${row.is_paying ? 'admin__users-pill--yes' : 'admin__users-pill--no'}">${row.is_paying ? 'yes' : 'no'}</span></td>
        <td><span class="admin__users-pill ${row.is_lifetime ? 'admin__users-pill--yes' : 'admin__users-pill--no'}">${row.is_lifetime ? 'yes' : 'no'}</span></td>
        <td title="${escapeHtmlAdmin(grantTitle)}">${escapeHtmlAdmin(grant)}</td>
        <td title="${escapeHtmlAdmin(createdTitle)}">${escapeHtmlAdmin(created)}</td>
        <td><button type="button" class="admin__btn admin__btn--outline admin__btn--sm yt-quota-save">Save</button></td>
      </tr>`
    })
    .join('')
}

function yfpRenderGifts(rows) {
  const body = document.getElementById('yt-gifts-body')
  if (!body) return
  body.innerHTML = (rows || [])
    .map((row) => {
      const redemptions = Array.isArray(row.yt_filter_pro_gift_redemptions)
        ? row.yt_filter_pro_gift_redemptions
        : []
      const emails = redemptions
        .map((r) => r.email)
        .filter((email) => email && !yfpEmailBlacklisted(email))
        .join(', ') || '—'
      const kind = row.kind === 'lifetime' ? 'lifetime' : 'days'
      const days = Number(row.duration_days) || 0
      const max = Number(row.max_redemptions) || 1
      const used = Number(row.redemption_count) || 0
      const name = yfpNormalizeGiftName(row.code)
      return `<tr data-gift-id="${escapeHtmlAdmin(row.id || '')}">
        <td>
          <div class="yt-gift-code-wrap">
            <input type="text" class="admin__users-search yt-gift-code-input" value="${escapeHtmlAdmin(name)}" spellcheck="false" autocomplete="off" />
            <button type="button" class="admin__btn admin__btn--outline admin__btn--sm yt-gift-copy" title="Copy ${escapeHtmlAdmin(name)}" aria-label="Copy ${escapeHtmlAdmin(name)}">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>
            </button>
          </div>
        </td>
        <td>
          <select class="admin__select yt-gift-kind yt-gift-kind-input">
            <option value="days"${kind === 'days' ? ' selected' : ''}>Days</option>
            <option value="lifetime"${kind === 'lifetime' ? ' selected' : ''}>Lifetime</option>
          </select>
        </td>
        <td><input type="number" class="admin__users-search yt-gift-days-input" min="1" value="${days}" ${kind === 'lifetime' ? 'disabled' : ''} /></td>
        <td><input type="number" class="admin__users-search yt-gift-max-input" min="${Math.max(1, used)}" value="${max}" /></td>
        <td>${used}</td>
        <td><input type="text" class="admin__users-search yt-gift-note-input" value="${escapeHtmlAdmin(row.note || '')}" /></td>
        <td>${escapeHtmlAdmin(emails)}</td>
        <td><button type="button" class="admin__btn admin__btn--outline admin__btn--sm yt-gift-save">Save</button></td>
        <td><button type="button" class="admin__btn admin__btn--outline admin__btn--sm yt-gift-delete" aria-label="Delete ${escapeHtmlAdmin(row.code)}"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v10h-2V9zm4 0h2v10h-2V9zM7 9h2v10H7V9z"/></svg></button></td>
      </tr>`
    })
    .join('')
}

function escapeHtmlAdmin(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function yfpErrorHint(msg) {
  if (/could not find the table|relation/i.test(msg)) {
    return ' Run scripts/yt_filter_pro_entitlements.sql in the Supabase SQL editor.'
  }
  if (/permission|rls|42501|401|403/i.test(msg)) {
    return ' Add the anon policies from scripts/yt_filter_pro_entitlements.sql.'
  }
  return ''
}

async function yfpRefresh(opts = {}) {
  if (!yfpAnonKey()) {
    yfpToast('Missing Supabase anon key.', 'error')
    return
  }
  try {
    const profiles = await yfpLoadProfiles()
    yfpRenderProfiles(Array.isArray(profiles) ? profiles : [])
    if (opts.toast) yfpToast('Logged-in users updated.', 'success')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    yfpToast(msg + yfpErrorHint(msg), 'error')
  }
}

async function yfpRefreshGifts() {
  if (!yfpAnonKey()) {
    yfpToast('Missing Supabase anon key.', 'error')
    return
  }
  try {
    const gifts = await yfpLoadGifts()
    yfpRenderGifts(Array.isArray(gifts) ? gifts : [])
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    yfpToast(msg + yfpErrorHint(msg), 'error')
  }
}

async function yfpSaveQuota(userId, quota) {
  const row = yfpProfileCache.find((item) => String(item.user_id) === String(userId)) || {}
  const usage = yfpUsage(row)
  const url = `${yfpRest('yt_filter_pro_profiles')}?user_id=eq.${encodeURIComponent(userId)}`
  await yfpFetchJson(url, {
    method: 'PATCH',
    headers: yfpHeaders(),
    body: JSON.stringify({
      monthly_quota: quota,
      data: {
        ...usage,
        searchCap: quota,
      },
      updated_at: new Date().toISOString(),
    }),
  })
}

async function yfpSaveGift(id, payload) {
  const url = `${yfpRest('yt_filter_pro_gift_codes')}?id=eq.${encodeURIComponent(id)}`
  await yfpFetchJson(url, {
    method: 'PATCH',
    headers: yfpHeaders(),
    body: JSON.stringify(payload),
  })
}

async function yfpDeleteGift(id) {
  const url = `${yfpRest('yt_filter_pro_gift_codes')}?id=eq.${encodeURIComponent(id)}`
  await yfpFetchJson(url, {
    method: 'DELETE',
    headers: yfpHeaders(),
  })
}

async function yfpCreateGift(event) {
  event.preventDefault()
  const kind = String(document.getElementById('yt-gift-kind')?.value || 'days')
  const days = Number(document.getElementById('yt-gift-days')?.value || 60)
  const max = Number(document.getElementById('yt-gift-max')?.value || 1)
  const note = String(document.getElementById('yt-gift-note')?.value || '').trim()
  const nameInput = document.getElementById('yt-gift-name')
  const code = yfpNormalizeGiftName(nameInput?.value) || yfpGenerateCode()
  const hint = document.getElementById('yt-gift-created')
  if (nameInput) nameInput.value = code
  if (yfpGiftNameTaken(code)) {
    yfpToast('That gift name is already in use.', 'error')
    nameInput?.focus()
    nameInput?.select()
    return
  }
  try {
    await yfpFetchJson(yfpRest('yt_filter_pro_gift_codes'), {
      method: 'POST',
      headers: yfpHeaders(),
      body: JSON.stringify({
        code,
        kind,
        duration_days: kind === 'lifetime' ? 0 : days,
        max_redemptions: Math.max(1, max),
        note: note || null,
      }),
    })
    if (hint) hint.hidden = true
    yfpToast(`Created ${code}`, 'success')
    yfpFillGiftName()
    await yfpRefreshGifts()
  } catch (err) {
    yfpToast(yfpGiftError(err), 'error')
  }
}

function yfpInit() {
  if (yfpInitDone) return
  yfpInitDone = true
  document.getElementById('yt-loggedin-search')?.addEventListener('input', () => {
    yfpRenderProfiles(yfpProfileCache)
  })
  document.getElementById('yt-loggedin-refresh')?.addEventListener('click', () => {
    void yfpRefresh({ toast: true })
  })
  document.getElementById('yt-loggedin-table-wrap')?.addEventListener('click', (event) => {
    const btn = event.target.closest('.admin__users-sort')
    if (!btn) return
    const key = btn.dataset.sort
    if (!key) return
    if (yfpSortKey === key) {
      yfpSortDir = yfpSortDir === 'asc' ? 'desc' : 'asc'
    } else {
      yfpSortKey = key
      yfpSortDir = key === 'email' ? 'asc' : 'desc'
    }
    yfpRenderProfiles(yfpProfileCache)
  })
  document.getElementById('yt-loggedin-body')?.addEventListener('click', (event) => {
    const cell = event.target.closest('.yt-quota-cell')
    if (cell) {
      const display = cell.querySelector('.yt-quota-display')
      const input = cell.querySelector('.yt-quota-input')
      if (input && input.hidden) {
        if (display) display.hidden = true
        input.hidden = false
        input.focus()
        input.select()
      }
      return
    }
    const btn = event.target.closest('.yt-quota-save')
    if (!btn) return
    const tr = btn.closest('tr')
    const userId = tr?.dataset.userId
    const quota = Number(tr?.querySelector('.yt-quota-input')?.value)
    if (!userId || !Number.isFinite(quota)) return
    btn.disabled = true
    void yfpSaveQuota(userId, quota)
      .then(() => yfpRefresh({ silent: true }))
      .then(() => yfpToast('Quota saved.', 'success'))
      .catch((err) => yfpToast(err instanceof Error ? err.message : String(err), 'error'))
      .finally(() => {
        btn.disabled = false
      })
  })
  document.getElementById('yt-gifts-form')?.addEventListener('submit', yfpCreateGift)
  document.getElementById('yt-gift-name')?.addEventListener('blur', (event) => {
    const input = event.target
    const normalized = yfpNormalizeGiftName(input.value)
    if (normalized) input.value = normalized
  })
  yfpFillGiftName()
  document.getElementById('yt-gifts-body')?.addEventListener('change', (event) => {
    const kindSel = event.target.closest('.yt-gift-kind-input')
    if (!kindSel) return
    const tr = kindSel.closest('tr')
    const daysInput = tr?.querySelector('.yt-gift-days-input')
    if (daysInput) daysInput.disabled = kindSel.value === 'lifetime'
  })
  document.getElementById('yt-gifts-body')?.addEventListener('blur', (event) => {
    const input = event.target.closest('.yt-gift-code-input')
    if (!input) return
    const normalized = yfpNormalizeGiftName(input.value)
    if (normalized) input.value = normalized
  }, true)
  document.getElementById('yt-gifts-body')?.addEventListener('click', (event) => {
    const copyBtn = event.target.closest('.yt-gift-copy')
    if (copyBtn) {
      const tr = copyBtn.closest('[data-gift-id]')
      const code = yfpNormalizeGiftName(tr?.querySelector('.yt-gift-code-input')?.value)
      if (!code) return
      void yfpCopyText(code)
        .then(() => yfpToast(`Copied ${code}`, 'success'))
        .catch((err) => yfpToast(err instanceof Error ? err.message : 'Copy failed', 'error'))
      return
    }
    const saveBtn = event.target.closest('.yt-gift-save')
    const deleteBtn = event.target.closest('.yt-gift-delete')
    const tr = event.target.closest('tr')
    const id = tr?.dataset.giftId
    if (!tr || !id) return
    if (saveBtn) {
      const nameInput = tr.querySelector('.yt-gift-code-input')
      const code = yfpNormalizeGiftName(nameInput?.value)
      if (!code) {
        yfpToast('Gift name cannot be empty.', 'error')
        nameInput?.focus()
        return
      }
      if (yfpGiftNameTaken(code, id)) {
        yfpToast('That gift name is already in use.', 'error')
        nameInput?.focus()
        nameInput?.select()
        return
      }
      if (nameInput) nameInput.value = code
      const kind = String(tr.querySelector('.yt-gift-kind-input')?.value || 'days')
      const days = Number(tr.querySelector('.yt-gift-days-input')?.value || 0)
      const max = Number(tr.querySelector('.yt-gift-max-input')?.value || 1)
      const note = String(tr.querySelector('.yt-gift-note-input')?.value || '').trim()
      saveBtn.disabled = true
      void yfpSaveGift(id, {
        code,
        kind,
        duration_days: kind === 'lifetime' ? 0 : Math.max(1, days),
        max_redemptions: Math.max(1, max),
        note: note || null,
      })
        .then(() => {
          yfpToast('Gift code saved.', 'success')
          return yfpRefreshGifts()
        })
        .catch((err) => yfpToast(yfpGiftError(err), 'error'))
        .finally(() => {
          saveBtn.disabled = false
        })
      return
    }
    if (deleteBtn) {
      if (!window.confirm('Delete this gift code? This cannot be undone.')) return
      deleteBtn.disabled = true
      void yfpDeleteGift(id)
        .then(() => {
          yfpToast('Gift code deleted.', 'success')
          return yfpRefreshGifts()
        })
        .catch((err) => yfpToast(err instanceof Error ? err.message : String(err), 'error'))
        .finally(() => {
          deleteBtn.disabled = false
        })
    }
  })
  void yfpRefresh()
}

window.YfpAdminAccounts = {
  render: yfpRefresh,
  renderGifts: yfpRefreshGifts,
  init: yfpInit,
  refresh: yfpRefresh,
}
document.addEventListener('DOMContentLoaded', yfpInit)
if (document.readyState !== 'loading') yfpInit()
