import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ExtensionCard from './ExtensionCard'
import ExtensionVideoModal from './ExtensionVideoModal'
import { getAllApps, appCategory, appCardInstalls } from '../utils/apps'

const PREV_ICON = (
  <svg viewBox="0 0 24 24">
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

const NEXT_ICON = (
  <svg viewBox="0 0 24 24">
    <path d="M9 18l6-6-6-6" />
  </svg>
)

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total]
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '…', current - 1, current, current + 1, '…', total]
}

function getCategories(apps) {
  const categories = [...new Set(apps.map((app) => appCategory(app)))].sort()
  return ['All', ...categories]
}

function shuffleApps(apps) {
  const list = [...apps]
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

export default function AppsGridSection({
  sectionId = 'apps',
  showViewAllLink = false,
  excludeSlug = null,
  eyebrow = 'Chrome Extensions',
  title,
  subtitle = null,
  titleAs = 'h2',
  enableTabs = false,
  enablePagination = false,
  perPage = 6,
  maxItems = null,
  randomize = false,
  sortByInstalls = false,
  showChromeStoreLink = false,
  contained = true,
  className = '',
  showInstalls = true,
  showUsers = true,
  showPublished = true,
  showViewMore = true,
  showVideoStat = true,
  showBlogLink = false,
  showStoreDownload = false,
}) {
  const [activeTab, setActiveTab] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [videoModal, setVideoModal] = useState({
    open: false,
    videoId: null,
    title: '',
    titleHref: null,
  })
  const sectionRef = useRef(null)
  const skipPageScrollRef = useRef(true)

  const apps = useMemo(
    () => getAllApps().filter((app) => app.slug !== excludeSlug),
    [excludeSlug],
  )

  const randomAppPath = useMemo(() => {
    if (!apps.length) return '/apps'
    const pick = apps[Math.floor(Math.random() * apps.length)]
    return `/apps/${pick.slug}`
  }, [apps])

  const sectionTitle = title ?? `Built in public, documented step-by-step`
  const TitleTag = titleAs

  const categories = useMemo(() => getCategories(apps), [apps])

  const filteredApps = useMemo(() => {
    if (!enableTabs || activeTab === 'All') return apps
    return apps.filter((app) => appCategory(app) === activeTab)
  }, [activeTab, apps, enableTabs])

  const visibleApps = useMemo(() => {
    let pool = filteredApps
    if (sortByInstalls) {
      pool = [...pool].sort(
        (a, b) => (appCardInstalls(b) ?? 0) - (appCardInstalls(a) ?? 0),
      )
    }
    if (randomize) pool = shuffleApps(pool)
    if (maxItems != null) return pool.slice(0, maxItems)
    if (!enablePagination) return pool
    const start = (currentPage - 1) * perPage
    return pool.slice(start, start + perPage)
  }, [
    currentPage,
    enablePagination,
    filteredApps,
    maxItems,
    perPage,
    randomize,
    sortByInstalls,
  ])

  const totalPages = enablePagination ? Math.ceil(filteredApps.length / perPage) : 1
  const showPagination = enablePagination && totalPages > 1
  const paginationStart = enablePagination ? (currentPage - 1) * perPage + 1 : 1
  const paginationEnd = enablePagination
    ? Math.min(currentPage * perPage, filteredApps.length)
    : visibleApps.length

  const handleTabChange = (category) => {
    setActiveTab(category)
    setCurrentPage(1)
  }

  const goToPage = (page) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    if (!enablePagination || skipPageScrollRef.current) {
      skipPageScrollRef.current = false
      return
    }

    const section = sectionRef.current
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage, enablePagination])

  const viewAllAppsLink = showViewAllLink ? (
    <Link to="/apps" className="CC__view-all-link">
      View all apps →
    </Link>
  ) : null

  const sectionClassName = [
    'CC__extensions',
    contained ? 'CC__container' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className={sectionClassName}
      aria-label="Extensions"
    >
      <div className="CC__section-header-row">
        <div>
          {eyebrow ? <p className="CC__section-eyebrow">{eyebrow}</p> : null}
          <TitleTag className="CC__section-title">{sectionTitle}</TitleTag>
          {subtitle ? <p className="CC__section-subtitle">{subtitle}</p> : null}
        </div>
        {viewAllAppsLink ? (
          <span className="CC__view-all-link-wrap CC__view-all-link-wrap--header">{viewAllAppsLink}</span>
        ) : showChromeStoreLink ? (
          <Link to={randomAppPath} className="CC__view-all-link">
            View random one →
          </Link>
        ) : null}
      </div>

      {enableTabs && categories.length > 1 ? (
        <nav className="CC__tabs" role="tablist" aria-label="Filter by category">
          {categories.map((category) => {
            const count =
              category === 'All'
                ? apps.length
                : apps.filter((app) => appCategory(app) === category).length

            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={category === activeTab}
                className={`CC__tabs__btn${category === activeTab ? ' CC__tabs__btn--active' : ''}`}
                onClick={() => handleTabChange(category)}
              >
                {category}
                <span className="CC__tabs__count">{count}</span>
              </button>
            )
          })}
        </nav>
      ) : null}

      <div className="CC__extensions-grid" role="list">
        {visibleApps.length === 0 ? (
          <div className="CC__extensions-empty">
            <div className="CC__extensions-empty__icon" aria-hidden="true">
              🔍
            </div>
            <p>No extensions in this category yet.</p>
          </div>
        ) : (
          visibleApps.map((app, index) => (
            <ExtensionCard
              key={app.slug}
              app={app}
              index={index}
              showInstalls={showInstalls}
              showUsers={showUsers}
              showPublished={showPublished}
              showViewMore={showViewMore}
              showVideoStat={showVideoStat}
              showBlogLink={showBlogLink}
              showStoreDownload={showStoreDownload}
              onPlayVideo={({ videoId, title: videoTitle, href }) =>
                setVideoModal({ open: true, videoId, title: videoTitle, titleHref: href ?? null })
              }
            />
          ))
        )}
      </div>

      {showPagination ? (
        <nav className="CC__pagination" aria-label="Pages">
          <button
            type="button"
            className="CC__pagination__btn"
            aria-label="Previous"
            disabled={currentPage === 1}
            onClick={() => goToPage(Math.max(1, currentPage - 1))}
          >
            {PREV_ICON}
          </button>

          {buildPageList(currentPage, totalPages).map((page, index) =>
            page === '…' ? (
              <span key={`ellipsis-${index}`} className="CC__pagination__ellipsis" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                className={`CC__pagination__btn${page === currentPage ? ' CC__pagination__btn--active' : ''}`}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ),
          )}

          <button
            type="button"
            className="CC__pagination__btn"
            aria-label="Next"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
          >
            {NEXT_ICON}
          </button>
        </nav>
      ) : null}

      {enablePagination && filteredApps.length > 0 ? (
        <p className="CC__pagination__info">
          Showing {paginationStart}–{paginationEnd} of {filteredApps.length} extensions
        </p>
      ) : null}

      {viewAllAppsLink ? (
        <div className="CC__view-all-link-wrap CC__view-all-link-wrap--footer">{viewAllAppsLink}</div>
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
    </section>
  )
}
