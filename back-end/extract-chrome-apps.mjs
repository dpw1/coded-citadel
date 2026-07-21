/**
 * Parse Chrome Web Store dev console HTML exports → src/data/apps.json
 * Run: node back-end/extract-chrome-apps.mjs
 *
 * After writing apps.json, prints a summary and asks to move HTML to processed_html/
 * (Windows: Yes/No dialog). Set SKIP_HTML_MOVE_CONFIRM=1 or CI=true to skip and always move.
 */

import { execFileSync } from 'node:child_process'
import fs from 'fs'
import path from 'path'
import readline from 'node:readline/promises'
import { fileURLToPath } from 'url'
import { dedupeAnalyticsObject, dedupeAppsAnalytics } from './analytics-series-utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const HTML_DIR = path.join(ROOT, 'chrome-extension-html/html')
const PROCESSED_HTML_DIR = path.join(ROOT, 'chrome-extension-html/processed_html')
const APPS_JSON = path.join(ROOT, 'src/data/apps.json')
const APPS_CUSTOM_DATA_JSON = path.join(ROOT, 'src/data/apps-custom-data.json')

/** Each Chrome extension export batch: edit + installs + users + impressions. */
export const HTML_FILES_PER_APP = 4

const REQUIRED_HTML_PAGES = [
  'edit',
  'analytics_installs',
  'analytics_users',
  'analytics_impressions',
]
const APPS_EXAMPLE = path.join(ROOT, 'chrome-extension-html/apps-example.json')
const DB_JSON = path.join(ROOT, 'chrome-extension-html/db.json')

/** Placeholder slug written to apps-custom-data.json until you set the real one. */
const TEMPORARY_EXTENSION_SLUG = 'custom-data'

