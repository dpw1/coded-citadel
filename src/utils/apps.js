import appsData from '../data/apps.json'

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

export function appIconUrl(app) {
  return app.chromeExtensionIcon || null
}

function parseRevenueValue(revenue) {
  if (revenue == null) return 0
  const m = String(revenue).match(/\$?([\d,.]+)/)
  return m ? Number(m[1].replace(/,/g, '')) : 0
}

export function formatRevenue(total) {
  return `$${Math.round(total).toLocaleString('en-US')}`
}

/** Live portfolio totals for the site announcement bar. */
export function getAnnouncementBarStats() {
  const live = getAllApps().filter(isAppLive)
  let totalInstalls = 0
  let totalActiveUsers = 0
  let totalProfit = 0

  for (const app of live) {
    const installs = app.analytics?.totalInstalls
    if (installs != null) totalInstalls += installs
    totalActiveUsers += appActiveUsers(app) ?? 0
    totalProfit += parseRevenueValue(app.revenue)
  }

  return {
    liveApps: live.length,
    totalActiveUsers,
    totalInstalls,
    totalProfit,
  }
}

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

export function appActiveUsers(app) {
  if (!isAppLive(app) || !app.analytics) return null
  const series = app.analytics.weeklyUsers
  if (series?.length) {
    return series[series.length - 1].total ?? 0
  }
  return app.analytics.enabledVsDisabled?.enabled ?? 0
}

export function getHomeStats() {
  const apps = getAllApps()
  const live = apps.filter(isAppLive)
  let totalInstalls = 0
  let totalActiveUsers = 0

  for (const app of live) {
    const installs = app.analytics?.totalInstalls
    if (installs != null) totalInstalls += installs
    totalActiveUsers += appActiveUsers(app) ?? 0
  }

  const installsDelta7d =
    appsData.portfolioStats?.installsDelta7d ??
    computeInstallsDelta7dFromApps(apps).installsDelta7d

  const built = apps.length
  const inProgress = apps.filter((a) => a.status !== 'live').length

  return {
    totalActiveUsers,
    totalInstalls,
    installDelta: installsDelta7d,
    activeUsersDelta7d: appsData.portfolioStats?.activeUsersDelta7d ?? null,
    built,
    inProgress,
    daysIntoJourney: getDaysIntoJourney(),
  }
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
  return analytics?.installations ?? []
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
  return analytics?.weeklyUsers ?? []
}

export function getPageViewsSeries(analytics) {
  return analytics?.pageViewsOverTime ?? []
}

export function getImpressionsSeries(analytics) {
  return analytics?.impressionsAcrossChromeWebStore ?? []
}

export function analyticsSeriesTotal(series) {
  return series.reduce((sum, row) => sum + (row.total ?? 0), 0)
}

function seriesPointValue(row) {
  return row?.total ?? row?.count ?? 0
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
  if (!series?.length || series.length < 2) return null
  const prev = seriesPointValue(series[series.length - 2])
  const last = seriesPointValue(series[series.length - 1])
  if (!prev) return null
  const pct = Math.round(((last - prev) / prev) * 100)
  return { pct, last, prev }
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
