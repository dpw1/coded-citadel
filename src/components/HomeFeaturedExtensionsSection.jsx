import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ChromeIcon from './ChromeIcon'
import ExtensionVideoModal from './ExtensionVideoModal'
import { FEATURED_EXTENSION_SLUGS } from '../constants/featuredExtensionSlugs'
import { getBlogPostForApp } from '../utils/blog'
import {
  appBuildYoutubeUrl,
  appCardSummary,
  appFilterLabel,
  appHeroPreviewUrl,
  appIconUrl,
  appStoreUrl,
  getAppBySlug,
  getAppsForPlatform,
  youtubeEmbedId,
} from '../utils/apps'
import './HomeFeaturedExtensionsSection.css'

const MAX_CARDS = 4

const TABS = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'instagram', label: 'Instagram' },
]

const PLAY_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
)

function resolveYoutubeVideoId(app) {
  if (!app) return null
  const blogPost = getBlogPostForApp(app)
  const episodeYoutubeUrl = blogPost?.youtubeId
    ? `https://www.youtube.com/watch?v=${blogPost.youtubeId}`
    : null
  const youtubeUrl = episodeYoutubeUrl || appBuildYoutubeUrl(app)
  return youtubeUrl ? youtubeEmbedId(youtubeUrl) : null
}

function cardThumbUrl(app, videoId) {
  if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  const preview = appHeroPreviewUrl(app)
  if (preview) return preview
  const icon = appIconUrl(app)
  if (icon) return icon
  return null
}

function appsForTab(tabId) {
  if (tabId === 'popular') {
    return FEATURED_EXTENSION_SLUGS.map((slug) => getAppBySlug(slug)).filter(Boolean)
  }
  if (tabId === 'youtube') return getAppsForPlatform('youtube')
  if (tabId === 'instagram') return getAppsForPlatform('instagram')
  return []
}

export default function HomeFeaturedExtensionsSection() {
  const [activeTab, setActiveTab] = useState('popular')
  const [videoModal, setVideoModal] = useState({
    open: false,
    videoId: null,
    title: '',
    titleHref: null,
  })
  const tabRefs = useRef({})

  const visibleApps = useMemo(() => {
    const withStore = appsForTab(activeTab).filter((app) => appStoreUrl(app))
    return withStore.slice(0, MAX_CARDS)
  }, [activeTab])

  const closeVideoModal = useCallback(() => {
    setVideoModal({ open: false, videoId: null, title: '', titleHref: null })
  }, [])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    const button = tabRefs.current[tabId]
    button?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' })
  }

  useEffect(() => {
    const button = tabRefs.current[activeTab]
    button?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
  }, [activeTab])

  const openVideo = (app) => {
    const videoId = resolveYoutubeVideoId(app)
    const displayName = appFilterLabel(app)
    if (!videoId) {
      const storeUrl = appStoreUrl(app)
      if (storeUrl) window.open(storeUrl, '_blank', 'noopener,noreferrer')
      return
    }
    setVideoModal({
      open: true,
      videoId,
      title: displayName,
      titleHref: `/apps/${app.slug}`,
    })
  }

  return (
    <section
      id="featured-extensions"
      className="CC__home-featured CC__container"
      aria-label="Featured Chrome extensions"
    >
      <div className="CC__section-header-row CC__home-featured__header">
        <div>
          <p className="CC__section-eyebrow">Chrome Extensions</p>
          <h2 className="CC__section-title">Popular tools</h2>
        </div>
      </div>

      <div className="CC__home-featured__tabs-wrap">
        <nav className="CC__tabs CC__home-featured__tabs" role="tablist" aria-label="Extension categories">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              ref={(node) => {
                tabRefs.current[tab.id] = node
              }}
              aria-selected={tab.id === activeTab}
              className={`CC__tabs__btn${tab.id === activeTab ? ' CC__tabs__btn--active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="CC__home-featured__grid" role="list">
        {visibleApps.length === 0 ? (
          <p className="CC__home-featured__empty">No extensions in this category yet.</p>
        ) : (
          visibleApps.map((app) => {
            const videoId = resolveYoutubeVideoId(app)
            const thumbUrl = cardThumbUrl(app, videoId)
            const displayName = appFilterLabel(app)
            const summary = appCardSummary(app)
            const storeUrl = appStoreUrl(app)
            const iconOnlyThumb = !videoId && !appHeroPreviewUrl(app) && appIconUrl(app)

            return (
              <article key={app.slug} className="CC__home-featured__card" role="listitem">
                <div className="CC__home-featured__card-media">
                  <button
                    type="button"
                    className="CC__home-featured__card-play-hit"
                    onClick={() => openVideo(app)}
                    aria-label={
                      videoId ? `Play video for ${displayName}` : `Download ${displayName}`
                    }
                  >
                    {thumbUrl ? (
                      <img
                        className={`CC__home-featured__card-thumb${iconOnlyThumb ? ' CC__home-featured__card-thumb--icon' : ''}`}
                        src={thumbUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="CC__home-featured__card-thumb CC__home-featured__card-thumb--placeholder" />
                    )}
                    {videoId ? (
                      <span className="CC__home-featured__card-play" aria-hidden="true">
                        {PLAY_ICON}
                      </span>
                    ) : null}
                  </button>
                </div>

                <div className="CC__home-featured__card-body">
                  <h3 className="CC__home-featured__card-title">{displayName}</h3>
                  {summary ? <p className="CC__home-featured__card-summary">{summary}</p> : null}
                  {storeUrl ? (
                    <a
                      href={storeUrl}
                      className="CC__ext-cta CC__ext-cta--visible CC__home-featured__download"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="CC__home-featured__download-icon" aria-hidden="true">
                        <ChromeIcon size={18} title="" />
                      </span>
                      Download
                    </a>
                  ) : null}
                </div>
              </article>
            )
          })
        )}
      </div>

      <ExtensionVideoModal
        open={videoModal.open}
        videoId={videoModal.videoId}
        title={videoModal.title}
        titleHref={videoModal.titleHref}
        onClose={closeVideoModal}
      />
    </section>
  )
}
