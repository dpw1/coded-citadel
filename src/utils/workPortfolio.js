import portfolioData from '../data/work-portfolio.json'

/** Parse labels like "217k visitors/month" into a numeric monthly figure. */
export function parseVisitorsLabel(label) {
  if (!label) return 0
  const match = String(label).match(/([\d.]+)\s*([kmb])?/i)
  if (!match) return 0
  const value = Number(match[1])
  if (Number.isNaN(value)) return 0
  const unit = (match[2] || '').toLowerCase()
  if (unit === 'k') return value * 1_000
  if (unit === 'm') return value * 1_000_000
  if (unit === 'b') return value * 1_000_000_000
  return value
}

/** Shopify portfolio projects, highest monthly visitors first. */
export function getWorkPortfolioProjects() {
  return [...(portfolioData.projects ?? [])].sort(
    (a, b) => parseVisitorsLabel(b.visitorsLabel) - parseVisitorsLabel(a.visitorsLabel),
  )
}
