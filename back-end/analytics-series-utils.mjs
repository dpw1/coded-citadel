/** `dd-mm-yyyy` from extractor → ISO date for comparison */
function installDateToIso(ddMmYyyy) {
  if (!ddMmYyyy) return ''
  const [d, m, y] = ddMmYyyy.split('-')
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function seriesRowValue(row) {
  return row?.total ?? row?.count ?? 0
}

/**
 * Collapse rows that share the same calendar day. When duplicates exist,
 * the last row in array order wins (latest appended entry).
 */
export function dedupeAnalyticsSeriesByDate(series) {
  if (!Array.isArray(series) || !series.length) return []

  const byIso = new Map()

  for (const row of series) {
    if (!row?.date) continue
    const iso = installDateToIso(row.date)
    if (!iso) continue
    byIso.set(iso, seriesRowValue(row))
  }

  return [...byIso.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([iso, total]) => {
      const [y, m, d] = iso.split('-')
      return { date: `${d}-${m}-${y}`, total }
    })
}

const SERIES_KEYS = [
  'installations',
  'weeklyUsers',
  'uninstallsOverTime',
  'pageViewsOverTime',
  'impressionsAcrossChromeWebStore',
]

/** Latest enabled/disabled daily row by calendar date. */
export function pickLatestEnabledVsDisabledDaily(series) {
  if (!series?.length) return null
  return series.reduce((best, row) => {
    if (!best) return row
    return installDateToIso(row.date).localeCompare(installDateToIso(best.date)) > 0 ? row : best
  })
}

/** Point-in-time enabled/disabled counts (latest daily row, not cumulative). */
export function resolveEnabledVsDisabledSnapshot(analytics) {
  const latest = pickLatestEnabledVsDisabledDaily(analytics?.enabledVsDisabledOverTime)
  if (latest) {
    return {
      enabled: latest.enabled ?? 0,
      disabled: latest.disabled ?? 0,
      enabledPct: latest.enabledPct,
      disabledPct: latest.disabledPct,
      total: latest.total,
      date: latest.date,
    }
  }

  const snap = analytics?.enabledVsDisabled ?? {}
  return {
    enabled: snap.enabled ?? 0,
    disabled: snap.disabled ?? 0,
    enabledPct: snap.enabledPct,
    disabledPct: snap.disabledPct,
    total: snap.total,
    date: snap.date,
  }
}

/** Dedupe all time-series fields on an analytics object. */
export function dedupeAnalyticsObject(analytics) {
  if (!analytics || typeof analytics !== 'object') return analytics

  const out = { ...analytics }
  for (const key of SERIES_KEYS) {
    if (Array.isArray(out[key])) {
      out[key] = dedupeAnalyticsSeriesByDate(out[key])
    }
  }
  return out
}

/** Dedupe analytics time series on each app in a Chrome export apps array. */
export function dedupeAppsAnalytics(apps) {
  if (!Array.isArray(apps)) return apps
  return apps.map((app) => {
    if (!app?.analytics) return app
    return { ...app, analytics: dedupeAnalyticsObject(app.analytics) }
  })
}
