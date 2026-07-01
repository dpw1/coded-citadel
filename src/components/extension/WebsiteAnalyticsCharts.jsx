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
} from 'chart.js'
import { formatInstallDate } from '../../utils/apps'
import { bindChartResize, safeChartResize } from '../../utils/chartUtils'

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
)

function gradientFill(chart, height, topAlpha = 0.2) {
  const { ctx } = chart
  const grad = ctx.createLinearGradient(0, 0, 0, height)
  grad.addColorStop(0, `rgba(255,153,0,${topAlpha})`)
  grad.addColorStop(1, 'rgba(255,153,0,0)')
  return grad
}

function mountLineChart(canvas, series, tooltipLabel, height = 200) {
  if (!canvas || !series?.length) {
    return { destroy() {}, resize() {} }
  }

  Chart.defaults.color = '#7a8599'
  Chart.defaults.font.family = "'Inter', sans-serif"
  Chart.defaults.font.size = 11

  const labels = series.map((row) => formatInstallDate(row.date))
  const values = series.map((row) => row.total)

  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          data: values,
          borderColor: '#ff9900',
          borderWidth: 2.5,
          fill: true,
          backgroundColor: (ctx) => gradientFill(ctx.chart, height),
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
      scales: {
        x: {
          grid: { color: 'rgba(31,38,54,0.5)' },
          ticks: { maxTicksLimit: 8, color: '#7a8599' },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(31,38,54,0.5)' },
          ticks: { color: '#7a8599' },
        },
      },
    },
  })

  return {
    destroy: () => chart.destroy(),
    resize: () => safeChartResize(chart),
  }
}

const CHART_DEFS = [
  { key: 'pageViews', label: 'views' },
  { key: 'activeUsers', label: 'users' },
  { key: 'blogViews', label: 'blog views' },
  { key: 'sessions', label: 'sessions' },
]

export default function WebsiteAnalyticsCharts({ timeSeries, chartIds }) {
  useEffect(() => {
    if (!timeSeries || !chartIds) return undefined

    const controls = CHART_DEFS.map(({ key, label }) => {
      const canvas = document.getElementById(chartIds[key])
      return mountLineChart(canvas, timeSeries[key], label)
    })

    const unbindResize = bindChartResize(controls)

    return () => {
      unbindResize()
      controls.forEach((c) => c.destroy())
    }
  }, [timeSeries, chartIds])

  return null
}
