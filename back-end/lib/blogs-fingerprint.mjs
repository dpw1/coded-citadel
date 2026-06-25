import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { getRootDir } from './load-env.mjs'

/** Stable hash of all blogs/*.md contents (sorted by filename). */
export function computeBlogsFingerprint() {
  const blogsDir = resolve(getRootDir(), 'blogs')
  if (!existsSync(blogsDir)) return ''

  const files = readdirSync(blogsDir)
    .filter((name) => extname(name).toLowerCase() === '.md')
    .sort()

  const hash = createHash('sha256')
  for (const name of files) {
    hash.update(name)
    hash.update(readFileSync(join(blogsDir, name)))
  }
  return hash.digest('hex')
}
