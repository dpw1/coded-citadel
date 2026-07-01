/**
 * Dev-only: live /api/live-stats/website endpoint for Google Analytics.
 */

import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchWebsiteAnalyticsBundle } from './lib/fetch-website-analytics.mjs'
import { fetchExtensionChangelogsBundle } from './lib/fetch-extension-changelogs.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEBSITE_OUT = resolve(__dirname, '../src/data/website-analytics.json')
const CHANGELOGS_OUT = resolve(__dirname, '../src/data/extension-changelogs.json')

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

export default function liveStatsApiPlugin() {
  return {
    name: 'live-stats-api',
    apply: 'serve',

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]

        if (url === '/api/live-stats/website') {
          try {
            const { snapshot } = await fetchWebsiteAnalyticsBundle()
            if (snapshot.available) {
              writeFileSync(WEBSITE_OUT, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
            }
            sendJson(res, 200, snapshot)
          } catch (err) {
            sendJson(res, 500, { available: false, message: err.message || 'Website analytics failed' })
          }
          return
        }

        if (url === '/api/live-stats/changelogs') {
          try {
            const { snapshot } = await fetchExtensionChangelogsBundle()
            if (snapshot.apps?.length) {
              writeFileSync(CHANGELOGS_OUT, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
            }
            sendJson(res, 200, snapshot)
          } catch (err) {
            sendJson(res, 500, { available: false, message: err.message || 'Extension changelogs failed', apps: [] })
          }
          return
        }

        next()
      })
    },
  }
}
