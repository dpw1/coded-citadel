/**
 * Compute portfolio-wide active user delta (~7 days) from db.json snapshots
 * and merge into src/data/apps.json for the live site.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const APPS_JSON = path.join(ROOT, 'src/data/apps.json')
const DB_JSON = path.join(ROOT, 'chrome-extension-html/db.json')

const MS_PER_DAY = 24 * 60 * 60 * 1000
const LOOKBACK_DAYS = 7
/** Reject baselines farther than this from the 7-day target (in days). */
const MAX_BASELINE_DRIFT_DAYS = 3

function isAppLive(app) {
  return app?.status === 'live'
}

function seriesPointValue(row) {
  return row?.total ?? row?.count ?? 0
}

/** `dd-mm-yyyy` from extractor → ISO date for comparison */
function installDateToIso(ddMmYyyy) {
  const [d, m, y] = ddMmYyyy.split('-')
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

export function appIdentityKey(app) {
  if (app?.chromeExtensionId) return app.chromeExtensionId
  const url = app?.chromeStoreUrl
  if (url) {
    const match = url.match(/detail\/([a-z]+)/i)
    if (match) return match[1]
  }
  return app?.slug ?? ''
}

/** Match src/utils/apps.js appActiveUsers (build-time copy). */
export function appActiveUsers(app) {
  if (!isAppLive(app) || !app.analytics) return 0
  const series = app.analytics.weeklyUsers
  if (series?.length) {
    return seriesPointValue(series[series.length - 1])
  }
  return app.analytics.enabledVsDisabled?.enabled ?? 0
}

/** Local calendar date (YYYY-MM-DD) N days before now. */
export function baselineDateIsoLocal(nowMs = Date.now()) {
  const d = new Date(nowMs - LOOKBACK_DAYS * MS_PER_DAY)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Merge weeklyUsers points from many sources; later values win on same day. */
export function mergeWeeklyUsersMaps(sources) {
  const byIso = new Map()
  for (const series of sources) {
    for (const row of series ?? []) {
      if (!row?.date) continue
      byIso.set(installDateToIso(row.date), seriesPointValue(row))
    }
  }
  return byIso
}

/** Users on exact date, else closest within ±2 days, else last point on/before date. */
export function activeUsersOnDateFromMap(byIso, targetIso) {
  if (!byIso.size || !targetIso) return null

  if (byIso.has(targetIso)) {
    return byIso.get(targetIso)
  }

  const targetMs = new Date(`${targetIso}T12:00:00`).getTime()
  let closest = null
  let closestDiff = Infinity

  for (const [iso, total] of byIso) {
    const diff = Math.abs(new Date(`${iso}T12:00:00`).getTime() - targetMs)
    if (diff < closestDiff) {
      closestDiff = diff
      closest = total
    }
  }

  if (closest != null && closestDiff <= 2 * MS_PER_DAY) {
    return closest
  }

  let bestOnOrBefore = null
  let bestDate = null
  for (const [iso, total] of byIso) {
    if (iso <= targetIso && (!bestDate || iso > bestDate)) {
      bestDate = iso
      bestOnOrBefore = total
    }
  }

  return bestOnOrBefore
}

export function buildMergedWeeklyUsersMap(app, snapshots) {
  const identityKey = appIdentityKey(app)
  const sources = [app.analytics?.weeklyUsers]

  for (const snapshot of snapshots) {
    const match = findAppInSnapshotApps(snapshot.appsJson?.apps ?? [], identityKey)
    if (match?.analytics?.weeklyUsers?.length) {
      sources.push(match.analytics.weeklyUsers)
    }
  }

  return mergeWeeklyUsersMaps(sources)
}

export function portfolioActiveUsers(apps) {
  return apps.filter(isAppLive).reduce((sum, app) => sum + appActiveUsers(app), 0)
}

export function findBaselineSnapshot(snapshots, nowMs = Date.now()) {
  if (!snapshots?.length) return null

  const targetMs = nowMs - LOOKBACK_DAYS * MS_PER_DAY
  let best = null
  let bestDiff = Infinity
  let bestExtractedMs = -Infinity

  for (const snapshot of snapshots) {
    const extractedMs = new Date(snapshot.extractedAt).getTime()
    if (Number.isNaN(extractedMs)) continue
    const diff = Math.abs(extractedMs - targetMs)
    if (diff < bestDiff || (diff === bestDiff && extractedMs > bestExtractedMs)) {
      bestDiff = diff
      bestExtractedMs = extractedMs
      best = snapshot
    }
  }

  if (!best) return null

  const driftDays = bestDiff / MS_PER_DAY
  if (driftDays > MAX_BASELINE_DRIFT_DAYS) return null

  return best
}

function findAppInSnapshotApps(apps, identityKey) {
  return apps.find((app) => appIdentityKey(app) === identityKey) ?? null
}

function appExistedOnOrBeforeBaseline(app, snapshots, baselineDateIso) {
  const identityKey = appIdentityKey(app)
  const baselineEndMs = new Date(`${baselineDateIso}T23:59:59`).getTime()

  for (const snapshot of snapshots) {
    const extractedMs = new Date(snapshot.extractedAt).getTime()
    if (Number.isNaN(extractedMs) || extractedMs > baselineEndMs) continue
    if (findAppInSnapshotApps(snapshot.appsJson?.apps ?? [], identityKey)) {
      return true
    }
  }

  return false
}

function enabledFallbackFromDb(snapshots, identityKey, baselineDateIso) {
  const targetMs = new Date(`${baselineDateIso}T12:00:00`).getTime()
  let best = null
  let bestDiff = Infinity

  for (const snapshot of snapshots) {
    const app = findAppInSnapshotApps(snapshot.appsJson?.apps ?? [], identityKey)
    if (!app) continue
    const enabled = app.analytics?.enabledVsDisabled?.enabled ?? 0
    if (!enabled) continue

    const extractedMs = new Date(snapshot.extractedAt).getTime()
    if (Number.isNaN(extractedMs)) continue
    const diff = Math.abs(extractedMs - targetMs)
    if (diff < bestDiff) {
      bestDiff = diff
      best = enabled
    }
  }

  return best
}

function baselineActiveUsersForApp(app, { baselineDateIso, snapshots }) {
  const merged = buildMergedWeeklyUsersMap(app, snapshots)
  const fromSeries = activeUsersOnDateFromMap(merged, baselineDateIso)
  if (fromSeries != null) return fromSeries

  const identityKey = appIdentityKey(app)
  const fromEnabled = enabledFallbackFromDb(snapshots, identityKey, baselineDateIso)
  if (fromEnabled != null) return fromEnabled

  if (appExistedOnOrBeforeBaseline(app, snapshots, baselineDateIso)) {
    return 0
  }

  return 0
}

/** Merge daily installation counts from many sources; later values win on same day. */
export function mergeInstallationsDailyMaps(sources) {
  const byIso = new Map()
  for (const series of sources) {
    for (const row of series ?? []) {
      if (!row?.date) continue
      byIso.set(installDateToIso(row.date), seriesPointValue(row))
    }
  }
  return byIso
}

export function buildMergedInstallationsDailyMap(app, snapshots) {
  const identityKey = appIdentityKey(app)
  const sources = [app.analytics?.installations]

  for (const snapshot of snapshots) {
    const match = findAppInSnapshotApps(snapshot.appsJson?.apps ?? [], identityKey)
    if (match?.analytics?.installations?.length) {
      sources.push(match.analytics.installations)
    }
  }

  return mergeInstallationsDailyMaps(sources)
}

export function cumulativeInstallsOnOrBefore(dailyByIso, targetIso) {
  let sum = 0
  for (const [iso, total] of dailyByIso) {
    if (iso <= targetIso) sum += total
  }
  return sum
}

function totalInstallsFromDbNearDate(snapshots, identityKey, baselineDateIso) {
  const targetMs = new Date(`${baselineDateIso}T12:00:00`).getTime()
  let best = null
  let bestDiff = Infinity

  for (const snapshot of snapshots) {
    const app = findAppInSnapshotApps(snapshot.appsJson?.apps ?? [], identityKey)
    if (!app) continue
    const total = app.analytics?.totalInstalls
    if (total == null) continue

    const extractedMs = new Date(snapshot.extractedAt).getTime()
    if (Number.isNaN(extractedMs)) continue
    const diff = Math.abs(extractedMs - targetMs)
    if (diff < bestDiff) {
      bestDiff = diff
      best = total
    }
  }

  return best
}

function baselineInstallsForApp(app, { baselineDateIso, snapshots }) {
  const mergedDaily = buildMergedInstallationsDailyMap(app, snapshots)
  const fromSeries = cumulativeInstallsOnOrBefore(mergedDaily, baselineDateIso)
  if (fromSeries > 0 || mergedDaily.size > 0) return fromSeries

  const identityKey = appIdentityKey(app)
  if (appExistedOnOrBeforeBaseline(app, snapshots, baselineDateIso)) {
    const fromDb = totalInstallsFromDbNearDate(snapshots, identityKey, baselineDateIso)
    if (fromDb != null) return fromDb
    return 0
  }

  return 0
}

/**
 * Net new installs across all currently live apps since ~7 days ago.
 * New apps count as 0 baseline (full totalInstalls is growth).
 */
export function computeInstallsDelta7d(currentApps, { baselineDateIso, snapshots }) {
  let currentTotal = 0
  let baselineTotal = 0

  for (const app of currentApps.filter(isAppLive)) {
    const now = app.analytics?.totalInstalls ?? 0
    currentTotal += now
    baselineTotal += baselineInstallsForApp(app, { baselineDateIso, snapshots })
  }

  return {
    totalInstalls: currentTotal,
    baselineTotalInstalls: baselineTotal,
    installsDelta7d: currentTotal - baselineTotal,
  }
}

/**
 * Net change in active users across all currently live apps vs ~7 days ago.
 * New apps (not in baseline) count as 0 then.
 */
export function computeActiveUsersDelta7d(currentApps, { baselineDateIso, snapshots }) {
  let currentTotal = 0
  let baselineTotal = 0
  const byApp = []

  for (const app of currentApps.filter(isAppLive)) {
    const now = appActiveUsers(app)
    const baseline = baselineActiveUsersForApp(app, { baselineDateIso, snapshots })
    currentTotal += now
    baselineTotal += baseline
    byApp.push({
      slug: app.slug,
      chromeExtensionId: appIdentityKey(app),
      now,
      baseline,
      delta: now - baseline,
    })
  }

  return {
    totalActiveUsers: currentTotal,
    baselineTotalActiveUsers: baselineTotal,
    activeUsersDelta7d: currentTotal - baselineTotal,
    byApp,
  }
}

export function buildPortfolioStats({ apps, snapshots, nowMs = Date.now() }) {
  const computedAt = new Date(nowMs).toISOString().slice(0, 10)
  const baselineIso = baselineDateIsoLocal(nowMs)
  const baselineSnapshot = findBaselineSnapshot(snapshots, nowMs)

  if (!baselineSnapshot && !snapshots.length) {
    const usersDelta = computeActiveUsersDelta7d(apps, {
      baselineDateIso: baselineIso,
      snapshots: [],
    })
    const installsDelta = computeInstallsDelta7d(apps, {
      baselineDateIso: baselineIso,
      snapshots: [],
    })

    return {
      totalActiveUsers: usersDelta.totalActiveUsers,
      activeUsersDelta7d: null,
      baselineDate: baselineIso,
      baselineTotalActiveUsers: null,
      totalInstalls: installsDelta.totalInstalls,
      installsDelta7d: installsDelta.installsDelta7d,
      baselineTotalInstalls: installsDelta.baselineTotalInstalls,
      computedAt,
    }
  }

  const usersDelta = computeActiveUsersDelta7d(apps, {
    baselineDateIso: baselineIso,
    snapshots,
  })
  const installsDelta = computeInstallsDelta7d(apps, {
    baselineDateIso: baselineIso,
    snapshots,
  })

  return {
    totalActiveUsers: usersDelta.totalActiveUsers,
    activeUsersDelta7d: usersDelta.activeUsersDelta7d,
    baselineDate: baselineIso,
    baselineTotalActiveUsers: usersDelta.baselineTotalActiveUsers,
    byApp: usersDelta.byApp,
    totalInstalls: installsDelta.totalInstalls,
    installsDelta7d: installsDelta.installsDelta7d,
    baselineTotalInstalls: installsDelta.baselineTotalInstalls,
    computedAt,
  }
}

export function updateAppsJsonPortfolioStats({
  appsJsonPath = APPS_JSON,
  dbJsonPath = DB_JSON,
  nowMs = Date.now(),
} = {}) {
  if (!fs.existsSync(appsJsonPath)) {
    console.warn(`No ${path.relative(ROOT, appsJsonPath)} — skipping portfolio stats`)
    return null
  }

  let payload
  try {
    payload = JSON.parse(fs.readFileSync(appsJsonPath, 'utf8'))
  } catch (err) {
    console.error(`Could not parse ${path.relative(ROOT, appsJsonPath)}:`, err.message)
    return null
  }

  let snapshots = []
  if (fs.existsSync(dbJsonPath)) {
    try {
      const db = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'))
      snapshots = db.snapshots ?? []
    } catch (err) {
      console.warn(`Could not parse ${path.relative(ROOT, dbJsonPath)}:`, err.message)
    }
  } else {
    console.warn(
      `No ${path.relative(ROOT, dbJsonPath)} — portfolio delta will use weeklyUsers history only`,
    )
  }

  const portfolioStats = buildPortfolioStats({
    apps: payload.apps ?? [],
    snapshots,
    nowMs,
  })

  payload.portfolioStats = portfolioStats
  fs.writeFileSync(appsJsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

  const deltaLabel =
    portfolioStats.activeUsersDelta7d == null
      ? 'n/a (no ~7d baseline in db.json)'
      : portfolioStats.activeUsersDelta7d >= 0
        ? `+${portfolioStats.activeUsersDelta7d}`
        : `${portfolioStats.activeUsersDelta7d}`

  const installsDeltaLabel =
    portfolioStats.installsDelta7d == null
      ? 'n/a'
      : portfolioStats.installsDelta7d >= 0
        ? `+${portfolioStats.installsDelta7d}`
        : `${portfolioStats.installsDelta7d}`

  console.log(
    `Portfolio stats → ${portfolioStats.totalActiveUsers} active users (${deltaLabel} vs ${portfolioStats.baselineDate ?? 'baseline'}, was ${portfolioStats.baselineTotalActiveUsers ?? '?'}), ${portfolioStats.totalInstalls} installs (${installsDeltaLabel} vs ${portfolioStats.baselineDate ?? 'baseline'}, was ${portfolioStats.baselineTotalInstalls ?? '?'})`,
  )
  if (portfolioStats.byApp?.length) {
    for (const row of portfolioStats.byApp) {
      console.log(`  ${row.slug}: ${row.baseline} → ${row.now} (${row.delta >= 0 ? '+' : ''}${row.delta})`)
    }
  }

  return portfolioStats
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  updateAppsJsonPortfolioStats()
}
