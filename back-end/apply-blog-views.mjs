/**
 * Merge per-post page views from src/data/ga-db.json into src/data/blog.json.
 *
 * Run: npm run apply-blog-views
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readGaDb } from './lib/ga-db.mjs'
import { buildBlogViewsBySlug } from './lib/blog-post-views.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const BLOG_FILE = resolve(ROOT, 'src', 'data', 'blog.json')

function main() {
  if (!existsSync(BLOG_FILE)) {
    console.warn(`Missing ${BLOG_FILE} — run generate-blog-manifest first`)
    return
  }

  const manifest = JSON.parse(readFileSync(BLOG_FILE, 'utf8'))
  const posts = manifest.posts ?? []
  if (!posts.length) {
    console.log('Blog views: no posts in blog.json')
    return
  }

  const gaDb = readGaDb()
  const viewsBySlug = buildBlogViewsBySlug(gaDb.blogPostViews, manifest.redirects)

  let applied = 0
  for (const post of posts) {
    const views = viewsBySlug.get(post.slug) ?? 0
    post.views = views
    if (views > 0) applied += 1
  }

  writeFileSync(BLOG_FILE, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  const sourceCount = gaDb.blogPostViews?.length ?? 0
  console.log(
    `Blog views: applied to ${posts.length} post(s) (${applied} with views, ${sourceCount} GA path(s)) → ${BLOG_FILE}`,
  )
}

main()