function stripHtmlTags(text) {
  return text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

/** Package title from edit page: article > section:first-of-type > div:first-of-type > p+p */
export function extractSlugNameFromEdit(html) {
  const fixed = fixEncoding(html)
  const articleMatch = fixed.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)
  const scope = articleMatch ? articleMatch[1] : fixed

  const sectionMatch = scope.match(/<section\b[^>]*>([\s\S]*?)<\/section>/i)
  if (sectionMatch) {
    const divMatch = sectionMatch[1].match(/<div\b[^>]*>([\s\S]*?)<\/div>/i)
    if (divMatch) {
      const ps = [...divMatch[1].matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((m) =>
        stripHtmlTags(m[1]),
      )
      if (ps.length >= 2 && ps[1]) return ps[1]
    }
  }

  const packageTitle = fixed.match(/<p class="HXbL8" jsname="GYcwYe">([^<]+)</)?.[1]
  if (packageTitle) return stripHtmlTags(packageTitle)

  const titleM = fixed.match(/class="pBYElf">([^<]+)</)
  if (titleM) return stripHtmlTags(titleM[1])

  return null
}

export function slugify(name) {
  if (!name) return ''
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
}

/** Chrome extension ID from a Web Store URL (32-char id, with or without a name segment). */
export function extractChromeExtensionId(chromeStoreUrl) {
  if (!chromeStoreUrl) return null
  const withName = chromeStoreUrl.match(/\/detail\/(?:[^/?]+\/)?([a-z0-9]{32})/i)
  if (withName) return withName[1]
  const bare = chromeStoreUrl.match(/\/detail\/([^/?]+)/)
  return bare ? bare[1] : null
}

function loadCustomDataMap() {
  if (!fs.existsSync(APPS_CUSTOM_DATA_JSON)) {
    console.error(
      `Missing ${path.relative(ROOT, APPS_CUSTOM_DATA_JSON)} — add Chrome extension ID entries before extracting.`,
    )
    process.exit(1)
  }

  let data
  try {
    data = JSON.parse(fs.readFileSync(APPS_CUSTOM_DATA_JSON, 'utf8'))
  } catch (err) {
    console.error(`Could not parse ${path.relative(ROOT, APPS_CUSTOM_DATA_JSON)}:`, err.message)
    process.exit(1)
  }

  const map = new Map()
  const entries = data.apps ?? data.slugs ?? []
  for (const entry of entries) {
    if (entry?.id) {
      map.set(entry.id, entry)
    }
  }

  if (!map.size || ![...map.values()].some((e) => e.slug)) {
    console.error(
      `${path.relative(ROOT, APPS_CUSTOM_DATA_JSON)} needs app entries with "id" and "slug" — e.g. { "id": "…", "slug": "…" }.`,
    )
    process.exit(1)
  }

  return map
}

function readAppsCustomDataFile() {
  return JSON.parse(fs.readFileSync(APPS_CUSTOM_DATA_JSON, 'utf8'))
}

function writeAppsCustomDataFile(data) {
  fs.writeFileSync(APPS_CUSTOM_DATA_JSON, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

/** Pick a temporary slug and persist a new apps-custom-data.json entry for unknown extensions. */
function ensureCustomDataSlug(id, customMap) {
  const existing = customMap.get(id)
  if (existing?.slug) return existing.slug

  const usedSlugs = new Set(
    [...customMap.values()].map((e) => e.slug).filter(Boolean),
  )
  let slug = TEMPORARY_EXTENSION_SLUG
  if (usedSlugs.has(slug)) {
    slug = `${TEMPORARY_EXTENSION_SLUG}-${id.slice(0, 8)}`
  }

  const entry = { id, slug }
  const data = readAppsCustomDataFile()
  if (!data.apps) data.apps = []
  data.apps.push(entry)
  writeAppsCustomDataFile(data)
  customMap.set(id, entry)

  console.warn(
    `Temporary slug "${slug}" added to ${path.relative(ROOT, APPS_CUSTOM_DATA_JSON)} for ${id} — replace with the final slug and metadata when ready.`,
  )
  return slug
}

/** Merge manual fields from apps-custom-data.json (slug, created display string, overrides, etc.). */
function applyCustomDataToApp(app, custom) {
  if (!custom) return app
  for (const [key, value] of Object.entries(custom)) {
    if (key === 'id' || value === undefined) continue
    if (key === 'buildStory' && value && typeof value === 'object' && !Array.isArray(value)) {
      app.buildStory = { ...(app.buildStory ?? {}), ...value }
      continue
    }
    app[key] = value
  }
  return app
}

function emptyAnalytics() {
  return {
    totalInstalls: 0,
    installations: [],
    weeklyUsers: [],
    weeklyUsersByRegion: {},
    installsByRegion: {},
    uninstalls: 0,
    uninstallsOverTime: [],
    uninstallsByRegion: {},
    pageViews: 0,
    pageViewsOverTime: [],
    pageViewsBySource: {},
    impressions: 0,
    impressionsAcrossChromeWebStore: [],
    enabledVsDisabled: {
      enabled: 0,
      disabled: 0,
      enabledPct: 0,
      disabledPct: 0,
      total: 0,
      date: null,
      slices: [],
    },
    enabledVsDisabledOverTime: [],
  }
}

function hasMeaningfulAnalytics(analytics) {
  if (!analytics) return false
  return (
    (analytics.totalInstalls ?? 0) > 0 ||
    (analytics.weeklyUsers?.length ?? 0) > 0 ||
    (analytics.enabledVsDisabled?.enabled ?? 0) > 0 ||
    (analytics.pageViews ?? 0) > 0 ||
    (analytics.impressions ?? 0) > 0
  )
}

const CATEGORY_MAP = {
  CATEGORY_TOOLS: 'Productivity',
  CATEGORY_PRODUCTIVITY: 'Productivity',
}

/** Fix common UTF-8 misinterpreted as Latin-1 (Chrome export HTML). */
function decodeHtmlEntities(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
}

export function fixEncoding(text) {
  if (!text) return text
  return decodeHtmlEntities(
    text
    .replace(/â€¢/g, '•')
    .replace(/â€"/g, '\u201c')
    .replace(/â€/g, '\u201d')
    .replace(/â€™/g, "'")
    .replace(/â€"/g, '\u2014')
    .replace(/â€"/g, '\u2013')
    .replace(/Ã©/g, 'é')
    .replace(/Ã£/g, 'ã')
    .replace(/Ã§/g, 'ç')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã­/g, 'í')
    .replace(/Ãª/g, 'ê')
    .replace(/Ãµ/g, 'õ')
    .replace(/Ã /g, 'à')
    .replace(/Ã‰/g, 'É')
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n/g, '\n'),
  )
}

function extensionIdFromEntry(entry) {
  if (!Array.isArray(entry)) return null
  if (typeof entry[0] === 'string' && entry[0].length > 10) return entry[0]
  if (Array.isArray(entry[0])) {
    return entry[0].filter((c) => typeof c === 'string').join('')
  }
  return null
}

export function parseAfCallbacks(html) {
  const out = {}
  for (const m of html.matchAll(
    /AF_initDataCallback\(\{key:\s*'([^']+)'[\s\S]*?data:(\[[\s\S]*?\])\s*,\s*sideChannel/g,
  )) {
    try {
      out[m[1]] = JSON.parse(m[2])
    } catch {
      /* skip malformed */
    }
  }
  return out
}

function parseFilename(name) {
  const m = name.match(
    /^(?:chrome-analytics-data--)?([a-z]{32})--([a-z_]+)--(\d{2})-(\d{2})\.html$/i,
  )
  if (!m) return null
  return { id: m[1], page: m[2], day: m[3], month: m[4], date: `2026-${m[4]}-${m[3]}` }
}

export function listHtmlFiles() {
  if (!fs.existsSync(HTML_DIR)) return []
  return fs.readdirSync(HTML_DIR).filter((f) => f.endsWith('.html'))
}

function moveHtmlToProcessed(files) {
  fs.mkdirSync(PROCESSED_HTML_DIR, { recursive: true })
  for (const file of files) {
    const src = path.join(HTML_DIR, file)
    let dest = path.join(PROCESSED_HTML_DIR, file)
    if (fs.existsSync(dest)) {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-')
      dest = path.join(PROCESSED_HTML_DIR, `${stamp}--${file}`)
    }
    fs.renameSync(src, dest)
  }
  console.log(`Moved ${files.length} HTML export(s) to ${PROCESSED_HTML_DIR}`)
}

function groupByExtension(files) {
  const groups = {}
  for (const file of files) {
    const meta = parseFilename(file)
    if (!meta) continue
    if (!groups[meta.id]) groups[meta.id] = { date: meta.date }
    groups[meta.id][meta.page] = path.join(HTML_DIR, file)
  }
  return groups
}

/**
 * Ensures HTML batch size matches app count (N files ⇒ N÷4 apps) and every extension has all 4 pages.
 * @throws {Error} when counts or grouping do not line up
 */
export function assertHtmlBatchMatchesApps(files, groups, apps) {
  const fileCount = files.length

  if (fileCount % HTML_FILES_PER_APP !== 0) {
    throw new Error(
      `Expected a multiple of ${HTML_FILES_PER_APP} HTML files in ${path.relative(ROOT, HTML_DIR)} (one set per app: edit, installs, users, impressions), but found ${fileCount}.`,
    )
  }

  const expectedAppCount = fileCount / HTML_FILES_PER_APP

  const unparseable = files.filter((f) => !parseFilename(f))
  if (unparseable.length) {
    throw new Error(
      `Could not parse ${unparseable.length} HTML filename(s) (expected chrome-analytics-data--{id}--{page}--{dd}-{mm}.html): ${unparseable.join(', ')}`,
    )
  }

  const extensionIds = Object.keys(groups)
  if (extensionIds.length !== expectedAppCount) {
    throw new Error(
      `Found ${fileCount} HTML file(s) (${expectedAppCount} app(s) expected), but grouped ${extensionIds.length} extension ID(s). Check for duplicate or mixed export dates in the same folder.`,
    )
  }

  for (const id of extensionIds) {
    const pages = groups[id]
    const missing = REQUIRED_HTML_PAGES.filter((page) => !pages[page])
    if (missing.length) {
      throw new Error(
        `Extension ${id} is missing ${missing.length} required HTML page(s): ${missing.join(', ')} (each app needs exactly ${HTML_FILES_PER_APP} files).`,
      )
    }
  }

  if (apps.length !== expectedAppCount) {
    throw new Error(
      `Expected ${expectedAppCount} app(s) in apps.json (${fileCount} HTML files ÷ ${HTML_FILES_PER_APP}), but only ${apps.length} were produced. Ensure every extension has an entry with "slug" in apps-custom-data.json and was not skipped.`,
    )
  }
}

/** Locate `[["YYYY-MM-DD", …], …]` regardless of ds:N layout (data[1] vs data[2]). */
function dailySeriesEntries(data) {
  if (!Array.isArray(data)) return []
  for (let i = 1; i < data.length; i++) {
    const block = data[i]
    if (!Array.isArray(block) || !block.length) continue
    const first = block[0]
    if (Array.isArray(first) && typeof first[0] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(first[0])) {
      return block
    }
  }
  return []
}

/** Sum daily series like [["2026-05-16",[[1,[[3,2,"INSTALLS"]]]]], ...] */
function sumMetricSeries(data, metricType) {
  const byDate = {}
  if (!data) return { total: 0, byDate, weekly: [] }

  for (const day of dailySeriesEntries(data)) {
    if (!Array.isArray(day) || day.length < 2) continue
    const date = day[0]
    let count = 0
    const walk = (node) => {
      if (!Array.isArray(node)) return
      if (node.length >= 3 && node[2] === metricType && typeof node[1] === 'number') {
        count += node[1]
      }
      for (const child of node) walk(child)
    }
    walk(day[1])
    byDate[date] = count
  }

  const total = Object.values(byDate).reduce((a, b) => a + b, 0)
  const weekly = aggregateDailyToWeekly(byDate)
  return { total, byDate, weekly }
}

function sumDimensionSeries(data, dimensionKey) {
  const totals = {}
  if (!data) return totals

  for (const day of dailySeriesEntries(data)) {
    if (!Array.isArray(day) || day.length < 2) continue
    const walk = (node) => {
      if (!Array.isArray(node)) return
      if (node.length >= 3 && node[0] === dimensionKey && typeof node[1] === 'number') {
        const label = String(node[2])
        totals[label] = (totals[label] || 0) + node[1]
      }
      for (const child of node) walk(child)
    }
    walk(day[1])
  }
  return totals
}

function byDateToSeries(byDate) {
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([iso, total]) => ({ date: isoToDdMmYyyy(iso), total }))
}

function mergeSeriesByIso(...seriesList) {
  const byIso = {}
  for (const series of seriesList) {
    for (const row of series) {
      const iso = ddMmYyyyToIso(row.date)
      byIso[iso] = row.total
    }
  }
  return byDateToSeries(byIso)
}

/** Chrome labels: "Item desativado" must be checked before "Item ativado" (substring trap). */
export function classifyEnabledLabel(label) {
  const text = fixEncoding(String(label ?? '')).toLowerCase()
  if (/desativado|disabled/i.test(text)) return 'disabled'
  if (/ativado|enabled/i.test(text)) return 'enabled'
  return null
}

export function parseEnabledVsDisabled(totals) {
  const out = { enabled: 0, disabled: 0 }
  for (const [label, count] of Object.entries(totals ?? {})) {
    const key = classifyEnabledLabel(label)
    if (key) out[key] += count
  }
  return out
}

function sumDimensionSeriesForDay(dayNode, dimensionKey) {
  const totals = {}
  if (!Array.isArray(dayNode) || dayNode.length < 2) return totals

  const walk = (node) => {
    if (!Array.isArray(node)) return
    if (node.length >= 3 && node[0] === dimensionKey && typeof node[1] === 'number') {
      const label = String(node[2])
      totals[label] = (totals[label] || 0) + node[1]
    }
    for (const child of node) walk(child)
  }
  walk(dayNode[1])
  return totals
}

export function pickLatestEnabledVsDisabledDaily(series) {
  if (!series?.length) return null
  return series.reduce((best, row) => {
    if (!best) return row
    return ddMmYyyyToIso(row.date).localeCompare(ddMmYyyyToIso(best.date)) > 0 ? row : best
  })
}

export function extractEnabledVsDisabledDailyFromAf(usersAf) {
  const data = usersAf?.['ds:3']
  const series = []

  for (const day of dailySeriesEntries(data)) {
    const totals = sumDimensionSeriesForDay(day, 'ENABLED_AND_DISABLED')
    const counts = parseEnabledVsDisabled(totals)
    if (!counts.enabled && !counts.disabled) continue

    const total = counts.enabled + counts.disabled
    series.push({
      date: isoToDdMmYyyy(day[0]),
      enabled: counts.enabled,
      disabled: counts.disabled,
      enabledPct: total ? +((counts.enabled / total) * 100).toFixed(1) : 0,
      disabledPct: total ? +((counts.disabled / total) * 100).toFixed(1) : 0,
      total,
    })
  }

  series.sort((a, b) => ddMmYyyyToIso(a.date).localeCompare(ddMmYyyyToIso(b.date)))
  return series
}

/**
 * Parse enabled/disabled donut slices from a Chrome users-page SVG (regex; Node-safe).
 * Percentages come from tick-line rotate() angles vs 360°.
 */
export function extractDonutSlicesFromSvgString(svgHtml) {
  const paths = []
  const pathRe = /<path\b[^>]*>/gi
  let pathMatch

  while ((pathMatch = pathRe.exec(svgHtml)) !== null) {
    const tag = pathMatch[0]
    const dataId = tag.match(/data-id="([^"]*)"/)?.[1]
    if (!dataId) continue
    const key = classifyEnabledLabel(dataId)
    if (!key) continue
    paths.push({
      dataId: fixEncoding(dataId),
      key,
      fill: tag.match(/fill="([^"]*)"/)?.[1] ?? null,
    })
  }

  if (!paths.length) return null

  const angles = []
  const lineRe = /<line\b[^>]*class="[^"]*Zrvljf-VtOx3e[^"]*"[^>]*>/gi
  let lineMatch
  while ((lineMatch = lineRe.exec(svgHtml)) !== null) {
    const tag = lineMatch[0]
    const transform = tag.match(/transform="([^"]*)"/)?.[1] ?? 'rotate(0)'
    const angle = Number.parseFloat(transform.match(/rotate\(([\d.]+)/)?.[1] ?? 0)
    angles.push(angle)
  }
  angles.sort((a, b) => a - b)
  const boundaries = angles.filter((angle, index, arr) => index === 0 || angle !== arr[index - 1])
  if (!boundaries.length || boundaries[0] !== 0) boundaries.unshift(0)
  while (boundaries.length < paths.length + 1) {
    boundaries.push(360)
  }

  const slices = []
  for (let i = 0; i < paths.length; i += 1) {
    const start = boundaries[i] ?? 0
    const end = boundaries[i + 1] ?? 360
    const sweep = end - start
    slices.push({
      ...paths[i],
      percentage: +((sweep / 360) * 100).toFixed(1),
    })
  }

  return slices
}

function parseHumanDateToDdMmYyyy(text) {
  const fixed = fixEncoding(text).trim()
  const m = fixed.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) {
    return `${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}-${m[3]}`
  }

  const months = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
    janeiro: 1,
    fevereiro: 2,
    março: 3,
    abril: 4,
    maio: 5,
    junho: 6,
    julho: 7,
    agosto: 8,
    setembro: 9,
    outubro: 10,
    novembro: 11,
    dezembro: 12,
  }

  const named = fixed.match(/(\d{1,2})\s+de\s+(\p{L}+)\s+de\s+(\d{4})/iu)
  if (named) {
    const month = months[named[2].toLowerCase()]
    if (month) {
      return `${named[1].padStart(2, '0')}-${String(month).padStart(2, '0')}-${named[3]}`
    }
  }

  const en = fixed.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/)
  if (en) {
    const month = months[en[1].toLowerCase()]
    if (month) {
      return `${en[2].padStart(2, '0')}-${String(month).padStart(2, '0')}-${en[3]}`
    }
  }

  return null
}

