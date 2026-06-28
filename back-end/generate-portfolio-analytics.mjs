/**
 * Aggregate live-app analytics from chrome-extension-html/db.json into
 * src/data/portfolio-analytics.json for the /stats page.
 *
 * - Totals and region breakdowns: latest snapshot, summed across live apps
 * - Time series: all snapshots per app (dedupe same date per app, latest wins),
 *   then sum across apps per date
 *
 * Run: npm run generate-portfolio-analytics
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  appIdentityKey,
  installDateToIso,
} from './compute-portfolio-stats.mjs'
import {
  dedupeAnalyticsObject,
  dedupeAnalyticsSeriesByDate,
  resolveEnabledVsDisabledSnapshot,
} from './analytics-series-utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DB_JSON = path.join(ROOT, 'chrome-extension-html/db.json')
const OUT_JSON = path.join(ROOT, 'src/data/portfolio-analytics.json')

function isAppLive(app) {
  return app?.status === 'live'
}

function findAppInSnapshotApps(apps, identityKey) {
  return apps.find((app) => appIdentityKey(app) === identityKey) ?? null
}

function sumRegionMaps(maps) {
  const out = {}
  for (const map of maps) {
    if (!map || typeof map !== 'object') continue
    for (const [key, value] of Object.entries(map)) {
      out[key] = (out[key] ?? 0) + (Number(value) || 0)
    }
  }
  return out
}

/** Merge one app's series across snapshots (chronological — later snapshot wins per date). */
function mergeAppSeriesFromSnapshots(snapshots, identityKey, pickSeries) {
  const byIso = new Map()
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.extractedAt).getTime() - new Date(b.extractedAt).getTime(),
  )

  for (const snapshot of sorted) {
    const app = findAppInSnapshotApps(snapshot.appsJson?.apps ?? [], identityKey)
    if (!app) continue
    const series = dedupeAnalyticsSeriesByDate(pickSeries(app) ?? [])
    for (const row of series) {
      byIso.set(installDateToIso(row.date), row.total)
    }
  }

  return [...byIso.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([iso, total]) => {
      const [y, m, d] = iso.split('-')
      return { date: `${d}-${m}-${y}`, total }
    })
}

/** Sum per-date totals across apps (each app already deduped; one row per day). */
function sumSeriesAcrossApps(appSeriesList) {
  const byIso = new Map()
  for (const series of appSeriesList) {
    for (const row of dedupeAnalyticsSeriesByDate(series)) {
      const iso = installDateToIso(row.date)
      byIso.set(iso, (byIso.get(iso) ?? 0) + row.total)
    }
  }

  return [...byIso.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([iso, total]) => {
      const [y, m, d] = iso.split('-')
      return { date: `${d}-${m}-${y}`, total }
    })
}

function getLatestSnapshot(snapshots) {
  if (!snapshots?.length) return null
  return snapshots.reduce((best, snap) => {
    const t = new Date(snap.extractedAt).getTime()
    const bestT = new Date(best.extractedAt).getTime()
    return t > bestT ? snap : best
  })
}

function buildAppAnalytics(app, snapshots) {
  const key = appIdentityKey(app)
  const an = app.analytics ?? {}

  return dedupeAnalyticsObject({
    totalInstalls: an.totalInstalls ?? 0,
    installations: mergeAppSeriesFromSnapshots(snapshots, key, (a) => a.analytics?.installations),
    weeklyUsers: mergeAppSeriesFromSnapshots(snapshots, key, (a) => a.analytics?.weeklyUsers),
    weeklyUsersByRegion: an.weeklyUsersByRegion ?? {},
    installsByRegion: an.installsByRegion ?? {},
    uninstalls: an.uninstalls ?? 0,
    uninstallsOverTime: mergeAppSeriesFromSnapshots(
      snapshots,
      key,
      (a) => a.analytics?.uninstallsOverTime,
    ),
    uninstallsByRegion: an.uninstallsByRegion ?? {},
    pageViews: an.pageViews ?? 0,
    pageViewsOverTime: mergeAppSeriesFromSnapshots(
      snapshots,
      key,
      (a) => a.analytics?.pageViewsOverTime,
    ),
    pageViewsBySource: an.pageViewsBySource ?? {},
    impressions: an.impressions ?? 0,
    impressionsAcrossChromeWebStore: mergeAppSeriesFromSnapshots(
      snapshots,
      key,
      (a) => a.analytics?.impressionsAcrossChromeWebStore,
    ),
    enabledVsDisabled: resolveEnabledVsDisabledSnapshot(an),
  })
}

