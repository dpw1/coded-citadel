/**
 * Node-side loader for apps/davinci/*.json (sitemap, prerender).
 */

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DAVINCI_DIR = resolve(__dirname, '..', '..', 'apps', 'davinci')

export function loadDavinciPlugins() {
  try {
    return readdirSync(DAVINCI_DIR)
      .filter((name) => name.endsWith('.json'))
      .map((name) => {
        try {
          return JSON.parse(readFileSync(join(DAVINCI_DIR, name), 'utf8'))
        } catch {
          return null
        }
      })
      .filter((p) => p?.slug)
  } catch {
    return []
  }
}

export function getLiveDavinciPluginSlugs() {
  return loadDavinciPlugins()
    .filter((p) => (p.status || 'live') === 'live')
    .map((p) => p.slug)
}
