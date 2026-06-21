import appsData from '../data/apps.json'
import { dedupeAnalyticsSeriesByDate } from './analyticsSeries'
import appsCustomData from '../data/apps-custom-data.json'

const SLUG_ALIASES = {
  test: 'youtube-comments-exporter',
  'yt-comments-exporter': 'youtube-comments-exporter',
  'youtube-filter-pro-filter-by-views-duration-date-and-more': 'youtube-filter-pro',
  dfkkbbcdbjaecgnaocgfonoodmfmkmmm: 'claude-deep-search',
}

export function getAllApps() {
  return appsData.apps ?? []
}

/** ISO date (YYYY-MM-DD) when apps.json was last generated from Chrome exports. */
export function getAppsUpdatedAt() {
  return appsData.updatedAt ?? null
}

export function resolveAppSlug(slug) {
  return SLUG_ALIASES[slug] ?? slug
}

export function getAppBySlug(slug) {
  const resolved = resolveAppSlug(slug)
  return appsData.apps.find((app) => app.slug === resolved) ?? null
}

/** Resolve an app from a `source` query value (extension slug or Chrome Web Store ID). */
export function getAppBySource(source) {
  const trimmed = String(source ?? '').trim()
  if (!trimmed) return null

  const bySlug = getAppBySlug(trimmed)
  if (bySlug) return bySlug

  return (
    appsData.apps.find((app) => app.chromeExtensionId === trimmed) ?? null
  )
}

export function isAppLive(app) {
  return app?.status === 'live'
}

export function appStoreUrl(app) {
  const url = app?.chromeStoreUrl
  return url && url !== '#' ? url : null
}

export function appCardSummary(app) {
  return app.tagline ?? ''
}

/** Short label for filters and compact UI (Chrome listing title before colon). */
export function appFilterLabel(app) {
  const name = app?.name ?? ''
  const short = name.split(':')[0]?.trim()
  return short || name || app?.slug || 'Extension'
}

export function appIconUrl(app) {
  return app.chromeExtensionIcon || null
}

/** Build/deploy duration from apps.json or apps-custom-data.json. */
export function appEstimatedTime(app) {
  if (app?.estimatedTime) return app.estimatedTime

  const custom = (appsCustomData.apps ?? []).find(
    (entry) =>
      entry.slug === app?.slug ||
      entry.id === app?.chromeExtensionId,
  )
  return custom?.estimatedTime ?? null
}

/** AI prompt count from apps.json or apps-custom-data.json. */
export function appPrompts(app) {
  if (app?.prompts != null) return app.prompts

  const custom = (appsCustomData.apps ?? []).find(
    (entry) =>
      entry.slug === app?.slug ||
      entry.id === app?.chromeExtensionId,
  )
  return custom?.prompts ?? null
}

function findCustomAppEntry(app) {
  return (appsCustomData.apps ?? []).find(
    (entry) =>
      entry.slug === app?.slug ||
      entry.id === app?.chromeExtensionId,
  )
}

/** Build-story YouTube URL from apps.json or apps-custom-data.json. */
export function appBuildYoutubeUrl(app) {
  if (app?.youtube && youtubeEmbedId(app.youtube)) return app.youtube

  const custom = findCustomAppEntry(app)
  if (custom?.youtube && youtubeEmbedId(custom.youtube)) return custom.youtube

  return null
}

export function formatRevenue(total) {
  return `$${Math.round(total).toLocaleString('en-US')}`
}

export {
  getAnnouncementBarStats,
  getHomeStats,
  getSiteStats,
  getSiteStatsHeadlines,
  initSiteStats,
} from './siteStats'

/** Day 1 of the public journey — May 12, 2026 at local midnight. */
const JOURNEY_DAY_ONE = new Date(2026, 4, 12)
const MS_PER_DAY = 24 * 60 * 60 * 1000

