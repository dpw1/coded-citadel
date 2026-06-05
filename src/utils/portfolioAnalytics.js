import portfolioData from '../data/portfolio-analytics.json'
import { dedupeAnalyticsObject } from './analyticsSeries'
import { aggregateAnalyticsList } from './portfolioAggregate'
import { appFilterLabel, formatAppDate, installDateToIso } from './apps'

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
