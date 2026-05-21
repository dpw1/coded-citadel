import { Link } from 'react-router-dom'
import CyberCorners from './CyberCorners'
import {
  appCardInstalls,
  appCardRevenue,
  appCardSummary,
  appIconUrl,
  appStoreUrl,
  formatNumber,
  getAllApps,
  isAppLive,
} from '../utils/apps'

export default function AppsGridSection({
  sectionId = 'apps',
  showViewAllLink = false,
  eyebrow = 'My Apps',
  title = 'Built To Solve Real Problems',
}) {
  const apps = getAllApps()

  return (
    <section id={sectionId} className="CC__extensions CC__container">
      <div className="CC__section-header-row">
        <div>
          <p className="CC__section-eyebrow">{eyebrow}</p>
          <h2 className="CC__section-title">{title}</h2>
        </div>
        {showViewAllLink ? (
          <Link to="/apps" className="CC__view-all-link">
            View all apps →
          </Link>
        ) : null}
      </div>

      <div className="CC__extensions-grid">
        {apps.map((app) => {
          const live = isAppLive(app)
          const storeUrl = appStoreUrl(app)
          const installs = appCardInstalls(app)
          const revenue = appCardRevenue(app)
          const summary = appCardSummary(app)
          const iconUrl = appIconUrl(app)

          return (
            <div
              key={app.slug}
              className={`CC__extension-card CC__cyber-accent${live ? '' : ' CC__extension-card--disabled'}`}
            >
              <CyberCorners />
              <div className="CC__extension-inner">
                <div className="CC__extension-top">
                  <div className="CC__extension-icon-box">
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt=""
                        className="CC__extension-icon-img"
                        width={40}
                        height={40}
                      />
                    ) : (
                      app.icon ?? '⚡'
                    )}
                  </div>
                  <div className="CC__extension-meta">
                    <h3>
                      {app.name}{' '}
                      <span className="CC__extension-version">v{app.version}</span>
                    </h3>
                    <p className="CC__extension-summary">{summary}</p>
                  </div>
                </div>
                <div className="CC__extension-metrics">
                  <div>
                    <span className="CC__metric-item-label">INSTALLS</span>
                    <div className="CC__metric-item-value">
                      {installs != null ? formatNumber(installs) : '—'}
                    </div>
                  </div>
                  <div>
                    <span className="CC__metric-item-label">REVENUE</span>
                    <div className="CC__metric-item-value">{revenue ?? '—'}</div>
                  </div>
                </div>
              </div>

              {live ? (
                <>
                  <Link
                    to={`/apps/${app.slug}`}
                    className="CC__btn CC__btn--outline CC__btn--full"
                    style={{ marginBottom: '0.5rem' }}
                  >
                    View details →
                  </Link>
                  {storeUrl ? (
                    <a
                      href={storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="CC__btn CC__btn--primary CC__btn--full"
                    >
                      Install on Chrome
                    </a>
                  ) : null}
                </>
              ) : (
                <button type="button" disabled className="CC__btn CC__btn--outline CC__btn--full">
                  Coming Soon
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
