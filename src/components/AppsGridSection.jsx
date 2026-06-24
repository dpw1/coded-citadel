import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ExtensionCard from './ExtensionCard'
import ExtensionVideoModal from './ExtensionVideoModal'
import { getAllApps } from '../utils/apps'

const CHROME_STORE_SEARCH_URL =
  'https://chromewebstore.google.com/search/Coded%20Citadel%20extension'

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
  const categories = [...new Set(apps.map((app) => app.category ?? 'Productivity'))].sort()
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
  enableTabs = false,
  enablePagination = false,
  perPage = 6,
  maxItems = null,
  randomize = false,
  showChromeStoreLink = false,
  chromeStoreLink = CHROME_STORE_SEARCH_URL,
}) {
  const [activeTab, setActiveTab] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [videoModal, setVideoModal] = useState({ open: false, videoId: null, title: '' })

  const apps = useMemo(
    () => getAllApps().filter((app) => app.slug !== excludeSlug),
    [excludeSlug],
  )

  const sectionTitle = title ?? `Built in public, documented step-by-step`

  const categories = useMemo(() => getCategories(apps), [apps])

  const filteredApps = useMemo(() => {
    if (!enableTabs || activeTab === 'All') return apps
    return apps.filter((app) => (app.category ?? 'Productivity') === activeTab)
  }, [activeTab, apps, enableTabs])

  const visibleApps = useMemo(() => {
    const pool = randomize ? shuffleApps(filteredApps) : filteredApps
    if (maxItems != null) return pool.slice(0, maxItems)
    if (!enablePagination) return pool
    const start = (currentPage - 1) * perPage
    return pool.slice(start, start + perPage)
  }, [currentPage, enablePagination, filteredApps, maxItems, perPage, randomize])

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

  const viewAllAppsLink = showViewAllLink ? (
    <Link to="/apps" className="CC__view-all-link">
      View all apps →
    </Link>
  ) : null

  return (
    <section id={sectionId} className="CC__extensions CC__container" aria-label="Extensions">
      <div className="CC__section-header-row">
        <div>
          <p className="CC__section-eyebrow">{eyebrow}</p>
          <h2 className="CC__section-title">{sectionTitle}</h2>
        </div>
        {viewAllAppsLink ? (
          <span className="CC__view-all-link-wrap CC__view-all-link-wrap--header">{viewAllAppsLink}</span>
        ) : showChromeStoreLink ? (
          <a
            href={chromeStoreLink}
            target="_blank"
            rel="noopener noreferrer"
            className="CC__view-all-link"
          >
            View on Chrome Web Store →
          </a>
        ) : null}
      </div>

      {enableTabs && categories.length > 1 ? (
        <nav className="CC__tabs" role="tablist" aria-label="Filter by category">
          {categories.map((category) => {
            const count =
              category === 'All'
                ? apps.length
                : apps.filter((app) => (app.category ?? 'Productivity') === category).length

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
              onPlayVideo={({ videoId, title: videoTitle }) =>
                setVideoModal({ open: true, videoId, title: videoTitle })
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
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
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
                onClick={() => setCurrentPage(page)}
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
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
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
        onClose={() => setVideoModal({ open: false, videoId: null, title: '' })}
      />
    </section>
  )
}
