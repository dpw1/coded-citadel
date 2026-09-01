/* global SUPABASE_URL, SUPABASE_ANON_KEY, Toastify */

const YFP_UNLIMITED = 9999
const YFP_WEEK_MS = 7 * 24 * 60 * 60 * 1000

let yfpInitDone = false
let yfpProfileCache = []
let yfpGiftCache = []
let yfpGiftModalId = null
let yfpSortKey = 'created'
let yfpSortDir = 'desc'
let yfpLoggedInAudience = 'real'
let yfpRefreshInFlight = false

function yfpUtcMonth() {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

/** Rolling UTC week start — matches extension searchQuota currentPeriodStart(). */
function yfpCurrentPeriodStartMs(anchorMs, nowMs = Date.now()) {
  if (!Number.isFinite(anchorMs)) return nowMs
  if (nowMs <= anchorMs) return anchorMs
  const periodsElapsed = Math.floor((nowMs - anchorMs) / YFP_WEEK_MS)
  return anchorMs + periodsElapsed * YFP_WEEK_MS
}

function yfpQuotaAnchorMs(row) {
  const data = row && row.data && typeof row.data === 'object' ? row.data : {}
  const anchor = data.quotaAnchor || data.quota_anchor
  if (anchor) {
    const ms = Date.parse(anchor)
    if (Number.isFinite(ms)) return ms
  }
  return yfpDateMs(row?.created_at)
}

function yfpStoredPeriodStartMs(row, usage) {
  const data = row && row.data && typeof row.data === 'object' ? row.data : {}
  const periodStart = data.periodStart || data.period_start
  if (periodStart) {
    const ms = Date.parse(periodStart)
    if (Number.isFinite(ms)) return ms
  }
  const month = String(usage.month || row.usage_month || '')
  if (/^\d{4}-\d{2}-\d{2}$/.test(month)) {
    const ms = Date.parse(`${month}T00:00:00.000Z`)
    if (Number.isFinite(ms)) return ms
  }
  return NaN
}

function yfpUsage(row) {
  const data = row && row.data && typeof row.data === 'object' ? row.data : {}
  const limits = typeof window !== 'undefined' && window.YFP_FREE_TIER_LIMITS ? window.YFP_FREE_TIER_LIMITS : {}
  const defaultExportCap = Number(limits.lifetimeExportCap ?? limits.weeklyExportCap) || 10
  const defaultAiChatCap = Number(limits.lifetimeAiChatCap ?? limits.weeklyAiChatCap) || 10
  const defaultSearchCap = Number(limits.weeklySearchCap) || 10
  return {
    month: String(data.month || row.usage_month || ''),
    periodStart: String(data.periodStart || data.period_start || ''),
    searches: Number(data.searches ?? row.searches_this_month ?? 0),
    searchCap: Number(row.monthly_quota ?? data.searchCap ?? defaultSearchCap),
    exports: Number(data.exports || 0),
    exportCap: Number(data.exportCap || defaultExportCap),
    aiChats: Number(data.aiChats || 0),
    aiChatCap: Number(data.aiChatCap || defaultAiChatCap),
  }
}

function yfpIsUnlimited(row) {
  const grant = row.grant_until ? Date.parse(row.grant_until) : NaN
  const usage = yfpUsage(row)
  return (
    yfpProfileLifetime(row) ||
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

function yfpFunctionsUrl(name) {
  return `${String(window.SUPABASE_URL || SUPABASE_URL || '').replace(/\/+$/, '')}/functions/v1/${name}`
}

async function yfpSyncBillingFromLemon(emails) {
  const unique = [
    ...new Set(
      (Array.isArray(emails) ? emails : [])
        .map((email) => String(email || '').trim().toLowerCase())
        .filter(Boolean),
    ),
  ]
  if (!unique.length) return { ok: true, synced: 0 }
  const res = await fetch(yfpFunctionsUrl('lemon-billing-sync'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${yfpAnonKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emails: unique.slice(0, 50) }),
  })
  let json = null
  try {
    json = await res.json()
  } catch {
    json = null
  }
  if (!res.ok) {
    const msg = json?.error || res.statusText || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return json
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

function yfpGiftDurationUnit(kind) {
  if (kind === 'months') return 'Months'
  if (kind === 'days') return 'Days'
  return 'Duration'
}

function yfpComputeGrantExpiration(kind, duration) {
  if (kind === 'lifetime') return null
  const n = Math.max(1, Number(duration) || 1)
  const exp = new Date()
  if (kind === 'months') exp.setMonth(exp.getMonth() + n)
  else exp.setDate(exp.getDate() + n)
  return exp
}

function yfpFormatAdminDate(date) {
  if (!date) return ''
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
}

function yfpUpdateGiftExpirationPreview() {
  const kind = String(document.getElementById('yt-gift-kind')?.value || 'days')
  const duration = Number(document.getElementById('yt-gift-days')?.value || 1)
  const label = document.getElementById('yt-gift-duration-label')
  const input = document.getElementById('yt-gift-days')
  const preview = document.getElementById('yt-gift-expiration-preview')
  if (label) label.textContent = yfpGiftDurationUnit(kind)
  if (input) input.disabled = kind === 'lifetime'
  if (!preview) return
  if (kind === 'lifetime') {
    preview.textContent = 'Grant expiration if redeemed today: never (lifetime)'
    return
  }
  const exp = yfpComputeGrantExpiration(kind, duration)
  preview.textContent = `Grant expiration if redeemed today: ${yfpFormatAdminDate(exp)}`
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
    const viaAccounts = await yfpFetchJson(`${yfpRest('rpc/yt_filter_pro_admin_list_accounts')}`, {
      method: 'POST',
      headers: yfpHeaders(),
      body: '{}',
    })
    if (Array.isArray(viaAccounts)) return viaAccounts
  } catch {
    /* RPC missing until SQL is re-run */
  }
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
    `${yfpRest('yt_filter_pro_gift_codes')}?select=*,yt_filter_pro_gift_redemptions(id,user_id,email,redeemed_at,grant_until),yt_filter_pro_gift_device_redemptions(id,device_id,redeemed_at,grant_until)&order=created_at.desc`,
    { headers: yfpHeaders() },
  )
}

function yfpGiftRedemptionActive(redemption, giftKind) {
  if (!redemption) return false
  if (giftKind === 'lifetime') return redemption.grant_until == null
  const ms = Date.parse(redemption.grant_until || '')
  return Number.isFinite(ms) && ms > Date.now()
}

function yfpFormatGiftAdminDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function yfpGiftExpirationDisplay(kind, days, redemptions, deviceRedemptions) {
  const all = [...redemptions, ...deviceRedemptions]
  if (all.length) {
    const active = all.filter((r) => yfpGiftRedemptionActive(r, kind))
    if (kind === 'lifetime' && active.some((r) => r.grant_until == null)) {
      return { text: 'Never', title: 'Lifetime — active' }
    }
    if (active.length) {
      let latest = null
      let latestMs = -Infinity
      for (const r of active) {
        if (r.grant_until == null) continue
        const ms = Date.parse(r.grant_until)
        if (Number.isFinite(ms) && ms > latestMs) {
          latestMs = ms
          latest = r.grant_until
        }
      }
      if (latest) {
        return {
          text: yfpFormatGiftAdminDate(latest),
          title: `${active.length} active grant${active.length === 1 ? '' : 's'}`,
        }
      }
    }
    let latestPast = null
    let latestPastMs = -Infinity
    for (const r of all) {
      if (!r.grant_until) continue
      const ms = Date.parse(r.grant_until)
      if (Number.isFinite(ms) && ms > latestPastMs) {
        latestPastMs = ms
        latestPast = r.grant_until
      }
    }
    return {
      text: latestPast ? yfpFormatGiftAdminDate(latestPast) : '—',
      title: 'Revoked or expired',
    }
  }
  if (kind === 'lifetime') return { text: 'Never', title: 'Lifetime — not redeemed yet' }
  const exp = yfpComputeGrantExpiration(kind, days)
  return {
    text: yfpFormatAdminDate(exp),
    title: 'If redeemed today',
  }
}

function yfpGiftUserRedemptionLabel(r) {
  const email = r?.email && !yfpEmailBlacklisted(r.email) ? String(r.email).trim() : ''
  if (email) return email
  if (r?.user_id) return String(r.user_id)
  if (r?.id) return String(r.id)
  return '—'
}

function yfpGiftDeviceRedemptionLabel(r) {
  const device = String(r?.device_id || '').trim()
  if (device) {
    return device.length > 36 ? `${device.slice(0, 8)}…${device.slice(-6)}` : device
  }
  if (r?.id) return String(r.id)
  return '—'
}

function yfpGiftRevokeButtonHtml(r, source, kind, label) {
  if (!yfpGiftRedemptionActive(r, kind)) return ''
  return `<button type="button" class="admin__btn admin__btn--outline admin__btn--sm yt-gift-revoke" data-redemption-id="${escapeHtmlAdmin(r.id || '')}" data-redemption-source="${escapeHtmlAdmin(source)}" title="Revoke ${escapeHtmlAdmin(label)}">Revoke</button>`
}

function yfpGiftRevokeCellHtml(redemptions, deviceRedemptions, kind) {
  const buttons = [
    ...redemptions.map((r) => yfpGiftRevokeButtonHtml(r, 'user', kind, yfpGiftUserRedemptionLabel(r))),
    ...deviceRedemptions.map((r) => yfpGiftRevokeButtonHtml(r, 'device', kind, yfpGiftDeviceRedemptionLabel(r))),
  ].filter(Boolean)
  return buttons.length
    ? `<div class="yt-gift-revoke-list">${buttons.join('')}</div>`
    : '—'
}

async function yfpHandleGiftRevokeClick(btn) {
  const tr = btn.closest('tr')
  const redemptionId = btn.dataset.redemptionId || tr?.dataset.redemptionId
  const source = btn.dataset.redemptionSource || tr?.dataset.redemptionSource || 'user'
  if (!redemptionId) return
  if (!window.confirm('Revoke this redemption? The user will lose unlimited access from this code.')) return
  btn.disabled = true
  try {
    await yfpRevokeGiftRedemption(redemptionId, source)
    yfpToast('Redemption revoked.', 'success')
    const giftId = yfpGiftModalId || tr?.closest('[data-gift-id]')?.dataset.giftId || ''
    await yfpRefreshGifts()
    if (giftId && !document.getElementById('yt-gift-redemptions-modal')?.hidden) {
      yfpOpenGiftRedemptionsModal(giftId)
    }
  } catch (err) {
    yfpToast(err instanceof Error ? err.message : String(err), 'error')
  } finally {
    btn.disabled = false
  }
}

async function yfpRevokeGiftRedemption(redemptionId, source) {
  const row = await yfpFetchJson(`${yfpRest('rpc/yt_filter_pro_admin_revoke_gift_redemption')}`, {
    method: 'POST',
    headers: yfpHeaders(),
    body: JSON.stringify({
      p_redemption_id: redemptionId,
      p_source: source,
    }),
  })
  if (row && row.ok === false) {
    throw new Error(row.error || 'revoke_failed')
  }
  return row
}

function yfpCloseGiftRedemptionsModal() {
  const modal = document.getElementById('yt-gift-redemptions-modal')
  yfpGiftModalId = null
  if (modal) modal.hidden = true
}

function yfpRenderGiftRedemptionsModal(giftRow) {
  const modal = document.getElementById('yt-gift-redemptions-modal')
  const title = document.getElementById('yt-gift-redemptions-title')
  const body = document.getElementById('yt-gift-redemptions-body')
  if (!modal || !title || !body || !giftRow) return

  const code = yfpNormalizeGiftName(giftRow.code)
  const kind = giftRow.kind === 'lifetime' ? 'lifetime' : giftRow.kind === 'months' ? 'months' : 'days'
  title.textContent = `${code} — redemptions`

  const userRows = (Array.isArray(giftRow.yt_filter_pro_gift_redemptions)
    ? giftRow.yt_filter_pro_gift_redemptions
    : []
  ).map((r) => {
      const active = yfpGiftRedemptionActive(r, kind)
      const label = yfpGiftUserRedemptionLabel(r)
      const title = r.user_id && label !== String(r.user_id) ? String(r.user_id) : ''
      return `<tr data-redemption-id="${escapeHtmlAdmin(r.id || '')}" data-redemption-source="user">
        <td${title ? ` title="${escapeHtmlAdmin(title)}"` : ''}>${escapeHtmlAdmin(label)}</td>
        <td>Account</td>
        <td>${escapeHtmlAdmin(yfpFormatGiftAdminDate(r.redeemed_at))}</td>
        <td>${kind === 'lifetime' && active ? 'Lifetime' : escapeHtmlAdmin(yfpFormatGiftAdminDate(r.grant_until))}</td>
        <td>${active ? 'Active' : 'Revoked / expired'}</td>
        <td>${yfpGiftRevokeButtonHtml(r, 'user', kind, label) || '—'}</td>
      </tr>`
    })

  const deviceRows = (Array.isArray(giftRow.yt_filter_pro_gift_device_redemptions)
    ? giftRow.yt_filter_pro_gift_device_redemptions
    : []
  ).map((r) => {
    const active = yfpGiftRedemptionActive(r, kind)
    const label = yfpGiftDeviceRedemptionLabel(r)
    const device = String(r.device_id || '')
    return `<tr data-redemption-id="${escapeHtmlAdmin(r.id || '')}" data-redemption-source="device">
      <td title="${escapeHtmlAdmin(device || label)}">${escapeHtmlAdmin(label)}</td>
      <td>Device (signed out)</td>
      <td>${escapeHtmlAdmin(yfpFormatGiftAdminDate(r.redeemed_at))}</td>
      <td>${kind === 'lifetime' && active ? 'Lifetime' : escapeHtmlAdmin(yfpFormatGiftAdminDate(r.grant_until))}</td>
      <td>${active ? 'Active' : 'Revoked / expired'}</td>
      <td>${yfpGiftRevokeButtonHtml(r, 'device', kind, label) || '—'}</td>
    </tr>`
  })

  const rows = [...userRows, ...deviceRows]
  body.innerHTML = rows.length
    ? `<div class="admin__users-table-wrap">
        <table class="admin__users-table">
          <thead>
            <tr>
              <th>user / device</th>
              <th>type</th>
              <th>redeemed</th>
              <th>expires</th>
              <th>status</th>
              <th>revoke</th>
            </tr>
          </thead>
          <tbody>${rows.join('')}</tbody>
        </table>
      </div>`
    : '<p class="admin__modal-empty">No redemptions yet.</p>'

  modal.hidden = false
}

function yfpOpenGiftRedemptionsModal(giftId) {
  yfpGiftModalId = String(giftId || '')
  const giftRow = yfpGiftCache.find((row) => String(row.id) === yfpGiftModalId)
  if (!giftRow) {
    yfpToast('Gift code not found. Refresh and try again.', 'error')
    return
  }
  yfpRenderGiftRedemptionsModal(giftRow)
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
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const min = String(d.getUTCMinutes()).padStart(2, '0')
  const ss = String(d.getUTCSeconds()).padStart(2, '0')
  const absolute = `${dd}-${mm}-${yyyy} ${hh}-${min}-${ss}`
  const relative = yfpRelativeLabel(value)
  return relative ? `${absolute} (${relative})` : absolute
}

function yfpUsedSearches(row) {
  const usage = yfpUsage(row)

  // Legacy calendar-month profiles (pre weekly quota).
  const month = usage.month
  if (/^\d{4}-\d{2}$/.test(month)) {
    return month === yfpUtcMonth() ? usage.searches : 0
  }

  const anchorMs = yfpQuotaAnchorMs(row)
  const currentPeriodMs = yfpCurrentPeriodStartMs(anchorMs)
  const storedPeriodMs = yfpStoredPeriodStartMs(row, usage)
  const createdMs = yfpDateMs(row?.created_at)

  if (!Number.isFinite(storedPeriodMs)) {
    return usage.searches
  }

  // Match yt_filter_pro_snapshot: zero only when the rolling week has advanced.
  const baselineMs = Number.isFinite(storedPeriodMs) ? storedPeriodMs : createdMs
  if (storedPeriodMs !== currentPeriodMs && currentPeriodMs > baselineMs) {
    return 0
  }
  return usage.searches
}

function yfpUsedExports(row) {
  return yfpUsage(row).exports
}

function yfpUsedAiChats(row) {
  return yfpUsage(row).aiChats
}

function yfpParseBool(value) {
  if (typeof value === 'boolean') return value
  if (value === 'true' || value === true) return true
  if (value === 'false' || value === false) return false
  return null
}

function yfpIsSubscribedFromLemonStatus(status, isPaying) {
  if (!isPaying) return false
  const normalized = String(status || '').toLowerCase()
  return ['active', 'on_trial', 'past_due', 'paused'].includes(normalized)
}

function yfpProfileLifetime(row) {
  const data = row?.data && typeof row.data === 'object' ? row.data : {}
  if (row.source === 'device') return false
  if (data.gift_is_lifetime === true || data.gift_kind === 'lifetime') return true
  if (data.lemonLicenseActivated && !data.gift_code) return false
  return row.is_lifetime === true
}

function yfpBilling(row) {
  const data = row?.data && typeof row.data === 'object' ? row.data : {}
  let isSubscribed = null
  if (typeof row.is_subscribed === 'boolean') {
    isSubscribed = row.is_subscribed
  } else {
    isSubscribed = yfpParseBool(data.lemonIsSubscribed)
  }
  if (isSubscribed === null) {
    isSubscribed = yfpIsSubscribedFromLemonStatus(
      row.lemon_status || data.lemonStatus,
      row.is_paying,
    )
  }
  const nextPayment =
    row.next_payment_at ||
    (isSubscribed ? data.lemonRenewsAt || row.grant_until : null) ||
    null
  const test = row.test === true
  const source = row.source || 'profile'
  return { isSubscribed: Boolean(isSubscribed), nextPayment, test, source }
}

function yfpSortValue(row, key) {
  const usage = yfpUsage(row)
  const billing = yfpBilling(row)
  switch (key) {
    case 'email':
      return String(row.email || '').toLowerCase()
    case 'quota':
      return Number.isFinite(usage.searchCap) ? usage.searchCap : 0
    case 'used':
      return yfpUsedSearches(row)
    case 'exports':
      return yfpUsedExports(row)
    case 'aiChats':
      return yfpUsedAiChats(row)
    case 'paying':
      return row.is_paying ? 1 : 0
    case 'lifetime':
      return yfpProfileLifetime(row) ? 1 : 0
    case 'grant':
      return yfpDateMs(row.grant_until)
    case 'created':
      return yfpDateMs(row.created_at)
    case 'test':
      return billing.test ? 1 : 0
    case 'subscribed':
      return billing.isSubscribed ? 1 : 0
    case 'nextPayment':
      return yfpDateMs(billing.nextPayment)
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

function yfpSyncLoggedInAudienceTabs() {
  document.querySelectorAll('[data-yfp-audience]').forEach((btn) => {
    const active = btn.dataset.yfpAudience === yfpLoggedInAudience
    btn.classList.toggle('admin__subtab--active', active)
    btn.setAttribute('aria-selected', active ? 'true' : 'false')
  })
}

function yfpSetLoggedInAudience(audience) {
  if (audience !== 'real' && audience !== 'test') return
  yfpLoggedInAudience = audience
  yfpSyncLoggedInAudienceTabs()
  yfpRenderProfiles(yfpProfileCache)
}

function yfpAudienceMatches(row) {
  const isTest = yfpBilling(row).test
  return yfpLoggedInAudience === 'test' ? isTest : !isTest
}

function yfpUpdateAudienceBadges(realCount, testCount) {
  const setBadge = (id, count) => {
    const el = document.getElementById(id)
    if (!el) return
    if (count > 0) {
      el.hidden = false
      el.textContent = count.toLocaleString('en-US')
    } else {
      el.hidden = true
      el.textContent = '0'
    }
  }
  setBadge('yt-loggedin-badge-real', realCount)
  setBadge('yt-loggedin-badge-test', testCount)
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
  const notBlacklisted = yfpProfileCache.filter((row) => !yfpEmailBlacklisted(row.email))
  const realCount = notBlacklisted.filter((row) => !yfpBilling(row).test).length
  const testCount = notBlacklisted.filter((row) => yfpBilling(row).test).length
  yfpUpdateAudienceBadges(realCount, testCount)
  yfpSyncLoggedInAudienceTabs()

  const visible = notBlacklisted.filter(yfpAudienceMatches)
  const query = String(document.getElementById('yt-loggedin-search')?.value || '')
    .trim()
    .toLowerCase()
  const filtered = visible.filter((row) => {
    if (!query) return true
    return String(row.email || '').toLowerCase().includes(query)
  })
  const unlimited = visible.filter(yfpIsUnlimited).length
  const paying = visible.filter((row) => row.is_paying).length
  const subscribed = visible.filter((row) => yfpBilling(row).isSubscribed).length
  const setKpi = (id, value) => {
    const el = document.getElementById(id)
    if (el) el.textContent = String(value)
  }
  setKpi('kpi-yt-loggedin-total', visible.length.toLocaleString('en-US'))
  setKpi('kpi-yt-loggedin-unlimited', unlimited.toLocaleString('en-US'))
  setKpi('kpi-yt-loggedin-paying', paying.toLocaleString('en-US'))
  setKpi('kpi-yt-loggedin-subscribed', subscribed.toLocaleString('en-US'))

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
      if (notBlacklisted.length && !visible.length) {
        empty.textContent =
          yfpLoggedInAudience === 'test'
            ? 'No test checkout users. Lemon test-mode purchases appear here.'
            : 'No real (production) users yet. They appear after a live Lemon checkout or Google sign-in.'
      } else if (visible.length) {
        empty.textContent = 'No users match this filter.'
      } else {
        empty.textContent = 'No logged-in users yet. They appear here after Google sign-in.'
      }
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
      const used = yfpUsedSearches(row)
      const exportsUsed = yfpUsedExports(row)
      const aiChatsUsed = yfpUsedAiChats(row)
      const quota = Number.isFinite(usage.searchCap) ? usage.searchCap : 0
      const grant = yfpFormatDateRelative(row.grant_until)
      const created = yfpFormatDateRelative(row.created_at)
      const billing = yfpBilling(row)
      const lifetime = yfpProfileLifetime(row)
      const nextPayment = yfpFormatDateRelative(billing.nextPayment)
      const grantTitle = row.grant_until ? String(row.grant_until) : ''
      const createdTitle = row.created_at ? String(row.created_at) : ''
      const nextPaymentTitle = billing.nextPayment ? String(billing.nextPayment) : ''
      return `<tr data-user-id="${String(row.user_id || '').replace(/"/g, '')}">
        <td>${escapeHtmlAdmin(row.email || '')}${billing.source === 'device' ? ' <span class="admin__users-pill admin__users-pill--no" title="License checkout without Google sign-in">device</span>' : ''}</td>
        <td class="yt-quota-cell">
          <button type="button" class="yt-quota-display">${quota}</button>
          <input type="number" class="admin__users-search yt-quota-input" min="0" value="${quota}" hidden />
        </td>
        <td class="admin__users-num">${used}</td>
        <td class="admin__users-num" title="cap ${usage.exportCap}">${exportsUsed}</td>
        <td class="admin__users-num" title="cap ${usage.aiChatCap}">${aiChatsUsed}</td>
        <td><span class="admin__users-pill ${billing.test ? 'admin__users-pill--yes' : 'admin__users-pill--no'}">${billing.test ? 'yes' : 'no'}</span></td>
        <td><span class="admin__users-pill ${billing.isSubscribed ? 'admin__users-pill--yes' : 'admin__users-pill--no'}">${billing.isSubscribed ? 'yes' : 'no'}</span></td>
        <td title="${escapeHtmlAdmin(nextPaymentTitle)}">${escapeHtmlAdmin(nextPayment)}</td>
        <td><span class="admin__users-pill ${row.is_paying ? 'admin__users-pill--yes' : 'admin__users-pill--no'}">${row.is_paying ? 'yes' : 'no'}</span></td>
        <td><span class="admin__users-pill ${lifetime ? 'admin__users-pill--yes' : 'admin__users-pill--no'}">${lifetime ? 'yes' : 'no'}</span></td>
        <td title="${escapeHtmlAdmin(grantTitle)}">${escapeHtmlAdmin(grant)}</td>
        <td title="${escapeHtmlAdmin(createdTitle)}">${escapeHtmlAdmin(created)}</td>
        <td>${billing.source === 'device' ? '—' : `<button type="button" class="admin__btn admin__btn--outline admin__btn--sm yt-quota-save">Save</button>`}</td>
      </tr>`
    })
    .join('')
}

function yfpRenderGifts(rows) {
  const body = document.getElementById('yt-gifts-body')
  if (!body) return
  yfpGiftCache = Array.isArray(rows) ? rows : []
  body.innerHTML = yfpGiftCache
    .map((row) => {
      const redemptions = Array.isArray(row.yt_filter_pro_gift_redemptions)
        ? row.yt_filter_pro_gift_redemptions
        : []
      const deviceRedemptions = Array.isArray(row.yt_filter_pro_gift_device_redemptions)
        ? row.yt_filter_pro_gift_device_redemptions
        : []
      const redeemedLabels = [
        ...redemptions.map((r) => yfpGiftUserRedemptionLabel(r)),
        ...deviceRedemptions.map((r) => yfpGiftDeviceRedemptionLabel(r)),
      ].filter((label) => label !== '—')
      const redeemedBy = redeemedLabels.join(', ')
      const redemptionCount = redemptions.length + deviceRedemptions.length
      const emailsCell =
        redemptionCount > 0
          ? `<button type="button" class="yt-gift-emails-btn" data-gift-id="${escapeHtmlAdmin(row.id || '')}" title="View redemptions">${escapeHtmlAdmin(redeemedBy || `${redemptionCount} redemption(s)`)}</button>`
          : '—'
      const kind = row.kind === 'lifetime' ? 'lifetime' : row.kind === 'months' ? 'months' : 'days'
      const days = Number(row.duration_days) || 0
      const max = Number(row.max_redemptions) || 1
      const used = Number(row.redemption_count) || 0
      const requiresLogin = Boolean(row.requires_login)
      const name = yfpNormalizeGiftName(row.code)
      const createdAt = yfpFormatGiftAdminDate(row.created_at)
      const expiration = yfpGiftExpirationDisplay(kind, days, redemptions, deviceRedemptions)
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
            <option value="months"${kind === 'months' ? ' selected' : ''}>Months</option>
            <option value="lifetime"${kind === 'lifetime' ? ' selected' : ''}>Lifetime</option>
          </select>
        </td>
        <td><input type="number" class="admin__users-search yt-gift-days-input" min="1" value="${days}" ${kind === 'lifetime' ? 'disabled' : ''} /></td>
        <td><input type="number" class="admin__users-search yt-gift-max-input" min="${Math.max(1, used)}" value="${max}" /></td>
        <td>${used}</td>
        <td><input type="text" class="admin__users-search yt-gift-note-input" value="${escapeHtmlAdmin(row.note || '')}" /></td>
        <td><input type="checkbox" class="yt-gift-requires-login-input"${requiresLogin ? ' checked' : ''} /></td>
        <td title="${escapeHtmlAdmin(row.created_at || '')}">${escapeHtmlAdmin(createdAt)}</td>
        <td title="${escapeHtmlAdmin(expiration.title)}">${escapeHtmlAdmin(expiration.text)}</td>
        <td>${emailsCell}</td>
        <td>${yfpGiftRevokeCellHtml(redemptions, deviceRedemptions, kind)}</td>
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

function yfpSummarizeLemonSync(json) {
  const results = Array.isArray(json?.results) ? json.results : []
  const synced = results.filter((r) => r?.ok && !r?.skipped)
  const subscribed = synced.filter((r) => r?.isSubscribed).length
  const cancelled = synced.filter((r) => r?.cancelled || r?.lemonStatus === 'cancelled').length
  const skipped = results.filter((r) => r?.skipped).length
  const failed = results.filter((r) => r?.ok === false).length
  const parts = [`${synced.length} synced`]
  if (subscribed) parts.push(`${subscribed} subscribed`)
  if (cancelled) parts.push(`${cancelled} cancelled`)
  if (skipped) parts.push(`${skipped} skipped`)
  if (failed) parts.push(`${failed} failed`)
  return parts.join(', ')
}

async function yfpRefresh(opts = {}) {
  if (!yfpAnonKey()) {
    yfpToast('Missing Supabase anon key.', 'error')
    return
  }
  if (yfpRefreshInFlight) return
  yfpRefreshInFlight = true
  const statusEl = document.getElementById('yt-loggedin-status')
  const refreshBtn = document.getElementById('yt-loggedin-refresh')
  if (refreshBtn) refreshBtn.disabled = true
  try {
    let profiles = await yfpLoadProfiles()
    const rows = Array.isArray(profiles) ? profiles : []
    yfpRenderProfiles(rows)

    if (opts.syncBilling === true && rows.length) {
      const emails = rows.map((row) => row.email).filter(Boolean)
      if (statusEl) {
        statusEl.hidden = false
        statusEl.textContent = `Syncing ${emails.length} account${emails.length === 1 ? '' : 's'} from Lemon Squeezy…`
      }
      try {
        const syncJson = await yfpSyncBillingFromLemon(emails)
        profiles = await yfpLoadProfiles()
        yfpRenderProfiles(Array.isArray(profiles) ? profiles : [])
        if (opts.toast) {
          yfpToast(`Lemon sync: ${yfpSummarizeLemonSync(syncJson)}.`, 'success')
        }
      } catch (syncErr) {
        const syncMsg = syncErr instanceof Error ? syncErr.message : String(syncErr)
        yfpToast(`Lemon sync failed: ${syncMsg}`, 'error')
      }
    }
    if (statusEl) {
      statusEl.hidden = true
      statusEl.textContent = ''
    }
  } catch (err) {
    if (statusEl) {
      statusEl.hidden = true
      statusEl.textContent = ''
    }
    const msg = err instanceof Error ? err.message : String(err)
    yfpToast(msg + yfpErrorHint(msg), 'error')
  } finally {
    yfpRefreshInFlight = false
    if (refreshBtn) refreshBtn.disabled = false
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
  const requiresLogin = Boolean(document.getElementById('yt-gift-requires-login')?.checked)
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
        requires_login: requiresLogin,
        note: note || null,
      }),
    })
    if (hint) hint.hidden = true
    yfpToast(`Created ${code}`, 'success')
    yfpFillGiftName()
    const requiresLoginInput = document.getElementById('yt-gift-requires-login')
    if (requiresLoginInput) requiresLoginInput.checked = false
    await yfpRefreshGifts()
  } catch (err) {
    yfpToast(yfpGiftError(err), 'error')
  }
}

function yfpInit() {
  if (yfpInitDone) return
  yfpInitDone = true
  document.querySelectorAll('[data-yfp-audience]').forEach((btn) => {
    btn.addEventListener('click', () => {
      yfpSetLoggedInAudience(btn.dataset.yfpAudience || 'real')
    })
  })
  document.getElementById('yt-loggedin-search')?.addEventListener('input', () => {
    yfpRenderProfiles(yfpProfileCache)
  })
  document.getElementById('yt-loggedin-refresh')?.addEventListener('click', () => {
    void yfpRefresh({ syncBilling: true, toast: true })
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
      .then(() => yfpRefresh())
      .then(() => yfpToast('Quota saved.', 'success'))
      .catch((err) => yfpToast(err instanceof Error ? err.message : String(err), 'error'))
      .finally(() => {
        btn.disabled = false
      })
  })
  document.getElementById('yt-gifts-form')?.addEventListener('submit', yfpCreateGift)
  document.getElementById('yt-gift-kind')?.addEventListener('change', yfpUpdateGiftExpirationPreview)
  document.getElementById('yt-gift-days')?.addEventListener('input', yfpUpdateGiftExpirationPreview)
  document.getElementById('yt-gift-name')?.addEventListener('blur', (event) => {
    const input = event.target
    const normalized = yfpNormalizeGiftName(input.value)
    if (normalized) input.value = normalized
  })
  yfpFillGiftName()
  yfpUpdateGiftExpirationPreview()
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
    const revokeBtn = event.target.closest('.yt-gift-revoke')
    if (revokeBtn && revokeBtn.closest('#yt-gifts-body')) {
      void yfpHandleGiftRevokeClick(revokeBtn)
      return
    }

    const emailsBtn = event.target.closest('.yt-gift-emails-btn')
    if (emailsBtn) {
      const giftId = emailsBtn.dataset.giftId
      if (giftId) yfpOpenGiftRedemptionsModal(giftId)
      return
    }
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
      const requiresLogin = Boolean(tr.querySelector('.yt-gift-requires-login-input')?.checked)
      saveBtn.disabled = true
      void yfpSaveGift(id, {
        code,
        kind,
        duration_days: kind === 'lifetime' ? 0 : Math.max(1, days),
        max_redemptions: Math.max(1, max),
        requires_login: requiresLogin,
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
  document.getElementById('yt-gift-redemptions-modal-backdrop')?.addEventListener('click', yfpCloseGiftRedemptionsModal)
  document.getElementById('yt-gift-redemptions-modal-close')?.addEventListener('click', yfpCloseGiftRedemptionsModal)
  document.getElementById('yt-gift-redemptions-body')?.addEventListener('click', (event) => {
    const btn = event.target.closest('.yt-gift-revoke')
    if (!btn) return
    void yfpHandleGiftRevokeClick(btn)
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
