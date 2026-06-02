/**
 * Dev-only: watch chrome-extension-html/db.json and regenerate portfolio-analytics.json.
 */

import { spawnSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SCRIPT = resolve(__dirname, 'generate-portfolio-analytics.mjs')
const DB_JSON = resolve(ROOT, 'chrome-extension-html/db.json')

function regenerate() {
  const result = spawnSync(process.execPath, [SCRIPT], { cwd: ROOT, stdio: 'inherit' })
  return result.status === 0
}

export default function portfolioAnalyticsDevPlugin() {
  let debounceTimer = null

  return {
    name: 'portfolio-analytics-dev',
    apply: 'serve',

    configureServer(server) {
      const schedule = () => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          console.log('\n[portfolio-analytics-dev] Regenerating…')
          if (regenerate()) {
            server.ws.send({ type: 'full-reload', path: '*' })
          }
        }, 350)
      }

      regenerate()
      server.watcher.add(DB_JSON)
      server.watcher.on('change', (file) => {
        if (file === DB_JSON) schedule()
      })
    },
  }
}