function extractDateNearIndex(html, index) {
  const before = html.slice(Math.max(0, index - 2500), index)
  const deh = [...before.matchAll(/class="DehJj">([^<]+)</g)]
  if (deh.length) {
    const parsed = parseHumanDateToDdMmYyyy(deh[deh.length - 1][1])
    if (parsed) return parsed
  }
  return null
}

function exportDateToDdMmYyyy(exportDate) {
  if (!exportDate) return null
  const iso = String(exportDate).slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  return isoToDdMmYyyy(iso)
}

function buildEnabledVsDisabledSnapshot({ counts, slices, date }) {
  const enabledSlice = slices?.find((s) => s.key === 'enabled')
  const disabledSlice = slices?.find((s) => s.key === 'disabled')
  let enabledPct = enabledSlice?.percentage ?? null
  let disabledPct = disabledSlice?.percentage ?? null

  let enabled = counts.enabled
  let disabled = counts.disabled
  let total = enabled + disabled

  if (slices?.length && total > 0 && (enabledPct != null || disabledPct != null)) {
    enabledPct ??= disabledPct != null ? +(100 - disabledPct).toFixed(1) : 0
    disabledPct ??= +(100 - enabledPct).toFixed(1)
    enabled = Math.round((total * enabledPct) / 100)
    disabled = Math.max(0, total - enabled)
  } else if (total > 0) {
    enabledPct = +((enabled / total) * 100).toFixed(1)
    disabledPct = +((disabled / total) * 100).toFixed(1)
  } else {
    enabledPct ??= 0
    disabledPct ??= 0
  }

  return {
    enabled,
    disabled,
    enabledPct,
    disabledPct,
    total,
    date: date ?? null,
    slices:
      slices?.map((slice) => ({
        key: slice.key,
        label: slice.dataId,
        percentage: slice.percentage,
        fill: slice.fill,
      })) ?? [],
  }
}

export function extractEnabledVsDisabledFromUsersHtml(usersHtml, exportDate) {
  if (!usersHtml) return null

  const svgRe = /<svg\b[\s\S]*?<\/svg>/gi
  let match
  let best = null

  while ((match = svgRe.exec(usersHtml)) !== null) {
    const svg = match[0]
    const slices = extractDonutSlicesFromSvgString(svg)
    if (!slices?.length) continue
    if (!slices.some((s) => s.key === 'enabled' || s.key === 'disabled')) continue

    const date =
      extractDateNearIndex(usersHtml, match.index) ?? exportDateToDdMmYyyy(exportDate)
    best = { slices, date }
    break
  }

  return best
}

