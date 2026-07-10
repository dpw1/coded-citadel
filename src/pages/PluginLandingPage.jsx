import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import PageSEO from '../components/PageSEO'
import PluginsGridSection from '../components/PluginsGridSection'
import { usePluginEvents } from '../hooks/usePluginEvents'
import {
  formatPluginDownloads,
  formatPluginPublishedAgo,
  getPluginBySlug,
  isPluginLive,
  pluginCategory,
  pluginDownloadUrl,
  pluginIconUrl,
  pluginYoutubeEmbedUrl,
  splitPluginTitle,
} from '../utils/plugins'
import '../App.css'
import './ExtensionLandingPage.css'
import './PluginLandingPage.css'

function formatPluginDate(iso) {
  if (!iso) return '—'
  const raw = String(iso).trim()
  const d = raw.includes('T') ? new Date(raw) : new Date(`${raw}T12:00:00`)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

function PluginPageShell({ children }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  )
}

function PluginNotFound() {
  return (
    <PluginPageShell>
      <PageSEO
        title="Plugin not found — Coded Citadel"
        description="No DaVinci Resolve plugin matches this URL."
        canonicalPath="/plugins"
        robots="noindex, follow"
      />
      <main className="ext-page">
        <div className="CC__container" style={{ padding: '4rem 0' }}>
          <Link to="/plugins" className="ext-page__back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Plugins
          </Link>
          <h1 className="ext-analytics__title" style={{ marginTop: '2rem' }}>
            Plugin not found
          </h1>
          <p className="ext-hero__tagline" style={{ maxWidth: 'none' }}>
            No plugin matches this URL.
          </p>
          <Link to="/plugins" className="CC__btn CC__btn--primary" style={{ marginTop: '1.5rem' }}>
            View all plugins
          </Link>
        </div>
      </main>
    </PluginPageShell>
  )
}

