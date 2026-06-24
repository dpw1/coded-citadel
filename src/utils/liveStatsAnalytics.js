import websiteFallback from '../data/website-analytics.json'
import gaDbFallback from '../data/ga-db.json'
import { analyticsSeriesWeekDelta } from './apps'
import { resolveCountryFromGa } from './countryUtils'

export const PORTFOLIO_ANALYTICS_TABS = [
  { id: 'extensions', label: 'Extensions', icon: 'chrome' },
  { id: 'website', label: 'Website' },
]

const CACHE_KEY = 'cc-website-analytics-v1'
const CACHE_TS_KEY = 'cc-website-analytics-v1-fetched-at'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

function normalizeCountryRow(item) {
  if (!item || typeof item !== 'object') return null
  return resolveCountryFromGa(item)
}

export function normalizeWebsiteCountries(countries) {
  if (!countries) return []

  if (Array.isArray(countries)) {
    return countries.map(normalizeCountryRow).filter(Boolean)
  }

  if (typeof countries === 'object') {
    return Object.entries(countries).map(([key, value]) => {
      const users = typeof value === 'number' ? value : value?.users ?? 0
      return normalizeCountryRow({ code: key, users })
    }).filter(Boolean)
  }

  return []
}

function withTimeSeries(data) {
  if (!data) return data
  if (data.timeSeries?.pageViews?.length) return data

  const fromDb = gaDbFallback?.daily?.length
    ? buildTimeSeriesFromGaDb(gaDbFallback.daily)
    : null

  return {
    ...data,
    timeSeries: fromDb ?? data.timeSeries ?? emptyTimeSeries(),
  }
}

function emptyTimeSeries() {
  return {
    pageViews: [],
    activeUsers: [],
    blogViews: [],
    sessions: [],
  }
}

function buildTimeSeriesFromGaDb(daily) {
  const sorted = [...daily].sort((a, b) => String(a.date).localeCompare(String(b.date)))
  const toChartDate = (iso) => {
    const [y, m, d] = String(iso).split('-')
    return y && m && d ? `${d}-${m}-${y}` : String(iso)
  }
  const toSeries = (pick) =>
    sorted.map((row) => ({
      date: toChartDate(row.date),
      total: Number(pick(row) ?? 0),
    }))

  return {
    pageViews: toSeries((row) => row.pageViews),
    activeUsers: toSeries((row) => row.activeUsers),
    blogViews: toSeries((row) => row.blogViews),
    sessions: toSeries((row) => row.sessions),
  }
}

function withNormalizedCountries(data) {
  if (!data?.countries) return withTimeSeries(data)
  return withTimeSeries({ ...data, countries: normalizeWebsiteCountries(data.countries) })
}

function readCacheRaw() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function readCacheFresh() {
  if (!isWebsiteAnalyticsCacheFresh()) return null
  return readCacheRaw()
}

function writeCache(data) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    window.localStorage.setItem(CACHE_TS_KEY, String(Date.now()))
  } catch {
    // ignore quota / privacy errors
  }
}

/** Bundled build-time snapshot — always used on the live site. */
export function getWebsiteAnalyticsSnapshot() {
  return withNormalizedCountries(websiteFallback)
}

/** Dev: localStorage first, then bundled snapshot. Prod: bundled snapshot only. */
export function getStoredWebsiteAnalytics() {
  if (!import.meta.env.DEV) {
    return getWebsiteAnalyticsSnapshot()
  }

  const cached = readCacheRaw()
  return withNormalizedCountries(cached ?? websiteFallback)
}

export function isWebsiteAnalyticsCacheFresh() {
  if (!import.meta.env.DEV || typeof window === 'undefined') return true

  try {
    const fetchedAt = Number(window.localStorage.getItem(CACHE_TS_KEY))
    if (!fetchedAt) return false
    return Date.now() - fetchedAt <= CACHE_TTL_MS
  } catch {
    return false
  }
}

export function needsWebsiteAnalyticsRefresh() {
  return import.meta.env.DEV && !isWebsiteAnalyticsCacheFresh()
}

/**
 * Dev-only refresh from the local API (max once per day). Prod always returns bundled JSON.
 * When cache is fresh, returns cached localStorage data without fetching.
 */
export async function fetchWebsiteAnalytics() {
  if (!import.meta.env.DEV) {
    return getWebsiteAnalyticsSnapshot()
  }

  const cached = readCacheFresh()
  if (cached) return cached

  try {
    const res = await fetch('/api/live-stats/website')
    if (res.ok) {
      const data = await res.json()
      const normalized = withNormalizedCountries(data)
      writeCache(normalized)
      return normalized
    }
  } catch {
    // fall through to stored/bundled snapshot
  }

  return getStoredWebsiteAnalytics()
}

export function countriesByRegion(countries = []) {
  const map = {}

  for (const item of countries) {
    const code = String(item.code || item.country || '').toUpperCase()
    const key = /^[A-Z]{2}$/.test(code) ? code : 'other'
    map[key] = (map[key] ?? 0) + (item.users ?? 0)
  }

  return map
}

export function formatDurationSeconds(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return '—'
  const total = Math.round(Number(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60

  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${secs}s`
  return `${secs}s`
}

export function formatRate(value, { asPercent = true, decimals = 1 } = {}) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  const n = Number(value)
  const pct = asPercent && n <= 1 ? n * 100 : n
  return `${pct.toFixed(decimals)}%`
}

export function pagePathToHref(path) {
  const value = String(path || '/').trim() || '/'
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return value.startsWith('/') ? value : `/${value}`
}

/** 7-day rolling delta for website KPIs (same window logic as extension charts). */
export function websitePageViewsDelta(data) {
  const series = data?.timeSeries?.pageViews
  if (!series?.length) return null
  return analyticsSeriesWeekDelta(series)
}

export function websiteBlogViewsDelta(data) {
  const series = data?.timeSeries?.blogViews
  if (!series?.length) return null
  return analyticsSeriesWeekDelta(series)
}

export function websiteUniqueVisitorsDelta(data) {
  const series = data?.timeSeries?.activeUsers
  if (!series?.length) return null
  return analyticsSeriesWeekDelta(series)
}
