import portfolioData from '../data/portfolio-analytics.json'

export function getPortfolioAnalyticsPayload() {
  return portfolioData
}

export function getPortfolioAnalytics() {
  return portfolioData?.analytics ?? null
}

export function getPortfolioAnalyticsUpdatedAt() {
  return portfolioData?.updatedAt ?? portfolioData?.extractedAt ?? null
}
