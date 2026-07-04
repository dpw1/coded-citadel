import portfolioData from '../data/portfolio-analytics.json'
import { dedupeAnalyticsObject } from './analyticsSeries'
import { aggregateAnalyticsList } from './portfolioAggregate'
import {
  analyticsActiveUsers,
  analyticsSeriesTotal,
  appFilterLabel,
  formatAppDate,
  installDateToIso,
  installationsTotal,
} from './apps'

export function getPortfolioAnalyticsPayload() {
  return portfolioData
}

export function getPortfolioApps() {
  return portfolioData?.apps ?? []
}

export function getPortfolioAnalytics() {
  const analytics = portfolioData?.analytics ?? null
  return analytics ? dedupeAnalyticsObject(analytics) : null
}

export function getPortfolioAnalyticsForKeys(selectedKeys) {
  const apps = getPortfolioApps()
  if (!apps.length || !selectedKeys?.size) return null

  const list = apps
    .filter((app) => selectedKeys.has(app.key))
    .map((app) => app.analytics)
    .filter(Boolean)

  return aggregateAnalyticsList(list)
}

export function getPortfolioAnalyticsUpdatedAt() {
  return portfolioData?.updatedAt ?? portfolioData?.extractedAt ?? null
}

const PORTFOLIO_RANGE_SERIES_KEYS = [
  'installations',
  'weeklyUsers',
  'pageViewsOverTime',
  'impressionsAcrossChromeWebStore',
]

/** Earliest analytics day and latest scrape date derived from portfolio-analytics.json (built from db.json). */
export function getPortfolioAnalyticsDateRange() {
  const analytics = getPortfolioAnalytics()
  const end = getPortfolioAnalyticsUpdatedAt()
  if (!analytics || !end) return null

  let earliestIso = null
  for (const key of PORTFOLIO_RANGE_SERIES_KEYS) {
    for (const row of analytics[key] ?? []) {
      const iso = installDateToIso(row.date)
      if (!earliestIso || iso < earliestIso) earliestIso = iso
    }
  }

  if (!earliestIso) return null
  return { from: earliestIso, to: end }
}

export function formatPortfolioAnalyticsDateRange() {
  const range = getPortfolioAnalyticsDateRange()
  if (!range) return null
  return `From ${formatAppDate(range.from)} to ${formatAppDate(range.to)}`
}

export function formatAnalyticsDateRangeLabel(fromIso, toIso) {
  if (fromIso && toIso) return `From ${formatAppDate(fromIso)} to ${formatAppDate(toIso)}`
  if (fromIso) return `From ${formatAppDate(fromIso)}`
  if (toIso) return `Through ${formatAppDate(toIso)}`
  return formatPortfolioAnalyticsDateRange()
}

/** Quick date presets for portfolio stats (daily granularity). */
export const PORTFOLIO_DATE_PRESETS = [
  { id: 'all', label: 'All time', days: null },
  { id: '1d', label: 'Past 24h', days: 1 },
  { id: '2d', label: '2 days', days: 2 },
  { id: '3d', label: '3 days', days: 3 },
  { id: '7d', label: 'Last week', days: 7 },
  { id: '14d', label: '14 days', days: 14 },
  { id: '30d', label: '30 days', days: 30 },
  { id: 'custom', label: 'Custom', days: null },
]

function clampIsoDate(iso, minIso, maxIso) {
  let value = iso
  if (minIso && value < minIso) value = minIso
  if (maxIso && value > maxIso) value = maxIso
  return value
}

/** Inclusive range ending on maxDate (analytics are daily). */
function isoDaysBefore(endIso, daysInclusive) {
  const end = new Date(`${endIso}T12:00:00`)
  const start = new Date(end)
  start.setDate(start.getDate() - (daysInclusive - 1))
  const y = start.getFullYear()
  const m = String(start.getMonth() + 1).padStart(2, '0')
  const d = String(start.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getDateRangeForPreset(presetId, maxDate, minDate) {
  if (presetId === 'all') return { from: '', to: '' }
  if (presetId === 'custom' || !maxDate) return null

  const preset = PORTFOLIO_DATE_PRESETS.find((item) => item.id === presetId)
  if (!preset?.days) return null

  return {
    from: clampIsoDate(isoDaysBefore(maxDate, preset.days), minDate, maxDate),
    to: maxDate,
  }
}

export function detectDatePreset(fromIso, toIso, maxDate, minDate) {
  if (!fromIso && !toIso) return 'all'
  if (!maxDate) return 'custom'

  for (const preset of PORTFOLIO_DATE_PRESETS) {
    if (!preset.days) continue
    const range = getDateRangeForPreset(preset.id, maxDate, minDate)
    if (range?.from === fromIso && range?.to === toIso) return preset.id
  }

  return 'custom'
}

function seriesRowInRange(row, fromIso, toIso) {
  const iso = installDateToIso(row.date)
  if (!iso) return false
  if (fromIso && iso < fromIso) return false
  if (toIso && iso > toIso) return false
  return true
}

/** Slice time-series metrics to a date window and recompute period totals. */
export function filterAnalyticsByDateRange(analytics, fromIso, toIso) {
  if (!analytics) return null
  if (!fromIso && !toIso) return analytics

  const installations = (analytics.installations ?? []).filter((row) =>
    seriesRowInRange(row, fromIso, toIso),
  )
  const weeklyUsers = (analytics.weeklyUsers ?? []).filter((row) =>
    seriesRowInRange(row, fromIso, toIso),
  )
  const pageViewsOverTime = (analytics.pageViewsOverTime ?? []).filter((row) =>
    seriesRowInRange(row, fromIso, toIso),
  )
  const impressionsAcrossChromeWebStore = (analytics.impressionsAcrossChromeWebStore ?? []).filter(
    (row) => seriesRowInRange(row, fromIso, toIso),
  )

  return dedupeAnalyticsObject({
    ...analytics,
    installations,
    weeklyUsers,
    pageViewsOverTime,
    impressionsAcrossChromeWebStore,
    totalInstalls: installationsTotal(installations),
    pageViews: analyticsSeriesTotal(pageViewsOverTime),
    impressions: analyticsSeriesTotal(impressionsAcrossChromeWebStore),
  })
}

export function portfolioAnalyticsTitle(selectedKeys) {
  const apps = getPortfolioApps()
  if (!apps.length) return 'All Extensions Combined'
  if (selectedKeys.size === apps.length) return 'All Extensions Combined'
  if (selectedKeys.size === 1) {
    const app = apps.find((a) => selectedKeys.has(a.key))
    return app ? appFilterLabel(app) : 'Extension'
  }
  return `${selectedKeys.size} Extensions Selected`
}

/** Top extensions by latest active users (optionally within a date window). */
export function getTopExtensionsByActiveUsers(
  apps,
  selectedKeys,
  fromIso = null,
  toIso = null,
  limit = 10,
) {
  if (!apps?.length || !selectedKeys?.size) return []

  return apps
    .filter((app) => selectedKeys.has(app.key))
    .map((app) => {
      const filtered = app.analytics
        ? filterAnalyticsByDateRange(app.analytics, fromIso || null, toIso || null)
        : null
      return {
        key: app.key,
        slug: app.slug,
        name: appFilterLabel({ name: app.name, slug: app.slug }),
        activeUsers: filtered ? analyticsActiveUsers(filtered) ?? 0 : 0,
      }
    })
    .sort((a, b) => b.activeUsers - a.activeUsers)
    .slice(0, limit)
}
