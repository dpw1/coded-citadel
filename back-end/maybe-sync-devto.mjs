/**
 * After a local build, run publish-to-devto.bat when blogs/ changed.
 * Skipped on CI and when SKIP_DEVTO_PUBLISH=1 (publish-to-devto.bat full run).
 *
 * Run: npm run maybe-sync-devto
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { computeBlogsFingerprint } from './lib/blogs-fingerprint.mjs'
import { getRootDir, loadEnv } from './lib/load-env.mjs'

const ROOT = getRootDir()
const SYNC_FILE = resolve(ROOT, '.devto-sync.json')
const PUBLISH_BAT = resolve(ROOT, 'publish-to-devto.bat')

function loadStoredBlogsFingerprint() {
  try {
    const manifest = JSON.parse(readFileSync(SYNC_FILE, 'utf8'))
    return manifest._blogsFingerprint || null
  } catch {
    return null
  }
}

if (process.env.CI || process.env.GITHUB_ACTIONS) {
  process.exit(0)
}

if (process.env.SKIP_DEVTO_PUBLISH === '1') {
  process.exit(0)
}

loadEnv()

if (!process.env.DEV_TO_API_KEY) {
  console.log('No DEV_TO_API_KEY — skipping dev.to publish')
  process.exit(0)
}

const fingerprint = computeBlogsFingerprint()
const stored = loadStoredBlogsFingerprint()

if (stored && stored === fingerprint) {
  console.log('No changes in blogs/ — skipping dev.to publish')
  process.exit(0)
}

if (!existsSync(PUBLISH_BAT)) {
  console.error('publish-to-devto.bat not found')
  process.exit(1)
}

console.log('blogs/ changed — running publish-to-devto.bat...')
const result = spawnSync(PUBLISH_BAT, ['--sync-only'], {
  cwd: ROOT,
  shell: true,
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
