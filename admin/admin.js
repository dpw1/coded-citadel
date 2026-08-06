/* global Chart */

const SUPABASE_URL = 'https://pinypmgcawshibcmyxqp.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpbnlwbWdjYXdzaGliY215eHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTA2OTMsImV4cCI6MjA5Mzc2NjY5M30.Oabrt3eiLuYA-Lr5uH4w9VPh_CWqQJ2uo-hE07WQsFM'

const READ_STORAGE_KEY = 'cc_admin_feedback_read' // legacy; migrated into settings store
const SETTINGS_STORAGE_KEY = 'cc_admin_settings'
const YT_CACHE_KEY = 'cc_admin_yt_filter_pro_cache'
/** Lightweight localStorage meta (savedAt only) — full rows live in IndexedDB. */
const YT_CACHE_META_KEY = 'cc_admin_yt_filter_pro_cache_meta'
const YT_IDB_NAME = 'cc_admin_yt_cache'
const YT_IDB_STORE = 'cache'
const YT_IDB_KEY = 'yt_filter_pro'
const YT_CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const FEEDBACK_CACHE_KEY = 'cc_admin_feedback_cache'
const FEEDBACK_CACHE_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours
const FEEDBACK_CONVERSION_CUTOFF_DAY = '2026-07-21'

/** Your extension fingerprint — YT Filter Pro Dev tab only. */
const YT_DEV_FINGERPRINT = '874b64d1a1272656edca6793be300565'

/**
 * Always excluded from the main "YT Filter Pro" analytics tab — even when the
 * extension-side blacklist is empty / inactive — so personal / test traffic
 * never mixes into real user metrics. These fingerprints only appear under
 * "YT Filter Pro — Dev".
 */
const YT_FINGERPRINT_BLACKLIST = new Set([
  YT_DEV_FINGERPRINT,
])

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
  /** Top-features chart: video filters */
  videoFeature: '#ff9900',
  /** Top-features chart: channel filters */
  channelFeature: '#3b82f6',
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
  requireEmailInDescription: 'Has email in video',
  channelJoinedPreset: 'Channel joined date',
  channelJoinedFrom: 'Joined from',
  channelJoinedTo: 'Joined until',
  channelIncludes: 'Channel tags',
  channelExclude: 'Exclude channels',
  videoType: 'Video type',
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

/**
 * Curated top-features chart groups (video vs channel).
 * Each group counts a user once if any member key was used.
 */
const FEATURE_CHART_GROUPS = [
  {
    id: 'publishedDate',
    label: 'Published date',
    category: 'video',
    keys: ['publishedPreset', 'dateFrom', 'dateTo'],
  },
  {
    id: 'duration',
    label: 'Duration',
    category: 'video',
    keys: ['durMinH', 'durMinM', 'durMinS', 'durMaxH', 'durMaxM', 'durMaxS'],
  },
  {
    id: 'views',
    label: 'Views',
    category: 'video',
    keys: ['viewMin', 'viewMax', 'viewsPerDayMin', 'viewsPerDayMax'],
  },
  {
    id: 'likes',
    label: 'Likes',
    category: 'video',
    keys: ['likesMin', 'likesMax'],
  },
  {
    id: 'titleIncludes',
    label: 'Title includes',
    category: 'video',
    keys: ['titleIncludes'],
  },
  {
    id: 'titleExcludes',
    label: 'Exclude from title',
    category: 'video',
    keys: ['titleExcludes'],
  },
  {
    id: 'descIncludes',
    label: 'Description includes',
    category: 'video',
    keys: ['descIncludes'],
  },
  {
    id: 'descExcludes',
    label: 'Description excludes',
    category: 'video',
    keys: ['descExcludes'],
  },
  {
    id: 'videoType',
    label: 'Shorts',
    category: 'video',
    keys: ['videoType', 'shorts'],
  },
  {
    id: 'subscribers',
    label: 'Subscribers',
    category: 'channel',
    keys: ['subMin', 'subMax'],
  },
  {
    id: 'channelVideos',
    label: 'Channel videos',
    category: 'channel',
    keys: ['channelVideosMin', 'channelVideosMax'],
  },
  {
    id: 'channelTags',
    label: 'Channel tags',
    category: 'channel',
    keys: ['channelIncludes'],
  },
  {
    id: 'channelExclude',
    label: 'Exclude channels',
    category: 'channel',
    keys: ['channelExclude'],
  },
  {
    id: 'country',
    label: 'Country',
    category: 'channel',
    keys: ['channelCountries'],
  },
  {
    id: 'countryExclude',
    label: 'Exclude country',
    category: 'channel',
    keys: ['channelCountriesExclude'],
  },
  {
    id: 'channelViews',
    label: 'Channel views',
    category: 'channel',
    keys: ['channelViewMin', 'channelViewMax'],
  },
  {
    id: 'channelDescIncludes',
    label: 'Channel description includes',
    category: 'channel',
    keys: ['channelDescIncludes'],
  },
  {
    id: 'channelDescExcludes',
    label: 'Channel description excludes',
    category: 'channel',
    keys: ['channelDescExcludes'],
  },
  {
    id: 'socialLinks',
    label: 'Social links',
    category: 'channel',
    keys: ['channelSocialIncludes'],
  },
  {
    id: 'hasEmail',
    label: 'Has email in video',
    category: 'channel',
    keys: ['requireEmailInDescription'],
  },
  {
    id: 'joinedDate',
    label: 'Joined date',
    category: 'channel',
    keys: ['channelJoinedPreset', 'channelJoinedFrom', 'channelJoinedTo'],
  },
  {
    id: 'verified',
    label: 'Verified',
    category: 'channel',
    keys: ['verified'],
  },
]

const FEATURE_CHART_GROUP_BY_ID = new Map(
  FEATURE_CHART_GROUPS.map((group) => [group.id, group]),
)

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
  // Auto-scroll is always on now — never count as a used feature.
  autoScrollOnFilter: true,
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
  const group = FEATURE_CHART_GROUP_BY_ID.get(key)
  if (group) return group.label
  const human = FEATURE_LABELS[key]
  if (human) return `${human} (${key})`
  // Fallback: split camelCase
  const spaced = String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase())
  return `${spaced} (${key})`
}

function featureChartBarColor(groupId) {
  const group = FEATURE_CHART_GROUP_BY_ID.get(groupId)
  if (group?.category === 'channel') return CHART_COLORS.channelFeature
  return CHART_COLORS.videoFeature
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
  feedbackEmailOnly: false,
  searchesWindow: '60m',
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
const VALID_TABS = new Set(['feedback', 'yt', 'yt-dev'])
const YT_CHART_KEYS = [
  'features',
  'featureDaily',
  'subs',
  'settings',
  'exports',
  'videoType',
  'userGrowth',
  'searchGrowth',
  'searchesWindow',
  'installChurn',
]
const EXPORT_FORMATS = ['csv', 'json', 'xlsx']
const VALID_SEARCHES_WINDOWS = new Set(['30m', '60m', '24h', '7d'])
const SEARCHES_WINDOW_MS = {
  '30m': 30 * 60 * 1000,
  '60m': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
}
/** Bucket size per window — denser bars for shorter ranges. */
const SEARCHES_WINDOW_BUCKET_MS = {
  '30m': 60 * 1000,
  '60m': 60 * 1000,
  '24h': 30 * 60 * 1000,
  '7d': 4 * 60 * 60 * 1000,
}
const SEARCHES_BAR_GREEN = '#3ecf8e'
const SEARCHES_BAR_BLUE = '#3b82f6'
const FEATURE_DAILY_TOP_N = 8
const FEATURE_LINE_COLORS = [
  '#ff9900',
  '#3b82f6',
  '#22c55e',
  '#a855f7',
  '#ef4444',
  '#06b6d4',
  '#eab308',
  '#f97316',
]

function getSearchesWindow() {
  const value = settings.get('searchesWindow')
  return VALID_SEARCHES_WINDOWS.has(value) ? value : '60m'
}

function setSearchesWindow(value) {
  const next = VALID_SEARCHES_WINDOWS.has(value) ? value : '60m'
  settings.set('searchesWindow', next)
  return next
}

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

function getFeedbackEmailOnly() {
  return settings.get('feedbackEmailOnly') === true
}

function setFeedbackEmailOnly(value) {
  const next = value === true
  settings.set('feedbackEmailOnly', next)
  return next
}

function getActiveTab() {
  const value = settings.get('activeTab')
  // Legacy tab removed — feedback graph now lives inside Feedback.
  if (value === 'feedback-graph') return 'feedback'
  return VALID_TABS.has(value) ? value : 'feedback'
}

function setActiveTab(value) {
  const normalized = value === 'feedback-graph' ? 'feedback' : value
  const next = VALID_TABS.has(normalized) ? normalized : 'feedback'
  settings.set('activeTab', next)
  return next
}

const state = {
  feedback: [],
  ytRows: [],
  charts: {},
  featureTooltip: null,
  loaded: { feedback: false, yt: false },
  feedbackLoading: false,
  feedbackLoadFailed: false,
  feedbackCacheSavedAt: null,
  ytLoading: false,
  ytCacheSavedAt: null,
  ytLastRefreshAttemptAt: null,
  /** @type {Map<string, number>} ISO day → daily uninstall count (all apps) */
  uninstallsByDay: new Map(),
  uninstallsLoaded: false,
  uninstallsLoadFailed: false,
}

function setYtTabStatus(status) {
  const el = document.getElementById('yt-tab-status')
  if (!el) return

  el.classList.remove(
    'admin__tab-status--loading',
    'admin__tab-status--ready',
    'admin__tab-status--error',
  )

  if (!status || status === 'idle') {
    el.hidden = true
    el.title = ''
    return
  }

  el.hidden = false
  if (status === 'loading') {
    el.classList.add('admin__tab-status--loading')
    el.title = 'Loading YouTube Filter Pro data…'
    return
  }
  if (status === 'ready') {
    el.classList.add('admin__tab-status--ready')
    const savedAt = state.ytCacheSavedAt
    el.title = savedAt
      ? `Loaded (cached ${new Date(savedAt).toLocaleString('en-US')})`
      : 'Loaded'
    return
  }
  if (status === 'error') {
    el.classList.add('admin__tab-status--error')
    el.title = 'Failed to load YouTube Filter Pro data'
  }
}

function openYtIdb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'))
      return
    }
    const req = indexedDB.open(YT_IDB_NAME, 1)
    req.onerror = () => reject(req.error || new Error('IndexedDB open failed'))
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(YT_IDB_STORE)) {
        db.createObjectStore(YT_IDB_STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
  })
}

