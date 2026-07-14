/* global Chart, confetti */

const SUPABASE_URL = 'https://pinypmgcawshibcmyxqp.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpbnlwbWdjYXdzaGliY215eHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTA2OTMsImV4cCI6MjA5Mzc2NjY5M30.Oabrt3eiLuYA-Lr5uH4w9VPh_CWqQJ2uo-hE07WQsFM'

const READ_STORAGE_KEY = 'cc_admin_feedback_read' // legacy; migrated into settings store
const SETTINGS_STORAGE_KEY = 'cc_admin_settings'

const CHART_COLORS = {
  primary: '#ff9900',
  blue: '#3b82f6',
  green: '#22c55e',
  purple: '#a855f7',
  muted: '#94a3b8',
  surface: '#131824',
  border: '#1f2636',
  divider: '#1a2130',
  tick: '#7a8599',
  text: '#ffffff',
  bg: '#090b10',
}

const FILTER_GROUP_KEYS = [
  'titleIncludes',
  'titleExcludes',
  'descIncludes',
  'descExcludes',
  'channelIncludes',
  'channelExclude',
]

const PAGE_SIZE = 1000

/* -------------------------------------------------------------------------- */
/* Vanilla persisted settings store                                           */
/* -------------------------------------------------------------------------- */

function createPersistedStore(storageKey, defaults) {
  const listeners = new Set()

  function readStorage() {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return { ...defaults }
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return { ...defaults }
      return { ...defaults, ...parsed }
    } catch {
      return { ...defaults }
    }
  }

  let data = readStorage()

  function writeStorage() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch {
      /* quota / private mode */
    }
  }

  function notify(key, value) {
    listeners.forEach((fn) => {
      try {
        fn(key, value, data)
      } catch {
        /* ignore subscriber errors */
      }
    })
  }

  return {
    get(key) {
      return data[key]
    },
    getAll() {
      return { ...data }
    },
    set(key, value) {
      data = { ...data, [key]: value }
      writeStorage()
      notify(key, value)
      return value
    },
    patch(partial) {
      data = { ...data, ...partial }
      writeStorage()
      Object.entries(partial).forEach(([key, value]) => notify(key, value))
      return this.getAll()
    },
    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
  }
}

function migrateLegacyReadIds() {
  try {
    const legacy = localStorage.getItem(READ_STORAGE_KEY)
    if (!legacy) return []
    const parsed = JSON.parse(legacy)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

const settings = createPersistedStore(SETTINGS_STORAGE_KEY, {
  activeTab: 'feedback',
  feedbackFilter: 'all',
  readFeedbackIds: migrateLegacyReadIds(),
  seenFeedbackIds: [],
})

// One-time cleanup of old key after migration into settings store
try {
  if (localStorage.getItem(READ_STORAGE_KEY)) {
    localStorage.removeItem(READ_STORAGE_KEY)
  }
} catch {
  /* ignore */
}

const VALID_FILTERS = new Set(['all', 'unread', 'read'])
const VALID_TABS = new Set(['feedback', 'yt'])

function getFeedbackFilter() {
  const value = settings.get('feedbackFilter')
  return VALID_FILTERS.has(value) ? value : 'all'
}

function setFeedbackFilter(value) {
  const next = VALID_FILTERS.has(value) ? value : 'all'
  settings.set('feedbackFilter', next)
  return next
}

function getActiveTab() {
  const value = settings.get('activeTab')
  return VALID_TABS.has(value) ? value : 'feedback'
}

function setActiveTab(value) {
  const next = VALID_TABS.has(value) ? value : 'feedback'
  settings.set('activeTab', next)
  return next
}

function getSeenFeedbackIds() {
  const ids = settings.get('seenFeedbackIds')
  return new Set(Array.isArray(ids) ? ids.map(String) : [])
}

function setSeenFeedbackIds(ids) {
  settings.set('seenFeedbackIds', [...new Set([...ids].map(String))])
}

function fireNewFeedbackConfetti(newCount) {
  if (typeof confetti !== 'function') return

  const bursts = Math.min(3, Math.max(1, newCount))
  const colors = ['#ff9900', '#ffffff', '#3b82f6', '#22c55e', '#a855f7']

  for (let i = 0; i < bursts; i += 1) {
    window.setTimeout(() => {
      confetti({
        particleCount: 90 + i * 20,
        spread: 70 + i * 15,
        startVelocity: 38,
        origin: { x: 0.15 + i * 0.35, y: 0.25 },
        colors,
        disableForReducedMotion: true,
      })
    }, i * 180)
  }

  window.setTimeout(() => {
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.55 },
      colors,
      disableForReducedMotion: true,
    })
  }, bursts * 180 + 80)
}

