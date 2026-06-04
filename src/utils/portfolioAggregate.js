import { dedupeAnalyticsObject, dedupeAnalyticsSeriesByDate } from './analyticsSeries'

function installDateToIso(ddMmYyyy) {
  if (!ddMmYyyy) return ''
  const [d, m, y] = ddMmYyyy.split('-')
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
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

function sumSeriesAcrossApps(appSeriesList) {
  const byIso = new Map()
  for (const series of appSeriesList) {
    for (const row of dedupeAnalyticsSeriesByDate(series ?? [])) {
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

/** Sum multiple per-app analytics objects into one portfolio-shaped object. */
export function aggregateAnalyticsList(analyticsList) {
  if (!analyticsList?.length) return null

  let totalInstalls = 0
  let pageViews = 0
  let impressions = 0
  let uninstalls = 0
  let enabled = 0
  let disabled = 0

  const installationsByApp = []
  const weeklyUsersByApp = []
  const pageViewsByApp = []
  const impressionsByApp = []
  const installsByRegionMaps = []
  const weeklyUsersByRegionMaps = []
  const uninstallsByRegionMaps = []
  const pageViewsBySourceMaps = []

  for (const an of analyticsList) {
    if (!an) continue
    totalInstalls += an.totalInstalls ?? 0
    pageViews += an.pageViews ?? 0
    impressions += an.impressions ?? 0
    uninstalls += an.uninstalls ?? 0
    enabled += an.enabledVsDisabled?.enabled ?? 0
    disabled += an.enabledVsDisabled?.disabled ?? 0
    installationsByApp.push(an.installations)
    weeklyUsersByApp.push(an.weeklyUsers)
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
