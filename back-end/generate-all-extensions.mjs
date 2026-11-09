/**
 * Writes the public extension catalog for the site and /all-extensions.json.
 * Run: npm run generate-all-extensions
 */

import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPublicExtensionsFeed } from './lib/public-extensions-feed.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PUBLIC_OUT = resolve(ROOT, 'public', 'all-extensions.json')
const SRC_OUT = resolve(ROOT, 'src', 'data', 'all-extensions.json')

const feed = loadPublicExtensionsFeed()
const json = `${JSON.stringify(feed, null, 2)}\n`

writeFileSync(SRC_OUT, json, 'utf8')
writeFileSync(PUBLIC_OUT, json, 'utf8')
console.log(`Wrote ${SRC_OUT} and ${PUBLIC_OUT} (${feed.count} extensions)`)
