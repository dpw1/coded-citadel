import portfolioData from '../data/portfolio-analytics.json'
import { dedupeAnalyticsObject } from './analyticsSeries'

export function getPortfolioAnalyticsPayload() {
  return portfolioData
}

export function getPortfolioAnalytics() {
  const analytics = portfolioData?.analytics ?? null
  return analytics ? dedupeAnalyticsObject(analytics) : null
}

export function getPortfolioAnalyticsUpdatedAt() {
  return portfolioData?.updatedAt ?? portfolioData?.extractedAt ?? null
}
