/* global Toastify */

let ispInitDone = false
let ispUserCache = []
let ispGiftCache = []
let ispGiftModalId = null
let ispSortKey = 'activated'
let ispSortDir = 'desc'
let ispRefreshInFlight = false

function ispAnonKey() {
  return String(window.ISP_SUPABASE_ANON_KEY || '').trim()
}

function ispSupabaseUrl() {
  return String(window.ISP_SUPABASE_URL || '').replace(/\/+$/, '')
}

function ispHeaders() {
  const key = ispAnonKey()
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }
}

function ispRest(path) {
  return `${ispSupabaseUrl()}/rest/v1/${path}`
}

async function ispFetchJson(url, options = {}) {
  const res = await fetch(url, options)
  const text = await res.text()
  let json = null
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      json = text
    }
  }
  if (!res.ok) {
    const msg =
      (json && typeof json === 'object' && (json.message || json.error || json.hint)) ||
      (typeof json === 'string' ? json : '') ||
      res.statusText ||
      `HTTP ${res.status}`
    throw new Error(String(msg))
  }
  return json
}

function ispToast(message, type) {
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

function escapeHtmlIsp(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function ispGenerateCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(4))
  const hex = [...bytes].map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join('')
  return `GIFT-${hex.slice(0, 4)}-${hex.slice(4, 8)}`
}

function ispNormalizeGiftName(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
}

function ispGiftNameTaken(name, exceptId) {
  const normalized = ispNormalizeGiftName(name)
  return ispGiftCache.some(
    (row) =>
      ispNormalizeGiftName(row.code) === normalized &&
      String(row.id) !== String(exceptId || ''),
  )
}

function ispFillGiftName() {
  const input = document.getElementById('isp-gift-name')
  if (input && !ispNormalizeGiftName(input.value)) input.value = ispGenerateCode()
}

