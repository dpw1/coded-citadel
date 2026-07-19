import changelogData from '../data/extension-changelogs.json'
import { appFilterLabel, appIconUrl, appStoreUrl, resolveAppCatalogEntry } from './apps'
import { assignCommitVersions } from './changelogCommitVersions'

export function getExtensionChangelogsPayload() {
  return changelogData
}

export function getExtensionChangelogApps() {
  return changelogData?.apps ?? []
}

export function getExtensionChangelogByKey(key) {
  return getExtensionChangelogApps().find((app) => app.key === key) ?? null
}

export function getExtensionChangelogBySlug(slug) {
  return getExtensionChangelogApps().find((app) => app.slug === slug) ?? null
}

export function formatChangelogDate(isoDate) {
  if (!isoDate) return '—'
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Timeline group label — e.g. MAY 27, 2026 */
export function formatChangelogGroupDate(isoDate) {
  if (!isoDate) return '—'
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return '—'
  return d
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .toUpperCase()
}

/** Card timestamp — e.g. May 27, 2026 • 11:42 PM */
export function formatChangelogCardDateTime(isoDate) {
  if (!isoDate) return '—'
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return '—'
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${date} • ${time}`
}

/** Quick time presets for changelog commit filtering. */
export const CHANGELOG_TIME_PRESETS = [
  { id: 'all', label: 'All time', ms: null },
  { id: '24h', label: 'Past 24h', ms: 24 * 60 * 60 * 1000 },
  { id: '3d', label: 'Past 3 days', ms: 3 * 24 * 60 * 60 * 1000 },
  { id: '7d', label: 'Past 7 days', ms: 7 * 24 * 60 * 60 * 1000 },
  { id: '14d', label: 'Past 14 days', ms: 14 * 24 * 60 * 60 * 1000 },
  { id: '30d', label: 'Past month', ms: 30 * 24 * 60 * 60 * 1000 },
  { id: '90d', label: 'Past 3 months', ms: 90 * 24 * 60 * 60 * 1000 },
  { id: '180d', label: 'Past 6 months', ms: 180 * 24 * 60 * 60 * 1000 },
]

export function getChangelogTimePresetLabel(presetId) {
  return CHANGELOG_TIME_PRESETS.find((preset) => preset.id === presetId)?.label ?? 'All time'
}

export function filterChangelogCommitsByTimePreset(commits, presetId) {
  const preset = CHANGELOG_TIME_PRESETS.find((item) => item.id === presetId)
  if (!preset?.ms) return commits

  const cutoff = Date.now() - preset.ms
  return commits.filter((commit) => {
    const time = new Date(commit.date).getTime()
    return !Number.isNaN(time) && time >= cutoff
  })
}

export function isRecentChangelogCommit(isoDate, withinMs = 7 * 24 * 60 * 60 * 1000) {
  const time = new Date(isoDate).getTime()
  if (Number.isNaN(time)) return false
  return Date.now() - time <= withinMs
}

export function enrichChangelogApp(app) {
  const catalog = resolveAppCatalogEntry(app)
  return {
    ...app,
    iconUrl: catalog ? appIconUrl(catalog) : app.iconUrl ?? null,
    label: catalog ? appFilterLabel(catalog) : appFilterLabel({ name: app.name, slug: app.slug }),
    storeUrl: catalog ? appStoreUrl(catalog) : null,
    version: catalog?.version ?? null,
    commitCount: app.commits?.length ?? 0,
  }
}

/** Whether a period ends a sentence (not a version segment or filename extension). */
function isChangelogSentenceDot(nextChar) {
  if (!nextChar) return true
  if (/\d/.test(nextChar)) return false
  if (/\s/.test(nextChar)) return true
  return false
}

/** Split a commit message into bullet lines on sentence boundaries. */
export function splitChangelogMessageBullets(message) {
  if (!message?.trim()) return []

  const parts = []
  let current = ''

  for (let i = 0; i < message.length; i += 1) {
    const char = message[i]
    const nextChar = message[i + 1] ?? ''

    if (char === '.' && isChangelogSentenceDot(nextChar)) {
      current += '.'
      const trimmed = current.trim()
      if (trimmed) parts.push(trimmed)
      current = ''
    } else {
      current += char
    }
  }

  const tail = current.trim()
  if (tail) parts.push(tail)

  return parts.filter((part) => part && part !== '.')
}

export function mergeChangelogCommits(apps, selectedKeys) {
  const rows = []

  for (const app of apps) {
    if (!selectedKeys.has(app.key)) continue
    const enriched = enrichChangelogApp(app)
    const commits = assignCommitVersions(app.commits ?? [])
    for (const commit of commits) {
      rows.push({
        ...commit,
        appKey: app.key,
        appSlug: app.slug,
        appName: app.name,
        appLabel: enriched.label,
        appIconUrl: enriched.iconUrl,
        appStoreUrl: enriched.storeUrl,
        appVersion: commit.version ?? null,
        github: app.github,
        githubPublic: app.githubPublic,
      })
    }
  }

  return rows.sort((a, b) => String(b.date).localeCompare(String(a.date)))
}

export function groupChangelogCommitsByDay(commits) {
  const byDay = new Map()

  for (const commit of commits) {
    const dayKey = commit.date?.slice(0, 10) ?? 'unknown'
    if (!byDay.has(dayKey)) byDay.set(dayKey, [])
    byDay.get(dayKey).push(commit)
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dayKey, dayCommits]) => ({
      dayKey,
      label: formatChangelogGroupDate(dayCommits[0]?.date ?? dayKey),
      commits: dayCommits,
    }))
}

const CACHE_KEY = 'cc-extension-changelogs-v2'
const CACHE_TS_KEY = 'cc-extension-changelogs-v2-fetched-at'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

function readCacheRaw() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function readCacheFresh() {
  if (!isExtensionChangelogsCacheFresh()) return null
  return readCacheRaw()
}

function writeCache(data) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    window.localStorage.setItem(CACHE_TS_KEY, String(Date.now()))
  } catch {
    // ignore
  }
}

export function mergeChangelogSelectedKeys(previousKeys, apps) {
  const allKeys = (apps ?? []).map((app) => app.key).filter(Boolean)
  if (!allKeys.length) return previousKeys ?? new Set()

  const next = new Set(previousKeys ?? [])
  for (const key of allKeys) next.add(key)
  return next.size ? next : new Set(allKeys)
}

/** Bundled build-time snapshot — always used on the live site. */
export function getExtensionChangelogsSnapshot() {
  return changelogData
}

/** Dev: localStorage first, then bundled snapshot. Prod: bundled snapshot only. */
export function getStoredExtensionChangelogs() {
  if (!import.meta.env.DEV) {
    return getExtensionChangelogsSnapshot()
  }

  const cached = readCacheRaw()
  return cached ?? getExtensionChangelogsSnapshot()
}

export function isExtensionChangelogsCacheFresh() {
  if (!import.meta.env.DEV || typeof window === 'undefined') return true

  try {
    const fetchedAt = Number(window.localStorage.getItem(CACHE_TS_KEY))
    if (!fetchedAt) return false
    return Date.now() - fetchedAt <= CACHE_TTL_MS
  } catch {
    return false
  }
}

export function needsExtensionChangelogsRefresh() {
  return import.meta.env.DEV && !isExtensionChangelogsCacheFresh()
}

/**
 * Dev-only refresh from the local API (max once per day). Prod always returns bundled JSON.
 * When cache is fresh, returns cached localStorage data without fetching.
 */
export async function fetchExtensionChangelogs() {
  if (!import.meta.env.DEV) {
    return getExtensionChangelogsSnapshot()
  }

  const cached = readCacheFresh()
  if (cached) return cached

  try {
    const res = await fetch('/api/live-stats/changelogs')
    if (res.ok) {
      const data = await res.json()
      writeCache(data)
      return data
    }
  } catch {
    // fall through to stored/bundled snapshot
  }

  return getStoredExtensionChangelogs()
}
