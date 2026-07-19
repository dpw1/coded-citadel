/** Parse a semver from changelog-style commit messages (e.g. "… to version 1.0.87"). */
export function parseVersionFromChangelogMessage(message) {
  if (!message) return null
  const text = String(message)
  // "to version 1.0.87", "version 1.0.87", "version to 1.0.40"
  const versionWord = text.match(/\bversion(?:\s+to)?\s+v?(\d+\.\d+\.\d+)\b/i)
  if (versionWord?.[1]) return versionWord[1]
  const bareV = text.match(/\bv(\d+\.\d+\.\d+)\b/)
  return bareV?.[1] ?? null
}

/**
 * Attach a `version` to each commit using message bumps, walking oldest → newest
 * so non-bump commits inherit the last known version.
 * Preserves any existing `version` on a commit (e.g. from a prior fetch).
 * Input order is preserved (typically newest-first from GitHub).
 */
export function assignCommitVersions(commits) {
  if (!Array.isArray(commits) || !commits.length) return []

  const indexed = commits.map((commit, index) => ({ commit, index }))
  const oldestFirst = [...indexed].sort((a, b) => {
    const dateA = a.commit.date ?? ''
    const dateB = b.commit.date ?? ''
    if (dateA !== dateB) return dateA.localeCompare(dateB)
    // Newest-first lists: higher index is older when dates tie.
    return b.index - a.index
  })

  let version = null
  const versionByIndex = new Map()

  for (const { commit, index } of oldestFirst) {
    const parsed = parseVersionFromChangelogMessage(commit.message)
    if (parsed) version = parsed
    versionByIndex.set(index, commit.version ?? version)
  }

  return commits.map((commit, index) => ({
    ...commit,
    version: versionByIndex.get(index) ?? null,
  }))
}
