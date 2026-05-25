/**
 * Fetches YouTube Analytics + Data API metrics and appends a dated snapshot to
 * data/youtube-stats-database.json.
 *
 * Requires in project root .env:
 *   YOUTUBE_ANALYTICS_CLIENT_ID, YOUTUBE_ANALYTICS_SECRET,
 *   YOUTUBE_ANALYTICS_REFRESH_TOKEN
 *
 * Run: node fetch-stats.js
 */

import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname)
const DB_FILE = resolve(ROOT, 'data', 'youtube-stats-database.json')

const require = createRequire(import.meta.url)
let dotenvConfig
try {
  dotenvConfig = require('dotenv').config
} catch {
  dotenvConfig = require('./back-end/node_modules/dotenv').config
}

dotenvConfig({ path: resolve(ROOT, '.env') })
dotenvConfig({ path: resolve(ROOT, '.ENV') })

const CLIENT_ID = process.env.YOUTUBE_ANALYTICS_CLIENT_ID
const CLIENT_SECRET = process.env.YOUTUBE_ANALYTICS_SECRET
const REFRESH_TOKEN = process.env.YOUTUBE_ANALYTICS_REFRESH_TOKEN

const YT_ANALYTICS = 'https://youtubeanalytics.googleapis.com/v2/reports'
const YT_DATA = 'https://www.googleapis.com/youtube/v3'
const OAUTH_TOKEN = 'https://oauth2.googleapis.com/token'

const ALL_TIME_START = '2005-01-01'

const CHANNEL_METRICS = [
  'views',
  'estimatedMinutesWatched',
  'subscribersGained',
  'subscribersLost',
  'likes',
  'comments',
  'shares',
  'impressions',
  'impressionClickThroughRate',
  'estimatedRevenue',
  'cpm',
  'rpm',
  'uniqueViewers',
  'averageViewDuration',
  'averageViewPercentage',
].join(',')

const VIDEO_METRICS = [
  'views',
  'estimatedMinutesWatched',
  'averageViewDuration',
  'averageViewPercentage',
  'subscribersGained',
  'subscribersLost',
  'likes',
  'dislikes',
  'comments',
  'shares',
  'impressions',
  'impressionClickThroughRate',
  'estimatedRevenue',
  'uniqueViewers',
].join(',')

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

function endDate() {
  return todayIsoDate()
}

function requireEnv() {
  const missing = []
  if (!CLIENT_ID) missing.push('YOUTUBE_ANALYTICS_CLIENT_ID')
  if (!CLIENT_SECRET) missing.push('YOUTUBE_ANALYTICS_SECRET')
  if (!REFRESH_TOKEN) missing.push('YOUTUBE_ANALYTICS_REFRESH_TOKEN')
  if (missing.length) {
    console.error(`Missing in .env: ${missing.join(', ')}`)
    process.exit(1)
  }
}

/** Privacy-threshold blanks and empty strings become null. */
function parseMetricValue(value) {
  if (value === '' || value === null || value === undefined) return null
  if (typeof value === 'number' && !Number.isFinite(value)) return null
  const n = Number(value)
  if (!Number.isNaN(n) && String(value).trim() !== '') return n
  return value
}

function emptyTrafficSources() {
  return Object.fromEntries(TRAFFIC_KEYS.map((k) => [k, null]))
}

function emptyDemographics() {
  return {
    byAge: {
      'age13-17': null,
      'age18-24': null,
      'age25-34': null,
      'age35-44': null,
      'age45-54': null,
      'age55-64': null,
      'age65+': null,
    },
    byGender: { male: null, female: null },
    byCountry: { US: null, BR: null },
  }
}

