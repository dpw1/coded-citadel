import CyberCorners from '../CyberCorners'
import { CountryFlag, getCountryName } from './ExtensionCharts'
import { codeFromCountryName, isGaNotSet, resolveCountryFromGa } from '../../utils/countryUtils'
import PortfolioAnalyticsSkeleton from './PortfolioAnalyticsSkeleton'
import WebsiteAnalyticsCharts from './WebsiteAnalyticsCharts'
import WeekPercentDelta from './WeekPercentDelta'
import { formatLabel, formatNumber } from '../../utils/apps'
import {
  formatDurationSeconds,
  pagePathToHref,
  websiteBlogViewsDelta,
  websitePageViewsDelta,
  websiteUniqueVisitorsDelta,
} from '../../utils/liveStatsAnalytics'

function BreakdownList({ items, total, valueKey, labelKey, formatItemLabel = formatLabel }) {
  if (!items?.length) {
    return <p className="ext-evd-donut__empty">No data yet.</p>
  }

  return (
    <ul className="ext-sec-card__regions">
      {items.map((item) => {
        const value = item[valueKey] ?? 0
        const pct = total ? ((value / total) * 100).toFixed(1) : '0.0'
        const label = formatItemLabel(item[labelKey])
        return (
          <li key={`${label}-${value}`} className="ext-sec-card__region">
            <span
              className="ext-sec-card__region-dot"
              style={{ background: 'var(--CC__color-text-muted)' }}
            />
            <span style={{ color: 'var(--CC__color-text-muted)' }}>{label}</span>
            <span className="ext-sec-card__region-val">{formatNumber(value)}</span>
            <span className="ext-sec-card__region-pct">({pct}%)</span>
          </li>
        )
      })}
    </ul>
  )
}

function countryFlagCode(item, row) {
  if (row.code && /^[A-Z]{2}$/i.test(row.code)) return row.code.toUpperCase()
  if (item.code && /^[A-Z]{2}$/i.test(String(item.code)) && !isGaNotSet(item.code)) {
    return String(item.code).toUpperCase()
  }
  if (item.gaCountryId && /^[A-Z]{2}$/i.test(String(item.gaCountryId)) && !isGaNotSet(item.gaCountryId)) {
    return String(item.gaCountryId).toUpperCase()
  }
  return codeFromCountryName(row.name)
}

