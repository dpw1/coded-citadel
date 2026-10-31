import {
  IMAGE_SEARCH_STORAGE_BUCKET,
  LINK_TTL_SECONDS,
  getImageSearchApiBase,
  isSupabaseUploadConfigured,
} from './constants'
import { getImageSearchSupabase } from '../../config/imageSearchSupabase'
import { errorKeyFor, normalizeImageFile } from './validation'

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

function storagePathFor(file) {
  const ext = MIME_EXT[file.type] ?? 'bin'
  return `u/${crypto.randomUUID()}.${ext}`
}

async function uploadViaSupabase(file) {
  const normalized = normalizeImageFile(file)
  const supabase = getImageSearchSupabase()
  if (!supabase) {
    const err = new Error('unavailable')
    err.status = 503
    throw err
  }

  const path = storagePathFor(normalized)
  const { error: uploadError } = await supabase.storage
    .from(IMAGE_SEARCH_STORAGE_BUCKET)
    .upload(path, normalized, {
      contentType: normalized.type,
      cacheControl: 'max-age=900',
      upsert: false,
    })

  if (uploadError) {
    const err = new Error(uploadError.message)
    const code = uploadError.statusCode ?? uploadError.status
    if (/payload too large|413|exceeded/i.test(uploadError.message)) err.status = 422
    else if (/rate|429/i.test(uploadError.message)) err.status = 429
    else if (code === 403 || /row-level security|policy/i.test(uploadError.message)) err.status = 403
    else err.status = typeof code === 'number' ? code : 503
    throw err
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(IMAGE_SEARCH_STORAGE_BUCKET)
    .createSignedUrl(path, LINK_TTL_SECONDS)

  if (signError || !signed?.signedUrl) {
    await supabase.storage.from(IMAGE_SEARCH_STORAGE_BUCKET).remove([path])
    const err = new Error(signError?.message ?? 'sign failed')
    err.status = 503
    throw err
  }

  return {
    getUrl: signed.signedUrl,
    key: path,
    expiresIn: LINK_TTL_SECONDS,
    backend: 'supabase',
  }
}

async function uploadViaWorker(file, presignUrl) {
  let presigned
  try {
    const res = await fetch(presignUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ content_type: file.type }),
    })
    if (!res.ok) {
      const err = new Error('presign failed')
      err.status = res.status
      throw err
    }
    presigned = await res.json()
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) throw err
    const offline = new Error('offline')
    offline.status = 0
    throw offline
  }

  const uploadUrl = presigned.upload?.url ?? presigned.upload_url
  const method = presigned.upload?.method ?? 'PUT'
  const headers = presigned.upload?.headers ?? { 'Content-Type': file.type }

  if (!uploadUrl || !presigned.get_url) {
    const err = new Error('invalid presign response')
    err.status = 503
    throw err
  }

  const up = await fetch(uploadUrl, { method, headers, body: file })
  if (!up.ok) {
    const err = new Error('upload failed')
    err.status = up.status
    throw err
  }

  return {
    getUrl: presigned.get_url,
    key: presigned.key,
    expiresIn: presigned.expires_in ?? LINK_TTL_SECONDS,
    backend: 'worker',
  }
}

/**
 * Upload file and return a URL search engines can fetch (15-minute TTL).
 * Uses Supabase Storage when configured, else Cloudflare Worker presign.
 */
export async function uploadFile(file) {
  if (isSupabaseUploadConfigured()) {
    return uploadViaSupabase(file)
  }

  const base = getImageSearchApiBase()
  if (base) {
    return uploadViaWorker(file, `${base}/v1/uploads`)
  }

  const err = new Error('unavailable')
  err.status = 503
  throw err
}

export { errorKeyFor }

export async function deleteUpload(key) {
  if (!key) return

  if (isSupabaseUploadConfigured()) {
    const supabase = getImageSearchSupabase()
    if (!supabase) return
    try {
      await supabase.storage.from(IMAGE_SEARCH_STORAGE_BUCKET).remove([key])
    } catch {
      /* best-effort */
    }
    return
  }

  const apiBase = getImageSearchApiBase()
  if (!apiBase) return
  try {
    await fetch(`${apiBase}/v1/uploads`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ key }),
    })
  } catch {
    /* best-effort */
  }
}
