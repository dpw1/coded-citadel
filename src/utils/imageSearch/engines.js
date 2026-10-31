import { ENGINES } from './constants'

export function isMobileUserAgent(ua = typeof navigator !== 'undefined' ? navigator.userAgent : '') {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
}

export function enginesFor(engines = ENGINES, mobile = isMobileUserAgent()) {
  return engines.filter((engine) => engine.mobile !== false || !mobile)
}

export function buildEngineUrl(template, imageUrl) {
  return template.replace('{url}', encodeURIComponent(imageUrl))
}

export function engineLabel(engine) {
  if (engine.hint) return `${engine.name} — ${engine.hint}`
  return engine.name
}
