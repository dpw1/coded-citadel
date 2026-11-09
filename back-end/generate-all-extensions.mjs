/**
 * Writes public/all-extensions.json for https://codedcitadel.com/all-extensions.json
 * Run: npm run generate-all-extensions
 */

import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPublicExtensionsFeed } from './lib/public-extensions-feed.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_FILE = resolve(__dirname, '..', 'public', 'all-extensions.json')

const feed = loadPublicExtensionsFeed()
writeFileSync(OUT_FILE, `${JSON.stringify(feed, null, 2)}\n`, 'utf8')
console.log(`Wrote ${OUT_FILE} (${feed.count} extensions)`)
