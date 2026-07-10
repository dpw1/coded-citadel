/**
 * Fetches Google Analytics metrics for codedcitadel.com.
 * Writes src/data/ga-db.json (daily history) and src/data/website-analytics.json.
 *
 * Requires GOOGLE_ANALYTICS_* env vars in project root .env
 * Run: npm run fetch-website-analytics
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchWebsiteAnalyticsBundle } from './lib/fetch-website-analytics.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_FILE = resolve(__dirname, '../src/data/website-analytics.json')

const PLACEHOLDER = {
  available: false,
  updatedAt: null,
  message: 'Website analytics not configured',
  totalViews: null,
  blogViews: null,
  averageTimeOnSiteSeconds: null,
  uniqueVisitors: null,
  newVsReturning: { new: null, returning: null },
  mostViewedPages: [],
  countries: [],
  trafficSources: [],
  topReferrers: [],
  timeSeries: {
    pageViews: [],
    activeUsers: [],
    blogViews: [],
    sessions: [],
  },
}

async function main() {
  let snapshot = PLACEHOLDER
  let blogPathCount = 0

  try {
    const result = await fetchWebsiteAnalyticsBundle()
    snapshot = result.snapshot
    blogPathCount = result.gaDb?.blogPostViews?.length ?? 0
    if (!snapshot.available) {
      throw new Error(snapshot.message || 'Website analytics fetch returned no data')
    }
  } catch (err) {
    if (existsSync(OUT_FILE)) {
      try {
        const existing = JSON.parse(readFileSync(OUT_FILE, 'utf8'))
        if (existing?.available) {
          console.warn(
            `Website analytics fetch failed (${err.message}) — keeping existing ${OUT_FILE}`,
          )
          return
        }
      } catch {
        // fall through to placeholder write
      }
    }

    snapshot = {
      ...PLACEHOLDER,
      message: err.message || 'Website analytics fetch failed',
    }
    console.warn(`Website analytics fetch failed: ${err.message}`)
  }

  writeFileSync(OUT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')

  if (!snapshot.available) {
    console.warn(`Wrote placeholder website analytics to ${OUT_FILE}`)
    return
  }

  console.log(`Wrote website analytics (${snapshot.updatedAt}) to ${OUT_FILE}`)
  console.log(`Updated ga-db.json (${snapshot.timeSeries?.pageViews?.length ?? 0} daily rows, ${blogPathCount} blog paths)`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
