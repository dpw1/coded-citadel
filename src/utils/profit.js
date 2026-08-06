import profitData from '../data/profit.json'

export const PROFIT_GOAL = Number(profitData?.goal) || 100000

/** Sum of all entries in profit.json. */
export function getTotalProfit() {
  const sources = Array.isArray(profitData?.sources) ? profitData.sources : []
  return sources.reduce((sum, entry) => sum + (Number(entry?.amount) || 0), 0)
}

/** Display string for announcement bar / KPIs (e.g. "$1,431"). */
export function getProfitDisplay() {
  return `$${Math.round(getTotalProfit()).toLocaleString('en-US')}`
}

export function getProfitSources() {
  return Array.isArray(profitData?.sources) ? profitData.sources : []
}

/** Milestones sorted by date (oldest first), with running totals. */
export function getProfitMilestones() {
  const sources = getProfitSources()
    .slice()
    .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')))

  let running = 0
  return sources.map((entry) => {
    running += Number(entry?.amount) || 0
    return {
      ...entry,
      amount: Number(entry?.amount) || 0,
      totalAfter: running,
    }
  })
}

export function getProfitProgress() {
  const total = getTotalProfit()
  const goal = PROFIT_GOAL
  const pct = goal > 0 ? Math.min(100, (100 * total) / goal) : 0
  return { total, goal, pct }
}

export function formatProfitAmount(amount) {
  const value = Number(amount) || 0
  return `$${Math.round(value).toLocaleString('en-US')}`
}

export function formatProfitDate(isoDay) {
  if (!isoDay) return null
  const d = new Date(`${isoDay}T12:00:00`)
  if (Number.isNaN(d.getTime())) return String(isoDay)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function isExternalProfitLink(href) {
  return /^https?:\/\//i.test(String(href || ''))
}
