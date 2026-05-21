import { useEffect, useId, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import ExtensionPageSEO from '../components/ExtensionPageSEO'
import CyberCorners from '../components/CyberCorners'
import ExtensionCharts, { DonutLegend, regionDotColor } from '../components/extension/ExtensionCharts'
import {
  appHeroPreviewUrl,
  appHeroYoutubeUrl,
  appIconUrl,
  appStoreUrl,
  formatAppDate,
  formatLabel,
  formatNumber,
  getAppsUpdatedAt,
  getAppBySlug,
  isAppLive,
  splitAppTitle,
  getInstallationsSeries,
  installationsDelta,
  installationsTotal,
  titleCaseAudience,
  youtubeEmbedId,
} from '../utils/apps'
import '../App.css'
import './ExtensionLandingPage.css'

const TECH_ICONS = [
  <svg key="t0" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>,
  <svg key="t1" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
  <svg key="t2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
]

const AUDIENCE_ICONS = [
  <svg key="a0" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>,
  <svg key="a1" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  <svg key="a2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  <svg key="a3" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
]

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
            {ext.description?.short ?? ext.tagline}
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
  const buildStory = {
    episode: '',
    builtInDays: null,
    youtubeUrl: '#',
    techStack: [],
    ...ext.buildStory,
  }
  const audience = ext.audience ?? []
  const enabledVsDisabled = an.enabledVsDisabled ?? { enabled: 0, disabled: 0 }
  const pageViewsBySource = an.pageViewsBySource ?? {}
  const uninstallsByRegion = an.uninstallsByRegion ?? {}
  const heroYoutube = appHeroYoutubeUrl(ext)
  const heroEmbedId = heroYoutube ? youtubeEmbedId(heroYoutube) : null
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

              <p className="ext-hero__tagline">{ext.description?.short ?? ext.tagline}</p>

              <div className="ext-hero__meta">
                <div className="ext-hero__badge">
                  <span className="ext-hero__badge-label">Version</span>
                  <span className="ext-hero__badge-value">{ext.version}</span>
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
                  <span className="ext-hero__badge-label">Platform</span>
                  <span className="ext-hero__badge-value">{ext.platform}</span>
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
                {storeUrl ? (
                  <a href={storeUrl} className="CC__btn CC__btn--outline" target="_blank" rel="noopener noreferrer">
                    View on Chrome Web Store
                  </a>
                ) : null}
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
                    {heroEmbedId
                      ? `youtube.com/watch?v=${heroEmbedId}`
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

        {ext.description?.short ? (
          <section className="ext-description">
            <p className="ext-description__short">{ext.description.short}</p>
            {ext.description.full ? <p className="ext-description__full">{ext.description.full}</p> : null}
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
                  <span className="CC__stats-bar__label">Installs (30 Days)</span>
                  <span className="CC__stats-bar__value">{formatNumber(installsLast30)}</span>
                  {installDelta ? (
                    <span className="CC__stats-bar__delta">
                      ↑ {installDelta.pct}% vs prev day
                    </span>
                  ) : null}
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
                <div className="ext-kpi__delta">↑ {installDelta.pct}% vs previous day</div>
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
                  const pct = ((item.count / evdTotal) * 100).toFixed(1)
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

        {(buildStory.episode || buildStory.builtInDays != null || buildStory.techStack.length > 0 || audience.length > 0) ? (
        <section className="ext-bottom">
          <div className="ext-bottom-grid">
            {(buildStory.episode || buildStory.builtInDays != null) ? (
            <div className="ext-build-card CC__cyber-accent">
              <CyberCorners />
              <div className="ext-build-card__eyebrow">The Build Story</div>
              {buildStory.episode ? (
                <div className="ext-build-card__episode">{buildStory.episode}</div>
              ) : null}
              <p className="ext-build-card__desc">{ext.description?.short}</p>
              <div className="ext-build-card__meta">
                {buildStory.builtInDays != null ? (
                <div className="ext-build-card__meta-item">
                  <div className="ext-build-card__meta-icon">
                    <svg viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <span className="ext-build-card__meta-label">Built in</span>
                    <span className="ext-build-card__meta-value">{buildStory.builtInDays} days</span>
                  </div>
                </div>
                ) : null}
                <div className="ext-build-card__meta-item">
                  <div className="ext-build-card__meta-icon">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="10 8 16 12 10 16 10 8" />
                    </svg>
                  </div>
                  <div>
                    <span className="ext-build-card__meta-label">Watch on YouTube</span>
                    {buildStory.youtubeUrl && buildStory.youtubeUrl !== '#' ? (
                      <a href={buildStory.youtubeUrl} className="ext-build-card__meta-value" style={{ color: 'var(--CC__color-primary)' }}>
                        Episode
                      </a>
                    ) : (
                      <span className="ext-build-card__meta-value">Coming soon</span>
                    )}
                  </div>
                </div>
              </div>
              {buildStory.builtInDays != null ? (
              <p className="ext-build-card__footer">
                This extension was built in public over {buildStory.builtInDays} days. Follow the journey on YouTube.
              </p>
              ) : null}
            </div>
            ) : null}

            {buildStory.techStack.length > 0 ? (
            <div className="ext-tech-card CC__cyber-accent">
              <CyberCorners />
              <div className="ext-tech-card__title">Tech Stack</div>
              <div className="ext-tech-items">
                {buildStory.techStack.map((tech, i) => (
                  <div key={tech} className="ext-tech-item">
                    <div className="ext-tech-item__icon">{TECH_ICONS[i] || TECH_ICONS[0]}</div>
                    {tech}
                  </div>
                ))}
              </div>
            </div>
            ) : null}

            {audience.length > 0 ? (
            <div className="ext-audience-card CC__cyber-accent">
              <CyberCorners />
              <div className="ext-audience-card__title">Built For</div>
              <div className="ext-audience-items">
                {audience.map((aud, i) => (
                  <div key={aud} className="ext-audience-item">
                    <div className="ext-audience-item__icon">{AUDIENCE_ICONS[i] || AUDIENCE_ICONS[0]}</div>
                    {titleCaseAudience(aud)}
                  </div>
                ))}
              </div>
            </div>
            ) : null}
          </div>
        </section>
        ) : null}

        <div className="ext-cta-banner">
          <div className="ext-cta-banner__inner CC__cyber-accent">
            <CyberCorners />
            <div className="ext-cta-banner__left">
              <div className="ext-cta-banner__icon">🏰</div>
              <div>
                <div className="ext-cta-banner__eyebrow">Follow the Journey</div>
                <div className="ext-cta-banner__title">Building in Public. $0 to $100K.</div>
                <div className="ext-cta-banner__sub">
                  I&apos;m building useful products, sharing everything, and documenting the entire journey.
                </div>
              </div>
            </div>
            <div className="ext-cta-banner__btns">
              <a href="https://www.youtube.com/@CodedCitadel" className="CC__btn CC__btn--primary" target="_blank" rel="noopener noreferrer">
                Watch on YouTube
              </a>
              <Link to="/apps" className="CC__btn CC__btn--outline">
                All Apps
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
    </AppPageShell>
  )
}
