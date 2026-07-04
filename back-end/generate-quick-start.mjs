/**
 * Generate quickStart HTML for each extension from Chrome Web Store descriptions.
 * Writes into apps-custom-data.json; sync-apps-custom-data merges into apps.json.
 */

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const APPS_JSON = path.join(ROOT, 'src/data/apps.json')
const CUSTOM_JSON = path.join(ROOT, 'src/data/apps-custom-data.json')

const TOOLBAR_IMG =
  '<img src="/images/extension-toolbar-hint.jpg" alt="Click the extension icon in the Chrome toolbar" width="320" loading="lazy" />'

const GENERATOR_VERSION = '4'

const PIN_STEP =
  'Pin the extension icon in Chrome\u2019s toolbar for quick access (click the puzzle piece, then pin).'

const HOW_IT_WORKS_HEADER =
  /^how\s+(does\s+it\s+work|it\s+works?|to\s+use)\s*$/i

const POPUP_RE =
  /\b(open the (extension )?popup|click the extension icon|open the extension|extension popup|extension menu)\b/i

/** Strip markdown/formatting but keep the full instruction text. */
function normalizeStepText(raw) {
  return String(raw ?? '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^[\s•\-\*✅☑️🔍📄🔄👁📍⚡📥📊]+/u, '')
    .replace(/^\d+[\.\)]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isSectionHeader(line) {
  const t = line.trim()
  if (!t) return false
  if (HOW_IT_WORKS_HEADER.test(t)) return false
  if (/^(who is this for|is it free|is it secure|feedback|privacy|features|filter by|what it does)/i.test(t)) {
    return true
  }
  return /^[A-Z][A-Z0-9\s/&'\-–—:?!]{3,}[?!]?$/.test(t)
}

function extractInstructionBlock(full) {
  const lines = full.split('\n')
  let start = -1

  for (let i = 0; i < lines.length; i++) {
    if (HOW_IT_WORKS_HEADER.test(lines[i].trim())) {
      start = i + 1
      break
    }
  }

  if (start < 0) return []

  const block = []
  for (let i = start; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (!trimmed) {
      if (block.length) continue
      continue
    }
    if (block.length && isSectionHeader(trimmed)) {
      break
    }
    block.push(trimmed)
  }

  return block
}

function parseNumberedRun(block) {
  const steps = []
  let inRun = false

  for (const line of block) {
    const numbered = line.match(/^(\d+)[\.\)]\s+(.+)$/)
    if (numbered) {
      inRun = true
      const text = normalizeStepText(numbered[2])
      if (text) steps.push(text)
    } else if (inRun && line.trim()) {
      break
    }
  }

  return steps
}

function parseBulletRun(block) {
  const steps = []

  for (const line of block) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (steps.length) break
      continue
    }
    if (/^[•\-\*]/.test(trimmed)) {
      const text = normalizeStepText(trimmed)
      if (text) steps.push(text)
    } else if (steps.length) {
      break
    }
  }

  return steps
}

function parseStepsFromBlock(block) {
  const numbered = parseNumberedRun(block)
  if (numbered.length >= 2) return numbered

  const bullets = parseBulletRun(block)
  if (bullets.length >= 2) return bullets

  if (numbered.length) return numbered
  return bullets
}

function extractNumberedStepsFromFull(full) {
  return [...full.matchAll(/^\s*\d+[\.\)]\s+(.+)$/gm)]
    .map((m) => normalizeStepText(m[1]))
    .filter(Boolean)
}

/** Pull verbatim usage steps from the store description when present. */
function parseDescriptionSteps(full, short) {
  const block = extractInstructionBlock(full)
  let steps = parseStepsFromBlock(block)

  if (steps.length >= 2) return steps

  const numbered = extractNumberedStepsFromFull(full)
  if (numbered.length >= 2) return numbered

  if (steps.length) return steps

  if (numbered.length) return numbered

  if (short) {
    const sentence = normalizeStepText(short.split(/[.!?]/)[0])
    if (sentence) return [sentence]
  }

  return []
}

