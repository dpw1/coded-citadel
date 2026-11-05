import homeToolsData from '../data/home-tools.json'

/**
 * @typedef {{
 *   title: string,
 *   description: string,
 *   path: string,
 *   badge?: string,
 *   image?: string,
 *   comingSoon?: boolean,
 * }} HomeTool
 */

/** @returns {HomeTool[]} */
export function getHomeTools() {
  return homeToolsData.tools ?? []
}
