import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import PageSEO from '../components/PageSEO'
import CyberCorners from '../components/CyberCorners'
import {
  PROFIT_GOAL,
  formatProfitAmount,
  formatProfitDate,
  getProfitMilestones,
  getProfitProgress,
  isExternalProfitLink,
} from '../utils/profit'
import '../App.css'
import './ProfitPage.css'

function MilestoneLink({ href, children }) {
  if (!href) return null
  if (isExternalProfitLink(href)) {
    return (
      <a
        className="CC__profit-milestone__proof"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  }
  return (
    <Link className="CC__profit-milestone__proof" to={href}>
      {children}
    </Link>
  )
}

export default function ProfitPage() {
  const { total, goal, pct } = getProfitProgress()
  const milestones = getProfitMilestones()
  const trackRef = useRef(null)

  useEffect(() => {
    const root = trackRef.current
    if (!root) return undefined

    const nodes = root.querySelectorAll('[data-reveal]')
    if (!nodes.length || typeof IntersectionObserver === 'undefined') {
      nodes.forEach((node) => node.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [milestones.length])

  return (
    <>
      <PageSEO
        title="Profit Journey to $100K - Coded Citadel"
        description={`Building in public from $0 to $100k. Current profit: ${formatProfitAmount(total)}. Every milestone is public with proof.`}
        canonicalPath="/profit"
      />
      <SiteHeader />

      <main className="CC__profit-page">
        <section className="CC__profit-hero" aria-label="Profit journey hero">
          <div className="CC__profit-hero__atmosphere" aria-hidden="true" />
          <div className="CC__container CC__profit-hero__inner">
            <p className="CC__profit-hero__brand">Coded Citadel</p>
            <h1 className="CC__profit-hero__title">
              The road to{' '}
              <span className="CC__profit-hero__accent">{formatProfitAmount(goal)}</span>
            </h1>
            <p className="CC__profit-hero__lede">
              Every dollar earned on this journey - donations, freelance, products -
              logged in public with proof.
            </p>

            <div className="CC__profit-hero__progress" aria-label="Progress toward goal">
              <div className="CC__profit-hero__progress-meta">
                <span className="CC__profit-hero__progress-now">
                  {formatProfitAmount(total)}
                </span>
                <span className="CC__profit-hero__progress-goal">
                  of {formatProfitAmount(goal)}
                </span>
              </div>
              <div
                className="CC__profit-hero__bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(pct)}
                aria-label={`${pct.toFixed(2)} percent of goal`}
              >
                <div
                  className="CC__profit-hero__bar-fill"
                  style={{ width: `${Math.max(pct, pct > 0 ? 0.8 : 0)}%` }}
                />
              </div>
              <p className="CC__profit-hero__pct">{pct.toFixed(2)}% of the way</p>
            </div>
          </div>
        </section>

        <section className="CC__profit-journey" aria-labelledby="profit-journey-title">
          <div className="CC__container">
            <header className="CC__profit-journey__header">
              <p className="CC__section-eyebrow">Milestones</p>
              <h2 id="profit-journey-title" className="CC__section-title">
                Follow the path
              </h2>
              <p className="CC__profit-journey__intro">
                From zero toward six figures. Scroll the trail - each stop is a real
                receipt.
              </p>
            </header>

            <div
              className="CC__profit-journey__track"
              ref={trackRef}
              style={{ '--milestone-count': milestones.length + 2 }}
            >
              <svg
                className="CC__profit-journey__path"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  className="CC__profit-journey__path-glow"
                  d="M50 0 C 18 8, 18 14, 50 22 S 82 30, 50 38 S 18 46, 50 54 S 82 62, 50 70 S 18 78, 50 86 S 70 94, 50 100"
                  fill="none"
                />
                <path
                  className="CC__profit-journey__path-line"
                  d="M50 0 C 18 8, 18 14, 50 22 S 82 30, 50 38 S 18 46, 50 54 S 82 62, 50 70 S 18 78, 50 86 S 70 94, 50 100"
                  fill="none"
                />
              </svg>

              <ol className="CC__profit-journey__list">
                <li
                  className="CC__profit-milestone CC__profit-milestone--start CC__profit-milestone--left"
                  data-reveal
                >
                  <div className="CC__profit-milestone__rail" aria-hidden="true">
                    <span className="CC__profit-milestone__node" />
                  </div>
                  <div className="CC__profit-milestone__card CC__cyber-accent">
                    <CyberCorners />
                    <p className="CC__profit-milestone__eyebrow">Start</p>
                    <p className="CC__profit-milestone__amount">{formatProfitAmount(0)}</p>
                    <p className="CC__profit-milestone__note">
                      The start of the journey!
                    </p>
                  </div>
                </li>

                {milestones.map((entry, index) => {
                  const side = index % 2 === 0 ? 'right' : 'left'
                  return (
                    <li
                      key={entry.id || `${entry.date}-${entry.amount}-${index}`}
                      className={`CC__profit-milestone CC__profit-milestone--${side}`}
                      data-reveal
                      style={{ '--delay': `${0.08 * (index + 1)}s` }}
                    >
                      <div className="CC__profit-milestone__rail" aria-hidden="true">
                        <span className="CC__profit-milestone__node" />
                      </div>
                      <div className="CC__profit-milestone__card CC__cyber-accent">
                        <CyberCorners />
                        <div className="CC__profit-milestone__meta">
                          <span className="CC__profit-milestone__label">{entry.label}</span>
                          {entry.date ? (
                            <time
                              className="CC__profit-milestone__date"
                              dateTime={entry.date}
                            >
                              {formatProfitDate(entry.date)}
                            </time>
                          ) : null}
                        </div>
                        <p className="CC__profit-milestone__amount">
                          +{formatProfitAmount(entry.amount)}
                        </p>
                        <p className="CC__profit-milestone__running">
                          Running total{' '}
                          <strong>{formatProfitAmount(entry.totalAfter)}</strong>
                        </p>
                        {entry.note ? (
                          <p className="CC__profit-milestone__note">{entry.note}</p>
                        ) : null}
                        <MilestoneLink href={entry.link}>
                          View proof
                          <span aria-hidden="true"> →</span>
                        </MilestoneLink>
                      </div>
                    </li>
                  )
                })}

                <li
                  className="CC__profit-milestone CC__profit-milestone--goal CC__profit-milestone--right"
                  data-reveal
                  style={{ '--delay': `${0.08 * (milestones.length + 1)}s` }}
                >
                  <div className="CC__profit-milestone__rail" aria-hidden="true">
                    <span className="CC__profit-milestone__node CC__profit-milestone__node--goal" />
                  </div>
                  <div className="CC__profit-milestone__card CC__profit-milestone__card--goal CC__cyber-accent">
                    <CyberCorners />
                    <p className="CC__profit-milestone__eyebrow">Destination</p>
                    <p className="CC__profit-milestone__amount">
                      {formatProfitAmount(PROFIT_GOAL)}
                    </p>
                    <p className="CC__profit-milestone__note">
                      Still {formatProfitAmount(Math.max(0, goal - total))} to go. The path
                      keeps going.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
