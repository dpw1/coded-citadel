import CyberCorners from '../CyberCorners'
import ExtensionCharts, {
  DonutLegend,
  regionDotColor,
} from './ExtensionCharts'
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
import { siteStatsWeekDeltaPct } from '../../utils/siteStats'
import WeekPercentDelta from './WeekPercentDelta'

function HorizontalBarBreakdown({
  items,
  barTotal,
  pctTotal = null,
  valueKey = 'value',
  labelKey = 'label',
  showPct = false,
}) {
  if (!items.length) {
    return <p className="ext-sources__empty">No data yet.</p>
  }

  const barMax = barTotal > 0 ? barTotal : Math.max(...items.map((item) => item[valueKey] ?? 0), 1)
  const pctMax = pctTotal ?? barMax

  return (
    <div className="ext-sources">
      {items.map((item) => {
        const value = item[valueKey] ?? 0
        const barPct = barMax ? ((value / barMax) * 100).toFixed(1) : '0.0'
        const labelPct = pctMax ? ((value / pctMax) * 100).toFixed(1) : '0.0'
        return (
          <div key={item.key ?? item[labelKey]} className="ext-source-row">
            <span className="ext-source-row__name">{item[labelKey]}</span>
            <div className="ext-source-row__bar-wrap">
              <div className="ext-source-row__fill" style={{ width: `${barPct}%` }} />
            </div>
            <span className="ext-source-row__val">{formatNumber(value)}</span>
            {showPct ? <span className="ext-source-row__pct">({labelPct}%)</span> : null}
          </div>
        )
      })}
    </div>
  )
}

export default function ExtensionAnalyticsBlock({
  analytics,
  chartIds,
  updatedAt,
  updatedLabel = null,
  eyebrow = 'Analytics Overview',
  title = 'Live Performance',
  appFilter = null,
  siteStatsHeadlines = null,
  topExtensionsByUsers = null,
  hideHeader = false,
}) {
  if (!analytics || !chartIds) return null

  const installations = getInstallationsSeries(analytics)
  const installDelta = siteStatsHeadlines
    ? siteStatsWeekDeltaPct(
        siteStatsHeadlines.installsDelta7d,
        siteStatsHeadlines.baselineTotalInstalls,
      ) ?? installationsDelta(installations)
    : installationsDelta(installations)
  const totalInstalls = siteStatsHeadlines?.totalInstalls ?? analytics.totalInstalls
  const totalUsers = siteStatsHeadlines?.activeUsers ?? analyticsActiveUsers(analytics)
  const usersDelta = siteStatsHeadlines
    ? siteStatsWeekDeltaPct(
        siteStatsHeadlines.activeUsersDelta7d,
        siteStatsHeadlines.baselineTotalActiveUsers,
      ) ?? totalUsersDelta(analytics)
    : totalUsersDelta(analytics)
  const viewsDelta = pageViewsDelta(analytics)
  const imprDelta = impressionsDelta(analytics)
  const pageViewsBySource = analytics.pageViewsBySource ?? {}
  const uninstallsByRegion = analytics.uninstallsByRegion ?? {}
  const showTopExtensions = Array.isArray(topExtensionsByUsers)
  const topExtensionsMaxUsers = showTopExtensions
    ? Math.max(...topExtensionsByUsers.map((row) => row.activeUsers), 0)
    : 0
  const pageViewsBySourceRows = [...Object.entries(pageViewsBySource)]
    .sort(([, a], [, b]) => b - a)
    .map(([source, count]) => ({ key: source, label: formatLabel(source), value: count }))

  const analyticsContent = (
    <>
      {!hideHeader ? (
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
      ) : null}

      <div className="ext-analytics__kpis">
      <div className="ext-kpi CC__cyber-accent">
            <CyberCorners />
            <div className="ext-kpi__label">Total Installs</div>
            <div className="ext-kpi__value">{formatNumber(totalInstalls)}</div>
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
            <div className="ext-chart-card__title">Active Users</div>
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
        </div>

        <div className="ext-analytics__charts ext-analytics__charts--quad">
          <div className="ext-chart-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-chart-card__title">Installed Users by Region</div>
            <div className="ext-chart-card__canvas-wrap" style={{ height: 160 }}>
              <canvas id={chartIds.installRegion} />
            </div>
            <DonutLegend dataObj={analytics.installsByRegion} total={analytics.totalInstalls} />
          </div>
          <div className="ext-sec-card ext-sec-card--in-chart CC__cyber-accent">
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
          <div className="ext-sec-card ext-sec-card--in-chart CC__cyber-accent">
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
          <div className="ext-chart-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-chart-card__title">Impressions Across Chrome Web Store</div>
            <div className="ext-chart-card__canvas-wrap" style={{ height: 200 }}>
              <canvas id={chartIds.impressions} />
            </div>
          </div>
        </div>
    </>
  )

  return (
    <>
      <ExtensionCharts analytics={analytics} chartIds={chartIds} />

      {hideHeader ? (
        <div className="ext-analytics__body">{analyticsContent}</div>
      ) : (
        <section className="ext-analytics">{analyticsContent}</section>
      )}

      <section className="ext-secondary-stats">
        <div
          className={`ext-secondary-stats__grid${
            showTopExtensions ? ' ext-secondary-stats__grid--cols-2' : ''
          }`}
        >
          {showTopExtensions ? (
            <div className="ext-sec-card CC__cyber-accent">
              <CyberCorners />
              <div className="ext-sec-card__label">Top 10 Extensions</div>
              <HorizontalBarBreakdown
                items={topExtensionsByUsers.map((row) => ({
                  key: row.key,
                  label: row.name,
                  value: row.activeUsers,
                }))}
                barTotal={topExtensionsMaxUsers}
              />
            </div>
          ) : null}

          <div className="ext-sec-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-sec-card__label">Page Views by Source</div>
            <HorizontalBarBreakdown
              items={pageViewsBySourceRows}
              barTotal={analytics.pageViews}
              pctTotal={analytics.pageViews}
              labelKey="label"
              showPct
            />
          </div>
        </div>
      </section>
    </>
  )
}
