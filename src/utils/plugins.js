/**
 * DaVinci Resolve (and future) plugins loaded from apps/davinci/*.json
 */

export const PLUGINS_BASE_PATH = '/davinci-resolve-plugins'

export function pluginsIndexPath() {
  return PLUGINS_BASE_PATH
}

export function pluginPath(slug) {
  if (!slug) return PLUGINS_BASE_PATH
  return `${PLUGINS_BASE_PATH}/${slug}`
}

export function isPluginsPath(pathname = '') {
  return (
    pathname === PLUGINS_BASE_PATH ||
    pathname.startsWith(`${PLUGINS_BASE_PATH}/`) ||
    pathname === '/plugins' ||
    pathname.startsWith('/plugins/')
  )
}

const pluginModules = import.meta.glob('../../apps/davinci/*.json', {
  eager: true,
  import: 'default',
})

function normalizePlugin(raw) {
  if (!raw || typeof raw !== 'object') return null
  const slug = String(raw.slug || '').trim()
  if (!slug) return null

  const videos = Array.isArray(raw.videos) ? raw.videos.filter(Boolean) : []
  const primaryVideo =
    videos.find((v) => v.primary && (v.id || v.url)) ||
    videos.find((v) => v.id || v.url) ||
    null

  return {
    ...raw,
    slug,
    name: String(raw.name || slug),
    status: raw.status || 'draft',
    price: raw.price || 'Free',
    videos,
    primaryVideo,
    features: Array.isArray(raw.features) ? raw.features : [],
    installSteps: Array.isArray(raw.installSteps) ? raw.installSteps : [],
    faq: Array.isArray(raw.faq) ? raw.faq : [],
    images: Array.isArray(raw.images) ? raw.images : [],
    download: raw.download || null,
    links: raw.links || {},
    seo: raw.seo || {},
    modal: raw.modal || {},
  }
}

const ALL_PLUGINS = Object.values(pluginModules)
  .map(normalizePlugin)
  .filter(Boolean)
  .sort((a, b) => String(a.name).localeCompare(String(b.name)))

export function getAllPlugins() {
  return ALL_PLUGINS
}

export function getLivePlugins() {
  return ALL_PLUGINS.filter((p) => p.status === 'live')
}

export function getPluginBySlug(slug) {
  if (!slug) return null
  return ALL_PLUGINS.find((p) => p.slug === slug) ?? null
}

export function getPluginSlugs() {
  return ALL_PLUGINS.map((p) => p.slug)
}

/** Extract YouTube video id from id field or common URL shapes. */
export function pluginYoutubeId(video) {
  if (!video) return null
  if (video.id && /^[\w-]{11}$/.test(video.id)) return video.id
  const url = video.url || video.id || ''
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
    /^([\w-]{11})$/,
  ]
  for (const re of patterns) {
    const m = String(url).match(re)
    if (m) return m[1]
  }
  return null
}

export function pluginYoutubeEmbedUrl(video) {
  const id = pluginYoutubeId(video)
  return id ? `https://www.youtube.com/embed/${id}` : null
}

export function pluginDownloadUrl(plugin) {
  const url = plugin?.download?.url
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${String(url).replace(/^\//, '')}`
}

export function formatPluginDownloads(count) {
  if (count == null || Number.isNaN(Number(count))) return null
  return Number(count).toLocaleString('en-US')
}

export function isPluginLive(plugin) {
  return plugin?.status === 'live'
}

export function pluginCategory(plugin) {
  return plugin?.category || 'Fusion Macro'
}

export function pluginCardSummary(plugin) {
  return plugin?.tagline ?? ''
}

export function pluginIconUrl(plugin) {
  return plugin?.icon || plugin?.coverImage || null
}

export function pluginYoutubeWatchUrl(plugin) {
  const video = plugin?.primaryVideo
  if (!video) return null
  if (video.url && /^https?:\/\//i.test(video.url)) return video.url
  const id = pluginYoutubeId(video)
  return id ? `https://www.youtube.com/watch?v=${id}` : null
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

function startOfLocalDayMs(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function formatPluginPublishedAgo(plugin) {
  const raw = plugin?.created || plugin?.lastUpdated
  if (!raw) return null

  const value = String(raw).trim()
  const published = value.includes('T')
    ? new Date(value)
    : /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T12:00:00`)
      : new Date(value)

  if (Number.isNaN(published.getTime())) return null

  const days = Math.floor(
    (startOfLocalDayMs(Date.now()) - startOfLocalDayMs(published)) / MS_PER_DAY,
  )

  if (days <= 0) return 'Published today'
  if (days === 1) return 'Published yesterday'
  return `Published ${days} days ago`
}

/** Split name for hero highlight: "Wobubble" + titleHighlight "BUBBLE" → WO + BUBBLE */
export function splitPluginTitle(plugin) {
  const name = String(plugin?.name || '')
  const highlight = String(plugin?.titleHighlight || '').trim()
  if (!highlight) return { before: name, highlight: '', after: '' }

  const upper = name.toUpperCase()
  const hi = highlight.toUpperCase()
  const idx = upper.lastIndexOf(hi)
  if (idx === -1) return { before: name, highlight: '', after: '' }

  return {
    before: name.slice(0, idx),
    highlight: name.slice(idx, idx + highlight.length) || highlight,
    after: name.slice(idx + highlight.length),
  }
}
