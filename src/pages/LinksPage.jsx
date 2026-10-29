import { useMemo } from 'react'
import PageSEO from '../components/PageSEO'
import LinksHubCell from '../components/linksHub/LinksHubCell'
import LinksHubHero from '../components/linksHub/LinksHubHero'
import { YT_FILTER_PRO_STORE_URL } from '../constants/chromeWebStore'
import { appIconUrl, getAppBySource } from '../utils/apps'
import '../App.css'
import '../components/linksHub/linksHub.css'

const LINKS_DESCRIPTION =
  'Chrome extensions that make your life easier. 100% privacy-friendly, no AI-slop. Built by a senior developer.'

const LINK_PAGE_ITEMS = [
  {
    href: YT_FILTER_PRO_STORE_URL,
    chromeExtensionId: 'dbkkcbfafkckhmefkpgnelikibobcabb',
    title: 'YouTube Filter Pro',
    summary:
      'Add 40+ search filters & sorting to YouTube: upload date, duration, subscribers & more. 2k+ daily active users.',
  },
  {
    href: 'https://chromewebstore.google.com/detail/hgojieiehkjgjhdnbglfhbcojeeggigi',
    chromeExtensionId: 'hgojieiehkjgjhdnbglfhbcojeeggigi',
    title: 'Instagram DM Exporter',
    summary:
      'Download your Instagram conversations in one click, including all media. It can also convert all audio messages to text.',
  },
  {
    href: 'https://chromewebstore.google.com/detail/ig-reels-insight-view-per/flgffomdohbmbdcofkpoladpilbmohfj',
    chromeExtensionId: 'flgffomdohbmbdcofkpoladpilbmohfj',
    title: 'Instagram Reels Insight',
    summary:
      'Analyze the growth and engagement rate of any Instagram account. Find what reels helped the account grow.',
  },
  {
    href: 'https://chromewebstore.google.com/detail/saved-posts-exporter-for/ielboamnlillhhdacfhanhgmjgpamgck',
    chromeExtensionId: 'ielboamnlillhhdacfhanhgmjgpamgck',
    title: 'Instagram: Saved Posts Exporter',
    summary: 'Easily download and manage your saved collections.',
  },
]

export default function LinksPage() {
  const linkItems = useMemo(
    () =>
      LINK_PAGE_ITEMS.map((link) => {
        const app = getAppBySource(link.chromeExtensionId)
        const iconUrl = app ? appIconUrl(app) : null
        return {
          href: link.href,
          title: link.title,
          summary: link.summary,
          iconUrl,
          iconAlt: `${link.title} icon`,
          fallbackIcon: app?.icon ?? '⚡',
        }
      }),
    [],
  )

  return (
    <>
      <PageSEO
        title="Links — Coded Citadel"
        description={LINKS_DESCRIPTION}
        canonicalPath="/links"
      />
      <main className="CC__links-page">
        <div className="CC__links-page__inner">
          <LinksHubHero
            title="Coded Citadel"
            description={
              <>
                Chrome extensions that make your life easier.
                <br />
                100% privacy-friendly, no AI-slop. Built by a senior developer.
              </>
            }
          />
          <nav className="CC__links-list" aria-label="Chrome extensions">
            {linkItems.map((item) => (
              <LinksHubCell
                key={item.href}
                as="a"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                title={item.title}
                subtitle={item.summary}
                imageUrl={item.iconUrl}
                imageAlt={item.iconAlt}
                fallbackIcon={item.fallbackIcon}
              />
            ))}
          </nav>
        </div>
      </main>
    </>
  )
}
