import ChromeIcon from '../ChromeIcon'
import '../extension/PortfolioStatsFilter.css'

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function TabIcon({ tabId }) {
  if (tabId === 'extensions') {
    return <ChromeIcon size={16} className="portfolio-analytics-tabs__icon" />
  }
  if (tabId === 'website') {
    return (
      <span className="portfolio-analytics-tabs__icon portfolio-analytics-tabs__icon--svg">
        <GlobeIcon />
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
