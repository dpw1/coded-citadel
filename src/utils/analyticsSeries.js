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

/** Dedupe all time-series fields on an analytics object (in place + return). */
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
