/**
 * Parse Chrome Web Store dev console HTML exports → src/data/apps.json
 * Run: node back-end/extract-chrome-apps.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const HTML_DIR = path.join(ROOT, 'chrome-extension-html/html')
const PROCESSED_HTML_DIR = path.join(ROOT, 'chrome-extension-html/processed_html')
const APPS_JSON = path.join(ROOT, 'src/data/apps.json')
const APPS_CUSTOM_DATA_JSON = path.join(ROOT, 'src/data/apps-custom-data.json')
const APPS_EXAMPLE = path.join(ROOT, 'chrome-extension-html/apps-example.json')
const DB_JSON = path.join(ROOT, 'chrome-extension-html/db.json')

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

/** Merge manual fields from apps-custom-data.json (slug, created display string, overrides, etc.). */
function applyCustomDataToApp(app, custom) {
  if (!custom) return app
  for (const [key, value] of Object.entries(custom)) {
    if (key === 'id' || value === undefined) continue
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
    uninstallsByRegion: {},
    pageViews: 0,
    pageViewsOverTime: [],
    pageViewsBySource: {},
    impressions: 0,
    impressionsAcrossChromeWebStore: [],
    enabledVsDisabled: { enabled: 0, disabled: 0 },
  }
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

function parseAfCallbacks(html) {
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

const ENABLED_LABELS = /ativado|enabled/i
const DISABLED_LABELS = /desativado|disabled/i

function parseEnabledVsDisabled(totals) {
  const out = { enabled: 0, disabled: 0 }
  for (const [label, count] of Object.entries(totals ?? {})) {
    if (ENABLED_LABELS.test(label)) out.enabled += count
    else if (DISABLED_LABELS.test(label)) out.disabled += count
  }
  return out
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

    byIso[point.iso] = (byIso[point.iso] || 0) + point.total
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
    status: /Status:\s*[^<]*(?:Publicad|Published|público|public)/i.test(fixed)
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

function extractAnalyticsFromPages(installsHtml, usersHtml, impressionsHtml, exportDate) {
  const instAf = parseAfCallbacks(installsHtml)
  const usersAf = parseAfCallbacks(usersHtml)
  const impAf = parseAfCallbacks(impressionsHtml)

  const installs = sumMetricSeries(instAf['ds:5'], 'INSTALLS')
  const uninstalls = sumMetricSeries(instAf['ds:5'], 'UNINSTALLS')

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
  const enabledVsDisabled = parseEnabledVsDisabled(
    sumDimensionSeries(usersAf['ds:3'], 'ENABLED_AND_DISABLED'),
  )

  const totalFromSeries = installations.reduce((s, row) => s + row.total, 0)
  const pageViewsTotal = pageViewsOverTime.reduce((s, row) => s + row.total, 0)
  const impressionsTotal = impressionsAcrossChromeWebStore.reduce((s, row) => s + row.total, 0)

  return {
    totalInstalls: installs.total || totalFromSeries,
    installations,
    weeklyUsers,
    weeklyUsersByRegion: topRegions(weeklyUsersByRegion),
    installsByRegion: topRegions(installsByRegion),
    uninstalls: uninstalls.total,
    uninstallsByRegion: {},
    pageViews: pageViewsTotal,
    pageViewsOverTime,
    pageViewsBySource,
    impressions: impressionsTotal,
    impressionsAcrossChromeWebStore,
    enabledVsDisabled,
  }
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

  const isLive = edit.status === 'live'

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

  if (isLive) {
    app.analytics = analyticsRaw
  }

  return app
}

function finalizeApp(app, id, customMap) {
  applyCustomDataToApp(app, customMap.get(id))
  return app
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
    appsJson: { updatedAt, apps },
  }

  db.snapshots.push(entry)
  fs.mkdirSync(path.dirname(DB_JSON), { recursive: true })
  fs.writeFileSync(DB_JSON, `${JSON.stringify(db, null, 2)}\n`, 'utf8')
  console.log(
    `Recorded snapshot in ${path.relative(ROOT, DB_JSON)} (${db.snapshots.length} total)`,
  )
}

export function main() {
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

    const custom = customMap.get(id)
    const slug = custom?.slug
    if (!slug) {
      console.warn(
        `Skipping ${id}: no slug in apps-custom-data.json — add { "id": "${id}", "slug": "your-slug" }`,
      )
      continue
    }

    if (pages.date && (!updatedAt || pages.date > updatedAt)) {
      updatedAt = pages.date
    }

    const app = finalizeApp(buildApp(id, pages, pages.date, slug), id, customMap)
    apps.push(app)
    console.log(`Parsed ${app.name} (${id}) → /apps/${app.slug}`)
    if (app.analytics) {
      const a = app.analytics
      console.log(
        `  installs: ${a.totalInstalls}, pageViews: ${a.pageViews}, impressions: ${a.impressions}, weeklyUser days: ${a.weeklyUsers?.length ?? 0}, enabled: ${a.enabledVsDisabled?.enabled ?? 0}`,
      )
    } else {
      console.log(`  status: ${app.status} (no analytics block)`)
    }
  }

  if (!updatedAt) {
    updatedAt = new Date().toISOString().slice(0, 10)
  }

  const payload = { updatedAt, apps }

  fs.writeFileSync(APPS_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`\nWrote ${apps.length} apps to ${APPS_JSON}`)

  appendAppsJsonToDb(payload)

  moveHtmlToProcessed(files)
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))

if (isDirectRun) main()
