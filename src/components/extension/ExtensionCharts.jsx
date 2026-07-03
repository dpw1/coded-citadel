import { useEffect } from 'react'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
  DoughnutController,
  ArcElement,
} from 'chart.js'
import { formatInstallDate, formatLabel, getInstallationsSeries, getWeeklyUsersSeries, getPageViewsSeries, getImpressionsSeries } from '../../utils/apps'
import { bindChartResize, safeChartResize } from '../../utils/chartUtils'

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
  DoughnutController,
  ArcElement,
)

const PALETTE = ['#ff9900', '#3b82f6', '#22c55e', '#a855f7', '#94a3b8']

const ENABLED_VS_DISABLED_COLORS = {
  enabled: '#ff9900',
  disabled: '#5c6b82',
}

const REGION_COLORS = { US: '#ff9900', BR: '#3b82f6', IN: '#22c55e', GB: '#a855f7', other: '#94a3b8' }

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

export function isRegionCode(key) {
  return /^[A-Z]{2}$/.test(String(key || '').toUpperCase())
}

export function getCountryName(code) {
  if (!code) return 'Unknown'
  const upper = String(code).toUpperCase()
  if (/^[A-Z]{2}$/.test(upper)) {
    return regionNames.of(upper) ?? upper
  }
  return String(code)
}

export function CountryFlag({ code, className = '' }) {
  const upper = String(code || '').toUpperCase()
  if (!isRegionCode(upper)) return null

  return (
    <img
      src={`https://flagcdn.com/w20/${upper.toLowerCase()}.png`}
      alt={getCountryName(upper)}
      className={`ext-country-flag${className ? ` ${className}` : ''}`}
      width={20}
      height={15}
      loading="lazy"
      decoding="async"
    />
  )
}

export function getFlagHTML(code) {
  const upper = String(code || '').toUpperCase()
  return `<img 
    src="https://flagcdn.com/w20/${upper.toLowerCase()}.png"
    alt="${getCountryName(upper)}"
    style="width:1.2em;height:0.9em;object-fit:cover;margin-right:6px;vertical-align:middle"
  />`
}

function sortEntriesByValueDesc(dataObj) {
  return Object.entries(dataObj ?? {}).sort(([, a], [, b]) => b - a)
}

function chartDefaults() {
  Chart.defaults.color = '#7a8599'
  Chart.defaults.font.family = "'Inter', sans-serif"
  Chart.defaults.font.size = 11
}

export function mountRegionDonutChart(canvas, dataObj) {
  if (!canvas || !dataObj) return { destroy() {}, resize() {} }

  chartDefaults()
  const entries = sortEntriesByValueDesc(dataObj)
  if (!entries.length) return { destroy() {}, resize() {} }

  const chart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: entries.map(([key]) => formatLabel(key)),
      datasets: [
        {
          data: entries.map(([, value]) => value),
          backgroundColor: PALETTE,
          borderColor: '#131824',
          borderWidth: 3,
          hoverBorderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#131824',
          borderColor: '#1f2636',
          borderWidth: 1,
          titleColor: '#7a8599',
          bodyColor: '#ffffff',
        },
      },
    },
  })

  return {
    destroy: () => chart.destroy(),
    resize: () => safeChartResize(chart),
  }
}

function gradientFill(chart, height, topAlpha = 0.3) {
  const { ctx } = chart
  const grad = ctx.createLinearGradient(0, 0, 0, height)
  grad.addColorStop(0, `rgba(255,153,0,${topAlpha})`)
  grad.addColorStop(1, 'rgba(255,153,0,0)')
  return grad
}

