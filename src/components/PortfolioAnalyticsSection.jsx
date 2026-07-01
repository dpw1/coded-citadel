import { useEffect, useId, useMemo, useState } from 'react'
import ExtensionAnalyticsBlock from './extension/ExtensionAnalyticsBlock'
import ExtensionChangelogBlock from './extension/ExtensionChangelogBlock'
import PortfolioAnalyticsTabs from './extension/PortfolioAnalyticsTabs'
import PortfolioStatsFilter from './extension/PortfolioStatsFilter'
import ChangelogTimeFilter from './extension/ChangelogTimeFilter'
import WebsiteAnalyticsBlock from './extension/WebsiteAnalyticsBlock'
import {
  filterAnalyticsByDateRange,
  formatAnalyticsDateRangeLabel,
  getPortfolioAnalytics,
  getPortfolioAnalyticsDateRange,
  getPortfolioAnalyticsForKeys,
  getPortfolioApps,
  portfolioAnalyticsTitle,
} from '../utils/portfolioAnalytics'
import {
  fetchWebsiteAnalytics,
  getStoredWebsiteAnalytics,
  needsWebsiteAnalyticsRefresh,
  PORTFOLIO_ANALYTICS_TABS,
} from '../utils/liveStatsAnalytics'
import {
  fetchExtensionChangelogs,
  getStoredExtensionChangelogs,
  mergeChangelogSelectedKeys,
  needsExtensionChangelogsRefresh,
} from '../utils/extensionChangelogs'
import { getSiteStatsHeadlines } from '../utils/siteStats'
import { formatAnalyticsTimestamp } from '../utils/apps'

const TAB_TITLES = {
  extensions: 'Extensions',
  website: 'Website',
  changelog: 'Changelog',
}