function ispFormatDate(value) {
  if (!value) return 'â€”'
  const ms = Date.parse(value)
  if (!Number.isFinite(ms)) return 'â€”'
  return new Date(ms).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function ispFormatDateRelative(value) {
  if (!value) return 'â€”'
  const ms = Date.parse(value)
  if (!Number.isFinite(ms)) return 'â€”'
  const diff = Date.now() - ms
  const abs = Math.abs(diff)
  const mins = Math.round(abs / 60000)
  if (mins < 60) return diff >= 0 ? `${mins}m ago` : `in ${mins}m`
  const hours = Math.round(mins / 60)
  if (hours < 48) return diff >= 0 ? `${hours}h ago` : `in ${hours}h`
  const days = Math.round(hours / 24)
  if (days < 60) return diff >= 0 ? `${days}d ago` : `in ${days}d`
  return ispFormatDate(value)
}

function ispIsGrantActive(row) {
  if (!row) return false
  if (row.is_lifetime) return true
  if (!row.grant_until) return false
  return Date.parse(row.grant_until) > Date.now()
}

function ispGiftExpirationDisplay(kind, days) {
  if (kind === 'lifetime') return { text: 'Lifetime', title: 'Lifetime' }
  const n = Math.max(1, Number(days) || 0)
  const unit = kind === 'months' ? 'month' : 'day'
  const text = `${n} ${unit}${n === 1 ? '' : 's'} from redeem`
  return { text, title: text }
}

function ispUpdateGiftExpirationPreview() {
  const kind = String(document.getElementById('isp-gift-kind')?.value || 'days')
  const days = Number(document.getElementById('isp-gift-days')?.value || 60)
  const label = document.getElementById('isp-gift-duration-label')
  const preview = document.getElementById('isp-gift-expiration-preview')
  const daysInput = document.getElementById('isp-gift-days')
  if (label) label.textContent = kind === 'months' ? 'Months' : kind === 'lifetime' ? 'â€”' : 'Days'
  if (daysInput) daysInput.disabled = kind === 'lifetime'
  if (preview) {
    const exp = ispGiftExpirationDisplay(kind, days)
    preview.textContent = kind === 'lifetime' ? 'Expiration: lifetime' : `Expiration: ${exp.text}`
  }
}

async function ispCopyText(text) {
  const value = String(text || '')
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(value)
      return
    }
  } catch {
    /* fallback */
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

async function ispLoadUsers() {
  const grantsUrl = `${ispRest('isp_license_device_grants')}?select=*&order=activated_at.desc`
  const usageUrl = `${ispRest('isp_export_usage')}?select=*&order=updated_at.desc`
  const [grants, usage] = await Promise.all([
    ispFetchJson(grantsUrl, { headers: ispHeaders() }),
    ispFetchJson(usageUrl, { headers: ispHeaders() }).catch(() => []),
  ])
  const usageByDevice = new Map()
  for (const row of Array.isArray(usage) ? usage : []) {
    const key = String(row.device_id || '')
    if (!key) continue
    const prev = usageByDevice.get(key)
    if (!prev || Date.parse(row.updated_at || 0) > Date.parse(prev.updated_at || 0)) {
      usageByDevice.set(key, row)
    }
  }
  return (Array.isArray(grants) ? grants : []).map((g) => ({
    ...g,
    _usage: usageByDevice.get(String(g.device_id || '')) || null,
  }))
}

async function ispLoadGifts() {
  const url = `${ispRest('isp_gift_codes')}?select=*,isp_gift_device_redemptions(id,device_id,redeemed_at,grant_until)&order=created_at.desc`
  return ispFetchJson(url, { headers: ispHeaders() })
}

function ispSortedUsers(rows) {
  const list = [...rows]
  const dir = ispSortDir === 'asc' ? 1 : -1
  list.sort((a, b) => {
    const activeA = ispIsGrantActive(a) ? 1 : 0
    const activeB = ispIsGrantActive(b) ? 1 : 0
    let av
    let bv
    switch (ispSortKey) {
      case 'email':
        av = String(a.customer_email || '').toLowerCase()
        bv = String(b.customer_email || '').toLowerCase()
        break
      case 'device':
        av = String(a.device_id || '')
        bv = String(b.device_id || '')
        break
      case 'status':
        av = activeA
        bv = activeB
        break
      case 'exports':
        av = Number(a._usage?.export_count || 0)
        bv = Number(b._usage?.export_count || 0)
        break
      case 'grant':
        av = Date.parse(a.grant_until || 0) || 0
        bv = Date.parse(b.grant_until || 0) || 0
        break
      case 'activated':
      default:
        av = Date.parse(a.activated_at || 0) || 0
        bv = Date.parse(b.activated_at || 0) || 0
        break
    }
    if (av < bv) return -1 * dir
    if (av > bv) return 1 * dir
    return 0
  })
  return list
}

function ispSyncSortHeaders() {
  document.querySelectorAll('#isp-users-table-wrap .admin__users-sort').forEach((btn) => {
    const key = btn.dataset.sort
    const active = key === ispSortKey
    btn.classList.toggle('admin__users-sort--active', active)
    btn.dataset.dir = active ? ispSortDir : ''
  })
}

function ispRenderUsers(rows) {
  const body = document.getElementById('isp-users-body')
  const wrap = document.getElementById('isp-users-table-wrap')
  const empty = document.getElementById('isp-users-empty')
  const toolbar = document.getElementById('isp-users-toolbar')
  const kpis = document.getElementById('isp-users-kpis')
  if (!body) return

  ispUserCache = Array.isArray(rows) ? rows : []
  const q = String(document.getElementById('isp-users-search')?.value || '')
    .trim()
    .toLowerCase()
  const filtered = ispUserCache.filter((row) => {
    if (!q) return true
    return (
      String(row.device_id || '')
        .toLowerCase()
        .includes(q) ||
      String(row.customer_email || '')
        .toLowerCase()
        .includes(q) ||
      String(row.lemon_license_id || '')
        .toLowerCase()
        .includes(q)
    )
  })

  const total = filtered.length
  const active = filtered.filter((r) => ispIsGrantActive(r)).length
  const lifetime = filtered.filter((r) => r.is_lifetime).length
  const elTotal = document.getElementById('kpi-isp-users-total')
  const elActive = document.getElementById('kpi-isp-users-active')
  const elLifetime = document.getElementById('kpi-isp-users-lifetime')
  if (elTotal) elTotal.textContent = String(total)
  if (elActive) elActive.textContent = String(active)
  if (elLifetime) elLifetime.textContent = String(lifetime)
  if (kpis) kpis.hidden = false
  if (toolbar) toolbar.hidden = false

  if (!filtered.length) {
    if (wrap) wrap.hidden = true
    if (empty) {
      empty.hidden = false
      empty.textContent = ispUserCache.length
        ? 'No users match this filter.'
        : 'No license grants yet. They appear after Lemon purchase + activate.'
    }
    body.innerHTML = ''
    return
  }

  if (empty) empty.hidden = true
  if (wrap) wrap.hidden = false
  ispSyncSortHeaders()
  body.innerHTML = ispSortedUsers(filtered)
    .map((row) => {
      const activeGrant = ispIsGrantActive(row)
      const exportsUsed = Number(row._usage?.export_count || 0)
      const txUsed = Number(row._usage?.transcription_count || 0)
      const device = String(row.device_id || '')
      const shortDevice = device.length > 14 ? `${device.slice(0, 8)}â€¦${device.slice(-4)}` : device
      return `<tr data-device-id="${escapeHtmlIsp(device)}">
        <td title="${escapeHtmlIsp(device)}">${escapeHtmlIsp(shortDevice || 'â€”')}</td>
        <td>${escapeHtmlIsp(row.customer_email || 'â€”')}</td>
        <td><span class="admin__users-pill ${activeGrant ? 'admin__users-pill--yes' : 'admin__users-pill--no'}">${activeGrant ? 'active' : 'expired'}</span></td>
        <td><span class="admin__users-pill ${row.is_lifetime ? 'admin__users-pill--yes' : 'admin__users-pill--no'}">${row.is_lifetime ? 'yes' : 'no'}</span></td>
        <td class="admin__users-num" title="period ${escapeHtmlIsp(row._usage?.period_key || '')}">${exportsUsed}</td>
        <td class="admin__users-num">${txUsed}</td>
        <td title="${escapeHtmlIsp(row.grant_until || '')}">${escapeHtmlIsp(ispFormatDateRelative(row.grant_until))}</td>
        <td title="${escapeHtmlIsp(row.activated_at || '')}">${escapeHtmlIsp(ispFormatDateRelative(row.activated_at))}</td>
        <td title="${escapeHtmlIsp(row.lemon_status || '')}">${escapeHtmlIsp(row.lemon_status || 'â€”')}</td>
      </tr>`
    })
    .join('')
}

function ispGiftRevokeButtonHtml(r) {
  if (!r?.id) return ''
  const isActive = r.grant_until == null || Date.parse(r.grant_until) > Date.now()
  if (!isActive && r.grant_until) return ''
  return `<button type="button" class="admin__btn admin__btn--outline admin__btn--sm isp-gift-revoke" data-redemption-id="${escapeHtmlIsp(r.id)}" data-device-id="${escapeHtmlIsp(r.device_id || '')}">Revoke</button>`
}

function ispRenderGifts(rows) {
  const body = document.getElementById('isp-gifts-body')
  if (!body) return
  ispGiftCache = Array.isArray(rows) ? rows : []
  body.innerHTML = ispGiftCache
    .map((row) => {
      const deviceRedemptions = Array.isArray(row.isp_gift_device_redemptions)
        ? row.isp_gift_device_redemptions
        : []
      const redemptionCount = deviceRedemptions.length
      const used = Number(row.redemption_count) || redemptionCount
      const kind = row.kind === 'lifetime' ? 'lifetime' : row.kind === 'months' ? 'months' : 'days'
      const days = Number(row.duration_days) || 0
      const max = Number(row.max_redemptions) || 1
      const name = ispNormalizeGiftName(row.code)
      const expiration = ispGiftExpirationDisplay(kind, days)
      const redeemedLabels = deviceRedemptions
        .map((r) => {
          const d = String(r.device_id || '')
          return d.length > 12 ? `${d.slice(0, 8)}â€¦` : d || 'â€”'
        })
        .filter(Boolean)
      const emailsCell =
        redemptionCount > 0
          ? `<button type="button" class="yt-gift-emails-btn isp-gift-emails-btn" data-gift-id="${escapeHtmlIsp(row.id || '')}" title="View redemptions">${escapeHtmlIsp(redeemedLabels.join(', ') || `${redemptionCount} redemption(s)`)}</button>`
          : 'â€”'
      const revokeBtns = deviceRedemptions
        .map((r) => ispGiftRevokeButtonHtml(r))
        .filter(Boolean)
      return `<tr data-gift-id="${escapeHtmlIsp(row.id || '')}">
        <td>
          <div class="yt-gift-code-wrap">
            <input type="text" class="admin__users-search yt-gift-code-input isp-gift-code-input" value="${escapeHtmlIsp(name)}" spellcheck="false" autocomplete="off" />
            <button type="button" class="admin__btn admin__btn--outline admin__btn--sm yt-gift-copy isp-gift-copy" title="Copy ${escapeHtmlIsp(name)}" aria-label="Copy ${escapeHtmlIsp(name)}">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>
            </button>
          </div>
        </td>
        <td>
          <select class="admin__select yt-gift-kind isp-gift-kind-input">
            <option value="days"${kind === 'days' ? ' selected' : ''}>Days</option>
            <option value="months"${kind === 'months' ? ' selected' : ''}>Months</option>
            <option value="lifetime"${kind === 'lifetime' ? ' selected' : ''}>Lifetime</option>
          </select>
        </td>
        <td><input type="number" class="admin__users-search isp-gift-days-input" min="1" value="${days}" ${kind === 'lifetime' ? 'disabled' : ''} /></td>
        <td><input type="number" class="admin__users-search isp-gift-max-input" min="${Math.max(1, used)}" value="${max}" /></td>
        <td>${used}</td>
        <td><input type="text" class="admin__users-search isp-gift-note-input" value="${escapeHtmlIsp(row.note || '')}" /></td>
        <td title="${escapeHtmlIsp(row.created_at || '')}">${escapeHtmlIsp(ispFormatDate(row.created_at))}</td>
        <td title="${escapeHtmlIsp(expiration.title)}">${escapeHtmlIsp(expiration.text)}</td>
        <td>${emailsCell}</td>
        <td>${revokeBtns.length ? `<div class="yt-gift-revoke-list">${revokeBtns.join('')}</div>` : 'â€”'}</td>
        <td><button type="button" class="admin__btn admin__btn--outline admin__btn--sm isp-gift-save">Save</button></td>
        <td><button type="button" class="admin__btn admin__btn--outline admin__btn--sm isp-gift-delete" aria-label="Delete ${escapeHtmlIsp(name)}"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v10h-2V9zm4 0h2v10h-2V9zM7 9h2v10H7V9z"/></svg></button></td>
      </tr>`
    })
    .join('')
}

function ispCloseGiftRedemptionsModal() {
  const modal = document.getElementById('isp-gift-redemptions-modal')
  ispGiftModalId = null
  if (modal) modal.hidden = true
}

function ispOpenGiftRedemptionsModal(giftId) {
  const giftRow = ispGiftCache.find((r) => String(r.id) === String(giftId))
  const modal = document.getElementById('isp-gift-redemptions-modal')
  const title = document.getElementById('isp-gift-redemptions-title')
  const body = document.getElementById('isp-gift-redemptions-body')
  if (!modal || !title || !body || !giftRow) return
  ispGiftModalId = giftId
  const code = ispNormalizeGiftName(giftRow.code)
  title.textContent = `${code} â€” redemptions`
  const deviceRows = (Array.isArray(giftRow.isp_gift_device_redemptions)
    ? giftRow.isp_gift_device_redemptions
    : []
  ).map((r) => {
    const active = r.grant_until == null || Date.parse(r.grant_until) > Date.now()
    return `<tr data-redemption-id="${escapeHtmlIsp(r.id || '')}">
      <td title="${escapeHtmlIsp(r.device_id || '')}">${escapeHtmlIsp(r.device_id || 'â€”')}</td>
      <td>Device</td>
      <td>${escapeHtmlIsp(ispFormatDate(r.redeemed_at))}</td>
      <td>${active && !r.grant_until ? 'Lifetime' : escapeHtmlIsp(ispFormatDate(r.grant_until))}</td>
      <td>${active ? 'Active' : 'Expired'}</td>
      <td>${ispGiftRevokeButtonHtml(r) || 'â€”'}</td>
    </tr>`
  })
  body.innerHTML = deviceRows.length
    ? `<div class="admin__users-table-wrap">
        <table class="admin__users-table">
          <thead>
            <tr>
              <th>device</th>
              <th>type</th>
              <th>redeemed</th>
              <th>grant until</th>
              <th>status</th>
              <th>revoke</th>
            </tr>
          </thead>
          <tbody>${deviceRows.join('')}</tbody>
        </table>
      </div>`
    : '<p class="admin__status admin__status--empty">No redemptions yet.</p>'
  modal.hidden = false
}

async function ispRevokeGiftRedemption(redemptionId, deviceId) {
  await ispFetchJson(
    `${ispRest('isp_gift_device_redemptions')}?id=eq.${encodeURIComponent(redemptionId)}`,
    { method: 'DELETE', headers: ispHeaders() },
  )
}

async function ispHandleGiftRevokeClick(btn) {
  const redemptionId = btn.dataset.redemptionId
  const deviceId = btn.dataset.deviceId
  if (!redemptionId) return
  if (!window.confirm('Revoke this redemption? The device will lose gift Pro access.')) return
  btn.disabled = true
  try {
    await ispRevokeGiftRedemption(redemptionId, deviceId)
    ispToast('Redemption revoked.', 'success')
    await ispRefreshGifts()
    if (ispGiftModalId && !document.getElementById('isp-gift-redemptions-modal')?.hidden) {
      ispOpenGiftRedemptionsModal(ispGiftModalId)
    }
  } catch (err) {
    ispToast(err instanceof Error ? err.message : String(err), 'error')
  } finally {
    btn.disabled = false
  }
}

async function ispRefresh(opts = {}) {
  if (!ispAnonKey()) {
    ispToast('Missing Supabase anon key.', 'error')
    return
  }
  if (ispRefreshInFlight) return
  ispRefreshInFlight = true
  const statusEl = document.getElementById('isp-users-status')
  const refreshBtn = document.getElementById('isp-users-refresh')
  if (refreshBtn) refreshBtn.disabled = true
  try {
    if (statusEl) {
      statusEl.hidden = false
      statusEl.textContent = 'Loading license grantsâ€¦'
    }
    const users = await ispLoadUsers()
    ispRenderUsers(Array.isArray(users) ? users : [])
    if (statusEl) {
      statusEl.hidden = true
      statusEl.textContent = ''
    }
    if (opts.toast) ispToast('Users refreshed.', 'success')
  } catch (err) {
    if (statusEl) {
      statusEl.hidden = true
      statusEl.textContent = ''
    }
    const msg = err instanceof Error ? err.message : String(err)
    ispToast(
      msg +
        (/relation|table/i.test(msg)
          ? ' Run scripts/isp-schema.sql then admin/isp-gift-admin-schema.sql in Supabase.'
          : ''),
      'error',
    )
  } finally {
    ispRefreshInFlight = false
    if (refreshBtn) refreshBtn.disabled = false
  }
}

async function ispRefreshGifts() {
  if (!ispAnonKey()) {
    ispToast('Missing Supabase anon key.', 'error')
    return
  }
  try {
    const gifts = await ispLoadGifts()
    ispRenderGifts(Array.isArray(gifts) ? gifts : [])
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    ispToast(
      msg +
        (/relation|table/i.test(msg)
          ? ' Run scripts/isp-schema.sql then admin/isp-gift-admin-schema.sql in Supabase.'
          : ''),
      'error',
    )
  }
}

async function ispSaveGift(id, payload) {
  await ispFetchJson(`${ispRest('isp_gift_codes')}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: ispHeaders(),
    body: JSON.stringify(payload),
  })
}

async function ispDeleteGift(id) {
  await ispFetchJson(`${ispRest('isp_gift_codes')}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: ispHeaders(),
  })
}

