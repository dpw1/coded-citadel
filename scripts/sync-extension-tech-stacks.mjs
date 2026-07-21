/**
 * Persist extension buildStory.techStack (+ highlights) into apps-custom-data.json,
 * then merge into apps.json via syncAppsJsonCustomData.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { syncAppsJsonCustomData } from '../back-end/extract-chrome-apps.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CUSTOM_JSON = path.join(ROOT, 'src/data/apps-custom-data.json')

const UI_UX_SLUGS = new Set([
  'youtube-filter-pro',
  'claude-limit-monitor',
  'instagram-dm-exporter',
  'instagram-comments-exporter',
  'ai-bookmark',
  'youtube-comments-exporter',
  'youtube-keyword-alert',
  'dex',
])

const BUILD_STORY_BY_SLUG = {
  'gmail-to-pdf': {
    techStack: [
      'JavaScript',
      'React',
      'Vite',
      'Chrome Extension Manifest V3',
      'html2canvas',
      'jsPDF',
      'JSZip',
      'Domino',
      'IndexedDB',
      'chrome.i18n',
    ],
    technicalHighlights:
      'I pull Gmail print-view HTML in-page, then either rasterize it to PDF with html2canvas and jsPDF or hand large HTML through IndexedDB into a dedicated print tab because service workers cannot ferry blobs the normal way. Domino lets the background rewrite email DOM without a real document window, while JSZip packs attachments under a same-origin URL allowlist. The React popup drives multi-format export with full chrome.i18n localization.',
  },
  dex: {
    techStack: [
      'TypeScript',
      'React 19',
      'Vite',
      'Chrome Extension Manifest V3',
      'Discord API v9',
      'html2canvas',
      'pdf-lib',
      'JSZip',
      'chrome.i18n',
      'UI/UX Design',
    ],
    technicalHighlights:
      'A MAIN-world hook captures Discord Authorization headers from live XHR traffic once, then the isolated UI drives Discord API v9 with snowflake date bounds, newest-first pagination, and 429-aware retries. PDF export renders conversation HTML in a hidden iframe, captures it with html2canvas, and slices the result into multipage PDFs via pdf-lib. Channels and DMs export to HTML, PDF, Markdown, TXT, and JSON without leaving Discord, with JSZip for attachment bulk downloads.',
  },
  'youtube-filter-pro': {
    techStack: [
      'TypeScript',
      'Vite',
      'CRXJS',
      'Chrome Extension Manifest V3',
      'FingerprintJS',
      'Supabase',
      'chrome.storage',
      'chrome.i18n',
      'UI/UX Design',
    ],
    technicalHighlights:
      'A document-start MAIN-world agent traps YouTube initial search payloads and patches fetch so youtubei search continuations stream structured video data into the isolated filter engine instead of brittle DOM scraping. Filters apply live with auto-scroll backfill, URL-synced state, and enrichment for subscribers, likes, and views per day. Anonymous usage telemetry posts to Supabase REST keyed by a FingerprintJS visitor id stored locally.',
  },
  'claude-deep-search': {
    techStack: [
      'JavaScript',
      'Chrome Extension Manifest V3',
      'IndexedDB',
      'Claude web API',
      'MutationObserver',
      'chrome.storage',
    ],
    technicalHighlights:
      'I pull conversations from Claude organization chat APIs in batched fetches with retry and backoff, then store everything locally in IndexedDB with a precomputed lowercase search field for private full-text phrase matching. MutationObservers keep the search UI alive across Claude SPA navigations and drive in-conversation highlight handoff via deep-link hashes. The index auto-repairs corrupt schemas and keeps a single long-lived database connection to avoid Chromium open and close races.',
  },
  'instagram-comments-exporter': {
    techStack: [
      'JavaScript',
      'React 19',
      'Vite',
      'Chrome Extension Manifest V3',
      'SheetJS',
      'Instagram private web API',
      'chrome.storage',
      'UI/UX Design',
    ],
    technicalHighlights:
      'Extraction hits Instagram media and child-comment endpoints with session cookies and CSRF headers, walking nested reply cursors while persisting full job state including pause positions in chrome.storage.local. Rate limits and checkpoint redirects become first-class blocked states with backoff and resume-on-reopen across SPA navigations. Exports cover CSV, JSON, TXT, and Excel via SheetJS from an on-page widget plus a React popup.',
  },
  'youtube-comments-exporter': {
    techStack: [
      'TypeScript',
      'React 18',
      'Vite',
      'CRXJS',
      'Chrome Side Panel',
      'Zustand',
      'TanStack Table',
      'SheetJS',
      'Supabase Edge Functions',
      'IndexedDB',
      'YouTube Data API v3',
      'chrome.i18n',
      'UI/UX Design',
    ],
    technicalHighlights:
      'The UX lives in Chrome Side Panel with Zustand state persisted through a chrome.storage.sync adapter, while comment history sits in IndexedDB for revisit and re-export. Fetching goes through Supabase Edge Functions that call YouTube Data API v3 server-side so the API key never ships in the extension. TanStack Table powers sortable filterable grids, and SheetJS covers CSV, JSON, TXT, and XLSX export.',
  },
  'ai-bookmark': {
    techStack: [
      'JavaScript',
      'React 18',
      'Vite',
      'CRXJS',
      'Chrome Extension Manifest V3',
      'Supabase',
      'Chrome Identity OAuth',
      'MutationObserver',
      'react-tag-input',
      'UI/UX Design',
    ],
    technicalHighlights:
      'Platform-specific content scripts for Claude, ChatGPT, and Grok inject bookmark stars via MutationObserver and sync reply snapshots through a Supabase-backed service worker with Google OAuth via Chrome Identity. Reopening a bookmark retries scroll-to-reply until the saved turn is in the DOM, so deep chats still land on the exact message. Shared content helpers are inlined per platform bundle so each content script stays self-contained.',
  },
  'instagram-dm-exporter': {
    techStack: [
      'JavaScript',
      'Vite',
      'Chrome Extension Manifest V3',
      'fflate',
      'Instagram GraphQL API',
      'chrome.storage',
      'UI/UX Design',
    ],
    technicalHighlights:
      'Conversation history comes from Instagram authenticated GraphQL message lists with cursor pagination, session tokens scraped from the page, and filters for date range or message count while skipping reaction noise. A deep media parser walks typed attachment nodes and downloads CDN assets with credentialed fetches. Exports ship as TXT, self-contained HTML with inlined media, or JSON, with optional attachment archives built in-browser via fflate.',
  },
  'save-directly-to-drive': {
    techStack: [
      'JavaScript',
      'Vite',
      'Chrome Extension Manifest V3',
      'Google OAuth 2.0',
      'Google Drive API v3',
      'Chrome Downloads API',
      'Chrome Context Menus',
      'chrome.i18n',
    ],
    technicalHighlights:
      'I can treat Drive as a downloads folder by intercepting Chrome download events, optionally prompting before save, and mirroring files with Drive file-scope OAuth through Chrome Identity including silent token refresh. Uploads use Drive create-then-media-upload with folder lookup caching and quota checks before wasting a transfer. Blob-URL downloads are recovered through a page-context fetch in the content script, with context-menu save-link and multi-locale chrome.i18n covering the rest.',
  },
  'claude-limit-monitor': {
    techStack: [
      'JavaScript',
      'Vite',
      'Chrome Extension Manifest V3',
      'Fetch API patching',
      'Server-Sent Events',
      'Claude usage API',
      'MutationObserver',
      'Chrome Alarms',
      'Chrome Notifications',
      'UI/UX Design',
    ],
    technicalHighlights:
      'Usage is tracked by polling Claude organization usage endpoints while patching window fetch so completion streams can be tee’d—one branch keeps chat working, the other scans SSE payloads for message-limit events. A MutationObserver and send-button listeners refresh meters right after you message, and an injectable pill UI is driven from raw HTML and CSS samples. Chrome alarms fire optional reset notifications when the parsed reset time arrives.',
  },
  'youtube-keyword-alert': {
    techStack: [
      'JavaScript',
      'React 18',
      'Vite',
      'Chrome Extension Manifest V3',
      'YouTube InnerTube API',
      'Chrome Alarms',
      'Chrome Notifications',
      'chrome.i18n',
      'UI/UX Design',
    ],
    technicalHighlights:
      'Background polling scrapes and caches YouTube InnerTube client config from the homepage, then hits youtubei search with session cookies—refreshing config automatically on 403—so keyword alerts work without an official API key. Filters compose search queries plus post-filters for duration, subscribers, verified channels, and include or exclude rules, with channel metadata enriched from page bootstraps. A React manager and a separately bundled content script share storage and alarms for scheduled checks and desktop notifications across locales.',
  },
  'hide-reposts-for-bluesky': {
    techStack: [
      'JavaScript',
      'React 19',
      'Vite',
      'CRXJS',
      'Chrome Extension Manifest V3',
      'chrome.storage',
      'chrome.i18n',
      'Bluesky AT Protocol',
      'MutationObserver',
    ],
    technicalHighlights:
      'I reverse-engineered Bluesky session storage to pull the signed-in DID and JWT, then used that to paginate the official following graph API and drive per-account hide controls. The hard part was Bluesky virtualized feed: MutationObserver plus scroll hooks hide only Following-tab reposts in real time without breaking backfill.',
  },
}

for (const slug of UI_UX_SLUGS) {
  const entry = BUILD_STORY_BY_SLUG[slug]
  if (!entry?.techStack?.includes('UI/UX Design')) {
    throw new Error(`Missing UI/UX Design on ${slug}`)
  }
}

const customData = JSON.parse(fs.readFileSync(CUSTOM_JSON, 'utf8'))

for (const entry of customData.apps ?? []) {
  const slug = entry.slug
  const buildStory = BUILD_STORY_BY_SLUG[slug]
  if (!buildStory) {
    console.warn(`No buildStory mapping for ${slug}`)
    continue
  }
  entry.buildStory = buildStory
}

fs.writeFileSync(CUSTOM_JSON, `${JSON.stringify(customData, null, 2)}\n`, 'utf8')
console.log(`Updated ${path.relative(ROOT, CUSTOM_JSON)}`)

syncAppsJsonCustomData()
