import { ALLOWED_TYPES, MAX_BYTES } from './constants'

export function validateFile(file, { maxBytes = MAX_BYTES, allowedTypes = ALLOWED_TYPES } = {}) {
  if (!file || !allowedTypes.includes(file.type)) {
    return { valid: false, reason: 'type' }
  }
  if (file.size > maxBytes) {
    return { valid: false, reason: 'size' }
  }
  return { valid: true }
}

export function isSearchableUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function errorKeyFor(response) {
  if (!response) return 'uploadFailed'
  const status = response.status ?? response
  if (status === 429) return 'rateLimited'
  if (status === 503) return 'unavailable'
  if (status === 422) return 'type'
  if (status === 0) return 'offline'
  return 'uploadFailed'
}