export default function ExtensionCharts({ analytics, chartIds }) {
  useEffect(() => {
    if (!analytics) return undefined

    chartDefaults()

    const installations = getInstallationsSeries(analytics)
    const installLabels = installations.map((d) => formatInstallDate(d.date))
    const installCounts = installations.map((d) => d.total)

    const weeklyUsers = getWeeklyUsersSeries(analytics)
    const pageViews = getPageViewsSeries(analytics)
    const impressions = getImpressionsSeries(analytics)

    function buildLineChart(canvasId, series, tooltipLabel, height = 180, compact = false) {
      const canvas = document.getElementById(canvasId)
      if (!canvas || !series?.length) return
      const labels = series.map((d) => formatInstallDate(d.date))
      const values = series.map((d) => d.total)
      charts.push(
        new Chart(canvas, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                data: values,
                borderColor: '#ff9900',
                borderWidth: compact ? 2 : 2.5,
                fill: true,
                backgroundColor: (ctx) => gradientFill(ctx.chart, height, compact ? 0.2 : 0.2),
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#ff9900',
                pointBorderColor: '#090b10',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#131824',
                borderColor: '#1f2636',
                borderWidth: 1,
                titleColor: '#7a8599',
                bodyColor: '#ffffff',
                callbacks: { label: (ctx) => ` ${ctx.parsed.y.toLocaleString()} ${tooltipLabel}` },
              },
            },
            scales: compact
              ? { x: { display: false }, y: { display: false } }
              : {
                  x: { grid: { color: '#1a2130' }, ticks: { color: '#7a8599' } },
                  y: {
                    grid: { color: '#1a2130' },
                    ticks: { color: '#7a8599' },
                    beginAtZero: true,
                  },
                },
          },
        }),
      )
    }

    const charts = []

    buildLineChart(chartIds.sparkline, weeklyUsers, 'users', 100, true)

    const weeklyCanvas = document.getElementById(chartIds.weekly)
    if (weeklyCanvas) {
      charts.push(
        new Chart(weeklyCanvas, {
          type: 'line',
          data: {
            labels: installLabels,
            datasets: [
              {
                data: installCounts,
                borderColor: '#ff9900',
                borderWidth: 2.5,
                fill: true,
                backgroundColor: (ctx) => gradientFill(ctx.chart, 180, 0.2),
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#ff9900',
                pointBorderColor: '#090b10',
                pointBorderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#131824',
                borderColor: '#1f2636',
                borderWidth: 1,
                titleColor: '#7a8599',
                bodyColor: '#ffffff',
                callbacks: { label: (ctx) => ` ${ctx.parsed.y.toLocaleString()} installs` },
              },
            },
            scales: {
              x: { grid: { color: '#1a2130' }, ticks: { color: '#7a8599' } },
              y: {
                grid: { color: '#1a2130' },
                ticks: { color: '#7a8599' },
                beginAtZero: true,
              },
            },
          },
        }),
      )
    }

    function buildDonut(canvasId, dataObj, total, colorMap = null) {
      const canvas = document.getElementById(canvasId)
      if (!canvas || !dataObj) return
      const entries = sortEntriesByValueDesc(dataObj)
      const labels = entries.map(([key]) => formatLabel(key))
      const values = entries.map(([, value]) => value)
      const colors = colorMap
        ? entries.map(([key]) => colorMap[key] ?? PALETTE[0])
        : PALETTE
      charts.push(
        new Chart(canvas, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: colors,
                borderColor: '#131824',
                borderWidth: 3,
                hoverBorderWidth: 3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#131824',
                borderColor: '#1f2636',
                borderWidth: 1,
                titleColor: '#7a8599',
                bodyColor: '#ffffff',
              },
            },
          },
        }),
      )
    }

    buildLineChart(chartIds.weeklyUsers, weeklyUsers, 'users')
    buildLineChart(chartIds.pageViews, pageViews, 'page views')
    buildLineChart(chartIds.impressions, impressions, 'impressions')

    buildDonut(chartIds.installRegion, analytics.installsByRegion, analytics.totalInstalls)

    const unbindResize = bindChartResize(charts)

    return () => {
      unbindResize()
      charts.forEach((c) => c.destroy())
    }
  }, [analytics, chartIds])

  return null
}

export function EnabledVsDisabledLegend({ enabledVsDisabled }) {
  if (!enabledVsDisabled) return null

  const total = enabledVsDisabled.total ?? enabledVsDisabled.enabled + enabledVsDisabled.disabled
  const items = [
    {
      key: 'enabled',
      label: 'Enabled',
      value: enabledVsDisabled.enabled,
      pct: enabledVsDisabled.enabledPct,
      color: ENABLED_VS_DISABLED_COLORS.enabled,
    },
    {
      key: 'disabled',
      label: 'Disabled',
      value: enabledVsDisabled.disabled,
      pct: enabledVsDisabled.disabledPct,
      color: ENABLED_VS_DISABLED_COLORS.disabled,
    },
  ]

  return (
    <ul className="ext-chart-legend ext-evd-legend">
      {items.map((item) => {
        const pct =
          item.pct != null
            ? Number(item.pct).toFixed(1)
            : total
              ? ((item.value / total) * 100).toFixed(1)
              : '0.0'
        return (
          <li key={item.key} className="ext-chart-legend__item">
            <span className="ext-chart-legend__left">
              <span className="ext-chart-legend__dot" style={{ background: item.color }} />
              {item.label}
            </span>
            <span>
              <span className="ext-chart-legend__val">{item.value.toLocaleString()}</span>
              <span className="ext-chart-legend__pct"> ({pct}%)</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export function DonutLegend({ dataObj, total }) {
  if (!dataObj) return null
  const entries = sortEntriesByValueDesc(dataObj)
  return (
    <ul className="ext-chart-legend">
      {entries.map(([key, value], i) => {
        const pct = total ? ((value / total) * 100).toFixed(1) : '0.0'
        return (
          <li key={key} className="ext-chart-legend__item">
            <span className="ext-chart-legend__left">
              <span className="ext-chart-legend__dot" style={{ background: PALETTE[i] }} />
              {isRegionCode(key) ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: `${getFlagHTML(key)}${getCountryName(key)}`,
                  }}
                />
              ) : (
                formatLabel(key)
              )}
            </span>
            <span>
              <span className="ext-chart-legend__val">{value.toLocaleString()}</span>
              <span className="ext-chart-legend__pct"> ({pct}%)</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export function regionDotColor(region) {
  return REGION_COLORS[region] || REGION_COLORS.other
}
