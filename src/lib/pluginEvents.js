import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { getSupabaseClient } from './supabaseClient'

const SESSION_KEY = 'cc_session_id'
const DOWNLOAD_SEEN_KEY = 'cc_plugin_dl_seen'
const DEBOUNCE_MS = 10_000
const DOWNLOAD_FP_WAIT_MS = 1500

const isDev = import.meta.env.DEV

let fpPromise = null
const debounceMap = new Map()
const downloadSeenMemory = new Set()

function warn(...args) {
  if (isDev) console.warn('[pluginEvents]', ...args)
}

function downloadDedupeKey(pluginSlug, visitorId) {
  return `${pluginSlug}:${visitorId}`
}

function hasLocalDownloadSeen(pluginSlug, visitorId) {
  if (!visitorId) return false
  const key = downloadDedupeKey(pluginSlug, visitorId)
  if (downloadSeenMemory.has(key)) return true
  try {
    const raw = localStorage.getItem(DOWNLOAD_SEEN_KEY)
    if (!raw) return false
    const map = JSON.parse(raw)
    return Boolean(map && typeof map === 'object' && map[key])
  } catch {
    return false
  }
}

function markLocalDownloadSeen(pluginSlug, visitorId) {
  if (!visitorId) return
  const key = downloadDedupeKey(pluginSlug, visitorId)
  downloadSeenMemory.add(key)
  try {
    const raw = localStorage.getItem(DOWNLOAD_SEEN_KEY)
    const map = raw ? JSON.parse(raw) : {}
    const next = map && typeof map === 'object' ? map : {}
    next[key] = true
    localStorage.setItem(DOWNLOAD_SEEN_KEY, JSON.stringify(next))
  } catch {
    // ignore storage failures
  }
}

async function hasServerDownloadSeen(pluginSlug, visitorId) {
  if (!visitorId) return false
  try {
    const supabase = getSupabaseClient()
    const { count, error } = await supabase
      .from('event_tracker')
      .select('id', { count: 'exact', head: true })
      .eq('plugin_slug', pluginSlug)
      .eq('event_type', 'download_click')
      .eq('visitor_id', visitorId)
    if (error) throw error
    return typeof count === 'number' && count > 0
  } catch (err) {
    // Table may have no public SELECT — local fingerprint cache still applies.
    warn('download uniqueness check skipped', err)
    return false
  }
}

export function initPluginEvents() {
  if (typeof window === 'undefined') return
  ensureFingerprint()
}

function getSessionId() {
  try {
    let id = localStorage.getItem(SESSION_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return null
  }
}

function ensureFingerprint() {
  if (fpPromise) return fpPromise
  fpPromise = (async () => {
    try {
      const agent = await FingerprintJS.load()
      const result = await agent.get()
      return {
        visitorId: result.visitorId ?? null,
        confidence: result.confidence?.score ?? null,
      }
    } catch (err) {
      warn('FingerprintJS failed', err)
      return { visitorId: null, confidence: null }
    }
  })()
  return fpPromise
}

async function waitForFingerprint(maxMs) {
  ensureFingerprint()
  const timeout = new Promise((resolve) => {
    setTimeout(() => resolve({ visitorId: null, confidence: null }), maxMs)
  })
  return Promise.race([fpPromise, timeout])
}

function shouldDebounce(eventType, pluginSlug) {
  const key = `${eventType}:${pluginSlug}`
  const last = debounceMap.get(key)
  return Boolean(last && Date.now() - last < DEBOUNCE_MS)
}

function markDebounce(eventType, pluginSlug) {
  debounceMap.set(`${eventType}:${pluginSlug}`, Date.now())
}

function getReferrer() {
  try {
    return document.referrer || null
  } catch {
    return null
  }
}

function getUserAgent() {
  try {
    return navigator.userAgent || ''
  } catch {
    return ''
  }
}

function buildBaseRow(eventType, pluginSlug, meta) {
  return {
    event_type: eventType,
    plugin_slug: pluginSlug,
    session_id: getSessionId(),
    referrer: getReferrer(),
    user_agent: getUserAgent(),
    meta: meta && typeof meta === 'object' ? meta : {},
  }
}

async function insertEvent(row) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('event_tracker').insert(row)
  if (error) throw error
}

async function sendDownloadClick(pluginSlug, meta) {
  const fp = await waitForFingerprint(DOWNLOAD_FP_WAIT_MS)
  const visitorId = fp.visitorId

  // Same fingerprint already counted for this plugin — disregard the event.
  if (visitorId) {
    if (hasLocalDownloadSeen(pluginSlug, visitorId)) return
    if (await hasServerDownloadSeen(pluginSlug, visitorId)) {
      markLocalDownloadSeen(pluginSlug, visitorId)
      return
    }
  }

  try {
    await insertEvent({
      ...buildBaseRow('download_click', pluginSlug, meta),
      visitor_id: visitorId,
      fp_confidence: fp.confidence,
    })
    markLocalDownloadSeen(pluginSlug, visitorId)
  } catch (err) {
    warn('download_click insert failed', err)
  }
}

async function sendSessionOnlyEvent(eventType, pluginSlug, meta) {
  try {
    await insertEvent({
      ...buildBaseRow(eventType, pluginSlug, meta),
      visitor_id: null,
      fp_confidence: null,
    })
  } catch (err) {
    warn(`${eventType} insert failed`, err)
  }
}

/**
 * Fire-and-forget event recording. Never throws or blocks the caller.
 */
export function recordEvent(eventType, pluginSlug, meta = {}) {
  try {
    if (!eventType || !pluginSlug || typeof window === 'undefined') return
    if (shouldDebounce(eventType, pluginSlug)) return
    markDebounce(eventType, pluginSlug)

    if (eventType === 'download_click') {
      void sendDownloadClick(pluginSlug, meta)
      return
    }

    void sendSessionOnlyEvent(eventType, pluginSlug, meta)
  } catch (err) {
    warn('recordEvent error', err)
  }
}

function parseRpcCount(data) {
  if (typeof data === 'number' && !Number.isNaN(data)) return data
  if (typeof data === 'string' && data.trim() !== '' && !Number.isNaN(Number(data))) {
    return Number(data)
  }
  if (Array.isArray(data) && data.length > 0) {
    return parseRpcCount(data[0])
  }
  if (data && typeof data === 'object') {
    const candidate = data.count ?? data.total ?? data.event_count
    if (candidate != null) return parseRpcCount(candidate)
  }
  return null
}

export async function getEventCount(pluginSlug, eventType = 'download_click') {
  try {
    if (!pluginSlug) return null
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.rpc('get_event_counts', {
      p_plugin_slug: pluginSlug,
      p_event_type: eventType,
    })
    if (error) throw error
    return parseRpcCount(data)
  } catch (err) {
    warn('getEventCount failed', err)
    return null
  }
}