function idbRequest(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function writeYtCacheMeta(savedAt, rowCount) {
  try {
    localStorage.setItem(
      YT_CACHE_META_KEY,
      JSON.stringify({ savedAt, rowCount: Number(rowCount) || 0 }),
    )
  } catch {
    /* ignore */
  }
}

function readYtCacheMeta() {
  try {
    const raw = localStorage.getItem(YT_CACHE_META_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const savedAt = Number(parsed?.savedAt)
    if (!Number.isFinite(savedAt)) return null
    return { savedAt, rowCount: Number(parsed?.rowCount) || 0 }
  } catch {
    return null
  }
}

function readYtCacheLocalStorage() {
  try {
    const raw = localStorage.getItem(YT_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (!Array.isArray(parsed.rows)) return null
    const savedAt = Number(parsed.savedAt)
    if (!Number.isFinite(savedAt)) return null
    return { rows: parsed.rows, savedAt }
  } catch {
    return null
  }
}

/** Prefer IndexedDB (large payloads); fall back to legacy localStorage blob. */
async function readYtCache() {
  try {
    const db = await openYtIdb()
    const tx = db.transaction(YT_IDB_STORE, 'readonly')
    const raw = await idbRequest(tx.objectStore(YT_IDB_STORE).get(YT_IDB_KEY))
    db.close()
    if (raw && typeof raw === 'object' && Array.isArray(raw.rows)) {
      const savedAt = Number(raw.savedAt)
      if (Number.isFinite(savedAt)) {
        writeYtCacheMeta(savedAt, raw.rows.length)
        return { rows: raw.rows, savedAt }
      }
    }
  } catch (error) {
    console.warn('YT IndexedDB cache read failed; trying localStorage.', error)
  }

  const legacy = readYtCacheLocalStorage()
  if (legacy) {
    writeYtCacheMeta(legacy.savedAt, legacy.rows.length)
    // Migrate oversized-capable path for next write.
    void writeYtCache(legacy.rows, legacy.savedAt)
  }
  return legacy
}

async function writeYtCache(rows, savedAt = Date.now()) {
  const payload = { savedAt, rows }
  try {
    const db = await openYtIdb()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(YT_IDB_STORE, 'readwrite')
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.objectStore(YT_IDB_STORE).put(payload, YT_IDB_KEY)
    })
    db.close()
    writeYtCacheMeta(savedAt, rows.length)
    try {
      localStorage.removeItem(YT_CACHE_KEY)
    } catch {
      /* ignore */
    }
    state.ytCacheSavedAt = savedAt
    updateCacheTimers()
    return true
  } catch (idbError) {
    console.warn('YT IndexedDB cache write failed; trying localStorage.', idbError)
  }

  try {
    localStorage.setItem(YT_CACHE_KEY, JSON.stringify(payload))
    writeYtCacheMeta(savedAt, rows.length)
    state.ytCacheSavedAt = savedAt
    updateCacheTimers()
    return true
  } catch (error) {
    console.warn(
      'Could not cache YT Filter Pro data (likely storage quota). Data will re-fetch on reload.',
      error,
    )
    state.ytCacheSavedAt = savedAt
    updateCacheTimers()
    return false
  }
}

function isYtCacheFresh(savedAt) {
  return Number.isFinite(savedAt) && Date.now() - savedAt < YT_CACHE_TTL_MS
}

function readFeedbackCache() {
  try {
    const raw = localStorage.getItem(FEEDBACK_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (!Array.isArray(parsed.rows)) return null
    const savedAt = Number(parsed.savedAt)
    if (!Number.isFinite(savedAt)) return null
    return { rows: parsed.rows, savedAt }
  } catch {
    return null
  }
}

function writeFeedbackCache(rows) {
  const savedAt = Date.now()
  try {
    localStorage.setItem(
      FEEDBACK_CACHE_KEY,
      JSON.stringify({
        savedAt,
        rows,
      }),
    )
    state.feedbackCacheSavedAt = savedAt
    updateCacheTimers()
    return true
  } catch (error) {
    console.warn('Could not cache feedback data:', error)
    state.feedbackCacheSavedAt = savedAt
    updateCacheTimers()
    return false
  }
}

function isFeedbackCacheFresh(savedAt) {
  return Number.isFinite(savedAt) && Date.now() - savedAt < FEEDBACK_CACHE_TTL_MS
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
  ids.forEach((id) => {
    if (id == null || id === '') return
    set.add(String(id))
  })
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

/** Compact span like "3 days", "2 weeks", "1 month". */
function formatDurationSpan(ms) {
  if (!Number.isFinite(ms) || ms < 0) return null
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return 'under a minute'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'}`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'}`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} day${day === 1 ? '' : 's'}`
  const week = Math.floor(day / 7)
  if (week < 5) return `${week} week${week === 1 ? '' : 's'}`
  const month = Math.floor(day / 30)
  if (month < 12) return `${month} month${month === 1 ? '' : 's'}`
  const year = Math.floor(day / 365)
  return `${year} year${year === 1 ? '' : 's'}`
}

/**
 * Per-fingerprint first activity + search count from yt_filter_pro_data
 * (approx. install / first use and lifetime searches).
 * @returns {{ firstSeen: Map<string, number>, searchCounts: Map<string, number> }}
 */
function buildYtUsageByFingerprint(rows = state.ytRows) {
  /** @type {Map<string, number>} */
  const firstSeen = new Map()
  /** @type {Map<string, number>} */
  const searchCounts = new Map()
  for (const row of rows || []) {
    const fp = normalizeDashboardFingerprint(ytRowFingerprint(row))
    if (!fp || isYtFingerprintBlacklisted(fp)) continue
    searchCounts.set(fp, (searchCounts.get(fp) || 0) + 1)
    const created = rowCreatedAt(row)
    if (!created) continue
    const ms = new Date(created).getTime()
    if (Number.isNaN(ms)) continue
    const existing = firstSeen.get(fp)
    if (existing == null || ms < existing) firstSeen.set(fp, ms)
  }
  return { firstSeen, searchCounts }
}

/**
 * Feedback card usage line: "N searches, used for X".
 * Legacy users share the same id across feedback + telemetry; newer installs may not.
 * @returns {string | null}
 */
function feedbackUsageSummaryLabel(row, usageByFp) {
  const fp = normalizeDashboardFingerprint(feedbackFingerprint(row))
  if (!fp || !usageByFp) return null

  const searches = usageByFp.searchCounts.get(fp) || 0
  const installMs = usageByFp.firstSeen.get(fp)
  const uninstallMs = feedbackCreatedAtMs(row)
  const duration =
    installMs != null && Number.isFinite(uninstallMs)
      ? formatDurationSpan(uninstallMs - installMs)
      : null

  if (!searches && !duration) return null

  const parts = []
  if (searches > 0) {
    parts.push(`${searches.toLocaleString('en-US')} search${searches === 1 ? '' : 'es'}`)
  } else {
    parts.push('0 searches')
  }
  if (duration) parts.push(`used for ${duration}`)
  return parts.join(', ')
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
  document.getElementById('panel-yt-dev').hidden = active !== 'yt-dev'

  if (active === 'yt' && state.loaded.yt) {
    requestAnimationFrame(() => renderYtCharts())
  }
  if (active === 'yt-dev' && state.loaded.yt) {
    requestAnimationFrame(() => renderYtDev())
  }
  if (active === 'feedback' && state.loaded.feedback) {
    requestAnimationFrame(() => renderFeedbackGraph())
  }
}

function syncFeedbackFilterChips() {
  const filter = getFeedbackFilter()
  document
    .querySelectorAll('#feedback-toolbar [data-filter]')
    .forEach((chip) => {
      chip.classList.toggle('admin__chip--active', chip.dataset.filter === filter)
    })

  const emailChip = document.getElementById('feedback-email-filter')
  if (emailChip) {
    const emailOnly = getFeedbackEmailOnly()
    const emailAllowed = filter !== 'all'
    emailChip.disabled = !emailAllowed
    emailChip.classList.toggle('admin__chip--active', emailAllowed && emailOnly)
    emailChip.setAttribute('aria-pressed', emailAllowed && emailOnly ? 'true' : 'false')
    emailChip.title = emailAllowed
      ? 'Only show feedback that includes an email'
      : 'Switch to Unread or Read to filter by email'
  }
}

function feedbackRowsForStatusFilter(filter = getFeedbackFilter()) {
  // Status "All" = every row. Contact filter only applies to Unread / Read.
  const emailOnly = filter !== 'all' && getFeedbackEmailOnly()
  return state.feedback.filter((row) => {
    const read = feedbackRowIsRead(row)
    if (filter === 'unread' && read) return false
    if (filter === 'read' && !read) return false
    if (emailOnly && !feedbackEmail(row)) return false
    return true
  })
}

function feedbackAppCounts(rows) {
  const counts = new Map()
  for (const row of rows) {
    const name = formatFeedbackAppName(row.app_name)
    counts.set(name, (counts.get(name) || 0) + 1)
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  const pinIndex = sorted.findIndex(([name]) => String(name).startsWith('Save to Google Drive'))
  if (pinIndex === -1 || pinIndex === sorted.length - 1) return sorted
  const [pinned] = sorted.splice(pinIndex, 1)
  sorted.push(pinned)
  return sorted
}

function renderFeedbackAppSelect() {
  const select = document.getElementById('feedback-app-select')
  const chips = document.getElementById('feedback-app-chips')
  if (!select && !chips) return

  const useChips = getFeedbackFilter() === 'unread'
  const scopedRows = feedbackRowsForStatusFilter()
  const counts = feedbackAppCounts(scopedRows)
  const total = scopedRows.length
  let active = getFeedbackAppFilter()
  if (active !== 'all' && !counts.some(([name]) => name === active)) {
    active = setFeedbackAppFilter('all')
  }

  if (select) {
    select.hidden = useChips
    select.setAttribute('aria-hidden', useChips ? 'true' : 'false')
    if (!useChips) {
      const options = [
        `<option value="all">All apps (${total})</option>`,
        ...counts.map(
          ([name, count]) =>
            `<option value="${escapeHtml(name)}">${escapeHtml(name)} (${count})</option>`,
        ),
      ]
      select.innerHTML = options.join('')
      select.value = active
    }
  }

  if (chips) {
    chips.hidden = !useChips
    chips.setAttribute('aria-hidden', useChips ? 'false' : 'true')
    if (useChips) {
      const chipHtml = [
        `<button type="button" class="admin__chip admin__chip--app${
          active === 'all' ? ' admin__chip--active' : ''
        }" data-app-filter="all" aria-pressed="${active === 'all'}">All <span class="admin__chip-count">(${total})</span></button>`,
        ...counts.map(([name, count]) => {
          const isActive = active === name
          return `<button type="button" class="admin__chip admin__chip--app${
            isActive ? ' admin__chip--active' : ''
          }" data-app-filter="${escapeHtml(name)}" aria-pressed="${isActive}">${escapeHtml(
            name,
          )} <span class="admin__chip-count">(${count})</span></button>`
        }),
      ]
      chips.innerHTML = chipHtml.join('')
    } else {
      chips.innerHTML = ''
    }
  }
}

function updateUpdatedAt() {
  document.getElementById('admin-updated').textContent =
    `Updated ${new Date().toLocaleString('en-US')}`
}

function formatCacheRemaining(ms) {
  if (!Number.isFinite(ms)) return '—'
  if (ms <= 0) return 'updating…'
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) {
    return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s remaining`
  }
  return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s remaining`
}

function cacheRemainingMs(savedAt, ttlMs) {
  if (!Number.isFinite(savedAt)) return null
  return savedAt + ttlMs - Date.now()
}

function resolveFeedbackCacheSavedAt() {
  if (Number.isFinite(state.feedbackCacheSavedAt)) return state.feedbackCacheSavedAt
  const cached = readFeedbackCache()
  if (cached) {
    state.feedbackCacheSavedAt = cached.savedAt
    return cached.savedAt
  }
  return null
}

function resolveYtCacheSavedAt() {
  if (Number.isFinite(state.ytCacheSavedAt)) return state.ytCacheSavedAt
  const meta = readYtCacheMeta()
  if (meta) {
    state.ytCacheSavedAt = meta.savedAt
    return meta.savedAt
  }
  const legacy = readYtCacheLocalStorage()
  if (legacy) {
    state.ytCacheSavedAt = legacy.savedAt
    return legacy.savedAt
  }
  return null
}

function updateCacheTimers() {
  const feedbackEl = document.getElementById('cache-timer-feedback')
  const ytEl = document.getElementById('cache-timer-yt')
  if (!feedbackEl || !ytEl) return

  const feedbackRemaining = cacheRemainingMs(
    resolveFeedbackCacheSavedAt(),
    FEEDBACK_CACHE_TTL_MS,
  )
  const ytRemaining = cacheRemainingMs(resolveYtCacheSavedAt(), YT_CACHE_TTL_MS)

  feedbackEl.textContent = state.feedbackLoading
    ? 'Feedback: updating…'
    : `Feedback: ${formatCacheRemaining(feedbackRemaining)}`

  ytEl.textContent = state.ytLoading
    ? 'YouTube Filter Pro: updating…'
    : `YouTube Filter Pro: ${formatCacheRemaining(ytRemaining)}`
}

function startCacheTimerTicker() {
  updateCacheTimers()
  window.setInterval(updateCacheTimers, 1000)
}

/* -------------------------------------------------------------------------- */
/* Feedback                                                                   */
/* -------------------------------------------------------------------------- */

function feedbackId(row) {
  if (row?.id != null && row.id !== '') return String(row.id)
  if (row?.created_at != null && row.created_at !== '') return String(row.created_at)
  return null
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
  // Feedback table PK is `id`. The extension/user key is ONLY `fingerprint`.
  const raw = row?.fingerprint
  if (raw == null) return null
  const value = String(raw).trim()
  return value && value !== 'anonymous' ? value : null
}

function ytRowFingerprint(row) {
  // yt_filter_pro_data PK is `id` (per search). User key is ONLY `fingerprint`.
  // Values may be legacy 32-char hex or post-migration UUIDs — treat as opaque strings.
  const raw = row?.fingerprint
  if (raw == null) return null
  const value = String(raw).trim()
  return value || null
}

/**
 * Strip internal FP-/UUID- bookkeeping prefixes if a value ever includes them.
 * Dashboard rows should already be unprefixed.
 */
function normalizeDashboardFingerprint(fp) {
  const value = String(fp || '').trim()
  if (!value) return ''
  if (value.startsWith('FP-')) return value.slice(3)
  if (value.startsWith('UUID-')) return value.slice(5)
  return value
}

function shortFingerprint(fp) {
  // Works for 32-char hex and UUID forms (truncation only; format-agnostic).
  const value = String(fp || '')
  if (value.length <= 16) return value
  return `${value.slice(0, 8)}…${value.slice(-4)}`
}

function feedbackEmail(row) {
  const raw = row?.email ?? row?.user_email ?? row?.contact_email ?? ''
  const value = String(raw).trim()
  if (!value || value === 'null' || value === 'undefined') return null
  return value
}

function formatFeedbackContactHtml(row) {
  const email = feedbackEmail(row)
  const fp = feedbackFingerprint(row)

  if (fp) {
    const emailAttr = email ? ` data-email="${escapeHtml(email)}"` : ''
    const emailHtml = email
      ? `<a class="admin__email-link" href="mailto:${escapeHtml(email)}" title="Email: ${escapeHtml(email)}">${escapeHtml(email)}</a>`
      : ''
    return `<span class="admin__feedback-contact"><button type="button" class="admin__fingerprint-btn" data-fingerprint="${escapeHtml(fp)}"${emailAttr} title="fingerprint: ${escapeHtml(fp)}">${escapeHtml(shortFingerprint(fp))}</button>${emailHtml}</span>`
  }

  if (email) {
    return `<a class="admin__email-link" href="mailto:${escapeHtml(email)}" title="Email: ${escapeHtml(email)}">${escapeHtml(email)}</a>`
  }

  return '<span>No fingerprint</span>'
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

function feedbackRowIsRead(row, readSet = getReadSet()) {
  const id = feedbackId(row)
  if (id != null && readSet.has(String(id))) return true
  // Legacy marks used created_at before rows consistently had an id.
  const created = row?.created_at
  if (created != null && readSet.has(String(created))) return true
  return false
}

function countUnreadFeedback() {
  return state.feedback.reduce((count, row) => count + (feedbackRowIsRead(row) ? 0 : 1), 0)
}

function renderFeedbackKpis() {
  const total = state.feedback.length
  const unread = countUnreadFeedback()
  const read = total - unread

  const totalEl = document.getElementById('kpi-feedback-total')
  const unreadEl = document.getElementById('kpi-feedback-unread')
  const readEl = document.getElementById('kpi-feedback-read')
  if (totalEl) totalEl.textContent = String(total)
  if (unreadEl) unreadEl.textContent = String(unread)
  if (readEl) readEl.textContent = String(read)

  const badge = document.getElementById('feedback-unread-badge')
  if (!badge) return
  if (unread > 0) {
    badge.hidden = false
    badge.textContent = String(unread)
  } else {
    badge.hidden = true
    badge.textContent = '0'
  }
}

function renderFeedbackList() {
  const list = document.getElementById('feedback-list')
  const filter = getFeedbackFilter()
  const appFilter = getFeedbackAppFilter()
  const emailOnly = filter !== 'all' && getFeedbackEmailOnly()

  const rows = state.feedback
    .filter((row) => {
      const read = feedbackRowIsRead(row)
      if (filter === 'unread' && read) return false
      if (filter === 'read' && !read) return false
      if (emailOnly && !feedbackEmail(row)) return false
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

  const usageByFp = state.loaded.yt ? buildYtUsageByFingerprint() : null

  list.innerHTML = rows
    .map((row) => {
      const id = feedbackId(row)
      if (id == null) return ''
      const read = feedbackRowIsRead(row)
      const usageLabel = feedbackUsageSummaryLabel(row, usageByFp)
      const usageHtml = usageLabel
        ? `<span class="admin__card-usage" title="Searches from Filter Pro analytics · time from first search to uninstall feedback">${escapeHtml(usageLabel)}</span>`
        : ''
      return `
        <article class="admin__card${read ? '' : ' admin__card--unread'}" data-id="${escapeHtml(id)}">
          <div class="admin__card-top">
            <div class="admin__card-meta">
              <span class="admin__card-app">${escapeHtml(formatFeedbackAppName(row.app_name))}</span>
              <span>${escapeHtml(formatDateWithRelative(row.created_at))}</span>
              ${usageHtml}
              ${formatFeedbackContactHtml(row)}
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
  // Update the counters first so they cannot be blocked by a later list/chip render.
  renderFeedbackKpis()
  syncFeedbackFilterChips()
  renderFeedbackAppSelect()
  renderFeedbackList()
  renderFeedbackGraph()
}

function shortFeatureLabel(key) {
  if (FEATURE_LABELS[key]) return FEATURE_LABELS[key]
  if (String(key).startsWith('options.')) {
    return optionUiLabel(String(key).slice('options.'.length))
  }
  return String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase())
}

function collectUsedFilterEntries(filter) {
  if (!filter || typeof filter !== 'object') return []

  const entries = Object.entries(filter)
  const opts =
    filter.options && typeof filter.options === 'object' && !Array.isArray(filter.options)
      ? filter.options
      : null
  if (opts) {
    Object.entries(opts).forEach(([optKey, optVal]) => {
      entries.push([`options.${optKey}`, optVal])
    })
  }

  const used = []
  for (const [key, value] of entries) {
    if (key === 'options' || key === 'event' || key === 'result_count' || key === 'results') continue
    if (!isFeatureUsed(key, value)) continue
    const picks = extractFeaturePicks(value).map(formatPickLabel)
    used.push({
      key,
      label: shortFeatureLabel(key),
      picks,
    })
  }
  return used
}

function ytRowEvent(row) {
  const top = row?.event != null ? String(row.event).trim() : ''
  if (top) return top
  const filter = pickFilterObject(row)
  const nested = filter?.event != null ? String(filter.event).trim() : ''
  if (nested) return nested
  if (filter?.startedTutorial === true) return 'started_tutorial'
  if (filter?.completedTutorial === true) return 'completed_tutorial'
  return 'filter_search'
}

/** Export format from export_results rows (`filter_data.format`). */
function ytRowExportFormat(row) {
  if (ytRowEvent(row) !== 'export_results') return null
  const filter = pickFilterObject(row)
  const raw = filter?.format ?? row?.format
  const value = String(raw || '').trim().toLowerCase()
  if (EXPORT_FORMATS.includes(value)) return value
  return value || 'unknown'
}

function ytRowResultCount(row) {
  const top = row?.result_count
  if (typeof top === 'number' && Number.isFinite(top)) return top
  if (typeof top === 'string' && top.trim() !== '' && Number.isFinite(Number(top))) {
    return Number(top)
  }
  const filter = pickFilterObject(row)
  const nested = filter?.results ?? filter?.result_count
  if (typeof nested === 'number' && Number.isFinite(nested)) return nested
  if (typeof nested === 'string' && nested.trim() !== '' && Number.isFinite(Number(nested))) {
    return Number(nested)
  }
  return null
}

function ytDevRows() {
  return (state.ytRows || []).filter(
    (row) => normalizeDashboardFingerprint(ytRowFingerprint(row)) === YT_DEV_FINGERPRINT,
  )
}

/** Main YT Filter Pro tab: all rows except always-blacklisted fingerprints. */
function ytRowsPublic() {
  return (state.ytRows || []).filter((row) => !isYtFingerprintBlacklisted(ytRowFingerprint(row)))
}

function isYtFingerprintBlacklisted(fingerprint) {
  const fp = normalizeDashboardFingerprint(fingerprint)
  return Boolean(fp) && YT_FINGERPRINT_BLACKLIST.has(fp)
}

function renderYtDev() {
  const status = document.getElementById('yt-dev-status')
  const note = document.getElementById('yt-dev-note')
  const kpis = document.getElementById('yt-dev-kpis')
  const list = document.getElementById('yt-dev-list')
  const fpEl = document.getElementById('yt-dev-fp')

  if (fpEl) fpEl.textContent = YT_DEV_FINGERPRINT

  if (!state.loaded.yt) {
    setStatus(status, 'Loading your YT Filter Pro data…')
    if (note) note.hidden = true
    if (kpis) kpis.hidden = true
    if (list) {
      list.hidden = true
      list.innerHTML = ''
    }
    return
  }

  const rows = ytDevRows()
    .slice()
    .sort((a, b) => {
      const am = new Date(rowCreatedAt(a) || 0).getTime()
      const bm = new Date(rowCreatedAt(b) || 0).getTime()
      return (Number.isNaN(bm) ? 0 : bm) - (Number.isNaN(am) ? 0 : am)
    })

  if (!rows.length) {
    setStatus(
      status,
      `No rows yet for fingerprint ${YT_DEV_FINGERPRINT}. Open a filtered search and click View Results, then Refresh.`,
      'empty',
    )
    if (note) note.hidden = false
    if (kpis) kpis.hidden = true
    if (list) {
      list.hidden = true
      list.innerHTML = ''
    }
    return
  }

  let searches = 0
  let views = 0
  let totalResults = 0
  let lastAt = null

  for (const row of rows) {
    const event = ytRowEvent(row)
    if (event === 'view_results') {
      views += 1
      const count = ytRowResultCount(row)
      if (count != null) totalResults += count
    } else {
      searches += 1
    }
    const created = rowCreatedAt(row)
    if (created && (!lastAt || new Date(created) > new Date(lastAt))) lastAt = created
  }

  setStatus(status, '')
  if (note) note.hidden = false
  if (kpis) kpis.hidden = false
  document.getElementById('kpi-yt-dev-total').textContent = String(rows.length)
  document.getElementById('kpi-yt-dev-searches').textContent = String(searches)
  document.getElementById('kpi-yt-dev-views').textContent = String(views)
  document.getElementById('kpi-yt-dev-results').textContent = String(totalResults)
  document.getElementById('kpi-yt-dev-avg').textContent = views
    ? String(Math.round((totalResults / views) * 10) / 10)
    : '0'
  document.getElementById('kpi-yt-dev-last').textContent = formatDateWithRelative(lastAt)

  if (list) {
    list.hidden = false
    list.innerHTML = rows
      .map((row) => {
        const event = ytRowEvent(row)
        const resultCount = ytRowResultCount(row)
        const filter = pickFilterObject(row)
        const used = collectUsedFilterEntries(filter)
        const filtersHtml = used.length
          ? used
              .map((item) => {
                const picks =
                  item.picks.length > 0
                    ? `: ${escapeHtml(item.picks.slice(0, 4).join(', '))}`
                    : ''
                return `<span class="admin__modal-tag">${escapeHtml(item.label)}${picks}</span>`
              })
              .join('')
          : '<span class="admin__modal-empty">Defaults only</span>'

        const eventLabel = event === 'view_results' ? 'View Results' : 'Filter search'
        const countHtml =
          event === 'view_results'
            ? `<strong>${resultCount == null ? '—' : resultCount}</strong> filtered results`
            : 'Search started (no result count)'
        return `
          <article class="admin__card">
            <div class="admin__card-top">
              <div class="admin__card-meta">
                <span class="admin__card-app">${escapeHtml(eventLabel)}</span>
                <span>${escapeHtml(formatDateWithRelative(rowCreatedAt(row)))}</span>
                <span>${countHtml}</span>
              </div>
              <span class="admin__card-badge ${
                event === 'view_results'
                  ? 'admin__card-badge--unread'
                  : 'admin__card-badge--read'
              }">${escapeHtml(event)}</span>
            </div>
            <div class="admin__card-body">
              <div class="admin__modal-tags">${filtersHtml}</div>
            </div>
          </article>`
      })
      .join('')
  }
}

function summarizeYtFingerprint(fingerprint) {
  const fp = normalizeDashboardFingerprint(fingerprint)
  const rows = (state.ytRows || []).filter(
    (row) => normalizeDashboardFingerprint(ytRowFingerprint(row)) === fp,
  )

  const daySet = new Set()
  const featureCounts = new Map()
  const searches = []
  let firstSeen = null
  let lastSeen = null

  for (const row of rows) {
    const created = rowCreatedAt(row)
    const createdMs = created ? new Date(created).getTime() : NaN
    if (!Number.isNaN(createdMs)) {
      if (firstSeen == null || createdMs < firstSeen) firstSeen = createdMs
      if (lastSeen == null || createdMs > lastSeen) lastSeen = createdMs
      daySet.add(new Date(createdMs).toISOString().slice(0, 10))
    }

    const filter = pickFilterObject(row)
    const used = collectUsedFilterEntries(filter)
    used.forEach((item) => {
      featureCounts.set(item.key, (featureCounts.get(item.key) || 0) + 1)
    })

    searches.push({
      createdAt: created,
      createdMs: Number.isNaN(createdMs) ? 0 : createdMs,
      used,
    })
  }

  searches.sort((a, b) => b.createdMs - a.createdMs)

  const topFilters = [...featureCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => ({
      key,
      label: shortFeatureLabel(key),
      count,
    }))

  return {
    fingerprint: fp,
    searches: rows.length,
    activeDays: daySet.size,
    firstSeen,
    lastSeen,
    topFilters,
    recentSearches: searches.slice(0, 25),
  }
}

function closeFingerprintModal() {
  const modal = document.getElementById('fingerprint-modal')
  if (!modal) return
  modal.hidden = true
  document.body.style.overflow = ''
}

function openFingerprintModal(fingerprint, { email = null } = {}) {
  const modal = document.getElementById('fingerprint-modal')
  const title = document.getElementById('fingerprint-modal-title')
  const body = document.getElementById('fingerprint-modal-body')
  if (!modal || !title || !body) return

  const fp = normalizeDashboardFingerprint(fingerprint)
  const emailFromFeedback =
    String(email || '').trim() ||
    feedbackEmail(
      state.feedback.find(
        (row) => normalizeDashboardFingerprint(feedbackFingerprint(row)) === fp,
      ) || {},
    ) ||
    null
  title.textContent = emailFromFeedback || fp || 'Unknown user'

  const contactHtml = `
    <div class="admin__modal-contact">
      ${
        emailFromFeedback
          ? `<a class="admin__email-link" href="mailto:${escapeHtml(emailFromFeedback)}">${escapeHtml(emailFromFeedback)}</a>`
          : '<span class="admin__modal-empty">No email on file</span>'
      }
      ${
        fp
          ? `<code class="admin__modal-fp">${escapeHtml(fp)}</code>`
          : ''
      }
    </div>
  `

  if (!fp) {
    body.innerHTML = `${contactHtml}<p class="admin__modal-empty">No fingerprint on this feedback row.</p>`
    modal.hidden = false
    document.body.style.overflow = 'hidden'
    return
  }

  if (!state.loaded.yt) {
    body.innerHTML =
      `${contactHtml}<p class="admin__modal-empty">YT Filter Pro data is still loading. Try again in a moment.</p>`
    modal.hidden = false
    document.body.style.overflow = 'hidden'
    return
  }

  const summary = summarizeYtFingerprint(fp)

  if (!summary.searches) {
    body.innerHTML = `
      ${contactHtml}
      <p class="admin__modal-empty">
        No YT Filter Pro searches found for user id <code>${escapeHtml(fp)}</code>.
        They may have uninstalled without ever searching, analytics were off, or
        (on newer installs) feedback/uninstall uses a separate id from anonymous usage telemetry.
      </p>`
    modal.hidden = false
    document.body.style.overflow = 'hidden'
    return
  }

  const topFiltersHtml = summary.topFilters.length
    ? `<div class="admin__modal-tags">${summary.topFilters
        .slice(0, 20)
        .map(
          (item) =>
            `<span class="admin__modal-tag">${escapeHtml(item.label)} <strong>×${item.count}</strong></span>`,
        )
        .join('')}</div>`
    : '<p class="admin__modal-empty">No non-default filters recorded.</p>'

  const searchesHtml = summary.recentSearches
    .map((search, index) => {
      const filters =
        search.used.length > 0
          ? search.used
              .map((item) => {
                const picks =
                  item.picks.length > 0 ? `: ${item.picks.slice(0, 3).join(', ')}` : ''
                return `<span>${escapeHtml(item.label)}${escapeHtml(picks)}</span>`
              })
              .join('')
          : '<span>Defaults only</span>'

      return `
        <article class="admin__modal-search">
          <div class="admin__modal-search-top">
            <span>Search #${summary.searches - index}</span>
            <span>${escapeHtml(formatDateWithRelative(search.createdAt))}</span>
          </div>
          <div class="admin__modal-search-filters">${filters}</div>
        </article>`
    })
    .join('')

  body.innerHTML = `
    ${contactHtml}
    <div class="admin__modal-kpis">
      <div class="admin__modal-kpi">
        <div class="admin__modal-kpi-label">Searches</div>
        <div class="admin__modal-kpi-value">${summary.searches}</div>
      </div>
      <div class="admin__modal-kpi">
        <div class="admin__modal-kpi-label">Active days</div>
        <div class="admin__modal-kpi-value">${summary.activeDays}</div>
      </div>
      <div class="admin__modal-kpi">
        <div class="admin__modal-kpi-label">First seen</div>
        <div class="admin__modal-kpi-value" style="font-size:0.85rem">${escapeHtml(
          formatDate(summary.firstSeen ? new Date(summary.firstSeen).toISOString() : null),
        )}</div>
      </div>
      <div class="admin__modal-kpi">
        <div class="admin__modal-kpi-label">Last seen</div>
        <div class="admin__modal-kpi-value" style="font-size:0.85rem">${escapeHtml(
          formatDate(summary.lastSeen ? new Date(summary.lastSeen).toISOString() : null),
        )}</div>
      </div>
    </div>
    <section class="admin__modal-section">
      <h3 class="admin__modal-section-title">Filters used across searches</h3>
      ${topFiltersHtml}
    </section>
    <section class="admin__modal-section">
      <h3 class="admin__modal-section-title">Recent searches${
        summary.searches > 25 ? ` (latest 25 of ${summary.searches})` : ''
      }</h3>
      <div class="admin__modal-searches">${searchesHtml}</div>
    </section>
  `

  modal.hidden = false
  document.body.style.overflow = 'hidden'
}

/** Cumulative + daily uninstall feedback counts by calendar day (+ optional uninstalls). */
function buildFeedbackGrowthSeries(rows, uninstallsByDay = state.uninstallsByDay) {
  const byDay = new Map()

  for (const row of rows) {
    const created = row?.created_at
    if (!created) continue
    const day = new Date(created)
    if (Number.isNaN(day.getTime())) continue
    const dayKey = day.toISOString().slice(0, 10)
    byDay.set(dayKey, (byDay.get(dayKey) || 0) + 1)
  }

  const dayKeys = [
    ...new Set([...byDay.keys(), ...uninstallsByDay.keys()]),
  ].sort()
  if (!dayKeys.length) return []

  const start = new Date(`${dayKeys[0]}T12:00:00Z`)
  const end = new Date(`${dayKeys[dayKeys.length - 1]}T12:00:00Z`)
  const series = []
  let cumulative = 0

  for (let t = start.getTime(); t <= end.getTime(); t += 24 * 60 * 60 * 1000) {
    const dayKey = new Date(t).toISOString().slice(0, 10)
    const daily = byDay.get(dayKey) || 0
    cumulative += daily
    series.push({
      day: dayKey,
      daily,
      total: cumulative,
      uninstalls: uninstallsByDay.get(dayKey) || 0,
    })
  }

  return series
}

function uninstallsMapFromDailyFile(data) {
  /** @type {Map<string, number>} */
  const byDay = new Map()
  for (const row of data?.daily || []) {
    const day = String(row?.date || '').trim()
    if (!day) continue
    byDay.set(day, Number(row.total) || 0)
  }
  return byDay
}

async function loadUninstallsByDay() {
  const data = window.CC_ADMIN_UNINSTALLS
  state.uninstallsByDay = uninstallsMapFromDailyFile(data)
  state.uninstallsLoaded = state.uninstallsByDay.size > 0
  state.uninstallsLoadFailed = !state.uninstallsLoaded
  if (!state.uninstallsLoaded) {
    console.warn(
      'No uninstall data loaded. Regenerate it with npm run generate-portfolio-analytics.',
    )
  }

  const graphPanel = document.getElementById('panel-feedback')
  if (state.loaded.feedback && graphPanel && !graphPanel.hidden) {
    // Do not wait for unrelated YT/Supabase work before applying local uninstall data.
    requestAnimationFrame(() => {
      renderFeedbackGraph()
    })
  }
  return state.uninstallsByDay
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

function feedbackConversionForPeriod({ startDay = null, endDay }) {
  let feedback = 0
  for (const row of state.feedback) {
    const created = row?.created_at
    if (!created) continue
    const date = new Date(created)
    if (Number.isNaN(date.getTime())) continue
    const day = date.toISOString().slice(0, 10)
    if (startDay && day < startDay) continue
    if (day > endDay) continue
    feedback += 1
  }

  let uninstalls = 0
  for (const [day, count] of state.uninstallsByDay) {
    if (startDay && day < startDay) continue
    if (day > endDay) continue
    uninstalls += Number(count) || 0
  }

  return {
    feedback,
    uninstalls,
    rate: uninstalls > 0 ? (100 * feedback) / uninstalls : 0,
  }
}

function renderFeedbackConversionKpi(prefix, conversion) {
  document.getElementById(`kpi-fg-${prefix}-uninstalls`).textContent =
    conversion.uninstalls.toLocaleString('en-US')
  document.getElementById(`kpi-fg-${prefix}-feedback`).textContent =
    conversion.feedback.toLocaleString('en-US')
  document.getElementById(`kpi-fg-${prefix}-rate`).textContent =
    `${conversion.rate.toFixed(1)}%`
}

function renderFeedbackGraphKpis(series) {
  const total = state.feedback.length
  const withComments = state.feedback.filter(feedbackHasComment).length
  const todayKey = new Date().toISOString().slice(0, 10)
  const today = series.find((row) => row.day === todayKey)?.daily ?? 0
  const throughJuly21 = feedbackConversionForPeriod({
    endDay: FEEDBACK_CONVERSION_CUTOFF_DAY,
  })

  document.getElementById('kpi-fg-total').textContent = String(total)
  document.getElementById('kpi-fg-comments').textContent = String(withComments)
  document.getElementById('kpi-fg-today').textContent = String(today)
  renderFeedbackConversionKpi('pre', throughJuly21)
}

function renderFeedbackGraph() {
  const status = document.getElementById('feedback-graph-status')
  const kpis = document.getElementById('feedback-graph-kpis')
  const chartWrap = document.getElementById('feedback-growth-chart')
  const canvas = document.getElementById('chart-feedback-growth')
  if (!kpis || !chartWrap) return

  destroyFeedbackGrowthChart()

  if (!state.loaded.feedback) {
    if (status) setStatus(status, 'Loading feedback…')
    kpis.hidden = true
    chartWrap.hidden = true
    return
  }

  if (!state.feedback.length) {
    if (status) setStatus(status, 'No feedback yet.', 'empty')
    kpis.hidden = true
    chartWrap.hidden = true
    return
  }

  const series = buildFeedbackGrowthSeries(state.feedback, state.uninstallsByDay)
  if (status) setStatus(status, '')
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
        {
          label: 'Daily uninstalls',
          data: series.map((row) => row.uninstalls),
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
              const row = series[ctx.dataIndex]
              if (ctx.dataset.label === 'Total feedback') {
                const lines = [` Total feedback: ${ctx.parsed.y.toLocaleString()}`]
                if (row?.daily) {
                  lines.push(` +${row.daily.toLocaleString()} today`)
                }
                return lines
              }
              if (ctx.dataset.label === 'Daily uninstalls') {
                return ` Daily uninstalls: ${ctx.parsed.y.toLocaleString()}`
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

async function loadFeedback({ force = false } = {}) {
  const status = document.getElementById('feedback-status')
  const graphStatus = document.getElementById('feedback-graph-status')
  const kpis = document.getElementById('feedback-kpis')
  const toolbar = document.getElementById('feedback-toolbar')
  const list = document.getElementById('feedback-list')
  const graphKpis = document.getElementById('feedback-graph-kpis')
  const graphChart = document.getElementById('feedback-growth-chart')
  state.feedbackLoadFailed = false

  const applyFeedbackRows = (rows, { fromCache = false } = {}) => {
    state.feedback = rows
    state.loaded.feedback = true

    if (!rows.length) {
      setStatus(
        status,
        'Got 0 rows from "feedback". If you see rows in the Supabase Table Editor, anon SELECT is blocked by RLS (PostgREST returns [] instead of an error).\n\nIn Supabase → SQL Editor, run:\n\ncreate policy "anon_select_feedback"\n  on public.feedback for select to anon using (true);',
        'error',
      )
      if (graphStatus) setStatus(graphStatus, 'No feedback yet.', 'empty')
      kpis.hidden = true
      toolbar.hidden = true
      if (graphKpis) graphKpis.hidden = true
      if (graphChart) graphChart.hidden = true
      destroyFeedbackGrowthChart()
      list.innerHTML = ''
      return false
    }

    const cacheNote =
      fromCache && state.feedbackCacheSavedAt
        ? `Showing cached data from ${new Date(state.feedbackCacheSavedAt).toLocaleString('en-US')}.`
        : ''
    setStatus(status, cacheNote)
    if (graphStatus) setStatus(graphStatus, '')
    kpis.hidden = false
    toolbar.hidden = false
    renderFeedback()
    return true
  }

  const cached = readFeedbackCache()
  if (cached) state.feedbackCacheSavedAt = cached.savedAt

  if (!force && cached && isFeedbackCacheFresh(cached.savedAt)) {
    applyFeedbackRows(cached.rows, { fromCache: true })
    return
  }

  if (!force && cached?.rows?.length) {
    applyFeedbackRows(cached.rows, { fromCache: true })
  } else if (force && state.feedback.length) {
    // keep UI while refreshing
  } else {
    setStatus(status, 'Loading feedback…')
    if (graphStatus) setStatus(graphStatus, 'Loading feedback…')
    kpis.hidden = true
    toolbar.hidden = true
    if (graphKpis) graphKpis.hidden = true
    if (graphChart) graphChart.hidden = true
    destroyFeedbackGrowthChart()
    list.innerHTML = ''
  }

  if (state.feedbackLoading) return
  state.feedbackLoading = true

  try {
    const rows = await fetchAllRows('feedback', 'created_at')
    writeFeedbackCache(rows)
    applyFeedbackRows(rows, { fromCache: false })
  } catch (error) {
    if (!state.loaded.feedback) {
      state.loaded.feedback = false
      state.feedbackLoadFailed = true
      setStatus(status, formatError(error, 'feedback'), 'error')
      if (graphStatus) setStatus(graphStatus, formatError(error, 'feedback'), 'error')
    } else {
      console.warn('Feedback refresh failed; keeping cached data.', error)
    }
  } finally {
    state.feedbackLoading = false
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
    'event',
    'result_count',
    'results',
    'extension_version',
    'page_path',
  ])
  const flat = {}
  let hits = 0
  for (const [key, value] of Object.entries(row || {})) {
    if (meta.has(key)) continue
    flat[key] = value
    if (
      [
        'publishedPreset',
        'videoType',
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

/** True when this search used Shorts (`videoType` or legacy `shorts: only`). */
function filterUsesShorts(filter) {
  if (!filter || typeof filter !== 'object') return false
  if (String(filter.videoType || '').trim() === 'shorts') return true
  if (String(filter.shorts || '').trim() === 'only') return true
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

/**
 * Cumulative + daily filter_search counts (mirrors user-growth chart shape).
 * @returns {Array<{ day: string, total: number, daily: number, users: number }>}
 */
function buildSearchGrowthSeries(rows) {
  /** @type {Map<string, number>} */
  const searchesByDay = new Map()
  /** @type {Map<string, Set<string>>} */
  const usersByDay = new Map()

  for (const row of rows) {
    if (ytRowEvent(row) !== 'filter_search') continue
    const created = rowCreatedAt(row)
    if (!created) continue
    const day = new Date(created)
    if (Number.isNaN(day.getTime())) continue
    const dayKey = day.toISOString().slice(0, 10)
    searchesByDay.set(dayKey, (searchesByDay.get(dayKey) || 0) + 1)
    const fp = normalizeDashboardFingerprint(ytRowFingerprint(row))
    if (fp) {
      if (!usersByDay.has(dayKey)) usersByDay.set(dayKey, new Set())
      usersByDay.get(dayKey).add(fp)
    }
  }

  const allDayKeys = [...new Set([...searchesByDay.keys(), ...usersByDay.keys()])].sort()
  if (!allDayKeys.length) return []

  const start = new Date(`${allDayKeys[0]}T12:00:00Z`)
  const end = new Date(`${allDayKeys[allDayKeys.length - 1]}T12:00:00Z`)
  const series = []
  let cumulative = 0

  for (let t = start.getTime(); t <= end.getTime(); t += 24 * 60 * 60 * 1000) {
    const dayKey = new Date(t).toISOString().slice(0, 10)
    const daily = searchesByDay.get(dayKey) || 0
    cumulative += daily
    series.push({
      day: dayKey,
      total: cumulative,
      daily,
      users: usersByDay.get(dayKey)?.size || 0,
    })
  }

  return series
}

/**
 * Which curated feature groups are active on a filter payload.
 * @returns {Set<string>}
 */
function activeFeatureGroupIds(filter) {
  /** @type {Set<string>} */
  const active = new Set()
  if (!filter || typeof filter !== 'object') return active

  /** @type {Map<string, unknown>} */
  const usedByKey = new Map()
  Object.entries(filter).forEach(([key, value]) => {
    if (key === 'event' || key === 'result_count' || key === 'results' || key === 'options') {
      return
    }
    if (!isFeatureUsed(key, value)) return
    usedByKey.set(key, value)
  })

  FEATURE_CHART_GROUPS.forEach((group) => {
    if (group.keys.some((key) => usedByKey.has(key))) active.add(group.id)
  })
  return active
}

/**
 * Daily unique users per filter group + DAU (filter-search users that day).
 * @returns {{
 *   days: string[],
 *   dau: number[],
 *   lines: Array<{ id: string, label: string, category: string, users: number[], pct: number[] }>
 * }}
 */
function buildFeatureDailySeries(rows, topN = FEATURE_DAILY_TOP_N) {
  /** @type {Map<string, Set<string>>} day → DAU fingerprints */
  const dauByDay = new Map()
  /** @type {Map<string, Map<string, Set<string>>>} day → groupId → fingerprints */
  const featureByDay = new Map()
  /** @type {Map<string, Set<string>>} groupId → all-time fingerprints (for ranking) */
  const allTimeUsers = new Map()

  for (const row of rows || []) {
    const event = ytRowEvent(row)
    if (event === 'started_tutorial' || event === 'completed_tutorial') continue
    if (event === 'export_results') continue

    const fingerprint = normalizeDashboardFingerprint(ytRowFingerprint(row))
    if (!fingerprint) continue

    const filter = pickFilterObject(row)
    if (!filter) continue

    const created = rowCreatedAt(row)
    if (!created) continue
    const day = new Date(created)
    if (Number.isNaN(day.getTime())) continue
    const dayKey = day.toISOString().slice(0, 10)

    if (!dauByDay.has(dayKey)) dauByDay.set(dayKey, new Set())
    dauByDay.get(dayKey).add(fingerprint)

    const groups = activeFeatureGroupIds(filter)
    if (!groups.size) continue

    if (!featureByDay.has(dayKey)) featureByDay.set(dayKey, new Map())
    const dayMap = featureByDay.get(dayKey)
    groups.forEach((groupId) => {
      if (!dayMap.has(groupId)) dayMap.set(groupId, new Set())
      dayMap.get(groupId).add(fingerprint)
      if (!allTimeUsers.has(groupId)) allTimeUsers.set(groupId, new Set())
      allTimeUsers.get(groupId).add(fingerprint)
    })
  }

  const days = [...dauByDay.keys()].sort()
  if (!days.length) {
    return { days: [], dau: [], lines: [] }
  }

  // Fill calendar gaps between first and last day so lines stay continuous.
  const start = new Date(`${days[0]}T12:00:00`)
  const end = new Date(`${days[days.length - 1]}T12:00:00`)
  /** @type {string[]} */
  const calendar = []
  for (let t = start.getTime(); t <= end.getTime(); t += 24 * 60 * 60 * 1000) {
    calendar.push(new Date(t).toISOString().slice(0, 10))
  }

  const topIds = [...allTimeUsers.entries()]
    .sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]))
    .slice(0, topN)
    .map(([id]) => id)

  const dau = calendar.map((day) => dauByDay.get(day)?.size || 0)

  const lines = topIds.map((id) => {
    const group = FEATURE_CHART_GROUP_BY_ID.get(id)
    const users = calendar.map((day) => featureByDay.get(day)?.get(id)?.size || 0)
    const pct = users.map((n, i) => {
      const denom = dau[i]
      return denom ? Math.round((1000 * n) / denom) / 10 : 0
    })
    return {
      id,
      label: group?.label || formatFeatureLabel(id),
      category: group?.category || 'video',
      users,
      pct,
    }
  })

  return { days: calendar, dau, lines }
}

function featureDailyLineColor(line, index) {
  if (line.category === 'channel') {
    const channelColors = ['#3b82f6', '#06b6d4', '#6366f1', '#0ea5e9']
    return channelColors[index % channelColors.length]
  }
  return FEATURE_LINE_COLORS[index % FEATURE_LINE_COLORS.length]
}

function renderFeatureDailyChart(rows) {
  const canvas = document.getElementById('chart-feature-daily')
  const card = document.getElementById('yt-feature-daily')
  if (!canvas || typeof Chart === 'undefined') return

  const series = buildFeatureDailySeries(rows)
  if (!series.days.length || !series.lines.length) {
    if (card) card.hidden = true
    return
  }
  if (card) card.hidden = false

  const pointRadius = series.days.length > 40 ? 0 : 2
  state.charts.featureDaily = new Chart(canvas, {
    type: 'line',
    data: {
      labels: series.days.map((day) => formatChartDate(day)),
      datasets: series.lines.map((line, index) => {
        const color = featureDailyLineColor(line, index)
        return {
          label: line.label,
          data: line.pct,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          fill: false,
          tension: 0.35,
          pointRadius,
          pointHoverRadius: 5,
          pointBackgroundColor: color,
          pointBorderColor: CHART_COLORS.bg,
          pointBorderWidth: 1.5,
        }
      }),
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
            padding: 12,
          },
        },
        tooltip: {
          ...baseChartOptions().plugins.tooltip,
          callbacks: {
            title: (items) => {
              const idx = items?.[0]?.dataIndex
              if (idx == null) return ''
              return formatChartDate(series.days[idx])
            },
            afterTitle: (items) => {
              const idx = items?.[0]?.dataIndex
              if (idx == null) return ''
              const dau = series.dau[idx] || 0
              return `Daily active users: ${dau.toLocaleString()}`
            },
            label: (ctx) => {
              const line = series.lines[ctx.datasetIndex]
              const idx = ctx.dataIndex
              const users = line?.users[idx] || 0
              const dau = series.dau[idx] || 0
              const pctVal = line?.pct[idx] || 0
              return ` ${line?.label || ctx.dataset.label}: ${users.toLocaleString()} / ${dau.toLocaleString()} users (${pctVal}%)`
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: CHART_COLORS.tick,
            font: { family: 'Inter', size: 10 },
            maxTicksLimit: 10,
            maxRotation: 0,
          },
          grid: { color: 'rgba(31,38,54,0.5)' },
        },
        y: {
          beginAtZero: true,
          suggestedMax: 100,
          ticks: {
            color: CHART_COLORS.tick,
            font: { family: 'Inter', size: 10 },
            callback: (value) => `${value}%`,
          },
          grid: { color: 'rgba(31,38,54,0.5)' },
          title: {
            display: true,
            text: '% of daily active users',
            color: CHART_COLORS.tick,
            font: { family: 'Inter', size: 10 },
          },
        },
      },
    }),
  })
}

/** Cumulative unique users + daily active users, continuous calendar days. */
function buildUserGrowthSeries(rows) {
  const firstSeen = new Map()
  /** @type {Map<string, Set<string>>} */
  const dayUsers = new Map()
  /** @type {Map<string, Map<string, number>>} day → fingerprint → searches that day */
  const dayFpSearches = new Map()

  for (const row of rows) {
    const event = ytRowEvent(row)
    if (event === 'started_tutorial' || event === 'completed_tutorial') continue

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

    if (!dayFpSearches.has(dayKey)) dayFpSearches.set(dayKey, new Map())
    const fpMap = dayFpSearches.get(dayKey)
    fpMap.set(fingerprint, (fpMap.get(fingerprint) || 0) + 1)
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
    const users = dayUsers.get(dayKey)
    const dau = users?.size || 0
    const fpSearches = dayFpSearches.get(dayKey) || new Map()

    const dauSearchCounts = []
    const returningSearchCounts = []
    if (users) {
      for (const fp of users) {
        const count = fpSearches.get(fp) || 0
        dauSearchCounts.push(count)
        if (firstSeen.get(fp) && firstSeen.get(fp) < dayKey) {
          returningSearchCounts.push(count)
        }
      }
    }

    cumulative += newUsers
    series.push({
      day: dayKey,
      total: cumulative,
      newUsers,
      dau,
      // Active today, but first seen on an earlier day (repeat people inside DAU).
      returning: Math.max(0, dau - newUsers),
      dauMedianSearches: median(dauSearchCounts),
      returningMedianSearches: median(returningSearchCounts),
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
  push(`Source: yt_filter_pro_data (each row ≈ one search; users = anonymous ids)`)
  push('')

  push('=== Overview KPIs ===')
  push(`Total searches: ${stats.total}`)
  push(`Unique users (anonymous ids): ${stats.uniqueUsers}`)
  push(`Total exports: ${stats.totalExports} (${stats.exportUsers} unique users)`)
  push(
    `Tutorials started: ${stats.totalStartedTutorials} (${stats.startedTutorialUsers} unique users)`,
  )
  push(
    `Tutorials completed: ${stats.totalCompletedTutorials} (${stats.completedTutorialUsers} unique users)`,
  )
  push(
    `Tutorial completion rate: ${pct(stats.totalCompletedTutorials, stats.totalStartedTutorials)}`,
  )
  EXPORT_FORMATS.forEach((fmt) => {
    push(`  ${fmt.toUpperCase()}: ${stats.exportsByFormat.get(fmt) || 0}`)
  })
  ;[...stats.exportsByFormat.entries()]
    .filter(([fmt]) => !EXPORT_FORMATS.includes(fmt))
    .forEach(([fmt, count]) => push(`  ${String(fmt).toUpperCase()}: ${count}`))
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
    `Used Shorts filter: ${stats.shortsUsers} users (${pct(stats.shortsUsers, stats.filterActivityUsers || stats.uniqueUsers)})`,
  )
  push(
    `Videos only (never Shorts): ${stats.videosOnlyUsers} users (${pct(stats.videosOnlyUsers, stats.filterActivityUsers || stats.uniqueUsers)})`,
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

  const latestGrowth = growth.length ? growth[growth.length - 1] : null
  push('=== Median searches / user (same-day intensity) ===')
  if (latestGrowth) {
    push(
      `Latest day (${latestGrowth.day}) median searches / DAU: ${Number(latestGrowth.dauMedianSearches).toFixed(2)}`,
    )
    push(
      `Latest day (${latestGrowth.day}) median searches / returning: ${Number(latestGrowth.returningMedianSearches).toFixed(2)}`,
    )
    const dauMedians = growth.map((row) => row.dauMedianSearches).filter((n) => n > 0)
    const returningMedians = growth
      .map((row) => row.returningMedianSearches)
      .filter((n) => n > 0)
    push(`Mean of daily DAU medians: ${mean(dauMedians).toFixed(2)}`)
    push(`Mean of daily returning medians: ${mean(returningMedians).toFixed(2)}`)
  } else {
    push('(no growth data)')
  }
  push('')

  push(
    '=== User growth (daily): date | total | new | DAU | returning | med searches DAU | med searches returning ===',
  )
  if (!growth.length) {
    push('(no growth data)')
  } else {
    growth.forEach((row) => {
      push(
        `${row.day} | total=${row.total} | new=${row.newUsers} | dau=${row.dau} | returning=${row.returning} | medDau=${Number(row.dauMedianSearches).toFixed(1)} | medReturning=${Number(row.returningMedianSearches).toFixed(1)}`,
      )
    })
  }
  push('')

  const featureTop = topEntries(stats.featureUsage, 20)
  push('=== Top 20 most used features (unique users; video vs channel) ===')
  if (!featureTop.length) {
    push('(none)')
  } else {
    featureTop.forEach(([key, count], i) => {
      const group = FEATURE_CHART_GROUP_BY_ID.get(key)
      const category = group?.category || 'unknown'
      push(`${i + 1}. [${category}] ${formatFeatureLabel(key)}: ${count} users`)
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
  const rows = ytRowsPublic()
  if (!rows.length) {
    flashCopyHint(false)
    return
  }
  try {
    const text = buildYtMetricsText(rows)
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

  // Auto-scroll is always on — never count it as a used feature.
  if (key === 'options.autoScrollOnFilter' || key === 'autoScrollOnFilter') {
    return false
  }

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
  if (key === 'videoType' && (str === 'videos' || str === 'all')) return false
  if (key === 'shorts' && (str === 'all' || str === 'videos')) return false
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
  videos: 'Videos',
  shorts: 'Shorts',
}

function formatPickLabel(raw) {
  const str = String(raw == null ? '' : raw).trim()
  if (!str) return '(empty)'
  // Already-formatted range / duration labels — keep as-is.
  if (
    /^Min\s/i.test(str) ||
    /:\s*Min\s/i.test(str) ||
    str.includes(' · ') ||
    str.includes(' – ')
  ) {
    return str
  }
  if (PICK_LABELS[str]) return PICK_LABELS[str]
  if (PICK_LABELS[str.toLowerCase()]) return PICK_LABELS[str.toLowerCase()]

  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

function formatNumberPick(value) {
  const n = Number(value)
  if (Number.isFinite(n)) return n.toLocaleString('en-US')
  const str = String(value ?? '').trim()
  return str || '0'
}

/** Always show both bounds so a lone "10000" never appears without context. */
function formatMinMaxPick(minVal, maxVal) {
  const minLabel = isFilled(minVal) ? formatNumberPick(minVal) : '0'
  const maxLabel = isFilled(maxVal) ? formatNumberPick(maxVal) : '∞'
  return `Min ${minLabel} · Max ${maxLabel}`
}

function formatDurationBound(h, m, s) {
  const parts = []
  const hours = isFilled(h) ? Number(h) : 0
  const mins = isFilled(m) ? Number(m) : 0
  const secs = isFilled(s) ? Number(s) : 0
  if (Number.isFinite(hours) && hours > 0) parts.push(`${hours}h`)
  if (Number.isFinite(mins) && mins > 0) parts.push(`${mins}m`)
  if (Number.isFinite(secs) && secs > 0) parts.push(`${secs}s`)
  return parts.length ? parts.join(' ') : '0'
}

/**
 * Build human-readable picks for a curated chart group.
 * Min/max fields are always shown together as a range.
 */
function extractChartGroupPicks(group, filter, usedByKey) {
  switch (group.id) {
    case 'subscribers':
      return [formatMinMaxPick(filter.subMin, filter.subMax)]
    case 'likes':
      return [formatMinMaxPick(filter.likesMin, filter.likesMax)]
    case 'channelVideos':
      return [formatMinMaxPick(filter.channelVideosMin, filter.channelVideosMax)]
    case 'channelViews':
      return [formatMinMaxPick(filter.channelViewMin, filter.channelViewMax)]
    case 'views': {
      const picks = []
      if (usedByKey.has('viewMin') || usedByKey.has('viewMax')) {
        picks.push(`Views: ${formatMinMaxPick(filter.viewMin, filter.viewMax)}`)
      }
      if (usedByKey.has('viewsPerDayMin') || usedByKey.has('viewsPerDayMax')) {
        picks.push(
          `Views/day: ${formatMinMaxPick(filter.viewsPerDayMin, filter.viewsPerDayMax)}`,
        )
      }
      return picks
    }
    case 'duration': {
      const minLabel = formatDurationBound(
        filter.durMinH,
        filter.durMinM,
        filter.durMinS,
      )
      const maxUsed =
        usedByKey.has('durMaxH') ||
        usedByKey.has('durMaxM') ||
        usedByKey.has('durMaxS')
      const maxLabel = maxUsed
        ? formatDurationBound(filter.durMaxH, filter.durMaxM, filter.durMaxS)
        : '∞'
      return [`Min ${minLabel} · Max ${maxLabel}`]
    }
    case 'publishedDate': {
      const picks = []
      if (
        usedByKey.has('publishedPreset') &&
        isFeatureUsed('publishedPreset', filter.publishedPreset)
      ) {
        picks.push(...extractFeaturePicks(filter.publishedPreset))
      }
      if (usedByKey.has('dateFrom') || usedByKey.has('dateTo')) {
        const from = isFilled(filter.dateFrom) ? String(filter.dateFrom).trim() : '…'
        const to = isFilled(filter.dateTo) ? String(filter.dateTo).trim() : '…'
        picks.push(`From ${from} · To ${to}`)
      }
      return picks.length ? picks : extractFeaturePicks(filter.publishedPreset)
    }
    case 'joinedDate': {
      const picks = []
      if (
        usedByKey.has('channelJoinedPreset') &&
        isFeatureUsed('channelJoinedPreset', filter.channelJoinedPreset)
      ) {
        picks.push(...extractFeaturePicks(filter.channelJoinedPreset))
      }
      if (usedByKey.has('channelJoinedFrom') || usedByKey.has('channelJoinedTo')) {
        const from = isFilled(filter.channelJoinedFrom)
          ? String(filter.channelJoinedFrom).trim()
          : '…'
        const to = isFilled(filter.channelJoinedTo)
          ? String(filter.channelJoinedTo).trim()
          : '…'
        picks.push(`From ${from} · To ${to}`)
      }
      return picks.length
        ? picks
        : extractFeaturePicks(filter.channelJoinedPreset)
    }
    case 'videoType': {
      if (filterUsesShorts(filter)) return ['Shorts']
      if (usedByKey.has('videoType')) return extractFeaturePicks(filter.videoType)
      if (usedByKey.has('shorts')) return extractFeaturePicks(filter.shorts)
      return ['Shorts']
    }
    default: {
      const picks = []
      group.keys.forEach((key) => {
        if (!usedByKey.has(key)) return
        extractFeaturePicks(usedByKey.get(key)).forEach((pick) => picks.push(pick))
      })
      return picks
    }
  }
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
  /** @type {Map<string, Set<string>>} curated chart group → fingerprints */
  const featureGroupUsers = new Map()
  /** @type {Map<string, Map<string, Set<string>>>} curated group → pick → fingerprints */
  const featureGroupPickUsers = new Map()
  /** @type {Map<string, Set<string>>} option key → users with that option ON / non-default style */
  const optionOnUsers = new Map()
  const keywordIncludeUsers = new Set()
  const durationUsers = new Set()
  const countryFilterUsers = new Set()
  const socialFilterUsers = new Set()
  const transparentModeUsers = new Set()
  const shortsUsers = new Set()
  const filterActivityUsers = new Set()
  const rowsWithOptions = new Set()
  /** @type {Map<string, number>} format → export event count */
  const exportsByFormat = new Map(EXPORT_FORMATS.map((fmt) => [fmt, 0]))
  const exportUsers = new Set()
  let totalExports = 0
  let totalStartedTutorials = 0
  let totalCompletedTutorials = 0
  const startedTutorialUsers = new Set()
  const completedTutorialUsers = new Set()

  let normalized = 0
  /** @type {Map<string, number>} */
  const searchesByFp = new Map()
  let activityRowCount = 0

  for (const row of rows) {
    const fpRaw = row?.fingerprint
    const fingerprint =
      fpRaw != null && String(fpRaw).trim() !== '' ? String(fpRaw) : null

    const event = ytRowEvent(row)
    if (event === 'started_tutorial') {
      totalStartedTutorials += 1
      if (fingerprint) {
        startedTutorialUsers.add(fingerprint)
        uniqueFingerprints.add(fingerprint)
      }
      continue
    }
    if (event === 'completed_tutorial') {
      totalCompletedTutorials += 1
      if (fingerprint) {
        completedTutorialUsers.add(fingerprint)
        uniqueFingerprints.add(fingerprint)
      }
      continue
    }

    activityRowCount += 1
    if (fingerprint) {
      uniqueFingerprints.add(fingerprint)
      searchesByFp.set(fingerprint, (searchesByFp.get(fingerprint) || 0) + 1)
    }

    if (event === 'export_results') {
      totalExports += 1
      const format = ytRowExportFormat(row) || 'unknown'
      exportsByFormat.set(format, (exportsByFormat.get(format) || 0) + 1)
      if (fingerprint) exportUsers.add(fingerprint)
      continue
    }

    const filter = pickFilterObject(row)
    if (!filter) continue
    normalized += 1

    if (fingerprint) {
      filterActivityUsers.add(fingerprint)
      if (filterUsesShorts(filter)) shortsUsers.add(fingerprint)

      const entries = Object.entries(filter)

      // Flatten nested options into options.* feature keys
      const opts =
        filter.options && typeof filter.options === 'object' && !Array.isArray(filter.options)
          ? filter.options
          : null
      if (opts) {
        rowsWithOptions.add(fingerprint)
        Object.entries(opts).forEach(([optKey, optVal]) => {
          // Auto-scroll is always on — skip entirely.
          if (optKey === 'autoScrollOnFilter') return
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

      /** @type {Map<string, unknown>} */
      const usedByKey = new Map()
      entries.forEach(([key, value]) => {
        if (key === 'event' || key === 'result_count' || key === 'results') return
        if (!isFeatureUsed(key, value)) return
        usedByKey.set(key, value)
        if (!featureUsers.has(key)) featureUsers.set(key, new Set())
        featureUsers.get(key).add(fingerprint)
        extractFeaturePicks(value).forEach((pick) => {
          addFeaturePick(featurePickUsers, key, pick, fingerprint)
        })
      })

      FEATURE_CHART_GROUPS.forEach((group) => {
        const activeKeys = group.keys.filter((key) => usedByKey.has(key))
        if (!activeKeys.length) return
        if (!featureGroupUsers.has(group.id)) featureGroupUsers.set(group.id, new Set())
        featureGroupUsers.get(group.id).add(fingerprint)
        extractChartGroupPicks(group, filter, usedByKey).forEach((pick) => {
          addFeaturePick(featureGroupPickUsers, group.id, pick, fingerprint)
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
    [...featureGroupUsers.entries()].map(([key, set]) => [key, set.size]),
  )

  /** @type {Map<string, Map<string, number>>} */
  const featurePicks = new Map(
    [...featureGroupPickUsers.entries()].map(([key, pickMap]) => [
      key,
      userSetsToCounts(pickMap),
    ]),
  )

  const subRanges = userSetsToCounts(subRangeUsers)
  const optionAdoption = userSetsToCounts(optionOnUsers)
  const searchesPerUser = [...searchesByFp.values()]
  let videosOnlyUsers = 0
  for (const fp of filterActivityUsers) {
    if (!shortsUsers.has(fp)) videosOnlyUsers += 1
  }

  return {
    total: activityRowCount,
    normalized,
    uniqueUsers: uniqueFingerprints.size,
    searchesPerUserMean: mean(searchesPerUser),
    searchesPerUserMedian: median(searchesPerUser),
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
    shortsUsers: shortsUsers.size,
    videosOnlyUsers,
    filterActivityUsers: filterActivityUsers.size,
    totalExports,
    exportUsers: exportUsers.size,
    exportsByFormat,
    totalStartedTutorials,
    totalCompletedTutorials,
    startedTutorialUsers: startedTutorialUsers.size,
    completedTutorialUsers: completedTutorialUsers.size,
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
  hideFeaturePicksTooltip()
}

/** @returns {Array<{ day: string, installs: number, uninstalls: number }>} */
function buildYtInstallChurnSeries(data = window.CC_ADMIN_YT_FILTER_CHURN) {
  /** @type {Map<string, number>} */
  const installsByDay = new Map()
  /** @type {Map<string, number>} */
  const uninstallsByDay = new Map()

  for (const row of data?.installs || []) {
    const day = String(row?.date || '').trim()
    if (!day) continue
    installsByDay.set(day, Number(row.total) || 0)
  }
  for (const row of data?.uninstalls || []) {
    const day = String(row?.date || '').trim()
    if (!day) continue
    uninstallsByDay.set(day, Number(row.total) || 0)
  }

  return [...new Set([...installsByDay.keys(), ...uninstallsByDay.keys()])]
    .sort()
    .map((day) => ({
      day,
      installs: installsByDay.get(day) || 0,
      uninstalls: uninstallsByDay.get(day) || 0,
    }))
}

function renderYtInstallChurnChart() {
  const canvas = document.getElementById('chart-yt-install-churn')
  if (!canvas || typeof Chart === 'undefined') return

  const series = buildYtInstallChurnSeries()
  const card = document.getElementById('yt-install-churn')
  if (!series.length) {
    if (card) card.hidden = true
    return
  }
  if (card) card.hidden = false

  const pointRadius = series.length > 40 ? 0 : 3
  state.charts.installChurn = new Chart(canvas, {
    type: 'line',
    data: {
      labels: series.map((row) => formatChartDate(row.day)),
      datasets: [
        {
          label: 'Installs',
          data: series.map((row) => row.installs),
          borderColor: CHART_COLORS.green,
          borderWidth: 2.5,
          fill: true,
          backgroundColor: 'rgba(34, 197, 94, 0.12)',
          tension: 0.35,
          pointRadius,
          pointBackgroundColor: CHART_COLORS.green,
          pointBorderColor: CHART_COLORS.bg,
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
        {
          label: 'Uninstalls',
          data: series.map((row) => row.uninstalls),
          borderColor: '#ef4444',
          borderWidth: 2,
          fill: false,
          tension: 0.35,
          pointRadius,
          pointBackgroundColor: '#ef4444',
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
              const value = ctx.parsed.y.toLocaleString()
              if (ctx.dataset.label === 'Installs') {
                const net = (row?.installs || 0) - (row?.uninstalls || 0)
                const netLabel = net >= 0 ? `+${net}` : String(net)
                return [` Installs: ${value}`, ` Net: ${netLabel}`]
              }
              return ` Uninstalls: ${value}`
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
  const backgroundColor = Array.isArray(color)
    ? color
    : labels.map(() => color)
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor,
        borderRadius: 3,
        maxBarThickness: 28,
      },
    ],
  }
}

function renderYtCharts() {
  const rows = ytRowsPublic()
  destroyCharts()
  renderYtInstallChurnChart()
  if (!state.loaded.yt || !rows.length) return

  const stats = aggregateYt(rows)

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

  const featureTop = topEntries(stats.featureUsage, 20)
  state.featureTooltip = {
    featureTop,
    featurePicks: stats.featurePicks,
    openIndex: null,
  }
  renderFeatureDailyChart(rows)
  state.charts.features = new Chart(document.getElementById('chart-features'), {
    type: 'bar',
    data: barData(
      featureTop.map(([key]) => formatFeatureLabel(key)),
      featureTop.map(([, count]) => count),
      featureTop.map(([key]) => featureChartBarColor(key)),
    ),
    options: {
      ...barOpts,
      onClick: (event, elements, chart) => {
        if (!elements.length) return
        const index = elements[0].index
        const meta = chart.getDatasetMeta(0)
        const bar = meta?.data?.[index]
        openFeaturePicksTooltip(index, {
          caretX: bar?.x ?? event.x ?? 0,
          caretY: bar?.y ?? event.y ?? 0,
          chart,
        })
      },
      plugins: {
        ...barOpts.plugins,
        tooltip: {
          enabled: false,
        },
      },
    },
  })

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

  const exportsCanvas = document.getElementById('chart-exports')
  if (exportsCanvas) {
    const exportEntries = [
      ...EXPORT_FORMATS.map((fmt) => [fmt.toUpperCase(), stats.exportsByFormat.get(fmt) || 0]),
      ...[...stats.exportsByFormat.entries()]
        .filter(([fmt]) => !EXPORT_FORMATS.includes(fmt))
        .map(([fmt, count]) => [String(fmt).toUpperCase(), count]),
    ].filter(([, count]) => count > 0 || stats.totalExports === 0)

    // Keep a stable CSV / JSON / XLSX order even when some are zero.
    const ordered =
      stats.totalExports === 0
        ? EXPORT_FORMATS.map((fmt) => [fmt.toUpperCase(), 0])
        : exportEntries.sort((a, b) => {
            const ai = EXPORT_FORMATS.indexOf(String(a[0]).toLowerCase())
            const bi = EXPORT_FORMATS.indexOf(String(b[0]).toLowerCase())
            if (ai !== -1 || bi !== -1) {
              return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
            }
            return b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))
          })

    const exportTotalEl = document.getElementById('kpi-yt-exports-chart')
    if (exportTotalEl) {
      exportTotalEl.textContent = `${stats.totalExports} total · ${stats.exportUsers} users`
    }

    state.charts.exports = new Chart(exportsCanvas, {
      type: 'bar',
      data: barData(
        ordered.map(([label]) => label),
        ordered.map(([, count]) => count),
        [CHART_COLORS.green, CHART_COLORS.blue, CHART_COLORS.primary],
      ),
      options: barOpts,
    })
  }

  const videoTypeCanvas = document.getElementById('chart-video-type')
  if (videoTypeCanvas) {
    const shortsN = stats.shortsUsers || 0
    const videosN = stats.videosOnlyUsers || 0
    const videoTypeTotalEl = document.getElementById('kpi-yt-video-type-chart')
    if (videoTypeTotalEl) {
      const denom = stats.filterActivityUsers || shortsN + videosN
      videoTypeTotalEl.textContent = `${shortsN} Shorts · ${videosN} Videos only · ${denom} users with filters`
    }
    state.charts.videoType = new Chart(videoTypeCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Used Shorts', 'Videos only'],
        datasets: [
          {
            data: [shortsN, videosN],
            backgroundColor: [CHART_COLORS.videoFeature, CHART_COLORS.channelFeature],
            borderColor: CHART_COLORS.bg,
            borderWidth: 2,
          },
        ],
      },
      options: baseChartOptions({
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { color: CHART_COLORS.tick, font: { family: 'Inter', size: 11 } },
          },
          tooltip: {
            ...baseChartOptions().plugins.tooltip,
            callbacks: {
              label(ctx) {
                const value = Number(ctx.raw) || 0
                const sum = (ctx.dataset.data || []).reduce((a, b) => a + (Number(b) || 0), 0)
                return ` ${ctx.label}: ${value} (${pct(value, sum)})`
              },
            },
          },
        },
      }),
    })
  }

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

  const growthLineOpts = (series, labelCallbacks) =>
    baseChartOptions({
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
          callbacks: labelCallbacks,
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
    })

  const growthSeries = buildUserGrowthSeries(rows)
  const growthCanvas = document.getElementById('chart-user-growth')
  if (growthCanvas && growthSeries.length) {
    const pointRadius = growthSeries.length > 40 ? 0 : 3
    state.charts.userGrowth = new Chart(growthCanvas, {
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
      options: growthLineOpts(growthSeries, {
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
      }),
    })
  }

  const searchGrowthSeries = buildSearchGrowthSeries(rows)
  const searchGrowthCanvas = document.getElementById('chart-search-growth')
  if (searchGrowthCanvas && searchGrowthSeries.length) {
    const pointRadius = searchGrowthSeries.length > 40 ? 0 : 3
    state.charts.searchGrowth = new Chart(searchGrowthCanvas, {
      type: 'line',
      data: {
        labels: searchGrowthSeries.map((row) => formatChartDate(row.day)),
        datasets: [
          {
            label: 'Total searches',
            data: searchGrowthSeries.map((row) => row.total),
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
            label: 'Daily searches',
            data: searchGrowthSeries.map((row) => row.daily),
            borderColor: SEARCHES_BAR_GREEN,
            borderWidth: 2,
            fill: true,
            backgroundColor: 'rgba(62, 207, 142, 0.12)',
            tension: 0.35,
            pointRadius,
            pointBackgroundColor: SEARCHES_BAR_GREEN,
            pointBorderColor: CHART_COLORS.bg,
            pointBorderWidth: 2,
            pointHoverRadius: 6,
          },
          {
            label: 'Daily unique users',
            data: searchGrowthSeries.map((row) => row.users),
            borderColor: CHART_COLORS.blue,
            borderWidth: 2,
            fill: false,
            tension: 0.35,
            pointRadius,
            pointBackgroundColor: CHART_COLORS.blue,
            pointBorderColor: CHART_COLORS.bg,
            pointBorderWidth: 2,
            pointHoverRadius: 6,
          },
        ],
      },
      options: growthLineOpts(searchGrowthSeries, {
        label: (ctx) => {
          const row = searchGrowthSeries[ctx.dataIndex]
          if (ctx.dataset.label === 'Total searches') {
            const lines = [` Total searches: ${ctx.parsed.y.toLocaleString()}`]
            if (row?.daily) {
              lines.push(` +${row.daily.toLocaleString()} today`)
            }
            return lines
          }
          if (ctx.dataset.label === 'Daily unique users') {
            return ` Unique users: ${ctx.parsed.y.toLocaleString()}`
          }
          return ` Daily searches: ${ctx.parsed.y.toLocaleString()}`
        },
      }),
    })
  }

  renderSearchesWindowChart(rows)
}

function isFilterSearchEvent(row) {
  return ytRowEvent(row) === 'filter_search'
}

function formatSearchesWindowTick(ms, windowKey) {
  const date = new Date(ms)
  if (Number.isNaN(date.getTime())) return '—'
  if (windowKey === '7d') {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Bucket filter_search counts + unique users into the selected recent window.
 * @returns {{
 *   totalSearches: number,
 *   totalUsers: number,
 *   labels: string[],
 *   searches: number[],
 *   users: number[],
 *   startMs: number,
 *   endMs: number,
 *   windowKey: string,
 * }}
 */
function buildSearchesWindowSeries(rows, windowKey = getSearchesWindow()) {
  const key = VALID_SEARCHES_WINDOWS.has(windowKey) ? windowKey : '60m'
  const windowMs = SEARCHES_WINDOW_MS[key]
  const bucketMs = SEARCHES_WINDOW_BUCKET_MS[key]
  const endMs = Date.now()
  const startMs = endMs - windowMs
  const bucketCount = Math.max(1, Math.round(windowMs / bucketMs))
  const searches = Array.from({ length: bucketCount }, () => 0)
  /** @type {Array<Set<string>>} */
  const usersByBucket = Array.from({ length: bucketCount }, () => new Set())
  const usersInWindow = new Set()
  const labels = Array.from({ length: bucketCount }, (_, i) =>
    formatSearchesWindowTick(startMs + i * bucketMs, key),
  )

  for (const row of rows || []) {
    if (!isFilterSearchEvent(row)) continue
    const created = rowCreatedAt(row)
    if (!created) continue
    const ms = new Date(created).getTime()
    if (Number.isNaN(ms) || ms < startMs || ms > endMs) continue
    let index = Math.floor((ms - startMs) / bucketMs)
    if (index < 0) index = 0
    if (index >= bucketCount) index = bucketCount - 1
    searches[index] += 1

    const fp = normalizeDashboardFingerprint(ytRowFingerprint(row))
    if (fp) {
      usersByBucket[index].add(fp)
      usersInWindow.add(fp)
    }
  }

  return {
    totalSearches: searches.reduce((sum, n) => sum + n, 0),
    totalUsers: usersInWindow.size,
    labels,
    searches,
    users: usersByBucket.map((set) => set.size),
    startMs,
    endMs,
    windowKey: key,
  }
}

function syncSearchesWindowSelect() {
  const select = document.getElementById('yt-searches-window-select')
  if (select) select.value = getSearchesWindow()
}

/** Build usedByKey map from a filter payload for chart-group pick helpers. */
function buildUsedFilterKeyMap(filter) {
  /** @type {Map<string, unknown>} */
  const usedByKey = new Map()
  if (!filter || typeof filter !== 'object') return usedByKey
  for (const [key, value] of Object.entries(filter)) {
    if (key === 'options' || key === 'event' || key === 'result_count' || key === 'results' || key === 'format') {
      continue
    }
    if (!isFeatureUsed(key, value)) continue
    usedByKey.set(key, value)
  }
  return usedByKey
}

/**
 * Curated filter groups actually used in this search (video / channel only).
 * @returns {{ video: Array<{ label: string, picks: string[] }>, channel: Array<{ label: string, picks: string[] }> }}
 */
function buildUsedFilterGroups(filter) {
  const usedByKey = buildUsedFilterKeyMap(filter)
  const video = []
  const channel = []

  FEATURE_CHART_GROUPS.forEach((group) => {
    const activeKeys = group.keys.filter((key) => usedByKey.has(key))
    if (!activeKeys.length) return
    const picks = extractChartGroupPicks(group, filter, usedByKey)
      .map(formatPickLabel)
      .filter(Boolean)
    const entry = {
      label: group.label,
      picks: picks.length ? picks : ['Active'],
    }
    if (group.category === 'channel') channel.push(entry)
    else video.push(entry)
  })

  return { video, channel }
}

function renderYfpFilterPreviewHtml(filter) {
  const groups = buildUsedFilterGroups(filter)
  const renderSection = (title, rows) => {
    if (!rows.length) return ''
    const rowsHtml = rows
      .map((row) => {
        const picksHtml =
          row.picks.length === 1 && !row.picks[0].includes(',')
            ? `<div class="admin__yfp-row__value">${escapeHtml(row.picks[0])}</div>`
            : `<div class="admin__yfp-row__value"><div class="admin__yfp-row__picks">${row.picks
                .map((pick) => `<span class="admin__yfp-pill">${escapeHtml(pick)}</span>`)
                .join('')}</div></div>`
        return `
          <div class="admin__yfp-row">
            <span class="admin__yfp-row__label">${escapeHtml(row.label)}</span>
            ${picksHtml}
          </div>`
      })
      .join('')
    return `
      <section class="admin__yfp-section">
        <h3 class="admin__yfp-section-title">${escapeHtml(title)}</h3>
        ${rowsHtml}
      </section>`
  }

  const body =
    renderSection('Video filters', groups.video) +
    renderSection('Channel filters', groups.channel)

  if (!body) {
    return `<div class="admin__yfp-scroll"><p class="admin__yfp-empty">Defaults only — no custom filters on this search.</p></div>`
  }

  return `<div class="admin__yfp-scroll">${body}</div>`
}

/**
 * Recent filter_search rows in the selected window (optionally one chart bucket).
 * @param {{ bucketIndex?: number | null, limit?: number }} [opts]
 */
function getRecentWindowSearches(rows = ytRowsPublic(), opts = {}) {
  const windowKey = getSearchesWindow()
  const windowMs = SEARCHES_WINDOW_MS[windowKey]
  const bucketMs = SEARCHES_WINDOW_BUCKET_MS[windowKey]
  const endMs = Date.now()
  const startMs = endMs - windowMs
  const bucketCount = Math.max(1, Math.round(windowMs / bucketMs))
  const bucketIndex =
    opts.bucketIndex == null || !Number.isFinite(opts.bucketIndex)
      ? null
      : Math.max(0, Math.min(bucketCount - 1, Math.floor(opts.bucketIndex)))
  const limit = opts.limit == null ? 40 : Math.max(1, opts.limit)

  const matched = []
  for (const row of rows || []) {
    if (!isFilterSearchEvent(row)) continue
    const created = rowCreatedAt(row)
    if (!created) continue
    const ms = new Date(created).getTime()
    if (Number.isNaN(ms) || ms < startMs || ms > endMs) continue
    if (bucketIndex != null) {
      let index = Math.floor((ms - startMs) / bucketMs)
      if (index < 0) index = 0
      if (index >= bucketCount) index = bucketCount - 1
      if (index !== bucketIndex) continue
    }
    matched.push({ row, ms })
  }

  matched.sort((a, b) => b.ms - a.ms)

  let rangeStartMs = startMs
  let rangeEndMs = endMs
  if (bucketIndex != null) {
    rangeStartMs = startMs + bucketIndex * bucketMs
    rangeEndMs = Math.min(endMs, rangeStartMs + bucketMs)
  }

  return {
    windowKey,
    bucketIndex,
    rangeStartMs,
    rangeEndMs,
    items: matched.slice(0, limit),
    totalMatched: matched.length,
  }
}

function closeSearchesPreviewModal() {
  const modal = document.getElementById('searches-preview-modal')
  if (!modal) return
  modal.hidden = true
  document.body.style.overflow = ''
}

function openSearchesPreviewModal({ bucketIndex = null } = {}) {
  const modal = document.getElementById('searches-preview-modal')
  const title = document.getElementById('searches-preview-title')
  const body = document.getElementById('searches-preview-body')
  if (!modal || !title || !body) return

  if (!state.loaded.yt) {
    title.textContent = 'Recent searches'
    body.innerHTML =
      '<p class="admin__yfp-empty">YT Filter Pro data is still loading. Try again in a moment.</p>'
    modal.hidden = false
    document.body.style.overflow = 'hidden'
    return
  }

  const preview = getRecentWindowSearches(ytRowsPublic(), { bucketIndex, limit: 40 })
  const windowLabel =
    preview.windowKey === '30m'
      ? 'Past 30 mins'
      : preview.windowKey === '60m'
        ? 'Past 60 mins'
        : preview.windowKey === '24h'
          ? 'Past 24 hours'
          : 'Past 7 days'
  const rangeLabel =
    preview.bucketIndex == null
      ? windowLabel
      : `${formatSearchesWindowTick(preview.rangeStartMs, preview.windowKey)} → ${formatSearchesWindowTick(preview.rangeEndMs, preview.windowKey)}`

  title.textContent =
    preview.bucketIndex == null ? `Searches · ${windowLabel}` : `Searches · time slice`

  if (!preview.items.length) {
    body.innerHTML = `<p class="admin__yfp-empty">No filter searches in ${escapeHtml(rangeLabel)}.</p>`
    modal.hidden = false
    document.body.style.overflow = 'hidden'
    return
  }

  const listHtml = preview.items
    .map(({ row, ms }) => {
      const fp = normalizeDashboardFingerprint(ytRowFingerprint(row)) || 'unknown'
      const filter = pickFilterObject(row)
      return `
        <article class="admin__yfp-search">
          <div class="admin__yfp-search__meta">
            <span>${escapeHtml(formatDateWithRelative(new Date(ms).toISOString()))}</span>
            <button type="button" class="admin__fingerprint-btn admin__yfp-search__fp" data-fingerprint="${escapeHtml(fp)}" title="Open user">${escapeHtml(shortFingerprint(fp))}</button>
          </div>
          ${renderYfpFilterPreviewHtml(filter)}
        </article>`
    })
    .join('')

  const moreNote =
    preview.totalMatched > preview.items.length
      ? `<p class="admin__yfp-empty">Showing latest ${preview.items.length} of ${preview.totalMatched} searches in this range.</p>`
      : ''

  body.innerHTML = `
    <p class="admin__yfp-empty" style="border-bottom:1px solid #303030;margin:0">
      ${escapeHtml(rangeLabel)} · ${preview.totalMatched} search${preview.totalMatched === 1 ? '' : 'es'} · only fields each user set
    </p>
    <div class="admin__yfp-list">${listHtml}${moreNote}</div>
  `

  modal.hidden = false
  document.body.style.overflow = 'hidden'
}

function renderSearchesWindowChart(rows = ytRowsPublic()) {
  const canvas = document.getElementById('chart-searches-window')
  const searchesEl = document.getElementById('kpi-yt-searches-window')
  const usersEl = document.getElementById('kpi-yt-users-window')
  const startEl = document.getElementById('yt-searches-window-start')
  const endEl = document.getElementById('yt-searches-window-end')
  if (!canvas) return

  syncSearchesWindowSelect()
  const series = buildSearchesWindowSeries(rows, getSearchesWindow())

  if (searchesEl) searchesEl.textContent = String(series.totalSearches)
  if (usersEl) usersEl.textContent = String(series.totalUsers)
  if (startEl) startEl.textContent = formatSearchesWindowTick(series.startMs, series.windowKey)
  if (endEl) endEl.textContent = formatSearchesWindowTick(series.endMs, series.windowKey)

  const existing = state.charts.searchesWindow
  if (existing) {
    try {
      existing.destroy()
    } catch {
      /* ignore */
    }
    delete state.charts.searchesWindow
  }

  const barMax = Math.max(1, ...series.searches, ...series.users)

  state.charts.searchesWindow = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: series.labels,
      datasets: [
        {
          label: 'Searches',
          data: series.searches,
          backgroundColor: SEARCHES_BAR_GREEN,
          borderRadius: 1,
          // Outer bar — thicker; users bar overlays centered inside it.
          maxBarThickness: 10,
          categoryPercentage: 0.9,
          barPercentage: 0.95,
          order: 1,
        },
        {
          label: 'Users',
          data: series.users,
          backgroundColor: SEARCHES_BAR_BLUE,
          borderRadius: 1,
          maxBarThickness: 4,
          categoryPercentage: 0.9,
          barPercentage: 0.45,
          order: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      // Draw both series on the same category slot (nested, not side-by-side).
      datasets: {
        bar: {
          grouped: false,
        },
      },
      onClick: (event, elements) => {
        if (!elements.length) return
        event.native?.stopPropagation?.()
        openSearchesPreviewModal({ bucketIndex: elements[0].index })
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: CHART_COLORS.surface,
          borderColor: CHART_COLORS.border,
          borderWidth: 1,
          titleColor: CHART_COLORS.text,
          bodyColor: CHART_COLORS.tick,
          callbacks: {
            title: (items) => {
              const idx = items?.[0]?.dataIndex
              return idx == null ? '' : series.labels[idx] || ''
            },
            label: (ctx) => {
              const n = Number(ctx.parsed.y || 0).toLocaleString()
              return ctx.dataset.label === 'Users' ? ` Users: ${n}` : ` Searches: ${n}`
            },
          },
        },
      },
      scales: {
        x: {
          display: false,
          grid: { display: false },
          stacked: false,
        },
        y: {
          display: false,
          beginAtZero: true,
          grid: { display: false },
          suggestedMax: barMax,
          stacked: false,
        },
      },
    },
  })
}

function renderYtKpis() {
  const rows = ytRowsPublic()
  const stats = aggregateYt(rows)
  const growth = buildUserGrowthSeries(rows)
  const latest = growth.length ? growth[growth.length - 1] : null
  const formatSearches = (n) =>
    Number.isFinite(n) ? (Math.round(n * 10) / 10).toLocaleString('en-US') : '0'

  document.getElementById('kpi-yt-total').textContent = String(stats.total)
  const exportsKpi = document.getElementById('kpi-yt-exports')
  if (exportsKpi) exportsKpi.textContent = String(stats.totalExports)
  const setKpi = (id, value) => {
    const el = document.getElementById(id)
    if (el) el.textContent = value
  }
  setKpi('kpi-yt-tutorials-started', String(stats.totalStartedTutorials))
  setKpi('kpi-yt-tutorials-completed', String(stats.totalCompletedTutorials))
  setKpi(
    'kpi-yt-tutorial-rate',
    pct(stats.totalCompletedTutorials, stats.totalStartedTutorials),
  )
  document.getElementById('kpi-yt-users').textContent = String(stats.uniqueUsers)
  document.getElementById('kpi-yt-avg-searches').textContent = formatSearches(
    stats.searchesPerUserMean,
  )
  document.getElementById('kpi-yt-median-searches').textContent = formatSearches(
    stats.searchesPerUserMedian,
  )
  document.getElementById('kpi-yt-median-dau-searches').textContent = formatSearches(
    latest?.dauMedianSearches,
  )
  document.getElementById('kpi-yt-median-returning-searches').textContent =
    formatSearches(latest?.returningMedianSearches)
  document.getElementById('kpi-yt-keywords').textContent = pct(
    stats.keywordIncludeActive,
    stats.uniqueUsers,
  )
  document.getElementById('kpi-yt-duration').textContent = pct(
    stats.durationAny,
    stats.uniqueUsers,
  )

  setKpi(
    'kpi-yt-country',
    pct(stats.countryFilterActive, stats.uniqueUsers),
  )
  setKpi(
    'kpi-yt-social',
    pct(stats.socialFilterActive, stats.uniqueUsers),
  )
  const videoTypeDenom = stats.filterActivityUsers || stats.uniqueUsers
  setKpi('kpi-yt-shorts', pct(stats.shortsUsers, videoTypeDenom))
  setKpi('kpi-yt-videos-only', pct(stats.videosOnlyUsers, videoTypeDenom))
  setKpi(
    'kpi-yt-options',
    pct(stats.usersWithOptions, stats.uniqueUsers),
  )
}

function userLabel(count) {
  return `${count} ${count === 1 ? 'user' : 'users'}`
}

function ensureFeaturePicksTooltip() {
  let tip = document.getElementById('feature-picks-tooltip')
  if (tip) return tip
  tip = document.createElement('div')
  tip.id = 'feature-picks-tooltip'
  tip.className = 'admin__feature-tooltip'
  tip.hidden = true
  tip.setAttribute('role', 'dialog')
  tip.setAttribute('aria-modal', 'false')
  tip.addEventListener('click', (event) => {
    if (event.target.closest('[data-feature-tooltip-close]')) {
      event.preventDefault()
      hideFeaturePicksTooltip()
    }
  })
  document.body.appendChild(tip)
  return tip
}

function hideFeaturePicksTooltip() {
  const tip = document.getElementById('feature-picks-tooltip')
  if (tip) tip.hidden = true
  if (state.featureTooltip) state.featureTooltip.openIndex = null
}

function positionFeaturePicksTooltip(tip, caretX, caretY, chart) {
  const pad = 12
  const rect = tip.getBoundingClientRect()
  const canvasRect = chart.canvas.getBoundingClientRect()
  let left = canvasRect.left + caretX + 16
  let top = canvasRect.top + caretY - rect.height / 2

  if (left + rect.width + pad > window.innerWidth) {
    left = canvasRect.left + caretX - rect.width - 16
  }
  if (left < pad) left = pad
  if (top < pad) top = pad
  if (top + rect.height + pad > window.innerHeight) {
    top = window.innerHeight - rect.height - pad
  }

  tip.style.left = `${Math.round(left)}px`
  tip.style.top = `${Math.round(top)}px`
}

function openFeaturePicksTooltip(dataIndex, { caretX, caretY, chart }) {
  const tip = ensureFeaturePicksTooltip()
  const featureTop = state.featureTooltip?.featureTop || []
  const featurePicks = state.featureTooltip?.featurePicks || new Map()
  if (dataIndex == null || !featureTop[dataIndex]) {
    hideFeaturePicksTooltip()
    return
  }

  // Toggle closed if the same bar is clicked again.
  if (state.featureTooltip?.openIndex === dataIndex && !tip.hidden) {
    hideFeaturePicksTooltip()
    return
  }

  const [key, userCount] = featureTop[dataIndex]
  const group = FEATURE_CHART_GROUP_BY_ID.get(key)
  const category = group?.category === 'channel' ? 'Channel' : 'Video'
  const picks = topEntries(featurePicks.get(key) || new Map(), 12)
  const pickRows = picks.length
    ? picks
        .map(
          ([pick, count]) => `
        <li class="admin__feature-tooltip__pick">
          <span class="admin__feature-tooltip__pick-label">${escapeHtml(formatPickLabel(pick))}</span>
          <span class="admin__feature-tooltip__pick-count">${escapeHtml(userLabel(count))}</span>
        </li>`,
        )
        .join('')
    : '<li class="admin__feature-tooltip__empty">No picks recorded for this feature.</li>'

  tip.innerHTML = `
    <button type="button" class="admin__feature-tooltip__close" data-feature-tooltip-close aria-label="Close">×</button>
    <div class="admin__feature-tooltip__header">
      <span class="admin__feature-tooltip__badge admin__feature-tooltip__badge--${
        group?.category === 'channel' ? 'channel' : 'video'
      }">${escapeHtml(category)}</span>
      <strong class="admin__feature-tooltip__title">${escapeHtml(formatFeatureLabel(key))}</strong>
      <span class="admin__feature-tooltip__users">${escapeHtml(userLabel(userCount))}</span>
    </div>
    <ul class="admin__feature-tooltip__list">${pickRows}</ul>
  `
  tip.hidden = false
  if (state.featureTooltip) state.featureTooltip.openIndex = dataIndex
  positionFeaturePicksTooltip(tip, caretX, caretY, chart)
}

async function loadYt({ force = false } = {}) {
  const status = document.getElementById('yt-status')
  const toolbar = document.getElementById('yt-toolbar')
  const kpis = document.getElementById('yt-kpis')
  const growthRow = document.getElementById('yt-growth-row')
  const charts = document.getElementById('yt-charts')

  const applyYtRows = (rows, { fromCache = false } = {}) => {
    state.ytRows = rows
    state.loaded.yt = true

    if (!rows.length) {
      setStatus(
        status,
        'Got 0 rows from "yt_filter_pro_data". If you see rows in the Supabase Table Editor, anon SELECT is blocked by RLS.\n\nIn Supabase → SQL Editor, run:\n\ncreate policy "anon_select_yt_filter_pro_data"\n  on public.yt_filter_pro_data for select to anon using (true);',
        'error',
      )
      if (toolbar) toolbar.hidden = true
      kpis.hidden = true
      if (growthRow) growthRow.hidden = true
      charts.hidden = true
      destroyCharts()
      return false
    }

    const sample = pickFilterObject(rows[0])
    if (!sample) {
      setStatus(
        status,
        'Loaded rows, but could not find filter settings. Expected a JSON column (data/filters/payload/settings) or flat filter fields.',
        'error',
      )
      if (toolbar) toolbar.hidden = true
      kpis.hidden = true
      if (growthRow) growthRow.hidden = true
      charts.hidden = true
      destroyCharts()
      return false
    }

    const cacheNote =
      fromCache && state.ytCacheSavedAt
        ? `Showing cached data from ${new Date(state.ytCacheSavedAt).toLocaleString('en-US')}.`
        : ''
    setStatus(status, cacheNote)
    if (toolbar) toolbar.hidden = false
    kpis.hidden = false
    if (growthRow) growthRow.hidden = false
    charts.hidden = false
    renderYtKpis()
    if (!document.getElementById('panel-yt').hidden) {
      renderYtCharts()
    }
    if (!document.getElementById('panel-yt-dev')?.hidden) {
      renderYtDev()
    }
    // Refresh feedback cards so "Used for …" can use first-search timestamps.
    if (state.loaded.feedback && !document.getElementById('panel-feedback')?.hidden) {
      renderFeedbackList()
    }
    return true
  }

  const cached = await readYtCache()
  if (cached) state.ytCacheSavedAt = cached.savedAt

  if (!force && cached && isYtCacheFresh(cached.savedAt)) {
    applyYtRows(cached.rows, { fromCache: true })
    setYtTabStatus('ready')
    updateCacheTimers()
    return
  }

  // Stale cache: show it immediately, then refresh in the background.
  // Force refresh with existing data: keep UI, only show tab spinner.
  if (!force && cached?.rows?.length) {
    applyYtRows(cached.rows, { fromCache: true })
    setYtTabStatus('loading')
  } else if (force && state.ytRows.length) {
    setYtTabStatus('loading')
  } else {
    setStatus(status, 'Loading YouTube Filter Pro data…')
    if (toolbar) toolbar.hidden = true
    kpis.hidden = true
    if (growthRow) growthRow.hidden = true
    charts.hidden = true
    destroyCharts()
    setYtTabStatus('loading')
  }

  if (state.ytLoading) return
  state.ytLoading = true
  updateCacheTimers()

  try {
    let rows
    try {
      rows = await fetchAllRows('yt_filter_pro_data', 'created_at')
    } catch {
      rows = await fetchAllRows('yt_filter_pro_data', null)
    }

    const cachedOk = await writeYtCache(rows)
    applyYtRows(rows, { fromCache: false })
    if (!cachedOk) {
      setStatus(
        status,
        'Loaded live data, but could not persist the 1h cache (storage full). Reloads may re-fetch.',
        'error',
      )
    }
    setYtTabStatus('ready')
  } catch (error) {
    if (!state.loaded.yt) {
      state.loaded.yt = false
      setStatus(status, formatError(error, 'yt_filter_pro_data'), 'error')
      setYtTabStatus('error')
    } else {
      // Keep cached view; mark ready since usable data is on screen.
      setYtTabStatus('ready')
      console.warn('YT refresh failed; keeping cached data.', error)
    }
  } finally {
    state.ytLoading = false
    state.ytLastRefreshAttemptAt = Date.now()
    updateCacheTimers()
  }
}

/* -------------------------------------------------------------------------- */
/* Boot                                                                       */
/* -------------------------------------------------------------------------- */

async function refreshAll({ forceYt = true, forceFeedback = true } = {}) {
  updateUpdatedAt()
  await Promise.all([
    loadFeedback({ force: forceFeedback }),
    loadYt({ force: forceYt }),
    loadUninstallsByDay(),
  ])
  if (state.loaded.feedback) renderFeedbackGraph()
  updateUpdatedAt()
}

function scheduleYtCacheRefresh() {
  const scheduleNext = async () => {
    const cached = await readYtCache()
    const latestTimestamp = Math.max(
      Number(state.ytCacheSavedAt) || 0,
      Number(state.ytLastRefreshAttemptAt) || 0,
      Number(cached?.savedAt) || 0,
      Number(readYtCacheMeta()?.savedAt) || 0,
    )
    const delay = latestTimestamp
      ? Math.max(5_000, latestTimestamp + YT_CACHE_TTL_MS - Date.now())
      : 5_000
    window.setTimeout(async () => {
      await loadYt({ force: true })
      scheduleNext()
    }, delay)
  }
  void scheduleNext()
}

function scheduleFeedbackCacheRefresh() {
  const scheduleNext = () => {
    const cached = readFeedbackCache()
    const age = cached ? Date.now() - cached.savedAt : FEEDBACK_CACHE_TTL_MS
    const delay = Math.max(5_000, FEEDBACK_CACHE_TTL_MS - age)
    window.setTimeout(async () => {
      await loadFeedback({ force: true })
      scheduleNext()
    }, delay)
  }
  scheduleNext()
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

document.getElementById('yt-searches-window-select')?.addEventListener('change', (event) => {
  setSearchesWindow(event.currentTarget?.value || '60m')
  if (state.loaded.yt) renderSearchesWindowChart(ytRowsPublic())
})

document.getElementById('yt-searches-window-select')?.addEventListener('click', (event) => {
  event.stopPropagation()
})

document.getElementById('yt-searches-window')?.addEventListener('click', (event) => {
  // Canvas bar clicks open a time-slice modal via Chart.js onClick.
  if (event.target.closest('canvas, select, label, option')) return
  openSearchesPreviewModal()
})

document.getElementById('yt-searches-window')?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return
  if (event.target.closest('select, label')) return
  event.preventDefault()
  openSearchesPreviewModal()
})

document.getElementById('searches-preview-close')?.addEventListener('click', () => {
  closeSearchesPreviewModal()
})

document.getElementById('searches-preview-backdrop')?.addEventListener('click', () => {
  closeSearchesPreviewModal()
})

document.getElementById('searches-preview-body')?.addEventListener('click', (event) => {
  const fpBtn = event.target.closest('[data-fingerprint]')
  if (!fpBtn) return
  const fp = fpBtn.getAttribute('data-fingerprint') || ''
  if (!fp) return
  closeSearchesPreviewModal()
  openFingerprintModal(fp)
})

document.querySelectorAll('#feedback-toolbar [data-filter]').forEach((chip) => {
  chip.addEventListener('click', () => {
    setFeedbackFilter(chip.dataset.filter)
    syncFeedbackFilterChips()
    renderFeedbackAppSelect()
    renderFeedbackList()
  })
})

document.getElementById('feedback-email-filter')?.addEventListener('click', () => {
  if (getFeedbackFilter() === 'all') return
  setFeedbackEmailOnly(!getFeedbackEmailOnly())
  syncFeedbackFilterChips()
  renderFeedbackKpis()
  renderFeedbackAppSelect()
  renderFeedbackList()
})

document.getElementById('feedback-app-select')?.addEventListener('change', (event) => {
  const select = event.currentTarget
  setFeedbackAppFilter(select?.value || 'all')
  renderFeedbackAppSelect()
  renderFeedbackList()
})

document.getElementById('feedback-app-chips')?.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-app-filter]')
  if (!chip) return
  setFeedbackAppFilter(chip.getAttribute('data-app-filter') || 'all')
  renderFeedbackAppSelect()
  renderFeedbackList()
})

document.getElementById('mark-all-read').addEventListener('click', () => {
  // Mark whatever the list is currently showing (status + contact + app filters).
  const filter = getFeedbackFilter()
  const appFilter = getFeedbackAppFilter()
  const emailOnly = filter !== 'all' && getFeedbackEmailOnly()
  const ids = state.feedback
    .filter((row) => {
      const read = feedbackRowIsRead(row)
      if (filter === 'unread' && read) return false
      if (filter === 'read' && !read) return false
      if (emailOnly && !feedbackEmail(row)) return false
      if (appFilter !== 'all' && formatFeedbackAppName(row.app_name) !== appFilter) {
        return false
      }
      return true
    })
    .map(feedbackId)
  markAllRead(ids)
  // Paint the tab badge / KPIs before the heavier list re-render.
  renderFeedbackKpis()
  setTimeout(() => {
    renderFeedback()
  }, 0)
})

document.getElementById('feedback-list').addEventListener('click', (event) => {
  const fpBtn = event.target.closest('[data-fingerprint]')
  if (fpBtn) {
    const fp = fpBtn.getAttribute('data-fingerprint') || fpBtn.dataset.fingerprint || ''
    const email = fpBtn.getAttribute('data-email') || fpBtn.dataset.email || ''
    openFingerprintModal(fp, { email })
    return
  }

  const btn = event.target.closest('[data-toggle-read]')
  if (!btn) return
  const id = btn.getAttribute('data-toggle-read')
  setRead(id, !isRead(id))
  renderFeedbackKpis()
  renderFeedback()
})

document.getElementById('fingerprint-modal-close')?.addEventListener('click', () => {
  closeFingerprintModal()
})

document.getElementById('fingerprint-modal-backdrop')?.addEventListener('click', () => {
  closeFingerprintModal()
})

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return
  const tip = document.getElementById('feature-picks-tooltip')
  if (tip && !tip.hidden) {
    hideFeaturePicksTooltip()
    return
  }
  const searchesModal = document.getElementById('searches-preview-modal')
  if (searchesModal && !searchesModal.hidden) {
    closeSearchesPreviewModal()
    return
  }
  const modal = document.getElementById('fingerprint-modal')
  if (modal && !modal.hidden) closeFingerprintModal()
})

document.addEventListener('mousedown', (event) => {
  const tip = document.getElementById('feature-picks-tooltip')
  if (!tip || tip.hidden) return
  if (tip.contains(event.target)) return
  const chart = state.charts.features
  if (chart?.canvas && chart.canvas.contains(event.target)) return
  hideFeaturePicksTooltip()
})

switchTab(getActiveTab(), { persist: false })
refreshAll({ forceYt: false, forceFeedback: false })
scheduleYtCacheRefresh()
scheduleFeedbackCacheRefresh()
startCacheTimerTicker()
