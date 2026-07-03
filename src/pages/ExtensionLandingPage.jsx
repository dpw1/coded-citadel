import { useId, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import ExtensionPageSEO from '../components/ExtensionPageSEO'
import PageSEO from '../components/PageSEO'
import CyberCorners from '../components/CyberCorners'
import ChromeIcon from '../components/ChromeIcon'
import ExtensionAnalyticsBlock from '../components/extension/ExtensionAnalyticsBlock'
import ExtensionChangelogBlock from '../components/extension/ExtensionChangelogBlock'
import ExtensionLiveStatsBar from '../components/extension/ExtensionLiveStatsBar'
import GitHubIcon from '../components/GitHubIcon'
import AppsGridSection from '../components/AppsGridSection'
import YoutubeSection from '../components/YoutubeSection'
import {
  appActiveUsers,
  appCategory,
  appGithubUrl,
  appHeroPreviewUrl,
  appHeroYoutubeUrl,
  appIconUrl,
  appBuildYoutubeUrl,
  appEstimatedTime,
  appPrompts,
  appStoreUrl,
  appFilterLabel,
  appGalleryScreenshots,
  formatAppDate,
  formatAppCreatedDate,
  formatNumber,
  getAppsUpdatedAt,
  getAppBySlug,
  isAppLive,
  splitAppTitle,
  youtubeEmbedId,
} from '../utils/apps'
import {
  getExtensionChangelogBySlug,
  getStoredExtensionChangelogs,
} from '../utils/extensionChangelogs'
import '../components/extension/ExtensionChangelogBlock.css'
import '../App.css'
import './ExtensionLandingPage.css'

const SAVE_TO_DRIVE_CANONICAL_URL = 'https://codedcitadel.com/save-directly-to-drive'

function AppPageShell({ children }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  )
}

function AppNotFound() {
  return (
    <AppPageShell>
      <PageSEO
        title="App not found — Coded Citadel"
        description="No Chrome extension matches this URL."
        canonicalPath="/apps"
        robots="noindex, follow"
      />
      <main className="ext-page">
        <div className="CC__container" style={{ padding: '4rem 0' }}>
          <h1 className="ext-analytics__title">App not found</h1>
          <p className="ext-hero__tagline" style={{ maxWidth: 'none' }}>
            No app matches this URL.
          </p>
          <Link to="/apps" className="CC__btn CC__btn--primary" style={{ marginTop: '1.5rem' }}>
            View all apps
          </Link>
        </div>
      </main>
    </AppPageShell>
  )
}