export function resolveEnabledVsDisabled(usersHtml, usersAf, exportDate) {
  const overTime = extractEnabledVsDisabledDailyFromAf(usersAf)
  const fromSvg = extractEnabledVsDisabledFromUsersHtml(usersHtml, exportDate)
  const latestDaily = pickLatestEnabledVsDisabledDaily(overTime)

  let counts = {
    enabled: latestDaily?.enabled ?? 0,
    disabled: latestDaily?.disabled ?? 0,
  }

  // Fallback: single-day AF parse (never sum across all days — that inflates totals).
  if (!counts.enabled && !counts.disabled) {
    const days = dailySeriesEntries(usersAf?.['ds:3'])
    const lastDay = days.length ? days[days.length - 1] : null
    if (lastDay) {
      counts = parseEnabledVsDisabled(
        sumDimensionSeriesForDay(lastDay, 'ENABLED_AND_DISABLED'),
      )
    }
  }

  const enabledVsDisabled = buildEnabledVsDisabledSnapshot({
    counts,
    slices: fromSvg?.slices ?? null,
    date: latestDaily?.date ?? fromSvg?.date ?? exportDateToDdMmYyyy(exportDate),
  })

  return {
    enabledVsDisabled,
    enabledVsDisabledOverTime: overTime,
  }
}

function sskMatchesSeries(sskLower, patterns) {
  return patterns.some((p) => sskLower.includes(p))
}

/** Aggregate COUNTRY dimension from ds:4 style data */
function sumCountrySeries(data) {
  const regions = {}
  if (!Array.isArray(data) || !Array.isArray(data[2])) return regions

  for (const day of data[2]) {
    if (!Array.isArray(day) || day.length < 2) continue
    const walk = (node) => {
      if (!Array.isArray(node)) return
      if (node[0] === 'COUNTRY' && typeof node[1] === 'number' && typeof node[2] === 'string') {
        const code = countryNameToCode(node[2])
        if (code) regions[code] = (regions[code] || 0) + node[1]
      }
      for (const child of node) walk(child)
    }
    walk(day[1])
  }
  return regions
}

function countryNameToCode(name) {
  const fixed = fixEncoding(name)
  const map = {
    'Estados Unidos': 'US',
    'United States': 'US',
    Brasil: 'BR',
    Brazil: 'BR',
    Índia: 'IN',
    India: 'IN',
    'Reino Unido': 'GB',
    'United Kingdom': 'GB',
    Alemanha: 'DE',
    Germany: 'DE',
    Canadá: 'CA',
    Canada: 'CA',
    Austrália: 'AU',
    Australia: 'AU',
    Outros: 'other',
    Other: 'other',
  }
  return map[fixed] || null
}

const MONTH_NAMES = {
  janeiro: 1,
  fevereiro: 2,
  março: 3,
  marco: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
}

function isoToDdMmYyyy(iso) {
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

function ddMmYyyyToIso(ddMmYyyy) {
  const [d, m, y] = ddMmYyyy.split('-')
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function isChartOverviewDescription(desc) {
  return /gráfico mostrando|chart showing|um gráfico/i.test(desc)
}

/** Parse "19 de maio de 2026, 5 …" or "May 19, 2026, 5 page views" → { iso, total } */
function parseInstallPointFromDescription(desc) {
  const text = fixEncoding(desc).trim()
  if (!text || isChartOverviewDescription(text)) return null

  let m = text.match(/(\d{1,2})\s+de\s+([a-zA-Zà-úÀ-Ú]+)\.?\s+de\s+(\d{4})[,\s:]+(\d+)/i)
  if (m) {
    const month = MONTH_NAMES[m[2].toLowerCase()]
    if (month) {
      return {
        iso: `${m[3]}-${String(month).padStart(2, '0')}-${m[1].padStart(2, '0')}`,
        total: Number(m[4]),
      }
    }
  }

  m = text.match(
    /(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})[,\s:]+(\d+)/i,
  )
  if (m) {
    const month = MONTH_NAMES[m[1].toLowerCase().slice(0, 3)]
    if (month) {
      return {
        iso: `${m[3]}-${String(month).padStart(2, '0')}-${m[2].padStart(2, '0')}`,
        total: Number(m[4]),
      }
    }
  }

  m = text.match(/(\d{4})-(\d{2})-(\d{2})[,\s:]+(\d+)/)
  if (m) {
    return { iso: `${m[1]}-${m[2]}-${m[3]}`, total: Number(m[4]) }
  }

  return null
}

/**
 * Daily chart points from accessibility labels (installs / users / page views / impressions).
 */
function extractChartSeriesFromAccessible(html, sskPatterns) {
  const byIso = {}
  const tagRe = /<div\b[^>]*>/gi
  let tagMatch

  while ((tagMatch = tagRe.exec(html)) !== null) {
    const tag = tagMatch[0]
    if (!tag.includes('data-accessible-description')) continue

    const desc = tag.match(/data-accessible-description="([^"]*)"/)?.[1]
    const ssk = tag.match(/ssk='([^']*)'/)?.[1] || tag.match(/ssk="([^"]*)"/)?.[1]
    if (!desc || !ssk) continue
    if (!sskMatchesSeries(ssk.toLowerCase(), sskPatterns)) continue

    const point = parseInstallPointFromDescription(desc)
    if (!point) continue

    byIso[point.iso] = point.total
  }

  return byDateToSeries(byIso)
}

/** Chart tooltip templates: `<div class="DehJj">May 6, 2026</div>…<span class="Gqyh1c">0</span>` */
function extractChartSeriesFromTooltips(html, labelPattern) {
  const byIso = {}
  for (const m of html.matchAll(
    /class="DehJj">([^<]+)<[\s\S]{0,500}?class="qckqjc">([^<]+)[\s\S]{0,120}?class="Gqyh1c">(\d+)/g,
  )) {
    const label = fixEncoding(m[2]).trim()
    if (!labelPattern.test(label)) continue
    const point = parseInstallPointFromDescription(`${fixEncoding(m[1]).trim()}, ${m[3]}`)
    if (!point) continue
    byIso[point.iso] = point.total
  }
  return byDateToSeries(byIso)
}

function extractInstallationsFromAccessible(html) {
  const byIso = {}
  const tagRe = /<div\b[^>]*>/gi
  let tagMatch

  while ((tagMatch = tagRe.exec(html)) !== null) {
    const tag = tagMatch[0]
    if (!tag.includes('data-accessible-description')) continue

    const desc = tag.match(/data-accessible-description="([^"]*)"/)?.[1]
    const ssk = tag.match(/ssk='([^']*)'/)?.[1] || tag.match(/ssk="([^"]*)"/)?.[1]
    if (!desc || !ssk) continue

    const sskLower = ssk.toLowerCase()
    const matchesSeries =
      sskLower.includes('page views') ||
      sskLower.includes('total installs') ||
      (sskLower.includes('install') && !sskLower.includes('uninstall'))

    if (!matchesSeries) continue

    const point = parseInstallPointFromDescription(desc)
    if (!point) continue

    byIso[point.iso] = point.total
  }

  return byDateToSeries(byIso)
}

function extractWeeklyUsersSeries(usersHtml, usersAf) {
  const fromAf = byDateToSeries(sumMetricSeries(usersAf['ds:2'], 'WEEKLY_USERS').byDate)
  const fromAccessible = extractChartSeriesFromAccessible(usersHtml, [
    'weekly users',
    'total users',
  ])
  const fromTooltips = extractChartSeriesFromTooltips(usersHtml, /weekly users|total users|usuários semanais/i)
  return mergeSeriesByIso(fromAf, fromAccessible, fromTooltips)
}