export default function PluginLandingPage() {
  const { slug } = useParams()
  const plugin = getPluginBySlug(slug)
  const [modalOpen, setModalOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [stickyHidden, setStickyHidden] = useState(false)
  const footerCtaRef = useRef(null)
  const {
    downloadCount,
    downloadCountReady,
    trackDownloadClick,
    trackModalOpen,
    trackSocialClick,
    trackModalSkip,
    trackFaqOpen,
  } = usePluginEvents(plugin?.slug)

  useEffect(() => {
    const btn = footerCtaRef.current
    if (!btn || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setStickyHidden(entry.isIntersecting)
        })
      },
      { threshold: 0.3 },
    )
    observer.observe(btn)
    return () => observer.disconnect()
  }, [plugin])

  useEffect(() => {
    if (!modalOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setModalOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [modalOpen])

  useEffect(() => {
    if (modalOpen) trackModalOpen()
  }, [modalOpen, trackModalOpen])

  if (!plugin) return <PluginNotFound />

  if (!isPluginLive(plugin)) {
    return (
      <PluginPageShell>
        <PageSEO
          title={`${plugin.name} — Coming Soon | Coded Citadel`}
          description={plugin.tagline || plugin.description}
          canonicalPath={`/plugins/${plugin.slug}`}
          robots="noindex, follow"
        />
        <main className="ext-page">
          <div className="CC__container" style={{ padding: '4rem 0' }}>
            <Link to="/plugins" className="ext-page__back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              All Plugins
            </Link>
            <h1 className="ext-analytics__title" style={{ marginTop: '2rem' }}>
              {plugin.name}
            </h1>
            <p className="ext-hero__tagline" style={{ maxWidth: 'none' }}>
              {plugin.tagline}
            </p>
            <p className="CC__btn CC__btn--outline" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              Coming Soon
            </p>
          </div>
        </main>
      </PluginPageShell>
    )
  }

  const titleParts = splitPluginTitle(plugin)
  const embedUrl = pluginYoutubeEmbedUrl(plugin.primaryVideo)
  const downloadUrl = pluginDownloadUrl(plugin)
  const iconUrl = pluginIconUrl(plugin)
  const downloadsLabel =
    downloadCountReady && downloadCount != null && downloadCount > 0
      ? formatPluginDownloads(downloadCount)
      : null
  const seoTitle =
    plugin.seo?.title || `${plugin.name} — Free DaVinci Resolve Plugin | Coded Citadel`
  const seoDescription =
    plugin.seo?.description || plugin.description || plugin.tagline
  const downloadLabel = plugin.download?.label || 'Download Now'
  const youtubeLink = plugin.links?.youtube || 'https://www.youtube.com/@CodedCitadel'
  const instagramLink = plugin.links?.instagram || 'https://www.instagram.com/codedcitadel'
  const liveLabel = `Live · ${plugin.price || 'Free'} ${pluginCategory(plugin)}`
  const browserUrl =
    downloadUrl?.replace(/^https?:\/\//, '') ||
    `codedcitadel.com/downloads/${plugin.download?.filename || `${plugin.slug}.drfx`}`
  const publishedAgo = formatPluginPublishedAgo(plugin)

  const startDownload = (source) => {
    if (downloadUrl) {
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = plugin.download?.filename || ''
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
    trackDownloadClick({ source })
    setModalOpen(true)
  }

  const toggleFaq = (index, question) => {
    const willOpen = openFaq !== index
    setOpenFaq((prev) => (prev === index ? null : index))
    if (willOpen) trackFaqOpen(question)
  }

  const scrollToFaq = () => {
    document.querySelector('.plugin-faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <PluginPageShell>
      <PageSEO
        title={seoTitle}
        description={seoDescription}
        canonicalPath={`/plugins/${plugin.slug}`}
      />
      <main className="ext-page plugin-page">
        <div className="CC__container">
          <Link to="/plugins" className="ext-page__back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Plugins
          </Link>

          <section className="ext-hero">
            <div className="ext-hero__grid">
              <div className="ext-hero__left">
                <div className="ext-hero__live">
                  <span className="ext-hero__live-dot" />
                  {liveLabel}
                </div>

                <h1 className="ext-hero__title">
                  {titleParts.before}
                  {titleParts.highlight ? <span>{titleParts.highlight}</span> : null}
                  {titleParts.after}
                </h1>

                <p className="ext-hero__tagline">{plugin.tagline}</p>

                <div className="ext-hero__meta">
                  {plugin.resolveVersion ? (
                    <div className="ext-hero__badge">
                      <span className="ext-hero__badge-label">Requires</span>
                      <span className="ext-hero__badge-value">{plugin.resolveVersion}</span>
                    </div>
                  ) : null}
                  {plugin.version ? (
                    <div className="ext-hero__badge">
                      <span className="ext-hero__badge-label">Version</span>
                      <span className="ext-hero__badge-value">v{plugin.version}</span>
                    </div>
                  ) : null}
                  <div className="ext-hero__badge">
                    <span className="ext-hero__badge-label">Price</span>
                    <span className="ext-hero__badge-value ext-hero__badge-value--orange">
                      {plugin.price || 'Free'}
                    </span>
                  </div>
                  <div className="ext-hero__badge">
                    <span className="ext-hero__badge-label">Category</span>
                    <span className="ext-hero__badge-value">{pluginCategory(plugin)}</span>
                  </div>
                  {plugin.lastUpdated ? (
                    <div className="ext-hero__badge">
                      <span className="ext-hero__badge-label">Updated</span>
                      <span className="ext-hero__badge-value">{formatPluginDate(plugin.lastUpdated)}</span>
                    </div>
                  ) : null}
                  {plugin.created ? (
                    <div className="ext-hero__badge">
                      <span className="ext-hero__badge-label">Created</span>
                      <span className="ext-hero__badge-value">{formatPluginDate(plugin.created)}</span>
                    </div>
                  ) : null}
                  {publishedAgo ? (
                    <div className="ext-hero__badge">
                      <span className="ext-hero__badge-label">Published</span>
                      <span className="ext-hero__badge-value">{publishedAgo.replace(/^Published\s+/i, '')}</span>
                    </div>
                  ) : null}
                </div>

                <div className="ext-hero__cta">
                  <button
                    type="button"
                    className="CC__btn CC__btn--primary ext-hero__cta-primary"
                    onClick={() => startDownload('hero')}
                    disabled={!downloadUrl}
                  >
                    <span>
                      {downloadLabel}
                      {plugin.price ? (
                        <span className="ext-hero__cta-primary-sub">It&apos;s {plugin.price.toLowerCase()}</span>
                      ) : null}
                    </span>
                  </button>
                  {plugin.faq.length > 0 ? (
                    <button type="button" className="CC__btn CC__btn--outline" onClick={scrollToFaq}>
                      View FAQ
                    </button>
                  ) : null}
                </div>

                {(iconUrl || downloadsLabel) ? (
                  <div className="ext-hero__installs-row">
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt={`${plugin.name} icon`}
                        className="ext-hero__store-icon"
                        width={48}
                        height={48}
                      />
                    ) : null}
                    {downloadsLabel ? (
                      <span className="ext-hero__installs">
                        <svg viewBox="0 0 24 24">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {downloadsLabel} downloads
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="ext-hero__right">
                <div className="ext-hero__browser">
                  <div className="ext-hero__browser-bar">
                    <div className="ext-hero__browser-dots">
                      <div className="ext-hero__browser-dot ext-hero__browser-dot--red" />
                      <div className="ext-hero__browser-dot ext-hero__browser-dot--yellow" />
                      <div className="ext-hero__browser-dot ext-hero__browser-dot--green" />
                    </div>
                    <div className="ext-hero__browser-url">{browserUrl}</div>
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
                      {embedUrl ? (
                        <iframe
                          src={embedUrl}
                          title={plugin.primaryVideo?.title || `${plugin.name} demo`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="plugin-hero__placeholder">Demo video coming soon</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {plugin.tagline || plugin.description ? (
            <section className="ext-description">
              {plugin.tagline ? <p className="ext-description__short">{plugin.tagline}</p> : null}
              {plugin.description ? (
                <p className="ext-description__full">{plugin.description}</p>
              ) : null}
            </section>
          ) : null}

          {plugin.images.length > 0 ? (
            <section className="ext-screenshots" aria-label="Screenshots">
              <h2 className="ext-screenshots__title">Screenshots</h2>
              <div className="ext-screenshots__grid">
                {plugin.images.map((img, index) => (
                  <img
                    key={img.src || img.url}
                    src={img.src || img.url}
                    alt={img.alt || `${plugin.name} screenshot ${index + 1}`}
                    className="ext-screenshots__img"
                    loading="lazy"
                  />
                ))}
              </div>
            </section>
          ) : null}

          {plugin.faq.length > 0 ? (
            <section className="plugin-faq">
              <h2 className="plugin-section-title">FAQ</h2>
              <div className="plugin-faq__list">
                {plugin.faq.map((item, index) => {
                  const isOpen = openFaq === index
                  return (
                    <div
                      key={item.question}
                      className={`plugin-faq__item${isOpen ? ' open' : ''}`}
                    >
                      <button
                        type="button"
                        className="plugin-faq__question"
                        onClick={() => toggleFaq(index, item.question)}
                        aria-expanded={isOpen}
                      >
                        {item.question}
                        <svg
                          className="chevron"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      <div className="plugin-faq__answer">
                        <div className="plugin-faq__answer-inner">{item.answer}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ) : null}

          <section className="plugin-footer-cta">
            <h2 className="plugin-footer-cta__title">Ready to try it?</h2>
            <button
              ref={footerCtaRef}
              type="button"
              className="CC__btn CC__btn--primary"
              onClick={() => startDownload('footer')}
              disabled={!downloadUrl}
            >
              {downloadLabel}
            </button>
            <div className="plugin-footer-cta__links">
              {plugin.links?.blog ? (
                <Link to={plugin.links.blog}>Read the blog post</Link>
              ) : null}
              <Link to="/plugins">More DaVinci Resolve plugins</Link>
              <Link to="/apps">Chrome extensions</Link>
            </div>
          </section>

          <PluginsGridSection
            sectionId="more-plugins"
            excludeSlug={plugin.slug}
            eyebrow="Explore"
            title="More Plugins"
            showViewAllLink
            maxItems={6}
          />
        </div>
      </main>

      <div className={`plugin-sticky-atc${stickyHidden ? ' hidden' : ''}`}>
        <div className="plugin-sticky-atc__inner">
          <div className="plugin-sticky-atc__info">
            <div className="plugin-sticky-atc__name">{plugin.name}</div>
            <div className="plugin-sticky-atc__sub">
              {plugin.stickySub ||
                `${plugin.price || 'Free'} ${pluginCategory(plugin)}${
                  plugin.resolveVersion ? ` · ${plugin.resolveVersion}` : ''
                }`}
            </div>
          </div>
          <button
            type="button"
            className="CC__btn CC__btn--primary"
            onClick={() => startDownload('sticky_atc')}
            disabled={!downloadUrl}
          >
            {downloadLabel}
          </button>
        </div>
      </div>

      <div
        className={`plugin-modal-overlay${modalOpen ? ' open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModalOpen(false)
        }}
        role="presentation"
      >
        <div className="plugin-modal" role="dialog" aria-modal="true" aria-labelledby="plugin-modal-title">
          <button
            type="button"
            className="plugin-modal__close"
            onClick={() => setModalOpen(false)}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <div className="plugin-modal__icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
          </div>
          <h3 id="plugin-modal-title" className="plugin-modal__title">
            {plugin.modal?.title || "Your download's starting"}
          </h3>
          <p className="plugin-modal__desc">
            {plugin.modal?.description ||
              `${plugin.name} is free. If it saves you time, the best thanks is following along.`}
          </p>
          <div className="plugin-modal__socials">
            <a
              className="plugin-modal__social"
              href={youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackSocialClick('youtube')}
            >
              <svg viewBox="0 0 24 24">
                <path d="M22.5 6.2a4.5 4.5 0 00-3.2-3.2C17 2.5 12 2.5 12 2.5s-5 0-7.3.5A4.5 4.5 0 001.5 6.2 47 47 0 001 12a47 47 0 00.5 5.8 4.5 4.5 0 003.2 3.2c2.3.5 7.3.5 7.3.5s5 0 7.3-.5a4.5 4.5 0 003.2-3.2A47 47 0 0023 12a47 47 0 00-.5-5.8zM9.8 15.5v-7l6 3.5-6 3.5z" />
              </svg>
              YouTube
            </a>
            <a
              className="plugin-modal__social"
              href={instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackSocialClick('instagram')}
            >
              <svg viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="var(--CC__color-primary)" stroke="none" />
              </svg>
              Instagram
            </a>
          </div>
          <button
            type="button"
            className="plugin-modal__skip"
            onClick={() => {
              trackModalSkip()
              setModalOpen(false)
            }}
          >
            No thanks, just download
          </button>
        </div>
      </div>
    </PluginPageShell>
  )
}
