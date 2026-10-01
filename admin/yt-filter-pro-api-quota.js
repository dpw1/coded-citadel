/* global Toastify */

const YFP_ENRICH_WORKER_URL = 'https://yfp-enrich.codedcitadel.workers.dev'

let yfpApiQuotaInitDone = false
let yfpApiQuotaLoading = false

function yfpApiQuotaToast(message, type) {
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

function yfpApiQuotaFormatCompact(value) {
  const n = Number(value) || 0
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return n.toLocaleString('en-US')
}

function yfpApiQuotaStatusLabel(status) {
  if (status === 'active') return 'Active'
  if (status === 'exhausted') return 'Exhausted'
  if (status === 'missing') return 'Not set'
  return 'Ready'
}

function yfpApiQuotaStatusPillClass(status) {
  if (status === 'active') return 'admin__users-pill admin__users-pill--yes'
  if (status === 'exhausted') return 'admin__users-pill admin__users-pill--warn'
  if (status === 'missing') return 'admin__users-pill admin__users-pill--no'
  return 'admin__users-pill admin__users-pill--no'
}

function yfpApiQuotaBarClass(status, percent) {
  if (status === 'exhausted' || percent >= 100) return 'admin__quota-bar__fill--danger'
  if (status === 'active') return 'admin__quota-bar__fill--success'
  return 'admin__quota-bar__fill--muted'
}

function yfpApiQuotaDotClass(status) {
  if (status === 'active') return 'admin__quota-dot--active'
  if (status === 'exhausted') return 'admin__quota-dot--danger'
  if (status === 'missing') return 'admin__quota-dot--muted'
  return 'admin__quota-dot--ready'
}

function yfpApiQuotaRender(data) {
  const card = document.getElementById('yt-api-quota-card')
  const statusEl = document.getElementById('yt-api-status')
  if (!card) return

  if (statusEl) {
    statusEl.hidden = true
    statusEl.textContent = ''
  }

  const keys = Array.isArray(data?.keys) ? data.keys : []
  const totalUsed = Number(data?.totalUsed) || 0
  const totalLimit = Number(data?.totalLimit) || 0
  const totalPercent = Number(data?.totalPercent) || 0
  const quotaDay = String(data?.quotaDay || '')

  const rows = keys
    .map((row) => {
      const percent = Number(row.percent) || 0
      const status = String(row.status || 'ready')
      const barClass = yfpApiQuotaBarClass(status, percent)
      const masked = row.masked ? `<code>${row.masked}</code>` : '<span class="admin__quota-missing">not configured in Worker secrets</span>'
      return `<div class="admin__quota-row">
        <div class="admin__quota-row__head">
          <span class="admin__quota-dot ${yfpApiQuotaDotClass(status)}" aria-hidden="true"></span>
          <div class="admin__quota-row__meta">
            <div class="admin__quota-row__title">
              <strong>${row.label || row.slot}</strong>
              <span class="${yfpApiQuotaStatusPillClass(status)}">${yfpApiQuotaStatusLabel(status)}</span>
            </div>
            <div class="admin__quota-row__key">${masked}</div>
          </div>
          <div class="admin__quota-row__pct">${status === 'missing' ? '—' : `${percent}%`}</div>
        </div>
        <div class="admin__quota-bar" aria-hidden="true">
          <div class="admin__quota-bar__fill ${barClass}" style="width:${status === 'missing' ? 0 : percent}%"></div>
        </div>
      </div>`
    })
    .join('')

  card.hidden = false
  card.innerHTML = `<div class="admin__quota-card__header">
      <div class="admin__quota-card__title-wrap">
        <span class="admin__quota-card__icon" aria-hidden="true">🔑</span>
        <h3 class="admin__chart-title admin__quota-card__title">YouTube API keys</h3>
      </div>
      <div class="admin__quota-card__total">${yfpApiQuotaFormatCompact(totalUsed)} / ${yfpApiQuotaFormatCompact(totalLimit)}</div>
    </div>
    <div class="admin__quota-bar admin__quota-bar--total" aria-hidden="true">
      <div class="admin__quota-bar__fill admin__quota-bar__fill--success" style="width:${totalPercent}%"></div>
    </div>
    <div class="admin__quota-list">${rows}</div>
    <p class="admin__note admin__quota-footnote">
      Auto-rotation when one runs out${quotaDay ? ` · Pacific day ${quotaDay}` : ''}.
      Keys sync from repo <code>.env</code> via <code>npm run sync:youtube-secrets</code>.
    </p>`
}

function yfpApiQuotaRenderError(message) {
  const card = document.getElementById('yt-api-quota-card')
  const statusEl = document.getElementById('yt-api-status')
  if (card) card.hidden = true
  if (statusEl) {
    statusEl.hidden = false
    statusEl.classList.add('admin__status--error')
    statusEl.textContent = message
  }
}

async function yfpApiQuotaLoad() {
  if (yfpApiQuotaLoading) return
  yfpApiQuotaLoading = true
  const statusEl = document.getElementById('yt-api-status')
  const card = document.getElementById('yt-api-quota-card')
  const refreshBtn = document.getElementById('yt-api-refresh')
  if (statusEl) {
    statusEl.hidden = false
    statusEl.classList.remove('admin__status--error')
    statusEl.textContent = 'Loading YouTube API quota…'
  }
  if (card) card.hidden = true
  if (refreshBtn) refreshBtn.disabled = true
  try {
    const res = await fetch(`${YFP_ENRICH_WORKER_URL}/quota`, { method: 'GET' })
    let json = null
    try {
      json = await res.json()
    } catch {
      json = null
    }
    if (!res.ok) {
      const msg = json?.error || json?.message || res.statusText || `HTTP ${res.status}`
      throw new Error(msg)
    }
    yfpApiQuotaRender(json)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const hint =
      /not_found|404/i.test(msg)
        ? ' Deploy the latest yfp-enrich Worker (GET /quota) with: cd workers/yfp-enrich && npx wrangler deploy'
        : ''
    yfpApiQuotaRenderError(`Could not load API quota: ${msg}.${hint}`)
  } finally {
    yfpApiQuotaLoading = false
    if (refreshBtn) refreshBtn.disabled = false
  }
}

function yfpApiQuotaInit() {
  if (yfpApiQuotaInitDone) return
  yfpApiQuotaInitDone = true
  document.getElementById('yt-api-refresh')?.addEventListener('click', () => {
    void yfpApiQuotaLoad()
  })
}

window.YfpAdminApiQuota = {
  init: yfpApiQuotaInit,
  load: yfpApiQuotaLoad,
}

document.addEventListener('DOMContentLoaded', yfpApiQuotaInit)
if (document.readyState !== 'loading') yfpApiQuotaInit()
