function slugifyHeading(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 72)
}

/**
 * Inject stable ids into h2 headings and build a table of contents (## only).
 */
export function prepareBlogContentHtml(html) {
  if (!html) return { html: '', toc: [] }

  const doc = new DOMParser().parseFromString(`<div id="blog-root">${html}</div>`, 'text/html')
  const root = doc.getElementById('blog-root')
  if (!root) return { html, toc: [] }

  const toc = []
  const usedIds = new Set()

  for (const heading of root.querySelectorAll('h2')) {
    const text = heading.textContent?.trim()
    if (!text) continue

    let id = heading.getAttribute('id')?.trim()

    if (!id) {
      const base = slugifyHeading(text) || 'section'
      id = base
      let suffix = 2
      while (usedIds.has(id)) {
        id = `${base}-${suffix}`
        suffix += 1
      }
      heading.setAttribute('id', id)
    }

    usedIds.add(id)
    toc.push({ id, text, level: 2 })
  }

  return { html: root.innerHTML, toc }
}

export function scrollToBlogSection(id) {
  const el = document.getElementById(id)
  if (!el) return

  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.history.replaceState(null, '', `#${id}`)
}
