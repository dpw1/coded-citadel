import { useEffect, useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import ExtensionAnalyticsBlock from '../components/extension/ExtensionAnalyticsBlock'
import PortfolioStatsFilter from '../components/extension/PortfolioStatsFilter'
import {
  filterAnalyticsByDateRange,
  formatAnalyticsDateRangeLabel,
  getPortfolioAnalytics,
  getPortfolioAnalyticsDateRange,
  getPortfolioAnalyticsForKeys,
  getPortfolioApps,
  portfolioAnalyticsTitle,
} from '../utils/portfolioAnalytics'
import { getSiteStatsHeadlines } from '../utils/siteStats'
import '../App.css'
import './ExtensionLandingPage.css'
import './StatsPage.css'

export default function StatsPage() {
  const portfolioApps = useMemo(() => getPortfolioApps(), [])
  const portfolioDateBounds = useMemo(() => getPortfolioAnalyticsDateRange(), [])
  const uid = useId().replace(/:/g, '')

  const [selectedKeys, setSelectedKeys] = useState(
    () => new Set(portfolioApps.map((app) => app.key)),
  )
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

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
      weeklyRegion: `stats-wregion-${uid}`,
      enabledVsDisabled: `stats-evd-${uid}`,
    }),
    [uid],
  )

  const sectionTitle = portfolioAnalyticsTitle(selectedKeys)
  const analyticsDateRangeLabel = formatAnalyticsDateRangeLabel(dateFrom || null, dateTo || null)
  const siteStatsHeadlines = useMemo(() => getSiteStatsHeadlines(), [])
  const allAppsSelected = selectedKeys.size === portfolioApps.length

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
              I&apos;m manually scraping all my Chrome Web Store private data
              and making it publicly accessible here. You can see installs, users, views, and
              other metrics from my apps.
            </p>
          </header>

          {!analytics ? (
            <p className="CC__stats-page__empty">Analytics data is not available yet. Check back soon.</p>
          ) : (
            <ExtensionAnalyticsBlock
              analytics={analytics}
              chartIds={chartIds}
              updatedLabel={analyticsDateRangeLabel}
              eyebrow="Portfolio Analytics"
              title={sectionTitle}
              siteStatsHeadlines={allAppsSelected ? siteStatsHeadlines : null}
              appFilter={
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
              }
            />
          )}

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
