/* global SUPABASE_URL, SUPABASE_ANON_KEY, Toastify */

;(function () {
  'use strict'

  const PRODUCTS = {
    yfp: {
      id: 'yfp',
      label: 'YouTube Filter Pro',
      stripePrefix: /^YFP-/i,
      giftNormalize: (v) =>
        String(v || '')
          .trim()
          .toUpperCase()
          .replace(/\s+/g, '-'),
    },
    ivd: {
      id: 'ivd',
      label: 'IG Reels Insight',
      stripePrefix: /^IVD-(?!GIFT)/i,
      giftNormalize: (v) =>
        String(v || '')
          .trim()
          .toUpperCase()
          .replace(/\s+/g, '-'),
    },
    idme: {
      id: 'idme',
      label: 'IG DM Exporter',
      stripePrefix: /^IDME-/i,
      giftNormalize: (v) =>
        String(v || '')
          .trim()
          .toUpperCase()
          .replace(/\s+/g, '-'),
    },
    ge: {
      id: 'ge',
      label: 'Gmail Exporter',
      stripePrefix: /^GE-/i,
      giftNormalize: (v) =>
        String(v || '')
          .trim()
          .toUpperCase()
          .replace(/\s+/g, '-'),
    },
    isp: {
      id: 'isp',
      label: 'IG Saved Posts',
      stripePrefix: null,
      giftNormalize: (v) =>
        String(v || '')
          .trim()
          .toUpperCase()
          .replace(/\s+/g, '-'),
    },
  }

  const PRODUCT_ORDER = ['yfp', 'ivd', 'idme', 'ge', 'isp']

  let lcInitDone = false

  function lcEscapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function lcFormatIso(value) {
    const ms = Date.parse(String(value || ''))
    if (!Number.isFinite(ms)) return '—'
    return new Date(ms).toLocaleString()
  }

  function lcYfpUrl() {
    return String(window.SUPABASE_URL || SUPABASE_URL || '').replace(/\/+$/, '')
  }

  function lcYfpKey() {
    return String(window.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY || '').trim()
  }

  function lcV2Url() {
    return String(
      window.GE_SUPABASE_URL || window.IVD_SUPABASE_URL || 'https://kthoejkvaattozbkszcq.supabase.co',
    ).replace(/\/+$/, '')
  }

  function lcV2Key() {
    return String(
      window.GE_SUPABASE_ANON_KEY ||
        window.IVD_SUPABASE_ANON_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aG9lamt2YWF0dG96YmtzemNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2Mzc2OTcsImV4cCI6MjEwNjIxMzY5N30.M2KILcdIT8w5btv9MSLeCfqdaSHLWah7NM8Tf0s_HN8',
    ).trim()
  }

  function lcSupabaseForProduct(productId) {
    if (productId === 'yfp' || productId === 'idme') {
      return { url: lcYfpUrl(), key: lcYfpKey() }
    }
    return { url: lcV2Url(), key: lcV2Key() }
  }

  function lcHeaders(key) {
    return {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }
  }

  async function lcFetchJson(url, headers) {
    const res = await fetch(url, { headers })
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

  async function lcFetchOptional(url, headers) {
    try {
      const data = await lcFetchJson(url, headers)
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  async function lcPostEdge(baseUrl, anonKey, name, body) {
    const res = await fetch(`${baseUrl}/functions/v1/${name}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    let json = null
    try {
      json = await res.json()
    } catch {
      json = null
    }
    return { ok: res.ok, status: res.status, json }
  }

  function lcRest(baseUrl, path) {
    return `${baseUrl}/rest/v1/${path}`
  }

  function lcSetStatus(message, type) {
    const el = document.getElementById('license-check-status')
    if (!el) return
    const text = String(message || '').trim()
    el.hidden = !text
    el.textContent = text
    el.classList.toggle('admin__status--error', type === 'error')
    el.classList.toggle('admin__status--empty', type === 'empty')
  }

  function lcSelectedProduct() {
    const value = String(document.getElementById('license-check-product')?.value || 'auto')
    if (value === 'auto' || !PRODUCTS[value]) return 'auto'
    return value
  }

  function lcDetectProductFromKey(rawKey) {
    const key = String(rawKey || '').replace(/\s+/g, '').trim()
    if (!key) return null
    for (const id of PRODUCT_ORDER) {
      const p = PRODUCTS[id]
      if (p.stripePrefix && p.stripePrefix.test(key)) return id
    }
    if (/^IVD-GIFT-/i.test(key)) return 'ivd'
    return null
  }

  function lcResolveProductOrder(productSel, detected) {
    if (productSel !== 'auto') return [productSel]
    if (detected) {
      return [detected, ...PRODUCT_ORDER.filter((id) => id !== detected)]
    }
    return PRODUCT_ORDER.slice()
  }

  function lcGrantActive(row) {
    if (!row) return false
    if (row.is_lifetime === true) return true
    const until = Date.parse(String(row.grant_until || ''))
    if (!Number.isFinite(until)) return true
    return until > Date.now()
  }

  function lcFlattenForSummary(obj, prefix = '') {
    const rows = []
    if (!obj || typeof obj !== 'object') return rows
    for (const [key, value] of Object.entries(obj)) {
      const label = prefix ? `${prefix}.${key}` : key
      if (value === null || value === undefined) {
        rows.push([label, '—'])
      } else if (Array.isArray(value)) {
        rows.push([label, value.length ? `${value.length} item(s) — see JSON below` : '[]'])
      } else if (typeof value === 'object') {
        rows.push(...lcFlattenForSummary(value, label))
      } else {
        rows.push([label, String(value)])
      }
    }
    return rows
  }

  function lcRenderYfpEdgeResult(json, productLabel) {
    const valid = Boolean(json.valid)
    const found = Boolean(json.found)
    const provider = String(json.provider || json.result?.provider || '—')
    const note = String(json.valid_note || json.result?.valid_note || json.message || '')

    let badgeClass = 'admin__license-badge--bad'
    let badgeText = 'Not valid'
    if (!found) {
      badgeClass = 'admin__license-badge--muted'
      badgeText = 'Not found'
    } else if (valid) {
      badgeClass = 'admin__license-badge--ok'
      badgeText = 'Valid'
    }

    const flatSource = json.result || json
    const rows = lcFlattenForSummary(
      flatSource.pending || flatSource.gift || json.lemon_validate_orphan || {},
    )
    const lemon = flatSource.lemon_validate
    if (lemon && typeof lemon === 'object') {
      rows.push(...lcFlattenForSummary(lemon, 'lemon'))
    }
    const subLive = flatSource.subscription_live
    if (subLive && typeof subLive === 'object') {
      rows.push(...lcFlattenForSummary(subLive, 'stripe_subscription'))
    }
    if (flatSource.pending?.created_at) {
      rows.unshift(['created_at', lcFormatIso(flatSource.pending.created_at)])
    }
    if (flatSource.pending?.email || flatSource.lemon_validate?.customer_email) {
      rows.unshift([
        'email',
        String(flatSource.pending?.email || flatSource.lemon_validate?.customer_email),
      ])
    }
    if (flatSource.pending?.license_key) {
      rows.unshift(['license_key', String(flatSource.pending.license_key)])
    }

    return { badgeClass, badgeText, provider, note, rows, json, productLabel }
  }

  function lcMakeGenericPayload(productId, provider, found, valid, note, raw, extraRows = []) {
    const p = PRODUCTS[productId]
    let badgeClass = 'admin__license-badge--bad'
    let badgeText = 'Not valid'
    if (!found) {
      badgeClass = 'admin__license-badge--muted'
      badgeText = 'Not found'
    } else if (valid) {
      badgeClass = 'admin__license-badge--ok'
      badgeText = 'Valid'
    }
    const tableRows = extraRows
      .map(
        ([label, value]) =>
          `<tr><th scope="row">${lcEscapeHtml(label)}</th><td>${lcEscapeHtml(value)}</td></tr>`,
      )
      .join('')
    const html = `
      <div class="admin__license-badges">
        <span class="admin__license-badge admin__license-badge--provider">${lcEscapeHtml(p.label)}</span>
        <span class="admin__license-badge ${badgeClass}">${lcEscapeHtml(badgeText)}</span>
        <span class="admin__license-badge admin__license-badge--provider">${lcEscapeHtml(provider)}</span>
      </div>
      ${note ? `<p class="admin__copy-hint">${lcEscapeHtml(note)}</p>` : ''}
      ${
        tableRows
          ? `<table class="admin__users-table admin__license-table"><tbody>${tableRows}</tbody></table>`
          : ''
      }
    `
    return { kind: 'generic', html, raw, found }
  }

  function lcRenderSummary(payload) {
    const summaryEl = document.getElementById('license-check-summary')
    const jsonEl = document.getElementById('license-check-json')
    if (!summaryEl || !jsonEl) return

    if (payload.kind === 'yfp-edge') {
      const label =
        payload.productLabel ||
        String(payload.json?.result?.lemon_validate?.product_name || PRODUCTS.yfp.label)
      const r = lcRenderYfpEdgeResult(payload.json, label)
      const tableRows = r.rows
        .map(
          ([labelKey, value]) =>
            `<tr><th scope="row">${lcEscapeHtml(labelKey)}</th><td>${lcEscapeHtml(value)}</td></tr>`,
        )
        .join('')
      summaryEl.innerHTML = `
        <div class="admin__license-badges">
          <span class="admin__license-badge admin__license-badge--provider">${lcEscapeHtml(r.productLabel || PRODUCTS.yfp.label)}</span>
          <span class="admin__license-badge ${r.badgeClass}">${lcEscapeHtml(r.badgeText)}</span>
          <span class="admin__license-badge admin__license-badge--provider">${lcEscapeHtml(r.provider)}</span>
        </div>
        ${r.note ? `<p class="admin__copy-hint">${lcEscapeHtml(r.note)}</p>` : ''}
        ${
          tableRows
            ? `<table class="admin__users-table admin__license-table"><tbody>${tableRows}</tbody></table>`
            : ''
        }
      `
      jsonEl.textContent = JSON.stringify(r.json, null, 2)
      summaryEl.hidden = false
      jsonEl.hidden = false
      return
    }

    summaryEl.innerHTML = payload.html || ''
    jsonEl.textContent = JSON.stringify(payload.raw, null, 2)
    summaryEl.hidden = !payload.html
    jsonEl.hidden = false
  }

  async function lcYfpAdminCheck(body) {
    const res = await fetch(`${lcYfpUrl()}/functions/v1/admin-license-check`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${lcYfpKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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

  async function lcCheckGift(productId, code) {
    const p = PRODUCTS[productId]
    const normalized = p.giftNormalize(code)
    const result = { product: productId, kind: 'gift', code: normalized }

    if (productId === 'yfp') {
      const gifts = await lcFetchJson(
        `${lcRest(lcYfpUrl(), 'yt_filter_pro_gift_codes')}?code=eq.${encodeURIComponent(normalized)}&select=*,yt_filter_pro_gift_redemptions(id,user_id,email,redeemed_at,grant_until),yt_filter_pro_gift_device_redemptions(id,device_id,redeemed_at,grant_until)`,
        lcHeaders(lcYfpKey()),
      )
      result.gift = gifts
      const gift = Array.isArray(gifts) ? gifts[0] : null
      if (!gift) return { found: false }
      const used = Number(gift.redemption_count) || 0
      const max = Number(gift.max_redemptions) || 1
      return lcMakeGenericPayload(
        productId,
        'Gift',
        true,
        used < max,
        used >= max ? 'Gift code exists but is fully redeemed.' : 'Gift code is valid (not fully redeemed).',
        result,
        [
          ['code', normalized],
          ['kind', String(gift.kind || '—')],
          ['used', `${used}/${max}`],
        ],
      )
    }

    const tableMap = {
      ivd: { table: 'ivd_gift_codes', redemptions: 'ivd_gift_device_redemptions' },
      ge: { table: 'ge_gift_codes', redemptions: 'ge_gift_device_redemptions' },
      idme: { table: 'idme_gift_codes', redemptions: 'idme_gift_device_redemptions' },
      isp: { table: 'isp_gift_codes', redemptions: 'isp_gift_device_redemptions' },
    }
    const cfg = tableMap[productId]
    if (!cfg) return { found: false }

    const { url, key } = lcSupabaseForProduct(productId)
    const gifts = await lcFetchJson(
      `${lcRest(url, cfg.table)}?code=eq.${encodeURIComponent(normalized)}&select=*,${cfg.redemptions}(*)`,
      lcHeaders(key),
    )
    result.gift = gifts
    const gift = Array.isArray(gifts) ? gifts[0] : null
    if (!gift) return { found: false }
    const used = Number(gift.redemption_count) || 0
    const max = Number(gift.max_redemptions) || 1
    return lcMakeGenericPayload(
      productId,
      'Gift',
      true,
      used < max,
      used >= max ? 'Gift code exists but is fully redeemed.' : 'Gift code is valid (not fully redeemed).',
      result,
      [
        ['code', normalized],
        ['kind', String(gift.kind || '—')],
        ['used', `${used}/${max}`],
      ],
    )
  }

  async function lcCheckLemonPending(productId, licenseKey) {
    const tableMap = {
      ge: 'ge_license_pending',
      idme: 'idme_license_pending',
    }
    const table = tableMap[productId]
    if (!table) return { found: false }

    const { url, key } = lcSupabaseForProduct(productId)
    const rows = await lcFetchOptional(
      `${lcRest(url, table)}?license_key=eq.${encodeURIComponent(licenseKey)}&select=*`,
      lcHeaders(key),
    )
    if (!rows.ok) return { found: false, raw: { error: rows.error } }
    const row = Array.isArray(rows.data) ? rows.data[0] : null
    if (!row) return { found: false, raw: { pending: [] } }
    const status = String(row.status || '').toLowerCase()
    const valid = status === 'activated' || status === 'pending'
    return lcMakeGenericPayload(
      productId,
      'Lemon',
      true,
      valid,
      `Lemon pending status: ${row.status || '—'}`,
      { product: productId, pending: rows.data },
      [
        ['license_key', String(row.license_key || licenseKey)],
        ['email', String(row.email || '—')],
        ['lifetime', row.is_lifetime ? 'yes' : 'no'],
      ],
    )
  }

  async function lcCheckDeviceGrants(productId, prefix, licenseKey) {
    const { url, key } = lcSupabaseForProduct(productId)
    const headers = lcHeaders(key)
    const q = encodeURIComponent(licenseKey)
    const grantsByKey = await lcFetchOptional(
      `${lcRest(url, `${prefix}_license_device_grants`)}?license_key=eq.${q}&select=*`,
      headers,
    )
    let grants = grantsByKey.ok && Array.isArray(grantsByKey.data) ? grantsByKey.data : []
    if (!grants.length) {
      const grantsByLemon = await lcFetchOptional(
        `${lcRest(url, `${prefix}_license_device_grants`)}?lemon_license_id=eq.${q}&select=*`,
        headers,
      )
      if (grantsByLemon.ok && Array.isArray(grantsByLemon.data)) grants = grantsByLemon.data
    }
    if (!grants.length) return { found: false, raw: { device_grants: [], errors: [grantsByKey.error].filter(Boolean) } }
    const active = grants.filter(lcGrantActive)
    const row = active[0] || grants[0]
    const provider =
      String(row.lemon_status || '').toLowerCase() === 'gift'
        ? 'Gift (activated)'
        : row.lemon_status
          ? 'Lemon'
          : 'License grant'
    return lcMakeGenericPayload(
      productId,
      provider,
      true,
      active.length > 0,
      active.length
        ? 'Active device grant(s) found.'
        : 'Grant record exists but appears expired.',
      { product: productId, device_grants: grants },
      [
        ['license_key', String(row.license_key || licenseKey)],
        ['customer_email', String(row.customer_email || '—')],
        ['grant_until', lcFormatIso(row.grant_until)],
        ['devices', String(grants.length)],
      ],
    )
  }

  async function lcCheckStripeSync(productId, licenseKey, refreshLive) {
    const syncMap = {
      idme: { base: lcYfpUrl(), key: lcYfpKey(), fn: 'idme-stripe-license-sync' },
      ivd: { base: lcV2Url(), key: lcV2Key(), fn: 'ivd-stripe-license-sync' },
    }
    const cfg = syncMap[productId]
    if (!cfg) return { found: false }
    const result = { product: productId, kind: 'stripe_sync', license_key: licenseKey }
    const pendingTable =
      productId === 'idme' ? 'idme_stripe_license_pending' : 'ivd_stripe_license_pending'
    const grantsTable =
      productId === 'idme' ? 'idme_stripe_license_device_grants' : 'ivd_stripe_license_device_grants'
    const pending = await lcFetchOptional(
      `${lcRest(cfg.base, pendingTable)}?license_key=eq.${encodeURIComponent(licenseKey)}&select=*`,
      lcHeaders(cfg.key),
    )
    const devices = await lcFetchOptional(
      `${lcRest(cfg.base, grantsTable)}?license_key=eq.${encodeURIComponent(licenseKey)}&select=*`,
      lcHeaders(cfg.key),
    )
    result.pending = pending.ok ? pending.data : { error: pending.error }
    result.device_grants = devices.ok ? devices.data : { error: devices.error }
    if (refreshLive) {
      const edge = await lcPostEdge(cfg.base, cfg.key, cfg.fn, {
        device_id: 'admin-check',
        license_key: licenseKey,
        refresh_live: true,
      })
      result.live_sync = edge.json
      result.live_sync_http = edge.status
    }
    const pendingRow = pending.ok && Array.isArray(pending.data) ? pending.data[0] : null
    const grantRows = devices.ok && Array.isArray(devices.data) ? devices.data : []
    const live = result.live_sync
    const liveValid =
      live &&
      (live.valid === true ||
        live.grant ||
        live.subscription ||
        String(live.status || '').toLowerCase() === 'active')
    const found = Boolean(pendingRow || grantRows.length || liveValid)
    const status = pendingRow?.status || live?.status || (grantRows.length ? 'activated' : '—')
    const valid =
      liveValid ||
      String(status).toLowerCase() === 'activated' ||
      String(status).toLowerCase() === 'active' ||
      grantRows.some(lcGrantActive)
    return lcMakeGenericPayload(
      productId,
      'Stripe',
      found,
      valid,
      found
        ? `Stripe license record${refreshLive ? ' (live sync attempted)' : ''}.`
        : 'No Stripe license record in Supabase.',
      result,
      [
        ['license_key', licenseKey],
        ['status', String(status)],
        ['device_activations', String(grantRows.length)],
        ['email', String(pendingRow?.email || live?.email || '—')],
      ],
    )
  }

  async function lcCheckProductLicense(productId, key, compact, refreshLive) {
    const p = PRODUCTS[productId]
    if (!p) return { found: false }

    if (productId === 'yfp') {
      const json = await lcYfpAdminCheck({ license_key: key, refresh_live: refreshLive })
      if (json.found) return { kind: 'yfp-edge', json, productLabel: p.label }
      return { found: false }
    }

    if (productId === 'idme' || productId === 'ge') {
      const prefix = productId === 'ge' ? 'ge' : 'idme'
      const grantHit = await lcCheckDeviceGrants(productId, prefix, key)
      if (grantHit.found) return grantHit
      const lemonHit = await lcCheckLemonPending(productId, key)
      if (lemonHit.found) return lemonHit
    }

    if (productId === 'isp') {
      const grantHit = await lcCheckDeviceGrants(productId, 'isp', key)
      if (grantHit.found) return grantHit
    }

    if (productId === 'idme' && /^IDME-/i.test(compact)) {
      const stripeHit = await lcCheckStripeSync('idme', compact, refreshLive)
      if (stripeHit.found) return stripeHit
    }

    if (productId === 'ivd') {
      if (/^IVD-/i.test(compact) && !/^IVD-GIFT-/i.test(compact)) {
        const stripeHit = await lcCheckStripeSync('ivd', compact, refreshLive)
        if (stripeHit.found) return stripeHit
      }
    }

    const giftHit = await lcCheckGift(productId, key)
    if (giftHit.found) return giftHit

    return { found: false }
  }

  async function lcCheckByKey(rawKey, productSel, refreshLive) {
    const key = String(rawKey || '').trim()
    const compact = key.replace(/\s+/g, '')
    if (!compact) throw new Error('Enter a license key or gift code.')

    const detected = lcDetectProductFromKey(compact)
    const order = lcResolveProductOrder(productSel, detected)

    for (const pid of order) {
      const hit = await lcCheckProductLicense(pid, key, compact, refreshLive)
      if (hit.kind === 'yfp-edge') return hit
      if (hit.found) return hit
    }

    const fallback = await lcYfpAdminCheck({ license_key: key, refresh_live: refreshLive })
    return { kind: 'yfp-edge', json: fallback, productLabel: PRODUCTS.yfp.label }
  }

  const STRIPE_SUBSCRIBER_SOURCES = [
    { productId: 'yfp', table: 'yt_filter_pro_stripe_license_pending' },
    { productId: 'idme', table: 'idme_stripe_license_pending' },
    { productId: 'ivd', table: 'ivd_stripe_license_pending' },
  ]

  const STRIPE_SUBSCRIBER_SELECT =
    'email,license_key,status,subscription_status,is_subscribed,created_at,subscription_started_at,subscription_start,checkout_completed_at,current_period_end,grant_until,canceled_at,cancel_at_period_end,stripe_subscription_id,subscription_id,test_mode'

  let lcStripeSubscribersCache = []

  async function lcFetchStripePendingRows(productId, table) {
    const { url, key } = lcSupabaseForProduct(productId)
    const query = `select=${encodeURIComponent(STRIPE_SUBSCRIBER_SELECT)}&order=created_at.desc`
    const res = await fetch(`${lcRest(url, table)}?${query}`, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
    })
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
      return { ok: false, error: String(msg), rows: [] }
    }
    return { ok: true, rows: Array.isArray(json) ? json : [] }
  }

  function lcStripeRowSubscribed(row) {
    if (row?.is_subscribed === true) return true
    const status = String(row?.subscription_status || row?.status || '').toLowerCase()
    if (['active', 'trialing', 'activated'].includes(status)) return true
    if (['canceled', 'cancelled', 'unpaid', 'incomplete_expired', 'failed'].includes(status)) {
      return false
    }
    const periodEnd = Date.parse(String(row?.current_period_end || row?.grant_until || ''))
    if (Number.isFinite(periodEnd) && periodEnd > Date.now()) return true
    if (row?.cancel_at_period_end === true && Number.isFinite(periodEnd)) {
      return periodEnd > Date.now()
    }
    return Boolean(row?.stripe_subscription_id || row?.subscription_id)
  }

  function lcStripeRowStarted(row) {
    const raw =
      row?.subscription_started_at ||
      row?.subscription_start ||
      row?.checkout_completed_at ||
      row?.created_at
    return lcFormatIso(raw)
  }

  function lcSetStripeSubscribersStatus(message, type) {
    const el = document.getElementById('license-stripe-subscribers-status')
    if (!el) return
    el.hidden = false
    el.textContent = message || ''
    el.classList.toggle('admin__status--error', type === 'error')
    el.classList.toggle('admin__status--empty', type === 'empty')
  }

  function lcRenderStripeSubscribersTable() {
    const wrap = document.getElementById('license-stripe-subscribers-wrap')
    const body = document.getElementById('license-stripe-subscribers-body')
    const empty = document.getElementById('license-stripe-subscribers-empty')
    if (!body) return

    const filter = String(document.getElementById('license-stripe-subscribers-product')?.value || 'all')
    const rows =
      filter === 'all'
        ? lcStripeSubscribersCache.slice()
        : lcStripeSubscribersCache.filter((row) => row.productId === filter)

    rows.sort((a, b) => {
      const ae = String(a.email || '').toLowerCase()
      const be = String(b.email || '').toLowerCase()
      if (ae < be) return -1
      if (ae > be) return 1
      return String(a.licenseKey || '').localeCompare(String(b.licenseKey || ''))
    })

    if (!rows.length) {
      if (wrap) wrap.hidden = true
      if (empty) {
        empty.hidden = false
        empty.textContent = lcStripeSubscribersCache.length
          ? 'No rows for this extension filter.'
          : 'No Stripe subscriber rows loaded.'
      }
      body.innerHTML = ''
      return
    }

    if (wrap) wrap.hidden = false
    if (empty) empty.hidden = true
    body.innerHTML = rows
      .map((row) => {
        const subscribed = row.subscribed
        return `<tr>
          <td>${lcEscapeHtml(row.email)}</td>
          <td><code>${lcEscapeHtml(row.licenseKey)}</code></td>
          <td><span class="admin__users-pill ${subscribed ? 'admin__users-pill--yes' : 'admin__users-pill--no'}">${subscribed ? 'yes' : 'no'}</span></td>
          <td>${lcEscapeHtml(row.started)}</td>
        </tr>`
      })
      .join('')
  }

  async function lcRefreshStripeSubscribers() {
    const btn = document.getElementById('license-stripe-subscribers-refresh')
    if (btn) btn.disabled = true
    lcSetStripeSubscribersStatus('Loading subscribers (read-only GET)…', 'empty')

    const errors = []
    const merged = []

    for (const src of STRIPE_SUBSCRIBER_SOURCES) {
      const { ok, error, rows } = await lcFetchStripePendingRows(src.productId, src.table)
      if (!ok) {
        errors.push(`${PRODUCTS[src.productId].label}: ${error}`)
        continue
      }
      for (const row of rows) {
        merged.push({
          productId: src.productId,
          email: String(row?.email || '').trim() || '—',
          licenseKey: String(row?.license_key || '').trim() || '—',
          subscribed: lcStripeRowSubscribed(row),
          started: lcStripeRowStarted(row),
        })
      }
    }

    lcStripeSubscribersCache = merged
    lcRenderStripeSubscribersTable()

    if (!merged.length && errors.length) {
      lcSetStripeSubscribersStatus(
        `${errors.join(' · ')} — run stripe-subscribers-admin-schema.sql in Supabase if access is denied.`,
        'error',
      )
    } else if (errors.length) {
      lcSetStripeSubscribersStatus(
        `Showing ${merged.length} row(s). Some sources failed: ${errors.join(' · ')}`,
        'empty',
      )
    } else if (!merged.length) {
      lcSetStripeSubscribersStatus('No Stripe checkout license rows in Supabase yet.', 'empty')
    } else {
      lcSetStripeSubscribersStatus(`Loaded ${merged.length} subscriber row(s) (read-only).`, 'empty')
    }

    if (btn) btn.disabled = false
  }

  async function lcRunCheck() {
    const input = document.getElementById('license-check-input')
    const live = document.getElementById('license-check-live')
    const btn = document.getElementById('license-check-btn')
    const value = String(input?.value || '').trim()
    const product = lcSelectedProduct()
    const refreshLive = Boolean(live?.checked)

    if (!value) {
      lcSetStatus('Enter a license key or gift code.', 'error')
      return
    }

    lcSetStatus('Checking…', 'empty')
    const summaryEl = document.getElementById('license-check-summary')
    const jsonEl = document.getElementById('license-check-json')
    if (summaryEl) summaryEl.hidden = true
    if (jsonEl) jsonEl.hidden = true
    if (btn) btn.disabled = true

    try {
      const payload = await lcCheckByKey(value, product, refreshLive)
      lcRenderSummary(payload)
      lcSetStatus('', 'empty')
    } catch (err) {
      lcSetStatus(err instanceof Error ? err.message : String(err), 'error')
    } finally {
      if (btn) btn.disabled = false
    }
  }

  function lcInit() {
    if (lcInitDone) return
    lcInitDone = true
    document.getElementById('license-check-form')?.addEventListener('submit', (event) => {
      event.preventDefault()
      void lcRunCheck()
    })
    document.getElementById('license-stripe-subscribers-refresh')?.addEventListener('click', () => {
      void lcRefreshStripeSubscribers()
    })
    document.getElementById('license-stripe-subscribers-product')?.addEventListener('change', () => {
      lcRenderStripeSubscribersTable()
    })
  }

  window.LicenseCheckAdmin = {
    init: lcInit,
    focusInput() {
      document.getElementById('license-check-input')?.focus()
    },
  }

  lcInit()
})()
