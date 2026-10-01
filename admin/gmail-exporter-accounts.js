/* global GE_SUPABASE_URL, GE_SUPABASE_ANON_KEY, Toastify */

let geInitDone = false
let geUserCache = []
let geGiftCache = []
let geGiftModalId = null
let geSortKey = 'activated'
let geSortDir = 'desc'
let geRefreshInFlight = false

function geSupabaseUrl() {
  return String(window.GE_SUPABASE_URL || '').replace(/\/+$/, '').trim()
}

function geAnonKey() {
  return String(window.GE_SUPABASE_ANON_KEY || '').trim()
}

function geUpdateSupabaseUrlLabel() {
  const el = document.getElementById('ge-supabase-url-label')
  if (!el) return
  const url = geSupabaseUrl()
  const key = geAnonKey()
  if (!url) {
    el.textContent = 'Supabase: not configured (set ge-admin-config.js)'
    el.classList.add('admin__panel-supabase-url--warn')
    return
  }
  el.classList.remove('admin__panel-supabase-url--warn')
  el.textContent = key ? url : `${url} (missing anon key in ge-admin-config.js)`
  if (!key) el.classList.add('admin__panel-supabase-url--warn')
}

function geHeaders() {
  const key = geAnonKey()
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }
}

function geRest(path) {
  return `${geSupabaseUrl()}/rest/v1/${path}`
}

