import CyberCorners from '../CyberCorners'
import ExtensionCharts, { DonutLegend, regionDotColor } from './ExtensionCharts'
import {
  analyticsActiveUsers,
  formatAppDate,
  formatLabel,
  formatNumber,
  getInstallationsSeries,
  installationsDelta,
  impressionsDelta,
  pageViewsDelta,
  totalUsersDelta,
} from '../../utils/apps'
import WeekPercentDelta from './WeekPercentDelta'

export default function ExtensionAnalyticsBlock({
  analytics,
  chartIds,
  updatedAt,
  updatedLabel = null,
  eyebrow = 'Analytics Overview',
  title = 'Live Performance',
  appFilter = null,
}) {
  if (!analytics || !chartIds) return null

  const installations = getInstallationsSeries(analytics)
  const installDelta = installationsDelta(installations)
  const totalUsers = analyticsActiveUsers(analytics)
  const usersDelta = totalUsersDelta(analytics)
  const viewsDelta = pageViewsDelta(analytics)
  const imprDelta = impressionsDelta(analytics)
  const enabledVsDisabled = analytics.enabledVsDisabled ?? { enabled: 0, disabled: 0 }
  const pageViewsBySource = analytics.pageViewsBySource ?? {}
  const uninstallsByRegion = analytics.uninstallsByRegion ?? {}
  const evd = enabledVsDisabled
  const evdTotal = evd.enabled + evd.disabled
  const weeklyRegionTotal = Object.values(analytics.weeklyUsersByRegion ?? {}).reduce(
    (a, b) => a + b,
    0,
  )

  return (
    <>
      <ExtensionCharts analytics={analytics} chartIds={chartIds} />

      <section className="ext-analytics">
        <div className="ext-analytics__header-layout">
          <div className="ext-analytics__header">
            <div className="ext-analytics__header-main">
              <div className="ext-analytics__eyebrow">{eyebrow}</div>
              <h2 className="ext-analytics__title">{title}</h2>
              {updatedLabel ? (
                <small className="ext-analytics__updated">{updatedLabel}</small>
              ) : updatedAt ? (
                <small className="ext-analytics__updated">
                  Last updated at: {formatAppDate(updatedAt)}
                </small>
              ) : null}
            </div>
          </div>
          {appFilter ? (
            <div className="ext-analytics__header-actions">{appFilter}</div>
          ) : null}
        </div>

        <div className="ext-analytics__kpis">
          <div className="ext-kpi CC__cyber-accent">
            <CyberCorners />
            <div className="ext-kpi__label">Total Installs</div>
            <div className="ext-kpi__value">{formatNumber(analytics.totalInstalls)}</div>
            {installDelta ? (
              <WeekPercentDelta
                delta={installDelta}
                as="div"
                className="ext-kpi__delta"
                negativeClassName=" ext-kpi__delta--negative"
              />
            ) : (
              <div className="ext-kpi__delta">↑ Live</div>
            )}
          </div>
          <div className="ext-kpi CC__cyber-accent">
            <CyberCorners />
            <div className="ext-kpi__label">Active Users</div>
            <div className="ext-kpi__value">{formatNumber(totalUsers)}</div>
            {usersDelta ? (
              <WeekPercentDelta
                delta={usersDelta}
                as="div"
                className="ext-kpi__delta"
                negativeClassName=" ext-kpi__delta--negative"
              />
            ) : (
              <div className="ext-kpi__delta">↑ Live</div>
            )}
            <div className="ext-kpi__chart">
              <canvas id={chartIds.sparkline} />
            </div>
          </div>
          <div className="ext-kpi CC__cyber-accent">
            <CyberCorners />
            <div className="ext-kpi__label">Page Views</div>
            <div className="ext-kpi__value ext-kpi__value--white">{formatNumber(analytics.pageViews)}</div>
            {viewsDelta ? (
              <WeekPercentDelta
                delta={viewsDelta}
                as="div"
                className="ext-kpi__delta"
                negativeClassName=" ext-kpi__delta--negative"
              />
            ) : (
              <div className="ext-kpi__delta">↑ Live</div>
            )}
          </div>
          <div className="ext-kpi CC__cyber-accent">
            <CyberCorners />
            <div className="ext-kpi__label">Impressions</div>
            <div className="ext-kpi__value ext-kpi__value--white">{formatNumber(analytics.impressions)}</div>
            {imprDelta ? (
              <WeekPercentDelta
                delta={imprDelta}
                as="div"
                className="ext-kpi__delta"
                negativeClassName=" ext-kpi__delta--negative"
              />
            ) : (
              <div className="ext-kpi__delta">↑ Live</div>
            )}
          </div>
        </div>

        <div className="ext-analytics__charts">
          <div className="ext-chart-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-chart-card__title">Installations</div>
            <div className="ext-chart-card__canvas-wrap" style={{ height: 200 }}>
              <canvas id={chartIds.weekly} />
            </div>
          </div>
          <div className="ext-chart-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-chart-card__title">Weekly Users</div>
            <div className="ext-chart-card__canvas-wrap" style={{ height: 200 }}>
              <canvas id={chartIds.weeklyUsers} />
            </div>
          </div>
          <div className="ext-chart-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-chart-card__title">Page Views Over Time</div>
            <div className="ext-chart-card__canvas-wrap" style={{ height: 200 }}>
              <canvas id={chartIds.pageViews} />
            </div>
          </div>
          <div className="ext-chart-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-chart-card__title">Impressions Across Chrome Web Store</div>
            <div className="ext-chart-card__canvas-wrap" style={{ height: 200 }}>
              <canvas id={chartIds.impressions} />
            </div>
          </div>
          <div className="ext-chart-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-chart-card__title">Installed Users by Region</div>
            <div className="ext-chart-card__canvas-wrap" style={{ height: 160 }}>
              <canvas id={chartIds.installRegion} />
            </div>
            <DonutLegend dataObj={analytics.installsByRegion} total={analytics.totalInstalls} />
          </div>
          <div className="ext-chart-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-chart-card__title">Weekly Users by Region</div>
            <div className="ext-chart-card__canvas-wrap" style={{ height: 160 }}>
              <canvas id={chartIds.weeklyRegion} />
            </div>
            <DonutLegend dataObj={analytics.weeklyUsersByRegion ?? {}} total={weeklyRegionTotal} />
          </div>
        </div>
      </section>

      <section className="ext-secondary-stats">
        <div className="ext-secondary-stats__grid">
          <div className="ext-sec-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-sec-card__label">Uninstalls</div>
            <div className="ext-sec-card__value">{formatNumber(analytics.uninstalls)}</div>
            <ul className="ext-sec-card__regions">
              {Object.entries(uninstallsByRegion).map(([region, count]) => {
                const pct = analytics.uninstalls
                  ? ((count / analytics.uninstalls) * 100).toFixed(1)
                  : '0.0'
                return (
                  <li key={region} className="ext-sec-card__region">
                    <span
                      className="ext-sec-card__region-dot"
                      style={{ background: regionDotColor(region) }}
                    />
                    <span style={{ color: 'var(--CC__color-text-muted)' }}>{formatLabel(region)}</span>
                    <span className="ext-sec-card__region-val">{count}</span>
                    <span className="ext-sec-card__region-pct">({pct}%)</span>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="ext-sec-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-sec-card__label">Impressions</div>
            <div className="ext-sec-card__value">{formatNumber(analytics.impressions)}</div>
            {imprDelta ? (
              <WeekPercentDelta
                delta={imprDelta}
                as="div"
                className="ext-kpi__delta"
                negativeClassName=" ext-kpi__delta--negative"
              />
            ) : (
              <div className="ext-kpi__delta">↑ Live</div>
            )}
          </div>
          <div className="ext-sec-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-sec-card__label">Enabled vs Disabled</div>
            <div className="ext-enabled-row">
              {[
                { name: 'Enabled', count: evd.enabled, cls: 'ext-enabled-item__fill--orange' },
                { name: 'Disabled', count: evd.disabled, cls: 'ext-enabled-item__fill--muted' },
              ].map((item) => {
                const pct = evdTotal ? ((item.count / evdTotal) * 100).toFixed(1) : '0.0'
                return (
                  <div key={item.name} className="ext-enabled-item">
                    <div className="ext-enabled-item__top">
                      <span className="ext-enabled-item__name">{item.name}</span>
                      <span>
                        <span className="ext-enabled-item__count">{formatNumber(item.count)}</span>
                        <span className="ext-enabled-item__pct"> ({pct}%)</span>
                      </span>
                    </div>
                    <div className="ext-enabled-item__bar">
                      <div
                        className={`ext-enabled-item__fill ${item.cls}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="ext-sec-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-sec-card__label">Page Views by Source</div>
            <div className="ext-sources">
              {[...Object.entries(pageViewsBySource)]
                .sort(([, a], [, b]) => b - a)
                .map(([source, count]) => {
                const pct = analytics.pageViews
                  ? ((count / analytics.pageViews) * 100).toFixed(1)
                  : '0.0'
                return (
                  <div key={source} className="ext-source-row">
                    <span className="ext-source-row__name">{formatLabel(source)}</span>
                    <div className="ext-source-row__bar-wrap">
                      <div className="ext-source-row__fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="ext-source-row__val">{formatNumber(count)}</span>
                    <span className="ext-source-row__pct">({pct}%)</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
