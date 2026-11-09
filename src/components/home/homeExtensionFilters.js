import {
  HOME_CATALOG_FILTERS,
  HOME_HIDDEN_EXTENSION_SLUGS,
  homeExtensionCategoryBySlug,
  isHomeCatalogExtensionVisible as isHomeCatalogSlugVisible,
  resolveHomeExtensionCategory,
} from '../../constants/homeExtensionCatalog'

export { HOME_CATALOG_FILTERS, HOME_HIDDEN_EXTENSION_SLUGS }

export const HOME_EXTENSIONS_PER_PAGE = 9

export function isHomeCatalogExtensionVisible(app) {
  if (!app?.slug) return false
  return isHomeCatalogSlugVisible(app.slug)
}

export function homeExtensionCategory(app) {
  return homeExtensionCategoryBySlug(app?.slug)
}

/** Pill label on homepage extension cards — matches catalog filter names. */
export function homeExtensionCardTag(app, tags = []) {
  const tagList = tags.length ? tags : app?.tags ?? []
  return resolveHomeExtensionCategory(app?.slug, tagList)
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
