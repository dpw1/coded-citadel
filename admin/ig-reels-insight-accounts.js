/* global Toastify */

let ivdInitDone = false
let ivdGiftCache = []
let ivdGiftModalId = null

function ivdAnonKey() {
  return String(window.IVD_SUPABASE_ANON_KEY || '').trim()
}

function ivdSupabaseUrl() {
  return String(window.IVD_SUPABASE_URL || '').replace(/\/+$/, '')
}

function ivdHeaders() {
  const key = ivdAnonKey()
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }
}

function ivdRest(path) {
  return `${ivdSupabaseUrl()}/rest/v1/${path}`
}

function ivdFunctionsUrl(name) {
  return `${ivdSupabaseUrl()}/functions/v1/${name}`
}

async function ivdFetchJson(url, options = {}) {
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

function ivdToast(message, type) {
  const colors = { success: '#16a34a', error: '#dc2626', warning: '#d97706', info: '#2563eb' }
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

function ivdEscapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function ivdNormalizeGiftName(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
}

function ivdGiftNameTaken(name, exceptId) {
  const normalized = ivdNormalizeGiftName(name)
  return ivdGiftCache.some(
    (row) => ivdNormalizeGiftName(row.code) === normalized && String(row.id) !== String(exceptId || ''),
  )
}

function ivdFormatGiftAdminDate(value) {
  const ms = Date.parse(String(value || ''))
  if (!Number.isFinite(ms)) return '—'
  return new Date(ms).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function ivdComputeGrantExpiration(kind, days) {
  const now = Date.now()
  if (kind === 'lifetime') return null
  const d = Math.max(1, Number(days) || 1)
  if (kind === 'months') {
    const dt = new Date(now)
    dt.setUTCMonth(dt.getUTCMonth() + d)
    return dt.toISOString()
  }
  return new Date(now + d * 86400000).toISOString()
}

function ivdGiftRedemptionActive(r, giftKind) {
  if (!r) return false
  if (giftKind === 'lifetime') return r.grant_until == null
  if (!r.grant_until) return false
  return Date.parse(r.grant_until) > Date.now()
}

function ivdGiftDeviceRedemptionLabel(r) {
  const device = String(r?.device_id || '').trim()
  if (device) return device.length > 36 ? `${device.slice(0, 8)}…${device.slice(-6)}` : device
  return r?.id ? String(r.id) : '—'
}

function ivdGiftExpirationDisplay(kind, days, deviceRedemptions) {
  const all = Array.isArray(deviceRedemptions) ? deviceRedemptions : []
  const active = all.filter((r) => ivdGiftRedemptionActive(r, kind))
  if (active.length) {
    const latest = active
      .map((r) => (r.grant_until ? Date.parse(r.grant_until) : Infinity))
      .filter(Number.isFinite)
    const max = latest.length ? Math.max(...latest) : NaN
    return {
      text: Number.isFinite(max) ? ivdFormatGiftAdminDate(new Date(max).toISOString()) : 'Lifetime',
      title: 'Latest active grant',
    }
  }
  if (kind === 'lifetime') return { text: 'Never', title: 'Lifetime — not redeemed yet' }
  const exp = ivdComputeGrantExpiration(kind, days)
  return { text: ivdFormatGiftAdminDate(exp), title: 'If redeemed today' }
}

function ivdGiftRevokeCellHtml(deviceRedemptions, kind) {
  const buttons = (Array.isArray(deviceRedemptions) ? deviceRedemptions : [])
    .filter((r) => ivdGiftRedemptionActive(r, kind))
    .map(
      (r) =>
        `<button type="button" class="admin__btn admin__btn--outline admin__btn--sm yt-gift-revoke ivd-gift-revoke" data-redemption-id="${ivdEscapeHtml(r.id || '')}" title="Revoke ${ivdEscapeHtml(ivdGiftDeviceRedemptionLabel(r))}">Revoke</button>`,
    )
  return buttons.length ? `<div class="yt-gift-revoke-list">${buttons.join('')}</div>` : '—'
}

async function ivdLoadGifts() {
  return ivdFetchJson(
    `${ivdRest('ivd_gift_codes')}?select=*,ivd_gift_device_redemptions(id,device_id,redeemed_at,grant_until)&order=created_at.desc`,
    { headers: ivdHeaders() },
  )
}

function ivdRenderGifts(rows) {
  const body = document.getElementById('ivd-gifts-body')
  if (!body) return
  ivdGiftCache = Array.isArray(rows) ? rows : []
  body.innerHTML = ivdGiftCache
    .map((row) => {
      const deviceRedemptions = Array.isArray(row.ivd_gift_device_redemptions)
        ? row.ivd_gift_device_redemptions
        : []
      const redeemedLabels = deviceRedemptions.map((r) => ivdGiftDeviceRedemptionLabel(r)).filter((l) => l !== '—')
      const redeemedBy = redeemedLabels.join(', ')
      const redemptionCount = deviceRedemptions.length
      const emailsCell =
        redemptionCount > 0
          ? `<button type="button" class="yt-gift-emails-btn ivd-gift-emails-btn" data-gift-id="${ivdEscapeHtml(row.id || '')}" title="View redemptions">${ivdEscapeHtml(redeemedBy || `${redemptionCount} redemption(s)`)}</button>`
          : '—'
      const kind = row.kind === 'lifetime' ? 'lifetime' : row.kind === 'months' ? 'months' : 'days'
      const days = Number(row.duration_days) || 0
      const max = Number(row.max_redemptions) || 1
      const used = Number(row.redemption_count) || 0
      const requiresLogin = Boolean(row.requires_login)
      const name = ivdNormalizeGiftName(row.code)
      const createdAt = ivdFormatGiftAdminDate(row.created_at)
      const expiration = ivdGiftExpirationDisplay(kind, days, deviceRedemptions)
      return `<tr data-gift-id="${ivdEscapeHtml(row.id || '')}">
        <td>
          <div class="yt-gift-code-wrap">
            <input type="text" class="admin__users-search yt-gift-code-input" value="${ivdEscapeHtml(name)}" spellcheck="false" autocomplete="off" />
            <button type="button" class="admin__btn admin__btn--outline admin__btn--sm yt-gift-copy ivd-gift-copy" title="Copy ${ivdEscapeHtml(name)}" aria-label="Copy ${ivdEscapeHtml(name)}">
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
        <td><input type="text" class="admin__users-search yt-gift-note-input" value="${ivdEscapeHtml(row.note || '')}" /></td>
        <td><input type="checkbox" class="yt-gift-requires-login-input"${requiresLogin ? ' checked' : ''} /></td>
        <td title="${ivdEscapeHtml(row.created_at || '')}">${ivdEscapeHtml(createdAt)}</td>
        <td title="${ivdEscapeHtml(expiration.title)}">${ivdEscapeHtml(expiration.text)}</td>
        <td>${emailsCell}</td>
        <td>${ivdGiftRevokeCellHtml(deviceRedemptions, kind)}</td>
        <td><button type="button" class="admin__btn admin__btn--outline admin__btn--sm yt-gift-save ivd-gift-save">Save</button></td>
        <td><button type="button" class="admin__btn admin__btn--outline admin__btn--sm yt-gift-delete ivd-gift-delete" aria-label="Delete ${ivdEscapeHtml(row.code)}"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v10h-2V9zm4 0h2v10h-2V9zM7 9h2v10H7V9z"/></svg></button></td>
      </tr>`
    })
    .join('')
}

function ivdUpdateGiftExpirationPreview() {
  const kind = String(document.getElementById('ivd-gift-kind')?.value || 'days')
  const duration = Number(document.getElementById('ivd-gift-days')?.value || 1)
  const label = document.getElementById('ivd-gift-duration-label')
  const input = document.getElementById('ivd-gift-days')
  const preview = document.getElementById('ivd-gift-expiration-preview')
  if (label) label.textContent = kind === 'months' ? 'Months' : kind === 'lifetime' ? 'Duration' : 'Days'
  if (input) {
    input.disabled = kind === 'lifetime'
    if (kind === 'lifetime') input.value = '0'
  }
  if (preview) {
    if (kind === 'lifetime') preview.textContent = 'Lifetime access when redeemed.'
    else {
      const exp = ivdComputeGrantExpiration(kind, duration)
      preview.textContent = exp
        ? `If redeemed today, access until ${ivdFormatGiftAdminDate(exp)} (UTC).`
        : ''
    }
  }
}

async function ivdRefreshGifts() {
  if (!ivdAnonKey()) {
    ivdToast('Missing IVD Supabase anon key.', 'error')
    return
  }
  try {
    const gifts = await ivdLoadGifts()
    ivdRenderGifts(Array.isArray(gifts) ? gifts : [])
  } catch (err) {
    ivdToast(
      (err instanceof Error ? err.message : String(err)) +
        (/relation|table/i.test(String(err)) ? ' Run scripts/ivd_billing_all.sql in Supabase.' : ''),
      'error',
    )
  }
}

async function ivdRevokeGiftRedemption(redemptionId) {
  const row = await ivdFetchJson(`${ivdRest('rpc/ivd_admin_revoke_gift_redemption')}`, {
    method: 'POST',
    headers: ivdHeaders(),
    body: JSON.stringify({ p_redemption_id: redemptionId, p_source: 'device' }),
  })
  if (row && row.ok === false) throw new Error(row.error || 'revoke_failed')
  return row
}

async function ivdHandleGiftRevokeClick(btn) {
  const redemptionId = btn.dataset.redemptionId
  if (!redemptionId) return
  if (!window.confirm('Revoke this redemption? The device will lose Pro access from this code.')) return
  btn.disabled = true
  try {
    await ivdRevokeGiftRedemption(redemptionId)
    ivdToast('Redemption revoked.', 'success')
    const giftId = ivdGiftModalId || btn.closest('[data-gift-id]')?.dataset.giftId || ''
    await ivdRefreshGifts()
    if (giftId && !document.getElementById('ivd-gift-redemptions-modal')?.hidden) {
      ivdOpenGiftRedemptionsModal(giftId)
    }
  } catch (err) {
    ivdToast(err instanceof Error ? err.message : String(err), 'error')
  } finally {
    btn.disabled = false
  }
}

function ivdCloseGiftRedemptionsModal() {
  ivdGiftModalId = null
  const modal = document.getElementById('ivd-gift-redemptions-modal')
  if (modal) modal.hidden = true
}

function ivdOpenGiftRedemptionsModal(giftId) {
  const giftRow = ivdGiftCache.find((r) => String(r.id) === String(giftId))
  const modal = document.getElementById('ivd-gift-redemptions-modal')
  const title = document.getElementById('ivd-gift-redemptions-title')
  const body = document.getElementById('ivd-gift-redemptions-body')
  if (!modal || !title || !body || !giftRow) return
  ivdGiftModalId = giftId
  title.textContent = `${ivdNormalizeGiftName(giftRow.code)} — redemptions`
  const deviceRows = (Array.isArray(giftRow.ivd_gift_device_redemptions)
    ? giftRow.ivd_gift_device_redemptions
    : []
  ).map((r) => {
    const active = ivdGiftRedemptionActive(r, giftRow.kind)
    return `<tr>
      <td title="${ivdEscapeHtml(r.device_id || '')}">${ivdEscapeHtml(ivdGiftDeviceRedemptionLabel(r))}</td>
      <td>${ivdEscapeHtml(ivdFormatGiftAdminDate(r.redeemed_at))}</td>
      <td>${active && !r.grant_until ? 'Lifetime' : ivdEscapeHtml(ivdFormatGiftAdminDate(r.grant_until))}</td>
      <td>${active ? 'Active' : 'Expired'}</td>
      <td>${active ? `<button type="button" class="admin__btn admin__btn--outline admin__btn--sm yt-gift-revoke ivd-gift-revoke" data-redemption-id="${ivdEscapeHtml(r.id || '')}">Revoke</button>` : '—'}</td>
    </tr>`
  })
  body.innerHTML = deviceRows.length
    ? `<div class="admin__users-table-wrap"><table class="admin__users-table"><thead><tr><th>device</th><th>redeemed</th><th>grant until</th><th>status</th><th>revoke</th></tr></thead><tbody>${deviceRows.join('')}</tbody></table></div>`
    : '<p class="admin__status admin__status--empty">No redemptions yet.</p>'
  modal.hidden = false
}

async function ivdCreateGift(event) {
  event.preventDefault()
  const kind = String(document.getElementById('ivd-gift-kind')?.value || 'days')
  const days = Number(document.getElementById('ivd-gift-days')?.value || 60)
  const max = Number(document.getElementById('ivd-gift-max')?.value || 1)
  const note = String(document.getElementById('ivd-gift-note')?.value || '').trim()
  const requiresLogin = Boolean(document.getElementById('ivd-gift-requires-login')?.checked)
  const nameInput = document.getElementById('ivd-gift-name')
  const code = ivdNormalizeGiftName(nameInput?.value)
  if (!code) {
    ivdToast('Enter a gift code name.', 'error')
    return
  }
  if (ivdGiftNameTaken(code)) {
    ivdToast('That gift name is already in use.', 'error')
    return
  }
  try {
    await ivdFetchJson(ivdRest('ivd_gift_codes'), {
      method: 'POST',
      headers: ivdHeaders(),
      body: JSON.stringify({
        code,
        kind,
        duration_days: kind === 'lifetime' ? 0 : Math.max(1, days),
        max_redemptions: Math.max(1, max),
        requires_login: requiresLogin,
        note: note || null,
      }),
    })
    ivdToast(`Created ${code}`, 'success')
    if (nameInput) nameInput.value = ''
    await ivdRefreshGifts()
  } catch (err) {
    ivdToast(err instanceof Error ? err.message : String(err), 'error')
  }
}

function ivdLicenseCheckSetStatus(message, type) {
  const el = document.getElementById('ivd-license-check-status')
  if (!el) return
  el.hidden = !message
  el.textContent = message || ''
  el.classList.toggle('admin__status--error', type === 'error')
}

async function ivdCheckLicenseKey() {
  const input = document.getElementById('ivd-license-check-input')
  const live = document.getElementById('ivd-license-check-live')
  const btn = document.getElementById('ivd-license-check-btn')
  const key = String(input?.value || '').trim()
  if (!key) {
    ivdLicenseCheckSetStatus('Enter a license key or gift code.', 'error')
    return
  }
  ivdLicenseCheckSetStatus('Checking…', 'empty')
  const summaryEl = document.getElementById('ivd-license-check-summary')
  const jsonEl = document.getElementById('ivd-license-check-json')
  if (summaryEl) summaryEl.hidden = true
  if (jsonEl) jsonEl.hidden = true
  if (btn) btn.disabled = true

  try {
    const result = { input: key }
    const normalizedGift = ivdNormalizeGiftName(key)
    if (/^IVD-/i.test(key.replace(/\s+/g, ''))) {
      const licenseKey = key.replace(/\s+/g, '').trim()
      const pending = await ivdFetchJson(
        `${ivdRest('ivd_stripe_license_pending')}?license_key=eq.${encodeURIComponent(licenseKey)}&select=*`,
        { headers: ivdHeaders() },
      )
      const devices = await ivdFetchJson(
        `${ivdRest('ivd_stripe_license_device_grants')}?license_key=eq.${encodeURIComponent(licenseKey)}&select=*`,
        { headers: ivdHeaders() },
      )
      result.kind = 'stripe_license'
      result.pending = pending
      result.device_grants = devices
      if (live?.checked) {
        try {
          const syncRes = await fetch(ivdFunctionsUrl('ivd-stripe-license-sync'), {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${ivdAnonKey()}`,
              apikey: ivdAnonKey(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              device_id: 'admin-check',
              license_key: licenseKey,
              refresh_live: true,
            }),
          })
          result.live_sync = await syncRes.json()
        } catch (e) {
          result.live_sync_error = e instanceof Error ? e.message : String(e)
        }
      }
    } else {
      const gifts = await ivdFetchJson(
        `${ivdRest('ivd_gift_codes')}?code=eq.${encodeURIComponent(normalizedGift)}&select=*,ivd_gift_device_redemptions(*)`,
        { headers: ivdHeaders() },
      )
      result.kind = 'gift'
      result.gift = gifts
    }
    if (summaryEl) {
      const pending = Array.isArray(result.pending) ? result.pending[0] : null
      const gift = Array.isArray(result.gift) ? result.gift[0] : null
      summaryEl.innerHTML = `<p><strong>${ivdEscapeHtml(result.kind === 'stripe_license' ? 'Stripe license' : 'Gift code')}</strong></p>
        ${
          pending
            ? `<p>Status: ${ivdEscapeHtml(pending.status || '—')} · Test: ${pending.test_mode ? 'yes' : 'no'}</p>`
            : ''
        }
        ${
          gift
            ? `<p>Kind: ${ivdEscapeHtml(gift.kind)} · Used: ${Number(gift.redemption_count) || 0}/${Number(gift.max_redemptions) || 1}</p>`
            : !pending
              ? '<p class="admin__copy-hint">No matching record found.</p>'
              : ''
        }`
      summaryEl.hidden = false
    }
    if (jsonEl) {
      jsonEl.textContent = JSON.stringify(result, null, 2)
      jsonEl.hidden = false
    }
    ivdLicenseCheckSetStatus('', 'empty')
  } catch (err) {
    ivdLicenseCheckSetStatus(err instanceof Error ? err.message : String(err), 'error')
  } finally {
    if (btn) btn.disabled = false
  }
}

function ivdUpdateSupabaseLabel() {
  const el = document.getElementById('ivd-supabase-url-label')
  if (el) el.textContent = ivdSupabaseUrl() || 'Supabase: not configured'
}

function ivdInit() {
  if (ivdInitDone) return
  ivdInitDone = true
  ivdUpdateSupabaseLabel()

  document.getElementById('ivd-gifts-refresh')?.addEventListener('click', () => void ivdRefreshGifts())
  document.getElementById('ivd-gifts-form')?.addEventListener('submit', ivdCreateGift)
  document.getElementById('ivd-gift-kind')?.addEventListener('change', ivdUpdateGiftExpirationPreview)
  document.getElementById('ivd-gift-days')?.addEventListener('input', ivdUpdateGiftExpirationPreview)
  document.getElementById('ivd-license-check-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
    void ivdCheckLicenseKey()
  })
  ivdUpdateGiftExpirationPreview()

  document.getElementById('ivd-gifts-body')?.addEventListener('change', (event) => {
    const kindSel = event.target.closest('.yt-gift-kind-input')
    if (!kindSel) return
    const tr = kindSel.closest('tr')
    const daysInput = tr?.querySelector('.yt-gift-days-input')
    if (daysInput) daysInput.disabled = kindSel.value === 'lifetime'
  })

  document.getElementById('ivd-gifts-body')?.addEventListener('click', (event) => {
    const revokeBtn = event.target.closest('.ivd-gift-revoke')
    if (revokeBtn) {
      void ivdHandleGiftRevokeClick(revokeBtn)
      return
    }
    const emailsBtn = event.target.closest('.ivd-gift-emails-btn')
    if (emailsBtn?.dataset.giftId) {
      ivdOpenGiftRedemptionsModal(emailsBtn.dataset.giftId)
      return
    }
    const copyBtn = event.target.closest('.ivd-gift-copy')
    if (copyBtn) {
      const tr = copyBtn.closest('[data-gift-id]')
      const code = ivdNormalizeGiftName(tr?.querySelector('.yt-gift-code-input')?.value)
      if (!code) return
      void navigator.clipboard.writeText(code).then(() => ivdToast(`Copied ${code}`, 'success'))
      return
    }
    const saveBtn = event.target.closest('.ivd-gift-save')
    const deleteBtn = event.target.closest('.ivd-gift-delete')
    const tr = event.target.closest('tr')
    const id = tr?.dataset.giftId
    if (!tr || !id) return
    if (saveBtn) {
      const nameInput = tr.querySelector('.yt-gift-code-input')
      const code = ivdNormalizeGiftName(nameInput?.value)
      if (!code) return
      if (ivdGiftNameTaken(code, id)) {
        ivdToast('That gift name is already in use.', 'error')
        return
      }
      const kind = String(tr.querySelector('.yt-gift-kind-input')?.value || 'days')
      const days = Number(tr.querySelector('.yt-gift-days-input')?.value || 0)
      const max = Number(tr.querySelector('.yt-gift-max-input')?.value || 1)
      const note = String(tr.querySelector('.yt-gift-note-input')?.value || '').trim()
      const requiresLogin = Boolean(tr.querySelector('.yt-gift-requires-login-input')?.checked)
      saveBtn.disabled = true
      void ivdFetchJson(`${ivdRest('ivd_gift_codes')}?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: ivdHeaders(),
        body: JSON.stringify({
          code,
          kind,
          duration_days: kind === 'lifetime' ? 0 : Math.max(1, days),
          max_redemptions: Math.max(1, max),
          requires_login: requiresLogin,
          note: note || null,
        }),
      })
        .then(() => {
          ivdToast('Gift code saved.', 'success')
          return ivdRefreshGifts()
        })
        .catch((err) => ivdToast(err instanceof Error ? err.message : String(err), 'error'))
        .finally(() => {
          saveBtn.disabled = false
        })
      return
    }
    if (deleteBtn) {
      if (!window.confirm('Delete this gift code? This cannot be undone.')) return
      deleteBtn.disabled = true
      void ivdFetchJson(`${ivdRest('ivd_gift_codes')}?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: ivdHeaders(),
      })
        .then(() => {
          ivdToast('Gift code deleted.', 'success')
          return ivdRefreshGifts()
        })
        .catch((err) => ivdToast(err instanceof Error ? err.message : String(err), 'error'))
        .finally(() => {
          deleteBtn.disabled = false
        })
    }
  })

  document.getElementById('ivd-gift-redemptions-modal-backdrop')?.addEventListener('click', ivdCloseGiftRedemptionsModal)
  document.getElementById('ivd-gift-redemptions-modal-close')?.addEventListener('click', ivdCloseGiftRedemptionsModal)
  document.getElementById('ivd-gift-redemptions-body')?.addEventListener('click', (event) => {
    const btn = event.target.closest('.ivd-gift-revoke')
    if (btn) void ivdHandleGiftRevokeClick(btn)
  })
}

window.IvdAdminAccounts = {
  init: ivdInit,
  renderGifts: ivdRefreshGifts,
  updateSupabaseLabel: ivdUpdateSupabaseLabel,
}

document.addEventListener('DOMContentLoaded', ivdInit)
if (document.readyState !== 'loading') ivdInit()
