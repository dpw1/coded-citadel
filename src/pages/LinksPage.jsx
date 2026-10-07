import { useMemo } from 'react'
import PageSEO from '../components/PageSEO'
import { SOCIAL_LINKS } from '../constants/chromeWebStore'
import {
  appCardSummary,
  appFilterLabel,
  appIconUrl,
  getAppBySource,
} from '../utils/apps'
import '../App.css'
import './LinksPage.css'

const LINKS_DESCRIPTION =
  'Chrome extensions built by Coded Citadel. Install your pick from the Web Store.'

function chromeExtensionIdFromUrl(href) {
  try {
    const segment = new URL(href).pathname.split('/').filter(Boolean).pop()
    if (segment && /^[a-p]{32}$/.test(segment)) return segment
  } catch {
    // ignore invalid URLs
  }
  return null
}

export default function LinksPage() {
  const linkItems = useMemo(
    () =>
      SOCIAL_LINKS.map((link) => {
        const id = link.chromeExtensionId ?? chromeExtensionIdFromUrl(link.href)
        const app = id ? getAppBySource(id) : null
        const iconUrl = app ? appIconUrl(app) : null
        return {
          href: link.href,
          title: app ? appFilterLabel(app) : link.label,
          summary: app ? appCardSummary(app) : '',
          iconUrl,
          iconAlt: app ? `${appFilterLabel(app)} icon` : link.label,
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
          <p className="CC__links-page__desc">{LINKS_DESCRIPTION}</p>
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
