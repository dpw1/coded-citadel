import CyberCorners from '../CyberCorners'
import { formatNumber } from '../../utils/apps'

export function StatsBarPercentDelta({ delta, suffix }) {
  if (!delta) return null
  const negative = delta.pct < 0
  return (
    <span
      className={`CC__stats-bar__delta${negative ? ' CC__stats-bar__delta--negative' : ''}`}
    >
      {negative ? '↓' : '↑'} {Math.abs(delta.pct)}% {suffix}
    </span>
  )
}

export default function ExtensionLiveStatsBar({
  analytics,
  activeUsers,
  activeUsersDelta,
}) {
  if (!analytics) return null

  return (
    <section className="CC__stats-section">
      <div className="CC__cyber-accent CC__stats-bar">
        <div className="CC__stats-bar__corners" aria-hidden="true">
          <CyberCorners />
        </div>
        <div className="CC__stats-bar__live">
          <span className="CC__stats-bar__live-label">Stats</span>
          <span className="CC__stats-bar__live-sub">
            <span className="CC__stats-bar__live-dot" />
            Live
          </span>
        </div>
        <ul className="CC__stats-bar__items">
          <li className="CC__stats-bar__item">
            <div className="CC__stats-bar__info">
              <span className="CC__stats-bar__label">Total Installs</span>
              <span className="CC__stats-bar__value">{formatNumber(analytics.totalInstalls)}</span>
              <span className="CC__stats-bar__delta">↑ Live</span>
            </div>
          </li>
          <li className="CC__stats-bar__item">
            <div className="CC__stats-bar__info">
              <span className="CC__stats-bar__label">Active Users</span>
              <span className="CC__stats-bar__value">{formatNumber(activeUsers)}</span>
              {activeUsersDelta ? (
                <StatsBarPercentDelta delta={activeUsersDelta} suffix="vs previous day" />
              ) : (
                <span className="CC__stats-bar__delta">↑ Live</span>
              )}
            </div>
          </li>
          <li className="CC__stats-bar__item">
            <div className="CC__stats-bar__info">
              <span className="CC__stats-bar__label">Page Views</span>
              <span className="CC__stats-bar__value CC__stats-bar__value--white">
                {formatNumber(analytics.pageViews)}
              </span>
              <span className="CC__stats-bar__delta">↑ Live</span>
            </div>
          </li>
          <li className="CC__stats-bar__item">
            <div className="CC__stats-bar__info">
              <span className="CC__stats-bar__label">Impressions</span>
              <span className="CC__stats-bar__value CC__stats-bar__value--white">
                {formatNumber(analytics.impressions)}
              </span>
              <span className="CC__stats-bar__delta CC__stats-bar__delta--muted">Store listing</span>
            </div>
          </li>
        </ul>
      </div>
    </section>
  )
}
