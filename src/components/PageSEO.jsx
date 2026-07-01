import { useEffect, useMemo } from 'react'
import { applyPageSeo, DEFAULT_OG_IMAGE } from '../utils/seo'

export default function PageSEO({
  title,
  description,
  socialDescription,
  canonicalPath,
  canonicalUrl,
  robots = 'index, follow',
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  ogTitle,
  jsonLd,
}) {
  const canonical = canonicalUrl ?? `https://codedcitadel.com${canonicalPath}`
  const jsonLdKey = useMemo(() => (jsonLd ? JSON.stringify(jsonLd) : ''), [jsonLd])

  useEffect(() => {
    return applyPageSeo({
      title,
      description,
      ogDescription: socialDescription,
      canonical,
      robots,
      ogType,
      ogImage,
      ogTitle,
      jsonLd,
    })
  }, [
    title,
    description,
    socialDescription,
    canonical,
    robots,
    ogType,
    ogImage,
    ogTitle,
    jsonLdKey,
  ])

  return null
}
