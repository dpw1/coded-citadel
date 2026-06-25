/**
 * Injects a human-readable homepage meta description into index.html
 * using the latest portfolio stats from apps.json.
 *
 * Run after compute-portfolio-stats during builds.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildHomeMetaDescription } from '../src/utils/homeMetaDescription.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const INDEX_FILE = resolve(__dirname, '../index.html')
const APPS_FILE = resolve(__dirname, '../src/data/apps.json')

const JOURNEY_DAY_ONE = new Date(2026, 4, 12)
const MS_PER_DAY = 24 * 60 * 60 * 1000

function startOfLocalDay(ms) {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function getDaysIntoJourney(now = Date.now()) {
  const elapsed = Math.floor(
    (startOfLocalDay(now) - startOfLocalDay(JOURNEY_DAY_ONE)) / MS_PER_DAY,
  )
  if (elapsed < 0) return null
  return elapsed + 1
}

function loadHomeStats() {
  const appsData = JSON.parse(readFileSync(APPS_FILE, 'utf8'))
  const apps = appsData.apps ?? []
  const portfolio = appsData.portfolioStats ?? {}

  return {
    totalActiveUsers: portfolio.totalActiveUsers ?? 0,
    totalInstalls: portfolio.totalInstalls ?? 0,
    activeUsersDelta7d: portfolio.activeUsersDelta7d ?? null,
    installsDelta7d: portfolio.installsDelta7d ?? null,
    built: apps.length,
    daysIntoJourney: getDaysIntoJourney(),
  }
}

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
}

function replaceMetaDescription(html, description) {
  const escaped = escapeHtmlAttr(description)

  return html
    .replace(
      /<meta name="description" content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escaped}" />`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*">/,
      `<meta property="og:description" content="${escaped}">`,
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*">/,
      `<meta name="twitter:description" content="${escaped}">`,
    )
    .replace(
      /"description": "A solo developer building Chrome extensions and web apps in public on YouTube\. From \$0 to \$100K, one product at a time\."/,
      `"description": ${JSON.stringify(description)}`,
    )
}

function main() {
  const description = buildHomeMetaDescription(loadHomeStats())
  const html = readFileSync(INDEX_FILE, 'utf8')
  const next = replaceMetaDescription(html, description)

  if (next === html) {
    throw new Error('Failed to update homepage meta description in index.html')
  }

  writeFileSync(INDEX_FILE, next, 'utf8')
  console.log(`Homepage meta description → ${description}`)
}

main()