function emptyVideoEntry() {
  return {
    title: '',
    thumbnail: '',
    publishedAt: '',
    views: null,
    uniqueViewers: null,
    watchTimeMinutes: null,
    averageViewDuration: null,
    averageViewPercentage: null,
    impressions: null,
    ctr: null,
    likes: null,
    dislikes: null,
    comments: null,
    shares: null,
    subscribersGained: null,
    subscribersLost: null,
    estimatedRevenue: null,
    trafficSources: emptyTrafficSources(),
    topSearchTerms: [],
  }
}

function emptyChannel() {
  return {
    subscribers: null,
    totalViews: null,
    videoCount: null,
    watchTimeMinutes: null,
    estimatedRevenue: null,
    cpm: null,
    rpm: null,
    impressions: null,
    ctr: null,
    uniqueViewers: null,
    subscribersGained: null,
    subscribersLost: null,
    likes: null,
    comments: null,
    shares: null,
    averageViewDuration: null,
    averageViewPercentage: null,
    demographics: emptyDemographics(),
    trafficSources: emptyTrafficSources(),
  }
}

async function refreshAccessToken() {
  const res = await fetch(OAUTH_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error_description || data?.error || res.statusText
    throw new Error(`OAuth token refresh failed: ${msg}`)
  }
  if (!data.access_token) {
    throw new Error('OAuth token refresh did not return access_token')
  }
  return data.access_token
}

async function analyticsReport(params) {
  const accessToken = await refreshAccessToken()
  const url = new URL(YT_ANALYTICS)
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') url.searchParams.set(key, String(value))
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText
    throw new Error(`YouTube Analytics: ${msg}`)
  }
  return data
}

async function dataApiGet(path, params) {
  const accessToken = await refreshAccessToken()
  const url = new URL(`${YT_DATA}/${path}`)
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') url.searchParams.set(key, String(value))
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText
    throw new Error(`YouTube Data API ${path}: ${msg}`)
  }
  return data
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
      obj[h.name] =
        h.type === 'METRIC' ? parseMetricValue(row[i]) : row[i] ?? null
    })
    return obj
  })
}

function applyTrafficRows(target, rows, metricName = 'views') {
  for (const row of rows) {
    const rawType = row.insightTrafficSourceType
    const bucket = TRAFFIC_SOURCE_MAP[rawType] || 'OTHER'
    const value = parseMetricValue(row[metricName])
    if (value == null) continue
    const current = target[bucket]
    target[bucket] = current == null ? value : current + value
  }
}

function bestThumbnail(thumbnails) {
  if (!thumbnails) return ''
  return (
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    ''
  )
}

async function safeAnalytics(params, label) {
  try {
    return await analyticsReport(params)
  } catch (err) {
    console.warn(`Analytics skipped (${label}): ${err.message}`)
    return null
  }
}

async function fetchChannelDataApi() {
  const data = await dataApiGet('channels', {
    part: 'statistics,contentDetails',
    mine: true,
  })
  const channel = data.items?.[0]
  if (!channel) throw new Error('No channel found for mine=true')
  return channel
}

async function fetchAllUploadVideoIds(uploadsPlaylistId) {
  const ids = []
  let pageToken
  do {
    const data = await dataApiGet('playlistItems', {
      part: 'contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults: 50,
      pageToken: pageToken || undefined,
    })
    for (const item of data.items || []) {
      const id = item.contentDetails?.videoId
      if (id) ids.push(id)
    }
    pageToken = data.nextPageToken
  } while (pageToken)
  return ids
}

async function fetchVideoMetadata(videoIds) {
  const map = new Map()
  const chunkSize = 50
  for (let i = 0; i < videoIds.length; i += chunkSize) {
    const chunk = videoIds.slice(i, i + chunkSize)
    const data = await dataApiGet('videos', {
      part: 'snippet',
      id: chunk.join(','),
    })
    for (const item of data.items || []) {
      map.set(item.id, {
        title: item.snippet?.title || '',
        thumbnail: bestThumbnail(item.snippet?.thumbnails),
        publishedAt: item.snippet?.publishedAt || '',
      })
    }
  }
  return map
}

