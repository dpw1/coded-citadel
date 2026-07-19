import { useEffect, useMemo } from 'react'
import {
  buildHomeMetaDescriptionSearch,
  buildHomeMetaDescriptionSocial,
} from '../utils/homeMetaDescription'
import { applyPageSeo, DEFAULT_OG_IMAGE, SITE_URL } from '../utils/seo'
import { getSiteStats } from '../utils/siteStats'

const HOME_TITLE = 'Coded Citadel — Coding in Public Until I Make $100k USD'

export default function HomePageSEO() {
  const stats = useMemo(() => getSiteStats(), [])
  const searchDescription = useMemo(
    () => buildHomeMetaDescriptionSearch(stats),
    [stats],
  )
  const socialDescription = useMemo(
    () => buildHomeMetaDescriptionSocial(stats),
    [stats],
  )

  useEffect(() => {
    return applyPageSeo({
      title: HOME_TITLE,
      description: searchDescription,
      ogDescription: socialDescription,
      canonical: `${SITE_URL}/`,
      robots: 'index, follow',
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
    })
  }, [searchDescription, socialDescription])

  return null
}
