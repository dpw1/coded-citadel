import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ChromeIcon from './ChromeIcon'
import ExtensionCard from './ExtensionCard'
import ExtensionVideoModal from './ExtensionVideoModal'
import portfolioData from '../data/work-portfolio.json'
import { appCardInstalls, getAllApps } from '../utils/apps'
import {
  buildTechFilterOptions,
  getAppTechStack,
  projectHasTech,
} from '../utils/workTech'
import './WorkRecentTabsSection.css'
import './WorkPortfolioSection.css'

const CLOSE_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

const CHEVRON_LEFT = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CHEVRON_RIGHT = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const SHOPIFY_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#95BF46"
      d="M19.932 4.673a.233.233 0 0 0-.21-.195l-1.932-.144-1.422-1.413c-.141-.141-.415-.098-.522-.067l-.717.221C14.701 1.844 13.946.712 12.617.712c-.037 0-.074.001-.112.004C12.128.217 11.66 0 11.255 0 8.16 0 6.681 3.869 6.218 5.836c-1.203.372-2.057.637-2.166.672-.672.21-.693.231-.781.864-.067.479-1.823 14.063-1.823 14.063L15.136 24l7.417-1.604-2.621-17.723zM14.373 3.31l-1.158.358.001-.25c0-.765-.106-1.382-.277-1.87.685.087 1.141.866 1.434 1.762zM12.09 1.701c.19.477.314 1.161.314 2.085l-.001.134-2.392.741c.461-1.778 1.324-2.636 2.079-2.96zM11.17.83c.134 0 .268.045.397.134-.992.467-2.055 1.642-2.504 3.99l-1.891.586C7.698 3.749 8.947.83 11.17.83z"
    />
    <path
      fill="#5E8E3E"
      d="m19.723 4.478-1.932-.144-1.422-1.413a.36.36 0 0 0-.198-.091L15.136 24l7.416-1.604s-2.604-17.602-2.62-17.723a.232.232 0 0 0-.209-.195z"
    />
    <path
      fill="#FFF"
      d="m12.618 8.576-.914 2.72s-.801-.428-1.783-.428c-1.44 0-1.512.904-1.512 1.131 0 1.242 3.239 1.718 3.239 4.629 0 2.29-1.452 3.764-3.41 3.764-2.35 0-3.551-1.462-3.551-1.462l.629-2.079s1.235 1.06 2.277 1.06c.681 0 .958-.536.958-.928 0-1.621-2.657-1.693-2.657-4.356 0-2.241 1.609-4.41 4.856-4.41 1.25.001 1.868.359 1.868.359z"
    />
  </svg>
)

const projects = portfolioData.projects ?? []

const TABS = [
  {
    id: 'all',
    label: 'All',
    subtitle:
      'Fullstack dev, 10+ years in e-commerce and SaaS, currently building in public. Every project I ship is documented in detail on my Blog and YouTube.',
  },
  {
    id: 'shopify',
    label: 'Shopify',
    subtitle:
      'Working with Global brands since 2018, coding websites from scratch hosting thousands of visitors. Numbers verifiable via SimilarWeb.',
  },
  {
    id: 'extensions',
    label: 'Chrome Extensions MV3',
    subtitle:
      'Every single extension has been thoroughly documented on my blog, from how I found the idea, validated it, coded it and deployed.',
  },
]

