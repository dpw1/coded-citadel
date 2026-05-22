import CyberCorners from './CyberCorners'
import { formatNumber, getHomeStats } from '../utils/apps'

export default function LiveStatsBar() {
  const stats = getHomeStats()
  const installDeltaLabel =
    stats.installDelta > 0
      ? `+ ${formatNumber(stats.installDelta)} this week`
      : stats.installDelta < 0
        ? `${formatNumber(stats.installDelta)} this week`
        : 'From Chrome Web Store'

  return (
    <div className="CC__stats-section CC__container">
      <div className="CC__stats-bar CC__cyber-accent" role="region" aria-label="Live Stats">
        <CyberCorners />

        <div className="CC__stats-bar__live" aria-label="Live stats indicator">
          <span className="CC__stats-bar__live-label">LIVE</span>
          <span className="CC__stats-bar__live-sub">
            STATS
            <span className="CC__stats-bar__live-dot" aria-hidden="true" />
          </span>
        </div>

        <ul className="CC__stats-bar__items">
          <li className="CC__stats-bar__item">
            <div className="CC__stats-bar__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="CC__stats-bar__info">
              <span className="CC__stats-bar__label">Total Users</span>
              <span className="CC__stats-bar__value">{formatNumber(stats.totalActiveUsers)}</span>
              <span className="CC__stats-bar__delta">From live apps</span>
            </div>
          </li>

          <li className="CC__stats-bar__item">
            <div className="CC__stats-bar__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <polyline points="8 17 12 21 16 17" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" />
              </svg>
            </div>
            <div className="CC__stats-bar__info">
              <span className="CC__stats-bar__label">Total Installs</span>
              <span className="CC__stats-bar__value">{formatNumber(stats.totalInstalls)}</span>
              <span className="CC__stats-bar__delta">{installDeltaLabel}</span>
            </div>
          </li>

          <li className="CC__stats-bar__item">
            <div className="CC__stats-bar__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <div className="CC__stats-bar__info">
              <span className="CC__stats-bar__label">Apps Built</span>
              <span className="CC__stats-bar__value CC__stats-bar__value--white">{stats.built}</span>
              <span className="CC__stats-bar__delta CC__stats-bar__delta--info">
                {stats.inProgress > 0 ? `+ ${stats.inProgress} in progress` : 'All live'}
              </span>
            </div>
          </li>

          <li className="CC__stats-bar__item">
            <div className="CC__stats-bar__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="CC__stats-bar__info">
              <span className="CC__stats-bar__label">Days Into Journey</span>
              <span className="CC__stats-bar__value CC__stats-bar__value--white">
                {stats.daysIntoJourney ?? '—'}
              </span>
              <span className="CC__stats-bar__delta CC__stats-bar__delta--muted">Since Day 1</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
