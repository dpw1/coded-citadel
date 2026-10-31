import { ALLOWED_TYPES, MAX_BYTES } from './constants'

const EXT_TO_MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

/** Drag-and-drop from the OS often omits file.type (especially on Windows). */
export function normalizeImageFile(file) {
  if (!file) return null
  if (file.type && ALLOWED_TYPES.includes(file.type)) return file

  const name = file.name || ''
  const ext = name.includes('.') ? name.split('.').pop()?.toLowerCase() : ''
  const type = ext ? EXT_TO_MIME[ext] : null
  if (!type) return file

  return new File([file], name || `image.${ext}`, {
    type,
    lastModified: file.lastModified,
  })
}

export function validateFile(file, { maxBytes = MAX_BYTES, allowedTypes = ALLOWED_TYPES } = {}) {
  const normalized = normalizeImageFile(file)
  if (!normalized || !allowedTypes.includes(normalized.type)) {
    return { valid: false, reason: 'type', file: normalized }
  }
  if (normalized.size > maxBytes) {
    return { valid: false, reason: 'size', file: normalized }
  }
  return { valid: true, file: normalized }
}

export function isSearchableUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function errorKeyFor(err) {
  if (!err) return 'uploadFailed'
  const message = typeof err.message === 'string' ? err.message.toLowerCase() : ''
  if (/row-level security|policy|jwt|invalid api key|apikey|bucket not found|does not exist/.test(message)) {
    return 'uploadFailed'
  }
  const status = err.status ?? err
  if (status === 429) return 'rateLimited'
  if (status === 403) return 'uploadFailed'
  if (status === 503) return 'unavailable'
  if (status === 422) return 'type'
  if (status === 0) return 'offline'
  return 'uploadFailed'
}