function aggregateFromAppEntries(appEntries) {
  const analyticsList = appEntries.map((entry) => entry.analytics).filter(Boolean)
  if (!analyticsList.length) return null

  let totalInstalls = 0
  let pageViews = 0
  let impressions = 0
  let uninstalls = 0
  let enabled = 0
  let disabled = 0

  const installationsByApp = []
  const weeklyUsersByApp = []
  const uninstallsByApp = []
  const pageViewsByApp = []
  const impressionsByApp = []
  const installsByRegionMaps = []
  const weeklyUsersByRegionMaps = []
  const uninstallsByRegionMaps = []
  const pageViewsBySourceMaps = []

  for (const an of analyticsList) {
    totalInstalls += an.totalInstalls ?? 0
    pageViews += an.pageViews ?? 0
    impressions += an.impressions ?? 0
    uninstalls += an.uninstalls ?? 0
    enabled += an.enabledVsDisabled?.enabled ?? 0
    disabled += an.enabledVsDisabled?.disabled ?? 0
    installationsByApp.push(an.installations)
    weeklyUsersByApp.push(an.weeklyUsers)
    uninstallsByApp.push(an.uninstallsOverTime)
    pageViewsByApp.push(an.pageViewsOverTime)
    impressionsByApp.push(an.impressionsAcrossChromeWebStore)
    installsByRegionMaps.push(an.installsByRegion)
    weeklyUsersByRegionMaps.push(an.weeklyUsersByRegion)
    uninstallsByRegionMaps.push(an.uninstallsByRegion)
    pageViewsBySourceMaps.push(an.pageViewsBySource)
  }

  return dedupeAnalyticsObject({
    totalInstalls,
    installations: sumSeriesAcrossApps(installationsByApp),
    weeklyUsers: sumSeriesAcrossApps(weeklyUsersByApp),
    uninstallsOverTime: sumSeriesAcrossApps(uninstallsByApp),
    weeklyUsersByRegion: sumRegionMaps(weeklyUsersByRegionMaps),
    installsByRegion: sumRegionMaps(installsByRegionMaps),
    uninstalls,
    uninstallsByRegion: sumRegionMaps(uninstallsByRegionMaps),
    pageViews,
    pageViewsOverTime: sumSeriesAcrossApps(pageViewsByApp),
    pageViewsBySource: sumRegionMaps(pageViewsBySourceMaps),
    impressions,
    impressionsAcrossChromeWebStore: sumSeriesAcrossApps(impressionsByApp),
    enabledVsDisabled: { enabled, disabled },
  })
}

export function aggregatePortfolioAnalytics(db) {
  const snapshots = db?.snapshots ?? []
  const latest = getLatestSnapshot(snapshots)
  if (!latest) {
    return {
      updatedAt: null,
      extractedAt: null,
      appCount: 0,
      apps: [],
      analytics: null,
    }
  }

  const liveApps = (latest.appsJson?.apps ?? []).filter(isAppLive)

  const apps = liveApps.map((app) => ({
    key: appIdentityKey(app),
    slug: app.slug,
    name: app.name,
    analytics: buildAppAnalytics(app, snapshots),
  }))

  const analytics = aggregateFromAppEntries(apps)

  return {
    updatedAt: latest.updatedAt ?? latest.appsJson?.updatedAt ?? null,
    extractedAt: latest.extractedAt ?? null,
    appCount: liveApps.length,
    apps,
    analytics,
  }
}

function main() {
  if (!fs.existsSync(DB_JSON)) {
    console.warn(`Missing ${DB_JSON} — writing empty portfolio analytics`)
    fs.writeFileSync(
      OUT_JSON,
      `${JSON.stringify({ updatedAt: null, extractedAt: null, appCount: 0, apps: [], analytics: null }, null, 2)}\n`,
    )
    return
  }

  const db = JSON.parse(fs.readFileSync(DB_JSON, 'utf8'))
  const payload = aggregatePortfolioAnalytics(db)
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

  const an = payload.analytics
  if (!an) {
    console.log('Wrote portfolio-analytics.json (no data)')
    return
  }

  console.log(
    `Portfolio analytics: ${payload.appCount} live app(s), ${an.totalInstalls} installs, ${an.installations.length} install day(s) → ${OUT_JSON}`,
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
