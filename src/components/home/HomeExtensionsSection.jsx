import { useEffect, useMemo, useRef, useState } from 'react'
// import ExtensionVideoModal from '../ExtensionVideoModal'
import { FEATURED_EXTENSION_SLUGS } from '../../constants/featuredExtensionSlugs'
import {
  appActiveUsers,
  appStoreUrl,
  getAppBySlug,
  getListedApps,
} from '../../utils/apps'
import HomeExtensionShowcaseCard from './HomeExtensionShowcaseCard'
import {
  HOME_CATALOG_FILTERS,
  HOME_EXTENSIONS_PER_PAGE,
  appMatchesHomeExtensionFilter,
  countHomeExtensionFilter,
  isHomeCatalogExtensionVisible,
} from './homeExtensionFilters'
// import { resolveYoutubeVideoId } from './homeExtensionShowcaseUtils'
import './HomeExtensionShowcase.css'

const PREV_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

const NEXT_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 18l6-6-6-6" />
  </svg>
)

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total]
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '…', current - 1, current, current + 1, '…', total]
}

export default function HomeExtensionsSection() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const catalogRef = useRef(null)
  const skipPageScrollRef = useRef(true)
  /*
  const lastVideoTriggerRef = useRef(null)
  const [videoModal, setVideoModal] = useState({
    open: false,
    videoId: null,
    title: '',
    titleHref: null,
    storeUrl: null,
  })
  */

  const listedApps = useMemo(
    () =>
      getListedApps().filter(
        (app) => appStoreUrl(app) && isHomeCatalogExtensionVisible(app),
      ),
    [],
  )

  const featuredApps = useMemo(
    () => FEATURED_EXTENSION_SLUGS.map((slug) => getAppBySlug(slug)).filter(Boolean),
    [],
  )

  const catalogPool = useMemo(
    () =>
      [...listedApps].sort((a, b) => (appActiveUsers(b) ?? 0) - (appActiveUsers(a) ?? 0)),
    [listedApps],
  )

  const filteredCatalogApps = useMemo(() => {
    if (activeFilter === 'All') return catalogPool
    return catalogPool.filter((app) => appMatchesHomeExtensionFilter(app, activeFilter))
  }, [activeFilter, catalogPool])

  const totalPages = Math.max(1, Math.ceil(filteredCatalogApps.length / HOME_EXTENSIONS_PER_PAGE))
  const showPagination = totalPages > 1
  const paginationStart =
    filteredCatalogApps.length === 0
      ? 0
      : (currentPage - 1) * HOME_EXTENSIONS_PER_PAGE + 1
  const paginationEnd = Math.min(currentPage * HOME_EXTENSIONS_PER_PAGE, filteredCatalogApps.length)

  const pageApps = useMemo(() => {
    const start = (currentPage - 1) * HOME_EXTENSIONS_PER_PAGE
    return filteredCatalogApps.slice(start, start + HOME_EXTENSIONS_PER_PAGE)
  }, [currentPage, filteredCatalogApps])

  const filterStatusText = useMemo(() => {
    const total = filteredCatalogApps.length
    if (activeFilter === 'All') {
      return `${total} extensions shown`
    }
    return `${total} extension${total === 1 ? '' : 's'} in ${activeFilter}`
  }, [activeFilter, filteredCatalogApps.length])

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setCurrentPage(1)
    skipPageScrollRef.current = true
  }

  const goToPage = (page) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    if (skipPageScrollRef.current) {
      skipPageScrollRef.current = false
      return
    }
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [currentPage])

  /*
  const closeVideoModal = useCallback(() => {
    setVideoModal({ open: false, videoId: null, title: '', titleHref: null, storeUrl: null })
    const trigger = lastVideoTriggerRef.current
    if (trigger && typeof trigger.focus === 'function') {
      window.requestAnimationFrame(() => trigger.focus())
    }
  }, [])

  const openVideo = useCallback((app) => {
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
      storeUrl: appStoreUrl(app),
    })
  }, [])

  const rememberVideoTrigger = useCallback((element) => {
    if (element) lastVideoTriggerRef.current = element
  }, [])
  */

  return (
    <>
      <section
        id="ext"
        className="CC__home-extensions CC__home-extensions--popular CC__home-featured CC__home-section CC__container"
        aria-label="Most popular extensions"
      >
        <h2 className="CC__home-featured__subsection-title">Most popular</h2>
        <div className="CC__home-extensions__grid" role="list">
          {featuredApps.length === 0 ? (
            <p className="CC__home-featured__empty">No featured extensions yet.</p>
          ) : (
            featuredApps.map((app) => (
              <HomeExtensionShowcaseCard key={app.slug} app={app} />
            ))
          )}
        </div>
      </section>

      <section
        ref={catalogRef}
        className="CC__home-extensions CC__home-extensions--catalog CC__home-featured CC__home-section CC__home-section--follow CC__container"
        aria-label="All Chrome extensions"
      >
        <h2 className="CC__home-featured__subsection-title">All extensions</h2>

        <div className="CC__home-extensions__chips-wrap">
          <nav className="CC__home-extensions__chips" aria-label="Filter extensions by category">
            {HOME_CATALOG_FILTERS.map((filter) => {
              const count = countHomeExtensionFilter(catalogPool, filter)
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={filter === activeFilter}
                  className="CC__chip CC__home-extensions__chip"
                  onClick={() => handleFilterChange(filter)}
                >
                  {filter}
                  <span className="CC__home-extensions__chip-count">{count}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <p className="CC__home-extensions__filter-status" aria-live="polite">
          {filterStatusText}
        </p>

        <div className="CC__home-extensions__grid" role="list">
          {pageApps.length === 0 ? (
            <p className="CC__home-featured__empty">No extensions in this category yet.</p>
          ) : (
            pageApps.map((app) => (
              <HomeExtensionShowcaseCard key={app.slug} app={app} />
            ))
          )}
        </div>

        {showPagination ? (
          <nav className="CC__pagination CC__home-extensions__pagination" aria-label="Extension pages">
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
                <span
                  key={`ellipsis-${index}`}
                  className="CC__pagination__ellipsis"
                  aria-hidden="true"
                >
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

        {filteredCatalogApps.length > 0 ? (
          <p className="CC__pagination__info CC__home-extensions__pagination-info">
            Showing {paginationStart}–{paginationEnd} of {filteredCatalogApps.length} extensions
          </p>
        ) : null}
      </section>

      {/*
      <ExtensionVideoModal
        open={videoModal.open}
        videoId={videoModal.videoId}
        title={videoModal.title}
        titleHref={videoModal.titleHref}
        storeUrl={videoModal.storeUrl}
        onClose={closeVideoModal}
      />
      */}
    </>
  )
}
