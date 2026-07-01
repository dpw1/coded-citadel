export const SITE_URL = 'https://codedcitadel.com'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/cc-logo.png`
export const SITE_NAME = 'Coded Citadel'

export function upsertMeta({ name, property, content }) {
  const selector = property
    ? `meta[property="${property}"]`
    : `meta[name="${name}"]`
  let el = document.querySelector(selector)
  const created = !el

  if (!el) {
    el = document.createElement('meta')
    if (property) el.setAttribute('property', property)
    else el.setAttribute('name', name)
    document.head.appendChild(el)
  }

  const previousValue = el.getAttribute('content')
  el.setAttribute('content', content)

  return { el, created, previousValue }
}

export function upsertLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`)
  const created = !el

  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }

  const previousValue = el.getAttribute('href')
  el.setAttribute('href', href)

  return { el, created, previousValue }
}

export function restoreSeoEntry({ el, created, previousValue, attribute = 'content' }) {
  if (created) {
    el.remove()
    return
  }

  if (previousValue != null) {
    el.setAttribute(attribute, previousValue)
  }
}

export function applyPageSeo({
  title,
  description,
  ogDescription,
  canonical,
  robots = 'index, follow',
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  ogTitle,
  jsonLd,
  jsonLdAttr = 'data-page-seo',
}) {
  const previousTitle = document.title
  document.title = title

  const managed = []
  const socialDescription = ogDescription ?? description

  managed.push(upsertMeta({ name: 'description', content: description }))
  managed.push(upsertMeta({ name: 'robots', content: robots }))
  managed.push(upsertLink('canonical', canonical))

  managed.push(upsertMeta({ property: 'og:type', content: ogType }))
  managed.push(upsertMeta({ property: 'og:site_name', content: SITE_NAME }))
  managed.push(upsertMeta({ property: 'og:title', content: ogTitle ?? title }))
  managed.push(upsertMeta({ property: 'og:description', content: socialDescription }))
  managed.push(upsertMeta({ property: 'og:url', content: canonical }))
  managed.push(upsertMeta({ property: 'og:image', content: ogImage }))

  managed.push(upsertMeta({ name: 'twitter:card', content: 'summary_large_image' }))
  managed.push(upsertMeta({ name: 'twitter:title', content: ogTitle ?? title }))
  managed.push(upsertMeta({ name: 'twitter:description', content: socialDescription }))
  managed.push(upsertMeta({ name: 'twitter:image', content: ogImage }))

  let script = null
  if (jsonLd) {
    document.querySelector(`script[${jsonLdAttr}]`)?.remove()
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute(jsonLdAttr, 'true')
    script.textContent = JSON.stringify(jsonLd)
    document.head.appendChild(script)
  }

  return () => {
    document.title = previousTitle

    for (const entry of managed) {
      restoreSeoEntry({
        ...entry,
        attribute: entry.el.tagName === 'LINK' ? 'href' : 'content',
      })
    }

    script?.remove()
  }
}