function extractPageViewsSeries(impressionsHtml, impAf) {
  const fromAf = byDateToSeries(sumMetricSeries(impAf['ds:6'], 'DETAIL_PAGEVIEWS').byDate)
  const fromAccessible = extractChartSeriesFromAccessible(impressionsHtml, [
    'page views',
    'page view',
    'visualizações de página',
  ])
  const fromTooltips = extractChartSeriesFromTooltips(
    impressionsHtml,
    /page views|visualizações de página/i,
  )
  return mergeSeriesByIso(fromAf, fromAccessible, fromTooltips)
}

function extractImpressionsSeries(impressionsHtml, impAf) {
  const fromAf = byDateToSeries(sumMetricSeries(impAf['ds:5'], 'IMPRESSIONS').byDate)
  const fromAccessible = extractChartSeriesFromAccessible(impressionsHtml, ['impressions', 'impressões'])
  const fromTooltips = extractChartSeriesFromTooltips(
    impressionsHtml,
    /impressions|impressões/i,
  )
  return mergeSeriesByIso(fromAf, fromAccessible, fromTooltips)
}

function extractPageViewsBySource(impAf) {
  const totals = sumDimensionSeries(impAf['ds:4'], 'UTM_SOURCE')
  const out = {}
  for (const [source, count] of Object.entries(totals)) {
    out[source.replace(/\./g, '_')] = count
  }
  return out
}

function installationsFromDs5(html) {
  const af = parseAfCallbacks(html)
  const { byDate } = sumMetricSeries(af['ds:5'], 'INSTALLS')
  return byDateToSeries(byDate)
}

function filterInstallationsLast30Days(installations, endIso) {
  if (!installations.length) return []
  const endDateIso =
    endIso && /^\d{4}-\d{2}-\d{2}$/.test(endIso)
      ? endIso
      : ddMmYyyyToIso(installations[installations.length - 1].date)
  const end = new Date(`${endDateIso}T12:00:00`)
  const start = new Date(end)
  start.setDate(start.getDate() - 30)

  return installations.filter((row) => {
    const d = new Date(`${ddMmYyyyToIso(row.date)}T12:00:00`)
    return d >= start && d <= end
  })
}

function aggregateDailyToWeekly(byDate) {
  const weeks = {}
  for (const [date, count] of Object.entries(byDate)) {
    const d = new Date(`${date}T12:00:00`)
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    const week = d.toISOString().slice(0, 10)
    weeks[week] = (weeks[week] || 0) + count
  }
  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, count }))
}

function topRegions(regions, limit = 5) {
  const entries = Object.entries(regions).filter(([k]) => k !== 'other')
  entries.sort((a, b) => b[1] - a[1])
  const top = Object.fromEntries(entries.slice(0, limit))
  const otherSum =
    entries.slice(limit).reduce((s, [, v]) => s + v, 0) + (regions.other || 0)
  if (otherSum) top.other = otherSum
  return top
}

/** Extract extension listing metadata from ds:1 on edit/analytics pages */
function extractDs1Metadata(ds1, extensionId) {
  if (!Array.isArray(ds1)) return {}

  let extBlock = null
  for (const entry of ds1) {
    if (!Array.isArray(entry)) continue
    const id = extensionIdFromEntry(entry)
    if (id === extensionId && Array.isArray(entry[1])) {
      extBlock = entry[1]
      break
    }
  }

  if (!extBlock) return {}

  const out = {}
  if (typeof extBlock[17] === 'string' && /^\d+\.\d+/.test(extBlock[17])) {
    out.version = extBlock[17]
  }
  if (typeof extBlock[10] === 'string') {
    out.category = CATEGORY_MAP[extBlock[10]] || 'Productivity'
  }

  const listing = extBlock[19]
  if (Array.isArray(listing)) {
    if (listing[2]) out.name = fixEncoding(String(listing[2]))
    if (listing[4]) out.tagline = fixEncoding(String(listing[4]))
    if (listing[5]) out.descriptionShort = fixEncoding(String(listing[5]))
  }

  const detailed = extBlock[31]
  if (typeof detailed === 'string') {
    out.descriptionFull = fixEncoding(detailed)
  }

  return out
}

/** Icon (type 5) and screenshots (type 4) from dev console listing HTML. */
function extractStoreImages(html) {
  const imageKey = (block) =>
    [...(block?.matchAll(/data-image-key="(https:\/\/lh3\.googleusercontent\.com\/[^"]+)"/g) ?? [])].map(
      (m) => m[1],
    )

  const iconBlock = html.match(/data-image-upload-type="5"[\s\S]{0,4000}/)?.[0]
  const chromeExtensionIcon = imageKey(iconBlock)[0] ?? null

  const screenshotUrls = []
  for (const m of html.matchAll(/data-image-upload-type="4"[\s\S]{0,20000}/g)) {
    for (const url of imageKey(m[0])) {
      if (url && url !== chromeExtensionIcon && !screenshotUrls.includes(url)) {
        screenshotUrls.push(url)
      }
    }
  }

  if (!screenshotUrls.length) {
    for (const url of imageKey(html)) {
      if (url && url !== chromeExtensionIcon && !screenshotUrls.includes(url)) {
        screenshotUrls.push(url)
      }
    }
  }

  return { chromeExtensionIcon, screenshots: screenshotUrls }
}

/** Promotional video field on the edit page; ignores Chrome placeholder IDs. */
function extractYoutubeFromEdit(html) {
  const patterns = [
    /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/gi,
    /https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/gi,
    /https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/gi,
  ]
  for (const re of patterns) {
    for (const m of html.matchAll(re)) {
      const id = m[1]
      if (/^1234567890/i.test(id)) continue
      return `https://www.youtube.com/watch?v=${id}`
    }
  }
  return null
}

function extractEditPage(html, extensionId) {
  const fixed = fixEncoding(html)
  const af = parseAfCallbacks(html)
  const fromDs1 = extractDs1Metadata(af['ds:1'], extensionId)

  const out = {
    ...fromDs1,
    chromeStoreUrl: `https://chromewebstore.google.com/detail/${extensionId}`,
    status:
      /Status:\s*[^<]*(?:Publicad|Published|público|public|Pronto para publicar|Ready to publish)/i.test(
        fixed,
      )
        ? 'live'
        : 'draft',
    price: /Gratuito|Free/i.test(fixed) ? 'Free' : 'Paid',
  }

  const titleM = fixed.match(/class="pBYElf">([^<]+)</)
  if (titleM) out.name = fixEncoding(titleM[1].trim())

  const textareas = [...html.matchAll(/<textarea[^>]*>([\s\S]*?)<\/textarea>/gi)]
    .map((m) => fixEncoding(m[1].replace(/<[^>]+>/g, '').trim()))
    .filter((t) => t.length > 40)

  if (textareas.length) {
    const shortCandidates = textareas.filter((t) => t.length <= 400)
    if (!out.descriptionShort) {
      out.descriptionShort = shortCandidates[0] ?? textareas[0].split('\n')[0]
    }
    out.descriptionFull = textareas.reduce((a, b) => (b.length > a.length ? b : a), '')
  }

  if (!out.tagline && out.descriptionShort) {
    out.tagline = out.descriptionShort.split(/\n/)[0].slice(0, 160)
  }

  Object.assign(out, extractStoreImages(html))
  out.youtubeUrl = extractYoutubeFromEdit(html)

  const updatedM = fixed.match(/(?:Atualizado|Updated)[:\s]*(\d{1,2})\/(\d{1,2})\/(\d{4})/i)
  if (updatedM) {
    out.lastUpdated = `${updatedM[3]}-${updatedM[2].padStart(2, '0')}-${updatedM[1].padStart(2, '0')}`
  }

  return out
}

const UNINSTALL_SERIES_RE = /series-id="(?:Desinstalações|Uninstalls?)"/i