function CountryUsersList({ countries }) {
  const sorted = [...(countries || [])].sort((a, b) => (b.users ?? 0) - (a.users ?? 0))
  const total = sorted.reduce((sum, row) => sum + (row.users ?? 0), 0)

  if (!sorted.length) {
    return <p className="ext-evd-donut__empty">No data yet.</p>
  }

  return (
    <ul className="ext-sec-card__regions ext-sec-card__regions--countries">
      {sorted.map((item) => {
        const row = resolveCountryFromGa(item)
        const value = row.users ?? 0
        const pct = total ? ((value / total) * 100).toFixed(1) : '0.0'
        const code = countryFlagCode(item, row)
        const label =
          row.name && !/^[A-Z]{2}$/i.test(row.name)
            ? row.name
            : code
              ? getCountryName(code)
              : row.name || '(not set)'
        const key = `${code || label}-${value}`

        return (
          <li key={key} className="ext-sec-card__region ext-sec-card__region--country">
            <span className="ext-sec-card__region-country">
              {code ? (
                <CountryFlag code={code} />
              ) : (
                <span
                  className="ext-sec-card__region-dot"
                  style={{ background: 'var(--CC__color-text-muted)' }}
                />
              )}
              <span className="ext-sec-card__region-label">{label}</span>
            </span>
            <span className="ext-sec-card__region-metrics">
              <span className="ext-sec-card__region-val">{formatNumber(value)}</span>
              <span className="ext-sec-card__region-pct">({pct}%)</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function PageLinksList({ items, total }) {
  if (!items?.length) {
    return <p className="ext-evd-donut__empty">No data yet.</p>
  }

  return (
    <ul className="ext-sec-card__regions ext-sec-card__regions--pages">
      {items.map((item) => {
        const value = item.views ?? 0
        const pct = total ? ((value / total) * 100).toFixed(1) : '0.0'
        const href = pagePathToHref(item.path)

        return (
          <li key={`${item.path}-${value}`} className="ext-sec-card__region">
            <a href={href} className="ext-sec-card__region-link">
              {item.path || '/'}
            </a>
            <span className="ext-sec-card__region-val">{formatNumber(value)}</span>
            <span className="ext-sec-card__region-pct">({pct}%)</span>
          </li>
        )
      })}
    </ul>
  )
}

function SourceBars({ items, total, valueKey, labelKey, formatItemLabel = formatLabel }) {
  if (!items?.length) {
    return <p className="ext-evd-donut__empty">No data yet.</p>
  }

  return (
    <div className="ext-sources">
      {items.map((item) => {
        const value = item[valueKey] ?? 0
        const pct = total ? ((value / total) * 100).toFixed(1) : '0.0'
        return (
          <div key={`${item[labelKey]}-${value}`} className="ext-source-row">
            <span className="ext-source-row__name">{formatItemLabel(item[labelKey])}</span>
            <div className="ext-source-row__bar-wrap">
              <div className="ext-source-row__fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="ext-source-row__val">{formatNumber(value)}</span>
            <span className="ext-source-row__pct">({pct}%)</span>
          </div>
        )
      })}
    </div>
  )
}

export default function WebsiteAnalyticsBlock({ data, loading = false, chartIds }) {
  if (loading) {
    return <PortfolioAnalyticsSkeleton label="Loading website analytics" cardCount={5} />
  }

  if (!data?.available) {
    return (
      <p className="CC__stats-page__empty">
        {data?.message || 'Website analytics are not available yet.'}
      </p>
    )
  }

  const trafficTotal = data.trafficSources.reduce((sum, row) => sum + (row.sessions ?? 0), 0)
  const referrersTotal = data.topReferrers.reduce((sum, row) => sum + (row.sessions ?? 0), 0)
  const visitorsTotal = (data.newVsReturning.new ?? 0) + (data.newVsReturning.returning ?? 0)
  const timeSeries = data.timeSeries ?? {
    pageViews: [],
    activeUsers: [],
    blogViews: [],
    sessions: [],
  }
  const hasCharts =
    chartIds &&
    ['pageViews', 'activeUsers', 'blogViews', 'sessions'].some((key) => timeSeries[key]?.length > 0)
  const pageViewsDelta = websitePageViewsDelta(data)
  const blogViewsDelta = websiteBlogViewsDelta(data)
  const uniqueVisitorsDelta = websiteUniqueVisitorsDelta(data)
  const uniqueVisitors =
    data.uniqueVisitors ??
    (data.newVsReturning?.new ?? 0) + (data.newVsReturning?.returning ?? 0)

  return (
    <>
      {chartIds ? (
        <WebsiteAnalyticsCharts timeSeries={timeSeries} chartIds={chartIds} />
      ) : null}

      <div className="ext-analytics__kpis">
        <div className="ext-kpi CC__cyber-accent">
          <CyberCorners />
          <div className="ext-kpi__label">Total Views</div>
          <div className="ext-kpi__value">{formatNumber(data.totalViews ?? 0)}</div>
          {pageViewsDelta ? (
            <WeekPercentDelta
              delta={pageViewsDelta}
              as="div"
              className="ext-kpi__delta"
              negativeClassName=" ext-kpi__delta--negative"
            />
          ) : null}
        </div>
        <div className="ext-kpi CC__cyber-accent">
          <CyberCorners />
          <div className="ext-kpi__label">Blog Views</div>
          <div className="ext-kpi__value ext-kpi__value--white">{formatNumber(data.blogViews ?? 0)}</div>
          {blogViewsDelta ? (
            <WeekPercentDelta
              delta={blogViewsDelta}
              as="div"
              className="ext-kpi__delta"
              negativeClassName=" ext-kpi__delta--negative"
            />
          ) : null}
        </div>
        <div className="ext-kpi CC__cyber-accent">
          <CyberCorners />
          <div className="ext-kpi__label">Avg. Time on Site</div>
          <div className="ext-kpi__value ext-kpi__value--white">
            {formatDurationSeconds(data.averageTimeOnSiteSeconds)}
          </div>
        </div>
        <div className="ext-kpi CC__cyber-accent">
          <CyberCorners />
          <div className="ext-kpi__label">Unique Visitors</div>
          <div className="ext-kpi__value ext-kpi__value--white">{formatNumber(uniqueVisitors)}</div>
          {uniqueVisitorsDelta ? (
            <WeekPercentDelta
              delta={uniqueVisitorsDelta}
              as="div"
              className="ext-kpi__delta"
              negativeClassName=" ext-kpi__delta--negative"
            />
          ) : null}
        </div>
      </div>

      {hasCharts ? (
        <div className="ext-analytics__charts ext-analytics__charts--website-series">
          <div className="ext-chart-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-chart-card__title">Page Views Over Time</div>
            <div className="ext-chart-card__canvas-wrap" style={{ height: 200 }}>
              <canvas id={chartIds.pageViews} />
            </div>
          </div>
          <div className="ext-chart-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-chart-card__title">Active Users</div>
            <div className="ext-chart-card__canvas-wrap" style={{ height: 200 }}>
              <canvas id={chartIds.activeUsers} />
            </div>
          </div>
          <div className="ext-chart-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-chart-card__title">Blog Views</div>
            <div className="ext-chart-card__canvas-wrap" style={{ height: 200 }}>
              <canvas id={chartIds.blogViews} />
            </div>
          </div>
          <div className="ext-chart-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-chart-card__title">Sessions</div>
            <div className="ext-chart-card__canvas-wrap" style={{ height: 200 }}>
              <canvas id={chartIds.sessions} />
            </div>
          </div>
        </div>
      ) : null}

      <section className="ext-secondary-stats ext-secondary-stats--website">
        <div className="ext-secondary-stats__grid ext-secondary-stats__grid--cols-3">
          <div className="ext-sec-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-sec-card__label">Traffic Sources</div>
            <SourceBars
              items={data.trafficSources}
              total={trafficTotal}
              valueKey="sessions"
              labelKey="source"
            />
          </div>

          <div className="ext-sec-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-sec-card__label">Top Referrers</div>
            <SourceBars
              items={data.topReferrers}
              total={referrersTotal}
              valueKey="sessions"
              labelKey="referrer"
              formatItemLabel={(referrer) => referrer}
            />
          </div>

          <div className="ext-sec-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-sec-card__label">New vs Returning Visitors</div>
            <div className="ext-sec-card__value">{formatNumber(visitorsTotal)}</div>
            <BreakdownList
              items={[
                { label: 'New', value: data.newVsReturning.new ?? 0 },
                { label: 'Returning', value: data.newVsReturning.returning ?? 0 },
              ]}
              total={visitorsTotal}
              valueKey="value"
              labelKey="label"
              formatItemLabel={(label) => label}
            />
          </div>
        </div>

        <div className="ext-secondary-stats__grid ext-secondary-stats__grid--cols-2">
          <div className="ext-sec-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-sec-card__label">Users by Country</div>
            <CountryUsersList countries={data.countries} />
          </div>

          <div className="ext-sec-card CC__cyber-accent">
            <CyberCorners />
            <div className="ext-sec-card__label">Most Viewed Pages</div>
            <PageLinksList items={data.mostViewedPages} total={data.totalViews ?? 0} />
          </div>
        </div>
      </section>
    </>
  )
}