export default function WorkRecentTabsSection() {
  const [activeTab, setActiveTab] = useState('all')
  const [activeTechId, setActiveTechId] = useState('all')
  const [animKey, setAnimKey] = useState(0)
  const [activeProject, setActiveProject] = useState(null)
  const [videoModal, setVideoModal] = useState({
    open: false,
    videoId: null,
    title: '',
    titleHref: null,
  })
  const videoRef = useRef(null)
  const techTrackRef = useRef(null)
  const tabsTrackRef = useRef(null)
  const [techScroll, setTechScroll] = useState({ left: false, right: false })
  const [tabsScroll, setTabsScroll] = useState({ left: false, right: false })

  const showExtensions = activeTab === 'all' || activeTab === 'extensions'
  const showTechFilters = showExtensions

  const extensions = useMemo(
    () => [...getAllApps()].sort((a, b) => (appCardInstalls(b) ?? 0) - (appCardInstalls(a) ?? 0)),
    [],
  )

  const extensionStacks = useMemo(
    () => extensions.map((app) => getAppTechStack(app)),
    [extensions],
  )

  const shopifyStacks = useMemo(() => projects.map((project) => project.techStack ?? []), [])

  const techFilters = useMemo(() => {
    if (!showTechFilters) return []
    const stacks = activeTab === 'all' ? [...extensionStacks, ...shopifyStacks] : extensionStacks
    const allCount =
      activeTab === 'all' ? extensions.length + projects.length : extensions.length
    return buildTechFilterOptions(stacks, allCount, activeTechId)
  }, [
    showTechFilters,
    activeTab,
    extensionStacks,
    shopifyStacks,
    extensions.length,
    activeTechId,
  ])

  const visibleProjects = useMemo(() => {
    if (activeTab === 'shopify') return projects
    if (activeTab !== 'all') return []
    if (!activeTechId || activeTechId === 'all') return projects
    return projects.filter((project) => projectHasTech(project.techStack ?? [], activeTechId))
  }, [activeTab, activeTechId])

  const showShopify = visibleProjects.length > 0

  const visibleExtensions = useMemo(() => {
    if (!showExtensions) return []
    if (!activeTechId || activeTechId === 'all') return extensions
    return extensions.filter((app) => projectHasTech(getAppTechStack(app), activeTechId))
  }, [showExtensions, extensions, activeTechId])

  const readScrollEdges = useCallback((track) => {
    if (!track) return { left: false, right: false }
    const maxScroll = track.scrollWidth - track.clientWidth
    return {
      left: track.scrollLeft > 2,
      right: track.scrollLeft < maxScroll - 2,
    }
  }, [])

  const scrollTrack = (track, direction) => {
    if (!track) return
    const amount = Math.max(140, Math.round(track.clientWidth * 0.55))
    track.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  useEffect(() => {
    const track = tabsTrackRef.current
    if (!track) return undefined

    const update = () => setTabsScroll(readScrollEdges(track))
    update()
    track.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    observer?.observe(track)

    return () => {
      track.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      observer?.disconnect()
    }
  }, [readScrollEdges])

  useEffect(() => {
    if (!showTechFilters || !techFilters.length) {
      setTechScroll({ left: false, right: false })
      return undefined
    }

    const track = techTrackRef.current
    if (!track) return undefined

    const update = () => setTechScroll(readScrollEdges(track))
    update()
    track.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    observer?.observe(track)

    return () => {
      track.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      observer?.disconnect()
    }
  }, [showTechFilters, techFilters, readScrollEdges])

  const selectTab = (tabId) => {
    if (tabId === activeTab) return
    setActiveTab(tabId)
    setAnimKey((key) => key + 1)
  }

  const selectTech = (techId) => {
    setActiveTechId(techId)
  }

  const closeModal = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.removeAttribute('src')
      videoRef.current.load()
    }
    setActiveProject(null)
  }, [])

  useEffect(() => {
    if (!activeProject) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeModal()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeProject, closeModal])

  useEffect(() => {
    if (!activeProject || !videoRef.current) return

    videoRef.current.src = activeProject.video
    videoRef.current.load()
    videoRef.current.play().catch(() => {})
  }, [activeProject])

  const activeTabMeta = TABS.find((tab) => tab.id === activeTab) ?? TABS[0]

  return (
    <>
      <section className="CC__work-recent" aria-label="Recent work">
        <div className="CC__work-recent__header">
          <p className="CC__section-eyebrow">Portfolio</p>
          <h2 className="CC__section-title">Recent Work</h2>
          <p key={activeTab} className="CC__work-recent__subtitle">
            {activeTabMeta.subtitle}
          </p>
        </div>

        <div className="CC__work-recent__filters">
          <div className="CC__work-recent__tabs">
            <button
              type="button"
              className="CC__work-recent__scroll-arrow CC__work-recent__tabs__arrow CC__work-recent__scroll-arrow--prev"
              aria-label="Scroll categories left"
              disabled={!tabsScroll.left}
              onClick={() => scrollTrack(tabsTrackRef.current, -1)}
            >
              {CHEVRON_LEFT}
            </button>

            <nav
              ref={tabsTrackRef}
              className="CC__work-recent__tabs__track"
              role="tablist"
              aria-label="Work categories"
            >
              {TABS.map((tab) => {
                const selected = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`work-recent-tab-${tab.id}`}
                    aria-selected={selected}
                    aria-controls={`work-recent-panel-${tab.id}`}
                    className={`CC__work-recent__tab${selected ? ' CC__work-recent__tab--active' : ''}`}
                    onClick={() => selectTab(tab.id)}
                  >
                    <span className="CC__work-recent__tab-icon" aria-hidden="true">
                      {tab.id === 'shopify' ? (
                        SHOPIFY_ICON
                      ) : tab.id === 'extensions' ? (
                        <ChromeIcon size={18} title="" />
                      ) : null}
                    </span>
                    {tab.label}
                  </button>
                )
              })}
            </nav>

            <button
              type="button"
              className="CC__work-recent__scroll-arrow CC__work-recent__tabs__arrow CC__work-recent__scroll-arrow--next"
              aria-label="Scroll categories right"
              disabled={!tabsScroll.right}
              onClick={() => scrollTrack(tabsTrackRef.current, 1)}
            >
              {CHEVRON_RIGHT}
            </button>
          </div>

          {showTechFilters && techFilters.length ? (
            <div className="CC__work-recent__tech-filters">
              <button
                type="button"
                className="CC__work-recent__scroll-arrow CC__work-recent__scroll-arrow--prev"
                aria-label="Scroll tech tags left"
                disabled={!techScroll.left}
                onClick={() => scrollTrack(techTrackRef.current, -1)}
              >
                {CHEVRON_LEFT}
              </button>

              <nav
                ref={techTrackRef}
                className="CC__work-recent__tech-filters__track"
                aria-label="Technology filters"
              >
                {techFilters.map((tech) => {
                  const selected = activeTechId === tech.id
                  return (
                    <button
                      key={tech.id}
                      type="button"
                      className={`CC__work-recent__tech-filters__tag${selected ? ' CC__work-recent__tech-filters__tag--active' : ''}`}
                      aria-pressed={selected}
                      onClick={() => selectTech(tech.id)}
                    >
                      {tech.iconUrl ? (
                        <img
                          src={tech.iconUrl}
                          alt=""
                          width={14}
                          height={14}
                          className="CC__work-recent__tech-filters__icon"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : null}
                      <span className="CC__work-recent__tech-filters__label">
                        {tech.label}
                        <span className="CC__work-recent__tech-filters__count"> ({tech.count})</span>
                      </span>
                    </button>
                  )
                })}
              </nav>

              <button
                type="button"
                className="CC__work-recent__scroll-arrow CC__work-recent__scroll-arrow--next"
                aria-label="Scroll tech tags right"
                disabled={!techScroll.right}
                onClick={() => scrollTrack(techTrackRef.current, 1)}
              >
                {CHEVRON_RIGHT}
              </button>
            </div>
          ) : null}
        </div>

        <div
          key={`${activeTab}-${animKey}`}
          id={`work-recent-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`work-recent-tab-${activeTab}`}
          className="CC__work-recent__panel"
        >
          {showShopify ? (
            <div className="CC__work-portfolio__grid">
              {visibleProjects.map((project, index) => (
                <article
                  key={project.id}
                  className="CC__work-portfolio-card"
                  style={{ '--delay': `${index * 70}ms` }}
                >
                  <button
                    type="button"
                    className="CC__work-portfolio-card__hit"
                    onClick={() => setActiveProject(project)}
                    aria-label={`Watch ${project.title} project video`}
                  >
                    <video
                      className="CC__work-portfolio-card__thumb"
                      src={project.video}
                      muted
                      playsInline
                      preload="metadata"
                      aria-hidden="true"
                    />
                    <span className="CC__work-portfolio-card__play" aria-hidden="true">
                      ▶
                    </span>
                  </button>
                  <div className="CC__work-portfolio-card__overlay">
                    <span className="CC__work-portfolio-card__name">
                      <span className="CC__work-portfolio-card__name-icon" aria-hidden="true">
                        {SHOPIFY_ICON}
                      </span>
                      {project.title}
                    </span>
                    <span className="CC__work-portfolio-card__tag">
                      {project.platform}
                      {' · '}
                      <a
                        className="CC__work-portfolio-card__visitors"
                        href={project.similarwebUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {project.visitorsLabel}
                      </a>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {showExtensions ? (
            <div
              className={`CC__extensions-grid${showShopify ? ' CC__work-recent__extensions--after-shopify' : ''}`}
              role="list"
            >
              {visibleExtensions.map((app, index) => (
                <ExtensionCard
                  key={app.slug}
                  app={app}
                  index={index}
                  showInstalls={false}
                  showUsers={false}
                  showPublished={false}
                  showViewMore={false}
                  showVersion={false}
                  showVideoStat
                  showBlogLink
                  showStoreDownload
                  onPlayVideo={({ videoId, title: videoTitle, href }) =>
                    setVideoModal({
                      open: true,
                      videoId,
                      title: videoTitle,
                      titleHref: href ?? null,
                    })
                  }
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {activeProject ? (
        <div
          className="CC__modal-backdrop CC__modal-backdrop--open CC__work-portfolio-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeProject.title} project video`}
          onClick={closeModal}
        >
          <div className="CC__modal CC__work-portfolio-modal__box" onClick={(event) => event.stopPropagation()}>
            <div className="CC__modal__header">
              <a
                className="CC__modal__title CC__modal__title--link"
                href={activeProject.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {activeProject.title}
              </a>
              <button
                type="button"
                className="CC__modal__close"
                aria-label="Close video"
                onClick={closeModal}
              >
                {CLOSE_ICON}
              </button>
            </div>

            <div className="CC__work-portfolio-modal__body">
              <video
                ref={videoRef}
                className="CC__work-portfolio-modal__video"
                controls
                playsInline
              />

              <div className="CC__work-portfolio-modal__info">
                {activeProject.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="CC__work-portfolio-modal__actions">
              <a
                href={activeProject.link}
                target="_blank"
                rel="noopener noreferrer"
                className="CC__work-portfolio-modal__link"
              >
                View live site: {activeProject.linkLabel} →
              </a>
              {activeProject.similarwebUrl ? (
                <a
                  href={activeProject.similarwebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="CC__work-portfolio-modal__link"
                >
                  View monthly visitors →
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <ExtensionVideoModal
        open={videoModal.open}
        videoId={videoModal.videoId}
        title={videoModal.title}
        titleHref={videoModal.titleHref}
        onClose={() =>
          setVideoModal({ open: false, videoId: null, title: '', titleHref: null })
        }
      />
    </>
  )
}