function startOfLocalDay(ms) {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Inclusive day count since journey start (Day 1 on May 12, 2026). */
export function getDaysIntoJourney(now = Date.now()) {
  const elapsed = Math.floor(
    (startOfLocalDay(now) - startOfLocalDay(JOURNEY_DAY_ONE)) / MS_PER_DAY,
  )
  if (elapsed < 0) return null
  return elapsed + 1
}

/** Display label for journey Day 1 (e.g. "May 12, 2026"). */
export function getJourneyStartDateLabel() {
  return JOURNEY_DAY_ONE.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function analyticsActiveUsers(analytics) {
  if (!analytics) return 0
  const series = getWeeklyUsersSeries(analytics)
  if (series.length) {
    return series[series.length - 1].total ?? 0
  }
  return analytics.enabledVsDisabled?.enabled ?? 0
}

export function appActiveUsers(app) {
  if (!isAppLive(app) || !app.analytics) return null
  return analyticsActiveUsers(app.analytics)
}

export function appCardInstalls(app) {
  if (!isAppLive(app)) return null
  const installs = app.analytics?.totalInstalls
  return installs != null ? installs : 0
}

export function appCardRevenue(app) {
  if (!isAppLive(app)) return null
  if (app.revenue != null) return app.revenue
  return app.price === 'Free' ? '$0' : '—'
}

export function splitAppTitle(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) return { main: name, accent: '' }
  const accent = parts.pop()
  return { main: parts.join(' '), accent }
}

export function formatAppDate(iso) {
  if (!iso) return '—'
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

/** Display label for enabled/disabled snapshot date (`dd-mm-yyyy` or ISO). */
export function formatEnabledVsDisabledDate(enabledVsDisabled) {
  const raw = enabledVsDisabled?.date
  if (!raw) return null
  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
    return formatAppDate(installDateToIso(raw))
  }
  return formatAppDate(raw)
}

export function formatWeekLabel(week) {
  if (!week) return ''
  const d = new Date(`${week}T12:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}

/** `dd-mm-yyyy` from extractor → ISO date for charts */
export function installDateToIso(ddMmYyyy) {
  const [d, m, y] = ddMmYyyy.split('-')
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

const INSTALL_LOOKBACK_DAYS = 7

function baselineDateIsoLocal(now = Date.now()) {
  const d = new Date(now - INSTALL_LOOKBACK_DAYS * MS_PER_DAY)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Sum installs on or before baselineDate from daily installation rows. */
export function computeInstallsDelta7dFromApps(apps, baselineDateIso = baselineDateIsoLocal()) {
  let currentTotal = 0
  let baselineTotal = 0

  for (const app of apps.filter(isAppLive)) {
    const now = app.analytics?.totalInstalls ?? 0
    currentTotal += now

    let baseline = 0
    for (const row of app.analytics?.installations ?? []) {
      if (!row?.date) continue
      const iso = installDateToIso(row.date)
      if (iso <= baselineDateIso) baseline += row.total ?? 0
    }
    baselineTotal += baseline
  }

  return {
    totalInstalls: currentTotal,
    baselineTotalInstalls: baselineTotal,
    installsDelta7d: currentTotal - baselineTotal,
  }
}

export function formatInstallDate(ddMmYyyy) {
  if (!ddMmYyyy) return ''
  const d = new Date(`${installDateToIso(ddMmYyyy)}T12:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}

export function getInstallationsSeries(analytics) {
  return dedupeAnalyticsSeriesByDate(analytics?.installations ?? [])
}

/** Display string from custom data, or ISO date from earliest install day in analytics. */
export function appCreatedDate(app) {
  if (app?.created) return app.created
  const series = getInstallationsSeries(app?.analytics)
  if (!series.length) return null
  let earliest = null
  for (const row of series) {
    if (!row?.date) continue
    const iso = installDateToIso(row.date)
    if (!earliest || iso < earliest) earliest = iso
  }
  return earliest
}

export function formatAppCreatedDate(app) {
  if (app?.created) return app.created
  return formatAppDate(appCreatedDate(app))
}

export function getWeeklyUsersSeries(analytics) {
  return dedupeAnalyticsSeriesByDate(analytics?.weeklyUsers ?? [])
}

export function getPageViewsSeries(analytics) {
  return dedupeAnalyticsSeriesByDate(analytics?.pageViewsOverTime ?? [])
}

export function getImpressionsSeries(analytics) {
  return dedupeAnalyticsSeriesByDate(analytics?.impressionsAcrossChromeWebStore ?? [])
}

export function analyticsSeriesTotal(series) {
  return series.reduce((sum, row) => sum + (row.total ?? 0), 0)
}

function seriesPointValue(row) {
  return row?.total ?? row?.count ?? 0
}

function isoFromLocalDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDaysToIso(iso, days) {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + days)
  return isoFromLocalDate(d)
}

function seriesTotalsByIso(series) {
  const byIso = new Map()
  for (const row of series ?? []) {
    if (!row?.date) continue
    byIso.set(installDateToIso(row.date), seriesPointValue(row))
  }
  return byIso
}

function sumSeriesForDaysEnding(byIso, endIso, dayCount) {
  let sum = 0
  for (let i = 0; i < dayCount; i++) {
    sum += byIso.get(addDaysToIso(endIso, -i)) ?? 0
  }
  return sum
}

/** Compare a 7-day total ending on the latest day vs the prior 7-day window. */
export function analyticsSeriesWeekDelta(series, windowDays = 7) {
  const byIso = seriesTotalsByIso(series)
  if (!byIso.size) return null

  const lastIso = [...byIso.keys()].sort().pop()
  const last = sumSeriesForDaysEnding(byIso, lastIso, windowDays)
  const prevEndIso = addDaysToIso(lastIso, -windowDays)
  const prev = sumSeriesForDaysEnding(byIso, prevEndIso, windowDays)

  if (!prev) return null
  const pct = Math.round(((last - prev) / prev) * 100)
  return { pct, last, prev }
}

/** Compare snapshot value at the latest day vs ~7 days earlier (for cumulative series). */
export function analyticsSnapshotWeekDelta(series, lookbackDays = 7) {
  const byIso = seriesTotalsByIso(series)
  if (!byIso.size) return null

  const lastIso = [...byIso.keys()].sort().pop()
  const last = byIso.get(lastIso)
  const targetPrevIso = addDaysToIso(lastIso, -lookbackDays)

  let prev = byIso.get(targetPrevIso)
  if (prev == null) {
    for (const iso of [...byIso.keys()].sort().reverse()) {
      if (iso <= targetPrevIso) {
        prev = byIso.get(iso)
        break
      }
    }
  }

  if (prev == null || !prev) return null
  const pct = Math.round(((last - prev) / prev) * 100)
  return { pct, last, prev }
}

export function analyticsSeriesDelta(series) {
  if (!series?.length || series.length < 2) return null
  const prev = seriesPointValue(series[series.length - 2])
  const last = seriesPointValue(series[series.length - 1])
  if (!prev) return null
  const pct = Math.round(((last - prev) / prev) * 100)
  return { pct, last, prev }
}

export function installationsTotal(series) {
  return series.reduce((sum, row) => sum + (row.total ?? 0), 0)
}

export function installationsDelta(series) {
  return analyticsSeriesWeekDelta(series)
}

export function formatNumber(n) {
  return Number(n).toLocaleString('en-US')
}

export function formatLabel(key) {
  const labels = {
    other: 'Other',
    chromeWebStore: 'Chrome Web Store',
    google: 'Google',
    direct: 'Direct',
  }
  if (labels[key]) return labels[key]
  if (/^[A-Z]{2}$/.test(key)) return key
  return key.charAt(0).toUpperCase() + key.slice(1)
}

export function titleCaseAudience(value) {
  return value
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function weeklyUsersDelta(weeklyUsers) {
  return analyticsSeriesDelta(weeklyUsers)
}

export function totalUsersDelta(analytics) {
  return analyticsSnapshotWeekDelta(getWeeklyUsersSeries(analytics))
}

export function pageViewsDelta(analytics) {
  return analyticsSeriesWeekDelta(getPageViewsSeries(analytics))
}

export function impressionsDelta(analytics) {
  return analyticsSeriesWeekDelta(getImpressionsSeries(analytics))
}

export function youtubeEmbedId(url) {
  if (!url || url === '#') return null
  try {
    const u = new URL(url)
    let id = null
    if (u.hostname.includes('youtu.be')) {
      id = u.pathname.replace(/^\//, '').split('/')[0]
    } else {
      id = u.searchParams.get('v')
    }
    if (!id || !/^[\w-]{11}$/.test(id) || /^1234567890/i.test(id)) return null
    return id
  } catch {
    return null
  }
}

/** Valid promotional YouTube URL from the edit page, or null. */
export function appHeroYoutubeUrl(app) {
  const url = app?.buildStory?.youtubeUrl
  return youtubeEmbedId(url) ? url : null
}

/** Store screenshot used when there is no YouTube promo video. */
export function appHeroPreviewUrl(app) {
  const shot = app?.screenshots?.[0]
  return typeof shot === 'string' && shot.startsWith('http') ? shot : null
}
