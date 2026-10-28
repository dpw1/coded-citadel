import { useMemo } from 'react'
import PageSEO from '../components/PageSEO'
import { YT_FILTER_PRO_STORE_URL } from '../constants/chromeWebStore'
import { appIconUrl, getAppBySource } from '../utils/apps'
import '../App.css'
import './LinksPage.css'

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
          <img
            className="CC__links-page__avatar"
            src="/avatar-citadel.jpg"
            alt=""
            width={88}
            height={88}
          />
          <h1 className="CC__links-page__title">Coded Citadel</h1>
          <p className="CC__links-page__desc">
            Chrome extensions that make your life easier.
            <br />
            100% privacy-friendly, no AI-slop. Built by a senior developer.
          </p>
          <nav className="CC__links-list" aria-label="Chrome extensions">
            {linkItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="CC__ext-cta CC__ext-cta--visible CC__links-list__item"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="CC__links-list__icon CC__ext-icon">
                  {item.iconUrl ? (
                    <img
                      src={item.iconUrl}
                      alt={item.iconAlt}
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    item.fallbackIcon
                  )}
                </span>
                <span className="CC__links-list__text">
                  <span className="CC__links-list__title">{item.title}</span>
                  {item.summary ? (
                    <span className="CC__links-list__summary">{item.summary}</span>
                  ) : null}
                </span>
              </a>
            ))}
          </nav>
        </div>
      </main>
    </>
  )
}
