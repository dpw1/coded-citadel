import { getServiceAccountAccessToken } from './google-service-auth.mjs'
import { loadEnv } from './load-env.mjs'
import {
  appendSnapshot,
  buildTimeSeriesFromDaily,
  gaDateToIso,
  mergeDailyRows,
  readGaDb,
  writeGaDb,
} from './ga-db.mjs'
import { resolveCountryFromGa } from './country-utils.mjs'

const GA_RUN_REPORT = 'https://analyticsdata.googleapis.com/v1beta'

function parseMetricValue(value) {
  if (value === '' || value == null) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : value
}

function metricValue(row, metricIndex) {
  return parseMetricValue(row?.metricValues?.[metricIndex]?.value)
}

function dimensionValue(row, dimensionIndex) {
  return row?.dimensionValues?.[dimensionIndex]?.value ?? null
}

function emptyWebsiteAnalytics(message = 'Website analytics not configured') {
  return {
    available: false,
    updatedAt: null,
    message,
    totalViews: null,
    blogViews: null,
    averageTimeOnSiteSeconds: null,
    bounceRate: null,
    newVsReturning: { new: null, returning: null },
    mostViewedPages: [],
    countries: [],
    trafficSources: [],
    topReferrers: [],
    timeSeries: {
      pageViews: [],
      activeUsers: [],
      blogViews: [],
      sessions: [],
    },
  }
}

export function getWebsiteAnalyticsEnv() {
  loadEnv()
  return {
    privateKey: process.env.GOOGLE_ANALYTICS_PRIVATE_KEY,
    clientEmail: process.env.GOOGLE_ANALYTICS_EMAIL,
    projectId: process.env.GOOGLE_ANALYTICS_PROJECT_ID,
    propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
  }
}

export function hasWebsiteAnalyticsEnv(env = getWebsiteAnalyticsEnv()) {
  return Boolean(env.privateKey && env.clientEmail && env.propertyId)
}