function mapChannelAnalytics(metrics) {
  const channel = emptyChannel()
  channel.watchTimeMinutes = metrics.estimatedMinutesWatched ?? null
  channel.estimatedRevenue = metrics.estimatedRevenue ?? null
  channel.cpm = metrics.cpm ?? null
  channel.rpm = metrics.rpm ?? null
  channel.impressions = metrics.impressions ?? null
  channel.ctr = metrics.impressionClickThroughRate ?? null
  channel.uniqueViewers = metrics.uniqueViewers ?? null
  channel.subscribersGained = metrics.subscribersGained ?? null
  channel.subscribersLost = metrics.subscribersLost ?? null
  channel.likes = metrics.likes ?? null
  channel.comments = metrics.comments ?? null
  channel.shares = metrics.shares ?? null
  channel.averageViewDuration = metrics.averageViewDuration ?? null
  channel.averageViewPercentage = metrics.averageViewPercentage ?? null
  if (metrics.views != null) channel.totalViews = metrics.views
  return channel
}

function mapVideoAnalytics(metrics) {
  const video = emptyVideoEntry()
  video.views = metrics.views ?? null
  video.uniqueViewers = metrics.uniqueViewers ?? null
  video.watchTimeMinutes = metrics.estimatedMinutesWatched ?? null
  video.averageViewDuration = metrics.averageViewDuration ?? null
  video.averageViewPercentage = metrics.averageViewPercentage ?? null
  video.impressions = metrics.impressions ?? null
  video.ctr = metrics.impressionClickThroughRate ?? null
  video.likes = metrics.likes ?? null
  video.dislikes = metrics.dislikes ?? null
  video.comments = metrics.comments ?? null
  video.shares = metrics.shares ?? null
  video.subscribersGained = metrics.subscribersGained ?? null
  video.subscribersLost = metrics.subscribersLost ?? null
  video.estimatedRevenue = metrics.estimatedRevenue ?? null
  return video
}

function applyDemographicsAgeGender(channel, rows) {
  for (const row of rows) {
    const age = row.ageGroup
    const gender = row.gender
    const views = parseMetricValue(row.views)
    if (age && Object.prototype.hasOwnProperty.call(channel.demographics.byAge, age)) {
      channel.demographics.byAge[age] = views
    }
    if (gender && Object.prototype.hasOwnProperty.call(channel.demographics.byGender, gender)) {
      channel.demographics.byGender[gender] = views
    }
  }
}

function applyDemographicsCountry(channel, rows) {
  for (const row of rows) {
    const country = row.country
    const views = parseMetricValue(row.views)
    if (!country) continue
    if (!Object.prototype.hasOwnProperty.call(channel.demographics.byCountry, country)) {
      channel.demographics.byCountry[country] = views
    } else {
      channel.demographics.byCountry[country] = views
    }
  }
}

function loadDatabase() {
  if (!existsSync(DB_FILE)) return { snapshots: [] }
  try {
    const parsed = JSON.parse(readFileSync(DB_FILE, 'utf8'))
    if (!parsed.snapshots || !Array.isArray(parsed.snapshots)) {
      return { snapshots: [] }
    }
    return parsed
  } catch {
    return { snapshots: [] }
  }
}