async function geFetchJson(url, options = {}) {
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

function geToast(message, type) {
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

function escapeHtmlIdme(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function geGenerateCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(4))
  const hex = [...bytes].map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join('')
  return `GE-${hex.slice(0, 4)}-${hex.slice(4, 8)}`
}

function geNormalizeGiftName(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
}

function geGiftNameTaken(name, exceptId) {
  const normalized = geNormalizeGiftName(name)
  return geGiftCache.some(
    (row) =>
      geNormalizeGiftName(row.code) === normalized &&
      String(row.id) !== String(exceptId || ''),
  )
}

function geFillGiftName() {
  const input = document.getElementById('ge-gift-name')
  if (input && !geNormalizeGiftName(input.value)) input.value = geGenerateCode()
}

function geFormatDate(value) {
  if (!value) return '—'
  const ms = Date.parse(value)
  if (!Number.isFinite(ms)) return '—'
  return new Date(ms).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function geFormatDateRelative(value) {
  if (!value) return '—'
  const ms = Date.parse(value)
  if (!Number.isFinite(ms)) return '—'
  const diff = Date.now() - ms
  const abs = Math.abs(diff)
  const mins = Math.round(abs / 60000)
  if (mins < 60) return diff >= 0 ? `${mins}m ago` : `in ${mins}m`
  const hours = Math.round(mins / 60)
  if (hours < 48) return diff >= 0 ? `${hours}h ago` : `in ${hours}h`
  const days = Math.round(hours / 24)
  if (days < 60) return diff >= 0 ? `${days}d ago` : `in ${days}d`
  return geFormatDate(value)
}

function geIsGrantActive(row) {
  if (!row) return false
  if (row.is_lifetime) return true
  if (!row.grant_until) return false
  return Date.parse(row.grant_until) > Date.now()
}

function geGiftExpirationDisplay(kind, days) {
  if (kind === 'lifetime') return { text: 'Lifetime', title: 'Lifetime' }
  const n = Math.max(1, Number(days) || 0)
  const unit = kind === 'months' ? 'month' : 'day'
  const text = `${n} ${unit}${n === 1 ? '' : 's'} from redeem`
  return { text, title: text }
}

function geUpdateGiftExpirationPreview() {
  const kind = String(document.getElementById('ge-gift-kind')?.value || 'days')
  const days = Number(document.getElementById('ge-gift-days')?.value || 60)
  const label = document.getElementById('ge-gift-duration-label')
  const preview = document.getElementById('ge-gift-expiration-preview')
  const daysInput = document.getElementById('ge-gift-days')
  if (label) label.textContent = kind === 'months' ? 'Months' : kind === 'lifetime' ? '—' : 'Days'
  if (daysInput) daysInput.disabled = kind === 'lifetime'
  if (preview) {
    const exp = geGiftExpirationDisplay(kind, days)
    preview.textContent = kind === 'lifetime' ? 'Expiration: lifetime' : `Expiration: ${exp.text}`
  }
}

async function geCopyText(text) {
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

async function geLoadUsers() {
  const grantsUrl = `${geRest('ge_license_device_grants')}?select=*&order=activated_at.desc`
  const usageUrl = `${geRest('ge_export_usage')}?select=*&order=updated_at.desc`
  const [grants, usage] = await Promise.all([
    geFetchJson(grantsUrl, { headers: geHeaders() }),
    geFetchJson(usageUrl, { headers: geHeaders() }).catch(() => []),
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

async function geLoadGifts() {
  const url = `${geRest('ge_gift_codes')}?select=*,ge_gift_device_redemptions(id,device_id,redeemed_at,grant_until)&order=created_at.desc`
  return geFetchJson(url, { headers: geHeaders() })
}

function geSortedUsers(rows) {
  const list = [...rows]
  const dir = geSortDir === 'asc' ? 1 : -1
  list.sort((a, b) => {
    const activeA = geIsGrantActive(a) ? 1 : 0
    const activeB = geIsGrantActive(b) ? 1 : 0
    let av
    let bv
    switch (geSortKey) {
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

function geSyncSortHeaders() {
  document.querySelectorAll('#ge-users-table-wrap .admin__users-sort').forEach((btn) => {
    const key = btn.dataset.sort
    const active = key === geSortKey
    btn.classList.toggle('admin__users-sort--active', active)
    btn.dataset.dir = active ? geSortDir : ''
  })
}

function geRenderUsers(rows) {
  const body = document.getElementById('ge-users-body')
  const wrap = document.getElementById('ge-users-table-wrap')
  const empty = document.getElementById('ge-users-empty')
  const toolbar = document.getElementById('ge-users-toolbar')
  const kpis = document.getElementById('ge-users-kpis')
  if (!body) return

  geUserCache = Array.isArray(rows) ? rows : []
  const q = String(document.getElementById('ge-users-search')?.value || '')
    .trim()
    .toLowerCase()
  const filtered = geUserCache.filter((row) => {
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
  const active = filtered.filter((r) => geIsGrantActive(r)).length
  const lifetime = filtered.filter((r) => r.is_lifetime).length
  const elTotal = document.getElementById('kpi-ge-users-total')
  const elActive = document.getElementById('kpi-ge-users-active')
  const elLifetime = document.getElementById('kpi-ge-users-lifetime')
  if (elTotal) elTotal.textContent = String(total)
  if (elActive) elActive.textContent = String(active)
  if (elLifetime) elLifetime.textContent = String(lifetime)
  if (kpis) kpis.hidden = false
  if (toolbar) toolbar.hidden = false

  if (!filtered.length) {
    if (wrap) wrap.hidden = true
    if (empty) {
      empty.hidden = false
      empty.textContent = geUserCache.length
        ? 'No users match this filter.'
        : 'No license grants yet. They appear after Lemon purchase + activate.'
    }
    body.innerHTML = ''
    return
  }

  if (empty) empty.hidden = true
  if (wrap) wrap.hidden = false
  geSyncSortHeaders()
  body.innerHTML = geSortedUsers(filtered)
    .map((row) => {
      const activeGrant = geIsGrantActive(row)
      const exportsUsed = Number(row._usage?.export_count || 0)
      const txUsed = Number(row._usage?.transcription_count || 0)
      const device = String(row.device_id || '')
      const shortDevice = device.length > 14 ? `${device.slice(0, 8)}…${device.slice(-4)}` : device
      return `<tr data-device-id="${escapeHtmlIdme(device)}">
        <td title="${escapeHtmlIdme(device)}">${escapeHtmlIdme(shortDevice || '—')}</td>
        <td>${escapeHtmlIdme(row.customer_email || '—')}</td>
        <td><span class="admin__users-pill ${activeGrant ? 'admin__users-pill--yes' : 'admin__users-pill--no'}">${activeGrant ? 'active' : 'expired'}</span></td>
        <td><span class="admin__users-pill ${row.is_lifetime ? 'admin__users-pill--yes' : 'admin__users-pill--no'}">${row.is_lifetime ? 'yes' : 'no'}</span></td>
        <td class="admin__users-num" title="period ${escapeHtmlIdme(row._usage?.period_key || '')}">${exportsUsed}</td>
        <td class="admin__users-num">${txUsed}</td>
        <td title="${escapeHtmlIdme(row.grant_until || '')}">${escapeHtmlIdme(geFormatDateRelative(row.grant_until))}</td>
        <td title="${escapeHtmlIdme(row.activated_at || '')}">${escapeHtmlIdme(geFormatDateRelative(row.activated_at))}</td>
        <td title="${escapeHtmlIdme(row.lemon_status || '')}">${escapeHtmlIdme(row.lemon_status || '—')}</td>
      </tr>`
    })
    .join('')
}

function geGiftRevokeButtonHtml(r) {
  if (!r?.id) return ''
  const isActive = r.grant_until == null || Date.parse(r.grant_until) > Date.now()
  if (!isActive && r.grant_until) return ''
  return `<button type="button" class="admin__btn admin__btn--outline admin__btn--sm ge-gift-revoke" data-redemption-id="${escapeHtmlIdme(r.id)}" data-device-id="${escapeHtmlIdme(r.device_id || '')}">Revoke</button>`
}

function geRenderGifts(rows) {
  const body = document.getElementById('ge-gifts-body')
  if (!body) return
  geGiftCache = Array.isArray(rows) ? rows : []
  body.innerHTML = geGiftCache
    .map((row) => {
      const deviceRedemptions = Array.isArray(row.ge_gift_device_redemptions)
        ? row.ge_gift_device_redemptions
        : []
      const redemptionCount = deviceRedemptions.length
      const used = Number(row.redemption_count) || redemptionCount
      const kind = row.kind === 'lifetime' ? 'lifetime' : row.kind === 'months' ? 'months' : 'days'
      const days = Number(row.duration_days) || 0
      const max = Number(row.max_redemptions) || 1
      const name = geNormalizeGiftName(row.code)
      const expiration = geGiftExpirationDisplay(kind, days)
      const redeemedLabels = deviceRedemptions
        .map((r) => {
          const d = String(r.device_id || '')
          return d.length > 12 ? `${d.slice(0, 8)}…` : d || '—'
        })
        .filter(Boolean)
      const emailsCell =
        redemptionCount > 0
          ? `<button type="button" class="yt-gift-emails-btn ge-gift-emails-btn" data-gift-id="${escapeHtmlIdme(row.id || '')}" title="View redemptions">${escapeHtmlIdme(redeemedLabels.join(', ') || `${redemptionCount} redemption(s)`)}</button>`
          : '—'
      const revokeBtns = deviceRedemptions
        .map((r) => geGiftRevokeButtonHtml(r))
        .filter(Boolean)
      return `<tr data-gift-id="${escapeHtmlIdme(row.id || '')}">
        <td>
          <div class="yt-gift-code-wrap">
            <input type="text" class="admin__users-search yt-gift-code-input ge-gift-code-input" value="${escapeHtmlIdme(name)}" spellcheck="false" autocomplete="off" />
            <button type="button" class="admin__btn admin__btn--outline admin__btn--sm yt-gift-copy ge-gift-copy" title="Copy ${escapeHtmlIdme(name)}" aria-label="Copy ${escapeHtmlIdme(name)}">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>
            </button>
          </div>
        </td>
        <td>
          <select class="admin__select yt-gift-kind ge-gift-kind-input">
            <option value="days"${kind === 'days' ? ' selected' : ''}>Days</option>
            <option value="months"${kind === 'months' ? ' selected' : ''}>Months</option>
            <option value="lifetime"${kind === 'lifetime' ? ' selected' : ''}>Lifetime</option>
          </select>
        </td>
        <td><input type="number" class="admin__users-search ge-gift-days-input" min="1" value="${days}" ${kind === 'lifetime' ? 'disabled' : ''} /></td>
        <td><input type="number" class="admin__users-search ge-gift-max-input" min="${Math.max(1, used)}" value="${max}" /></td>
        <td>${used}</td>
        <td><input type="text" class="admin__users-search ge-gift-note-input" value="${escapeHtmlIdme(row.note || '')}" /></td>
        <td title="${escapeHtmlIdme(row.created_at || '')}">${escapeHtmlIdme(geFormatDate(row.created_at))}</td>
        <td title="${escapeHtmlIdme(expiration.title)}">${escapeHtmlIdme(expiration.text)}</td>
        <td>${emailsCell}</td>
        <td>${revokeBtns.length ? `<div class="yt-gift-revoke-list">${revokeBtns.join('')}</div>` : '—'}</td>
        <td><button type="button" class="admin__btn admin__btn--outline admin__btn--sm ge-gift-save">Save</button></td>
        <td><button type="button" class="admin__btn admin__btn--outline admin__btn--sm ge-gift-delete" aria-label="Delete ${escapeHtmlIdme(name)}"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v10h-2V9zm4 0h2v10h-2V9zM7 9h2v10H7V9z"/></svg></button></td>
      </tr>`
    })
    .join('')
}

function geCloseGiftRedemptionsModal() {
  const modal = document.getElementById('ge-gift-redemptions-modal')
  geGiftModalId = null
  if (modal) modal.hidden = true
}

function geOpenGiftRedemptionsModal(giftId) {
  const giftRow = geGiftCache.find((r) => String(r.id) === String(giftId))
  const modal = document.getElementById('ge-gift-redemptions-modal')
  const title = document.getElementById('ge-gift-redemptions-title')
  const body = document.getElementById('ge-gift-redemptions-body')
  if (!modal || !title || !body || !giftRow) return
  geGiftModalId = giftId
  const code = geNormalizeGiftName(giftRow.code)
  title.textContent = `${code} — redemptions`
  const deviceRows = (Array.isArray(giftRow.ge_gift_device_redemptions)
    ? giftRow.ge_gift_device_redemptions
    : []
  ).map((r) => {
    const active = r.grant_until == null || Date.parse(r.grant_until) > Date.now()
    return `<tr data-redemption-id="${escapeHtmlIdme(r.id || '')}">
      <td title="${escapeHtmlIdme(r.device_id || '')}">${escapeHtmlIdme(r.device_id || '—')}</td>
      <td>Device</td>
      <td>${escapeHtmlIdme(geFormatDate(r.redeemed_at))}</td>
      <td>${active && !r.grant_until ? 'Lifetime' : escapeHtmlIdme(geFormatDate(r.grant_until))}</td>
      <td>${active ? 'Active' : 'Expired'}</td>
      <td>${geGiftRevokeButtonHtml(r) || '—'}</td>
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

async function geRevokeGiftRedemption(redemptionId, deviceId) {
  await geFetchJson(
    `${geRest('ge_gift_device_redemptions')}?id=eq.${encodeURIComponent(redemptionId)}`,
    { method: 'DELETE', headers: geHeaders() },
  )
  // Best-effort: clear matching device grants that look like gift (lemon_license_id starts with gift:)
  if (deviceId) {
    try {
      await geFetchJson(
        `${geRest('ge_license_device_grants')}?device_id=eq.${encodeURIComponent(deviceId)}&lemon_license_id=like.gift:*`,
        { method: 'DELETE', headers: geHeaders() },
      )
    } catch {
      /* optional */
    }
  }
  // Refresh gift rows so redemption_count can be reconciled from embed length on next save
}

async function geHandleGiftRevokeClick(btn) {
  const redemptionId = btn.dataset.redemptionId
  const deviceId = btn.dataset.deviceId
  if (!redemptionId) return
  if (!window.confirm('Revoke this redemption? The device will lose gift Pro access.')) return
  btn.disabled = true
  try {
    await geRevokeGiftRedemption(redemptionId, deviceId)
    geToast('Redemption revoked.', 'success')
    await geRefreshGifts()
    if (geGiftModalId && !document.getElementById('ge-gift-redemptions-modal')?.hidden) {
      geOpenGiftRedemptionsModal(geGiftModalId)
    }
  } catch (err) {
    geToast(err instanceof Error ? err.message : String(err), 'error')
  } finally {
    btn.disabled = false
  }
}

async function geRefresh(opts = {}) {
  if (!geAnonKey()) {
    geToast('Missing Supabase anon key.', 'error')
    return
  }
  if (geRefreshInFlight) return
  geRefreshInFlight = true
  const statusEl = document.getElementById('ge-users-status')
  const refreshBtn = document.getElementById('ge-users-refresh')
  if (refreshBtn) refreshBtn.disabled = true
  try {
    if (statusEl) {
      statusEl.hidden = false
      statusEl.textContent = 'Loading license grants…'
    }
    const users = await geLoadUsers()
    geRenderUsers(Array.isArray(users) ? users : [])
    if (statusEl) {
      statusEl.hidden = true
      statusEl.textContent = ''
    }
    if (opts.toast) geToast('Users refreshed.', 'success')
  } catch (err) {
    if (statusEl) {
      statusEl.hidden = true
      statusEl.textContent = ''
    }
    const msg = err instanceof Error ? err.message : String(err)
    geToast(
      msg +
        (/relation|table/i.test(msg)
          ? ' Run admin/ge-schema.sql in the Supabase SQL editor.'
          : ''),
      'error',
    )
  } finally {
    geRefreshInFlight = false
    if (refreshBtn) refreshBtn.disabled = false
  }
}

async function geRefreshGifts() {
  if (!geAnonKey()) {
    geToast('Missing Supabase anon key.', 'error')
    return
  }
  try {
    const gifts = await geLoadGifts()
    geRenderGifts(Array.isArray(gifts) ? gifts : [])
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    geToast(
      msg +
        (/relation|table/i.test(msg)
          ? ' Run admin/ge-schema.sql in the Supabase SQL editor.'
          : ''),
      'error',
    )
  }
}

async function geSaveGift(id, payload) {
  await geFetchJson(`${geRest('ge_gift_codes')}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: geHeaders(),
    body: JSON.stringify({ ...payload, updated_at: new Date().toISOString() }),
  })
}

async function geDeleteGift(id) {
  await geFetchJson(`${geRest('ge_gift_codes')}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: geHeaders(),
  })
}

async function geCreateGift(event) {
  event.preventDefault()
  const kind = String(document.getElementById('ge-gift-kind')?.value || 'days')
  const days = Number(document.getElementById('ge-gift-days')?.value || 60)
  const max = Number(document.getElementById('ge-gift-max')?.value || 1)
  const note = String(document.getElementById('ge-gift-note')?.value || '').trim()
  const nameInput = document.getElementById('ge-gift-name')
  const code = geNormalizeGiftName(nameInput?.value) || geGenerateCode()
  if (nameInput) nameInput.value = code
  if (geGiftNameTaken(code)) {
    geToast('That gift name is already in use.', 'error')
    nameInput?.focus()
    nameInput?.select()
    return
  }
  try {
    await geFetchJson(geRest('ge_gift_codes'), {
      method: 'POST',
      headers: geHeaders(),
      body: JSON.stringify({
        code,
        kind,
        duration_days: kind === 'lifetime' ? 0 : days,
        max_redemptions: Math.max(1, max),
        requires_login: false,
        note: note || null,
      }),
    })
    geToast(`Created ${code}`, 'success')
    geFillGiftName()
    await geRefreshGifts()
  } catch (err) {
    geToast(err instanceof Error ? err.message : String(err), 'error')
  }
}

function geInit() {
  if (geInitDone) return
  geInitDone = true
  geUpdateSupabaseUrlLabel()

  document.getElementById('ge-users-search')?.addEventListener('input', () => {
    geRenderUsers(geUserCache)
  })
  document.getElementById('ge-users-refresh')?.addEventListener('click', () => {
    void geRefresh({ toast: true })
  })
  document.getElementById('ge-users-table-wrap')?.addEventListener('click', (event) => {
    const btn = event.target.closest('.admin__users-sort')
    if (!btn) return
    const key = btn.dataset.sort
    if (!key) return
    if (geSortKey === key) {
      geSortDir = geSortDir === 'asc' ? 'desc' : 'asc'
    } else {
      geSortKey = key
      geSortDir = key === 'email' || key === 'device' ? 'asc' : 'desc'
    }
    geRenderUsers(geUserCache)
  })

  document.getElementById('ge-gifts-form')?.addEventListener('submit', geCreateGift)
  document.getElementById('ge-gift-kind')?.addEventListener('change', geUpdateGiftExpirationPreview)
  document.getElementById('ge-gift-days')?.addEventListener('input', geUpdateGiftExpirationPreview)
  document.getElementById('ge-gift-name')?.addEventListener('blur', (event) => {
    const input = event.target
    const normalized = geNormalizeGiftName(input.value)
    if (normalized) input.value = normalized
  })
  geFillGiftName()
  geUpdateGiftExpirationPreview()

  document.getElementById('ge-gifts-body')?.addEventListener('change', (event) => {
    const kindSel = event.target.closest('.ge-gift-kind-input')
    if (!kindSel) return
    const tr = kindSel.closest('tr')
    const daysInput = tr?.querySelector('.ge-gift-days-input')
    if (daysInput) daysInput.disabled = kindSel.value === 'lifetime'
  })
  document.getElementById('ge-gifts-body')?.addEventListener(
    'blur',
    (event) => {
      const input = event.target.closest('.ge-gift-code-input')
      if (!input) return
      const normalized = geNormalizeGiftName(input.value)
      if (normalized) input.value = normalized
    },
    true,
  )
  document.getElementById('ge-gifts-body')?.addEventListener('click', (event) => {
    const revokeBtn = event.target.closest('.ge-gift-revoke')
    if (revokeBtn) {
      void geHandleGiftRevokeClick(revokeBtn)
      return
    }
    const emailsBtn = event.target.closest('.ge-gift-emails-btn')
    if (emailsBtn) {
      const giftId = emailsBtn.dataset.giftId
      if (giftId) geOpenGiftRedemptionsModal(giftId)
      return
    }
    const copyBtn = event.target.closest('.ge-gift-copy')
    if (copyBtn) {
      const tr = copyBtn.closest('[data-gift-id]')
      const code = geNormalizeGiftName(tr?.querySelector('.ge-gift-code-input')?.value)
      if (!code) return
      void geCopyText(code)
        .then(() => geToast(`Copied ${code}`, 'success'))
        .catch((err) => geToast(err instanceof Error ? err.message : 'Copy failed', 'error'))
      return
    }
    const saveBtn = event.target.closest('.ge-gift-save')
    const deleteBtn = event.target.closest('.ge-gift-delete')
    const tr = event.target.closest('tr')
    const id = tr?.dataset.giftId
    if (!tr || !id) return
    if (saveBtn) {
      const nameInput = tr.querySelector('.ge-gift-code-input')
      const code = geNormalizeGiftName(nameInput?.value)
      if (!code) {
        geToast('Gift name cannot be empty.', 'error')
        nameInput?.focus()
        return
      }
      if (geGiftNameTaken(code, id)) {
        geToast('That gift name is already in use.', 'error')
        nameInput?.focus()
        return
      }
      if (nameInput) nameInput.value = code
      const kind = String(tr.querySelector('.ge-gift-kind-input')?.value || 'days')
      const days = Number(tr.querySelector('.ge-gift-days-input')?.value || 0)
      const max = Number(tr.querySelector('.ge-gift-max-input')?.value || 1)
      const note = String(tr.querySelector('.ge-gift-note-input')?.value || '').trim()
      saveBtn.disabled = true
      void geSaveGift(id, {
        code,
        kind,
        duration_days: kind === 'lifetime' ? 0 : Math.max(1, days),
        max_redemptions: Math.max(1, max),
        note: note || null,
      })
        .then(() => {
          geToast('Gift code saved.', 'success')
          return geRefreshGifts()
        })
        .catch((err) => geToast(err instanceof Error ? err.message : String(err), 'error'))
        .finally(() => {
          saveBtn.disabled = false
        })
      return
    }
    if (deleteBtn) {
      if (!window.confirm('Delete this gift code? This cannot be undone.')) return
      deleteBtn.disabled = true
      void geDeleteGift(id)
        .then(() => {
          geToast('Gift code deleted.', 'success')
          return geRefreshGifts()
        })
        .catch((err) => geToast(err instanceof Error ? err.message : String(err), 'error'))
        .finally(() => {
          deleteBtn.disabled = false
        })
    }
  })

  document
    .getElementById('ge-gift-redemptions-modal-backdrop')
    ?.addEventListener('click', geCloseGiftRedemptionsModal)
  document
    .getElementById('ge-gift-redemptions-modal-close')
    ?.addEventListener('click', geCloseGiftRedemptionsModal)
  document.getElementById('ge-gift-redemptions-body')?.addEventListener('click', (event) => {
    const btn = event.target.closest('.ge-gift-revoke')
    if (!btn) return
    void geHandleGiftRevokeClick(btn)
  })
}

window.GeAdminAccounts = {
  render: geRefresh,
  renderGifts: geRefreshGifts,
  init: geInit,
  refresh: geRefresh,
  updateSupabaseLabel: geUpdateSupabaseUrlLabel,
}

document.addEventListener('DOMContentLoaded', geInit)
if (document.readyState !== 'loading') geInit()
