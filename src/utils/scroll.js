const SECTION_SCROLL_MARGIN = '5.5rem'

export function scrollToSection(id, { updateHash = false } = {}) {
  const el = document.getElementById(id)
  if (!el) return false

  if (updateHash) {
    window.history.replaceState(null, '', `#${id}`)
  }

  const prevMargin = el.style.scrollMarginTop
  if (!el.style.scrollMarginTop) {
    el.style.scrollMarginTop = SECTION_SCROLL_MARGIN
  }

  el.scrollIntoView({ behavior: 'smooth', block: 'start' })

  if (!prevMargin) {
    window.setTimeout(() => {
      el.style.scrollMarginTop = prevMargin
    }, 800)
  }

  return true
}
