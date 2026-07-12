import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CyberCorners from '../components/CyberCorners'
import BuyMeACoffeeButton from '../components/BuyMeACoffeeButton'
import PageSEO from '../components/PageSEO'
import SiteFooter from '../components/SiteFooter'
import SiteHeader from '../components/SiteHeader'
import {
  appCardSummary,
  appFilterLabel,
  appIconUrl,
  appSimilarByTags,
  appStoreUrl,
  appYoutubeHowToUse,
  getAllApps,
  getAppBySource,
  isAppLive,
  youtubeEmbedId,
} from '../utils/apps'
import '../App.css'
import './ExtensionLandingPage.css'
import './ThankYouPage.css'

const YOUTUBE_URL = 'https://www.youtube.com/@CodedCitadel'
const INSTAGRAM_URL = 'https://www.instagram.com/codedcitadel'
const CONTACT_EMAIL = 'CodedCitadel@gmail.com'
const AVATAR_SRC = `${import.meta.env.BASE_URL}avatar-citadel.jpg`

const DEFAULT_CARD_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
)

const SOCIAL_LINKS = [
  {
    id: 'instagram',
    label: 'Instagram',
    href: INSTAGRAM_URL,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'youtube',
    label: 'YouTube',
    href: YOUTUBE_URL,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 8.5a3 3 0 0 0-2.1-2.1C18.5 6 12 6 12 6s-6.5 0-7.9.4A3 3 0 0 0 2 8.5 31 31 0 0 0 2 12a31 31 0 0 0 .4 3.5 3 3 0 0 0 2.1 2.1C5.5 18 12 18 12 18s6.5 0 7.9-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-3.5z" />
        <path d="M10 15V9l5 3-5 3z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

function CyberPanel({ className, children }) {
  return (
    <div className={className}>
      <CyberCorners />
      {children}
    </div>
  )
}

function getMoreApps(installedApp) {
  if (installedApp) {
    return appSimilarByTags(installedApp, 3)
  }

  const seen = new Set()
  const pool = []

  const add = (app) => {
    if (!app || seen.has(app.slug)) return
    if (!isAppLive(app)) return
    seen.add(app.slug)
    pool.push(app)
  }

  getAllApps().forEach(add)

  return pool.slice(0, 3)
}

export default function ThankYouPage() {
  const [avatarError, setAvatarError] = useState(false)
  const [searchParams] = useSearchParams()
  const source = searchParams.get('source') ?? searchParams.get('ext')
  const hasSourceQuery = Boolean(source?.trim())
  const installedApp = useMemo(() => getAppBySource(source), [source])
  const moreApps = useMemo(() => getMoreApps(installedApp), [installedApp])

  const storeUrl = installedApp ? appStoreUrl(installedApp) : null
  const howToUrl = installedApp ? appYoutubeHowToUse(installedApp) : null
  const howToEmbedId = howToUrl ? youtubeEmbedId(howToUrl) : null
  const extName = installedApp ? appFilterLabel(installedApp) : 'your extension'
  const hasHowToVideo = Boolean(howToEmbedId)

  const pageTitle = installedApp
    ? `${appFilterLabel(installedApp)} is installed — Coded Citadel`
    : "You're in — Coded Citadel"

  return (
    <>
      <PageSEO
        title={pageTitle}
        description="Thanks for installing a Coded Citadel Chrome extension."
        canonicalPath="/thank-you"
        robots="noindex, follow"
      />

      <SiteHeader />
      <div className="CC__thank-you-page">
        <main>
          <section className={`CC__thank-you-hero${hasHowToVideo ? '' : ' CC__thank-you-hero--centered'}`}>
            <div className="CC__container">
              <div className={`CC__thank-you-hero-grid${hasHowToVideo ? '' : ' CC__thank-you-hero-grid--centered'}`}>
                <div className="CC__thank-you-hero-copy">
                  <div className="CC__thank-you-hero-badge">
                    <span className="CC__thank-you-hero-badge-dot" aria-hidden="true" />
                    Installed successfully
                  </div>
                  <h1>
                    Thank you<span>!</span>
                  </h1>
                </div>

                {hasHowToVideo ? (
                  <div className="CC__thank-you-hero-media">
                    <div className="ext-hero__browser">
                      <div className="ext-hero__browser-bar">
                        <div className="ext-hero__browser-dots">
                          <div className="ext-hero__browser-dot ext-hero__browser-dot--red" />
                          <div className="ext-hero__browser-dot ext-hero__browser-dot--yellow" />
                          <div className="ext-hero__browser-dot ext-hero__browser-dot--green" />
                        </div>
                        <div className="ext-hero__browser-url">youtube.com</div>
                      </div>
                      <div className="ext-hero__browser-content">
                        <div className="ext-hero__browser-bg" aria-hidden="true">
                          <img
                            src={`${import.meta.env.BASE_URL}hero-img.png`}
                            alt=""
                            aria-hidden="true"
                          />
                        </div>
                        <div className="ext-hero__yt-wrap">
                          <iframe
                            src={`https://www.youtube.com/embed/${howToEmbedId}?rel=0&modestbranding=1`}
                            title={`${extName} — how to use`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {hasSourceQuery ? (
            <section className="CC__thank-you-steps-section">
              <div className="CC__container">
                <p className="CC__thank-you-steps-message">
                  Please check the &apos;How to use&apos; section in the{' '}
                  {storeUrl ? (
                    <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                      Chrome extension description
                    </a>
                  ) : (
                    'Chrome extension description'
                  )}
                  .
                </p>
              </div>
            </section>
          ) : null}

          <section className="CC__thank-you-about CC__container">
            <div className="CC__about-grid">
              <div className="CC__about-content">
                <p className="CC__section-eyebrow">About me</p>
                <h2 className="CC__section-title">
                  Building to <span className="CC__section-title-accent">$100k</span>
                </h2>
                <p className="CC__about-text">
                  I&apos;m a graduated computer scientist &amp; senior dev for 10+ years. This
                  extension is <strong>free</strong> and part of my public series: &quot;building in
                  public until I make $100k USD.&quot;
                </p>
                <p className="CC__about-text">
                  I&apos;m building free extensions with the intent of eventually building something
                  truly valuable by trial and error.
                </p>
                <p className="CC__about-text">
                  If this extension helps you in any way, your contribution means the world to me.
                </p>
                <div className="CC__thank-you-about-actions">
                  <BuyMeACoffeeButton />
                  <div className="CC__thank-you-about-social">
                    <span className="CC__thank-you-about-social-label">Or follow on social media</span>
                    <div className="CC__thank-you-social-links">
                      {SOCIAL_LINKS.map((link) => (
                        <a
                          key={link.id}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="CC__thank-you-social-link"
                          aria-label={link.label}
                        >
                          {link.icon}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="CC__about-text CC__thank-you-about-contact">
                  Either way, I hope you enjoy and I&apos;m all ears if you have bug reports,
                  feedback, or suggestions for other extensions:{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </p>
              </div>
              <div
                className={`CC__about-image-frame CC__cyber-accent${
                  avatarError ? ' CC__about-image-frame--empty' : ''
                }`}
              >
                <CyberCorners />
                {!avatarError ? (
                  <img
                    src={AVATAR_SRC}
                    alt="Diego — Coded Citadel"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span>Add portrait as public/avatar-citadel.jpg</span>
                )}
              </div>
            </div>
          </section>

          {moreApps.length > 0 ? (
            <section className="CC__thank-you-more-section">
              <div className="CC__container">
                <div className="CC__thank-you-more-head">
                  <div>
                    <p className="CC__section-eyebrow">Cross the citadel</p>
                    <h2 className="CC__section-title">
                      {installedApp ? 'You may also like' : 'More extensions'}
                    </h2>
                  </div>
                  <Link to="/apps" className="CC__btn CC__btn--outline">
                    View all extensions
                  </Link>
                </div>
                <div className="CC__thank-you-more-grid">
                  {moreApps.map((app) => {
                    const iconUrl = appIconUrl(app)
                    return (
                      <Link key={app.slug} to={`/apps/${app.slug}`} className="CC__thank-you-more-card">
                        <CyberCorners />
                        <div className="CC__thank-you-more-card-icon">
                          {iconUrl ? (
                            <img src={iconUrl} alt="" />
                          ) : (
                            DEFAULT_CARD_ICON
                          )}
                        </div>
                        <div className="CC__thank-you-more-card-title">{appFilterLabel(app)}</div>
                        <p className="CC__thank-you-more-card-body">{appCardSummary(app)}</p>
                        <span className="CC__thank-you-more-card-link">Get the extension →</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </section>
          ) : null}

          <section className="CC__thank-you-footer-cta">
            <div className="CC__container">
              <CyberPanel className="CC__thank-you-footer-cta-inner">
                <h2>Following the build</h2>
                <p>
                  New extensions, teardown breakdowns, and the numbers behind the $100k run,
                  posted as it happens.
                </p>
                <div className="CC__thank-you-footer-cta-actions">
                  <a
                    href={YOUTUBE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="CC__btn CC__btn--primary"
                  >
                    Subscribe on YouTube
                  </a>
                  <Link to="/blog" className="CC__btn CC__btn--outline">
                    Read the blog
                  </Link>
                </div>
              </CyberPanel>
            </div>
          </section>
        </main>
      </div>
      <SiteFooter />
    </>
  )
}
