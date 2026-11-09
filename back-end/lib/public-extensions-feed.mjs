/**
 * Build a public, cross-site-safe catalog from apps.json (+ custom data + blog).
 * Omits revenue, install/user time series, regional breakdowns, and internal hashes.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')

const PIN_LAST_APP_SLUG = 'save-directly-to-drive'
const PIN_LAST_APP_CHROME_ID = 'jadjgiiaompdjacagaomgogdihbpgcpg'

const PRIVACY_POLICY_SLUGS = new Set([
  'ai-bookmark',
  'claude-deep-search',
  'claude-limit-monitor',
  'gmail-to-pdf-extension',
  'instagram-comment-exporter',
  'instagram-dm-exporter',
  'save-to-drive-chrome-extension',
  'youtube-keyword',
  'youtube-ai-summary',
  'yt-filter-pro',
  'youtube-filter-pro',
  'dex',
  'bluesky-hide-repost',
  'youtube-comments',
  'youtube-comments-exporter',
])

const NON_ENGLISH_MARKERS =
  /\b(mostra|pesquise|gerencie|engajamento|visualiza|curtidos|assistir|minha atividade|seus|suas|não|para o|com um|estilo do|vídeos|comentários)\b/i
const NON_ENGLISH_DIACRITICS = /[àáâãéêíóôõúç]/i

function isLikelyEnglish(text) {
  if (!text || typeof text !== 'string') return false
  const trimmed = text.trim()
  if (!trimmed) return false
  if (NON_ENGLISH_DIACRITICS.test(trimmed)) return false
  if (NON_ENGLISH_MARKERS.test(trimmed)) return false
  return true
}

function firstSentence(text) {
  if (!text || typeof text !== 'string') return ''
  const line = text.trim().split('\n')[0]?.trim() ?? ''
  const match = line.match(/^[^.!?]+[.!?]?/)
  return match ? match[0].trim() : line
}

function resolveEnglishTagline(app) {
  if (!app) return ''
  const candidates = [
    app.taglineEn,
    app.description?.short,
    app.tagline,
    firstSentence(app.description?.full),
  ]
  for (const candidate of candidates) {
    if (isLikelyEnglish(candidate)) return candidate.trim()
  }
  return (app.description?.short || app.tagline || '').trim()
}

function isPinnedLastApp(app) {
  if (!app) return false
  return (
    app.slug === PIN_LAST_APP_SLUG ||
    app.chromeExtensionId === PIN_LAST_APP_CHROME_ID ||
    String(app.name ?? '').startsWith('Save to Google Drive')
  )
}

function isAppListed(app) {
  if (!app) return false
  if (app.listed === false) return false
  if (isPinnedLastApp(app)) return false
  return true
}

function isAppDiscontinued(app) {
  return Boolean(app) && !isAppListed(app) && isPinnedLastApp(app)
}

function isAppLive(app) {
  return app?.status === 'live'
}

function appActiveUsers(app) {
  if (!isAppLive(app) || !app.analytics) return null
  const series = app.analytics.weeklyUsers
  if (series?.length) {
    const last = series[series.length - 1]
    return last?.total ?? last?.count ?? 0
  }
  const enabled = app.analytics.enabledVsDisabled?.enabled
  return enabled != null ? enabled : null
}

function appTotalInstalls(app) {
  if (!isAppLive(app)) return null
  const total = app.analytics?.totalInstalls
  return total != null ? total : null
}

function findCustomAppEntry(app, customApps) {
  return (customApps ?? []).find(
    (entry) => entry.slug === app?.slug || entry.id === app?.chromeExtensionId,
  )
}

function normalizeCategory(value) {
  if (!value || typeof value !== 'string') return 'Productivity'
  const labels = {
    'social media': 'Social Media',
    productivity: 'Productivity',
    'ai assistant': 'AI Assistant',
  }
  const trimmed = value.trim()
  return labels[trimmed.toLowerCase()] ?? trimmed
}

function youtubeEmbedId(url) {
  if (!url || typeof url !== 'string') return null
  try {
    const u = new URL(url.trim())
    let id = null
    if (u.hostname.includes('youtu.be')) {
      id = u.pathname.replace(/^\//, '').split('/')[0]
    } else {
      id = u.searchParams.get('v')
    }
    if (!id || !/^[\w-]{11}$/.test(id) || /^1234567890/i.test(id)) return null
    return id
  } catch {
    return null
  }
}

function appBuildYoutubeUrl(app, custom) {
  if (custom?.youtube && youtubeEmbedId(custom.youtube)) return custom.youtube.trim()
  const fromApp = app?.buildStory?.youtubeUrl ?? app?.youtube
  if (fromApp && youtubeEmbedId(fromApp)) return fromApp.trim()
  return null
}

function appGithubUrl(app, custom) {
  const url = app?.github ?? custom?.github
  return typeof url === 'string' && url.trim() ? url.trim() : null
}

function appHeroPreviewUrl(app) {
  const shot = app?.screenshots?.[0]
  return typeof shot === 'string' && shot.startsWith('http') ? shot : null
}

function dedupeScreenshots(app) {
  const seen = new Set()
  return (app?.screenshots ?? []).filter((url) => {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) return false
    if (seen.has(url)) return false
    seen.add(url)
    return true
  })
}

function resolvePrivacyPolicySlug(appSlug) {
  if (!appSlug) return null
  if (PRIVACY_POLICY_SLUGS.has(appSlug)) return appSlug
  const aliases = {
    'youtube-filter-pro': 'yt-filter-pro',
    'hide-reposts-for-bluesky': 'bluesky-hide-repost',
    'gmail-to-pdf': 'gmail-to-pdf-extension',
    dex: 'dex',
    'instagram-comment-exporter': 'instagram-comment-exporter',
    'claude-deep-search': 'claude-deep-search',
  }
  const mapped = aliases[appSlug]
  if (mapped && PRIVACY_POLICY_SLUGS.has(mapped)) return mapped
  return null
}

function blogPostForApp(app, posts) {
  if (!app || !posts?.length) return null
  const appSlug = app.slug
  const extensionId = app.chromeExtensionId

  const byExtensionSlug = posts.find(
    (post) => post.extensionSlug && post.extensionSlug === appSlug,
  )
  if (byExtensionSlug) return byExtensionSlug

  if (extensionId) {
    return (
      posts.find(
        (post) => typeof post.download === 'string' && post.download.includes(extensionId),
      ) ?? null
    )
  }
  return null
}

function storeUrl(app) {
  const url = app?.chromeStoreUrl
  return url && url !== '#' ? url : null
}

function buildPublicExtensionRecord(app, { customApps, blogPosts, siteUrl }) {
  const custom = findCustomAppEntry(app, customApps)
  const taglineCustom = custom?.tagline
  const shortDescription =
    taglineCustom && isLikelyEnglish(taglineCustom)
      ? taglineCustom.trim()
      : resolveEnglishTagline(app)
  const fullDescription =
    typeof app.description?.full === 'string' && app.description.full.trim()
      ? app.description.full.trim()
      : null
  const icon =
    app.chromeExtensionIcon && String(app.chromeExtensionIcon).startsWith('http')
      ? app.chromeExtensionIcon
      : null
  const blogPost = blogPostForApp(app, blogPosts)
  const privacySlug = resolvePrivacyPolicySlug(app.slug)
  const buildStory = app.buildStory ?? custom?.buildStory ?? null

  return {
    slug: app.slug,
    chromeExtensionId: app.chromeExtensionId ?? null,
    title: app.name ?? app.slug,
    shortDescription,
    description: fullDescription,
    image: icon,
    heroImage: appHeroPreviewUrl(app),
    screenshots: dedupeScreenshots(app),
    users: appActiveUsers(app),
    totalInstalls: appTotalInstalls(app),
    status: app.status ?? null,
    listed: isAppListed(app),
    discontinued: isAppDiscontinued(app),
    price: app.price ?? null,
    version: app.version ?? null,
    lastUpdated: app.lastUpdated ?? null,
    category: normalizeCategory(custom?.category ?? app.category),
    tags: Array.isArray(custom?.tags ?? app.tags)
      ? (custom?.tags ?? app.tags).filter((t) => typeof t === 'string' && t)
      : [],
    platform: app.platform ?? 'Google Chrome',
    urls: {
      landing: `${siteUrl}/apps/${app.slug}`,
      chromeWebStore: storeUrl(app),
      blog: blogPost?.slug ? `${siteUrl}/blog/${blogPost.slug}` : null,
      github: appGithubUrl(app, custom),
      youtubeBuild: appBuildYoutubeUrl(app, custom),
      privacyPolicy: privacySlug ? `${siteUrl}/privacy-policy/${privacySlug}` : null,
    },
    build: buildStory
      ? {
          estimatedTime: custom?.estimatedTime ?? app.estimatedTime ?? null,
          prompts: custom?.prompts ?? app.prompts ?? null,
          builtInDays: buildStory.builtInDays ?? null,
          techStack: Array.isArray(buildStory.techStack) ? buildStory.techStack : [],
          youtubeUrl: buildStory.youtubeUrl ?? null,
        }
      : {
          estimatedTime: custom?.estimatedTime ?? app.estimatedTime ?? null,
          prompts: custom?.prompts ?? app.prompts ?? null,
          builtInDays: null,
          techStack: [],
          youtubeUrl: null,
        },
    features: Array.isArray(app.features) ? app.features : [],
    relatedSlugs: Array.isArray(custom?.related ?? app.related)
      ? (custom?.related ?? app.related).filter((s) => typeof s === 'string' && s)
      : [],
    quickStartHtml:
      typeof (custom?.quickStart ?? app.quickStart) === 'string'
        ? (custom?.quickStart ?? app.quickStart).trim() || null
        : null,
    created: custom?.created ?? app.created ?? null,
  }
}

export function loadPublicExtensionsFeed(options = {}) {
  const siteUrl = (options.siteUrl || process.env.SITE_URL || 'https://codedcitadel.com').replace(
    /\/$/,
    '',
  )
  const appsPath = options.appsPath ?? resolve(ROOT, 'src', 'data', 'apps.json')
  const customPath = options.customPath ?? resolve(ROOT, 'src', 'data', 'apps-custom-data.json')
  const blogPath = options.blogPath ?? resolve(ROOT, 'src', 'data', 'blog.json')

  const { updatedAt, apps } = JSON.parse(readFileSync(appsPath, 'utf8'))
  let customApps = []
  try {
    customApps = JSON.parse(readFileSync(customPath, 'utf8')).apps ?? []
  } catch {
    customApps = []
  }
  let blogPosts = []
  try {
    blogPosts = JSON.parse(readFileSync(blogPath, 'utf8')).posts ?? []
  } catch {
    blogPosts = []
  }

  const catalog = (apps ?? []).filter((app) => isAppListed(app) || isAppDiscontinued(app))

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    catalogUpdatedAt: updatedAt ?? null,
    siteUrl,
    count: catalog.length,
    extensions: catalog.map((app) =>
      buildPublicExtensionRecord(app, { customApps, blogPosts, siteUrl }),
    ),
  }
}
