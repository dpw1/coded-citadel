import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PluginCard from './PluginCard'
import ExtensionVideoModal from './ExtensionVideoModal'
import { getPluginDownloadCounts } from '../lib/pluginEvents'
import { getAllPlugins, isPluginLive, pluginCategory, pluginPath, pluginsIndexPath } from '../utils/plugins'

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

function getCategories(plugins) {
  const categories = [...new Set(plugins.map((plugin) => pluginCategory(plugin)))].sort()
  return ['All', ...categories]
}

export default function PluginsGridSection({
  sectionId = 'plugins',
  showViewAllLink = false,
  excludeSlug = null,
  eyebrow = 'DaVinci Resolve Plugins',
  title,
  titleAs = 'h2',
  enableTabs = false,
  enablePagination = false,
  perPage = 6,
  maxItems = null,
  showRandomLink = false,
}) {
  const [activeTab, setActiveTab] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [videoModal, setVideoModal] = useState({
    open: false,
    videoId: null,
    title: '',
    titleHref: null,
  })
  const [downloadCounts, setDownloadCounts] = useState({})
  const sectionRef = useRef(null)
  const skipPageScrollRef = useRef(true)

  const plugins = useMemo(
    () => getAllPlugins().filter((plugin) => plugin.slug !== excludeSlug),
    [excludeSlug],
  )

  const randomPluginPath = useMemo(() => {
    if (!plugins.length) return pluginsIndexPath()
    const pick = plugins[Math.floor(Math.random() * plugins.length)]
    return pluginPath(pick.slug)
  }, [plugins])

  const sectionTitle = title ?? (
    <>
      All <span className="CC__section-title-accent">Plugins</span>
    </>
  )
  const TitleTag = titleAs

  const categories = useMemo(() => getCategories(plugins), [plugins])

  const filteredPlugins = useMemo(() => {
    if (!enableTabs || activeTab === 'All') return plugins
    return plugins.filter((plugin) => pluginCategory(plugin) === activeTab)
  }, [activeTab, enableTabs, plugins])

  const visiblePlugins = useMemo(() => {
    if (maxItems != null) return filteredPlugins.slice(0, maxItems)
    if (!enablePagination) return filteredPlugins
    const start = (currentPage - 1) * perPage
    return filteredPlugins.slice(start, start + perPage)
  }, [currentPage, enablePagination, filteredPlugins, maxItems, perPage])

  const livePluginSlugs = useMemo(
    () => visiblePlugins.filter((plugin) => isPluginLive(plugin)).map((plugin) => plugin.slug),
    [visiblePlugins],
  )

  useEffect(() => {
    if (!livePluginSlugs.length) {
      setDownloadCounts({})
      return undefined
    }

    let cancelled = false
    getPluginDownloadCounts(livePluginSlugs).then((counts) => {
      if (!cancelled) setDownloadCounts(counts)
    })

    return () => {
      cancelled = true
    }
  }, [livePluginSlugs.join('|')])

  const totalPages = enablePagination ? Math.ceil(filteredPlugins.length / perPage) : 1
  const showPagination = enablePagination && totalPages > 1
  const paginationStart = enablePagination ? (currentPage - 1) * perPage + 1 : 1
  const paginationEnd = enablePagination
    ? Math.min(currentPage * perPage, filteredPlugins.length)
    : visiblePlugins.length

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

  const viewAllPluginsLink = showViewAllLink ? (
    <Link to={pluginsIndexPath()} className="CC__view-all-link">
      View all plugins →
    </Link>
  ) : null

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className="CC__extensions CC__container"
      aria-label="Plugins"
    >
      <div className="CC__section-header-row">
        <div>
          <p className="CC__section-eyebrow">{eyebrow}</p>
          <TitleTag className="CC__section-title">{sectionTitle}</TitleTag>
        </div>
        {viewAllPluginsLink ? (
          <span className="CC__view-all-link-wrap CC__view-all-link-wrap--header">{viewAllPluginsLink}</span>
        ) : showRandomLink && plugins.length > 0 ? (
          <Link to={randomPluginPath} className="CC__view-all-link">
            View random one →
          </Link>
        ) : null}
      </div>

      {enableTabs && categories.length > 1 ? (
        <nav className="CC__tabs" role="tablist" aria-label="Filter by category">
          {categories.map((category) => {
            const count =
              category === 'All'
                ? plugins.length
                : plugins.filter((plugin) => pluginCategory(plugin) === category).length

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
        {visiblePlugins.length === 0 ? (
          <div className="CC__extensions-empty">
            <div className="CC__extensions-empty__icon" aria-hidden="true">
              🔍
            </div>
            <p>No plugins in this category yet.</p>
          </div>
        ) : (
          visiblePlugins.map((plugin, index) => (
            <PluginCard
              key={plugin.slug}
              plugin={plugin}
              index={index}
              downloadCount={downloadCounts[plugin.slug]}
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

      {enablePagination && filteredPlugins.length > 0 ? (
        <p className="CC__pagination__info">
          Showing {paginationStart}–{paginationEnd} of {filteredPlugins.length} plugins
        </p>
      ) : null}

      {viewAllPluginsLink ? (
        <div className="CC__view-all-link-wrap CC__view-all-link-wrap--footer">{viewAllPluginsLink}</div>
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
