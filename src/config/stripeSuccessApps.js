/**
 * Stripe /success routing — one registry entry per billable extension.
 *
 * Checkout success URL (set in Stripe / your billing worker):
 *   https://codedcitadel.com/success?app=<stripeAppId>&session_id={CHECKOUT_SESSION_ID}
 *
 * To add a new extension: append a row below (fulfill URL + app id). No changes to StripeSuccessPage.jsx.
 */
import {
  IDME_FULFILL_URL,
  IDME_SUPABASE_FULFILL_URL,
  ISP_FULFILL_URL,
  IVD_FULFILL_URL,
  IVD_SUPABASE_ANON_KEY,
  YFP_FULFILL_URL,
  YFP_STRIPE_APP_ID,
  YFP_SUPABASE_ANON_KEY,
} from './supabase'

/** When `app` is omitted, default to YouTube Filter Pro (legacy links). */
export const DEFAULT_STRIPE_SUCCESS_APP_ID = YFP_STRIPE_APP_ID

/**
 * @typedef {'youtube' | 'instagram' | 'other'} StripeSuccessPlatform
 */

/**
 * @typedef {{
 *   stripeAppId: string,
 *   aliases?: string[],
 *   fulfillUrl: string,
 *   fulfillFallbackUrl?: string,
 *   fulfillAppId?: string,
 *   supabaseAnonKey?: string,
 *   platform: StripeSuccessPlatform,
 *   stripeTestModeFromSession?: boolean,
 * }} StripeSuccessAppConfig
 */

/** @type {StripeSuccessAppConfig[]} */
export const STRIPE_SUCCESS_APPS = [
  {
    stripeAppId: YFP_STRIPE_APP_ID,
    aliases: ['yfp'],
    fulfillUrl: YFP_FULFILL_URL,
    platform: 'youtube',
  },
  {
    stripeAppId: 'ivd',
    fulfillUrl: IVD_FULFILL_URL,
    supabaseAnonKey: IVD_SUPABASE_ANON_KEY,
    platform: 'instagram',
  },
  {
    stripeAppId: 'instagram-dm-export',
    aliases: ['idme'],
    fulfillUrl: IDME_FULFILL_URL,
    fulfillFallbackUrl: IDME_SUPABASE_FULFILL_URL,
    supabaseAnonKey: YFP_SUPABASE_ANON_KEY,
    platform: 'instagram',
    stripeTestModeFromSession: true,
  },
  {
    stripeAppId: 'isp',
    aliases: ['custom-data'],
    fulfillUrl: ISP_FULFILL_URL,
    platform: 'instagram',
    stripeTestModeFromSession: true,
  },
]

/**
 * @param {string} appParam — `app` query value (empty → default YFP).
 * @returns {StripeSuccessAppConfig | null}
 */
export function resolveStripeSuccessApp(appParam) {
  const raw = String(appParam ?? '').trim()
  if (raw) {
    const lookup = raw.toLowerCase()
    for (const entry of STRIPE_SUCCESS_APPS) {
      if (entry.stripeAppId.toLowerCase() === lookup) return entry
      if (entry.aliases?.some((a) => a.toLowerCase() === lookup)) return entry
    }
    return null
  }
  return STRIPE_SUCCESS_APPS.find((e) => e.stripeAppId === DEFAULT_STRIPE_SUCCESS_APP_ID) ?? null
}

/**
 * @param {StripeSuccessAppConfig} app
 * @param {string} sessionId
 * @returns {Promise<Record<string, unknown>>}
 */
async function postStripeFulfill(url, app, sessionId, useAnon) {
  const headers = { 'Content-Type': 'application/json' }
  if (useAnon && app.supabaseAnonKey) {
    headers.Authorization = `Bearer ${app.supabaseAnonKey}`
    headers.apikey = app.supabaseAnonKey
  }

  const body = {
    session_id: sessionId,
    app: app.fulfillAppId || app.stripeAppId,
  }
  if (app.stripeTestModeFromSession && sessionId.startsWith('cs_test_')) {
    body.stripe_test_mode = true
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok && !data?.error) {
    return { ok: false, error: `http_${res.status}` }
  }
  return data
}

export async function fulfillStripeCheckoutSession(app, sessionId) {
  const primary = await postStripeFulfill(app.fulfillUrl, app, sessionId, false)
  if (primary?.ok || !app.fulfillFallbackUrl) {
    return primary
  }
  return postStripeFulfill(app.fulfillFallbackUrl, app, sessionId, true)
}

export function platformReturnLabel(platform) {
  switch (platform) {
    case 'instagram':
      return 'Instagram'
    case 'youtube':
      return 'YouTube'
    default:
      return 'your browser tab'
  }
}

export function fulfillErrorMessage(error, platform) {
  const where = platformReturnLabel(platform)
  switch (error) {
    case 'payment_not_complete':
      return `Payment is still processing. Return to ${where} or try again shortly.`
    case 'missing_session_id':
      return 'Invalid or incomplete link.'
    case 'unknown_app':
      return 'This checkout could not be matched to a product. Check the link or contact support.'
    case 'unsupported_app':
      return 'This product is not configured on the success page yet. Contact support with your receipt.'
    default:
      return `Couldn't load your license yet. Return to ${where} — Pro may still activate automatically.`
  }
}
