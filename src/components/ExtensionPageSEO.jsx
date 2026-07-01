import { useEffect } from 'react'

const SITE_URL = 'https://codedcitadel.com'
const DEFAULT_IMAGE = `${SITE_URL}/cc-logo.png`
const JSON_LD_ATTR = 'data-extension-page-seo'

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

function buildAggregateRating(analytics) {
  const ratingValue = analytics?.rating
  const reviewCount = analytics?.ratingCount ?? analytics?.reviewCount

  if (
    ratingValue == null ||
    ratingValue === '' ||
    reviewCount == null ||
    reviewCount === ''
  ) {
    return undefined
  }

  return {
    '@type': 'AggregateRating',
    ratingValue,
    reviewCount,
  }
}

export default function ExtensionPageSEO({ extension, canonicalUrl }) {
  useEffect(() => {
    if (!extension) return undefined

    const pageUrl = canonicalUrl ?? `${SITE_URL}/apps/${extension.slug}`
    const title = `${extension.name} — ${extension.tagline} | Coded Citadel`
    const description = extension.description?.short ?? ''
    const image =
      extension.chromeExtensionIcon ||
      extension.screenshots?.[0] ||
      DEFAULT_IMAGE

    const previousTitle = document.title
    document.title = title

    const managed = []

    managed.push(upsertMeta({ name: 'description', content: description }))
    managed.push(upsertMeta({ name: 'robots', content: 'index, follow' }))
    managed.push(upsertLink('canonical', pageUrl))

    managed.push(upsertMeta({ property: 'og:type', content: 'website' }))
    managed.push(upsertMeta({ property: 'og:site_name', content: 'Coded Citadel' }))
    managed.push(upsertMeta({ property: 'og:title', content: title }))
    managed.push(upsertMeta({ property: 'og:description', content: description }))
    managed.push(upsertMeta({ property: 'og:url', content: pageUrl }))
    managed.push(upsertMeta({ property: 'og:image', content: image }))

    managed.push(upsertMeta({ name: 'twitter:card', content: 'summary_large_image' }))
    managed.push(upsertMeta({ name: 'twitter:title', content: title }))
    managed.push(upsertMeta({ name: 'twitter:description', content: description }))
    managed.push(upsertMeta({ name: 'twitter:image', content: image }))

    const softwareApplication = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: extension.name,
      applicationCategory: 'BrowserApplication',
      operatingSystem: 'Google Chrome',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: extension.description?.short,
      url: pageUrl,
      downloadUrl: extension.chromeStoreUrl,
      dateModified: extension.lastUpdated,
      softwareVersion: extension.version,
      author: {
        '@type': 'Person',
        name: 'Coded Citadel',
        url: SITE_URL,
        sameAs: [
          'https://www.youtube.com/@CodedCitadel',
          'https://www.instagram.com/codedcitadel',
        ],
      },
    }

    const aggregateRating = buildAggregateRating(extension.analytics)
    if (aggregateRating) {
      softwareApplication.aggregateRating = aggregateRating
    }

    const jsonLd = [
      softwareApplication,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Apps',
            item: `${SITE_URL}/apps`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: extension.name,
            item: pageUrl,
          },
        ],
      },
    ]

    document.querySelector(`script[${JSON_LD_ATTR}]`)?.remove()

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute(JSON_LD_ATTR, 'true')
    script.textContent = JSON.stringify(jsonLd)
    document.head.appendChild(script)

    return () => {
      document.title = previousTitle

      for (const entry of managed) {
        restoreEntry({
          ...entry,
          attribute: entry.el.tagName === 'LINK' ? 'href' : 'content',
        })
      }

      script.remove()
    }
  }, [extension, canonicalUrl])

  return null
}