async function main() {
  requireEnv()

  const range = { startDate: ALL_TIME_START, endDate: endDate() }
  console.log(`Fetching YouTube stats (${range.startDate} → ${range.endDate})…`)

  const channelItem = await fetchChannelDataApi()
  const stats = channelItem.statistics || {}
  const uploadsPlaylistId = channelItem.contentDetails?.relatedPlaylists?.uploads
  if (!uploadsPlaylistId) throw new Error('Channel has no uploads playlist')

  const videoIds = await fetchAllUploadVideoIds(uploadsPlaylistId)
  console.log(`Found ${videoIds.length} videos in uploads playlist`)

  const metadataById = await fetchVideoMetadata(videoIds)

  const channelReport = await safeAnalytics(
    {
      ids: 'channel==MINE',
      ...range,
      metrics: CHANNEL_METRICS,
    },
    'channel metrics'
  )
  const channel = mapChannelAnalytics(singleRowMetrics(channelReport))

  channel.subscribers = parseMetricValue(stats.subscriberCount)
  channel.totalViews =
    channel.totalViews ?? parseMetricValue(stats.viewCount)
  channel.videoCount = parseMetricValue(stats.videoCount)

  const ageGenderReport = await safeAnalytics(
    {
      ids: 'channel==MINE',
      ...range,
      dimensions: 'ageGroup,gender',
      metrics: 'views',
    },
    'demographics age/gender'
  )
  applyDemographicsAgeGender(channel, dimensionMetricRows(ageGenderReport))

  const countryReport = await safeAnalytics(
    {
      ids: 'channel==MINE',
      ...range,
      dimensions: 'country',
      metrics: 'views',
    },
    'demographics country'
  )
  applyDemographicsCountry(channel, dimensionMetricRows(countryReport))

  const channelTrafficReport = await safeAnalytics(
    {
      ids: 'channel==MINE',
      ...range,
      dimensions: 'insightTrafficSourceType',
      metrics: 'views',
    },
    'channel traffic sources'
  )
  applyTrafficRows(channel.trafficSources, dimensionMetricRows(channelTrafficReport))

  const videos = {}

  for (let i = 0; i < videoIds.length; i++) {
    const videoId = videoIds[i]
    const meta = metadataById.get(videoId) || {
      title: '',
      thumbnail: '',
      publishedAt: '',
    }

    if (
      meta.title === 'Private video' ||
      meta.title === 'Deleted video' ||
      !meta.title
    ) {
      continue
    }

    process.stdout.write(`\rVideo analytics ${i + 1}/${videoIds.length}: ${videoId}`)

    const videoReport = await safeAnalytics(
      {
        ids: 'channel==MINE',
        ...range,
        filters: `video==${videoId}`,
        metrics: VIDEO_METRICS,
      },
      `video ${videoId} metrics`
    )
    const video = mapVideoAnalytics(singleRowMetrics(videoReport))
    video.title = meta.title
    video.thumbnail = meta.thumbnail
    video.publishedAt = meta.publishedAt

    const videoTrafficReport = await safeAnalytics(
      {
        ids: 'channel==MINE',
        ...range,
        filters: `video==${videoId}`,
        dimensions: 'insightTrafficSourceType',
        metrics: 'views',
      },
      `video ${videoId} traffic`
    )
    applyTrafficRows(video.trafficSources, dimensionMetricRows(videoTrafficReport))

    const searchTermsReport = await safeAnalytics(
      {
        ids: 'channel==MINE',
        ...range,
        filters: `video==${videoId};insightTrafficSourceType==YT_SEARCH`,
        dimensions: 'insightTrafficSourceDetail',
        metrics: 'views',
        sort: '-views',
        maxResults: 25,
      },
      `video ${videoId} search terms`
    )
    video.topSearchTerms = dimensionMetricRows(searchTermsReport)
      .map((row) => row.insightTrafficSourceDetail)
      .filter((term) => term != null && term !== '')

    videos[videoId] = video
  }

  process.stdout.write('\n')

  const snapshot = {
    date: todayIsoDate(),
    channel,
    videos,
  }

  const db = loadDatabase()
  db.snapshots.push(snapshot)

  mkdirSync(dirname(DB_FILE), { recursive: true })
  writeFileSync(DB_FILE, `${JSON.stringify(db, null, 2)}\n`, 'utf8')

  console.log(
    `Success: appended snapshot for ${snapshot.date} (${Object.keys(videos).length} videos) to ${DB_FILE}`
  )
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