/**
 * Compare loaded feedback IDs with localStorage `seenFeedbackIds`.
 * First successful load only seeds the set (no confetti).
 * Later loads fire confetti when new IDs appear, then merge them in.
 */
function detectAndCelebrateNewFeedback(rows) {
  const currentIds = rows.map((row) => String(feedbackId(row)))
  const seen = getSeenFeedbackIds()
  const isFirstSeed = seen.size === 0

  const newIds = currentIds.filter((id) => !seen.has(id))

  if (!isFirstSeed && newIds.length > 0) {
    fireNewFeedbackConfetti(newIds.length)
  }

  setSeenFeedbackIds([...seen, ...currentIds])
  return newIds.length
}

const state = {
  feedback: [],
  ytRows: [],
  charts: {},
  loaded: { feedback: false, yt: false },
}

function restHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    Accept: 'application/json',
    Prefer: 'count=exact',
  }
}

function formatError(error, table) {
  const msg = error?.message || String(error)
  const code = error?.code ? ` [${error.code}]` : ''
  const status = error?.status ? ` (HTTP ${error.status})` : ''
  const hint =
    /permission|rls|policy|401|403|jwt|not accept/i.test(msg) ||
    error?.status === 401 ||
    error?.status === 403
      ? `\n\nLikely cause: anon key has no SELECT on "${table}". Add a Supabase RLS SELECT policy for the anon role.`
      : /Failed to fetch|NetworkError|CORS/i.test(msg)
        ? `\n\nLikely cause: network/CORS issue. Confirm you're online and Supabase allows browser requests from this origin.`
        : ''
  return `Failed to load "${table}"${code}${status}: ${msg}${hint}`
}

