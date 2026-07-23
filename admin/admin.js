/* global Chart */

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

/** Chrome Web Store IDs → display names (from apps.json). */
const CHROME_EXTENSION_NAMES = {
  amcnbfpogccggckogifbdjekbammlahl: 'Hide Reposts for Bluesky',
  bhagkmlelgbjbklgafgdjeebkdhlibjf: 'Gmail to PDF',
  cdagimhkcpohhjipcnpaaebppnmgegjo: 'DEX',
  dbkkcbfafkckhmefkpgnelikibobcabb: 'Youtube Filter Pro',
  dfkkbbcdbjaecgnaocgfonoodmfmkmmm: 'Claude Message Search',
  dpfdehgiffggecppcbkdacbifbljeiii: 'Instagram Comments Exporter',
  epokpidfnienjjfncmhnallghfhaijbj: 'Youtube Comments Exporter',
  golankbkfnepjbpcekbcglcfgmbpgnmb: 'AI Bookmark',
  hgojieiehkjgjhdnbglfhbcojeeggigi: 'Instagram DM Exporter',
  jadjgiiaompdjacagaomgogdihbpgcpg: 'Save to Google Drive',
  mljfhcfnjbfibedpiaheeihpbjajfcal: 'Claude Limit Monitor',
  pniolepdakiocafjiibgiabkcdhgkfep: 'YouTube Keyword Alert',
}

const CHROME_EXTENSION_ID_RE = /^[a-p]{32}$/i

/** Human labels from extension UI / filter_data keys. */
const FEATURE_LABELS = {
  publishedPreset: 'Date range',
  dateFrom: 'Published from',
  dateTo: 'Published until',
  durMinH: 'Min duration hours',
  durMinM: 'Min duration minutes',
  durMinS: 'Min duration seconds',
  durMaxH: 'Max duration hours',
  durMaxM: 'Max duration minutes',
  durMaxS: 'Max duration seconds',
  viewMin: 'Minimum views',
  viewMax: 'Maximum views',
  viewsPerDayMin: 'Minimum views per day',
  viewsPerDayMax: 'Maximum views per day',
  likesMin: 'Minimum likes',
  likesMax: 'Maximum likes',
  titleIncludes: 'Title includes',
  titleExcludes: 'Exclude from title',
  descIncludes: 'Description includes',
  descExcludes: 'Description excludes',
  subMin: 'Minimum subscribers',
  subMax: 'Maximum subscribers',
  channelVideosMin: 'Minimum channel videos',
  channelVideosMax: 'Maximum channel videos',
  channelViewMin: 'Minimum channel views',
  channelViewMax: 'Maximum channel views',
  channelCountries: 'Channel country includes',
  channelCountriesExclude: 'Channel country excludes',
  channelDescIncludes: 'Channel about includes',
  channelDescExcludes: 'Channel about excludes',
  channelSocialIncludes: 'Social links',
  channelJoinedPreset: 'Channel joined date',
  channelJoinedFrom: 'Joined from',
  channelJoinedTo: 'Joined until',
  channelIncludes: 'Channel tags',
  channelExclude: 'Exclude channels',
  shorts: 'Shorts',
  verified: 'Verified',
  // Nested filter_data.options.* (flattened as options.key)
  // Nested filter_data.options.* (flattened as options.key) — exact extension UI labels
  'options.enableFiltering': 'Enabled',
  'options.filteredVideoStyle': 'Transparent mode',
  'options.autoApply': 'Apply automatically',
  'options.savePreferences': 'Save preferences',
  'options.showSummary': 'Show summary',
  'options.showFilterToasts': 'Display filter message box',
  'options.showHardToFindTips': 'Notify when filters find few or no videos',
  'options.autoScrollOnFilter': 'Auto scroll on filter',
  'options.searchSortKey': 'Search sort key',
  'options.searchSortDir': 'Search sort direction',
  'options.autoSearchSort': 'Auto search sort',
  'options.includeOnlyVideosInSearch': 'Include only videos in the search',
  'options.showSubscribersNextToChannelName': 'Display subscribers count',
  'options.showChannelVideoCount': "Display channel's videos count",
  'options.showChannelSocialIcons': "Display channel's social media icons",
  'options.showChannelCountry': 'Display country',
  'options.showLikesOnSearchPage': 'Display likes',
  'options.showExtraInfo': 'Show extra info?',
  'options.showViewsPerDayOnSearchPage': 'Display Views per Day',
  'options.showMatchCheckmark': 'Show checkmark on videos that match your filters',
  'options.allowUsageAnalytics': 'Share anonymous usage data',
  'options.batchFilterUpdates': 'Batch filter updates',
  'options.smartChannelFetch': 'Smart channel fetch',
}

/** Exact settings UI labels (from extension `_locales/en`). */
const OPTION_UI_LABELS = {
  enableFiltering: 'Enabled',
  filteredVideoStyle: 'Transparent mode',
  savePreferences: 'Save preferences',
  showFilterToasts: 'Display filter message box',
  showHardToFindTips: 'Notify when filters find few or no videos',
  includeOnlyVideosInSearch: 'Include only videos in the search',
  showExtraInfo: 'Show extra info?',
  showSubscribersNextToChannelName: 'Display subscribers count',
  showChannelVideoCount: "Display channel's videos count",
  showChannelSocialIcons: "Display channel's social media icons",
  showChannelCountry: 'Display country',
  showLikesOnSearchPage: 'Display likes',
  showViewsPerDayOnSearchPage: 'Display Views per Day',
  allowUsageAnalytics: 'Share anonymous usage data',
}

/** Defaults from extension `DEFAULT_YFP_OPTIONS` — only non-defaults count as “used”. */
const OPTION_DEFAULTS = {
  enableFiltering: true,
  filteredVideoStyle: 'remove',
  autoApply: false,
  savePreferences: true,
  showSummary: true,
  showFilterToasts: true,
  showHardToFindTips: true,
  autoScrollOnFilter: false,
  searchSortKey: 'default',
  searchSortDir: 'desc',
  autoSearchSort: false,
  includeOnlyVideosInSearch: true,
  showExtraInfo: true,
  showSubscribersNextToChannelName: true,
  showChannelVideoCount: true,
  showChannelSocialIcons: false,
  showChannelCountry: false,
  showLikesOnSearchPage: true,
  showViewsPerDayOnSearchPage: false,
  showMatchCheckmark: true,
  allowUsageAnalytics: true,
  batchFilterUpdates: true,
  smartChannelFetch: true,
}

/**
 * Settings / display toggles shown in the adoption chart — same set + names as the
 * extension Settings / Display UI.
 */
