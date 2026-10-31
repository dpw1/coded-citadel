export const MAX_BYTES = 15 * 1024 * 1024
export const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
export const ACCEPT_ATTR = ALLOWED_TYPES.join(',')
export const LINK_TTL_MS = 15 * 60 * 1000

export const STATUSES = {
  uploading: 'Uploading…',
  ready: 'Image ready',
}

export const MESSAGES = {
  type: "That file type isn't supported. Use JPEG, PNG, WebP or GIF.",
  size: 'That image is too large. The limit is 15 MB.',
  rateLimited: 'Too many searches from your network. Please try again in a minute.',
  unavailable: 'Image search is temporarily unavailable. Please try again later.',
  uploadNotConfigured:
    'File upload is not configured on this site. Add Supabase keys to your build, or paste a public image URL below.',
  uploadFailed:
    'Upload failed. Check that the image-search-uploads bucket exists and storage policies are applied (see supabase/image-search-storage.sql).',
  offline: 'You appear to be offline. Check your connection and try again.',
  expired: 'That upload expired. Please choose the image again.',
  invalidUrl: 'Enter a valid http or https image URL.',
}

export const ENGINES = [
  {
    id: 'google',
    name: 'Google Lens',
    template: 'https://lens.google.com/uploadbyurl?url={url}',
    mobile: true,
    hint: '',
    icon: '/image-search/engines/google.svg',
    borderClass: 'CC__image-search__engine--google',
  },
  {
    id: 'yandex',
    name: 'Yandex',
    template: 'https://yandex.com/images/search?rpt=imageview&url={url}',
    mobile: true,
    hint: '',
    icon: '/image-search/engines/yandex.svg',
    borderClass: 'CC__image-search__engine--yandex',
  },
  {
    id: 'bing',
    name: 'Bing Visual',
    template: 'https://www.bing.com/images/searchbyimage?cbir=sbi&imgurl={url}',
    mobile: false,
    hint: '',
    icon: '/image-search/engines/bing.svg',
    borderClass: 'CC__image-search__engine--bing',
  },
  {
    id: 'tineye',
    name: 'TinEye',
    template: 'https://tineye.com/search?url={url}',
    mobile: true,
    hint: '',
    icon: '/image-search/engines/tineye.svg',
    borderClass: 'CC__image-search__engine--tineye',
  },
]

/** Worker base URL without trailing slash; empty = uploads disabled. */
export function getImageSearchApiBase() {
  const raw = import.meta.env.VITE_IMAGE_SEARCH_API_URL
  if (!raw || typeof raw !== 'string') return ''
  return raw.replace(/\/$/, '')
}

export function presignUploadUrl() {
  const base = getImageSearchApiBase()
  return base ? `${base}/v1/uploads` : ''
}

/** Supabase Storage bucket (private; signed URLs for engines). */
export const IMAGE_SEARCH_STORAGE_BUCKET = 'image-search-uploads'
export const LINK_TTL_SECONDS = 900

export function getSupabaseUrl() {
  const raw = import.meta.env.VITE_SUPABASE_URL
  return typeof raw === 'string' ? raw.replace(/\/$/, '') : ''
}

export function getSupabasePublishableKey() {
  const raw =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_IMAGE_SEARCH_SUPABASE_ANON_KEY
  return typeof raw === 'string' ? raw.trim() : ''
}

export function isSupabaseUploadConfigured() {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey())
}

/** File upload available (Supabase Storage or Cloudflare Worker). */
export function isUploadConfigured() {
  return isSupabaseUploadConfigured() || Boolean(getImageSearchApiBase())
}
