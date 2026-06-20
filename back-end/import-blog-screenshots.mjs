/**
 * Scans blogs/*.md for local media that needs importing:
 *
 * 1. Local absolute paths on D:/ (images or videos)
 *    Accepts plain paths, `backticks`, "quotes", 'quotes', or ![](path).
 *    Videos are captured as a JPG screenshot at the midpoint of the clip.
 * 2. Pasted markdown images: ![alt](image/{post}/file.png)
 *
 * Copies into public/blog-images/ and rewrites lines as ![]({webPath}).
 *
 * Run: npm run import-blog-screenshots
 * Idempotent — safe to run on every build.
 */

import { execSync } from 'node:child_process'
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

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.mkv'])
const LOCAL_PATH_IN_MD_RE = /^!\[[^\]]*\]\((D:[/\\][^)\s]+)\)\s*$/i
const LOCAL_PATH_RE =
  /^D:[/\\].+[/\\][^/\\]+\.(jpg|jpeg|png|webp|gif|mp4|webm|mov|mkv)$/i
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

function isVideoExtension(ext) {
  return VIDEO_EXTENSIONS.has(ext.toLowerCase())
}

function isImageExtension(ext) {
  return IMAGE_EXTENSIONS.has(ext.toLowerCase())
}

/** @returns {{ sourcePath: string, destFilename: string, isVideo: boolean, label: string } | null} */
function parseLocalMediaPath(trimmed) {
  const mdMatch = trimmed.match(LOCAL_PATH_IN_MD_RE)
  const unwrapped = stripOuterWrappers(trimmed)
  const sourcePath = mdMatch?.[1] ?? (LOCAL_PATH_RE.test(unwrapped) ? unwrapped : null)
  if (!sourcePath) return null

  const ext = extname(sourcePath).toLowerCase()
  const isVideo = isVideoExtension(ext)
  const isImage = isImageExtension(ext)
  if (!isVideo && !isImage) return null

  const label = basename(sourcePath)
  const destFilename = isVideo ? `${basename(label, ext)}.jpg` : label

  return { sourcePath, destFilename, isVideo, label }
}

function getVideoDurationSeconds(sourcePath) {
  const quoted = `"${sourcePath.replace(/"/g, '\\"')}"`
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${quoted}`,
    { encoding: 'utf8' },
  ).trim()
  const duration = Number.parseFloat(out)
  return Number.isFinite(duration) ? duration : 0
}

function screenshotVideoAtMiddle(sourcePath, destPath) {
  const duration = getVideoDurationSeconds(sourcePath)
  const seek = Math.max(0, duration / 2)
  const sourceQuoted = `"${sourcePath.replace(/"/g, '\\"')}"`
  const destQuoted = `"${destPath.replace(/"/g, '\\"')}"`
  execSync(
    `ffmpeg -y -ss ${seek} -i ${sourceQuoted} -frames:v 1 -q:v 2 ${destQuoted}`,
    { stdio: 'pipe' },
  )
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

function finalizeImport({
  trimmed,
  webPath,
  destPath,
  sourcePath,
  existingWebPaths,
  stats,
  label,
  isVideo = false,
}) {
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
  if (isVideo) {
    screenshotVideoAtMiddle(sourcePath, destPath)
    stats.videoScreenshots += 1
    console.log(`  video screenshot: ${label} → ${webPath}`)
  } else {
    copyFileSync(sourcePath, destPath)
    stats.copied += 1
    console.log(`  copied: ${label} → ${webPath}`)
  }
  existingWebPaths.add(webPath)
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

  const localMedia = parseLocalMediaPath(trimmed)
  if (localMedia) {
    const { sourcePath, destFilename, isVideo, label } = localMedia
    const webPath = webPathFor(postKey, destFilename)
    const destPath = destPathFor(postKey, destFilename)
    return finalizeImport({
      trimmed,
      webPath,
      destPath,
      sourcePath,
      existingWebPaths,
      stats,
      label,
      isVideo,
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
    videoScreenshots: 0,
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
  if (stats.videoScreenshots) parts.push(`${stats.videoScreenshots} video screenshot(s)`)
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
