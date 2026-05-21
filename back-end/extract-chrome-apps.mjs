/**
 * Parse Chrome Web Store dev console HTML exports → src/data/apps.json
 * Run: node back-end/extract-chrome-apps.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const HTML_DIR = path.join(ROOT, 'samples/chrome-extension-html/html')
const APPS_JSON = path.join(ROOT, 'src/data/apps.json')
const APPS_EXAMPLE = path.join(ROOT, 'samples/chrome-extension-html/apps-example.json')

const ID_TO_SLUG = {
  epokpidfnienjjfncmhnallghfhaijbj: 'yt-comments-exporter',
  dbkkcbfafkckhmefkpgnelikibobcabb: 'youtube-filter-pro',
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
  const m = name.match(/^([a-z]+)--([^-]+)--(\d{2})-(\d{2})\.html$/i)
  if (!m) return null
  return { id: m[1], page: m[2], day: m[3], month: m[4], date: `2026-${m[4]}-${m[3]}` }
}

function listHtmlFiles() {
  if (!fs.existsSync(HTML_DIR)) return []
  return fs.readdirSync(HTML_DIR).filter((f) => f.endsWith('.html'))
}

function deleteHtmlExports(files) {
  for (const file of files) {
    fs.unlinkSync(path.join(HTML_DIR, file))
  }
  console.log(`Removed ${files.length} HTML export(s) from ${HTML_DIR}`)
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

/** Sum daily series like [["2026-05-16",[[1,[[3,2,"INSTALLS"]]]]], ...] */
function sumMetricSeries(data, metricType) {
  const byDate = {}
  if (!Array.isArray(data) || !Array.isArray(data[1])) return { total: 0, byDate, weekly: [] }

  for (const day of data[1]) {
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
    if (count) byDate[date] = count
  }

  const total = Object.values(byDate).reduce((a, b) => a + b, 0)
  const weekly = aggregateDailyToWeekly(byDate)
  return { total, byDate, weekly }
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
 * Daily install points from chart accessibility labels on analytics/installs HTML.
 * Selector: div[data-accessible-description][ssk*='page views'] (and Total installs series).
 */
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

  return Object.entries(byIso)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([iso, total]) => ({ date: isoToDdMmYyyy(iso), total }))
}

function installationsFromDs5(html) {
  const af = parseAfCallbacks(html)
  const { byDate } = sumMetricSeries(af['ds:5'], 'INSTALLS')
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([iso, total]) => ({ date: isoToDdMmYyyy(iso), total }))
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
  const users = sumMetricSeries(usersAf['ds:5'], 'USERS')
  const impressions = sumMetricSeries(impAf['ds:5'], 'IMPRESSIONS')

  const installsByRegion = sumCountrySeries(instAf['ds:4'])
  const weeklyUsersByRegion = sumCountrySeries(usersAf['ds:4'])

  let installations = extractInstallationsFromAccessible(installsHtml)
  if (!installations.length) {
    installations = installationsFromDs5(installsHtml)
  }
  installations = filterInstallationsLast30Days(installations, exportDate)

  const totalFromSeries = installations.reduce((s, row) => s + row.total, 0)

  return {
    totalInstalls: installs.total || totalFromSeries,
    installations,
    weeklyUsers: users.weekly,
    weeklyUsersByRegion: topRegions(weeklyUsersByRegion),
    installsByRegion: topRegions(installsByRegion),
    uninstalls: uninstalls.total,
    uninstallsByRegion: {},
    pageViews: 0,
    pageViewsBySource: {},
    impressions: impressions.total,
    enabledVsDisabled: { enabled: 0, disabled: 0 },
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
  return fromPage || {}
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildApp(id, pages, exportDate) {
  const template = loadTemplate(ID_TO_SLUG[id] || slugify(''))
  const slug = ID_TO_SLUG[id] || template.slug || slugify(template.name || id)

  const editHtml = fs.readFileSync(pages.edit, 'utf8')
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
  const hasAnalytics = analyticsRaw.totalInstalls > 0 || analyticsRaw.impressions > 0

  const app = {
    slug,
    name: edit.name || template.name || slug,
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

  if (isLive && hasAnalytics) {
    app.analytics = analyticsRaw
  }

  return app
}

function main() {
  const files = listHtmlFiles()
  if (!files.length) {
    console.log(
      `No HTML in ${HTML_DIR} — skipping extract (keeping existing ${path.relative(ROOT, APPS_JSON)})`,
    )
    return
  }

  const groups = groupByExtension(files)
  const apps = []
  let updatedAt = ''

  for (const [id, pages] of Object.entries(groups)) {
    if (!pages.edit || !pages.analytics_installs || !pages.analytics_users || !pages.analytics_impressions) {
      console.warn(`Skipping ${id}: missing pages`, Object.keys(pages))
      continue
    }
    if (pages.date && (!updatedAt || pages.date > updatedAt)) {
      updatedAt = pages.date
    }

    const app = buildApp(id, pages, pages.date)
    apps.push(app)
    console.log(`Parsed ${app.name} (${id}) → /apps/${app.slug}`)
    if (app.analytics) {
      console.log(
        `  installs: ${app.analytics.totalInstalls}, impressions: ${app.analytics.impressions}, installation days: ${app.analytics.installations?.length ?? 0}`,
      )
    } else {
      console.log(`  status: ${app.status} (no analytics block)`)
    }
  }

  if (!updatedAt) {
    updatedAt = new Date().toISOString().slice(0, 10)
  }

  fs.writeFileSync(
    APPS_JSON,
    `${JSON.stringify({ updatedAt, apps }, null, 2)}\n`,
    'utf8',
  )
  console.log(`\nWrote ${apps.length} apps to ${APPS_JSON}`)

  deleteHtmlExports(files)
}

main()
