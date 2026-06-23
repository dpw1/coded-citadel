import crypto from 'node:crypto'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'

let cachedToken = null
let cachedExpiry = 0

function base64url(value) {
  return Buffer.from(value).toString('base64url')
}

function normalizePrivateKey(privateKey) {
  return String(privateKey || '').replace(/\\n/g, '\n')
}

export function createServiceAccountJwt({ clientEmail, privateKey, scopes }) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claim = {
    iss: clientEmail,
    scope: scopes.join(' '),
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  }

  const encodedHeader = base64url(JSON.stringify(header))
  const encodedClaim = base64url(JSON.stringify(claim))
  const signInput = `${encodedHeader}.${encodedClaim}`

  const signer = crypto.createSign('RSA-SHA256')
  signer.update(signInput)
  signer.end()

  const signature = signer.sign(normalizePrivateKey(privateKey), 'base64url')
  return `${signInput}.${signature}`
}

export async function getServiceAccountAccessToken({
  clientEmail,
  privateKey,
  scopes = ['https://www.googleapis.com/auth/analytics.readonly'],
}) {
  const now = Date.now()
  if (cachedToken && now < cachedExpiry - 60_000) {
    return cachedToken
  }

  const assertion = createServiceAccountJwt({ clientEmail, privateKey, scopes })
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error_description || data?.error || res.statusText
    throw new Error(`Google service account auth failed: ${msg}`)
  }

  if (!data.access_token) {
    throw new Error('Google service account auth did not return access_token')
  }

  cachedToken = data.access_token
  cachedExpiry = now + (Number(data.expires_in) || 3600) * 1000
  return cachedToken
}
