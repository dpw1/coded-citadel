/**
 * Publishes blogs/*.md to dev.to (create or update via content hash).
 * Requires DEV_TO_API_KEY in project root .env
 *
 * Run: node back-end/sync-devto.mjs
 */

import { createHash } from 'node:crypto'
import { config } from 'dotenv'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { parseYoutubeVideoId, resolveYoutubeThumbnail } from './youtube-utils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const BLOGS_DIR = resolve(ROOT, 'blogs')
const COVERS_DIR = resolve(ROOT, 'public', 'devto-covers')
const SYNC_FILE = resolve(ROOT, '.devto-sync.json')
const SITE_URL = (process.env.SITE_URL || 'https://codedcitadel.com').replace(/\/$/, '')
const DEVTO_API = 'https://dev.to/api'
const UPLOAD_DELAY_MS = Number(process.env.DEVTO_UPLOAD_DELAY_MS || 2_000)
const RATE_LIMIT_RETRY_MS = Number(process.env.DEVTO_RATE_LIMIT_RETRY_MS || 10_000)

config({ path: resolve(ROOT, '.env') })
config({ path: resolve(ROOT, '.ENV') })

const API_KEY = process.env.DEV_TO_API_KEY

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function loadSyncManifest() {
  try {
    return JSON.parse(readFileSync(SYNC_FILE, 'utf8'))
  } catch {
    return {}
  }
}

function saveSyncManifest(manifest) {
  writeFileSync(SYNC_FILE, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
}

function sanitizeTag(tag) {
  return String(tag).toLowerCase().replace(/[^a-z0-9]/g, '')
}

function buildDevtoTags(sourceTags) {
  const raw = Array.isArray(sourceTags) ? sourceTags.map(String) : []
  const sanitizedInOrder = raw.map(sanitizeTag).filter(Boolean)

  const buildingInPublic = 'buildinginpublic'
  const hasBuilding = raw.some((tag) => sanitizeTag(tag) === buildingInPublic)

  const ordered = []
  if (hasBuilding) ordered.push(buildingInPublic)

  for (const tag of sanitizedInOrder) {
    if (tag === buildingInPublic) continue
    ordered.push(tag)
  }

  return [...new Set(ordered)].slice(0, 4)
}

function devtoTitle(slug, title) {
  const match = slug.match(/^ep-?(\d+)/i)
  if (!match) return title
  return `Ep. ${Number(match[1])}: ${title}`
}

function rewriteRelativePaths(body) {
  return body
    .replace(/(\]\()(\/[^\s)]+)(\))/g, `$1${SITE_URL}$2$3`)
    .replace(/(<img[^>]+src=")(\/[^"]+)(")/gi, `$1${SITE_URL}$2$3`)
}

function contentHash(title, body, tags, mainImage) {
  const payload = `${title}\n${body}\n${tags.join(',')}\n${mainImage || ''}`
  return createHash('sha256').update(payload, 'utf8').digest('hex')
}

function resolveCoverImageUrl(coverImage) {
  if (!coverImage) return null
  if (/^https?:\/\//i.test(coverImage)) return coverImage
  return `${SITE_URL}${coverImage.startsWith('/') ? coverImage : `/${coverImage}`}`
}

async function downloadToFile(url, destPath) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) {
    throw new Error(`download failed (${res.status}): ${url}`)
  }
  writeFileSync(destPath, Buffer.from(await res.arrayBuffer()))
}

/**
 * Resolve cover URL for dev.to (must be publicly reachable when the API fetches it).
 * YouTube thumbnails work immediately; codedcitadel.com/devto-covers/ only works after deploy.
 * Also saves a local copy under public/devto-covers/{fileBasename}.jpg for the site repo.
 */
async function prepareCover(post) {
  const { fileBasename, frontmatter } = post
  const youtubeId = parseYoutubeVideoId(frontmatter.youtubeId)
  let devtoUrl = null

  if (youtubeId) {
    devtoUrl = await resolveYoutubeThumbnail(youtubeId)
  } else {
    const custom = frontmatter.thumbnail || frontmatter.coverImage
    if (custom) {
      devtoUrl = resolveCoverImageUrl(String(custom).trim())
      if (devtoUrl.startsWith(`${SITE_URL}/`)) {
        try {
          const res = await fetch(devtoUrl, { method: 'HEAD', redirect: 'follow' })
          if (!res.ok) {
            console.warn(`  cover not live yet (${res.status}): ${devtoUrl}`)
            devtoUrl = null
          }
        } catch {
          devtoUrl = null
        }
      }
    }
  }

  if (!devtoUrl) return null

  mkdirSync(COVERS_DIR, { recursive: true })
  const localPath = resolve(COVERS_DIR, `${fileBasename}.jpg`)
  try {
    await downloadToFile(devtoUrl, localPath)
    console.log(`  cover saved: public/devto-covers/${fileBasename}.jpg`)
  } catch (err) {
    console.warn(`  local cover save failed: ${err.message}`)
  }

  return devtoUrl
}

