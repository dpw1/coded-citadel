import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assignCommitVersions } from '../../src/utils/changelogCommitVersions.js'
import { loadEnv } from './load-env.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const APPS_JSON = resolve(ROOT, 'src/data/apps.json')
const CUSTOM_JSON = resolve(ROOT, 'src/data/apps-custom-data.json')

const GITHUB_API = 'https://api.github.com'
const COMMITS_PER_REPO = 50

export function hasGithubTokenEnv() {
  loadEnv()
  return Boolean(process.env.GITHUB_TOKEN?.trim())
}

/** `https://github.com/owner/repo` → `{ owner, repo }` */
export function parseGithubRepoUrl(url) {
  if (!url) return null
  try {
    const u = new URL(String(url).trim())
    if (!u.hostname.includes('github.com')) return null
    const parts = u.pathname.replace(/^\/+/, '').split('/').filter(Boolean)
    if (parts.length < 2) return null
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') }
  } catch {
    return null
  }
}

function githubHeaders(token) {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    Authorization: `Bearer ${token}`,
    'User-Agent': 'coded-citadel-landing-page',
  }
}

async function githubGet(path, token) {
  const res = await fetch(`${GITHUB_API}${path}`, { headers: githubHeaders(token) })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`GitHub API ${res.status} for ${path}${body ? `: ${body.slice(0, 200)}` : ''}`)
  }
  return res.json()
}

function loadAppsById() {
  const apps = JSON.parse(readFileSync(APPS_JSON, 'utf8')).apps ?? []
  const custom = JSON.parse(readFileSync(CUSTOM_JSON, 'utf8')).apps ?? []
  const customById = new Map(custom.map((entry) => [entry.id, entry]))

  return apps.map((app) => {
    const id = app.chromeExtensionId
    const customEntry = id ? customById.get(id) : null
    const github = customEntry?.github ?? app.github ?? null
    return {
      key: id || app.slug,
      slug: app.slug,
      name: app.name ?? app.slug,
      status: app.status,
      version: app.version ?? null,
      github,
      repo: parseGithubRepoUrl(github),
    }
  })
}

function normalizeCommit(entry, repoUrl) {
  const sha = entry.sha ?? ''
  const message = (entry.commit?.message ?? '').split('\n')[0].trim() || '(no message)'
  const date = entry.commit?.author?.date ?? entry.commit?.committer?.date ?? null
  const author =
    entry.author?.login ??
    entry.commit?.author?.name ??
    entry.commit?.committer?.name ??
    'unknown'

  return {
    sha,
    shortSha: sha.slice(0, 7),
    message,
    date,
    author,
    url: sha && repoUrl ? `${repoUrl}/commit/${sha}` : repoUrl,
  }
}

async function fetchRepoChangelog({ repo, github, version }, token) {
  const repoPath = `/repos/${repo.owner}/${repo.repo}`
  const meta = await githubGet(repoPath, token)
  const commits = await githubGet(`${repoPath}/commits?per_page=${COMMITS_PER_REPO}`, token)

  return {
    github,
    githubPublic: meta.private === false,
    defaultBranch: meta.default_branch ?? 'main',
    commits: assignCommitVersions(
      Array.isArray(commits) ? commits.map((entry) => normalizeCommit(entry, github)) : [],
      { fallbackVersion: version },
    ),
  }
}

export async function fetchExtensionChangelogsBundle() {
  loadEnv()
  const token = process.env.GITHUB_TOKEN?.trim()

  if (!token) {
    return {
      snapshot: {
        available: false,
        updatedAt: null,
        message: 'GITHUB_TOKEN not configured',
        apps: [],
      },
    }
  }

  const apps = loadAppsById().filter((app) => app.repo)
  const results = []

  for (const app of apps) {
    try {
      const repoData = await fetchRepoChangelog(app, token)
      results.push({
        key: app.key,
        slug: app.slug,
        name: app.name,
        status: app.status,
        ...repoData,
      })
      console.log(
        `  ${app.slug}: ${repoData.commits.length} commit(s)${repoData.githubPublic ? ' (public)' : ' (private)'}`,
      )
    } catch (err) {
      console.warn(`  ${app.slug}: ${err.message}`)
      results.push({
        key: app.key,
        slug: app.slug,
        name: app.name,
        status: app.status,
        github: app.github,
        githubPublic: false,
        defaultBranch: null,
        commits: [],
        error: err.message,
      })
    }
  }

  const snapshot = {
    available: results.some((app) => app.commits.length > 0),
    updatedAt: new Date().toISOString(),
    message: results.length ? null : 'No GitHub repos configured',
    apps: results,
  }

  return { snapshot }
}