function stepNeedsToolbarImage(text) {
  if (/^pin the extension/i.test(text.trim())) return false
  return POPUP_RE.test(text)
}

function buildStepLi(text, forceImage = false) {
  const body = escapeHtml(text)
  const img = forceImage || stepNeedsToolbarImage(text) ? ` ${TOOLBAR_IMG}` : ''
  return `<li>${body}${img}</li>`
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildQuickStartHtml(full, short) {
  const usageSteps = parseDescriptionSteps(full, short)

  if (usageSteps.length >= 2) {
    return `<ul>${usageSteps.map((text) => buildStepLi(text)).join('')}</ul>`
  }

  const items = [{ text: PIN_STEP }]
  items.push({
    text: 'Click the extension icon in your toolbar to open it.',
    image: true,
  })

  for (const step of usageSteps) {
    items.push({ text: step })
  }

  if (items.length < 3 && short) {
    const feature = normalizeStepText(
      short.split(/[.!?]/).find((s) => s.trim().length > 20) ?? short,
    )
    if (feature) items.push({ text: feature })
  }

  return `<ul>${items.map((s) => buildStepLi(s.text, s.image)).join('')}</ul>`
}

function descriptionHash(slug, full) {
  return crypto
    .createHash('sha256')
    .update(`${GENERATOR_VERSION}|${slug}|${full ?? ''}`)
    .digest('hex')
    .slice(0, 16)
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function main() {
  if (!fs.existsSync(APPS_JSON)) {
    console.warn(`No ${path.relative(ROOT, APPS_JSON)} — skipping quick-start generation`)
    return
  }

  const appsPayload = loadJson(APPS_JSON)
  const customPayload = fs.existsSync(CUSTOM_JSON)
    ? loadJson(CUSTOM_JSON)
    : { apps: [] }

  const customApps = customPayload.apps ?? []
  const appsList = appsPayload.apps ?? []
  const appBySlug = new Map(appsList.map((a) => [a.slug, a]))
  const appById = new Map(appsList.map((a) => [a.chromeExtensionId, a]))
  const matchedSlugs = new Set()

  let updated = 0
  let skipped = 0

  for (const entry of customApps) {
    const app = appBySlug.get(entry.slug) ?? appById.get(entry.id)
    if (!app) continue

    matchedSlugs.add(app.slug)
    const full = app.description?.full ?? ''
    const short = app.description?.short ?? app.tagline ?? ''
    const hash = descriptionHash(app.slug, full)

    if (entry.quickStart && entry.quickStartHash === hash) {
      skipped++
      continue
    }

    entry.quickStart = buildQuickStartHtml(full, short)
    entry.quickStartHash = hash
    updated++
    console.log(`quickStart: ${app.slug} (${hash})`)
  }

  for (const app of appsList) {
    if (matchedSlugs.has(app.slug)) continue

    const full = app.description?.full ?? ''
    const short = app.description?.short ?? app.tagline ?? ''
    const hash = descriptionHash(app.slug, full)

    customApps.push({
      id: app.chromeExtensionId,
      slug: app.slug,
      quickStart: buildQuickStartHtml(full, short),
      quickStartHash: hash,
    })
    updated++
    console.log(`quickStart: ${app.slug} (${hash}) [new entry]`)
  }

  customPayload.apps = customApps

  if (updated > 0) {
    fs.writeFileSync(CUSTOM_JSON, `${JSON.stringify(customPayload, null, 2)}\n`, 'utf8')
    console.log(
      `Updated ${path.relative(ROOT, CUSTOM_JSON)} — ${updated} quickStart(s), ${skipped} unchanged`,
    )
  } else {
    console.log(`quickStart: all ${skipped} extension(s) up to date`)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}

export { buildQuickStartHtml, descriptionHash, parseDescriptionSteps }
