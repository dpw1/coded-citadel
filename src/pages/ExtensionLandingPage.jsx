import { useEffect, useId, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import ExtensionPageSEO from '../components/ExtensionPageSEO'
import CyberCorners from '../components/CyberCorners'
import ExtensionCharts, { DonutLegend, regionDotColor } from '../components/extension/ExtensionCharts'
import AppsGridSection from '../components/AppsGridSection'
import YoutubeSection from '../components/YoutubeSection'
import {
  appActiveUsers,
  appHeroPreviewUrl,
  appHeroYoutubeUrl,
  appIconUrl,
  appBuildYoutubeUrl,
  appEstimatedTime,
  appPrompts,
  appStoreUrl,
  formatAppDate,
  formatAppCreatedDate,
  formatLabel,
  formatNumber,
  getAppsUpdatedAt,
  getAppBySlug,
  isAppLive,
  splitAppTitle,
  getInstallationsSeries,
  installationsDelta,
  installationsTotal,
  weeklyUsersDelta,
  youtubeEmbedId,
} from '../utils/apps'
import '../App.css'
import './ExtensionLandingPage.css'

function AppPageShell({ children }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  )
}

function StatsBarPercentDelta({ delta, suffix }) {
  if (!delta) return null
  const negative = delta.pct < 0
  return (
    <span
      className={`CC__stats-bar__delta${negative ? ' CC__stats-bar__delta--negative' : ''}`}
    >
      {negative ? '↓' : '↑'} {Math.abs(delta.pct)}% {suffix}
    </span>
  )
}