const OPTION_ADOPTION_KEYS = [
  'showExtraInfo',
  'showSubscribersNextToChannelName',
  'showChannelVideoCount',
  'showLikesOnSearchPage',
  'showViewsPerDayOnSearchPage',
  'showChannelSocialIcons',
  'showChannelCountry',
  'includeOnlyVideosInSearch',
  'savePreferences',
  'showFilterToasts',
  'showHardToFindTips',
  'enableFiltering',
  'filteredVideoStyle',
]

function optionUiLabel(key) {
  return OPTION_UI_LABELS[key] || FEATURE_LABELS[`options.${key}`] || key
}

function formatFeatureLabel(key) {
  const human = FEATURE_LABELS[key]
  if (human) return `${human} (${key})`
  // Fallback: split camelCase
  const spaced = String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase())
  return `${spaced} (${key})`
}

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
  feedbackAppFilter: 'all',
  readFeedbackIds: migrateLegacyReadIds(),
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
const VALID_TABS = new Set(['feedback', 'yt', 'feedback-graph'])
const YT_CHART_KEYS = ['features', 'subs', 'settings', 'userGrowth']

function getFeedbackFilter() {
  const value = settings.get('feedbackFilter')
  return VALID_FILTERS.has(value) ? value : 'all'
}

function setFeedbackFilter(value) {
  const next = VALID_FILTERS.has(value) ? value : 'all'
  settings.set('feedbackFilter', next)
  return next
}

function getFeedbackAppFilter() {
  const value = settings.get('feedbackAppFilter')
  return value == null || value === '' ? 'all' : String(value)
}

function setFeedbackAppFilter(value) {
  const next = value == null || value === '' ? 'all' : String(value)
  settings.set('feedbackAppFilter', next)
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
  document.getElementById('panel-feedback-graph').hidden = active !== 'feedback-graph'

  if (active === 'yt' && state.loaded.yt) {
    requestAnimationFrame(() => renderYtCharts())
  }
  if (active === 'feedback-graph' && state.loaded.feedback) {
    requestAnimationFrame(() => renderFeedbackGraph())
  }
}

function syncFeedbackFilterChips() {
  const filter = getFeedbackFilter()
  document
    .querySelectorAll('#feedback-toolbar .admin__toolbar-row .admin__chip')
    .forEach((chip) => {
      chip.classList.toggle('admin__chip--active', chip.dataset.filter === filter)
    })
}

function feedbackRowsForStatusFilter(filter = getFeedbackFilter()) {
  const readSet = getReadSet()
  return state.feedback.filter((row) => {
    const read = readSet.has(String(feedbackId(row)))
    if (filter === 'unread') return !read
    if (filter === 'read') return read
    return true
  })
}

