import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadEnv, getRootDir } from './load-env.mjs'
import {
  clearYoutubeTokenCache,
  getYoutubeAccessToken,
  getYoutubeOAuthEnv,
  hasYoutubeAnalyticsEnv,
} from './youtube-oauth.mjs'

const YT_ANALYTICS = 'https://youtubeanalytics.googleapis.com/v2/reports'
const YT_DATA = 'https://www.googleapis.com/youtube/v3'
const ALL_TIME_START = '2005-01-01'

const TRAFFIC_KEYS = [
  'YT_SEARCH',
  'YT_CHANNEL',
  'SUGGESTED_VIDEO',
  'EXTERNAL',
  'BROWSE',
  'OTHER',
]

const TRAFFIC_SOURCE_MAP = {
  YT_SEARCH: 'YT_SEARCH',
  YT_CHANNEL: 'YT_CHANNEL',
  RELATED_VIDEO: 'SUGGESTED_VIDEO',
  SUGGESTED_VIDEO: 'SUGGESTED_VIDEO',
  EXT_URL: 'EXTERNAL',
  EXTERNAL: 'EXTERNAL',
  YT_OTHER_PAGE: 'BROWSE',
  SUBSCRIBER: 'BROWSE',
  BROWSE: 'BROWSE',
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function parseMetricValue(value) {
  if (value === '' || value == null) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : value
}

function emptyTrafficSources() {
  return Object.fromEntries(TRAFFIC_KEYS.map((k) => [k, null]))
}

function emptyYoutubeAnalytics(message = 'YouTube analytics not configured') {
  return {
    available: false,
    updatedAt: null,
    message,
    totalViews: null,
    totalLikes: null,
    totalWatchHours: null,
    subscriberCount: null,
    mostWatchedVideo: null,
    averageViewDurationSeconds: null,
    impressions: null,
    clickThroughRate: null,
    commentsCount: null,
    trafficSources: [],
  }
}

function reportHeaders(data) {
  return (data?.columnHeaders || []).map((h) => ({
    name: h.name,
    type: h.columnType,
  }))
}

function singleRowMetrics(data) {
  if (!data?.rows?.length) return {}
  const headers = reportHeaders(data)
  const row = data.rows[0]
  const out = {}
  headers.forEach((h, i) => {
    if (h.type === 'METRIC') out[h.name] = parseMetricValue(row[i])
  })
  return out
}

function dimensionMetricRows(data) {
  if (!data?.rows?.length) return []
  const headers = reportHeaders(data)
  return data.rows.map((row) => {
    const obj = {}
    headers.forEach((h, i) => {
      obj[h.name] = h.type === 'METRIC' ? parseMetricValue(row[i]) : row[i] ?? null
    })
    return obj
  })
}

function applyTrafficRows(rows, metricName = 'views') {
  const target = emptyTrafficSources()
  for (const row of rows) {
    const rawType = row.insightTrafficSourceType
    const bucket = TRAFFIC_SOURCE_MAP[rawType] || 'OTHER'
    const value = parseMetricValue(row[metricName])
    if (value == null) continue
    const current = target[bucket]
    target[bucket] = current == null ? value : current + value
  }
  return target
}

function trafficSourcesList(trafficMap) {
  return Object.entries(trafficMap)
    .filter(([, views]) => views != null && views > 0)
    .map(([source, views]) => ({ source, views }))
    .sort((a, b) => b.views - a.views)
}

async function analyticsReport(accessToken, params, { retryOnUnauthorized = true, env } = {}) {
  const url = new URL(YT_ANALYTICS)
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') url.searchParams.set(key, String(value))
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  if (res.status === 401 && retryOnUnauthorized && env?.refreshToken) {
    clearYoutubeTokenCache()
    const freshToken = await getYoutubeAccessToken(env)
    return analyticsReport(freshToken, params, { retryOnUnauthorized: false, env })
  }
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText
    throw new Error(`YouTube Analytics: ${msg}`)
  }
  return data
}

