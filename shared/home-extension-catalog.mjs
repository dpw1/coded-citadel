/** Keep in sync with homepage extension chips — used by feed generator and React. */

export const HOME_HIDDEN_EXTENSION_SLUGS = new Set([
  'ai-bookmark',
  'hide-reposts-for-bluesky',
])

export const HOME_CATALOG_FILTERS = [
  'All',
  'Instagram',
  'YouTube',
  'Claude',
  'Gmail',
  'Discord',
]

const CATEGORY_BY_SLUG = {
  'youtube-filter-pro': 'YouTube',
  'youtube-comments-exporter': 'YouTube',
  'youtube-keyword-alert': 'YouTube',
  'custom-data-gflljmlm': 'YouTube',
  'custom-data-ihfiegcg': 'YouTube',
  'instagram-dm-exporter': 'Instagram',
  'custom-data': 'Instagram',
  'custom-data-flgffomd': 'Instagram',
  'claude-limit-monitor': 'Claude',
  'claude-deep-search': 'Claude',
  'instagram-comments-exporter': 'Instagram',
  'gmail-to-pdf': 'Gmail',
  dex: 'Discord',
}

const TAG_TO_HOME_FILTER = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  gmail: 'Gmail',
  discord: 'Discord',
  claude: 'Claude',
}

export function homeExtensionCategoryBySlug(slug) {
  if (!slug) return null
  return CATEGORY_BY_SLUG[slug] ?? null
}

/** Homepage filter pill / JSON homeCategory — slug map, then tags. */
export function resolveHomeExtensionCategory(slug, tags = []) {
  const fromSlug = homeExtensionCategoryBySlug(slug)
  if (fromSlug) return fromSlug

  for (const raw of tags) {
    const tag = String(raw).toLowerCase()
    if (TAG_TO_HOME_FILTER[tag]) return TAG_TO_HOME_FILTER[tag]
  }

  const tagKeys = tags.map((t) => String(t).toLowerCase())
  if (tagKeys.some((t) => t === 'ai' || t.includes('assistant'))) return 'Claude'

  return null
}

/** Same as homepage filter buttons (slug-only mapping). */
export function matchesHomeCatalogFilter(slug, filter) {
  if (!slug || HOME_HIDDEN_EXTENSION_SLUGS.has(slug)) return false
  if (filter === 'All') return true
  return homeExtensionCategoryBySlug(slug) === filter
}

export function isHomeCatalogExtensionVisible(slug) {
  if (!slug) return false
  return !HOME_HIDDEN_EXTENSION_SLUGS.has(slug)
}

export function countHomeCatalogOnFeed(extensions, filter) {
  const pool = (extensions ?? []).filter(
    (ext) =>
      (ext.listed || ext.discontinued) &&
      ext.urls?.chromeWebStore &&
      isHomeCatalogExtensionVisible(ext.slug),
  )
  if (filter === 'All') return pool.length
  return pool.filter((ext) => homeExtensionCategoryBySlug(ext.slug) === filter).length
}

export function buildHomeCatalogFilterCounts(extensions) {
  return HOME_CATALOG_FILTERS.map((filter) => ({
    filter,
    count: countHomeCatalogOnFeed(extensions, filter),
  }))
}
