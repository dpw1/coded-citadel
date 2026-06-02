import { copyFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import prerender from '@prerenderer/rollup-plugin'
import blogDevPlugin from './back-end/vite-plugin-blog-dev.mjs'
import portfolioAnalyticsDevPlugin from './back-end/vite-plugin-portfolio-analytics-dev.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PRIVACY_POLICY_SLUGS = [
  'claude-deep-search',
  'claude-limit-monitor',
  'instagram-dm-exporter',
  'save-to-drive-chrome-extension',
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

  return [
    '/',
    '/apps',
    '/blog',
    '/live-stats',
    '/save-directly-to-drive',
    ...(apps || []).map((app) => `/apps/${app.slug}`),
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
