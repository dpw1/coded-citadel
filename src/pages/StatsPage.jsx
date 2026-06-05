import { useEffect, useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import ExtensionAnalyticsBlock from '../components/extension/ExtensionAnalyticsBlock'
import ExtensionAppFilter from '../components/extension/ExtensionAppFilter'
import ExtensionLiveStatsBar from '../components/extension/ExtensionLiveStatsBar'
import {
  analyticsSeriesDelta,
  formatNumber,
  getWeeklyUsersSeries,
} from '../utils/apps'
import {
  getPortfolioAnalytics,
  getPortfolioAnalyticsForKeys,
  getPortfolioAnalyticsPayload,
  formatPortfolioAnalyticsDateRange,
  getPortfolioApps,
  portfolioAnalyticsTitle,
} from '../utils/portfolioAnalytics'
import '../App.css'
import './ExtensionLandingPage.css'
import './StatsPage.css'

function portfolioActiveUsers(analytics) {
  const series = getWeeklyUsersSeries(analytics)
  if (series?.length) {
    const last = series[series.length - 1]
    return last?.total ?? last?.count ?? 0
  }
  return analytics?.enabledVsDisabled?.enabled ?? 0
}

export default function StatsPage() {
  const payload = getPortfolioAnalyticsPayload()
  const portfolioApps = useMemo(() => getPortfolioApps(), [])
  const analyticsDateRangeLabel = formatPortfolioAnalyticsDateRange()
  const uid = useId().replace(/:/g, '')

  const [selectedKeys, setSelectedKeys] = useState(
    () => new Set(portfolioApps.map((app) => app.key)),
  )

  const analytics = useMemo(() => {
    const filtered = getPortfolioAnalyticsForKeys(selectedKeys)
    if (filtered) return filtered
    return getPortfolioAnalytics()
  }, [selectedKeys])

  const chartIds = useMemo(
    () => ({
      sparkline: `stats-spark-${uid}`,
      weekly: `stats-weekly-${uid}`,
      weeklyUsers: `stats-wusers-${uid}`,
      pageViews: `stats-pviews-${uid}`,
      impressions: `stats-impr-${uid}`,
      installRegion: `stats-install-${uid}`,
      weeklyRegion: `stats-wregion-${uid}`,
    }),
    [uid],
  )

  const activeUsers = analytics ? portfolioActiveUsers(analytics) : 0
  const activeUsersDelta = analytics ? analyticsSeriesDelta(getWeeklyUsersSeries(analytics)) : null
  const sectionTitle = portfolioAnalyticsTitle(selectedKeys)

  const appFilter = portfolioApps.length ? (
    <ExtensionAppFilter
      apps={portfolioApps}
      selectedKeys={selectedKeys}
      onChange={setSelectedKeys}
    />
  ) : null

  useEffect(() => {
    document.title = 'Portfolio Stats — Coded Citadel'
    return () => {
      document.title = 'Coded Citadel'
    }
  }, [])

  return (
    <>
      <SiteHeader />
      <main className="ext-page CC__stats-page">
        <div className="CC__container">
          <header className="CC__stats-page__header">
            <p className="CC__section-eyebrow">Building in public</p>
            <h1 className="CC__section-title">Portfolio Stats</h1>
            <p className="CC__stats-page__intro">
            To go one step further' , I'm manually scraping all my "Chrome Web Store" private data and making it publicly accessible here. You can view all installations, users, views, and all private data of my apps. 
            </p>
            <Link to="/apps" className="CC__btn CC__btn--outline CC__stats-page__apps-link">
              View all apps
            </Link>
          </header>

          {!analytics ? (
            <p className="CC__stats-page__empty">Analytics data is not available yet. Check back soon.</p>
          ) : (
            <>
              <ExtensionLiveStatsBar
                analytics={analytics}
                activeUsers={activeUsers}
                activeUsersDelta={activeUsersDelta}
              />
              <ExtensionAnalyticsBlock
                analytics={analytics}
                chartIds={chartIds}
                updatedLabel={analyticsDateRangeLabel}
                eyebrow="Portfolio Analytics"
                title={sectionTitle}
                appFilter={appFilter}
              />
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
