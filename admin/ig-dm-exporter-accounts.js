/* global SUPABASE_URL, SUPABASE_ANON_KEY, Toastify */

let idmeInitDone = false
let idmeUserCache = []
let idmeGiftCache = []
let idmeGiftModalId = null
let idmeSortKey = 'activated'
let idmeSortDir = 'desc'
let idmeRefreshInFlight = false

function idmeAnonKey() {
  return String(window.SUPABASE_ANON_KEY || '').trim()
}

function idmeHeaders() {
  const key = idmeAnonKey()
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }
}

function idmeRest(path) {
  return `${String(window.SUPABASE_URL || SUPABASE_URL || '').replace(/\/+$/, '')}/rest/v1/${path}`
}

async function idmeFetchJson(url, options = {}) {
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

function idmeToast(message, type) {
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

function idmeGenerateCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(4))
  const hex = [...bytes].map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join('')
  return `IDME-${hex.slice(0, 4)}-${hex.slice(4, 8)}`
}

function idmeNormalizeGiftName(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
}

function idmeGiftNameTaken(name, exceptId) {
  const normalized = idmeNormalizeGiftName(name)
  return idmeGiftCache.some(
    (row) =>
      idmeNormalizeGiftName(row.code) === normalized &&
      String(row.id) !== String(exceptId || ''),
  )
}

function idmeFillGiftName() {
  const input = document.getElementById('idme-gift-name')
  if (input && !idmeNormalizeGiftName(input.value)) input.value = idmeGenerateCode()
}