async function dataApiGet(accessToken, apiKey, path, params) {
  const url = new URL(`${YT_DATA}/${path}`)
  if (apiKey) url.searchParams.set('key', apiKey)
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') url.searchParams.set(key, String(value))
  }

  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
  const res = await fetch(url, { headers })
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText
    throw new Error(`YouTube Data API ${path}: ${msg}`)
  }
  return data
}

function loadChannelIdFromVideosJson() {
  try {
    const file = resolve(getRootDir(), 'src/data/youtube-videos.json')
    const { channel } = JSON.parse(readFileSync(file, 'utf8'))
    return channel?.id ?? null
  } catch {
    return null
  }
}

async function fetchChannelStats(env, accessToken) {
  const data = await dataApiGet(accessToken, env.apiKey, 'channels', {
    part: 'statistics',
    mine: 'true',
  })
  return data.items?.[0]?.statistics ?? null
}

async function fetchMostWatchedVideo(env, accessToken, range) {
  const report = await analyticsReport(accessToken, {
    ids: 'channel==MINE',
    ...range,
    dimensions: 'video',
    metrics: 'views',
    sort: '-views',
    maxResults: 1,
  }, { env })

  const row = dimensionMetricRows(report)[0]
  if (!row?.video) return null

  let title = row.video
  let videoId = row.video

  if (env.apiKey) {
    try {
      const meta = await dataApiGet(null, env.apiKey, 'videos', {
        part: 'snippet',
        id: row.video,
      })
      title = meta.items?.[0]?.snippet?.title || title
      videoId = meta.items?.[0]?.id || videoId
    } catch {
      // keep analytics video id as title fallback
    }
  }

  return {
    videoId,
    title,
    views: row.views ?? null,
  }
}

export async function fetchYoutubeAnalytics(options = {}) {
  const env = options.env ?? getYoutubeOAuthEnv()
  if (!hasYoutubeAnalyticsEnv(env)) {
    return emptyYoutubeAnalytics()
  }

  clearYoutubeTokenCache()
  const accessToken = await getYoutubeAccessToken(env)
  const range = {
    startDate: options.startDate || ALL_TIME_START,
    endDate: options.endDate || todayIsoDate(),
  }

  const channelMetrics = [
    'views',
    'likes',
    'comments',
    'estimatedMinutesWatched',
    'averageViewDuration',
    'impressions',
    'impressionClickThroughRate',
  ].join(',')

  const [channelReport, channelStats, trafficReport, mostWatchedVideo] = await Promise.all([
    analyticsReport(accessToken, {
      ids: 'channel==MINE',
      ...range,
      metrics: channelMetrics,
    }, { env }),
    fetchChannelStats(env, accessToken),
    analyticsReport(accessToken, {
      ids: 'channel==MINE',
      ...range,
      dimensions: 'insightTrafficSourceType',
      metrics: 'views',
    }, { env }),
    fetchMostWatchedVideo(env, accessToken, range),
  ])

  const metrics = singleRowMetrics(channelReport)
  const trafficMap = applyTrafficRows(dimensionMetricRows(trafficReport))
  const watchMinutes = metrics.estimatedMinutesWatched ?? null

  return {
    available: true,
    updatedAt: todayIsoDate(),
    message: null,
    totalViews: metrics.views ?? parseMetricValue(channelStats?.viewCount),
    totalLikes: metrics.likes ?? null,
    totalWatchHours: watchMinutes == null ? null : watchMinutes / 60,
    subscriberCount: parseMetricValue(channelStats?.subscriberCount),
    mostWatchedVideo,
    averageViewDurationSeconds: metrics.averageViewDuration ?? null,
    impressions: metrics.impressions ?? null,
    clickThroughRate: metrics.impressionClickThroughRate ?? null,
    commentsCount: metrics.comments ?? null,
    trafficSources: trafficSourcesList(trafficMap),
    channelId: loadChannelIdFromVideosJson(),
  }
}
