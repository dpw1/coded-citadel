import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import PortfolioAnalyticsSection from '../components/PortfolioAnalyticsSection'
import '../App.css'
import './ExtensionLandingPage.css'
import './StatsPage.css'

export default function StatsPage() {
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

          <PortfolioAnalyticsSection idPrefix="stats" />

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
