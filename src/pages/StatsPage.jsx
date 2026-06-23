import { useEffect, useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import ExtensionAnalyticsBlock from '../components/extension/ExtensionAnalyticsBlock'
import PortfolioAnalyticsTabs from '../components/extension/PortfolioAnalyticsTabs'
import PortfolioStatsFilter from '../components/extension/PortfolioStatsFilter'
import WebsiteAnalyticsBlock from '../components/extension/WebsiteAnalyticsBlock'
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
import { getSiteStatsHeadlines } from '../utils/siteStats'
import { formatAnalyticsTimestamp } from '../utils/apps'
import '../App.css'
import './ExtensionLandingPage.css'
import './StatsPage.css'

const TAB_TITLES = {
  extensions: 'Extensions',
  website: 'Website',
}

export default function StatsPage() {
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
      sparkline: `stats-spark-${uid}`,
      weekly: `stats-weekly-${uid}`,
      weeklyUsers: `stats-wusers-${uid}`,
      pageViews: `stats-pviews-${uid}`,
      impressions: `stats-impr-${uid}`,
      installRegion: `stats-install-${uid}`,
      enabledVsDisabled: `stats-evd-${uid}`,
    }),
    [uid],
  )

  const extensionsTitle = portfolioAnalyticsTitle(selectedKeys)
  const analyticsDateRangeLabel = formatAnalyticsDateRangeLabel(dateFrom || null, dateTo || null)
  const siteStatsHeadlines = useMemo(() => getSiteStatsHeadlines(), [])
  const allAppsSelected = selectedKeys.size === portfolioApps.length

  const websiteChartIds = useMemo(
    () => ({
      pageViews: `stats-web-pviews-${uid}`,
      activeUsers: `stats-web-users-${uid}`,
      blogViews: `stats-web-blog-${uid}`,
      sessions: `stats-web-sessions-${uid}`,
    }),
    [uid],
  )

  useEffect(() => {
    document.title = 'Portfolio Stats — Coded Citadel'
    return () => {
      document.title = 'Coded Citadel'
    }
  }, [])

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

  const sectionTitle =
    activeTab === 'extensions' ? extensionsTitle : TAB_TITLES[activeTab] || 'Portfolio Analytics'

  const sectionUpdatedLabel =
    activeTab === 'extensions'
      ? analyticsDateRangeLabel
      : activeTab === 'website' && websiteAnalytics?.updatedAt
        ? `Last updated: ${formatAnalyticsTimestamp(websiteAnalytics.updatedAt)}`
        : null

  const showExtensions = activeTab === 'extensions' && analytics
  const showEmptyExtensions = activeTab === 'extensions' && !analytics

  return (
    <>
      <SiteHeader />
      <main className="ext-page CC__stats-page">
        <div className="CC__container">
          <header className="CC__stats-page__header">
            <p className="CC__section-eyebrow">Building in public</p>
            <h1 className="CC__section-title">Portfolio Stats</h1>
            <p className="CC__stats-page__intro">
              I&apos;m manually scraping all my Chrome Web Store private data
              and making it publicly accessible here. You can see installs, users, views, and
              other metrics from my apps.
            </p>
          </header>

          <section className="ext-analytics CC__portfolio-analytics">
            <div className="ext-analytics__header-layout">
              <div className="ext-analytics__header">
                <div className="ext-analytics__header-main">
                  <div className="ext-analytics__eyebrow">Portfolio Analytics</div>
                  <h2 className="ext-analytics__title">{sectionTitle}</h2>
                  {sectionUpdatedLabel ? (
                    <small className="ext-analytics__updated">{sectionUpdatedLabel}</small>
                  ) : null}
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
            </div>
          </section>

          <footer className="CC__stats-page__footer">
            <Link to="/apps" className="CC__btn CC__btn--outline CC__stats-page__apps-link">
              View all apps
            </Link>
          </footer>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
