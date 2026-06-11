import appsData from '../data/apps.json'
import { dedupeAnalyticsSeriesByDate } from './analyticsSeries'

/** Day 1 of the public journey — May 12, 2026 at local midnight. */
const JOURNEY_DAY_ONE = new Date(2026, 4, 12)
const MS_PER_DAY = 24 * 60 * 60 * 1000

function startOfLocalDay(ms) {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function isAppLive(app) {
  return app?.status === 'live'
}

function activeUsersFromAnalytics(analytics) {
  if (!analytics) return 0
  const series = dedupeAnalyticsSeriesByDate(analytics.weeklyUsers ?? [])
  if (series.length) return series[series.length - 1].total ?? 0
  return analytics.enabledVsDisabled?.enabled ?? 0
}

function parseRevenueValue(revenue) {
  if (revenue == null) return 0
  const m = String(revenue).match(/\$?([\d,.]+)/)
  return m ? Number(m[1].replace(/,/g, '')) : 0
}

function sumLiveTotals(apps) {
  const live = apps.filter(isAppLive)
  let totalInstalls = 0
  let totalActiveUsers = 0
  let totalProfit = 0

  for (const app of live) {
    totalInstalls += app.analytics?.totalInstalls ?? 0
    totalActiveUsers += activeUsersFromAnalytics(app.analytics)
    totalProfit += parseRevenueValue(app.revenue)
  }

  return { live, totalInstalls, totalActiveUsers, totalProfit }
}

function getDaysIntoJourney(now = Date.now()) {
  const elapsed = Math.floor(
    (startOfLocalDay(now) - startOfLocalDay(JOURNEY_DAY_ONE)) / MS_PER_DAY,
  )
  if (elapsed < 0) return null
  return elapsed + 1
}

/**
 * Canonical portfolio stats for the site. Prefer apps.json `portfolioStats`
 * (from compute-portfolio-stats.mjs); fall back to summing live app analytics.
 */
export function buildSiteStats() {
  const apps = appsData.apps ?? []
  const portfolio = appsData.portfolioStats ?? {}
  const summed = sumLiveTotals(apps)

  return {
    liveApps: summed.live.length,
    totalActiveUsers: portfolio.totalActiveUsers ?? summed.totalActiveUsers,
    totalInstalls: portfolio.totalInstalls ?? summed.totalInstalls,
    totalProfit: summed.totalProfit,
    activeUsersDelta7d: portfolio.activeUsersDelta7d ?? null,
    installsDelta7d: portfolio.installsDelta7d ?? null,
    baselineDate: portfolio.baselineDate ?? null,
    baselineTotalActiveUsers: portfolio.baselineTotalActiveUsers ?? null,
    baselineTotalInstalls: portfolio.baselineTotalInstalls ?? null,
    byApp: portfolio.byApp ?? [],
    built: apps.length,
    inProgress: apps.filter((app) => app.status !== 'live').length,
    daysIntoJourney: getDaysIntoJourney(),
    computedAt: portfolio.computedAt ?? appsData.updatedAt ?? null,
  }
}

let cachedStats = null

/** Assign `window.stats` and return the canonical object. */
export function initSiteStats() {
  cachedStats = buildSiteStats()
  if (typeof window !== 'undefined') {
    window.stats = cachedStats
  }
  return cachedStats
}

/** Read canonical stats (`window.stats` when available). */
export function getSiteStats() {
  if (cachedStats) return cachedStats
  if (typeof window !== 'undefined' && window.stats) {
    cachedStats = window.stats
    return cachedStats
  }
  return initSiteStats()
}

/** Week-over-week style percent for KPI cards (from absolute 7d deltas). */
export function siteStatsWeekDeltaPct(delta, baseline) {
  if (delta == null || baseline == null || baseline <= 0) return null
  return { pct: Math.round((delta / baseline) * 1000) / 10 }
}

/** Home page live stats bar. */
export function getHomeStats() {
  const s = getSiteStats()
  return {
    totalActiveUsers: s.totalActiveUsers,
    totalInstalls: s.totalInstalls,
    installDelta: s.installsDelta7d,
    activeUsersDelta7d: s.activeUsersDelta7d,
    built: s.built,
    inProgress: s.inProgress,
    daysIntoJourney: s.daysIntoJourney,
  }
}

/** Header announcement bar marquee / desktop stats. */
export function getAnnouncementBarStats() {
  const s = getSiteStats()
  return {
    liveApps: s.liveApps,
    totalActiveUsers: s.totalActiveUsers,
    totalInstalls: s.totalInstalls,
    totalProfit: s.totalProfit,
  }
}

/** Headline KPI overrides for portfolio analytics (charts keep filtered series). */
export function getSiteStatsHeadlines() {
  const s = getSiteStats()
  return {
    totalInstalls: s.totalInstalls,
    activeUsers: s.totalActiveUsers,
    installsDelta7d: s.installsDelta7d,
    activeUsersDelta7d: s.activeUsersDelta7d,
    baselineTotalInstalls: s.baselineTotalInstalls,
    baselineTotalActiveUsers: s.baselineTotalActiveUsers,
  }
}
