/**
 * Fetch GitHub changelogs when GITHUB_TOKEN is set (local build).
 * CI / builds without credentials keep committed src/data/extension-changelogs.json.
 */

import { hasGithubTokenEnv } from './lib/fetch-extension-changelogs.mjs'

if (!hasGithubTokenEnv()) {
  console.log(
    'No GITHUB_TOKEN — skipping fetch-extension-changelogs (using committed src/data/extension-changelogs.json)',
  )
  process.exit(0)
}

await import('./fetch-extension-changelogs.mjs')
