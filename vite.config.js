import { copyFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import prerender from '@prerenderer/rollup-plugin'

const __dirname = dirname(fileURLToPath(import.meta.url))

function getPrerenderRoutes() {
  const { apps } = JSON.parse(
    readFileSync(join(__dirname, 'src', 'data', 'apps.json'), 'utf8'),
  )
  return [
    '/',
    '/apps',
    ...(apps || []).map((app) => `/apps/${app.slug}`),
  ]
}

export default defineConfig({
  plugins: [
    react(),
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
