/**
 * Fetches all public videos from the Coded Citadel YouTube channel via Data API v3.
 * Writes public/youtube-videos.json for the static landing page (GitHub Pages).
 *
 * Requires YOUTUBE_API_KEY in project root .env (or .ENV).
 * Run: npm run fetch-youtube  (from repo root)
 */

import { config } from 'dotenv'
import { existsSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_FILE = resolve(ROOT, 'src', 'data', 'youtube-videos.json')

config({ path: resolve(ROOT, '.env') })
config({ path: resolve(ROOT, '.ENV') })

const API_KEY = process.env.YOUTUBE_API_KEY
const CHANNEL_HANDLE = process.env.YOUTUBE_CHANNEL_HANDLE || 'CodedCitadel'

if (!API_KEY) {
  if (existsSync(OUT_FILE)) {
    console.warn(
      'Skipping YouTube fetch: no YOUTUBE_API_KEY. Using existing src/data/youtube-videos.json'
    )
    process.exit(0)
  }
  console.error('Missing YOUTUBE_API_KEY in .env at project root.')
  process.exit(1)
}

const YT_BASE = 'https://www.googleapis.com/youtube/v3'

async function ytGet(path, params) {
  const url = new URL(`${YT_BASE}/${path}`)
  url.searchParams.set('key', API_KEY)
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== '') url.searchParams.set(k, String(v))
  }
  const res = await fetch(url)
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText
    throw new Error(`YouTube API ${path}: ${msg}`)
  }
  return data
}

function isoDurationToDisplay(iso) {
  if (!iso) return null
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return null
  const h = Number(m[1] || 0)
  const min = Number(m[2] || 0)
  const s = Number(m[3] || 0)
  if (h > 0) return `${h}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${min}:${String(s).padStart(2, '0')}`
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

async function resolveChannel() {
  const byHandle = await ytGet('channels', {
    part: 'snippet,contentDetails',
    forHandle: CHANNEL_HANDLE,
  })
  if (byHandle.items?.[0]) return byHandle.items[0]

  const fallbackId = process.env.YOUTUBE_CHANNEL_ID
  if (fallbackId) {
    const byId = await ytGet('channels', {
      part: 'snippet,contentDetails',
      id: fallbackId,
    })
    if (byId.items?.[0]) return byId.items[0]
  }

  throw new Error(`Channel not found for handle @${CHANNEL_HANDLE}`)
}

async function fetchAllPlaylistItems(playlistId) {
  const items = []
  let pageToken
  do {
    const data = await ytGet('playlistItems', {
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: 50,
      pageToken: pageToken || undefined,
    })
    items.push(...(data.items || []))
    pageToken = data.nextPageToken
  } while (pageToken)
  return items
}

async function fetchVideoDetails(videoIds) {
  const map = new Map()
  const chunkSize = 50
  for (let i = 0; i < videoIds.length; i += chunkSize) {
    const chunk = videoIds.slice(i, i + chunkSize)
    const data = await ytGet('videos', {
      part: 'contentDetails,statistics',
      id: chunk.join(','),
    })
    for (const item of data.items || []) {
      map.set(item.id, item)
    }
  }
  return map
}

async function main() {
  console.log(`Resolving channel @${CHANNEL_HANDLE}…`)
  const channel = await resolveChannel()
  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads
  if (!uploadsPlaylistId) {
    throw new Error('No uploads playlist on channel')
  }

  console.log('Fetching playlist items…')
  const playlistItems = await fetchAllPlaylistItems(uploadsPlaylistId)
  const videoIds = playlistItems
    .map((item) => item.contentDetails?.videoId || item.snippet?.resourceId?.videoId)
    .filter(Boolean)

  console.log(`Fetching details for ${videoIds.length} videos…`)
  const detailsById = await fetchVideoDetails(videoIds)

  const videos = playlistItems
    .map((item) => {
      const id = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId
      const snippet = item.snippet
      const details = detailsById.get(id)
      const iso = details?.contentDetails?.duration
      return {
        id,
        title: snippet?.title || '',
        description: snippet?.description || '',
        link: `https://www.youtube.com/watch?v=${id}`,
        thumbnail: bestThumbnail(snippet?.thumbnails),
        publishedAt: snippet?.publishedAt || null,
        duration: isoDurationToDisplay(iso),
        durationIso: iso || null,
        viewCount: details?.statistics?.viewCount
          ? Number(details.statistics.viewCount)
          : null,
      }
    })
    .filter((v) => v.id && v.title)

  // Drop YouTube "Private video" / deleted placeholders
  const publicVideos = videos.filter(
    (v) => v.title !== 'Private video' && v.title !== 'Deleted video'
  )

  const payload = {
    fetchedAt: new Date().toISOString(),
    channel: {
      id: channel.id,
      title: channel.snippet?.title || CHANNEL_HANDLE,
      handle: CHANNEL_HANDLE,
      url: `https://www.youtube.com/@${CHANNEL_HANDLE}`,
    },
    videoCount: publicVideos.length,
    videos: publicVideos,
  }

  writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${publicVideos.length} videos to ${OUT_FILE}`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
