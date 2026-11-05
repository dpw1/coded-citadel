/** Extensions removed from the web store — hide on the home catalog. */
export const HOME_HIDDEN_EXTENSION_SLUGS = new Set([
  'ai-bookmark',
  'hide-reposts-for-bluesky',
])

export const HOME_CATALOG_FILTERS = [
  'All',
  'Instagram',
  'YouTube',
  'AI Assistant',
  'Gmail',
  'Discord',
]

export const HOME_EXTENSIONS_PER_PAGE = 9

/** Primary home catalog category per extension slug. */
const CATEGORY_BY_SLUG = {
  'youtube-filter-pro': 'YouTube',
  'youtube-comments-exporter': 'YouTube',
  'youtube-keyword-alert': 'YouTube',
  'custom-data-gflljmlm': 'YouTube',
  'custom-data-ihfiegcg': 'YouTube',
  'instagram-dm-exporter': 'Instagram',
  'custom-data': 'Instagram',
  'custom-data-flgffomd': 'Instagram',
  'claude-limit-monitor': 'AI Assistant',
  'claude-deep-search': 'AI Assistant',
  'instagram-comments-exporter': 'AI Assistant',
  'gmail-to-pdf': 'Gmail',
  dex: 'Discord',
}

export function isHomeCatalogExtensionVisible(app) {
  if (!app?.slug) return false
  return !HOME_HIDDEN_EXTENSION_SLUGS.has(app.slug)
}

export function homeExtensionCategory(app) {
  if (!app?.slug) return null
  return CATEGORY_BY_SLUG[app.slug] ?? null
}

/** @param {*} app */
export function appMatchesHomeExtensionFilter(app, filter) {
  if (!app || !isHomeCatalogExtensionVisible(app)) return false
  if (filter === 'All') return true
  return homeExtensionCategory(app) === filter
}

export function countHomeExtensionFilter(listedApps, filter) {
  return listedApps.filter((app) => appMatchesHomeExtensionFilter(app, filter)).length
}
