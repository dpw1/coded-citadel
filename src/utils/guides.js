import guidesData from '../data/guides.json'

/**
 * @typedef {{
 *   url: string,
 *   image: string,
 *   title: string,
 *   subtitle: string,
 *   content?: string,
 *   redirectUrl?: string,
 * }} Guide
 */

/** @returns {Guide[]} */
export function getGuides() {
  return guidesData.guides ?? []
}

/** @param {Guide} guide */
export function isGuideRedirect(guide) {
  return Boolean(guide.redirectUrl)
}

/** @param {Guide} guide */
export function hasGuideContent(guide) {
  return Boolean(guide.content?.trim())
}

/** @param {string | undefined} slug */
export function getGuideBySlug(slug) {
  if (!slug) return null
  return getGuides().find((guide) => guide.url === slug) ?? null
}

/** @returns {string[]} */
export function getGuideSlugs() {
  return getGuides().map((guide) => guide.url)
}