/** Largest installs-page SVG that contains the uninstall time-series chart. */
export function findUninstallChartSvg(html) {
  if (!html) return null

  const svgRe = /<svg\b[\s\S]*?<\/svg>/gi
  let best = null
  let match

  while ((match = svgRe.exec(html)) !== null) {
    const svg = match[0]
    if (!UNINSTALL_SERIES_RE.test(svg)) continue
    const width = Number.parseFloat(svg.match(/\bwidth="([\d.]+)"/)?.[1] ?? 0)
    if (!best || width > best.width) {
      best = { svg, width }
    }
  }

  return best?.svg ?? null
}

function parseUninstallChartDate(label, referenceYear) {
  if (!label) return null

  let cleaned = fixEncoding(label).trim()
  cleaned = cleaned.replace(/'(\d{2})\b/, '20$1')
  if (!/\d{4}/.test(cleaned)) {
    cleaned = `${cleaned} ${referenceYear}`
  }

  const d = new Date(cleaned)
  return Number.isNaN(d.getTime()) ? null : d
}

function extractUninstallPathD(svgHtml) {
  const seriesIdx = svgHtml.search(UNINSTALL_SERIES_RE)
  if (seriesIdx < 0) return null

  const window = svgHtml.slice(seriesIdx, seriesIdx + 12000)
  const paths = []
  const pathRe = /<path\b[^>]*>/gi
  let pathMatch

  while ((pathMatch = pathRe.exec(window)) !== null) {
    const tag = pathMatch[0]
    if (tag.includes('stroke="transparent"') || tag.includes("stroke='transparent'")) continue
    const d = tag.match(/\bd="([^"]+)"/)?.[1]
    if (!d || d.length < 8) continue
    if (tag.includes('RWgCYc-bdKbFb') || /[ML][\d.]+,[\d.]+/.test(d)) {
      paths.push(d)
    }
  }

  if (!paths.length) return null
  return paths.reduce((longest, d) => (d.length > longest.length ? d : longest), '')
}

function extractUninstallXAxisTicks(svgHtml) {
  const ticks = []
  const tickRe =
    /<g[^>]*class="[^"]*K2kob[^"]*"[^>]*transform="translate\(([\d.]+),\s*0\)"[^>]*>[\s\S]*?<tspan[^>]*>([^<]+)<\/tspan>/gi
  let match

  while ((match = tickRe.exec(svgHtml)) !== null) {
    const label = fixEncoding(match[2]).trim()
    if (/^\d+(\.\d+)?$/.test(label)) continue
    ticks.push({ xPx: Number.parseFloat(match[1]), label })
  }

  return ticks
}

function extractUninstallYAxisTicks(svgHtml) {
  const ticks = []
  const tickRe =
    /<g[^>]*class="[^"]*K2kob[^"]*"[^>]*transform="translate\(0,\s*([\d.]+)\)"[^>]*>[\s\S]*?<tspan[^>]*>([\d.]+)<\/tspan>/gi
  let match

  while ((match = tickRe.exec(svgHtml)) !== null) {
    ticks.push({
      value: Number.parseFloat(match[2]),
      yPx: Number.parseFloat(match[1]),
    })
  }

  return ticks
}

function parseUninstallPathPoints(pathD) {
  const points = []
  const pointRe = /[ML]([\d.]+),([\d.]+)/g
  let match

  while ((match = pointRe.exec(pathD)) !== null) {
    points.push({ x: Number.parseFloat(match[1]), y: Number.parseFloat(match[2]) })
  }

  return points
}

/** Daily uninstall series from the installs-page SVG line chart. */
export function extractUninstallSeriesFromSvg(svgHtml, referenceYear) {
  const pathD = extractUninstallPathD(svgHtml)
  if (!pathD) return []

  const xTicks = extractUninstallXAxisTicks(svgHtml)
  const yTicks = extractUninstallYAxisTicks(svgHtml)
  const points = parseUninstallPathPoints(pathD)
  if (!points.length) return []

  const zeroEntry = yTicks.find((row) => row.value === 0)
  const oneEntry = yTicks.find((row) => row.value === 1)
  const pxPerUnit =
    zeroEntry && oneEntry ? zeroEntry.yPx - oneEntry.yPx : 41.25
  const baselineY = zeroEntry ? zeroEntry.yPx : 165
  const xStep = points.length > 1 ? points[1].x - points[0].x : 41.25

  const tickMap = {}
  for (const { xPx, label } of xTicks) {
    const date = parseUninstallChartDate(label, referenceYear)
    if (date) tickMap[xPx] = date
  }

  const sortedTicks = Object.entries(tickMap)
    .map(([px, date]) => ({ px: Number.parseFloat(px), date }))
    .sort((a, b) => a.px - b.px)

  if (!sortedTicks.length) return []

  function getDateForX(xPx) {
    const nearest = sortedTicks.reduce((prev, curr) =>
      Math.abs(curr.px - xPx) < Math.abs(prev.px - xPx) ? curr : prev,
    )
    const dayOffset = Math.round((xPx - nearest.px) / xStep)
    const d = new Date(nearest.date)
    d.setDate(d.getDate() + dayOffset)
    return d
  }

  return points.map(({ x, y }) => {
    const date = getDateForX(x)
    const value = Math.round((baselineY - y) / pxPerUnit)
    const iso = date.toISOString().slice(0, 10)
    return { date: isoToDdMmYyyy(iso), total: Math.max(0, value) }
  })
}

export function extractUninstallHeadlineTotal(installsHtml) {
  if (!installsHtml) return null

  const patterns = [
    /Desinstalações[\s\S]{0,5000}?<div class="FhBhHd">(\d+)/i,
    /Uninstalls?[\s\S]{0,5000}?<div class="FhBhHd">(\d+)/i,
  ]

  for (const re of patterns) {
    const match = installsHtml.match(re)
    if (match) return Number.parseInt(match[1], 10)
  }

  return null
}

export function extractUninstallsFromInstallsHtml(installsHtml, exportDate) {
  const svg = findUninstallChartSvg(installsHtml)
  if (!svg) return null

  const referenceYear = Number.parseInt(String(exportDate).slice(0, 4), 10) || new Date().getFullYear()
  const overTime = extractUninstallSeriesFromSvg(svg, referenceYear)
  const headline = extractUninstallHeadlineTotal(installsHtml)
  const seriesTotal = overTime.reduce((sum, row) => sum + row.total, 0)

  return {
    total: headline ?? seriesTotal,
    overTime,
  }
}

/** Installs-page AF keys that may carry UNINSTALLS daily series (ds:6 on current DevConsole). */
const UNINSTALLS_AF_KEYS = ['ds:6', 'ds:5']

/** Daily uninstall series from AF_initData (same source as DevConsole Export CSV). */
export function extractUninstallsFromAf(instAf) {
  if (!instAf) return null

  for (const key of UNINSTALLS_AF_KEYS) {
    const data = instAf[key]
    if (!data) continue

    const { total, byDate } = sumMetricSeries(data, 'UNINSTALLS')
    const overTime = byDateToSeries(byDate)
    if (!overTime.length) continue

    return { total, overTime, source: key }
  }

  return null
}

export function resolveUninstalls(installsHtml, instAf, exportDate) {
  const fromAf = extractUninstallsFromAf(instAf)
  const fromSvg = extractUninstallsFromInstallsHtml(installsHtml, exportDate)
  const headline = extractUninstallHeadlineTotal(installsHtml)

  const uninstallsOverTime = fromAf?.overTime?.length
    ? fromAf.overTime
    : (fromSvg?.overTime ?? [])

  const seriesTotal = uninstallsOverTime.reduce((sum, row) => sum + row.total, 0)
  const uninstalls = headline ?? fromAf?.total ?? fromSvg?.total ?? seriesTotal

  return { uninstalls, uninstallsOverTime }
}