export default function ExtensionLandingPage() {
  const { slug } = useParams()
  const ext = getAppBySlug(slug)
  const uid = useId().replace(/:/g, '')
  const extensionCanonicalUrl =
    ext?.slug === 'save-directly-to-drive' ? SAVE_TO_DRIVE_CANONICAL_URL : undefined

  const chartIds = useMemo(
    () => ({
      sparkline: `spark-${uid}`,
      weekly: `weekly-${uid}`,
      weeklyUsers: `wusers-${uid}`,
      pageViews: `pviews-${uid}`,
      impressions: `impr-${uid}`,
      installRegion: `install-${uid}`,
    }),
    [uid],
  )

  if (!ext) return <AppNotFound />

  if (!isAppLive(ext)) {
    return (
      <AppPageShell>
      <ExtensionPageSEO extension={ext} canonicalUrl={extensionCanonicalUrl} />
      <main className="ext-page">
        <div className="CC__container" style={{ padding: '4rem 0' }}>
          <Link to="/apps" className="ext-page__back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Apps
          </Link>
          <h1 className="ext-analytics__title" style={{ marginTop: '2rem' }}>
            {ext.name}
          </h1>
          <p className="ext-hero__tagline" style={{ maxWidth: 'none' }}>
            {ext.tagline}
          </p>
          <p className="CC__btn CC__btn--outline" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            Coming Soon
          </p>
        </div>
      </main>
      </AppPageShell>
    )
  }

  const { main: titleMain, accent: titleAccent } = splitAppTitle(ext.name)
  const an = ext.analytics ?? null
  const activeUsers = appActiveUsers(ext) ?? 0
  const heroYoutube = appHeroYoutubeUrl(ext)
  const heroEmbedId = heroYoutube ? youtubeEmbedId(heroYoutube) : null
  const buildYoutube = appBuildYoutubeUrl(ext)
  const buildVideoEmbedId = buildYoutube ? youtubeEmbedId(buildYoutube) : null
  const heroPreview = appHeroPreviewUrl(ext)
  const storeUrl = appStoreUrl(ext)
  const iconUrl = appIconUrl(ext)
  const galleryScreenshots = appGalleryScreenshots(ext)
  const githubUrl = appGithubUrl(ext)
  const changelogApp = getExtensionChangelogBySlug(ext.slug)
  const showGithubBadge = Boolean(githubUrl && changelogApp?.githubPublic)
  const changelogKeys = changelogApp ? new Set([changelogApp.key]) : new Set()

  const liveLabel =
    ext.status === 'live' ? 'Live on Chrome Web Store' : `${ext.status} — ${ext.platform}`
  const analyticsUpdatedAt = getAppsUpdatedAt() ?? ext.lastUpdated

  return (
    <AppPageShell>
    <ExtensionPageSEO extension={ext} canonicalUrl={extensionCanonicalUrl} />
    <main className="ext-page">
      <div className="CC__container">
        <Link to="/apps" className="ext-page__back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All Apps
        </Link>

        <section className="ext-hero">
          <div className="ext-hero__grid">
            <div className="ext-hero__left">
              <div className="ext-hero__live">
                <span className="ext-hero__live-dot" />
                {liveLabel}
              </div>

              <h1 className="ext-hero__title">
                {titleMain}
                {titleAccent ? (
                  <>
                    <br />
                    <span>{titleAccent}</span>
                  </>
                ) : null}
              </h1>

              <p className="ext-hero__tagline">{ext.tagline}</p>

              <div className="ext-hero__meta">
                <div className="ext-hero__badge">
                  <span className="ext-hero__badge-label">Built &amp; Deployed In</span>
                  <span className="ext-hero__badge-value">{appEstimatedTime(ext) ?? '—'}</span>
                </div>
                <div className="ext-hero__badge">
                  <span className="ext-hero__badge-label">Prompts</span>
                  <span className="ext-hero__badge-value">
                    {appPrompts(ext) != null ? formatNumber(appPrompts(ext)) : '—'}
                  </span>
                </div>
                <div className="ext-hero__badge">
                  <span className="ext-hero__badge-label">Updated</span>
                  <span className="ext-hero__badge-value">{formatAppDate(ext.lastUpdated)}</span>
                </div>
                <div className="ext-hero__badge">
                  <span className="ext-hero__badge-label">Price</span>
                  <span className="ext-hero__badge-value ext-hero__badge-value--orange">{ext.price}</span>
                </div>
                <div className="ext-hero__badge">
                  <span className="ext-hero__badge-label">Category</span>
                  <span className="ext-hero__badge-value">{appCategory(ext)}</span>
                </div>
                <div className="ext-hero__badge">
                  <span className="ext-hero__badge-label">Created</span>
                  <span className="ext-hero__badge-value">{formatAppCreatedDate(ext)}</span>
                </div>
                {showGithubBadge ? (
                  <div className="ext-hero__badge">
                    <span className="ext-hero__badge-label">Source</span>
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ext-hero__badge-link"
                    >
                      <span className="ext-hero__badge-value">
                        <GitHubIcon size={14} />
                        GitHub
                      </span>
                    </a>
                  </div>
                ) : null}
              </div>

              <div className="ext-hero__cta">
                {storeUrl ? (
                  <a href={storeUrl} className="CC__btn CC__btn--primary ext-hero__cta-primary" target="_blank" rel="noopener noreferrer">
                    <ChromeIcon size={16} />
                    <span>
                      Add to Chrome
                      <span className="ext-hero__cta-primary-sub">It&apos;s {ext.price.toLowerCase()}</span>
                    </span>
                  </a>
                ) : (
                  <span className="CC__btn CC__btn--primary ext-hero__cta-primary" aria-disabled="true">
                    Add to Chrome
                  </span>
                )}
                <button
                  type="button"
                  className="CC__btn CC__btn--outline"
                  onClick={() => {
                    document
                      .querySelector('.CC__stats-section')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  View Stats
                </button>
              </div>

              <div className="ext-hero__installs-row">
                {iconUrl ? (
                  <img
                    src={iconUrl}
                    alt={`${ext.name} icon`}
                    className="ext-hero__store-icon"
                    width={48}
                    height={48}
                  />
                ) : null}
                <span className="ext-hero__installs">
                  <svg viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {formatNumber(an?.totalInstalls ?? 0)} installs
                </span>
              </div>
            </div>

            <div className="ext-hero__right">
              <div className="ext-hero__browser">
                <div className="ext-hero__browser-bar">
                  <div className="ext-hero__browser-dots">
                    <div className="ext-hero__browser-dot ext-hero__browser-dot--red" />
                    <div className="ext-hero__browser-dot ext-hero__browser-dot--yellow" />
                    <div className="ext-hero__browser-dot ext-hero__browser-dot--green" />
                  </div>
                  <div className="ext-hero__browser-url">
                    {storeUrl
                      ? storeUrl.replace(/^https?:\/\//, '')
                      : 'chromewebstore.google.com'}
                  </div>
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
                    {heroEmbedId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${heroEmbedId}?rel=0&modestbranding=1`}
                        title={`${ext.name} — demo`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : heroPreview ? (
                      <img
                        src={heroPreview}
                        alt={`${ext.name} — store screenshot`}
                        className="ext-hero__preview-img"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {ext.tagline || ext.description?.full ? (
          <section className="ext-description">
            {ext.tagline ? <p className="ext-description__short">{ext.tagline}</p> : null}
            {ext.description?.full ? <p className="ext-description__full">{ext.description.full}</p> : null}
          </section>
        ) : null}

        {buildVideoEmbedId ? (
          <section className="ext-build-video" aria-label="Build video">
            <h2 className="ext-build-video__title">Watch how I built this</h2>
            <p className="ext-build-video__sub">
              from validating idea to publishing on Chrome web store
            </p>
            <div className="ext-build-video__embed ext-hero__yt-wrap">
              <iframe
                title={`How ${ext.name} was built`}
                src={`https://www.youtube.com/embed/${buildVideoEmbedId}?rel=0&modestbranding=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </section>
        ) : null}

        {galleryScreenshots.length > 0 ? (
          <section className="ext-screenshots" aria-label="Store screenshots">
            <h2 className="ext-screenshots__title">Screenshots</h2>
            <div className="ext-screenshots__grid">
              {galleryScreenshots.map((src, index) => (
                <img
                  key={src}
                  src={src}
                  alt={`${ext.name} screenshot ${index + 1}`}
                  className="ext-screenshots__img"
                  loading="lazy"
                />
              ))}
            </div>
          </section>
        ) : null}

        <ExtensionLiveStatsBar
          analytics={an}
          activeUsers={activeUsers}
        />

        <ExtensionAnalyticsBlock
          analytics={an}
          chartIds={chartIds}
          updatedAt={analyticsUpdatedAt}
        />

        {changelogApp ? (
          <ExtensionChangelogBlock
            apps={[changelogApp]}
            selectedKeys={changelogKeys}
            showSidebar={false}
            usePagination
            title="CHANGELOGS"
            subtitle={`Development history for ${appFilterLabel(ext)}.`}
          />
        ) : null}

        <AppsGridSection
          sectionId="more-apps"
          excludeSlug={ext.slug}
          eyebrow="Explore"
          title="More Apps"
          showViewAllLink
          maxItems={6}
        />
        <YoutubeSection />
      </div>
    </main>
    </AppPageShell>
  )
}
