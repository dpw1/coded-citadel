/**
 * Fetch GA website analytics when GOOGLE_ANALYTICS_* env is set (local build).
 * CI / builds without credentials keep committed src/data/website-analytics.json.
 */

import { hasWebsiteAnalyticsEnv } from './lib/fetch-website-analytics.mjs'

if (!hasWebsiteAnalyticsEnv()) {
  console.log(
    'No GOOGLE_ANALYTICS_* env — skipping fetch-website-analytics (using committed src/data/website-analytics.json)',
  )
  process.exit(0)
}

await import('./fetch-website-analytics.mjs')
