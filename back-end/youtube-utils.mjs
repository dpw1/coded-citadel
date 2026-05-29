/** @param {string | null | undefined} input YouTube URL or 11-char video ID */
export function parseYoutubeVideoId(input) {
  if (!input) return null

  const value = String(input).trim()
  if (!value || value === '#') return null

  if (/^[\w-]{11}$/.test(value) && !/^1234567890/i.test(value)) {
    return value
  }

  try {
    const u = new URL(value)

    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      return isValidYoutubeId(id) ? id : null
    }

    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtube-nocookie.com')) {
      const fromQuery = u.searchParams.get('v')
      if (isValidYoutubeId(fromQuery)) return fromQuery

      const fromPath = u.pathname.match(/\/(?:embed|shorts|live|v)\/([\w-]{11})/)
      if (fromPath && isValidYoutubeId(fromPath[1])) return fromPath[1]
    }
  } catch {
    return null
  }

  return null
}

function isValidYoutubeId(id) {
  return Boolean(id && /^[\w-]{11}$/.test(id) && !/^1234567890/i.test(id))
}

export function youtubeThumbnailCandidates(videoId) {
  return [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  ]
}

/** Pick the best available YouTube thumbnail for a video ID. */
export async function resolveYoutubeThumbnail(videoId) {
  for (const url of youtubeThumbnailCandidates(videoId)) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
      if (!res.ok) continue

      const length = Number(res.headers.get('content-length') ?? 0)
      if (length > 0 && length < 1000) continue

      return url
    } catch {
      // try next candidate
    }
  }

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}
