/**
 * Merge apps-custom-data.json into apps.json (github URLs, prompts, etc.).
 * Run during build so extension changelogs fetch sees up-to-date repo mappings.
 */

import { fileURLToPath } from 'node:url'
import { syncAppsJsonCustomData } from './extract-chrome-apps.mjs'

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncAppsJsonCustomData()
}
