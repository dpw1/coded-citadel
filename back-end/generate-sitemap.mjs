/**
 * Generates public/sitemap.xml from src/data/apps.json for GitHub Pages.
 * Run: npm run generate-sitemap  (from repo root)
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const APPS_FILE = resolve(ROOT, 'src', 'data', 'apps.json')
const BLOG_FILE = resolve(ROOT, 'src', 'data', 'blog.json')
const OUT_FILE = resolve(ROOT, 'public', 'sitemap.xml')
const SITE_URL = (process.env.SITE_URL || 'https://codedcitadel.com').replace(/\/$/, '')

/** Keep in sync with src/utils/privacyPolicies.js */
const PRIVACY_POLICY_SLUGS = [
  'claude-deep-search',
  'claude-limit-monitor',
  'instagram-dm-exporter',
  'save-to-drive-chrome-extension',
]

/** Keep in sync with src/utils/termsOfService.js */
const TERMS_OF_SERVICE_SLUGS = ['save-to-drive-chrome-extension']

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function urlEntry(loc, { changefreq, priority, lastmod } = {}) {
  const lines = [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
  ]
  if (lastmod) lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`)
  if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`)
  if (priority != null) lines.push(`    <priority>${priority}</priority>`)
  lines.push('  </url>')
  return lines.join('\n')
}

function loadBlogPosts() {
  try {
    const { posts } = JSON.parse(readFileSync(BLOG_FILE, 'utf8'))
    return posts ?? []
  } catch {
    return []
  }
}

function main() {
  const { updatedAt, apps } = JSON.parse(readFileSync(APPS_FILE, 'utf8'))
  const blogPosts = loadBlogPosts()
  const defaultLastmod = updatedAt || new Date().toISOString().slice(0, 10)

  const entries = [
    urlEntry(`${SITE_URL}/`, {
      changefreq: 'weekly',
      priority: '1.0',
      lastmod: defaultLastmod,
    }),
    urlEntry(`${SITE_URL}/apps`, {
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: defaultLastmod,
    }),
    urlEntry(`${SITE_URL}/live-stats`, {
      changefreq: 'daily',
      priority: '0.85',
      lastmod: defaultLastmod,
    }),
    urlEntry(`${SITE_URL}/save-directly-to-drive`, {
      changefreq: 'monthly',
      priority: '0.9',
      lastmod: defaultLastmod,
    }),
    ...(apps || []).map((app) =>
      urlEntry(`${SITE_URL}/apps/${app.slug}`, {
        lastmod: app.lastUpdated || defaultLastmod,
        changefreq: 'monthly',
        priority: '0.9',
      })
    ),
    ...PRIVACY_POLICY_SLUGS.map((slug) =>
      urlEntry(`${SITE_URL}/privacy-policy/${slug}`, {
        lastmod: defaultLastmod,
        changefreq: 'yearly',
        priority: '0.5',
      })
    ),
    ...TERMS_OF_SERVICE_SLUGS.map((slug) =>
      urlEntry(`${SITE_URL}/terms-of-service/${slug}`, {
        lastmod: defaultLastmod,
        changefreq: 'yearly',
        priority: '0.5',
      })
    ),
    urlEntry(`${SITE_URL}/blog`, {
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: blogPosts[0]?.date || defaultLastmod,
    }),
    ...blogPosts.map((post) =>
      urlEntry(`${SITE_URL}/blog/${post.slug}`, {
        lastmod: post.date || defaultLastmod,
        changefreq: 'weekly',
        priority: '0.8',
      })
    ),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`

  writeFileSync(OUT_FILE, xml, 'utf8')
  console.log(`Wrote sitemap with ${entries.length} URLs to ${OUT_FILE}`)
}

main()
