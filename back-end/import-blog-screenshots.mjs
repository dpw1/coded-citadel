/**
 * Scans blogs/*.md for local images that need importing:
 *
 * 1. Chrome download placeholders: D:/GoogleChromeDownloads/SCREENSHOT…
 *    Accepts plain paths, `backticks`, "quotes", 'quotes', or ![](path).
 * 2. Pasted markdown images: ![alt](image/{post}/file.png)
 *
 * Copies into public/blog-images/ and rewrites lines as ![]({webPath}).
 *
 * Run: npm run import-blog-screenshots
 * Idempotent — safe to run on every build.
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const BLOGS_DIR = resolve(ROOT, 'blogs')
const PUBLIC_IMAGES_DIR = resolve(ROOT, 'public', 'blog-images')

const SOURCE_DIR = 'D:/GoogleChromeDownloads'
const DOWNLOAD_PATH_RE =
  /^D:[/\\]GoogleChromeDownloads[/\\](SCREENSHOT[^\s"'`]*\.(?:jpg|jpeg|png|webp))$/i
const DOWNLOAD_IN_MD_IMAGE_RE =
  /^!\[[^\]]*\]\(D:[/\\]GoogleChromeDownloads[/\\](SCREENSHOT[^)\s]*\.(?:jpg|jpeg|png|webp))\)\s*$/i
const IMPORTED_IMAGE_RE = /^!\[[^\]]*\]\((\/blog-images\/[^)]+)\)\s*$/
const PASTED_IMAGE_RE = /^!\[[^\]]*\]\((image\/[^)]+)\)\s*$/

function stripOuterWrappers(line) {
  const trimmed = line.trim()
  if (trimmed.length < 2) return trimmed

  const first = trimmed[0]
  const last = trimmed[trimmed.length - 1]
  if (
    (first === '`' && last === '`') ||
    (first === '"' && last === '"') ||
    (first === "'" && last === "'")
  ) {
    return trimmed.slice(1, -1).trim()
  }

  return trimmed
}

/** @returns {string | null} screenshot filename, e.g. SCREENSHOT_12-06-2026-00h50.jpg */
function parseDownloadPlaceholder(trimmed) {
  const mdMatch = trimmed.match(DOWNLOAD_IN_MD_IMAGE_RE)
  if (mdMatch) return mdMatch[1]

  const unwrapped = stripOuterWrappers(trimmed)
  const plainMatch = unwrapped.match(DOWNLOAD_PATH_RE)
  if (plainMatch) return plainMatch[1]

  return null
}

function postKeyFromFilename(filename) {
  return basename(filename, extname(filename))
}

function webPathFor(postKey, imageFilename) {
  return `/blog-images/${postKey}/${imageFilename}`
}

function destPathFor(postKey, imageFilename) {
  return join(PUBLIC_IMAGES_DIR, postKey, imageFilename)
}

function webPathFromPastedRelative(relativePath) {
  const withoutPrefix = relativePath.replace(/^image[/\\]/, '')
  return `/blog-images/${withoutPrefix.replace(/\\/g, '/')}`
}

function destPathFromPastedRelative(relativePath) {
  const withoutPrefix = relativePath.replace(/^image[/\\]/, '')
  return join(PUBLIC_IMAGES_DIR, ...withoutPrefix.split(/[/\\]/))
}

function collectExistingWebPaths() {
  const paths = new Set()

  for (const file of readdirSync(BLOGS_DIR)) {
    if (!file.endsWith('.md')) continue
    const content = readFileSync(join(BLOGS_DIR, file), 'utf8')
    for (const match of content.matchAll(/\/blog-images\/[^\s)"']+/g)) {
      paths.add(match[0])
    }
  }

  if (existsSync(PUBLIC_IMAGES_DIR)) {
    walkPublicImages(PUBLIC_IMAGES_DIR, '/blog-images', paths)
  }

  return paths
}

function walkPublicImages(dir, webPrefix, paths) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      walkPublicImages(fullPath, `${webPrefix}/${entry.name}`, paths)
    } else if (entry.isFile()) {
      paths.add(`${webPrefix}/${entry.name}`)
    }
  }
}

