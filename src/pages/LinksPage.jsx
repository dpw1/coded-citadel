import PageSEO from '../components/PageSEO'
import { SOCIAL_LINKS } from '../constants/chromeWebStore'
import '../App.css'
import './LinksPage.css'

const LINKS_DESCRIPTION =
  'Chrome extensions built by Coded Citadel. Install your pick from the Web Store.'

export default function LinksPage() {
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
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="CC__ext-cta CC__ext-cta--visible CC__links-list__item"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </main>
    </>
  )
}