function AppNotFound() {
  return (
    <AppPageShell>
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

  const chartIds = useMemo(
    () => ({
      sparkline: `spark-${uid}`,
      weekly: `weekly-${uid}`,
      weeklyUsers: `wusers-${uid}`,
      pageViews: `pviews-${uid}`,
      impressions: `impr-${uid}`,
      installRegion: `install-${uid}`,
      weeklyRegion: `wregion-${uid}`,
    }),
    [uid],
  )

  useEffect(() => {
    if (ext) document.title = `${ext.name} — Coded Citadel`
    return () => {
      document.title = 'Coded Citadel'
    }
  }, [ext])

  if (!ext) return <AppNotFound />

  if (!isAppLive(ext) || !ext.analytics) {
    return (
      <AppPageShell>
      <ExtensionPageSEO extension={ext} />
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
  const an = ext.analytics
  const installations = getInstallationsSeries(an)
  const installDelta = installationsDelta(installations)
  const installsLast30 = installationsTotal(installations)
  const activeUsers = appActiveUsers(ext) ?? 0
  const activeUsersDelta = weeklyUsersDelta(an.weeklyUsers)
  const enabledVsDisabled = an.enabledVsDisabled ?? { enabled: 0, disabled: 0 }
  const pageViewsBySource = an.pageViewsBySource ?? {}
  const uninstallsByRegion = an.uninstallsByRegion ?? {}
  const heroYoutube = appHeroYoutubeUrl(ext)
  const heroEmbedId = heroYoutube ? youtubeEmbedId(heroYoutube) : null
  const buildYoutube = appBuildYoutubeUrl(ext)
  const buildVideoEmbedId = buildYoutube ? youtubeEmbedId(buildYoutube) : null
  const heroPreview = appHeroPreviewUrl(ext)
  const storeUrl = appStoreUrl(ext)
  const iconUrl = appIconUrl(ext)
  const screenshots = ext.screenshots ?? []
  const evd = enabledVsDisabled
  const evdTotal = evd.enabled + evd.disabled

  const liveLabel =
    ext.status === 'live' ? 'Live on Chrome Web Store' : `${ext.status} — ${ext.platform}`
  const analyticsUpdatedAt = getAppsUpdatedAt() ?? ext.lastUpdated

  return (
    <AppPageShell>
    <ExtensionPageSEO extension={ext} />
    <main className="ext-page">
      <ExtensionCharts analytics={an} chartIds={chartIds} />

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
                  <span className="ext-hero__badge-value">{ext.category}</span>
                </div>
                <div className="ext-hero__badge">
                  <span className="ext-hero__badge-label">Created</span>
                  <span className="ext-hero__badge-value">{formatAppCreatedDate(ext)}</span>
                </div>
              </div>

              <div className="ext-hero__cta">
                {storeUrl ? (
                  <a href={storeUrl} className="CC__btn CC__btn--primary ext-hero__cta-primary" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="16 12 12 8 8 12" />
                      <line x1="12" y1="16" x2="12" y2="8" />
                    </svg>
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
                  <img src={iconUrl} alt="" className="ext-hero__store-icon" width={48} height={48} />
                ) : null}
                <span className="ext-hero__installs">
                  <svg viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {formatNumber(an.totalInstalls)} installs
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

        {screenshots.length > 0 ? (
          <section className="ext-screenshots" aria-label="Store screenshots">
            <h2 className="ext-screenshots__title">Screenshots</h2>
            <div className="ext-screenshots__grid">
              {screenshots.map((src) => (
                <img key={src} src={src} alt="" className="ext-screenshots__img" loading="lazy" />
              ))}
            </div>
          </section>
        ) : null}

        <section className="CC__stats-section">
          <div className="CC__cyber-accent CC__stats-bar">
            <CyberCorners />
            <div className="CC__stats-bar__live">
              <span className="CC__stats-bar__live-label">Stats</span>
              <span className="CC__stats-bar__live-sub">
                <span className="CC__stats-bar__live-dot" />
                Live
              </span>
            </div>
            <ul className="CC__stats-bar__items">
              <li className="CC__stats-bar__item">
                <div className="CC__stats-bar__info">
                  <span className="CC__stats-bar__label">Total Installs</span>
                  <span className="CC__stats-bar__value">{formatNumber(an.totalInstalls)}</span>
                  <span className="CC__stats-bar__delta">↑ Live</span>
                </div>
              </li>
              <li className="CC__stats-bar__item">
                <div className="CC__stats-bar__info">
                  <span className="CC__stats-bar__label">Active Users</span>
                  <span className="CC__stats-bar__value">{formatNumber(activeUsers)}</span>
                  {activeUsersDelta ? (
                    <StatsBarPercentDelta delta={activeUsersDelta} suffix="vs previous day" />
                  ) : (
                    <span className="CC__stats-bar__delta">↑ Live</span>
                  )}
                </div>
              </li>
              <li className="CC__stats-bar__item">
                <div className="CC__stats-bar__info">
                  <span className="CC__stats-bar__label">Page Views</span>
                  <span className="CC__stats-bar__value CC__stats-bar__value--white">{formatNumber(an.pageViews)}</span>
                  <span className="CC__stats-bar__delta">↑ Live</span>
                </div>
              </li>
              <li className="CC__stats-bar__item">
                <div className="CC__stats-bar__info">
                  <span className="CC__stats-bar__label">Impressions</span>
                  <span className="CC__stats-bar__value CC__stats-bar__value--white">
                    {formatNumber(an.impressions)}
                  </span>
                  <span className="CC__stats-bar__delta CC__stats-bar__delta--muted">Store listing</span>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className="ext-analytics">
          <div className="ext-analytics__header">
            <div>
              <div className="ext-analytics__eyebrow">Analytics Overview</div>
              <h2 className="ext-analytics__title">Live Performance</h2>
              {analyticsUpdatedAt ? (
                <small className="ext-analytics__updated">
                  Last updated at: {formatAppDate(analyticsUpdatedAt)}
                </small>
              ) : null}
            </div>
            <div className="ext-analytics__filter">Last 30 days</div>
          </div>

          <div className="ext-analytics__kpis">
            <div className="ext-kpi CC__cyber-accent">
              <CyberCorners />
              <div className="ext-kpi__label">Total Installs</div>
              <div className="ext-kpi__value">{formatNumber(an.totalInstalls)}</div>
              <div className="ext-kpi__delta">↑ Live</div>
            </div>
            <div className="ext-kpi CC__cyber-accent">
              <CyberCorners />
              <div className="ext-kpi__label">Installs (Last 30 Days)</div>
              <div className="ext-kpi__value">{formatNumber(installsLast30)}</div>
              {installDelta ? (
                <div
                  className={`ext-kpi__delta${
                    installDelta.pct < 0 ? ' ext-kpi__delta--negative' : ''
                  }`}
                >
                  {installDelta.pct < 0 ? '↓' : '↑'}{' '}
                  {Math.abs(installDelta.pct)}% vs previous day
                </div>
              ) : null}
              <div className="ext-kpi__chart">
                <canvas id={chartIds.sparkline} />
              </div>
            </div>
            <div className="ext-kpi CC__cyber-accent">
              <CyberCorners />
              <div className="ext-kpi__label">Page Views</div>
              <div className="ext-kpi__value ext-kpi__value--white">{formatNumber(an.pageViews)}</div>
              <div className="ext-kpi__delta">↑ Live</div>
            </div>
            <div className="ext-kpi CC__cyber-accent">
              <CyberCorners />
              <div className="ext-kpi__label">Impressions</div>
              <div className="ext-kpi__value ext-kpi__value--white">{formatNumber(an.impressions)}</div>
              <div className="ext-kpi__delta ext-kpi__delta--muted">Chrome Web Store</div>
            </div>
          </div>

          <div className="ext-analytics__charts">
            <div className="ext-chart-card CC__cyber-accent">
              <CyberCorners />
              <div className="ext-chart-card__title">Installations</div>
              <div className="ext-chart-card__canvas-wrap" style={{ height: 200 }}>
                <canvas id={chartIds.weekly} />
              </div>
            </div>
            <div className="ext-chart-card CC__cyber-accent">
              <CyberCorners />
              <div className="ext-chart-card__title">Weekly Users</div>
              <div className="ext-chart-card__canvas-wrap" style={{ height: 200 }}>
                <canvas id={chartIds.weeklyUsers} />
              </div>
            </div>
            <div className="ext-chart-card CC__cyber-accent">
              <CyberCorners />
              <div className="ext-chart-card__title">Page Views Over Time</div>
              <div className="ext-chart-card__canvas-wrap" style={{ height: 200 }}>
                <canvas id={chartIds.pageViews} />
              </div>
            </div>
            <div className="ext-chart-card CC__cyber-accent">
              <CyberCorners />
              <div className="ext-chart-card__title">Impressions Across Chrome Web Store</div>
              <div className="ext-chart-card__canvas-wrap" style={{ height: 200 }}>
                <canvas id={chartIds.impressions} />
              </div>
            </div>
            <div className="ext-chart-card CC__cyber-accent">
              <CyberCorners />
              <div className="ext-chart-card__title">Installed Users by Region</div>
              <div className="ext-chart-card__canvas-wrap" style={{ height: 160 }}>
                <canvas id={chartIds.installRegion} />
              </div>
              <DonutLegend dataObj={an.installsByRegion} total={an.totalInstalls} />
            </div>
            <div className="ext-chart-card CC__cyber-accent">
              <CyberCorners />
              <div className="ext-chart-card__title">Weekly Users by Region</div>
              <div className="ext-chart-card__canvas-wrap" style={{ height: 160 }}>
                <canvas id={chartIds.weeklyRegion} />
              </div>
              <DonutLegend
                dataObj={an.weeklyUsersByRegion ?? {}}
                total={Object.values(an.weeklyUsersByRegion ?? {}).reduce((a, b) => a + b, 0)}
              />
            </div>
          </div>
        </section>

        <section className="ext-secondary-stats">
          <div className="ext-secondary-stats__grid">
            <div className="ext-sec-card CC__cyber-accent">
              <CyberCorners />
              <div className="ext-sec-card__label">Uninstalls</div>
              <div className="ext-sec-card__value">{formatNumber(an.uninstalls)}</div>
              <ul className="ext-sec-card__regions">
                {Object.entries(uninstallsByRegion).map(([region, count]) => {
                  const pct = an.uninstalls ? ((count / an.uninstalls) * 100).toFixed(1) : '0.0'
                  return (
                    <li key={region} className="ext-sec-card__region">
                      <span className="ext-sec-card__region-dot" style={{ background: regionDotColor(region) }} />
                      <span style={{ color: 'var(--CC__color-text-muted)' }}>{formatLabel(region)}</span>
                      <span className="ext-sec-card__region-val">{count}</span>
                      <span className="ext-sec-card__region-pct">({pct}%)</span>
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className="ext-sec-card CC__cyber-accent">
              <CyberCorners />
              <div className="ext-sec-card__label">Impressions</div>
              <div className="ext-sec-card__value">{formatNumber(an.impressions)}</div>
              <div className="ext-sec-card__live">
                <span className="ext-sec-card__live-dot" />
                Live
              </div>
            </div>
            <div className="ext-sec-card CC__cyber-accent">
              <CyberCorners />
              <div className="ext-sec-card__label">Enabled vs Disabled</div>
              <div className="ext-enabled-row">
                {[
                  { name: 'Enabled', count: evd.enabled, cls: 'ext-enabled-item__fill--orange' },
                  { name: 'Disabled', count: evd.disabled, cls: 'ext-enabled-item__fill--muted' },
                ].map((item) => {
                  const pct = evdTotal ? ((item.count / evdTotal) * 100).toFixed(1) : '0.0'
                  return (
                    <div key={item.name} className="ext-enabled-item">
                      <div className="ext-enabled-item__top">
                        <span className="ext-enabled-item__name">{item.name}</span>
                        <span>
                          <span className="ext-enabled-item__count">{formatNumber(item.count)}</span>
                          <span className="ext-enabled-item__pct"> ({pct}%)</span>
                        </span>
                      </div>
                      <div className="ext-enabled-item__bar">
                        <div className={`ext-enabled-item__fill ${item.cls}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="ext-sec-card CC__cyber-accent">
              <CyberCorners />
              <div className="ext-sec-card__label">Page Views by Source</div>
              <div className="ext-sources">
                {Object.entries(pageViewsBySource).map(([source, count]) => {
                  const pct = an.pageViews ? ((count / an.pageViews) * 100).toFixed(1) : '0.0'
                  return (
                    <div key={source} className="ext-source-row">
                      <span className="ext-source-row__name">{formatLabel(source)}</span>
                      <div className="ext-source-row__bar-wrap">
                        <div className="ext-source-row__fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="ext-source-row__val">{formatNumber(count)}</span>
                      <span className="ext-source-row__pct">({pct}%)</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <AppsGridSection
          sectionId="more-apps"
          excludeSlug={ext.slug}
          eyebrow="Explore"
          title="More Apps"
          showViewAllLink
        />
        <YoutubeSection />
      </div>
    </main>
    </AppPageShell>
  )
}