function extractAnalyticsFromPages(installsHtml, usersHtml, impressionsHtml, exportDate) {
  const instAf = parseAfCallbacks(installsHtml)
  const usersAf = parseAfCallbacks(usersHtml)
  const impAf = parseAfCallbacks(impressionsHtml)

  const installs = sumMetricSeries(instAf['ds:5'], 'INSTALLS')
  const { uninstalls, uninstallsOverTime } = resolveUninstalls(installsHtml, instAf, exportDate)

  const installsByRegion = sumCountrySeries(instAf['ds:4'])
  const weeklyUsersByRegion = sumCountrySeries(usersAf['ds:4'])

  let installations = extractInstallationsFromAccessible(installsHtml)
  if (!installations.length) {
    installations = installationsFromDs5(installsHtml)
  }
  installations = filterInstallationsLast30Days(installations, exportDate)

  const weeklyUsers = extractWeeklyUsersSeries(usersHtml, usersAf)
  const pageViewsOverTime = extractPageViewsSeries(impressionsHtml, impAf)
  const impressionsAcrossChromeWebStore = extractImpressionsSeries(impressionsHtml, impAf)
  const pageViewsBySource = extractPageViewsBySource(impAf)
  const { enabledVsDisabled, enabledVsDisabledOverTime } = resolveEnabledVsDisabled(
    usersHtml,
    usersAf,
    exportDate,
  )

  const totalFromSeries = installations.reduce((s, row) => s + row.total, 0)
  const pageViewsTotal = pageViewsOverTime.reduce((s, row) => s + row.total, 0)
  const impressionsTotal = impressionsAcrossChromeWebStore.reduce((s, row) => s + row.total, 0)

  return dedupeAnalyticsObject({
    totalInstalls: installs.total || totalFromSeries,
    installations,
    weeklyUsers,
    weeklyUsersByRegion: topRegions(weeklyUsersByRegion),
    installsByRegion: topRegions(installsByRegion),
    uninstalls,
    uninstallsOverTime,
    uninstallsByRegion: {},
    pageViews: pageViewsTotal,
    pageViewsOverTime,
    pageViewsBySource,
    impressions: impressionsTotal,
    impressionsAcrossChromeWebStore,
    enabledVsDisabled,
    enabledVsDisabledOverTime,
  })
}

function pickShortDescription(edit, template) {
  const raw = edit.descriptionShort || template.description?.short || ''
  if (!raw.trim()) return ''
  const firstLine = raw.split('\n')[0].trim()
  return firstLine.length < 400 ? firstLine : `${firstLine.slice(0, 397)}…`
}

function sanitizeCategory(value) {
  if (!value || typeof value !== 'string') return 'Productivity'
  if (value.includes('<') || value.includes('data-') || value.length > 40) return 'Productivity'
  return value
}

function loadTemplate(slug) {
  let fromPage = null
  try {
    const pageData = JSON.parse(fs.readFileSync(APPS_EXAMPLE, 'utf8'))
    const list = pageData.apps ?? pageData.extensions
    fromPage = list?.find((e) => e.slug === slug)
  } catch {
    /* */
  }
  return fromPage ?? null
}

function buildApp(id, pages, exportDate, slug) {
  const editHtml = fs.readFileSync(pages.edit, 'utf8')
  const slugName = extractSlugNameFromEdit(editHtml)
  const template = loadTemplate(slug) || {}

  const installsHtml = fs.readFileSync(pages.analytics_installs, 'utf8')
  const instAf = parseAfCallbacks(installsHtml)
  const metaFromStore = extractDs1Metadata(instAf['ds:1'], id)
  const fromEdit = extractEditPage(editHtml, id)
  const edit = {
    ...fromEdit,
    ...metaFromStore,
    descriptionShort: fromEdit.descriptionShort || metaFromStore.descriptionShort,
    descriptionFull: fromEdit.descriptionFull || metaFromStore.descriptionFull,
  }

  const analyticsRaw = extractAnalyticsFromPages(
    fs.readFileSync(pages.analytics_installs, 'utf8'),
    fs.readFileSync(pages.analytics_users, 'utf8'),
    fs.readFileSync(pages.analytics_impressions, 'utf8'),
    exportDate,
  )

  const isLive = edit.status === 'live' || hasMeaningfulAnalytics(analyticsRaw)

  const app = {
    slug,
    chromeExtensionId: extractChromeExtensionId(edit.chromeStoreUrl) || id,
    name: edit.name || template.name || slugName || slug,
    icon: template.icon || '⚡',
    chromeExtensionIcon: edit.chromeExtensionIcon || template.chromeExtensionIcon || null,
    tagline: edit.tagline || template.tagline || '',
    status: isLive ? 'live' : 'coming-soon',
    price: edit.price || template.price || 'Free',
    revenue: template.revenue ?? (edit.price === 'Free' ? '$0' : undefined),
    chromeStoreUrl: edit.chromeStoreUrl,
    version: edit.version || template.version || '1.0.0',
    lastUpdated: edit.lastUpdated || exportDate || template.lastUpdated,
    category: sanitizeCategory(edit.category || template.category),
    platform: template.platform || 'Google Chrome',
    description: {
      short: pickShortDescription(edit, template),
      full:
        edit.descriptionFull ||
        template.description?.full ||
        edit.descriptionShort ||
        '',
    },
    audience: template.audience?.length ? template.audience : [],
    features: template.features?.length ? template.features : [],
    buildStory: {
      youtubeUrl: '#',
      builtInDays: null,
      techStack: [],
      episode: '',
      ...template.buildStory,
      youtubeUrl:
        edit.youtubeUrl || template.buildStory?.youtubeUrl || '#',
    },
    primaryKeywords: template.primaryKeywords || [],
    geo: template.geo || [],
    screenshots:
      edit.screenshots?.length
        ? edit.screenshots
        : template.screenshots?.length
          ? template.screenshots
          : [],
  }

  // Parse analytics even when the listing is under store review — Chrome still
  // exports install/user charts in the downloaded HTML.
  if (hasMeaningfulAnalytics(analyticsRaw)) {
    app.analytics = analyticsRaw
  }

  return app
}

function ensureLiveAppAnalytics(app) {
  if (app.status !== 'live') return app
  if (hasMeaningfulAnalytics(app.analytics)) return app
  app.analytics = emptyAnalytics()
  return app
}

function finalizeApp(app, id, customMap) {
  const custom = customMap.get(id)
  applyCustomDataToApp(app, custom)
  if (custom?.status === 'live') {
    app.status = 'live'
  } else if (app.status === 'coming-soon' && hasMeaningfulAnalytics(app.analytics)) {
    app.status = 'live'
  }
  return ensureLiveAppAnalytics(app)
}

function chromeExtensionIdFromApp(app) {
  return app?.chromeExtensionId ?? extractChromeExtensionId(app?.chromeStoreUrl)
}

/**
 * Apply apps-custom-data.json onto existing apps.json (no HTML scrape).
 * Used when html/ is empty (e.g. CI) but manual mappings changed.
 */
