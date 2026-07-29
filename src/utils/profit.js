import profitData from '../data/profit.json'

/** Sum of all entries in profit.json. */
export function getTotalProfit() {
  const sources = Array.isArray(profitData?.sources) ? profitData.sources : []
  return sources.reduce((sum, entry) => sum + (Number(entry?.amount) || 0), 0)
}

/** Display string for announcement bar / KPIs (e.g. "$1,401"). */
export function getProfitDisplay() {
  return `$${Math.round(getTotalProfit()).toLocaleString('en-US')}`
}

export function getProfitSources() {
  return Array.isArray(profitData?.sources) ? profitData.sources : []
}
