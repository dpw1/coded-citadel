/**
 * Dev-only: watch blogs/ and re-run generate-blog-manifest on save.
 */

import { spawnSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const MANIFEST_SCRIPT = resolve(__dirname, 'generate-blog-manifest.mjs')
const BLOGS_DIR = resolve(ROOT, 'blogs')
const REDIRECTS_FILE = resolve(ROOT, 'blog-redirects.json')

function regenerateBlogManifest() {
  const result = spawnSync(process.execPath, [MANIFEST_SCRIPT], {
    cwd: ROOT,
    stdio: 'inherit',
  })
  return result.status === 0
}

function isBlogSourceFile(file) {
  return file.startsWith(BLOGS_DIR) || file === REDIRECTS_FILE
}

export default function blogDevPlugin() {
  let debounceTimer = null
  let running = false

  return {
    name: 'blog-dev',
    apply: 'serve',

    configureServer(server) {
      const scheduleRegenerate = (reason) => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          if (running) return
          running = true
          console.log(`\n[blog-dev] Regenerating blog (${reason})…`)
          const ok = regenerateBlogManifest()
          running = false
          if (!ok) {
            console.warn('[blog-dev] generate-blog-manifest failed')
            return
          }
          server.ws.send({ type: 'full-reload', path: '*' })
        }, 350)
      }

      regenerateBlogManifest()

      server.watcher.add([BLOGS_DIR, REDIRECTS_FILE])

      const onBlogChange = (file) => {
        if (isBlogSourceFile(file)) scheduleRegenerate(file.replace(ROOT, ''))
      }

      server.watcher.on('change', onBlogChange)
      server.watcher.on('add', onBlogChange)
      server.watcher.on('unlink', onBlogChange)
    },
  }
}