async function ispCreateGift(event) {
  event.preventDefault()
  const kind = String(document.getElementById('isp-gift-kind')?.value || 'days')
  const days = Number(document.getElementById('isp-gift-days')?.value || 60)
  const max = Number(document.getElementById('isp-gift-max')?.value || 1)
  const note = String(document.getElementById('isp-gift-note')?.value || '').trim()
  const nameInput = document.getElementById('isp-gift-name')
  const code = ispNormalizeGiftName(nameInput?.value) || ispGenerateCode()
  if (nameInput) nameInput.value = code
  if (ispGiftNameTaken(code)) {
    ispToast('That gift name is already in use.', 'error')
    nameInput?.focus()
    nameInput?.select()
    return
  }
  try {
    await ispFetchJson(ispRest('isp_gift_codes'), {
      method: 'POST',
      headers: ispHeaders(),
      body: JSON.stringify({
        code,
        kind,
        duration_days: kind === 'lifetime' ? 0 : days,
        max_redemptions: Math.max(1, max),
        requires_login: false,
        note: note || null,
      }),
    })
    ispToast(`Created ${code}`, 'success')
    ispFillGiftName()
    await ispRefreshGifts()
  } catch (err) {
    ispToast(err instanceof Error ? err.message : String(err), 'error')
  }
}

