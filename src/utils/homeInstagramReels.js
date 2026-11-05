import homeInstagramReelsData from '../data/home-instagram-reels.json'
import { CODED_CITADEL_INSTAGRAM_URL } from '../constants/socialUrls'

/**
 * @typedef {{
 *   url: string,
 *   shortcode?: string,
 *   title?: string,
 *   uploadedAt?: string | null,
 *   thumbnail?: string | null,
 * }} HomeInstagramReel
 */

const MS_MINUTE = 60 * 1000
const MS_HOUR = 60 * MS_MINUTE
const MS_DAY = 24 * MS_HOUR

function plural(count, singular, pluralWord) {
  return count === 1 ? singular : pluralWord
}

/** @param {string | null | undefined} iso */
export function formatUploadedAgo(iso) {
  if (!iso) return null

  const uploaded = new Date(iso)
  if (Number.isNaN(uploaded.getTime())) return null

  const elapsedMs = Date.now() - uploaded.getTime()
  if (elapsedMs < 0) return 'Uploaded just now'

  const minutes = Math.floor(elapsedMs / MS_MINUTE)
  if (minutes < 1) return 'Uploaded just now'
  if (minutes < 60) {
    return `Uploaded ${minutes} ${plural(minutes, 'minute', 'minutes')} ago`
  }

  const hours = Math.floor(elapsedMs / MS_HOUR)
  if (hours < 24) {
    return `Uploaded ${hours} ${plural(hours, 'hour', 'hours')} ago`
  }

  const days = Math.floor(elapsedMs / MS_DAY)
  if (days < 7) {
    return `Uploaded ${days} ${plural(days, 'day', 'days')} ago`
  }

  const weeks = Math.floor(days / 7)
  if (days < 30) {
    return `Uploaded ${weeks} ${plural(weeks, 'week', 'weeks')} ago`
  }

  const months = Math.floor(days / 30)
  return `Uploaded ${months} ${plural(months, 'month', 'months')} ago`
}

export function getHomeInstagramReelsProfileUrl() {
  return homeInstagramReelsData.profileUrl || CODED_CITADEL_INSTAGRAM_URL
}

/** @returns {HomeInstagramReel[]} */
export function getHomeInstagramReels() {
  return homeInstagramReelsData.reels ?? []
}

export function homeInstagramReelThumbnailSrc(thumbnail) {
  if (!thumbnail) return null
  if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) return thumbnail
  if (thumbnail.startsWith('/')) {
    return `${import.meta.env.BASE_URL}${thumbnail.replace(/^\//, '')}`
  }
  return thumbnail
}
