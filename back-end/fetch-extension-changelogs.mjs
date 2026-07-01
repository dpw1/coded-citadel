/**
 * Fetches GitHub commit history for extension repos (private repos need GITHUB_TOKEN).
 * Writes src/data/extension-changelogs.json for the static site.
 *
 * Run: npm run fetch-extension-changelogs
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchExtensionChangelogsBundle } from './lib/fetch-extension-changelogs.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_FILE = resolve(__dirname, '../src/data/extension-changelogs.json')

const PLACEHOLDER = {
  available: false,
  updatedAt: null,
  message: 'Extension changelogs not configured',
  apps: [],
}

async function main() {
  let snapshot = PLACEHOLDER

  try {
    const result = await fetchExtensionChangelogsBundle()
    snapshot = result.snapshot
    if (!snapshot.available && snapshot.apps.length === 0) {
      throw new Error(snapshot.message || 'No changelog data returned')
    }
  } catch (err) {
    if (existsSync(OUT_FILE)) {
      try {
        const existing = JSON.parse(readFileSync(OUT_FILE, 'utf8'))
        if (existing?.available) {
          console.warn(
            `Extension changelog fetch failed (${err.message}) — keeping existing ${OUT_FILE}`,
          )
          return
        }
      } catch {
        // fall through
      }
    }
    console.warn(`Extension changelog fetch failed (${err.message}) — writing placeholder`)
    snapshot = { ...PLACEHOLDER, message: err.message || PLACEHOLDER.message }
  }

  writeFileSync(OUT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
  console.log(`Wrote extension changelogs → ${OUT_FILE}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
