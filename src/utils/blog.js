import blogData from '../data/blog.json'

const SITE_URL = blogData.siteUrl || 'https://codedcitadel.com'

export function getBlogManifest() {
  return blogData
}

export function getAllBlogPosts() {
  return blogData.posts ?? []
}

export function getBlogPostBySlug(slug) {
  return getAllBlogPosts().find((post) => post.slug === slug) ?? null
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
  const custom = post?.coverImageUrl ?? resolveBlogImageUrl(post?.thumbnail ?? post?.coverImage)
  if (custom) return custom

  if (post?.youtubeIsShort) return null

  const ytId = parseYoutubeVideoId(post?.youtubeId)
  return ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null
}

export function getPostYoutubeEmbedId(post) {
  return parseYoutubeVideoId(post?.youtubeId)
}

export { SITE_URL as BLOG_SITE_URL }
