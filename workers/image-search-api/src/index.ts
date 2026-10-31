import { AwsClient } from 'aws4fetch'

const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
const ALLOWED_ORIGINS = new Set(['https://codedcitadel.com', 'http://localhost:5173', 'http://127.0.0.1:5173'])

export interface Env {
  UPLOADS: R2Bucket
  UPLOAD_INDEX: KVNamespace
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
  R2_ACCOUNT_ID: string
  R2_BUCKET_NAME: string
  MAX_BYTES: string
  LINK_TTL_SECONDS: string
  PURGE_AGE_SECONDS: string
}

function parseIntEnv(value: string, fallback: number) {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

function corsHeaders(origin: string | null): HeadersInit {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://codedcitadel.com'
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
  }
}

function jsonResponse(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

function awsClient(env: Env) {
  return new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    service: 's3',
    region: 'auto',
  })
}

function r2Host(env: Env) {
  return `${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
}

function objectUrl(env: Env, key: string) {
  return `https://${r2Host(env)}/${env.R2_BUCKET_NAME}/${key}`
}

async function presignedPut(env: Env, key: string, contentType: string, expiresSec: number) {
  const client = awsClient(env)
  const url = objectUrl(env, key)
  const signed = await client.sign(
    new Request(url, { method: 'PUT', headers: { 'Content-Type': contentType } }),
    { aws: { signQuery: true, expires: expiresSec } },
  )
  return signed.url
}

async function presignedGet(env: Env, key: string, expiresSec: number) {
  const client = awsClient(env)
  const url = objectUrl(env, key)
  const signed = await client.sign(new Request(url, { method: 'GET' }), {
    aws: { signQuery: true, expires: expiresSec },
  })
  return signed.url
}

async function rateLimit(env: Env, ip: string): Promise<boolean> {
  const windowKey = `rl:${ip}:${Math.floor(Date.now() / 60_000)}`
  const current = Number.parseInt((await env.UPLOAD_INDEX.get(windowKey)) ?? '0', 10)
  if (current >= 30) return false
  await env.UPLOAD_INDEX.put(windowKey, String(current + 1), { expirationTtl: 120 })
  return true
}

async function handlePresign(request: Request, env: Env, origin: string | null) {
  const maxBytes = parseIntEnv(env.MAX_BYTES, 15_728_640)
  const linkTtl = parseIntEnv(env.LINK_TTL_SECONDS, 900)

  if (!(await rateLimit(env, request.headers.get('CF-Connecting-IP') ?? 'unknown'))) {
    return jsonResponse({ error: 'rate_limited' }, 429, origin)
  }

  let body: { content_type?: string }
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 422, origin)
  }

  const contentType = body.content_type ?? ''
  if (!ALLOWED_TYPES.has(contentType)) {
    return jsonResponse({ error: 'invalid_type' }, 422, origin)
  }

  const key = `u/${crypto.randomUUID()}`
  const deleteAfter = Date.now() + linkTtl * 1000

  try {
    const [putUrl, getUrl] = await Promise.all([
      presignedPut(env, key, contentType, linkTtl),
      presignedGet(env, key, linkTtl),
    ])

    await env.UPLOAD_INDEX.put(`obj:${key}`, JSON.stringify({ deleteAfter, contentType }), {
      expirationTtl: linkTtl + 3600,
    })

    return jsonResponse(
      {
        key,
        upload: {
          url: putUrl,
          method: 'PUT',
          headers: { 'Content-Type': contentType },
        },
        get_url: getUrl,
        expires_in: linkTtl,
        max_bytes: maxBytes,
      },
      200,
      origin,
    )
  } catch {
    return jsonResponse({ error: 'unavailable' }, 503, origin)
  }
}

async function handleDelete(request: Request, env: Env, origin: string | null) {
  let body: { key?: string }
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 422, origin)
  }
  const key = body.key ?? ''
  if (!key.startsWith('u/')) {
    return jsonResponse({ error: 'invalid_key' }, 422, origin)
  }
  await env.UPLOADS.delete(key)
  await env.UPLOAD_INDEX.delete(`obj:${key}`)
  return jsonResponse({ ok: true }, 200, origin)
}

async function purgeExpired(env: Env) {
  const purgeAgeMs = parseIntEnv(env.PURGE_AGE_SECONDS, 900) * 1000
  const now = Date.now()
  let cursor: string | undefined
  do {
    const list = await env.UPLOAD_INDEX.list({ prefix: 'obj:', cursor, limit: 100 })
    for (const entry of list.keys) {
      const raw = await env.UPLOAD_INDEX.get(entry.name)
      if (!raw) continue
      let deleteAfter = now - purgeAgeMs - 1
      try {
        deleteAfter = JSON.parse(raw).deleteAfter ?? deleteAfter
      } catch {
        /* use fallback */
      }
      const key = entry.name.replace(/^obj:/, '')
      if (now >= deleteAfter) {
        await env.UPLOADS.delete(key)
        await env.UPLOAD_INDEX.delete(entry.name)
      }
    }
    cursor = list.list_complete ? undefined : list.cursor
  } while (cursor)

  const listed = await env.UPLOADS.list({ prefix: 'u/' })
  for (const obj of listed.objects) {
    if (obj.uploaded && now - obj.uploaded.getTime() >= purgeAgeMs) {
      await env.UPLOADS.delete(obj.key)
      await env.UPLOAD_INDEX.delete(`obj:${obj.key}`)
    }
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = request.headers.get('Origin')
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    if (url.pathname === '/v1/uploads' && request.method === 'POST') {
      if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_ACCOUNT_ID) {
        return jsonResponse({ error: 'unavailable' }, 503, origin)
      }
      return handlePresign(request, env, origin)
    }

    if (url.pathname === '/v1/uploads' && request.method === 'DELETE') {
      return handleDelete(request, env, origin)
    }

    if (url.pathname === '/health') {
      return jsonResponse({ ok: true }, 200, origin)
    }

    return jsonResponse({ error: 'not_found' }, 404, origin)
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(purgeExpired(env))
  },
}