export function syncAppsJsonCustomData() {
  const customMap = loadCustomDataMap()

  if (!fs.existsSync(APPS_JSON)) {
    console.warn(`No ${path.relative(ROOT, APPS_JSON)} — nothing to sync`)
    return false
  }

  let payload
  try {
    payload = JSON.parse(fs.readFileSync(APPS_JSON, 'utf8'))
  } catch (err) {
    console.error(`Could not parse ${path.relative(ROOT, APPS_JSON)}:`, err.message)
    process.exit(1)
  }

  const apps = payload.apps ?? []
  let changed = false

  for (const app of apps) {
    const id = chromeExtensionIdFromApp(app)
    if (!id) {
      console.warn(`App "${app.name ?? 'unknown'}" has no Chrome extension ID — cannot sync custom data`)
      continue
    }

    if (app.chromeExtensionId !== id) {
      app.chromeExtensionId = id
      changed = true
    }

    const custom = customMap.get(id)
    if (!custom) {
      console.warn(
        `No entry in apps-custom-data.json for ${id} (${app.name ?? 'unknown'}) — keeping existing fields`,
      )
      continue
    }

    const before = JSON.stringify(app)
    applyCustomDataToApp(app, custom)
    ensureLiveAppAnalytics(app)
    if (JSON.stringify(app) !== before) {
      changed = true
    }
  }

  if (changed) {
    fs.writeFileSync(APPS_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    console.log(`Updated ${path.relative(ROOT, APPS_JSON)} from apps-custom-data.json`)
  } else {
    console.log(`${path.relative(ROOT, APPS_JSON)} already matches apps-custom-data.json`)
  }

  return changed
}

/** @deprecated Use syncAppsJsonCustomData */
export function syncAppsJsonSlugs() {
  return syncAppsJsonCustomData()
}

/** Append a full apps.json snapshot to chrome-extension-html/db.json (local archive). */
export function appendAppsJsonToDb({ updatedAt, apps }) {
  let db = {
    schemaVersion: 1,
    description:
      'Local archive of every apps.json produced from Chrome Web Store HTML scrapes. Not committed to git (samples/ is ignored).',
    snapshots: [],
  }

  if (fs.existsSync(DB_JSON)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_JSON, 'utf8'))
      db = { ...db, ...parsed, snapshots: parsed.snapshots ?? [] }
    } catch {
      console.warn(`Could not parse ${DB_JSON}; starting a new db.json`)
    }
  }

  const entry = {
    extractedAt: new Date().toISOString(),
    updatedAt,
    outputPath: 'src/data/apps.json',
    appCount: apps.length,
    slugs: apps.map((a) => a.slug),
    chromeExtensionIds: apps.map(chromeExtensionIdFromApp).filter(Boolean),
    appsJson: { updatedAt, apps: dedupeAppsAnalytics(apps) },
  }

  db.snapshots.push(entry)
  fs.mkdirSync(path.dirname(DB_JSON), { recursive: true })
  fs.writeFileSync(DB_JSON, `${JSON.stringify(db, null, 2)}\n`, 'utf8')
  console.log(
    `Recorded snapshot in ${path.relative(ROOT, DB_JSON)} (${db.snapshots.length} total)`,
  )
}

function formatProcessedAppsSummaryLines(apps) {
  return apps.map((app, i) => {
    const a = app.analytics
    if (!a) return `${i + 1}. ${app.name} (no analytics)`
    const installs = a.totalInstalls ?? 0
    const lastWeeklyUsers =
      a.weeklyUsers?.length > 0
        ? a.weeklyUsers[a.weeklyUsers.length - 1]?.total ?? 0
        : 0
    return `${i + 1}. ${app.name} (${installs} installs, ${lastWeeklyUsers} weekly users)`
  })
}

function printProcessedAppsSummary(apps) {
  console.log('\nProcessed apps:\n')
  for (const line of formatProcessedAppsSummaryLines(apps)) {
    console.log(line)
  }
  console.log('')
}

function shouldSkipMoveHtmlConfirm() {
  return (
    process.env.CI === 'true' ||
    process.env.SKIP_HTML_MOVE_CONFIRM === '1' ||
    process.env.SKIP_HTML_MOVE_CONFIRM === 'true'
  )
}

function confirmMoveHtmlWin32Dialog() {
  const ps =
    "Add-Type -AssemblyName System.Windows.Forms; " +
    "$r=[System.Windows.Forms.MessageBox]::Show(" +
    "'Move HTML exports from html/ to processed_html?','Chrome extract - Is this OK?','YesNo','Question'); " +
    "if ($r -eq 'Yes') { exit 0 } else { exit 1 }"
  execFileSync('powershell.exe', ['-NoProfile', '-Sta', '-Command', ps], {
    stdio: 'ignore',
    windowsHide: true,
  })
  return true
}

async function confirmMoveHtmlToProcessed() {
  if (shouldSkipMoveHtmlConfirm()) return true

  if (process.platform === 'win32') {
    console.log('\nIs this OK? A Yes / No dialog will open.')
    try {
      return confirmMoveHtmlWin32Dialog()
    } catch (err) {
      const code = err?.status ?? err?.code
      if (code === 1) return false
      console.warn('Could not open dialog; using terminal prompt instead.', err?.message ?? err)
    }
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    const answer = await rl.question('Is this OK? Move HTML to processed_html? [yes/no]: ')
    return /^y(es)?$/i.test(String(answer).trim())
  } finally {
    rl.close()
  }
}

export async function main() {
  const files = listHtmlFiles()
  if (!files.length) {
    console.log(
      `No HTML in ${HTML_DIR} — skipping extract (syncing apps-custom-data.json)`,
    )
    syncAppsJsonCustomData()
    return
  }

  const groups = groupByExtension(files)
  const customMap = loadCustomDataMap()
  const apps = []
  let updatedAt = ''

  for (const [id, pages] of Object.entries(groups)) {
    if (!pages.edit || !pages.analytics_installs || !pages.analytics_users || !pages.analytics_impressions) {
      console.warn(`Skipping ${id}: missing pages`, Object.keys(pages))
      continue
    }

    const slug = ensureCustomDataSlug(id, customMap)

    if (pages.date && (!updatedAt || pages.date > updatedAt)) {
      updatedAt = pages.date
    }

    const app = finalizeApp(buildApp(id, pages, pages.date, slug), id, customMap)
    apps.push(app)
    console.log(`Parsed ${app.name} (${id}) → /apps/${app.slug}`)
    if (app.analytics) {
      const a = app.analytics
      console.log(
        `  installs: ${a.totalInstalls}, uninstalls: ${a.uninstalls ?? 0}, pageViews: ${a.pageViews}, impressions: ${a.impressions}, weeklyUser days: ${a.weeklyUsers?.length ?? 0}, enabled: ${a.enabledVsDisabled?.enabled ?? 0}, disabled: ${a.enabledVsDisabled?.disabled ?? 0}`,
      )
    } else {
      console.log(`  status: ${app.status} (no analytics block)`)
    }
  }

  if (!updatedAt) {
    updatedAt = new Date().toISOString().slice(0, 10)
  }

  assertHtmlBatchMatchesApps(files, groups, apps)

  const payload = { updatedAt, apps }

  fs.writeFileSync(APPS_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(
    `\nAdded ${apps.length} app${apps.length === 1 ? '' : 's'} to ${path.relative(ROOT, APPS_JSON)} (${files.length} HTML files ÷ ${HTML_FILES_PER_APP} = ${apps.length}).`,
  )

  appendAppsJsonToDb(payload)

  const { updateAppsJsonPortfolioStats } = await import('./compute-portfolio-stats.mjs')
  updateAppsJsonPortfolioStats()

  printProcessedAppsSummary(apps)

  const moveOk = await confirmMoveHtmlToProcessed()
  if (!moveOk) {
    console.log(
      '\nYou chose No: HTML files were not moved (they remain in chrome-extension-html/html/).',
    )
    return
  }

  moveHtmlToProcessed(files)
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))

if (isDirectRun) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