export default function PortfolioAnalyticsSection({ idPrefix = 'portfolio' }) {
  const portfolioApps = useMemo(() => getPortfolioApps(), [])
  const portfolioDateBounds = useMemo(() => getPortfolioAnalyticsDateRange(), [])
  const uid = useId().replace(/:/g, '')

  const [activeTab, setActiveTab] = useState('extensions')
  const [selectedKeys, setSelectedKeys] = useState(
    () => new Set(portfolioApps.map((app) => app.key)),
  )
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [websiteAnalytics, setWebsiteAnalytics] = useState(() => getStoredWebsiteAnalytics())
  const [websiteLoading, setWebsiteLoading] = useState(false)
  const [changelogData, setChangelogData] = useState(() => getStoredExtensionChangelogs())
  const [changelogSelectedKeys, setChangelogSelectedKeys] = useState(() => {
    const apps = getStoredExtensionChangelogs()?.apps ?? []
    return mergeChangelogSelectedKeys(new Set(), apps)
  })
  const [changelogTimePreset, setChangelogTimePreset] = useState('all')

  const baseAnalytics = useMemo(() => {
    const filtered = getPortfolioAnalyticsForKeys(selectedKeys)
    if (filtered) return filtered
    return getPortfolioAnalytics()
  }, [selectedKeys])

  const analytics = useMemo(() => {
    if (!baseAnalytics) return null
    return filterAnalyticsByDateRange(baseAnalytics, dateFrom || null, dateTo || null)
  }, [baseAnalytics, dateFrom, dateTo])

  const chartIds = useMemo(
    () => ({
      sparkline: `${idPrefix}-spark-${uid}`,
      weekly: `${idPrefix}-weekly-${uid}`,
      weeklyUsers: `${idPrefix}-wusers-${uid}`,
      pageViews: `${idPrefix}-pviews-${uid}`,
      impressions: `${idPrefix}-impr-${uid}`,
      installRegion: `${idPrefix}-install-${uid}`,
      enabledVsDisabled: `${idPrefix}-evd-${uid}`,
    }),
    [idPrefix, uid],
  )

  const extensionsTitle = portfolioAnalyticsTitle(selectedKeys)
  const analyticsDateRangeLabel = formatAnalyticsDateRangeLabel(dateFrom || null, dateTo || null)
  const siteStatsHeadlines = useMemo(() => getSiteStatsHeadlines(), [])
  const allAppsSelected = selectedKeys.size === portfolioApps.length

  const websiteChartIds = useMemo(
    () => ({
      pageViews: `${idPrefix}-web-pviews-${uid}`,
      activeUsers: `${idPrefix}-web-users-${uid}`,
      blogViews: `${idPrefix}-web-blog-${uid}`,
      sessions: `${idPrefix}-web-sessions-${uid}`,
    }),
    [idPrefix, uid],
  )

  useEffect(() => {
    if (activeTab !== 'website' || !import.meta.env.DEV) return undefined

    setWebsiteAnalytics(getStoredWebsiteAnalytics())

    if (!needsWebsiteAnalyticsRefresh()) return undefined

    let cancelled = false
    setWebsiteLoading(true)

    fetchWebsiteAnalytics()
      .then((data) => {
        if (!cancelled) setWebsiteAnalytics(data)
      })
      .catch(() => {
        if (!cancelled) {
          setWebsiteAnalytics({
            available: false,
            message: 'Failed to load website analytics.',
          })
        }
      })
      .finally(() => {
        if (!cancelled) setWebsiteLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'changelog' || !import.meta.env.DEV) return undefined

    setChangelogData(getStoredExtensionChangelogs())
    setChangelogSelectedKeys((prev) =>
      mergeChangelogSelectedKeys(prev, getStoredExtensionChangelogs()?.apps ?? []),
    )

    if (!needsExtensionChangelogsRefresh()) return undefined

    let cancelled = false

    fetchExtensionChangelogs()
      .then((data) => {
        if (!cancelled) {
          setChangelogData(data)
          setChangelogSelectedKeys((prev) => mergeChangelogSelectedKeys(prev, data?.apps ?? []))
        }
      })
      .catch(() => {
        // keep bundled / cached snapshot on failure
      })

    return () => {
      cancelled = true
    }
  }, [activeTab])

  const sectionTitle =
    activeTab === 'extensions' ? extensionsTitle : TAB_TITLES[activeTab] || 'Portfolio Analytics'

  const sectionUpdatedLabel =
    activeTab === 'extensions'
      ? analyticsDateRangeLabel
      : activeTab === 'website' && websiteAnalytics?.updatedAt
        ? `From Google Analytics. Last updated: ${formatAnalyticsTimestamp(websiteAnalytics.updatedAt)}`
        : activeTab === 'changelog' && changelogData?.updatedAt
          ? `Last updated: ${formatAnalyticsTimestamp(changelogData.updatedAt)}`
          : null

  const showExtensions = activeTab === 'extensions' && analytics
  const showEmptyExtensions = activeTab === 'extensions' && !analytics

  return (
    <section className="ext-analytics CC__portfolio-analytics">
      <div className="ext-analytics__header-layout">
        <div className="ext-analytics__header">
          <div className="ext-analytics__header-main">
            <>
              <div className="ext-analytics__eyebrow">Portfolio Analytics</div>
              <h2 className="ext-analytics__title">{sectionTitle}</h2>
              {sectionUpdatedLabel ? (
                <small className="ext-analytics__updated">{sectionUpdatedLabel}</small>
              ) : null}
            </>
            <PortfolioAnalyticsTabs
              tabs={PORTFOLIO_ANALYTICS_TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
        {activeTab === 'extensions' ? (
          <div className="ext-analytics__header-actions">
            <PortfolioStatsFilter
              apps={portfolioApps}
              selectedKeys={selectedKeys}
              onSelectedKeysChange={setSelectedKeys}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              minDate={portfolioDateBounds?.from ?? ''}
              maxDate={portfolioDateBounds?.to ?? ''}
            />
          </div>
        ) : null}
        {activeTab === 'changelog' ? (
          <div className="ext-analytics__header-actions">
            <ChangelogTimeFilter value={changelogTimePreset} onChange={setChangelogTimePreset} />
          </div>
        ) : null}
      </div>

      <div
        role="tabpanel"
        id={`portfolio-analytics-panel-${activeTab}`}
        aria-labelledby={`portfolio-analytics-tab-${activeTab}`}
      >
        {showEmptyExtensions ? (
          <p className="CC__stats-page__empty">Analytics data is not available yet. Check back soon.</p>
        ) : null}

        {showExtensions ? (
          <ExtensionAnalyticsBlock
            analytics={analytics}
            chartIds={chartIds}
            updatedLabel={analyticsDateRangeLabel}
            siteStatsHeadlines={allAppsSelected ? siteStatsHeadlines : null}
            hideHeader
          />
        ) : null}

        {activeTab === 'website' ? (
          <WebsiteAnalyticsBlock
            data={websiteAnalytics}
            loading={websiteLoading}
            chartIds={websiteChartIds}
          />
        ) : null}

        {activeTab === 'changelog' ? (
            <ExtensionChangelogBlock
              apps={changelogData?.apps ?? []}
              selectedKeys={changelogSelectedKeys}
              onSelectedKeysChange={setChangelogSelectedKeys}
              timePreset={changelogTimePreset}
              showSidebar
              hideHeader
              usePagination={idPrefix === 'home'}
            />
        ) : null}
      </div>
    </section>
  )
}