function finalizeImport({ trimmed, webPath, destPath, sourcePath, existingWebPaths, stats, label }) {
  if (existingWebPaths.has(webPath) || existsSync(destPath)) {
    if (!IMPORTED_IMAGE_RE.test(trimmed)) {
      stats.rewrittenExisting += 1
      existingWebPaths.add(webPath)
      return { line: `![](${webPath})`, changed: true }
    }
    stats.skipped += 1
    return { line: null, changed: false }
  }

  if (!existsSync(sourcePath)) {
    stats.missing += 1
    console.warn(`  missing source: ${sourcePath}`)
    return { line: null, changed: false }
  }

  mkdirSync(dirname(destPath), { recursive: true })
  copyFileSync(sourcePath, destPath)
  existingWebPaths.add(webPath)
  stats.copied += 1
  console.log(`  copied: ${label} → ${webPath}`)
  return { line: `![](${webPath})`, changed: true }
}

function processLine(trimmed, postKey, existingWebPaths, stats) {
  if (IMPORTED_IMAGE_RE.test(trimmed)) {
    return { line: null, changed: false }
  }

  const pastedMatch = trimmed.match(PASTED_IMAGE_RE)
  if (pastedMatch) {
    const relativePath = pastedMatch[1]
    const sourcePath = join(BLOGS_DIR, ...relativePath.split(/[/\\]/))
    const webPath = webPathFromPastedRelative(relativePath)
    const destPath = destPathFromPastedRelative(relativePath)
    const result = finalizeImport({
      trimmed,
      webPath,
      destPath,
      sourcePath,
      existingWebPaths,
      stats,
      label: relativePath,
    })
    return result
  }

  const imageFilename = parseDownloadPlaceholder(trimmed)
  if (imageFilename) {
    const sourcePath = join(SOURCE_DIR, imageFilename)
    const webPath = webPathFor(postKey, imageFilename)
    const destPath = destPathFor(postKey, imageFilename)
    return finalizeImport({
      trimmed,
      webPath,
      destPath,
      sourcePath,
      existingWebPaths,
      stats,
      label: imageFilename,
    })
  }

  return { line: null, changed: false }
}

function processMarkdownFile(filePath, existingWebPaths, stats) {
  const postKey = postKeyFromFilename(basename(filePath))
  const original = readFileSync(filePath, 'utf8')
  const lines = original.split(/\r?\n/)
  let changed = false

  const nextLines = lines.map((line) => {
    const trimmed = line.trim()
    const { line: replacement, changed: lineChanged } = processLine(
      trimmed,
      postKey,
      existingWebPaths,
      stats,
    )
    if (lineChanged && replacement != null) {
      changed = true
      return replacement
    }
    return line
  })

  if (changed) {
    writeFileSync(filePath, `${nextLines.join('\n')}\n`, 'utf8')
    stats.filesUpdated += 1
  }

  return changed
}

function main() {
  let entries = []
  try {
    entries = readdirSync(BLOGS_DIR).filter((name) => name.endsWith('.md'))
  } catch {
    console.warn('blogs/ folder not found — nothing to import')
    return
  }

  const stats = {
    copied: 0,
    skipped: 0,
    missing: 0,
    rewrittenExisting: 0,
    filesUpdated: 0,
  }

  const existingWebPaths = collectExistingWebPaths()

  for (const file of entries) {
    processMarkdownFile(join(BLOGS_DIR, file), existingWebPaths, stats)
  }

  const parts = []
  if (stats.copied) parts.push(`${stats.copied} copied`)
  if (stats.rewrittenExisting) parts.push(`${stats.rewrittenExisting} markdown line(s) fixed`)
  if (stats.skipped) parts.push(`${stats.skipped} already imported`)
  if (stats.missing) parts.push(`${stats.missing} missing source file(s)`)
  if (stats.filesUpdated) parts.push(`${stats.filesUpdated} blog file(s) updated`)

  if (parts.length) {
    console.log(`Blog screenshots: ${parts.join(', ')}`)
  } else {
    console.log('Blog screenshots: nothing to import')
  }
}

main()