async function runReport(accessToken, propertyId, body) {
  const property = String(propertyId).startsWith('properties/')
    ? propertyId
    : `properties/${propertyId}`

  const res = await fetch(`${GA_RUN_REPORT}/${property}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText
    throw new Error(`Google Analytics runReport failed: ${msg}`)
  }

  return data
}

async function runScalarReport(accessToken, propertyId, body) {
  const data = await runReport(accessToken, propertyId, body)
  const row = data?.rows?.[0]
  if (!row) return null
  return metricValue(row, 0)
}

async function runDimensionReport(accessToken, propertyId, body) {
  const data = await runReport(accessToken, propertyId, body)
  const metricHeaders = (data?.metricHeaders || []).map((h) => h.name)
  const dimensionHeaders = (data?.dimensionHeaders || []).map((h) => h.name)

  return (data?.rows || []).map((row) => {
    const entry = {}
    dimensionHeaders.forEach((name, index) => {
      entry[name] = dimensionValue(row, index)
    })
    metricHeaders.forEach((name, index) => {
      entry[name] = metricValue(row, index)
    })
    return entry
  })
}

function mapCountryRow(row) {
  return resolveCountryFromGa(row)
}

export async function fetchGaDailyMetrics(accessToken, propertyId, options = {}) {
  const dateRange = {
    startDate: options.startDate || '2020-01-01',
    endDate: options.endDate || 'today',
  }

  const [mainRows, blogRows] = await Promise.all([
    runDimensionReport(accessToken, propertyId, {
      dateRanges: [dateRange],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
      limit: 10000,
    }),
    runDimensionReport(accessToken, propertyId, {
      dateRanges: [dateRange],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'screenPageViews' }],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: { matchType: 'BEGINS_WITH', value: '/blog' },
        },
      },
      orderBys: [{ dimension: { dimensionName: 'date' } }],
      limit: 10000,
    }),
  ])

  const blogByDate = new Map(
    blogRows.map((row) => [gaDateToIso(row.date), row.screenPageViews ?? 0]),
  )

  return mainRows.map((row) => {
    const iso = gaDateToIso(row.date)
    return {
      date: iso,
      pageViews: row.screenPageViews ?? 0,
      activeUsers: row.activeUsers ?? 0,
      sessions: row.sessions ?? 0,
      blogViews: blogByDate.get(iso) ?? 0,
      avgSessionDurationSeconds: row.averageSessionDuration ?? null,
      bounceRate: row.bounceRate ?? null,
    }
  })
}

async function fetchWebsiteAnalyticsSnapshot(accessToken, propertyId, options = {}) {
  const dateRange = {
    startDate: options.startDate || '2020-01-01',
    endDate: options.endDate || 'today',
  }

  const [
    totalViews,
    blogViews,
    averageTimeOnSiteSeconds,
    bounceRate,
    newVsReturningRows,
    mostViewedPagesRows,
    countriesRows,
    trafficSourcesRows,
    topReferrersRows,
  ] = await Promise.all([
    runScalarReport(accessToken, propertyId, {
      dateRanges: [dateRange],
      metrics: [{ name: 'screenPageViews' }],
    }),
    runScalarReport(accessToken, propertyId, {
      dateRanges: [dateRange],
      metrics: [{ name: 'screenPageViews' }],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: { matchType: 'BEGINS_WITH', value: '/blog' },
        },
      },
    }),
    runScalarReport(accessToken, propertyId, {
      dateRanges: [dateRange],
      metrics: [{ name: 'averageSessionDuration' }],
    }),
    runScalarReport(accessToken, propertyId, {
      dateRanges: [dateRange],
      metrics: [{ name: 'bounceRate' }],
    }),
    runDimensionReport(accessToken, propertyId, {
      dateRanges: [dateRange],
      dimensions: [{ name: 'newVsReturning' }],
      metrics: [{ name: 'activeUsers' }],
    }),
    runDimensionReport(accessToken, propertyId, {
      dateRanges: [dateRange],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ desc: true, metric: { metricName: 'screenPageViews' } }],
      limit: 10,
    }),
    runDimensionReport(accessToken, propertyId, {
      dateRanges: [dateRange],
      dimensions: [{ name: 'countryId' }, { name: 'country' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ desc: true, metric: { metricName: 'activeUsers' } }],
      limit: 25,
    }),
    runDimensionReport(accessToken, propertyId, {
      dateRanges: [dateRange],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ desc: true, metric: { metricName: 'sessions' } }],
      limit: 10,
    }),
    runDimensionReport(accessToken, propertyId, {
      dateRanges: [dateRange],
      dimensions: [{ name: 'sessionSource' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ desc: true, metric: { metricName: 'sessions' } }],
      limit: 10,
    }),
  ])

  const newVsReturning = { new: null, returning: null }
  for (const row of newVsReturningRows) {
    const key = String(row.newVsReturning || '').toLowerCase()
    if (key === 'new') newVsReturning.new = row.activeUsers ?? null
    if (key === 'returning') newVsReturning.returning = row.activeUsers ?? null
  }

  return {
    available: true,
    updatedAt: new Date().toISOString(),
    message: null,
    totalViews,
    blogViews,
    averageTimeOnSiteSeconds,
    bounceRate,
    newVsReturning,
    mostViewedPages: mostViewedPagesRows.map((row) => ({
      path: row.pagePath || '/',
      views: row.screenPageViews ?? 0,
    })),
    countries: countriesRows.map(mapCountryRow),
    trafficSources: trafficSourcesRows.map((row) => ({
      source: row.sessionDefaultChannelGroup || 'Unknown',
      sessions: row.sessions ?? 0,
    })),
    topReferrers: topReferrersRows.map((row) => ({
      referrer: row.sessionSource || '(direct)',
      sessions: row.sessions ?? 0,
    })),
  }
}

export async function fetchWebsiteAnalytics(options = {}) {
  const env = options.env ?? getWebsiteAnalyticsEnv()
  if (!hasWebsiteAnalyticsEnv(env)) {
    return emptyWebsiteAnalytics()
  }

  const accessToken = await getServiceAccountAccessToken({
    clientEmail: env.clientEmail,
    privateKey: env.privateKey,
  })

  const snapshot = await fetchWebsiteAnalyticsSnapshot(accessToken, env.propertyId, options)
  const gaDb = readGaDb()
  const timeSeries = buildTimeSeriesFromDaily(gaDb.daily)
  return { ...snapshot, timeSeries }
}

/** Fetch snapshot + backfill daily rows into ga-db.json */
export async function fetchWebsiteAnalyticsBundle(options = {}) {
  const env = options.env ?? getWebsiteAnalyticsEnv()
  if (!hasWebsiteAnalyticsEnv(env)) {
    return { snapshot: emptyWebsiteAnalytics(), gaDb: readGaDb() }
  }

  const accessToken = await getServiceAccountAccessToken({
    clientEmail: env.clientEmail,
    privateKey: env.privateKey,
  })

  const [snapshot, dailyIncoming] = await Promise.all([
    fetchWebsiteAnalyticsSnapshot(accessToken, env.propertyId, options),
    fetchGaDailyMetrics(accessToken, env.propertyId, options),
  ])

  const gaDb = readGaDb()
  gaDb.daily = mergeDailyRows(gaDb.daily, dailyIncoming)
  gaDb.updatedAt = snapshot.updatedAt
  gaDb.snapshots = appendSnapshot(gaDb, snapshot)

  const timeSeries = buildTimeSeriesFromDaily(gaDb.daily)
  const snapshotWithSeries = { ...snapshot, timeSeries }

  writeGaDb(gaDb)

  return { snapshot: snapshotWithSeries, gaDb }
}