function ispInit() {
  if (ispInitDone) return
  ispInitDone = true

  document.getElementById('isp-gifts-refresh')?.addEventListener('click', () => {
    void ispRefreshGifts().then(() => ispToast('Gift codes refreshed.', 'success'))
  })

  document.getElementById('isp-gifts-form')?.addEventListener('submit', ispCreateGift)
  document.getElementById('isp-gift-kind')?.addEventListener('change', ispUpdateGiftExpirationPreview)
  document.getElementById('isp-gift-days')?.addEventListener('input', ispUpdateGiftExpirationPreview)
  document.getElementById('isp-gift-name')?.addEventListener('blur', (event) => {
    const input = event.target
    const normalized = ispNormalizeGiftName(input.value)
    if (normalized) input.value = normalized
  })
  ispFillGiftName()
  ispUpdateGiftExpirationPreview()

  document.getElementById('isp-gifts-body')?.addEventListener('change', (event) => {
    const kindSel = event.target.closest('.isp-gift-kind-input')
    if (!kindSel) return
    const tr = kindSel.closest('tr')
    const daysInput = tr?.querySelector('.isp-gift-days-input')
    if (daysInput) daysInput.disabled = kindSel.value === 'lifetime'
  })
  document.getElementById('isp-gifts-body')?.addEventListener(
    'blur',
    (event) => {
      const input = event.target.closest('.isp-gift-code-input')
      if (!input) return
      const normalized = ispNormalizeGiftName(input.value)
      if (normalized) input.value = normalized
    },
    true,
  )
  document.getElementById('isp-gifts-body')?.addEventListener('click', (event) => {
    const revokeBtn = event.target.closest('.isp-gift-revoke')
    if (revokeBtn) {
      void ispHandleGiftRevokeClick(revokeBtn)
      return
    }
    const emailsBtn = event.target.closest('.isp-gift-emails-btn')
    if (emailsBtn) {
      const giftId = emailsBtn.dataset.giftId
      if (giftId) ispOpenGiftRedemptionsModal(giftId)
      return
    }
    const copyBtn = event.target.closest('.isp-gift-copy')
    if (copyBtn) {
      const tr = copyBtn.closest('[data-gift-id]')
      const code = ispNormalizeGiftName(tr?.querySelector('.isp-gift-code-input')?.value)
      if (!code) return
      void ispCopyText(code)
        .then(() => ispToast(`Copied ${code}`, 'success'))
        .catch((err) => ispToast(err instanceof Error ? err.message : 'Copy failed', 'error'))
      return
    }
    const saveBtn = event.target.closest('.isp-gift-save')
    const deleteBtn = event.target.closest('.isp-gift-delete')
    const tr = event.target.closest('tr')
    const id = tr?.dataset.giftId
    if (!tr || !id) return
    if (saveBtn) {
      const nameInput = tr.querySelector('.isp-gift-code-input')
      const code = ispNormalizeGiftName(nameInput?.value)
      if (!code) {
        ispToast('Gift name cannot be empty.', 'error')
        nameInput?.focus()
        return
      }
      if (ispGiftNameTaken(code, id)) {
        ispToast('That gift name is already in use.', 'error')
        nameInput?.focus()
        return
      }
      if (nameInput) nameInput.value = code
      const kind = String(tr.querySelector('.isp-gift-kind-input')?.value || 'days')
      const days = Number(tr.querySelector('.isp-gift-days-input')?.value || 0)
      const max = Number(tr.querySelector('.isp-gift-max-input')?.value || 1)
      const note = String(tr.querySelector('.isp-gift-note-input')?.value || '').trim()
      saveBtn.disabled = true
      void ispSaveGift(id, {
        code,
        kind,
        duration_days: kind === 'lifetime' ? 0 : Math.max(1, days),
        max_redemptions: Math.max(1, max),
        note: note || null,
      })
        .then(() => {
          ispToast('Gift code saved.', 'success')
          return ispRefreshGifts()
        })
        .catch((err) => ispToast(err instanceof Error ? err.message : String(err), 'error'))
        .finally(() => {
          saveBtn.disabled = false
        })
      return
    }
    if (deleteBtn) {
      if (!window.confirm('Delete this gift code? This cannot be undone.')) return
      deleteBtn.disabled = true
      void ispDeleteGift(id)
        .then(() => {
          ispToast('Gift code deleted.', 'success')
          return ispRefreshGifts()
        })
        .catch((err) => ispToast(err instanceof Error ? err.message : String(err), 'error'))
        .finally(() => {
          deleteBtn.disabled = false
        })
    }
  })

  document
    .getElementById('isp-gift-redemptions-modal-backdrop')
    ?.addEventListener('click', ispCloseGiftRedemptionsModal)
  document
    .getElementById('isp-gift-redemptions-modal-close')
    ?.addEventListener('click', ispCloseGiftRedemptionsModal)
  document.getElementById('isp-gift-redemptions-body')?.addEventListener('click', (event) => {
    const btn = event.target.closest('.isp-gift-revoke')
    if (!btn) return
    void ispHandleGiftRevokeClick(btn)
  })
}

function ispUpdateSupabaseLabel() {
  const el = document.getElementById('isp-supabase-url-label')
  if (el) {
    el.textContent = ispSupabaseUrl() || 'Supabase: not configured'
  }
}

window.IspAdminAccounts = {
  render: ispRefreshGifts,
  renderGifts: ispRefreshGifts,
  init: ispInit,
  refresh: ispRefreshGifts,
  updateSupabaseLabel: ispUpdateSupabaseLabel,
}

document.addEventListener('DOMContentLoaded', ispInit)
if (document.readyState !== 'loading') ispInit()

