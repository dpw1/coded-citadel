/**
 * Reads blogs/*.md and blogs/*.html, writes src/data/blog.json and
 * public/blog-content/{slug}.html (article body only).
 *
 * Run: npm run generate-blog-manifest
 */

import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { marked } from 'marked'
import { parseYoutubeVideoId, resolveYoutubeThumbnail } from './youtube-utils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const BLOGS_DIR = resolve(ROOT, 'blogs')
const REDIRECTS_FILE = resolve(ROOT, 'blog-redirects.json')
const MANIFEST_FILE = resolve(ROOT, 'src', 'data', 'blog.json')
const CONTENT_DIR = resolve(ROOT, 'public', 'blog-content')

const WORDS_PER_MINUTE = 200
const SITE_URL = (process.env.SITE_URL || 'https://codedcitadel.com').replace(/\/$/, '')

marked.setOptions({ gfm: true, breaks: false })

function readRedirects() {
  try {
    const raw = readFileSync(REDIRECTS_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function parseHtmlFrontmatter(content) {
  const match = content.match(
    /<script\s+type="application\/json"\s+id="frontmatter"\s*>([\s\S]*?)<\/script>/i,
  )
  if (!match) {
    return { frontmatter: {}, body: content.trim() }
  }

  let frontmatter = {}
  try {
    frontmatter = JSON.parse(match[1])
  } catch (err) {
    console.warn('Invalid JSON frontmatter in HTML blog file:', err.message)
  }

  const body = content.replace(match[0], '').trim()
  return { frontmatter, body }
}

function normalizeFrontmatter(raw, filenameSlug) {
  const slug = (raw.slug || filenameSlug).trim()
  const tags = Array.isArray(raw.tags) ? raw.tags.map(String) : []
  const keyTakeaways = Array.isArray(raw.keyTakeaways)
    ? raw.keyTakeaways.map(String)
    : []

  const youtubeId = raw.youtubeId ? parseYoutubeVideoId(String(raw.youtubeId)) : null

  return {
    slug,
    title: String(raw.title || slug),
    date: String(raw.date || new Date().toISOString().slice(0, 10)),
    description: String(raw.description || ''),
    tags,
    canonicalUrl: raw.canonicalUrl ? String(raw.canonicalUrl) : null,
    youtubeId,
    coverImage: raw.coverImage ? String(raw.coverImage) : null,
    keyTakeaways,
    draft: Boolean(raw.draft),
  }
}

function estimateReadingTime(htmlOrText) {
  const text = String(htmlOrText)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const words = text ? text.split(' ').filter(Boolean).length : 0
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

function resolveCoverImageUrl(coverImage) {
  if (!coverImage) return null
  if (/^https?:\/\//i.test(coverImage)) return coverImage
  return `${SITE_URL}${coverImage.startsWith('/') ? coverImage : `/${coverImage}`}`
}

async function resolvePostCover(meta) {
  if (meta.coverImage) {
    return {
      coverImage: meta.coverImage,
      coverImageUrl: resolveCoverImageUrl(meta.coverImage),
    }
  }

  if (meta.youtubeId) {
    const thumbnail = await resolveYoutubeThumbnail(meta.youtubeId)
    return {
      coverImage: thumbnail,
      coverImageUrl: thumbnail,
    }
  }

  return { coverImage: null, coverImageUrl: null }
}

function processMarkdownFile(filePath, filenameSlug) {
  const raw = readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  const meta = normalizeFrontmatter(data, filenameSlug)
  const bodyHtml = marked.parse(content.trim())
  return { meta, bodyHtml }
}

function processHtmlFile(filePath, filenameSlug) {
  const raw = readFileSync(filePath, 'utf8')
  const { frontmatter, body } = parseHtmlFrontmatter(raw)
  const meta = normalizeFrontmatter(frontmatter, filenameSlug)
  return { meta, bodyHtml: body }
}

function collectBlogFiles() {
  let entries = []
  try {
    entries = readdirSync(BLOGS_DIR, { withFileTypes: true })
  } catch {
    console.warn('blogs/ folder not found — writing empty blog manifest')
    return []
  }

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const ext = extname(entry.name).toLowerCase()
      if (ext !== '.md' && ext !== '.html') return null
      const filenameSlug = basename(entry.name, ext)
      const filePath = resolve(BLOGS_DIR, entry.name)
      if (ext === '.md') return processMarkdownFile(filePath, filenameSlug)
      return processHtmlFile(filePath, filenameSlug)
    })
    .filter(Boolean)
}

async function main() {
  const redirects = readRedirects()
  const processed = collectBlogFiles()
  const slugSet = new Set()
  const posts = []

  mkdirSync(CONTENT_DIR, { recursive: true })

  for (const file of readdirSync(CONTENT_DIR)) {
    if (file.endsWith('.html')) {
      rmSync(resolve(CONTENT_DIR, file))
    }
  }

  for (const { meta, bodyHtml } of processed) {
    if (meta.draft) {
      console.log(`  skip draft: ${meta.slug}`)
      continue
    }

    if (slugSet.has(meta.slug)) {
      console.warn(`  duplicate slug "${meta.slug}" — skipping`)
      continue
    }
    slugSet.add(meta.slug)

    const readingTime = estimateReadingTime(bodyHtml)
    const { coverImage, coverImageUrl } = await resolvePostCover(meta)

    writeFileSync(resolve(CONTENT_DIR, `${meta.slug}.html`), bodyHtml, 'utf8')

    posts.push({
      slug: meta.slug,
      title: meta.title,
      date: meta.date,
      description: meta.description,
      tags: meta.tags,
      canonicalUrl: meta.canonicalUrl,
      youtubeId: meta.youtubeId,
      coverImage,
      coverImageUrl,
      keyTakeaways: meta.keyTakeaways,
      readingTime,
      contentHtml: bodyHtml,
    })

    const coverNote = coverImageUrl && !meta.coverImage ? ' (cover from YouTube)' : ''
    console.log(`  ${meta.slug} (${readingTime} min read)${coverNote}`)
  }

  posts.sort((a, b) => b.date.localeCompare(a.date))

  const manifest = {
    updatedAt: new Date().toISOString().slice(0, 10),
    siteUrl: SITE_URL,
    redirects,
    posts,
  }

  writeFileSync(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  console.log(
    `Wrote ${posts.length} post(s) to ${MANIFEST_FILE} and HTML to ${CONTENT_DIR}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
