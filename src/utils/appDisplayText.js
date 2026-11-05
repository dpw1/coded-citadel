/** Heuristic: Chrome Web Store scrapes sometimes land in pt-BR — keep public UI in English. */

const NON_ENGLISH_MARKERS =
  /\b(mostra|pesquise|gerencie|engajamento|visualiza|curtidos|assistir|minha atividade|seus|suas|não|para o|com um|estilo do|vídeos|comentários)\b/i

const NON_ENGLISH_DIACRITICS = /[àáâãéêíóôõúç]/i

export function isLikelyEnglish(text) {
  if (!text || typeof text !== 'string') return false
  const trimmed = text.trim()
  if (!trimmed) return false
  if (NON_ENGLISH_DIACRITICS.test(trimmed)) return false
  if (NON_ENGLISH_MARKERS.test(trimmed)) return false
  return true
}

function firstSentence(text) {
  if (!text || typeof text !== 'string') return ''
  const line = text.trim().split('\n')[0]?.trim() ?? ''
  const match = line.match(/^[^.!?]+[.!?]?/)
  return match ? match[0].trim() : line
}

/** Best-effort English tagline for cards, hero, and SEO. */
export function resolveEnglishTagline(app, options = {}) {
  if (!app) return ''

  const { preferStoreTagline = false } = options

  const candidates = preferStoreTagline
    ? [
        app.taglineEn,
        app.tagline,
        app.description?.short,
        firstSentence(app.description?.full),
      ]
    : [
        app.taglineEn,
        app.description?.short,
        app.tagline,
        firstSentence(app.description?.full),
      ]

  for (const candidate of candidates) {
    if (isLikelyEnglish(candidate)) return candidate.trim()
  }

  return preferStoreTagline
    ? (app.tagline || app.description?.short || '').trim()
    : (app.description?.short || app.tagline || '').trim()
}

/** English listing title (Chrome name before colon when that part is English). */
export function resolveEnglishFilterLabel(app) {
  const name = app?.name ?? ''
  const short = name.split(':')[0]?.trim()
  if (short && isLikelyEnglish(short)) return short
  if (name && isLikelyEnglish(name)) return name.trim()
  if (short) return short
  return name.trim() || app?.slug || 'Extension'
}