function feedbackAppCounts(rows) {
  const counts = new Map()
  for (const row of rows) {
    const name = formatFeedbackAppName(row.app_name)
    counts.set(name, (counts.get(name) || 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

function renderFeedbackAppChips() {
  const root = document.getElementById('feedback-app-chips')
  if (!root) return

  const scopedRows = feedbackRowsForStatusFilter()
  const counts = feedbackAppCounts(scopedRows)
  const total = scopedRows.length
  let active = getFeedbackAppFilter()
  if (active !== 'all' && !counts.some(([name]) => name === active)) {
    active = setFeedbackAppFilter('all')
  }

  const chips = [
    `<button type="button" class="admin__chip${
      active === 'all' ? ' admin__chip--active' : ''
    }" data-app-filter="all">Feedback <span class="admin__chip-count">(${total})</span></button>`,
    ...counts.map(
      ([name, count]) =>
        `<button type="button" class="admin__chip${
          active === name ? ' admin__chip--active' : ''
        }" data-app-filter="${escapeHtml(name)}">${escapeHtml(name)} <span class="admin__chip-count">(${count})</span></button>`,
    ),
  ]

  root.innerHTML = chips.join('')
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

function formatFeedbackAppName(raw) {
  const value = String(raw ?? '').trim()
  if (!value) return 'Unknown app'
  if (CHROME_EXTENSION_NAMES[value]) return CHROME_EXTENSION_NAMES[value]
  if (CHROME_EXTENSION_ID_RE.test(value)) {
    return CHROME_EXTENSION_NAMES[value.toLowerCase()] || value
  }
  return value
}

function feedbackFingerprint(row) {
  const raw = row?.fingerprint
  if (raw == null) return null
  const value = String(raw).trim()
  return value && value !== 'anonymous' ? value : null
}

/** Fingerprints that appear exactly once across all loaded feedback. */
function buildUniqueFeedbackFingerprints(rows) {
  const counts = new Map()
  for (const row of rows) {
    const fp = feedbackFingerprint(row)
    if (!fp) continue
    counts.set(fp, (counts.get(fp) || 0) + 1)
  }
  const unique = new Set()
  for (const [fp, count] of counts) {
    if (count === 1) unique.add(fp)
  }
  return unique
}

function formatFeedbackContact(row, uniqueFingerprints) {
  const email = String(row?.email ?? '').trim()
  if (email) return email

  const fp = feedbackFingerprint(row)
  if (fp && uniqueFingerprints.has(fp)) return 'Unique user'
  return 'No email'
}

/** True when suggestion has detail beyond a bare "[Reason]" tag. */
function feedbackHasComment(row) {
  const text = String(row?.suggestion ?? '').trim()
  if (!text || text === '(empty)') return false

  const tagged = text.match(/^\[([^\]]+)\]\s*([\s\S]*)$/)
  if (tagged) return tagged[2].trim().length > 0

  return true
}

function feedbackCreatedAtMs(row) {
  const raw = row?.created_at
  if (!raw) return 0
  const ms = new Date(raw).getTime()
  return Number.isNaN(ms) ? 0 : ms
}

function compareFeedbackRows(a, b) {
  return feedbackCreatedAtMs(b) - feedbackCreatedAtMs(a)
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
  const appFilter = getFeedbackAppFilter()

  const rows = state.feedback
    .filter((row) => {
      const read = readSet.has(String(feedbackId(row)))
      if (filter === 'unread' && read) return false
      if (filter === 'read' && !read) return false
      if (appFilter !== 'all' && formatFeedbackAppName(row.app_name) !== appFilter) {
        return false
      }
      return true
    })
    .slice()
    .sort(compareFeedbackRows)

  if (!rows.length) {
    list.innerHTML =
      '<div class="admin__status admin__status--empty">No feedback matches this filter.</div>'
    return
  }

  const uniqueFingerprints = buildUniqueFeedbackFingerprints(state.feedback)

  list.innerHTML = rows
    .map((row) => {
      const id = String(feedbackId(row))
      const read = readSet.has(id)
      return `
        <article class="admin__card${read ? '' : ' admin__card--unread'}" data-id="${escapeHtml(id)}">
          <div class="admin__card-top">
            <div class="admin__card-meta">
              <span class="admin__card-app">${escapeHtml(formatFeedbackAppName(row.app_name))}</span>
              <span>${escapeHtml(formatDateWithRelative(row.created_at))}</span>
              <span>${escapeHtml(formatFeedbackContact(row, uniqueFingerprints))}</span>
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
  renderFeedbackAppChips()
  renderFeedbackKpis()
  renderFeedbackList()
  if (!document.getElementById('panel-feedback-graph')?.hidden) {
    renderFeedbackGraph()
  }
}

/** Cumulative + daily uninstall feedback counts by calendar day. */
function buildFeedbackGrowthSeries(rows) {
  const byDay = new Map()

  for (const row of rows) {
    const created = row?.created_at
    if (!created) continue
    const day = new Date(created)
    if (Number.isNaN(day.getTime())) continue
    const dayKey = day.toISOString().slice(0, 10)
    byDay.set(dayKey, (byDay.get(dayKey) || 0) + 1)
  }

  const dayKeys = [...byDay.keys()].sort()
  if (!dayKeys.length) return []

  const start = new Date(`${dayKeys[0]}T12:00:00Z`)
  const end = new Date(`${dayKeys[dayKeys.length - 1]}T12:00:00Z`)
  const series = []
  let cumulative = 0

  for (let t = start.getTime(); t <= end.getTime(); t += 24 * 60 * 60 * 1000) {
    const dayKey = new Date(t).toISOString().slice(0, 10)
    const daily = byDay.get(dayKey) || 0
    cumulative += daily
    series.push({ day: dayKey, daily, total: cumulative })
  }

  return series
}

function destroyFeedbackGrowthChart() {
  const chart = state.charts.feedbackGrowth
  if (!chart) return
  try {
    chart.destroy()
  } catch {
    /* ignore */
  }
  delete state.charts.feedbackGrowth
}

function renderFeedbackGraphKpis(series) {
  const total = state.feedback.length
  const withComments = state.feedback.filter(feedbackHasComment).length
  const todayKey = new Date().toISOString().slice(0, 10)
  const today = series.find((row) => row.day === todayKey)?.daily ?? 0

  document.getElementById('kpi-fg-total').textContent = String(total)
  document.getElementById('kpi-fg-comments').textContent = String(withComments)
  document.getElementById('kpi-fg-today').textContent = String(today)
}

function renderFeedbackGraph() {
  const status = document.getElementById('feedback-graph-status')
  const kpis = document.getElementById('feedback-graph-kpis')
  const chartWrap = document.getElementById('feedback-growth-chart')
  const canvas = document.getElementById('chart-feedback-growth')

  destroyFeedbackGrowthChart()

  if (!state.loaded.feedback) {
    setStatus(status, 'Loading feedback…')
    kpis.hidden = true
    chartWrap.hidden = true
    return
  }

  if (!state.feedback.length) {
    setStatus(status, 'No feedback yet.', 'empty')
    kpis.hidden = true
    chartWrap.hidden = true
    return
  }

  const series = buildFeedbackGrowthSeries(state.feedback)
  setStatus(status, '')
  kpis.hidden = false
  chartWrap.hidden = false
  renderFeedbackGraphKpis(series)

  if (!canvas || !series.length) return

  const pointRadius = series.length > 40 ? 0 : 3
  state.charts.feedbackGrowth = new Chart(canvas, {
    type: 'line',
    data: {
      labels: series.map((row) => formatChartDate(row.day)),
      datasets: [
        {
          label: 'Total feedback',
          data: series.map((row) => row.total),
          borderColor: CHART_COLORS.primary,
          borderWidth: 2.5,
          fill: false,
          tension: 0.35,
          pointRadius,
          pointBackgroundColor: CHART_COLORS.primary,
          pointBorderColor: CHART_COLORS.bg,
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
        {
          label: 'Daily feedback',
          data: series.map((row) => row.daily),
          borderColor: CHART_COLORS.blue,
          borderWidth: 2,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.12)',
          tension: 0.35,
          pointRadius,
          pointBackgroundColor: CHART_COLORS.blue,
          pointBorderColor: CHART_COLORS.bg,
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
      ],
    },
    options: baseChartOptions({
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: CHART_COLORS.tick,
            font: { family: 'Inter', size: 11 },
            boxWidth: 10,
          },
        },
        tooltip: {
          ...baseChartOptions().plugins.tooltip,
          callbacks: {
            label: (ctx) => {
              const row = series[ctx.dataIndex]
              if (ctx.dataset.label === 'Total feedback') {
                const lines = [` Total feedback: ${ctx.parsed.y.toLocaleString()}`]
                if (row?.daily) {
                  lines.push(` +${row.daily.toLocaleString()} today`)
                }
                return lines
              }
              return ` Daily feedback: ${ctx.parsed.y.toLocaleString()}`
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: CHART_COLORS.tick,
            font: { family: 'Inter', size: 10 },
            maxTicksLimit: 8,
            maxRotation: 0,
          },
          grid: { color: 'rgba(31,38,54,0.5)' },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: CHART_COLORS.tick,
            font: { family: 'Inter', size: 10 },
            precision: 0,
          },
          grid: { color: 'rgba(31,38,54,0.5)' },
        },
      },
    }),
  })
}

async function loadFeedback() {
  const status = document.getElementById('feedback-status')
  const graphStatus = document.getElementById('feedback-graph-status')
  const kpis = document.getElementById('feedback-kpis')
  const toolbar = document.getElementById('feedback-toolbar')
  const list = document.getElementById('feedback-list')
  const graphKpis = document.getElementById('feedback-graph-kpis')
  const graphChart = document.getElementById('feedback-growth-chart')

  setStatus(status, 'Loading feedback…')
  if (graphStatus) setStatus(graphStatus, 'Loading feedback…')
  kpis.hidden = true
  toolbar.hidden = true
  if (graphKpis) graphKpis.hidden = true
  if (graphChart) graphChart.hidden = true
  destroyFeedbackGrowthChart()
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
      if (graphStatus) setStatus(graphStatus, 'No feedback yet.', 'empty')
      return
    }

    setStatus(status, '')
    kpis.hidden = false
    toolbar.hidden = false
    renderFeedback()
  } catch (error) {
    state.loaded.feedback = false
    setStatus(status, formatError(error, 'feedback'), 'error')
    if (graphStatus) setStatus(graphStatus, formatError(error, 'feedback'), 'error')
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

function addUserToKey(map, key, fingerprint) {
  if (!fingerprint) return
  const k = key == null || key === '' ? '(empty)' : String(key)
  if (!map.has(k)) map.set(k, new Set())
  map.get(k).add(fingerprint)
}

function userSetsToCounts(map) {
  return new Map([...map.entries()].map(([k, set]) => [k, set.size]))
}

function formatChartDate(isoDay) {
  if (!isoDay) return ''
  const d = new Date(`${isoDay}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDay
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Cumulative unique users + daily active users, continuous calendar days. */
function buildUserGrowthSeries(rows) {
  const firstSeen = new Map()
  /** @type {Map<string, Set<string>>} */
  const dayUsers = new Map()

  for (const row of rows) {
    const fpRaw = row?.fingerprint
    const fingerprint =
      fpRaw != null && String(fpRaw).trim() !== '' ? String(fpRaw) : null
    if (!fingerprint) continue

    const created = rowCreatedAt(row)
    if (!created) continue

    const day = new Date(created)
    if (Number.isNaN(day.getTime())) continue

    const dayKey = day.toISOString().slice(0, 10)
    const existing = firstSeen.get(fingerprint)
    if (!existing || dayKey < existing) firstSeen.set(fingerprint, dayKey)

    if (!dayUsers.has(dayKey)) dayUsers.set(dayKey, new Set())
    dayUsers.get(dayKey).add(fingerprint)
  }

  const newUsersByDay = new Map()
  for (const day of firstSeen.values()) {
    newUsersByDay.set(day, (newUsersByDay.get(day) || 0) + 1)
  }

  const allDayKeys = [
    ...new Set([...newUsersByDay.keys(), ...dayUsers.keys()]),
  ].sort()
  if (!allDayKeys.length) return []

  const start = new Date(`${allDayKeys[0]}T12:00:00Z`)
  const end = new Date(`${allDayKeys[allDayKeys.length - 1]}T12:00:00Z`)
  const series = []
  let cumulative = 0

  for (let t = start.getTime(); t <= end.getTime(); t += 24 * 60 * 60 * 1000) {
    const dayKey = new Date(t).toISOString().slice(0, 10)
    const newUsers = newUsersByDay.get(dayKey) || 0
    const dau = dayUsers.get(dayKey)?.size || 0
    cumulative += newUsers
    series.push({
      day: dayKey,
      total: cumulative,
      newUsers,
      dau,
      // Active today, but first seen on an earlier day (repeat people inside DAU).
      returning: Math.max(0, dau - newUsers),
    })
  }

  return series
}

function mean(values) {
  if (!values.length) return 0
  return values.reduce((sum, n) => sum + n, 0) / values.length
}

function median(values) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

function percentile(values, p) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return sorted[idx]
}

function addDaysIso(isoDay, days) {
  const d = new Date(`${isoDay}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function daysBetweenIso(a, b) {
  const ms =
    new Date(`${b}T12:00:00Z`).getTime() - new Date(`${a}T12:00:00Z`).getTime()
  return Math.round(ms / (24 * 60 * 60 * 1000))
}

/** Engagement + on-screen chart metrics as plain text for pasting into AI. */
function buildYtMetricsText(rows) {
  const stats = aggregateYt(rows)
  const growth = buildUserGrowthSeries(rows)
  const generatedAt = new Date().toISOString()

  /** @type {Map<string, Set<string>>} */
  const dayUsers = new Map()
  /** @type {Map<string, number>} */
  const searchesByDay = new Map()
  /** @type {Map<string, number>} */
  const searchesByFp = new Map()

  for (const row of rows) {
    const fpRaw = row?.fingerprint
    const fingerprint =
      fpRaw != null && String(fpRaw).trim() !== '' ? String(fpRaw) : null
    if (!fingerprint) continue

    searchesByFp.set(fingerprint, (searchesByFp.get(fingerprint) || 0) + 1)

    const created = rowCreatedAt(row)
    if (!created) continue
    const day = new Date(created)
    if (Number.isNaN(day.getTime())) continue
    const dayKey = day.toISOString().slice(0, 10)

    if (!dayUsers.has(dayKey)) dayUsers.set(dayKey, new Set())
    dayUsers.get(dayKey).add(fingerprint)
    searchesByDay.set(dayKey, (searchesByDay.get(dayKey) || 0) + 1)
  }

  const dayKeys = [...dayUsers.keys()].sort()
  const lastDay = dayKeys[dayKeys.length - 1] || null

  const uniqueInWindow = (startDay, endDayInclusive) => {
    const set = new Set()
    for (const day of dayKeys) {
      if (day < startDay || day > endDayInclusive) continue
      dayUsers.get(day).forEach((fp) => set.add(fp))
    }
    return set.size
  }

  const dauLatest = lastDay ? dayUsers.get(lastDay).size : 0
  const wau = lastDay ? uniqueInWindow(addDaysIso(lastDay, -6), lastDay) : 0
  const mau = lastDay ? uniqueInWindow(addDaysIso(lastDay, -29), lastDay) : 0
  const dauSeries = dayKeys.map((day) => dayUsers.get(day).size)
  const searchesPerActive = dayKeys.map((day) => {
    const active = dayUsers.get(day).size || 1
    return (searchesByDay.get(day) || 0) / active
  })
  const searchesFpValues = [...searchesByFp.values()]
  const oneShot = searchesFpValues.filter((n) => n === 1).length

  const retentionFor = (horizon) => {
    if (!lastDay) return null
    const rates = []
    for (const day of dayKeys) {
      const target = addDaysIso(day, horizon)
      if (target > lastDay) continue
      const cohort = dayUsers.get(day)
      if (!cohort?.size) continue
      const later = dayUsers.get(target) || new Set()
      let hits = 0
      cohort.forEach((fp) => {
        if (later.has(fp)) hits += 1
      })
      rates.push((100 * hits) / cohort.size)
    }
    if (!rates.length) return null
    return {
      mean: mean(rates),
      median: median(rates),
      cohorts: rates.length,
    }
  }

  const d7 = retentionFor(7)
  const d30 = retentionFor(30)
  const firstDay = dayKeys[0] || null
  const spanDays =
    firstDay && lastDay ? daysBetweenIso(firstDay, lastDay) + 1 : 0

  const lines = []
  const push = (line = '') => lines.push(line)

  push('YouTube Filter Pro — metrics dump (for AI)')
  push(`Generated: ${generatedAt}`)
  push(`Source: yt_filter_pro_data (each row ≈ one search; users = fingerprints)`)
  push('')

  push('=== Overview KPIs ===')
  push(`Total searches: ${stats.total}`)
  push(`Unique users (fingerprints): ${stats.uniqueUsers}`)
  push(
    `Keyword include active: ${stats.keywordIncludeActive} users (${pct(stats.keywordIncludeActive, stats.uniqueUsers)})`,
  )
  push(
    `Any duration filter: ${stats.durationAny} users (${pct(stats.durationAny, stats.uniqueUsers)})`,
  )
  push(
    `Country filter active: ${stats.countryFilterActive} users (${pct(stats.countryFilterActive, stats.uniqueUsers)})`,
  )
  push(
    `Social links filter: ${stats.socialFilterActive} users (${pct(stats.socialFilterActive, stats.uniqueUsers)})`,
  )
  push(
    `Transparent mode: ${stats.transparentModeActive} users (${pct(stats.transparentModeActive, stats.uniqueUsers)})`,
  )
  push(
    `Rows with nested options: ${stats.usersWithOptions} users (${pct(stats.usersWithOptions, stats.uniqueUsers)})`,
  )
  push(`Date span: ${firstDay || 'n/a'} -> ${lastDay || 'n/a'} (${spanDays} days)`)
  push('')

  push('=== Engagement (unique fingerprints) ===')
  push(`As of: ${lastDay || 'n/a'}`)
  push(`DAU (latest day): ${dauLatest}`)
  push(`WAU (last 7 days): ${wau}`)
  push(`MAU (last 30 days): ${mau}`)
  push(`Mean DAU (all days): ${mean(dauSeries).toFixed(1)}`)
  push(`Median DAU: ${median(dauSeries).toFixed(1)}`)
  push(
    `Stickiness DAU/MAU: ${mau ? ((100 * dauLatest) / mau).toFixed(1) : '0.0'}%`,
  )
  push(
    `Stickiness WAU/MAU: ${mau ? ((100 * wau) / mau).toFixed(1) : '0.0'}%`,
  )
  push('')

  push('=== Searches per active user per day ===')
  push(`Mean: ${mean(searchesPerActive).toFixed(2)}`)
  push(`Median: ${median(searchesPerActive).toFixed(2)}`)
  push('')

  push('=== Retention (active on day X, also active on X+N) ===')
  if (d7) {
    push(
      `D7 mean: ${d7.mean.toFixed(1)}% | median: ${d7.median.toFixed(1)}% | cohorts: ${d7.cohorts}`,
    )
  } else {
    push('D7: n/a (not enough history)')
  }
  if (d30) {
    push(
      `D30 mean: ${d30.mean.toFixed(1)}% | median: ${d30.median.toFixed(1)}% | cohorts: ${d30.cohorts}`,
    )
  } else {
    push('D30: n/a (not enough history)')
  }
  push('')

  push('=== Searches per fingerprint (lifetime in dataset) ===')
  push(`Mean: ${mean(searchesFpValues).toFixed(2)}`)
  push(`Median: ${median(searchesFpValues).toFixed(2)}`)
  push(`P90: ${percentile(searchesFpValues, 90)}`)
  push(`Max: ${searchesFpValues.length ? Math.max(...searchesFpValues) : 0}`)
  push(
    `Exactly 1 search: ${oneShot} (${searchesFpValues.length ? ((100 * oneShot) / searchesFpValues.length).toFixed(1) : '0.0'}% of users)`,
  )
  push('')

  push('=== User growth (daily): date | total users | new | DAU | returning ===')
  if (!growth.length) {
    push('(no growth data)')
  } else {
    growth.forEach((row) => {
      push(
        `${row.day} | total=${row.total} | new=${row.newUsers} | dau=${row.dau} | returning=${row.returning}`,
      )
    })
  }
  push('')

  const featureTop = topEntries(stats.featureUsage, 10)
  push('=== Top 10 most used features (unique users) ===')
  if (!featureTop.length) {
    push('(none)')
  } else {
    featureTop.forEach(([key, count], i) => {
      push(`${i + 1}. ${formatFeatureLabel(key)}: ${count} users`)
      const picks = topEntries(stats.featurePicks.get(key) || new Map(), 10)
      picks.forEach(([pick, pickCount]) => {
        push(`   - ${formatPickLabel(pick)}: ${pickCount} users`)
      })
    })
  }
  push('')

  const subTop = topSubRanges(stats.subRanges, 10)
  push('=== Top subscriber ranges (unique users) ===')
  if (!subTop.length) {
    push('(none)')
  } else {
    subTop.forEach(([label, count], i) => {
      push(`${i + 1}. ${label}: ${count} users`)
    })
  }
  push('')

  push('=== Settings / display toggles ON (unique users with options payload) ===')
  const settingsDenom = stats.usersWithOptions || stats.uniqueUsers
  if (!settingsDenom) {
    push('(no options payloads yet — older rows only had filters)')
  } else {
    OPTION_ADOPTION_KEYS.forEach((key) => {
      const count = stats.optionAdoption.get(key) || 0
      push(
        `${optionUiLabel(key)}: ${count} (${pct(count, settingsDenom)} of users with options)`,
      )
    })
    push(
      `${optionUiLabel('filteredVideoStyle')}: ${stats.transparentModeActive} (${pct(stats.transparentModeActive, settingsDenom)})`,
    )
  }
  push('')

  push('=== Quick findings (engagement vs vanity) ===')
  push(
    `- Lifetime unique users (${stats.uniqueUsers}) only go up; DAU (${dauLatest}) / WAU (${wau}) / MAU (${mau}) measure real recent use.`,
  )
  push(
    `- Searches/active/day median ${median(searchesPerActive).toFixed(2)} vs mean ${mean(searchesPerActive).toFixed(2)}: prefer median if skewed by power users.`,
  )
  if (d7) {
    push(
      `- D7 retention ~${d7.mean.toFixed(1)}%: share of day-X actives who returned on day X+7 (habit signal).`,
    )
  } else {
    push('- D7 retention not measurable yet (need >= 8 days of history).')
  }
  if (d30) {
    push(`- D30 retention ~${d30.mean.toFixed(1)}%.`)
  } else {
    push('- D30 retention not measurable yet (need >= 31 days of history).')
  }
  push(
    `- ${searchesFpValues.length ? ((100 * oneShot) / searchesFpValues.length).toFixed(1) : '0'}% of users have exactly 1 search; median lifetime searches = ${median(searchesFpValues).toFixed(0)}.`,
  )
  if (growth.length >= 2) {
    const first = growth[0]
    const last = growth[growth.length - 1]
    push(
      `- Growth: total users ${first.total} -> ${last.total}; latest DAU ${last.dau}. If total climbs while DAU stays flat, installs are not sticking.`,
    )
  }
  push(
    `- Keyword include ${pct(stats.keywordIncludeActive, stats.uniqueUsers)} / duration filter ${pct(stats.durationAny, stats.uniqueUsers)} of users: feature adoption, not engagement depth.`,
  )

  return lines.join('\n')
}

async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return
    }
  } catch {
    /* fall through to execCommand */
  }

  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  ta.style.position = 'fixed'
  ta.style.left = '-9999px'
  document.body.appendChild(ta)
  ta.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(ta)
  if (!ok) throw new Error('copy failed')
}

function flashCopyHint(ok) {
  const hint = document.getElementById('yt-copy-hint')
  if (!hint) return
  hint.hidden = false
  hint.textContent = ok ? 'Copied' : 'Copy failed'
  hint.style.color = ok ? 'var(--CC__color-success)' : 'var(--CC__color-danger)'
  window.clearTimeout(flashCopyHint._timer)
  flashCopyHint._timer = window.setTimeout(() => {
    hint.hidden = true
  }, 2000)
}

async function copyYtMetricsForAi() {
  if (!state.ytRows?.length) {
    flashCopyHint(false)
    return
  }
  try {
    const text = buildYtMetricsText(state.ytRows)
    await copyTextToClipboard(text)
    flashCopyHint(true)
  } catch {
    flashCopyHint(false)
  }
}

function topEntries(map, limit = 8) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
}

function isDefaultSubRange(label) {
  const normalized = String(label).replace(/\s+/g, '').toLowerCase()
  return (
    normalized === '0–∞' ||
    normalized === '0-∞' ||
    normalized === '0–infinity' ||
    normalized === '0-infinity'
  )
}

function topSubRanges(map, limit = 10) {
  return [...map.entries()]
    .filter(([label]) => !isDefaultSubRange(label))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

function pct(part, total) {
  if (!total) return '0%'
  return `${Math.round((part / total) * 100)}%`
}

function isFeatureUsed(key, value) {
  if (value == null) return false

  // Nested options blob is expanded separately — never count as one feature.
  if (key === 'options' && typeof value === 'object' && !Array.isArray(value)) {
    return false
  }

  if (key.startsWith('options.')) {
    const optKey = key.slice('options.'.length)
    if (Object.prototype.hasOwnProperty.call(OPTION_DEFAULTS, optKey)) {
      return value !== OPTION_DEFAULTS[optKey]
    }
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return isGroupActive(value)
  }

  if (typeof value === 'boolean') return value === true

  if (typeof value === 'number') return !Number.isNaN(value)

  const str = String(value).trim()
  if (!str) return false

  // Always-present defaults shouldn't dominate "most used"
  if (key === 'shorts' && str === 'all') return false
  if (key === 'verified' && str === 'all') return false
  if (key === 'publishedPreset' && str === 'any') return false
  if (key === 'channelJoinedPreset' && str === 'any') return false

  return true
}

const PICK_LABELS = {
  any: 'Any time',
  all: 'All',
  specific: 'Specific range',
  custom: 'Custom date',
  remove: 'Remove filtered',
  transparent: 'Transparent mode',
  default: 'Default sort',
  date: 'Sort by date',
  views: 'Sort by views',
  viewsPerDay: 'Sort by views/day',
  likes: 'Sort by likes',
  subscribers: 'Sort by subscribers',
  duration: 'Sort by duration',
  channelVideos: 'Sort by channel videos',
  asc: 'Ascending',
  desc: 'Descending',
  hour: 'Last hour',
  today: 'Today',
  week: 'Last week',
  month: 'Last month',
  year: 'Last year',
  '1h': 'Last hour',
  '3h': 'Last 3 hours',
  '6h': 'Last 6 hours',
  '12h': 'Last 12 hours',
  '24h': 'Last 24 hours',
  '2d': 'Last 2 days',
  '3d': 'Last 3 days',
  '5d': 'Last 5 days',
  '1w': 'Last week',
  '2w': 'Last 2 weeks',
  '3w': 'Last 3 weeks',
  '15d': 'Last 15 days',
  '1m': 'Last month',
  '2m': 'Last 2 months',
  '3m': 'Last 3 months',
  '6m': 'Last 6 months',
  '9m': 'Last 9 months',
  '1y': 'Last year',
  '18m': 'Last 18 months',
  '2y': 'Last 2 years',
  '3y': 'Last 3 years',
  '5y': 'Last 5 years',
  '10y': 'Last 10 years',
  last_hour: 'Last hour',
  last_day: 'Last day',
  last_3_days: 'Last 3 days',
  last_7_days: 'Last 7 days',
  last_week: 'Last week',
  last_month: 'Last month',
  last_3_months: 'Last 3 months',
  last_6_months: 'Last 6 months',
  last_year: 'Last year',
  last_2_years: 'Last 2 years',
  last_5_years: 'Last 5 years',
  last_10_years: 'Last 10 years',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  x: 'X (Twitter)',
  linktree: 'Linktree',
  discord: 'Discord',
  twitch: 'Twitch',
  snapchat: 'Snapchat',
  pinterest: 'Pinterest',
  reddit: 'Reddit',
  patreon: 'Patreon',
  spotify: 'Spotify',
  linkedin: 'LinkedIn',
  threads: 'Threads',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  website: 'Website',
  only: 'Only',
  hide: 'Hide',
}

function formatPickLabel(raw) {
  const str = String(raw == null ? '' : raw).trim()
  if (!str) return '(empty)'
  if (PICK_LABELS[str]) return PICK_LABELS[str]
  if (PICK_LABELS[str.toLowerCase()]) return PICK_LABELS[str.toLowerCase()]

  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

/** Extract displayable "picks" from a feature value (scalars, tags, keyword lists). */
function extractFeaturePicks(value) {
  if (value == null) return []

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  if (typeof value === 'object') {
    const list =
      value.tags ||
      value.items ||
      value.keywords ||
      value.values ||
      value.list ||
      value.words ||
      value.channels
    if (Array.isArray(list) && list.length) {
      return list.map((item) => String(item).trim()).filter(Boolean)
    }
    if (value.count != null && Number(value.count) > 0) {
      return [`Active (${value.count})`]
    }
    return ['Active']
  }

  if (typeof value === 'boolean') return value ? ['true'] : []

  const str = String(value).trim()
  return str ? [str] : []
}

function addFeaturePick(featurePickUsers, featureKey, pick, fingerprint) {
  if (!fingerprint || !pick) return
  if (!featurePickUsers.has(featureKey)) featurePickUsers.set(featureKey, new Map())
  addUserToKey(featurePickUsers.get(featureKey), pick, fingerprint)
}

function aggregateYt(rows) {
  /** @type {Map<string, Set<string>>} subscriber range → unique fingerprints */
  const subRangeUsers = new Map()
  const dayUsers = new Map()
  const uniqueFingerprints = new Set()
  /** @type {Map<string, Set<string>>} feature key → unique fingerprints that used it */
  const featureUsers = new Map()
  /** @type {Map<string, Map<string, Set<string>>>} feature → pick → fingerprints */
  const featurePickUsers = new Map()
  /** @type {Map<string, Set<string>>} option key → users with that option ON / non-default style */
  const optionOnUsers = new Map()
  const keywordIncludeUsers = new Set()
  const durationUsers = new Set()
  const countryFilterUsers = new Set()
  const socialFilterUsers = new Set()
  const transparentModeUsers = new Set()
  const rowsWithOptions = new Set()

  let normalized = 0

  for (const row of rows) {
    const fpRaw = row?.fingerprint
    const fingerprint =
      fpRaw != null && String(fpRaw).trim() !== '' ? String(fpRaw) : null
    if (fingerprint) uniqueFingerprints.add(fingerprint)

    const filter = pickFilterObject(row)
    if (!filter) continue
    normalized += 1

    if (fingerprint) {
      const entries = Object.entries(filter)

      // Flatten nested options into options.* feature keys
      const opts =
        filter.options && typeof filter.options === 'object' && !Array.isArray(filter.options)
          ? filter.options
          : null
      if (opts) {
        rowsWithOptions.add(fingerprint)
        Object.entries(opts).forEach(([optKey, optVal]) => {
          entries.push([`options.${optKey}`, optVal])

          if (optKey === 'filteredVideoStyle' && optVal === 'transparent') {
            transparentModeUsers.add(fingerprint)
          }
          if (OPTION_ADOPTION_KEYS.includes(optKey) && optVal === true) {
            if (!optionOnUsers.has(optKey)) optionOnUsers.set(optKey, new Set())
            optionOnUsers.get(optKey).add(fingerprint)
          }
        })
      }

      entries.forEach(([key, value]) => {
        if (!isFeatureUsed(key, value)) return
        if (!featureUsers.has(key)) featureUsers.set(key, new Set())
        featureUsers.get(key).add(fingerprint)
        extractFeaturePicks(value).forEach((pick) => {
          addFeaturePick(featurePickUsers, key, pick, fingerprint)
        })
      })

      if (
        isGroupActive(filter.titleIncludes) ||
        isGroupActive(filter.descIncludes) ||
        isGroupActive(filter.channelIncludes) ||
        isGroupActive(filter.channelDescIncludes)
      ) {
        keywordIncludeUsers.add(fingerprint)
      }

      if (
        isGroupActive(filter.channelCountries) ||
        isGroupActive(filter.channelCountriesExclude)
      ) {
        countryFilterUsers.add(fingerprint)
      }

      if (isGroupActive(filter.channelSocialIncludes)) {
        socialFilterUsers.add(fingerprint)
      }

      const durationFields = [
        filter.durMinH,
        filter.durMinM,
        filter.durMinS,
        filter.durMaxH,
        filter.durMaxM,
        filter.durMaxS,
      ]
      if (durationFields.some(isFilled)) durationUsers.add(fingerprint)

      const subLabel = `${filter.subMin || '0'}–${filter.subMax || '∞'}`
      addUserToKey(subRangeUsers, subLabel, fingerprint)

      const created = rowCreatedAt(row)
      if (created) {
        const day = new Date(created)
        if (!Number.isNaN(day.getTime())) {
          addUserToKey(dayUsers, day.toISOString().slice(0, 10), fingerprint)
        }
      }
    }
  }

  const featureUsage = new Map(
    [...featureUsers.entries()].map(([key, set]) => [key, set.size]),
  )

  /** @type {Map<string, Map<string, number>>} */
  const featurePicks = new Map(
    [...featurePickUsers.entries()].map(([key, pickMap]) => [
      key,
      userSetsToCounts(pickMap),
    ]),
  )

  const subRanges = userSetsToCounts(subRangeUsers)
  const optionAdoption = userSetsToCounts(optionOnUsers)

  return {
    total: rows.length,
    normalized,
    uniqueUsers: uniqueFingerprints.size,
    featureUsage,
    featurePicks,
    subRanges,
    optionAdoption,
    usersWithOptions: rowsWithOptions.size,
    byDay: userSetsToCounts(dayUsers),
    keywordIncludeActive: keywordIncludeUsers.size,
    durationAny: durationUsers.size,
    countryFilterActive: countryFilterUsers.size,
    socialFilterActive: socialFilterUsers.size,
    transparentModeActive: transparentModeUsers.size,
  }
}

function destroyCharts() {
  YT_CHART_KEYS.forEach((key) => {
    const chart = state.charts[key]
    if (!chart) return
    try {
      chart.destroy()
    } catch {
      /* ignore */
    }
    delete state.charts[key]
  })
  const picks = document.getElementById('feature-picks')
  if (picks) picks.innerHTML = ''
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

  const featureTop = topEntries(stats.featureUsage, 10)
  state.charts.features = new Chart(document.getElementById('chart-features'), {
    type: 'bar',
    data: barData(
      featureTop.map(([key]) => formatFeatureLabel(key)),
      featureTop.map(([, count]) => count),
      CHART_COLORS.primary,
    ),
    options: barOpts,
  })
  renderFeaturePicks(featureTop, stats.featurePicks)

  const subTop = topSubRanges(stats.subRanges, 10)
  state.charts.subs = new Chart(document.getElementById('chart-subs'), {
    type: 'bar',
    data: barData(
      subTop.map(([label]) => label),
      subTop.map(([, count]) => count),
      CHART_COLORS.green,
    ),
    options: barOpts,
  })

  const settingsCanvas = document.getElementById('chart-settings')
  if (settingsCanvas) {
    const settingsDenom = stats.usersWithOptions || stats.uniqueUsers
    const settingsRows = OPTION_ADOPTION_KEYS.map((key) => ({
      key,
      count: stats.optionAdoption.get(key) || 0,
    }))
      .filter((row) => row.count > 0 || settingsDenom > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)

    // Always surface transparent mode as a pick-style row via feature usage if present
    const transparentCount = stats.transparentModeActive || 0

    state.charts.settings = new Chart(settingsCanvas, {
      type: 'bar',
      data: barData(
        [
          ...settingsRows.map((row) => optionUiLabel(row.key)),
          ...(transparentCount ? [optionUiLabel('filteredVideoStyle')] : []),
        ],
        [
          ...settingsRows.map((row) => row.count),
          ...(transparentCount ? [transparentCount] : []),
        ],
        CHART_COLORS.purple,
      ),
      options: barOpts,
    })
  }

  const growthSeries = buildUserGrowthSeries(state.ytRows)
  const growthCanvas = document.getElementById('chart-user-growth')
  if (growthCanvas && growthSeries.length) {
    const pointRadius = growthSeries.length > 40 ? 0 : 3
    const growthChart = new Chart(growthCanvas, {
      type: 'line',
      data: {
        labels: growthSeries.map((row) => formatChartDate(row.day)),
        datasets: [
          {
            label: 'Total users',
            data: growthSeries.map((row) => row.total),
            borderColor: CHART_COLORS.primary,
            borderWidth: 2.5,
            fill: false,
            tension: 0.35,
            pointRadius,
            pointBackgroundColor: CHART_COLORS.primary,
            pointBorderColor: CHART_COLORS.bg,
            pointBorderWidth: 2,
            pointHoverRadius: 6,
          },
          {
            label: 'Daily active users',
            data: growthSeries.map((row) => row.dau),
            borderColor: CHART_COLORS.blue,
            borderWidth: 2,
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            tension: 0.35,
            pointRadius,
            pointBackgroundColor: CHART_COLORS.blue,
            pointBorderColor: CHART_COLORS.bg,
            pointBorderWidth: 2,
            pointHoverRadius: 6,
          },
          {
            label: 'Returning daily users',
            data: growthSeries.map((row) => row.returning),
            borderColor: CHART_COLORS.green,
            borderWidth: 2,
            fill: false,
            tension: 0.35,
            pointRadius,
            pointBackgroundColor: CHART_COLORS.green,
            pointBorderColor: CHART_COLORS.bg,
            pointBorderWidth: 2,
            pointHoverRadius: 6,
          },
        ],
      },
      options: baseChartOptions({
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: CHART_COLORS.tick,
              font: { family: 'Inter', size: 11 },
              boxWidth: 10,
            },
          },
          tooltip: {
            ...baseChartOptions().plugins.tooltip,
            callbacks: {
              label: (ctx) => {
                const row = growthSeries[ctx.dataIndex]
                if (ctx.dataset.label === 'Total users') {
                  const lines = [` Total users: ${ctx.parsed.y.toLocaleString()}`]
                  if (row?.newUsers) {
                    lines.push(` +${row.newUsers.toLocaleString()} new`)
                  }
                  return lines
                }
                if (ctx.dataset.label === 'Returning daily users') {
                  const dau = row?.dau || 0
                  const pctReturning = dau ? Math.round((100 * ctx.parsed.y) / dau) : 0
                  return [
                    ` Returning daily: ${ctx.parsed.y.toLocaleString()}`,
                    ` ${pctReturning}% of DAU`,
                  ]
                }
                return ` Daily active: ${ctx.parsed.y.toLocaleString()}`
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: CHART_COLORS.tick,
              font: { family: 'Inter', size: 10 },
              maxTicksLimit: 8,
              maxRotation: 0,
            },
            grid: { color: 'rgba(31,38,54,0.5)' },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: CHART_COLORS.tick,
              font: { family: 'Inter', size: 10 },
              precision: 0,
            },
            grid: { color: 'rgba(31,38,54,0.5)' },
          },
        },
      }),
    })
    state.charts.userGrowth = growthChart
  }
}

function renderYtKpis() {
  const stats = aggregateYt(state.ytRows)

  document.getElementById('kpi-yt-total').textContent = String(stats.total)
  document.getElementById('kpi-yt-users').textContent = String(stats.uniqueUsers)
  document.getElementById('kpi-yt-keywords').textContent = pct(
    stats.keywordIncludeActive,
    stats.uniqueUsers,
  )
  document.getElementById('kpi-yt-duration').textContent = pct(
    stats.durationAny,
    stats.uniqueUsers,
  )

  const setKpi = (id, value) => {
    const el = document.getElementById(id)
    if (el) el.textContent = value
  }
  setKpi(
    'kpi-yt-country',
    pct(stats.countryFilterActive, stats.uniqueUsers),
  )
  setKpi(
    'kpi-yt-social',
    pct(stats.socialFilterActive, stats.uniqueUsers),
  )
  setKpi(
    'kpi-yt-transparent',
    pct(stats.transparentModeActive, stats.uniqueUsers),
  )
  setKpi(
    'kpi-yt-options',
    pct(stats.usersWithOptions, stats.uniqueUsers),
  )
}

function userLabel(count) {
  return `${count} ${count === 1 ? 'user' : 'users'}`
}

function renderFeaturePicks(featureTop, featurePicks) {
  const root = document.getElementById('feature-picks')
  if (!root) return

  if (!featureTop.length) {
    root.innerHTML = '<p class="admin__accordion-empty">No feature usage data yet.</p>'
    return
  }

  root.innerHTML = featureTop
    .map(([key, userCount]) => {
      const picks = topEntries(featurePicks.get(key) || new Map(), 10)
      const pickRows = picks.length
        ? picks
            .map(
              ([pick, count]) => `
            <li class="admin__accordion-pick">
              <span class="admin__accordion-pick-label">${escapeHtml(formatPickLabel(pick))}</span>
              <span class="admin__accordion-pick-count">${escapeHtml(userLabel(count))}</span>
            </li>`,
            )
            .join('')
        : '<li class="admin__accordion-empty">No picks recorded for this feature.</li>'

      return `
        <details class="admin__accordion">
          <summary class="admin__accordion-summary">
            <span class="admin__accordion-label">${escapeHtml(formatFeatureLabel(key))}</span>
            <span class="admin__accordion-count">${escapeHtml(userLabel(userCount))}</span>
          </summary>
          <ul class="admin__accordion-body">${pickRows}</ul>
        </details>`
    })
    .join('')
}

async function loadYt() {
  const status = document.getElementById('yt-status')
  const toolbar = document.getElementById('yt-toolbar')
  const kpis = document.getElementById('yt-kpis')
  const growth = document.getElementById('yt-user-growth')
  const charts = document.getElementById('yt-charts')

  setStatus(status, 'Loading YouTube Filter Pro data…')
  if (toolbar) toolbar.hidden = true
  kpis.hidden = true
  if (growth) growth.hidden = true
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
    if (toolbar) toolbar.hidden = false
    kpis.hidden = false
    if (growth) growth.hidden = false
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

document.getElementById('yt-copy-metrics')?.addEventListener('click', () => {
  copyYtMetricsForAi()
})

document.querySelectorAll('#feedback-toolbar .admin__toolbar-row .admin__chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    setFeedbackFilter(chip.dataset.filter)
    syncFeedbackFilterChips()
    renderFeedbackAppChips()
    renderFeedbackList()
  })
})

document.getElementById('feedback-app-chips')?.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-app-filter]')
  if (!chip) return
  setFeedbackAppFilter(chip.getAttribute('data-app-filter') || 'all')
  renderFeedbackAppChips()
  renderFeedbackList()
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