function idmeFormatDate(value) {
  if (!value) return '—'
  const ms = Date.parse(value)
  if (!Number.isFinite(ms)) return '—'
  return new Date(ms).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function idmeFormatDateRelative(value) {
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
  return idmeFormatDate(value)
}

function idmeIsGrantActive(row) {
  if (!row) return false
  if (row.is_lifetime) return true
  if (!row.grant_until) return false
  return Date.parse(row.grant_until) > Date.now()
}

function idmeGiftExpirationDisplay(kind, days) {
  if (kind === 'lifetime') return { text: 'Lifetime', title: 'Lifetime' }
  const n = Math.max(1, Number(days) || 0)
  const unit = kind === 'months' ? 'month' : 'day'
  const text = `${n} ${unit}${n === 1 ? '' : 's'} from redeem`
  return { text, title: text }
}

function idmeUpdateGiftExpirationPreview() {
  const kind = String(document.getElementById('idme-gift-kind')?.value || 'days')
  const days = Number(document.getElementById('idme-gift-days')?.value || 60)
  const label = document.getElementById('idme-gift-duration-label')
  const preview = document.getElementById('idme-gift-expiration-preview')
  const daysInput = document.getElementById('idme-gift-days')
  if (label) label.textContent = kind === 'months' ? 'Months' : kind === 'lifetime' ? '—' : 'Days'
  if (daysInput) daysInput.disabled = kind === 'lifetime'
  if (preview) {
    const exp = idmeGiftExpirationDisplay(kind, days)
    preview.textContent = kind === 'lifetime' ? 'Expiration: lifetime' : `Expiration: ${exp.text}`
  }
}

async function idmeCopyText(text) {
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

async function idmeLoadUsers() {
  const grantsUrl = `${idmeRest('idme_license_device_grants')}?select=*&order=activated_at.desc`
  const usageUrl = `${idmeRest('idme_export_usage')}?select=*&order=updated_at.desc`
  const [grants, usage] = await Promise.all([
    idmeFetchJson(grantsUrl, { headers: idmeHeaders() }),
    idmeFetchJson(usageUrl, { headers: idmeHeaders() }).catch(() => []),
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

async function idmeLoadGifts() {
  const url = `${idmeRest('idme_gift_codes')}?select=*,idme_gift_device_redemptions(id,device_id,redeemed_at,grant_until)&order=created_at.desc`
  return idmeFetchJson(url, { headers: idmeHeaders() })
}

function idmeSortedUsers(rows) {
  const list = [...rows]
  const dir = idmeSortDir === 'asc' ? 1 : -1
  list.sort((a, b) => {
    const activeA = idmeIsGrantActive(a) ? 1 : 0
    const activeB = idmeIsGrantActive(b) ? 1 : 0
    let av
    let bv
    switch (idmeSortKey) {
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

function idmeSyncSortHeaders() {
  document.querySelectorAll('#idme-users-table-wrap .admin__users-sort').forEach((btn) => {
    const key = btn.dataset.sort
    const active = key === idmeSortKey
    btn.classList.toggle('admin__users-sort--active', active)
    btn.dataset.dir = active ? idmeSortDir : ''
  })
}

function idmeRenderUsers(rows) {
  const body = document.getElementById('idme-users-body')
  const wrap = document.getElementById('idme-users-table-wrap')
  const empty = document.getElementById('idme-users-empty')
  const toolbar = document.getElementById('idme-users-toolbar')
  const kpis = document.getElementById('idme-users-kpis')
  if (!body) return

  idmeUserCache = Array.isArray(rows) ? rows : []
  const q = String(document.getElementById('idme-users-search')?.value || '')
    .trim()
    .toLowerCase()
  const filtered = idmeUserCache.filter((row) => {
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
  const active = filtered.filter((r) => idmeIsGrantActive(r)).length
  const lifetime = filtered.filter((r) => r.is_lifetime).length
  const elTotal = document.getElementById('kpi-idme-users-total')
  const elActive = document.getElementById('kpi-idme-users-active')
  const elLifetime = document.getElementById('kpi-idme-users-lifetime')
  if (elTotal) elTotal.textContent = String(total)
  if (elActive) elActive.textContent = String(active)
  if (elLifetime) elLifetime.textContent = String(lifetime)
  if (kpis) kpis.hidden = false
  if (toolbar) toolbar.hidden = false

  if (!filtered.length) {
    if (wrap) wrap.hidden = true
    if (empty) {
      empty.hidden = false
      empty.textContent = idmeUserCache.length
        ? 'No users match this filter.'
        : 'No license grants yet. They appear after Lemon purchase + activate.'
    }
    body.innerHTML = ''
    return
  }

  if (empty) empty.hidden = true
  if (wrap) wrap.hidden = false
  idmeSyncSortHeaders()
  body.innerHTML = idmeSortedUsers(filtered)
    .map((row) => {
      const activeGrant = idmeIsGrantActive(row)
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
        <td title="${escapeHtmlIdme(row.grant_until || '')}">${escapeHtmlIdme(idmeFormatDateRelative(row.grant_until))}</td>
        <td title="${escapeHtmlIdme(row.activated_at || '')}">${escapeHtmlIdme(idmeFormatDateRelative(row.activated_at))}</td>
        <td title="${escapeHtmlIdme(row.lemon_status || '')}">${escapeHtmlIdme(row.lemon_status || '—')}</td>
      </tr>`
    })
    .join('')
}

function idmeGiftRevokeButtonHtml(r) {
  if (!r?.id) return ''
  const isActive = r.grant_until == null || Date.parse(r.grant_until) > Date.now()
  if (!isActive && r.grant_until) return ''
  return `<button type="button" class="admin__btn admin__btn--outline admin__btn--sm idme-gift-revoke" data-redemption-id="${escapeHtmlIdme(r.id)}" data-device-id="${escapeHtmlIdme(r.device_id || '')}">Revoke</button>`
}

function idmeRenderGifts(rows) {
  const body = document.getElementById('idme-gifts-body')
  if (!body) return
  idmeGiftCache = Array.isArray(rows) ? rows : []
  body.innerHTML = idmeGiftCache
    .map((row) => {
      const deviceRedemptions = Array.isArray(row.idme_gift_device_redemptions)
        ? row.idme_gift_device_redemptions
        : []
      const redemptionCount = deviceRedemptions.length
      const used = Number(row.redemption_count) || redemptionCount
      const kind = row.kind === 'lifetime' ? 'lifetime' : row.kind === 'months' ? 'months' : 'days'
      const days = Number(row.duration_days) || 0
      const max = Number(row.max_redemptions) || 1
      const name = idmeNormalizeGiftName(row.code)
      const expiration = idmeGiftExpirationDisplay(kind, days)
      const redeemedLabels = deviceRedemptions
        .map((r) => {
          const d = String(r.device_id || '')
          return d.length > 12 ? `${d.slice(0, 8)}…` : d || '—'
        })
        .filter(Boolean)
      const emailsCell =
        redemptionCount > 0
          ? `<button type="button" class="yt-gift-emails-btn idme-gift-emails-btn" data-gift-id="${escapeHtmlIdme(row.id || '')}" title="View redemptions">${escapeHtmlIdme(redeemedLabels.join(', ') || `${redemptionCount} redemption(s)`)}</button>`
          : '—'
      const revokeBtns = deviceRedemptions
        .map((r) => idmeGiftRevokeButtonHtml(r))
        .filter(Boolean)
      return `<tr data-gift-id="${escapeHtmlIdme(row.id || '')}">
        <td>
          <div class="yt-gift-code-wrap">
            <input type="text" class="admin__users-search yt-gift-code-input idme-gift-code-input" value="${escapeHtmlIdme(name)}" spellcheck="false" autocomplete="off" />
            <button type="button" class="admin__btn admin__btn--outline admin__btn--sm yt-gift-copy idme-gift-copy" title="Copy ${escapeHtmlIdme(name)}" aria-label="Copy ${escapeHtmlIdme(name)}">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>
            </button>
          </div>
        </td>
        <td>
          <select class="admin__select yt-gift-kind idme-gift-kind-input">
            <option value="days"${kind === 'days' ? ' selected' : ''}>Days</option>
            <option value="months"${kind === 'months' ? ' selected' : ''}>Months</option>
            <option value="lifetime"${kind === 'lifetime' ? ' selected' : ''}>Lifetime</option>
          </select>
        </td>
        <td><input type="number" class="admin__users-search idme-gift-days-input" min="1" value="${days}" ${kind === 'lifetime' ? 'disabled' : ''} /></td>
        <td><input type="number" class="admin__users-search idme-gift-max-input" min="${Math.max(1, used)}" value="${max}" /></td>
        <td>${used}</td>
        <td><input type="text" class="admin__users-search idme-gift-note-input" value="${escapeHtmlIdme(row.note || '')}" /></td>
        <td title="${escapeHtmlIdme(row.created_at || '')}">${escapeHtmlIdme(idmeFormatDate(row.created_at))}</td>
        <td title="${escapeHtmlIdme(expiration.title)}">${escapeHtmlIdme(expiration.text)}</td>
        <td>${emailsCell}</td>
        <td>${revokeBtns.length ? `<div class="yt-gift-revoke-list">${revokeBtns.join('')}</div>` : '—'}</td>
        <td><button type="button" class="admin__btn admin__btn--outline admin__btn--sm idme-gift-save">Save</button></td>
        <td><button type="button" class="admin__btn admin__btn--outline admin__btn--sm idme-gift-delete" aria-label="Delete ${escapeHtmlIdme(name)}"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v10h-2V9zm4 0h2v10h-2V9zM7 9h2v10H7V9z"/></svg></button></td>
      </tr>`
    })
    .join('')
}

function idmeCloseGiftRedemptionsModal() {
  const modal = document.getElementById('idme-gift-redemptions-modal')
  idmeGiftModalId = null
  if (modal) modal.hidden = true
}

function idmeOpenGiftRedemptionsModal(giftId) {
  const giftRow = idmeGiftCache.find((r) => String(r.id) === String(giftId))
  const modal = document.getElementById('idme-gift-redemptions-modal')
  const title = document.getElementById('idme-gift-redemptions-title')
  const body = document.getElementById('idme-gift-redemptions-body')
  if (!modal || !title || !body || !giftRow) return
  idmeGiftModalId = giftId
  const code = idmeNormalizeGiftName(giftRow.code)
  title.textContent = `${code} — redemptions`
  const deviceRows = (Array.isArray(giftRow.idme_gift_device_redemptions)
    ? giftRow.idme_gift_device_redemptions
    : []
  ).map((r) => {
    const active = r.grant_until == null || Date.parse(r.grant_until) > Date.now()
    return `<tr data-redemption-id="${escapeHtmlIdme(r.id || '')}">
      <td title="${escapeHtmlIdme(r.device_id || '')}">${escapeHtmlIdme(r.device_id || '—')}</td>
      <td>Device</td>
      <td>${escapeHtmlIdme(idmeFormatDate(r.redeemed_at))}</td>
      <td>${active && !r.grant_until ? 'Lifetime' : escapeHtmlIdme(idmeFormatDate(r.grant_until))}</td>
      <td>${active ? 'Active' : 'Expired'}</td>
      <td>${idmeGiftRevokeButtonHtml(r) || '—'}</td>
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

async function idmeRevokeGiftRedemption(redemptionId, deviceId) {
  await idmeFetchJson(
    `${idmeRest('idme_gift_device_redemptions')}?id=eq.${encodeURIComponent(redemptionId)}`,
    { method: 'DELETE', headers: idmeHeaders() },
  )
  // Best-effort: clear matching device grants that look like gift (lemon_license_id starts with gift:)
  if (deviceId) {
    try {
      await idmeFetchJson(
        `${idmeRest('idme_license_device_grants')}?device_id=eq.${encodeURIComponent(deviceId)}&lemon_license_id=like.gift:*`,
        { method: 'DELETE', headers: idmeHeaders() },
      )
    } catch {
      /* optional */
    }
  }
  // Refresh gift rows so redemption_count can be reconciled from embed length on next save
}

async function idmeHandleGiftRevokeClick(btn) {
  const redemptionId = btn.dataset.redemptionId
  const deviceId = btn.dataset.deviceId
  if (!redemptionId) return
  if (!window.confirm('Revoke this redemption? The device will lose gift Pro access.')) return
  btn.disabled = true
  try {
    await idmeRevokeGiftRedemption(redemptionId, deviceId)
    idmeToast('Redemption revoked.', 'success')
    await idmeRefreshGifts()
    if (idmeGiftModalId && !document.getElementById('idme-gift-redemptions-modal')?.hidden) {
      idmeOpenGiftRedemptionsModal(idmeGiftModalId)
    }
  } catch (err) {
    idmeToast(err instanceof Error ? err.message : String(err), 'error')
  } finally {
    btn.disabled = false
  }
}

async function idmeRefresh(opts = {}) {
  if (!idmeAnonKey()) {
    idmeToast('Missing Supabase anon key.', 'error')
    return
  }
  if (idmeRefreshInFlight) return
  idmeRefreshInFlight = true
  const statusEl = document.getElementById('idme-users-status')
  const refreshBtn = document.getElementById('idme-users-refresh')
  if (refreshBtn) refreshBtn.disabled = true
  try {
    if (statusEl) {
      statusEl.hidden = false
      statusEl.textContent = 'Loading license grants…'
    }
    const users = await idmeLoadUsers()
    idmeRenderUsers(Array.isArray(users) ? users : [])
    if (statusEl) {
      statusEl.hidden = true
      statusEl.textContent = ''
    }
    if (opts.toast) idmeToast('Users refreshed.', 'success')
  } catch (err) {
    if (statusEl) {
      statusEl.hidden = true
      statusEl.textContent = ''
    }
    const msg = err instanceof Error ? err.message : String(err)
    idmeToast(
      msg +
        (/relation|table/i.test(msg)
          ? ' Run admin/idme-schema.sql in the Supabase SQL editor.'
          : ''),
      'error',
    )
  } finally {
    idmeRefreshInFlight = false
    if (refreshBtn) refreshBtn.disabled = false
  }
}

async function idmeRefreshGifts() {
  if (!idmeAnonKey()) {
    idmeToast('Missing Supabase anon key.', 'error')
    return
  }
  try {
    const gifts = await idmeLoadGifts()
    idmeRenderGifts(Array.isArray(gifts) ? gifts : [])
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    idmeToast(
      msg +
        (/relation|table/i.test(msg)
          ? ' Run admin/idme-schema.sql in the Supabase SQL editor.'
          : ''),
      'error',
    )
  }
}

async function idmeSaveGift(id, payload) {
  await idmeFetchJson(`${idmeRest('idme_gift_codes')}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: idmeHeaders(),
    body: JSON.stringify({ ...payload, updated_at: new Date().toISOString() }),
  })
}

async function idmeDeleteGift(id) {
  await idmeFetchJson(`${idmeRest('idme_gift_codes')}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: idmeHeaders(),
  })
}

async function idmeCreateGift(event) {
  event.preventDefault()
  const kind = String(document.getElementById('idme-gift-kind')?.value || 'days')
  const days = Number(document.getElementById('idme-gift-days')?.value || 60)
  const max = Number(document.getElementById('idme-gift-max')?.value || 1)
  const note = String(document.getElementById('idme-gift-note')?.value || '').trim()
  const nameInput = document.getElementById('idme-gift-name')
  const code = idmeNormalizeGiftName(nameInput?.value) || idmeGenerateCode()
  if (nameInput) nameInput.value = code
  if (idmeGiftNameTaken(code)) {
    idmeToast('That gift name is already in use.', 'error')
    nameInput?.focus()
    nameInput?.select()
    return
  }
  try {
    await idmeFetchJson(idmeRest('idme_gift_codes'), {
      method: 'POST',
      headers: idmeHeaders(),
      body: JSON.stringify({
        code,
        kind,
        duration_days: kind === 'lifetime' ? 0 : days,
        max_redemptions: Math.max(1, max),
        requires_login: false,
        note: note || null,
      }),
    })
    idmeToast(`Created ${code}`, 'success')
    idmeFillGiftName()
    await idmeRefreshGifts()
  } catch (err) {
    idmeToast(err instanceof Error ? err.message : String(err), 'error')
  }
}

function idmeInit() {
  if (idmeInitDone) return
  idmeInitDone = true

  document.getElementById('idme-users-search')?.addEventListener('input', () => {
    idmeRenderUsers(idmeUserCache)
  })
  document.getElementById('idme-users-refresh')?.addEventListener('click', () => {
    void idmeRefresh({ toast: true })
  })
  document.getElementById('idme-users-table-wrap')?.addEventListener('click', (event) => {
    const btn = event.target.closest('.admin__users-sort')
    if (!btn) return
    const key = btn.dataset.sort
    if (!key) return
    if (idmeSortKey === key) {
      idmeSortDir = idmeSortDir === 'asc' ? 'desc' : 'asc'
    } else {
      idmeSortKey = key
      idmeSortDir = key === 'email' || key === 'device' ? 'asc' : 'desc'
    }
    idmeRenderUsers(idmeUserCache)
  })

  document.getElementById('idme-gifts-form')?.addEventListener('submit', idmeCreateGift)
  document.getElementById('idme-gift-kind')?.addEventListener('change', idmeUpdateGiftExpirationPreview)
  document.getElementById('idme-gift-days')?.addEventListener('input', idmeUpdateGiftExpirationPreview)
  document.getElementById('idme-gift-name')?.addEventListener('blur', (event) => {
    const input = event.target
    const normalized = idmeNormalizeGiftName(input.value)
    if (normalized) input.value = normalized
  })
  idmeFillGiftName()
  idmeUpdateGiftExpirationPreview()

  document.getElementById('idme-gifts-body')?.addEventListener('change', (event) => {
    const kindSel = event.target.closest('.idme-gift-kind-input')
    if (!kindSel) return
    const tr = kindSel.closest('tr')
    const daysInput = tr?.querySelector('.idme-gift-days-input')
    if (daysInput) daysInput.disabled = kindSel.value === 'lifetime'
  })
  document.getElementById('idme-gifts-body')?.addEventListener(
    'blur',
    (event) => {
      const input = event.target.closest('.idme-gift-code-input')
      if (!input) return
      const normalized = idmeNormalizeGiftName(input.value)
      if (normalized) input.value = normalized
    },
    true,
  )
  document.getElementById('idme-gifts-body')?.addEventListener('click', (event) => {
    const revokeBtn = event.target.closest('.idme-gift-revoke')
    if (revokeBtn) {
      void idmeHandleGiftRevokeClick(revokeBtn)
      return
    }
    const emailsBtn = event.target.closest('.idme-gift-emails-btn')
    if (emailsBtn) {
      const giftId = emailsBtn.dataset.giftId
      if (giftId) idmeOpenGiftRedemptionsModal(giftId)
      return
    }
    const copyBtn = event.target.closest('.idme-gift-copy')
    if (copyBtn) {
      const tr = copyBtn.closest('[data-gift-id]')
      const code = idmeNormalizeGiftName(tr?.querySelector('.idme-gift-code-input')?.value)
      if (!code) return
      void idmeCopyText(code)
        .then(() => idmeToast(`Copied ${code}`, 'success'))
        .catch((err) => idmeToast(err instanceof Error ? err.message : 'Copy failed', 'error'))
      return
    }
    const saveBtn = event.target.closest('.idme-gift-save')
    const deleteBtn = event.target.closest('.idme-gift-delete')
    const tr = event.target.closest('tr')
    const id = tr?.dataset.giftId
    if (!tr || !id) return
    if (saveBtn) {
      const nameInput = tr.querySelector('.idme-gift-code-input')
      const code = idmeNormalizeGiftName(nameInput?.value)
      if (!code) {
        idmeToast('Gift name cannot be empty.', 'error')
        nameInput?.focus()
        return
      }
      if (idmeGiftNameTaken(code, id)) {
        idmeToast('That gift name is already in use.', 'error')
        nameInput?.focus()
        return
      }
      if (nameInput) nameInput.value = code
      const kind = String(tr.querySelector('.idme-gift-kind-input')?.value || 'days')
      const days = Number(tr.querySelector('.idme-gift-days-input')?.value || 0)
      const max = Number(tr.querySelector('.idme-gift-max-input')?.value || 1)
      const note = String(tr.querySelector('.idme-gift-note-input')?.value || '').trim()
      saveBtn.disabled = true
      void idmeSaveGift(id, {
        code,
        kind,
        duration_days: kind === 'lifetime' ? 0 : Math.max(1, days),
        max_redemptions: Math.max(1, max),
        note: note || null,
      })
        .then(() => {
          idmeToast('Gift code saved.', 'success')
          return idmeRefreshGifts()
        })
        .catch((err) => idmeToast(err instanceof Error ? err.message : String(err), 'error'))
        .finally(() => {
          saveBtn.disabled = false
        })
      return
    }
    if (deleteBtn) {
      if (!window.confirm('Delete this gift code? This cannot be undone.')) return
      deleteBtn.disabled = true
      void idmeDeleteGift(id)
        .then(() => {
          idmeToast('Gift code deleted.', 'success')
          return idmeRefreshGifts()
        })
        .catch((err) => idmeToast(err instanceof Error ? err.message : String(err), 'error'))
        .finally(() => {
          deleteBtn.disabled = false
        })
    }
  })

  document
    .getElementById('idme-gift-redemptions-modal-backdrop')
    ?.addEventListener('click', idmeCloseGiftRedemptionsModal)
  document
    .getElementById('idme-gift-redemptions-modal-close')
    ?.addEventListener('click', idmeCloseGiftRedemptionsModal)
  document.getElementById('idme-gift-redemptions-body')?.addEventListener('click', (event) => {
    const btn = event.target.closest('.idme-gift-revoke')
    if (!btn) return
    void idmeHandleGiftRevokeClick(btn)
  })
}

window.IdmeAdminAccounts = {
  render: idmeRefresh,
  renderGifts: idmeRefreshGifts,
  init: idmeInit,
  refresh: idmeRefresh,
}

document.addEventListener('DOMContentLoaded', idmeInit)
if (document.readyState !== 'loading') idmeInit()
