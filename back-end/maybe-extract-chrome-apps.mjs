/**
 * Run extract-chrome-apps only when chrome-extension-html/html has exports.
 * Used by npm run build (CI skips when html/ is empty).
 */

import path from 'path'
import { fileURLToPath } from 'url'
import { listHtmlFiles, main, syncAppsJsonSlugs } from './extract-chrome-apps.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const HTML_DIR = path.join(ROOT, 'chrome-extension-html/html')
const APPS_JSON = path.join(ROOT, 'src/data/apps.json')

const files = listHtmlFiles()
if (!files.length) {
  console.log(
    `No HTML in ${HTML_DIR} — skipping extract-chrome-apps (syncing slugs into ${path.relative(ROOT, APPS_JSON)})`,
  )
  syncAppsJsonSlugs()
  process.exit(0)
}

main()
