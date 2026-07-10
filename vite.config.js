import { copyFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import prerender from '@prerenderer/rollup-plugin'
import blogDevPlugin from './back-end/vite-plugin-blog-dev.mjs'
import portfolioAnalyticsDevPlugin from './back-end/vite-plugin-portfolio-analytics-dev.mjs'
import liveStatsApiPlugin from './back-end/vite-plugin-live-stats-api.mjs'
import { getLiveDavinciPluginSlugs } from './back-end/lib/davinci-plugins.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PRIVACY_POLICY_SLUGS = [
  'ai-bookmark',
  'claude-deep-search',
  'claude-limit-monitor',
  'gmail-to-pdf-extension',
  'instagram-comment-exporter',
  'instagram-dm-exporter',
  'save-to-drive-chrome-extension',
  'youtube-keyword',
  'dex',
  'bluesky-hide-repost',
]

const TERMS_OF_SERVICE_SLUGS = ['save-to-drive-chrome-extension']

function getPrerenderRoutes() {
  const { apps } = JSON.parse(
    readFileSync(join(__dirname, 'src', 'data', 'apps.json'), 'utf8'),
  )
  let blogPosts = []
  try {
    const blog = JSON.parse(
      readFileSync(join(__dirname, 'src', 'data', 'blog.json'), 'utf8'),
    )
    blogPosts = blog.posts ?? []
  } catch {
    blogPosts = []
  }

  const pluginSlugs = getLiveDavinciPluginSlugs()

  return [
    '/',
    '/apps',
    '/davinci-resolve-plugins',
    '/blog',
    '/live-stats',
    '/save-directly-to-drive',
    '/thank-you',
    '/uninstall',
    '/work',
    '/contact',
    ...(apps || []).map((app) => `/apps/${app.slug}`),
    ...pluginSlugs.map((slug) => `/davinci-resolve-plugins/${slug}`),
    ...PRIVACY_POLICY_SLUGS.map((slug) => `/privacy-policy/${slug}`),
    ...TERMS_OF_SERVICE_SLUGS.map((slug) => `/terms-of-service/${slug}`),
    ...blogPosts.map((post) => `/blog/${post.slug}`),
  ]
}

export default defineConfig({
  plugins: [
    react(),
    blogDevPlugin(),
    portfolioAnalyticsDevPlugin(),
    liveStatsApiPlugin(),
    prerender({
      routes: getPrerenderRoutes(),
      renderer: '@prerenderer/renderer-puppeteer',
      rendererOptions: {
        renderAfterTime: 2000,
        headless: true,
      },
    }),
    {
      name: 'copy-index-to-404',
      closeBundle() {
        copyFileSync('./dist/index.html', './dist/404.html')
      },
    },
  ],
  base: '/',
})
