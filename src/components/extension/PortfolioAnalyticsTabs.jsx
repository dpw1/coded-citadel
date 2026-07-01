import ChromeIcon from '../ChromeIcon'
import GitHubIcon from '../GitHubIcon'
import GoogleAnalyticsIcon from '../GoogleAnalyticsIcon'
import '../extension/PortfolioStatsFilter.css'

function TabIcon({ tabId }) {
  if (tabId === 'extensions') {
    return <ChromeIcon size={16} className="portfolio-analytics-tabs__icon" />
  }
  if (tabId === 'website') {
    return (
      <span className="portfolio-analytics-tabs__icon portfolio-analytics-tabs__icon--svg">
        <GoogleAnalyticsIcon size={16} />
      </span>
    )
  }
  if (tabId === 'changelog') {
    return (
      <span className="portfolio-analytics-tabs__icon portfolio-analytics-tabs__icon--svg">
        <GitHubIcon size={16} />
      </span>
    )
  }
  return null
}

export default function PortfolioAnalyticsTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div
      className="stats-filter__quick-dates portfolio-analytics-tabs"
      role="tablist"
      aria-label="Portfolio analytics sources"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`portfolio-analytics-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`portfolio-analytics-panel-${tab.id}`}
            className={`stats-filter__quick-btn portfolio-analytics-tabs__btn${
              isActive ? ' stats-filter__quick-btn--active' : ''
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <TabIcon tabId={tab.id} />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
