import { useEffect, useMemo } from 'react'
import { buildHomeMetaDescription } from '../utils/homeMetaDescription'
import { getSiteStats } from '../utils/siteStats'

const SITE_URL = 'https://codedcitadel.com'
const HOME_TITLE = 'Coded Citadel — Building in Public from $0 to $100K'
const HOME_IMAGE = `${SITE_URL}/cc-logo.png`

function upsertMeta({ name, property, content }) {
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

function upsertLink(rel, href) {
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

function restoreEntry({ el, created, previousValue, attribute = 'content' }) {
  if (created) {
    el.remove()
    return
  }

  if (previousValue != null) {
    el.setAttribute(attribute, previousValue)
  }
}

export default function HomePageSEO() {
  const homeDescription = useMemo(
    () => buildHomeMetaDescription(getSiteStats()),
    [],
  )

  useEffect(() => {
    const previousTitle = document.title
    document.title = HOME_TITLE

    const managed = []

    managed.push(upsertMeta({ name: 'description', content: homeDescription }))
    managed.push(upsertMeta({ name: 'robots', content: 'index, follow' }))
    managed.push(upsertLink('canonical', `${SITE_URL}/`))

    managed.push(upsertMeta({ property: 'og:type', content: 'website' }))
    managed.push(upsertMeta({ property: 'og:site_name', content: 'Coded Citadel' }))
    managed.push(upsertMeta({ property: 'og:title', content: HOME_TITLE }))
    managed.push(upsertMeta({ property: 'og:description', content: homeDescription }))
    managed.push(upsertMeta({ property: 'og:url', content: `${SITE_URL}/` }))
    managed.push(upsertMeta({ property: 'og:image', content: HOME_IMAGE }))

    managed.push(upsertMeta({ name: 'twitter:card', content: 'summary_large_image' }))
    managed.push(upsertMeta({ name: 'twitter:title', content: HOME_TITLE }))
    managed.push(upsertMeta({ name: 'twitter:description', content: homeDescription }))
    managed.push(upsertMeta({ name: 'twitter:image', content: HOME_IMAGE }))

    return () => {
      document.title = previousTitle

      for (const entry of managed) {
        restoreEntry({
          ...entry,
          attribute: entry.el.tagName === 'LINK' ? 'href' : 'content',
        })
      }
    }
  }, [homeDescription])

  return null
}
