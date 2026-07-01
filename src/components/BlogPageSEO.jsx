import { useEffect } from 'react'
import { BLOG_SITE_URL } from '../utils/blog'

const DEFAULT_IMAGE = `${BLOG_SITE_URL}/cc-logo.png`
const JSON_LD_ATTR = 'data-blog-page-seo'

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

function resolveCanonicalUrl(post) {
  const selfUrl = `${BLOG_SITE_URL}/blog/${post.slug}`
  if (!post.canonicalUrl) return selfUrl
  if (post.canonicalUrl.startsWith(BLOG_SITE_URL)) return post.canonicalUrl
  return selfUrl
}

export function BlogIndexSEO() {
  useEffect(() => {
    const pageUrl = `${BLOG_SITE_URL}/blog`
    const title = 'Blog — Coded Citadel'
    const description =
      'Build logs, lessons, and updates from the journey of shipping Chrome extensions in public toward $100K.'

    const previousTitle = document.title
    document.title = title

    const managed = []
    managed.push(upsertMeta({ name: 'description', content: description }))
    managed.push(
      upsertMeta({
        name: 'robots',
        content: 'index, follow, max-snippet:-1, max-image-preview:large',
      }),
    )
    managed.push(upsertLink('canonical', pageUrl))

    managed.push(upsertMeta({ property: 'og:type', content: 'website' }))
    managed.push(upsertMeta({ property: 'og:site_name', content: 'Coded Citadel' }))
    managed.push(upsertMeta({ property: 'og:title', content: title }))
    managed.push(upsertMeta({ property: 'og:description', content: description }))
    managed.push(upsertMeta({ property: 'og:url', content: pageUrl }))
    managed.push(upsertMeta({ property: 'og:image', content: DEFAULT_IMAGE }))

    managed.push(upsertMeta({ name: 'twitter:card', content: 'summary_large_image' }))
    managed.push(upsertMeta({ name: 'twitter:title', content: title }))
    managed.push(upsertMeta({ name: 'twitter:description', content: description }))
    managed.push(upsertMeta({ name: 'twitter:image', content: DEFAULT_IMAGE }))

    document.querySelector(`script[${JSON_LD_ATTR}]`)?.remove()

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: BLOG_SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: pageUrl,
        },
      ],
    }

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
  }, [])

  return null
}

export function BlogPostSEO({ post }) {
  useEffect(() => {
    if (!post) return undefined

    const pageUrl = `${BLOG_SITE_URL}/blog/${post.slug}`
    const canonicalUrl = resolveCanonicalUrl(post)
    const title = `${post.title} | Coded Citadel`
    const description = post.description || post.title
    const image = post.coverImageUrl || DEFAULT_IMAGE

    const previousTitle = document.title
    document.title = title

    const managed = []
    managed.push(upsertMeta({ name: 'description', content: description }))
    managed.push(
      upsertMeta({
        name: 'robots',
        content: 'index, follow, max-snippet:-1, max-image-preview:large',
      }),
    )
    managed.push(upsertLink('canonical', canonicalUrl))

    managed.push(upsertMeta({ property: 'og:type', content: 'article' }))
    managed.push(upsertMeta({ property: 'og:site_name', content: 'Coded Citadel' }))
    managed.push(upsertMeta({ property: 'og:title', content: post.title }))
    managed.push(upsertMeta({ property: 'og:description', content: description }))
    managed.push(upsertMeta({ property: 'og:url', content: pageUrl }))
    managed.push(upsertMeta({ property: 'og:image', content: image }))
    managed.push(upsertMeta({ property: 'article:published_time', content: post.date }))

    for (const tag of post.tags ?? []) {
      managed.push(upsertMeta({ property: 'article:tag', content: tag }))
    }

    managed.push(upsertMeta({ name: 'twitter:card', content: 'summary_large_image' }))
    managed.push(upsertMeta({ name: 'twitter:title', content: post.title }))
    managed.push(upsertMeta({ name: 'twitter:description', content: description }))
    managed.push(upsertMeta({ name: 'twitter:image', content: image }))

    document.querySelector(`script[${JSON_LD_ATTR}]`)?.remove()

    const article = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description,
      image: [image],
      datePublished: post.date,
      dateModified: post.date,
      author: {
        '@type': 'Person',
        name: 'Coded Citadel',
        url: BLOG_SITE_URL,
        sameAs: [
          'https://www.youtube.com/@CodedCitadel',
          'https://www.instagram.com/codedcitadel',
          'https://x.com/codedCitadel2',
        ],
      },
      publisher: {
        '@type': 'Organization',
        name: 'Coded Citadel',
        url: BLOG_SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: DEFAULT_IMAGE,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageUrl,
      },
      url: pageUrl,
    }

    if (post.canonicalUrl && !post.canonicalUrl.startsWith(BLOG_SITE_URL)) {
      article.isBasedOn = post.canonicalUrl
    }

    const jsonLd = [
      article,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BLOG_SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: `${BLOG_SITE_URL}/blog`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: pageUrl,
          },
        ],
      },
    ]

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
  }, [post])

  return null
}
