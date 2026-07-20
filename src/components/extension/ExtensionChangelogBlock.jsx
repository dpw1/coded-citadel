import { useEffect, useId, useMemo, useRef, useState } from 'react'
import ExtensionAppIcon from '../ExtensionAppIcon'
import {
  enrichChangelogApp,
  filterChangelogCommitsByTimePreset,
  formatChangelogCardDateTime,
  groupChangelogCommitsByDay,
  isRecentChangelogCommit,
  mergeChangelogCommits,
  splitChangelogMessageBullets,
} from '../../utils/extensionChangelogs'
import './ExtensionChangelogBlock.css'
import './PortfolioStatsFilter.css'

const CHANGELOG_SCROLL_BATCH_SIZE = 20
const CHANGELOG_PAGINATION_PAGE_SIZE = 10

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

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function versionLabel(commit) {
  if (!commit.appVersion) return null
  return `v${commit.appVersion}`
}

export default function ExtensionChangelogBlock({
  apps,
  selectedKeys,
  onSelectedKeysChange,
  title = 'CHANGELOGS',
  subtitle = 'All notable changes from all repositories, in one place.',
  emptyMessage = 'No commits yet for the selected extensions.',
  showSidebar = true,
  hideHeader = false,
  timePreset = 'all',
  limit = null,
  usePagination = false,
}) {
  const pageSize = usePagination ? CHANGELOG_PAGINATION_PAGE_SIZE : CHANGELOG_SCROLL_BATCH_SIZE
  const enrichedApps = useMemo(() => (apps ?? []).map(enrichChangelogApp), [apps])
  const allKeys = useMemo(() => new Set(enrichedApps.map((app) => app.key)), [enrichedApps])
  const allSelected = selectedKeys?.size === enrichedApps.length
  const selectionKey = useMemo(
    () => [...(selectedKeys ?? [])].sort().join(','),
    [selectedKeys],
  )

  const timeFilteredCommits = useMemo(() => {
    const merged = mergeChangelogCommits(enrichedApps, selectedKeys ?? new Set())
    return filterChangelogCommitsByTimePreset(merged, timePreset)
  }, [enrichedApps, selectedKeys, timePreset])

  const totalCommitCount = timeFilteredCommits.length
  const [loadedCount, setLoadedCount] = useState(pageSize)
  const [currentPage, setCurrentPage] = useState(1)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const loadMoreRef = useRef(null)
  const blockRef = useRef(null)
  const skipPageScrollRef = useRef(true)
  const projectsTitleId = useId()

  useEffect(() => {
    setLoadedCount(pageSize)
    setCurrentPage(1)
    skipPageScrollRef.current = true
  }, [selectionKey, timePreset, totalCommitCount, pageSize])

  const totalPages = Math.max(1, Math.ceil(totalCommitCount / pageSize))
  const visibleCommits = useMemo(() => {
    if (limit) return timeFilteredCommits.slice(0, limit)
    if (usePagination) {
      const start = (currentPage - 1) * pageSize
      return timeFilteredCommits.slice(start, start + pageSize)
    }
    return timeFilteredCommits.slice(0, loadedCount)
  }, [timeFilteredCommits, limit, usePagination, currentPage, loadedCount, pageSize])

  const groupedDays = groupChangelogCommitsByDay(visibleCommits)
  const hasMore = !limit && !usePagination && loadedCount < totalCommitCount
  const showPagination = usePagination && totalPages > 1
  const paginationStart = usePagination ? (currentPage - 1) * pageSize + 1 : 1
  const paginationEnd = usePagination
    ? Math.min(currentPage * pageSize, totalCommitCount)
    : visibleCommits.length
  const totalAppCount = enrichedApps.length

  useEffect(() => {
    if (!usePagination || skipPageScrollRef.current) {
      skipPageScrollRef.current = false
      return
    }

    const block = blockRef.current
    if (block) {
      block.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage, usePagination])

  useEffect(() => {
    if (!hasMore) return undefined

    const node = loadMoreRef.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setLoadedCount((prev) => Math.min(prev + pageSize, totalCommitCount))
      },
      { rootMargin: '240px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, totalCommitCount, groupedDays.length, pageSize])

  const statusLabel = `Total of ${totalCommitCount} commits`

  const projectsTriggerLabel = useMemo(() => {
    if (allSelected) return 'All apps'
    if (selectedKeys?.size === 1) {
      const app = enrichedApps.find((item) => selectedKeys.has(item.key))
      return app?.label ?? '1 app'
    }
    return `${selectedKeys?.size ?? 0} apps`
  }, [allSelected, selectedKeys, enrichedApps])

  useEffect(() => {
    if (!projectsOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event) {
      if (event.key === 'Escape') setProjectsOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [projectsOpen])

  function selectAll(closeOnSelect = false) {
    onSelectedKeysChange?.(new Set(allKeys))
    if (closeOnSelect) setProjectsOpen(false)
  }

  function selectOnly(key, closeOnSelect = false) {
    onSelectedKeysChange?.(new Set([key]))
    if (closeOnSelect) setProjectsOpen(false)
  }

  function goToPage(page) {
    setCurrentPage(page)
  }

  function renderProjectsPanel({ closeOnSelect = false } = {}) {
    return (
      <div className="ext-changelog__sidebar-section">
        <h3 className="ext-changelog__sidebar-label">Projects</h3>
        <button
          type="button"
          className={`ext-changelog__repo-btn${allSelected ? ' ext-changelog__repo-btn--active' : ''}`}
          onClick={() => selectAll(closeOnSelect)}
        >
          <span className="ext-changelog__repo-btn-main">
            <span className="ext-changelog__repo-btn-icon ext-changelog__repo-btn-icon--grid">
              <GridIcon />
            </span>
            <span className="ext-changelog__repo-btn-name">All apps</span>
          </span>
          <span className="ext-changelog__repo-count">{totalAppCount}</span>
        </button>

        <ul className="ext-changelog__repo-list">
          {enrichedApps.map((app) => {
            const isActive = !allSelected && selectedKeys?.size === 1 && selectedKeys.has(app.key)
            return (
              <li key={app.key}>
                <button
                  type="button"
                  className={`ext-changelog__repo-btn${isActive ? ' ext-changelog__repo-btn--active' : ''}`}
                  onClick={() => selectOnly(app.key, closeOnSelect)}
                >
                  <span className="ext-changelog__repo-btn-main">
                    <span className="ext-changelog__repo-btn-icon">
                      <ExtensionAppIcon src={app.iconUrl} size={18} alt={`${app.label} icon`} />
                    </span>
                    <span className="ext-changelog__repo-btn-name" title={app.label}>
                      {app.label}
                    </span>
                  </span>
                  <span className="ext-changelog__repo-count">{app.commitCount ?? 0}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <p className="ext-changelog__sidebar-status">
          <span className="ext-changelog__sidebar-status-dot" aria-hidden="true" />
          {statusLabel}
        </p>
      </div>
    )
  }

  if (!enrichedApps.length) {
    return (
      <section className="ext-changelog">
        <p className="ext-changelog__empty">Changelog data is not available yet.</p>
      </section>
    )
  }

  return (
    <section ref={blockRef} className="ext-changelog" aria-label={title}>
      <div className={`ext-changelog__layout${showSidebar ? '' : ' ext-changelog__layout--no-sidebar'}`}>
        {showSidebar ? (
          <>
            <div className="ext-changelog__projects-mobile">
              <button
                type="button"
                className={`stats-filter__trigger ext-changelog__projects-trigger${
                  !allSelected ? ' stats-filter__trigger--active' : ''
                }`}
                aria-expanded={projectsOpen}
                aria-haspopup="dialog"
                onClick={() => setProjectsOpen(true)}
              >
                <span className="stats-filter__trigger-icon">
                  <GridIcon />
                </span>
                <span className="ext-changelog__projects-trigger-label">Projects: {projectsTriggerLabel}</span>
                <ChevronDownIcon />
                {!allSelected ? <span className="stats-filter__badge" aria-hidden="true" /> : null}
              </button>

              {projectsOpen ? (
                <div className="stats-filter__overlay" role="presentation" onClick={() => setProjectsOpen(false)}>
                  <div
                    className="stats-filter__modal ext-changelog__projects-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={projectsTitleId}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <header className="stats-filter__header">
                      <h2 id={projectsTitleId} className="stats-filter__title">
                        Projects
                      </h2>
                      <button
                        type="button"
                        className="stats-filter__close"
                        aria-label="Close projects"
                        onClick={() => setProjectsOpen(false)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </header>

                    <div className="stats-filter__body ext-changelog__projects-modal-body">
                      {renderProjectsPanel({ closeOnSelect: true })}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="ext-changelog__sidebar" aria-label="Repository filters">
              {renderProjectsPanel()}
            </aside>
          </>
        ) : null}

        <div className={`ext-changelog__main${hideHeader ? ' ext-changelog__main--no-header' : ''}`}>
          {!hideHeader ? (
            <header className="ext-changelog__header">
              <div className="ext-changelog__header-text">
                <h2 className="ext-changelog__title">{title}</h2>
                <p className="ext-changelog__subtitle">{subtitle}</p>
              </div>
            </header>
          ) : null}

          {!visibleCommits.length ? (
            <p className="ext-changelog__empty">{emptyMessage}</p>
          ) : (
            <div className="ext-changelog__timeline">
              {groupedDays.map((group) => (
                <section key={group.dayKey} className="ext-changelog__day-group">
                  <div className="ext-changelog__day-marker">
                    <span className="ext-changelog__day-dot" aria-hidden="true" />
                    <h3 className="ext-changelog__day-label">{group.label}</h3>
                  </div>

                  <div className="ext-changelog__day-cards">
                    {group.commits.map((commit) => {
                      const version = versionLabel(commit)
                      const bullets = splitChangelogMessageBullets(commit.message)
                      const cardUrl = commit.appStoreUrl
                      const CardTag = cardUrl ? 'a' : 'article'
                      const cardProps = cardUrl
                        ? {
                            href: cardUrl,
                            target: '_blank',
                            rel: 'noopener noreferrer',
                          }
                        : {}

                      return (
                        <CardTag
                          key={`${commit.appKey}-${commit.sha}`}
                          className="ext-changelog__card"
                          {...cardProps}
                        >
                          <div className="ext-changelog__card-icon-wrap">
                            <ExtensionAppIcon
                              src={commit.appIconUrl}
                              size={40}
                              alt={`${commit.appLabel} icon`}
                            />
                          </div>

                          <div className="ext-changelog__card-body">
                            <div className="ext-changelog__card-head">
                              <h4 className="ext-changelog__card-title">{commit.appLabel}</h4>
                              {isRecentChangelogCommit(commit.date) ? (
                                <span className="ext-changelog__card-recent">
                                  <span className="ext-changelog__card-recent-dot" aria-hidden="true" />
                                  New
                                </span>
                              ) : null}
                              {version ? (
                                <span className="ext-changelog__card-version">{version}</span>
                              ) : null}
                            </div>

                            <div className="ext-changelog__card-when">
                              <CalendarIcon />
                              <time dateTime={commit.date}>{formatChangelogCardDateTime(commit.date)}</time>
                            </div>

                            <ul className="ext-changelog__card-changes">
                              {(bullets.length ? bullets : [commit.message]).map((line, index) => (
                                <li key={`${commit.sha}-${index}`}>{line}</li>
                              ))}
                            </ul>
                          </div>

                          <span className="ext-changelog__card-chevron" aria-hidden="true">
                            <ChevronRightIcon />
                          </span>
                        </CardTag>
                      )
                    })}
                  </div>
                </section>
              ))}

              {hasMore ? (
                <div ref={loadMoreRef} className="ext-changelog__load-more" aria-hidden="true">
                  <span className="ext-changelog__load-more-text">Loading more…</span>
                </div>
              ) : null}

              {showPagination ? (
                <nav className="CC__pagination" aria-label="Changelog pages">
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

              {usePagination && totalCommitCount > 0 ? (
                <p className="CC__pagination__info">
                  Showing {paginationStart}–{paginationEnd} of {totalCommitCount} commits
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
