import blogData from '../data/blog.json'

const SITE_URL = blogData.siteUrl || 'https://codedcitadel.com'

/** Keep in sync with back-end/generate-sitemap.mjs */
export const BLOG_INDEX_PAGE_SIZE = 20

export function getBlogManifest() {
  return blogData
}

export function getAllBlogPosts() {
  return blogData.posts ?? []
}

export function getBlogPageCount(pageSize = BLOG_INDEX_PAGE_SIZE, posts = null) {
  const total = (posts ?? getAllBlogPosts()).length
  if (total === 0) return 1
  return Math.max(1, Math.ceil(total / pageSize))
}

/** 1-based page number; clamps to valid range. */
export function normalizeBlogPageNumber(
  page,
  pageSize = BLOG_INDEX_PAGE_SIZE,
  posts = null,
) {
  const n = Number.parseInt(String(page), 10)
  if (!Number.isFinite(n) || n < 1) return 1
  const max = getBlogPageCount(pageSize, posts)
  return Math.min(n, max)
}

export function getBlogPostsForPage(
  page,
  pageSize = BLOG_INDEX_PAGE_SIZE,
  posts = null,
) {
  const list = posts ?? getAllBlogPosts()
  const safePage = normalizeBlogPageNumber(page, pageSize, list)
  const start = (safePage - 1) * pageSize
  return list.slice(start, start + pageSize)
}

export function normalizeBlogSearchQuery(raw) {
  if (raw == null) return ''
  return String(raw).trim().slice(0, 120)
}

/** Case-insensitive search across title, description, slug, and tags. */
export function searchBlogPosts(posts, query) {
  const q = normalizeBlogSearchQuery(query).toLowerCase()
  if (!q) return posts

  const terms = q.split(/\s+/).filter(Boolean)
  return posts.filter((post) => {
    const haystack = [
      post.title,
      post.description,
      post.slug,
      ...(post.tags ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return terms.every((term) => haystack.includes(term))
  })
}

/** Path for blog index pagination (page 1 → `/blog`). Preserves `?q=` when set. */
export function getBlogIndexPath(page, { q } = {}) {
  const n = Number.parseInt(String(page), 10)
  const path = !Number.isFinite(n) || n <= 1 ? '/blog' : `/blog/page/${n}`
  const query = normalizeBlogSearchQuery(q)
  if (!query) return path
  return `${path}?q=${encodeURIComponent(query)}`
}

export function getBlogIndexCanonicalUrl(page, { q } = {}) {
  const searchQ = normalizeBlogSearchQuery(q)
  if (searchQ) {
    return `${SITE_URL}/blog`
  }
  const path = getBlogIndexPath(page)
  return `${SITE_URL}${path.split('?')[0]}`
}

export function getBlogPostBySlug(slug) {
  return getAllBlogPosts().find((post) => post.slug === slug) ?? null
}

/** Fallback when blog frontmatter is missing extensionSlug / download. */
const APP_BLOG_SLUG_FALLBACKS = {
  dex: 'discord-message-exporter-chrome-extension',
}

/** Find the build diary post for a Chrome extension app. */
export function getBlogPostForApp(app) {
  if (!app) return null

  const posts = getAllBlogPosts()
  const appSlug = app.slug
  const extensionId = app.chromeExtensionId

  const byExtensionSlug = posts.find((post) => post.extensionSlug && post.extensionSlug === appSlug)
  if (byExtensionSlug) return byExtensionSlug

  if (extensionId) {
    const byDownload = posts.find(
      (post) => typeof post.download === 'string' && post.download.includes(extensionId),
    )
    if (byDownload) return byDownload
  }

  const fallbackSlug = APP_BLOG_SLUG_FALLBACKS[appSlug]
  if (fallbackSlug) {
    const byFallback = getBlogPostBySlug(fallbackSlug)
    if (byFallback) return byFallback
  }

  return null
}

/** Other posts for “Keep reading” (newest first, excludes current). */
export function getKeepReadingPosts(currentSlug, limit = 3) {
  return getAllBlogPosts()
    .filter((post) => post.slug !== currentSlug)
    .slice(0, limit)
}

export function getBlogRedirects() {
  return blogData.redirects ?? []
}

export function getBlogRedirectTarget(slug) {
  const match = getBlogRedirects().find((entry) => entry.from === slug)
  return match?.to ?? null
}

export function getBlogPostUrl(slug) {
  return `${SITE_URL}/blog/${slug}`
}

export function getBlogIndexUrl() {
  return `${SITE_URL}/blog`
}

export function formatBlogDate(isoDate) {
  if (!isoDate) return '—'
  const d = new Date(`${isoDate}T12:00:00`)
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function blogContentUrl(slug) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}blog-content/${slug}.html`
}

export function resolveBlogImageUrl(imagePath) {
  if (!imagePath) return null
  if (/^https?:\/\//i.test(imagePath)) return imagePath
  const base = import.meta.env.BASE_URL || '/'
  const path = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
  return `${base}${path}`
}

/** YouTube watch/share URL or 11-char ID → video ID for embeds. */
export function parseYoutubeVideoId(input) {
  if (!input) return null

  const value = String(input).trim()
  if (!value || value === '#') return null

  if (/^[\w-]{11}$/.test(value) && !/^1234567890/i.test(value)) {
    return value
  }

  try {
    const u = new URL(value)

    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      return id && /^[\w-]{11}$/.test(id) && !/^1234567890/i.test(id) ? id : null
    }

    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtube-nocookie.com')) {
      const fromQuery = u.searchParams.get('v')
      if (fromQuery && /^[\w-]{11}$/.test(fromQuery) && !/^1234567890/i.test(fromQuery)) {
        return fromQuery
      }

      const fromPath = u.pathname.match(/\/(?:embed|shorts|live|v)\/([\w-]{11})/)
      if (fromPath && !/^1234567890/i.test(fromPath[1])) return fromPath[1]
    }
  } catch {
    return null
  }

  return null
}

/** True when the input URL is a YouTube Shorts link (skip auto thumbnail). */
export function isYoutubeShortsUrl(input) {
  if (!input) return false
  return /short/i.test(String(input))
}

export function getPostCoverUrl(post) {
  const custom =
    resolveBlogImageUrl(post?.thumbnail ?? post?.coverImage) ??
    post?.coverImageUrl
  if (custom) return custom

  if (post?.youtubeIsShort) return null

  const ytId = parseYoutubeVideoId(post?.youtubeId)
  return ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null
}

export function getPostYoutubeEmbedId(post) {
  return parseYoutubeVideoId(post?.youtubeId)
}

export { SITE_URL as BLOG_SITE_URL }
