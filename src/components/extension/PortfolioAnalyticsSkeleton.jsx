import CyberCorners from '../CyberCorners'

export default function PortfolioAnalyticsSkeleton({
  kpiCount = 4,
  cardCount = 5,
  label = 'Loading analytics',
}) {
  return (
    <>
      <div className="ext-analytics__kpis" aria-busy="true" aria-label={label}>
        {Array.from({ length: kpiCount }, (_, index) => (
          <div key={`kpi-skel-${index}`} className="ext-kpi CC__cyber-accent ext-kpi--skeleton">
            <CyberCorners />
            <div className="ext-skeleton ext-skeleton--label" />
            <div className="ext-skeleton ext-skeleton--value" />
          </div>
        ))}
      </div>

      <section className="ext-secondary-stats">
        <div className="ext-secondary-stats__grid">
          {Array.from({ length: cardCount }, (_, index) => (
            <div
              key={`card-skel-${index}`}
              className="ext-sec-card CC__cyber-accent ext-sec-card--skeleton"
            >
              <CyberCorners />
              <div className="ext-skeleton ext-skeleton--label" />
              <div className="ext-skeleton ext-skeleton--value" />
              <div className="ext-skeleton ext-skeleton--rows" />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
