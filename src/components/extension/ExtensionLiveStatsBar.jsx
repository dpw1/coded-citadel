import CyberCorners from '../CyberCorners'
import WeekPercentDelta from './WeekPercentDelta'
import {
  formatNumber,
  getInstallationsSeries,
  installationsDelta,
  impressionsDelta,
  pageViewsDelta,
  totalUsersDelta,
} from '../../utils/apps'

export { default as WeekPercentDelta } from './WeekPercentDelta'

export default function ExtensionLiveStatsBar({
  analytics,
  activeUsers,
}) {
  if (!analytics) return null

  const installDelta = installationsDelta(getInstallationsSeries(analytics))
  const usersDelta = totalUsersDelta(analytics)
  const viewsDelta = pageViewsDelta(analytics)
  const imprDelta = impressionsDelta(analytics)

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
              {installDelta ? (
                <WeekPercentDelta delta={installDelta} />
              ) : (
                <span className="CC__stats-bar__delta">↑ Live</span>
              )}
            </div>
          </li>
          <li className="CC__stats-bar__item">
            <div className="CC__stats-bar__info">
              <span className="CC__stats-bar__label">Active Users</span>
              <span className="CC__stats-bar__value">{formatNumber(activeUsers)}</span>
              {usersDelta ? (
                <WeekPercentDelta delta={usersDelta} />
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
              {viewsDelta ? (
                <WeekPercentDelta delta={viewsDelta} />
              ) : (
                <span className="CC__stats-bar__delta">↑ Live</span>
              )}
            </div>
          </li>
          <li className="CC__stats-bar__item">
            <div className="CC__stats-bar__info">
              <span className="CC__stats-bar__label">Impressions</span>
              <span className="CC__stats-bar__value CC__stats-bar__value--white">
                {formatNumber(analytics.impressions)}
              </span>
              {imprDelta ? (
                <WeekPercentDelta delta={imprDelta} />
              ) : (
                <span className="CC__stats-bar__delta">↑ Live</span>
              )}
            </div>
          </li>
        </ul>
      </div>
    </section>
  )
}
