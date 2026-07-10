import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const GA_DB_PATH = resolve(__dirname, '../../src/data/ga-db.json')

export function emptyGaDb() {
  return {
    version: 1,
    updatedAt: null,
    daily: [],
    snapshots: [],
    blogPostViews: [],
  }
}

export function readGaDb() {
  if (!existsSync(GA_DB_PATH)) return emptyGaDb()

  try {
    const data = JSON.parse(readFileSync(GA_DB_PATH, 'utf8'))
    return {
      ...emptyGaDb(),
      ...data,
      daily: data.daily ?? [],
      snapshots: data.snapshots ?? [],
      blogPostViews: data.blogPostViews ?? [],
    }
  } catch {
    return emptyGaDb()
  }
}

export function writeGaDb(db) {
  writeFileSync(GA_DB_PATH, `${JSON.stringify(db, null, 2)}\n`, 'utf8')
}

/** GA `date` dimension value (YYYYMMDD) or ISO → YYYY-MM-DD */
export function gaDateToIso(gaDate) {
  const s = String(gaDate ?? '').trim()
  if (/^\d{8}$/.test(s)) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  return s
}

/** ISO date → dd-mm-yyyy (matches extension chart labels) */
export function isoToChartDate(iso) {
  const [y, m, d] = String(iso).split('-')
  if (!y || !m || !d) return String(iso)
  return `${d}-${m}-${y}`
}

export function mergeDailyRows(existing, incoming) {
  const byDate = new Map()

  for (const row of existing ?? []) {
    const iso = gaDateToIso(row.date)
    byDate.set(iso, { ...row, date: iso })
  }

  for (const row of incoming ?? []) {
    const iso = gaDateToIso(row.date)
    byDate.set(iso, { ...row, date: iso })
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export function buildTimeSeriesFromDaily(daily) {
  const sorted = [...(daily ?? [])].sort((a, b) => a.date.localeCompare(b.date))

  const toSeries = (pick) =>
    sorted.map((row) => ({
      date: isoToChartDate(row.date),
      total: Number(pick(row) ?? 0),
    }))

  return {
    pageViews: toSeries((row) => row.pageViews),
    activeUsers: toSeries((row) => row.activeUsers),
    blogViews: toSeries((row) => row.blogViews),
    sessions: toSeries((row) => row.sessions),
  }
}

/** Keep one snapshot per calendar day (latest wins). */
export function appendSnapshot(db, analytics) {
  const extractedAt = analytics.updatedAt || new Date().toISOString()
  const day = extractedAt.slice(0, 10)
  const { timeSeries, ...rest } = analytics
  const snapshots = (db.snapshots ?? []).filter((s) => !String(s.extractedAt).startsWith(day))
  snapshots.push({ extractedAt, analytics: rest })
  return snapshots
}
