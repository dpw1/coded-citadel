import portfolioData from '../data/portfolio-analytics.json'
import { dedupeAnalyticsObject } from './analyticsSeries'
import { aggregateAnalyticsList } from './portfolioAggregate'
import { appFilterLabel } from './apps'

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
