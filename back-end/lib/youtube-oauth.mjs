import { loadEnv } from './load-env.mjs'

const OAUTH_TOKEN = 'https://oauth2.googleapis.com/token'

let cachedToken = null
let cachedExpiry = 0

export function getYoutubeOAuthEnv() {
  loadEnv()
  return {
    clientId: process.env.YOUTUBE_ANALYTICS_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_ANALYTICS_SECRET,
    accessToken: process.env.YOUTUBE_ANALYTICS_ACCESS_TOKEN,
    refreshToken: process.env.YOUTUBE_ANALYTICS_REFRESH_TOKEN,
    apiKey: process.env.YOUTUBE_API_KEY,
  }
}

export function hasYoutubeAnalyticsEnv(env = getYoutubeOAuthEnv()) {
  return Boolean(
    env.clientId &&
      env.clientSecret &&
      (env.refreshToken || env.accessToken),
  )
}

async function refreshAccessToken({ clientId, clientSecret, refreshToken }) {
  const res = await fetch(OAUTH_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error_description || data?.error || res.statusText
    throw new Error(`YouTube OAuth token refresh failed: ${msg}`)
  }

  if (!data.access_token) {
    throw new Error('YouTube OAuth token refresh did not return access_token')
  }

  return data.access_token
}

export async function getYoutubeAccessToken(env = getYoutubeOAuthEnv()) {
  const now = Date.now()
  if (cachedToken && now < cachedExpiry - 60_000) {
    return cachedToken
  }

  if (env.accessToken && env.refreshToken) {
    cachedToken = env.accessToken
    cachedExpiry = now + 5 * 60 * 1000
    return cachedToken
  }

  if (env.accessToken && !env.refreshToken) {
    cachedToken = env.accessToken
    cachedExpiry = now + 30 * 60 * 1000
    return cachedToken
  }

  if (!env.refreshToken) {
    throw new Error('Missing YOUTUBE_ANALYTICS_REFRESH_TOKEN or YOUTUBE_ANALYTICS_ACCESS_TOKEN')
  }

  cachedToken = await refreshAccessToken(env)
  cachedExpiry = now + 55 * 60 * 1000
  return cachedToken
}

export function clearYoutubeTokenCache() {
  cachedToken = null
  cachedExpiry = 0
}