async function fetchAllRows(table, orderColumn) {
  const rows = []
  let from = 0
  const base = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/${encodeURIComponent(table)}`

  for (;;) {
    const params = new URLSearchParams()
    params.set('select', '*')
    if (orderColumn) {
      params.set('order', `${orderColumn}.desc.nullslast`)
    }

    const to = from + PAGE_SIZE - 1
    const res = await fetch(`${base}?${params.toString()}`, {
      method: 'GET',
      headers: {
        ...restHeaders(),
        Range: `${from}-${to}`,
      },
    })

    const text = await res.text()
    let data = null
    try {
      data = text ? JSON.parse(text) : []
    } catch {
      data = null
    }

    if (!res.ok) {
      const apiMsg =
        (data && (data.message || data.error_description || data.hint || data.error)) ||
        text ||
        res.statusText ||
        'request failed'
      const err = new Error(apiMsg)
      err.status = res.status
      err.code = data?.code
      throw err
    }

    if (!Array.isArray(data) || !data.length) break

    rows.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return rows
}

function getReadSet() {
  const ids = settings.get('readFeedbackIds')
  return new Set(Array.isArray(ids) ? ids.map(String) : [])
}

function saveReadSet(set) {
  settings.set('readFeedbackIds', [...set])
}

function isRead(id) {
  return getReadSet().has(String(id))
}

function setRead(id, read) {
  const set = getReadSet()
  const key = String(id)
  if (read) set.add(key)
  else set.delete(key)
  saveReadSet(set)
}

function markAllRead(ids) {
  const set = getReadSet()
  ids.forEach((id) => set.add(String(id)))
  saveReadSet(set)
}

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelativeTime(value) {
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

function formatDateWithRelative(value) {
  const absolute = formatDate(value)
  const relative = formatRelativeTime(value)
  if (!relative || absolute === '—') return absolute
  return `${absolute} (${relative})`
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function setStatus(el, message, type) {
  el.hidden = !message
  el.textContent = message || ''
  el.classList.toggle('admin__status--error', type === 'error')
  el.classList.toggle('admin__status--empty', type === 'empty')
}

function switchTab(tab, { persist = true } = {}) {
  const next = persist ? setActiveTab(tab) : getActiveTab()
  const active = VALID_TABS.has(tab) ? tab : next

  document.querySelectorAll('.admin__tab').forEach((btn) => {
    const isActive = btn.dataset.tab === active
    btn.classList.toggle('admin__tab--active', isActive)
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false')
  })
  document.getElementById('panel-feedback').hidden = active !== 'feedback'
  document.getElementById('panel-yt').hidden = active !== 'yt'

  if (active === 'yt' && state.loaded.yt) {
    requestAnimationFrame(() => renderYtCharts())
  }
}

function syncFeedbackFilterChips() {
  const filter = getFeedbackFilter()
  document.querySelectorAll('#feedback-toolbar .admin__chip').forEach((chip) => {
    chip.classList.toggle('admin__chip--active', chip.dataset.filter === filter)
  })
}

function updateUpdatedAt() {
  document.getElementById('admin-updated').textContent =
    `Updated ${new Date().toLocaleString('en-US')}`
}

/* -------------------------------------------------------------------------- */
/* Feedback                                                                   */
/* -------------------------------------------------------------------------- */

function feedbackId(row) {
  return row.id ?? row.created_at ?? JSON.stringify(row)
}

function renderFeedbackKpis() {
  const readSet = getReadSet()
  const total = state.feedback.length
  const read = state.feedback.filter((row) => readSet.has(String(feedbackId(row)))).length
  const unread = total - read

  document.getElementById('kpi-feedback-total').textContent = String(total)
  document.getElementById('kpi-feedback-unread').textContent = String(unread)
  document.getElementById('kpi-feedback-read').textContent = String(read)

  const badge = document.getElementById('feedback-unread-badge')
  if (unread > 0) {
    badge.hidden = false
    badge.textContent = String(unread)
  } else {
    badge.hidden = true
  }
}

function renderFeedbackList() {
  const list = document.getElementById('feedback-list')
  const readSet = getReadSet()
  const filter = getFeedbackFilter()

  const rows = state.feedback.filter((row) => {
    const read = readSet.has(String(feedbackId(row)))
    if (filter === 'unread') return !read
    if (filter === 'read') return read
    return true
  })

  if (!rows.length) {
    list.innerHTML =
      '<div class="admin__status admin__status--empty">No feedback matches this filter.</div>'
    return
  }

  list.innerHTML = rows
    .map((row) => {
      const id = String(feedbackId(row))
      const read = readSet.has(id)
      return `
        <article class="admin__card${read ? '' : ' admin__card--unread'}" data-id="${escapeHtml(id)}">
          <div class="admin__card-top">
            <div class="admin__card-meta">
              <span class="admin__card-app">${escapeHtml(row.app_name || 'Unknown app')}</span>
              <span>${escapeHtml(formatDateWithRelative(row.created_at))}</span>
              ${
                row.email
                  ? `<span>${escapeHtml(row.email)}</span>`
                  : '<span>No email</span>'
              }
            </div>
            <span class="admin__card-badge ${read ? 'admin__card-badge--read' : 'admin__card-badge--unread'}">
              ${read ? 'Read' : 'Unread'}
            </span>
          </div>
          <div class="admin__card-body">${escapeHtml(row.suggestion || '(empty)')}</div>
          <div class="admin__card-actions">
            <button type="button" class="admin__btn admin__btn--outline admin__btn--sm" data-toggle-read="${escapeHtml(id)}">
              Mark as ${read ? 'unread' : 'read'}
            </button>
          </div>
        </article>
      `
    })
    .join('')
}

function renderFeedback() {
  syncFeedbackFilterChips()
  renderFeedbackKpis()
  renderFeedbackList()
}

async function loadFeedback() {
  const status = document.getElementById('feedback-status')
  const kpis = document.getElementById('feedback-kpis')
  const toolbar = document.getElementById('feedback-toolbar')
  const list = document.getElementById('feedback-list')

  setStatus(status, 'Loading feedback…')
  kpis.hidden = true
  toolbar.hidden = true
  list.innerHTML = ''

  try {
    const rows = await fetchAllRows('feedback', 'created_at')
    state.feedback = rows
    state.loaded.feedback = true

    if (!rows.length) {
      setStatus(
        status,
        'Got 0 rows from "feedback". If you see rows in the Supabase Table Editor, anon SELECT is blocked by RLS (PostgREST returns [] instead of an error).\n\nIn Supabase → SQL Editor, run:\n\ncreate policy "anon_select_feedback"\n  on public.feedback for select to anon using (true);',
        'error',
      )
      return
    }

    setStatus(status, '')
    kpis.hidden = false
    toolbar.hidden = false
    detectAndCelebrateNewFeedback(rows)
    renderFeedback()
  } catch (error) {
    state.loaded.feedback = false
    setStatus(status, formatError(error, 'feedback'), 'error')
  }
}

/* -------------------------------------------------------------------------- */
/* YouTube Filter Pro                                                         */
/* -------------------------------------------------------------------------- */

function pickFilterObject(row) {
  const candidates = ['data', 'filters', 'payload', 'settings', 'filter', 'filter_data']
  for (const key of candidates) {
    const value = row?.[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) return value
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
      } catch {
        /* ignore */
      }
    }
  }

  // Flat row: use row itself minus metadata columns
  const meta = new Set([
    'id',
    'created_at',
    'updated_at',
    'inserted_at',
    'user_id',
    'visitor_id',
    'fingerprint',
    'session_id',
  ])
  const flat = {}
  let hits = 0
  for (const [key, value] of Object.entries(row || {})) {
    if (meta.has(key)) continue
    flat[key] = value
    if (
      [
        'publishedPreset',
        'shorts',
        'verified',
        'subMin',
        'subMax',
        'titleIncludes',
        'viewMin',
      ].includes(key)
    ) {
      hits += 1
    }
  }
  return hits > 0 ? flat : null
}

function rowCreatedAt(row) {
  return row.created_at || row.inserted_at || row.updated_at || null
}

function isFilled(value) {
  return value != null && String(value).trim() !== ''
}

function isGroupActive(group) {
  if (!group || typeof group !== 'object') return false
  if (group.active === true) return true
  if (Number(group.count) > 0) return true
  return false
}

function countMapInc(map, key) {
  const k = key == null || key === '' ? '(empty)' : String(key)
  map.set(k, (map.get(k) || 0) + 1)
}

function topEntries(map, limit = 8) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
}

function pct(part, total) {
  if (!total) return '0%'
  return `${Math.round((part / total) * 100)}%`
}

function aggregateYt(rows) {
  const presets = new Map()
  const shorts = new Map()
  const verified = new Map()
  const groups = Object.fromEntries(FILTER_GROUP_KEYS.map((k) => [k, 0]))
  const subRanges = new Map()
  const byDay = new Map()
  const uniqueFingerprints = new Set()

  let keywordIncludeActive = 0
  let durationAny = 0
  let normalized = 0

  for (const row of rows) {
    const fp = row?.fingerprint
    if (fp != null && String(fp).trim() !== '') {
      uniqueFingerprints.add(String(fp))
    }

    const filter = pickFilterObject(row)
    if (!filter) continue
    normalized += 1

    countMapInc(presets, filter.publishedPreset ?? 'any')
    countMapInc(shorts, filter.shorts ?? 'all')
    countMapInc(verified, filter.verified ?? 'all')

    FILTER_GROUP_KEYS.forEach((key) => {
      if (isGroupActive(filter[key])) groups[key] += 1
    })

    if (
      isGroupActive(filter.titleIncludes) ||
      isGroupActive(filter.descIncludes) ||
      isGroupActive(filter.channelIncludes)
    ) {
      keywordIncludeActive += 1
    }

    const durationFields = [
      filter.durMinH,
      filter.durMinM,
      filter.durMinS,
      filter.durMaxH,
      filter.durMaxM,
      filter.durMaxS,
    ]
    if (durationFields.some(isFilled)) durationAny += 1

    const subLabel = `${filter.subMin || '0'}–${filter.subMax || '∞'}`
    countMapInc(subRanges, subLabel)

    const created = rowCreatedAt(row)
    if (created) {
      const day = new Date(created)
      if (!Number.isNaN(day.getTime())) {
        const key = day.toISOString().slice(0, 10)
        countMapInc(byDay, key)
      }
    }
  }

  return {
    total: rows.length,
    normalized,
    uniqueUsers: uniqueFingerprints.size,
    presets,
    shorts,
    verified,
    groups,
    subRanges,
    byDay,
    keywordIncludeActive,
    durationAny,
  }
}

function destroyCharts() {
  Object.values(state.charts).forEach((chart) => {
    try {
      chart.destroy()
    } catch {
      /* ignore */
    }
  })
  state.charts = {}
}

function baseChartOptions(extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: CHART_COLORS.tick,
          font: { family: 'Inter', size: 11 },
        },
      },
      tooltip: {
        backgroundColor: CHART_COLORS.surface,
        borderColor: CHART_COLORS.border,
        borderWidth: 1,
        titleColor: CHART_COLORS.text,
        bodyColor: CHART_COLORS.tick,
      },
    },
    ...extra,
  }
}

function doughnutData(entries) {
  const palette = [
    CHART_COLORS.primary,
    CHART_COLORS.blue,
    CHART_COLORS.green,
    CHART_COLORS.purple,
    CHART_COLORS.muted,
    '#f06560',
    '#eab308',
    '#14b8a6',
  ]
  return {
    labels: entries.map(([label]) => label),
    datasets: [
      {
        data: entries.map(([, count]) => count),
        backgroundColor: entries.map((_, i) => palette[i % palette.length]),
        borderColor: CHART_COLORS.bg,
        borderWidth: 2,
      },
    ],
  }
}

function barData(labels, values, color = CHART_COLORS.primary) {
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: color,
        borderRadius: 3,
        maxBarThickness: 28,
      },
    ],
  }
}

function renderYtCharts() {
  if (!state.loaded.yt || !state.ytRows.length) return

  const stats = aggregateYt(state.ytRows)
  destroyCharts()

  const doughnutOpts = baseChartOptions({
    plugins: {
      ...baseChartOptions().plugins,
      legend: {
        position: 'bottom',
        labels: {
          color: CHART_COLORS.tick,
          font: { family: 'Inter', size: 11 },
          boxWidth: 10,
        },
      },
    },
  })

  const barOpts = baseChartOptions({
    indexAxis: 'y',
    plugins: { legend: { display: false }, tooltip: baseChartOptions().plugins.tooltip },
    scales: {
      x: {
        ticks: { color: CHART_COLORS.tick, font: { family: 'Inter', size: 10 } },
        grid: { color: CHART_COLORS.divider },
      },
      y: {
        ticks: { color: CHART_COLORS.tick, font: { family: 'Inter', size: 10 } },
        grid: { display: false },
      },
    },
  })

  const lineOpts = baseChartOptions({
    plugins: { legend: { display: false }, tooltip: baseChartOptions().plugins.tooltip },
    scales: {
      x: {
        ticks: { color: CHART_COLORS.tick, font: { family: 'Inter', size: 10 }, maxRotation: 0 },
        grid: { color: CHART_COLORS.divider },
      },
      y: {
        beginAtZero: true,
        ticks: { color: CHART_COLORS.tick, font: { family: 'Inter', size: 10 }, precision: 0 },
        grid: { color: CHART_COLORS.divider },
      },
    },
  })

  state.charts.preset = new Chart(document.getElementById('chart-preset'), {
    type: 'doughnut',
    data: doughnutData(topEntries(stats.presets, 8)),
    options: doughnutOpts,
  })

  state.charts.shorts = new Chart(document.getElementById('chart-shorts'), {
    type: 'doughnut',
    data: doughnutData(topEntries(stats.shorts, 6)),
    options: doughnutOpts,
  })

  state.charts.verified = new Chart(document.getElementById('chart-verified'), {
    type: 'doughnut',
    data: doughnutData(topEntries(stats.verified, 6)),
    options: doughnutOpts,
  })

  const groupLabels = FILTER_GROUP_KEYS
  const groupValues = groupLabels.map((k) => stats.groups[k])
  state.charts.groups = new Chart(document.getElementById('chart-groups'), {
    type: 'bar',
    data: barData(groupLabels, groupValues, CHART_COLORS.blue),
    options: barOpts,
  })

  const subTop = topEntries(stats.subRanges, 10)
  state.charts.subs = new Chart(document.getElementById('chart-subs'), {
    type: 'bar',
    data: barData(
      subTop.map(([label]) => label),
      subTop.map(([, count]) => count),
      CHART_COLORS.green,
    ),
    options: barOpts,
  })

  const days = [...stats.byDay.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  state.charts.timeline = new Chart(document.getElementById('chart-timeline'), {
    type: 'line',
    data: {
      labels: days.map(([day]) => day),
      datasets: [
        {
          data: days.map(([, count]) => count),
          borderColor: CHART_COLORS.primary,
          backgroundColor: 'rgba(255, 153, 0, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: days.length > 40 ? 0 : 3,
          pointHoverRadius: 4,
        },
      ],
    },
    options: lineOpts,
  })
}

function renderYtKpis() {
  const stats = aggregateYt(state.ytRows)
  const n = stats.normalized || stats.total

  document.getElementById('kpi-yt-total').textContent = String(stats.total)
  document.getElementById('kpi-yt-users').textContent = String(stats.uniqueUsers)
  document.getElementById('kpi-yt-keywords').textContent = pct(stats.keywordIncludeActive, n)
  document.getElementById('kpi-yt-duration').textContent = pct(stats.durationAny, n)
}

async function loadYt() {
  const status = document.getElementById('yt-status')
  const kpis = document.getElementById('yt-kpis')
  const charts = document.getElementById('yt-charts')

  setStatus(status, 'Loading YouTube Filter Pro data…')
  kpis.hidden = true
  charts.hidden = true
  destroyCharts()

  try {
    let rows
    try {
      rows = await fetchAllRows('yt_filter_pro_data', 'created_at')
    } catch {
      rows = await fetchAllRows('yt_filter_pro_data', null)
    }

    state.ytRows = rows
    state.loaded.yt = true

    if (!rows.length) {
      setStatus(
        status,
        'Got 0 rows from "yt_filter_pro_data". If you see rows in the Supabase Table Editor, anon SELECT is blocked by RLS.\n\nIn Supabase → SQL Editor, run:\n\ncreate policy "anon_select_yt_filter_pro_data"\n  on public.yt_filter_pro_data for select to anon using (true);',
        'error',
      )
      return
    }

    const sample = pickFilterObject(rows[0])
    if (!sample) {
      setStatus(
        status,
        'Loaded rows, but could not find filter settings. Expected a JSON column (data/filters/payload/settings) or flat filter fields.',
        'error',
      )
      return
    }

    setStatus(status, '')
    kpis.hidden = false
    charts.hidden = false
    renderYtKpis()
    if (!document.getElementById('panel-yt').hidden) {
      renderYtCharts()
    }
  } catch (error) {
    state.loaded.yt = false
    setStatus(status, formatError(error, 'yt_filter_pro_data'), 'error')
  }
}

/* -------------------------------------------------------------------------- */
/* Boot                                                                       */
/* -------------------------------------------------------------------------- */

async function refreshAll() {
  updateUpdatedAt()
  await Promise.all([loadFeedback(), loadYt()])
  updateUpdatedAt()
}

document.querySelectorAll('.admin__tab').forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab))
})

document.getElementById('admin-refresh').addEventListener('click', () => {
  refreshAll()
})

document.querySelectorAll('#feedback-toolbar .admin__chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    setFeedbackFilter(chip.dataset.filter)
    syncFeedbackFilterChips()
    renderFeedbackList()
  })
})

document.getElementById('mark-all-read').addEventListener('click', () => {
  markAllRead(state.feedback.map(feedbackId))
  renderFeedback()
})

document.getElementById('feedback-list').addEventListener('click', (event) => {
  const btn = event.target.closest('[data-toggle-read]')
  if (!btn) return
  const id = btn.getAttribute('data-toggle-read')
  setRead(id, !isRead(id))
  renderFeedback()
})

switchTab(getActiveTab(), { persist: false })
refreshAll()