function articleUrl(article) {
  if (article.url) return article.url
  if (article.path) return `https://dev.to${article.path}`
  return null
}

async function devtoRequest(method, path, body, retriesLeft = 2) {
  const res = await fetch(`${DEVTO_API}${path}`, {
    method,
    headers: {
      'api-key': API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  let data
  const text = await res.text()
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { raw: text }
  }

  if (!res.ok) {
    const msg =
      data.error ||
      data.message ||
      (Array.isArray(data.errors) ? data.errors.join('; ') : null) ||
      text.slice(0, 300) ||
      res.statusText

    if (res.status === 429 && retriesLeft > 0) {
      const waitSec = RATE_LIMIT_RETRY_MS / 1000
      console.log(`  rate limited — waiting ${waitSec}s before retry...`)
      await sleep(RATE_LIMIT_RETRY_MS)
      return devtoRequest(method, path, body, retriesLeft - 1)
    }

    throw new Error(`${res.status} ${msg}`)
  }

  return data
}

function collectMarkdownPosts() {
  if (!existsSync(BLOGS_DIR)) return []

  return readdirSync(BLOGS_DIR)
    .filter((name) => extname(name).toLowerCase() === '.md')
    .map((name) => {
      const filePath = resolve(BLOGS_DIR, name)
      const filenameSlug = basename(name, '.md')
      const { data, content } = matter(readFileSync(filePath, 'utf8'))
      const slug = String(data.slug || filenameSlug).trim()
      return {
        slug,
        fileBasename: filenameSlug,
        title: String(data.title || slug),
        description: String(data.description || ''),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        draft: Boolean(data.draft),
        body: content.trim(),
        frontmatter: data,
      }
    })
}

async function main() {
  if (!API_KEY) {
    console.error('Missing DEV_TO_API_KEY in .env at project root.')
    process.exit(1)
  }

  const manifest = loadSyncManifest()
  const posts = collectMarkdownPosts()

  const summary = { created: 0, updated: 0, skipped: 0, failed: 0 }
  let uploadAttempts = 0

  for (const post of posts) {
    if (post.draft) {
      console.log(`  skip draft: ${post.slug}`)
      continue
    }

    const title = devtoTitle(post.slug, post.title)
    const body = rewriteRelativePaths(post.body)
    const tags = buildDevtoTags(post.tags)
    const main_image = await prepareCover(post)
    const hash = contentHash(title, body, tags, main_image)
    const canonical_url = `${SITE_URL}/blog/${post.slug}`
    const existing = manifest[post.slug]

    if (existing?.hash === hash) {
      console.log(`  skip (unchanged): ${post.slug}`)
      summary.skipped += 1
      continue
    }

    const payload = {
      article: {
        title,
        body_markdown: body,
        published: true,
        tags,
        canonical_url,
        ...(post.description ? { description: post.description } : {}),
        ...(main_image ? { main_image } : {}),
      },
    }

    try {
      if (uploadAttempts > 0) {
        const delaySec = UPLOAD_DELAY_MS / 1000
        console.log(`  waiting ${delaySec}s before next dev.to upload...`)
        await sleep(UPLOAD_DELAY_MS)
      }
      uploadAttempts += 1

      if (existing?.id) {
        const article = await devtoRequest('PUT', `/articles/${existing.id}`, payload)
        manifest[post.slug] = {
          id: article.id ?? existing.id,
          url: articleUrl(article) ?? existing.url,
          hash,
          syncedAt: new Date().toISOString(),
        }
        console.log(`  updated: ${post.slug} (id ${manifest[post.slug].id})${main_image ? ' + cover' : ''}`)
        summary.updated += 1
      } else {
        const article = await devtoRequest('POST', '/articles', payload)
        manifest[post.slug] = {
          id: article.id,
          url: articleUrl(article),
          hash,
          syncedAt: new Date().toISOString(),
        }
        console.log(`  created: ${post.slug} (id ${article.id})${main_image ? ' + cover' : ''}`)
        summary.created += 1
      }
      saveSyncManifest(manifest)
    } catch (err) {
      console.error(`  FAILED: ${post.slug} — ${err.message}`)
      summary.failed += 1
    }
  }

  console.log('\n--- dev.to sync summary ---')
  console.log(`  created: ${summary.created}`)
  console.log(`  updated: ${summary.updated}`)
  console.log(`  skipped: ${summary.skipped}`)
  console.log(`  failed:  ${summary.failed}`)

  if (summary.failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
