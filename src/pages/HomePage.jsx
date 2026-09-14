import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import AppsGridSection from '../components/AppsGridSection'
import YoutubeSection from '../components/YoutubeSection'
import LiveStatsBar from '../components/LiveStatsBar'
import PortfolioAnalyticsSection from '../components/PortfolioAnalyticsSection'
import CyberCorners from '../components/CyberCorners'
import HomePageSEO from '../components/HomePageSEO'
import { scrollToSection } from '../utils/scroll'
import '../App.css'
import './ExtensionLandingPage.css'
import './StatsPage.css'

export default function HomePage() {
  const [avatarError, setAvatarError] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const sectionId =
      location.hash === '#about' || location.state?.scrollTo === 'about'
        ? 'about'
        : location.hash === '#youtube' || location.state?.scrollTo === 'youtube'
          ? 'youtube'
          : null
    if (!sectionId) return undefined

    const timer = window.setTimeout(() => {
      scrollToSection(sectionId, { updateHash: true })
    }, 50)

    return () => window.clearTimeout(timer)
  }, [location.hash, location.state])

  return (
    <>
      <HomePageSEO />
      <SiteHeader />

      <section className="CC__hero" aria-label="Hero – Building social media and ecom tools in public">
        <div className="CC__hero__image" aria-hidden="true">
          <picture>
            <source
              media="(max-width: 768px)"
              srcSet={`${import.meta.env.BASE_URL}diego-hero-mobile.png`}
            />
            <img
              src={`${import.meta.env.BASE_URL}diego-hero.png`}
              alt="Diego — Coded Citadel founder building social media and ecom tools in public"
            />
          </picture>
        </div>

        <div className="CC__hero__inner">
          <div className="CC__hero__rail" aria-hidden="true">
            <div className="CC__hero__rail-line" />
            <div className="CC__hero__rail-dots">
              <span className="CC__hero__rail-dot" />
              <span className="CC__hero__rail-dot" />
              <span className="CC__hero__rail-dot" />
              <span className="CC__hero__rail-dot" />
            </div>
          </div>

          <div className="CC__hero__content">
            <div className="CC__hero__tag">
              <span className="CC__hero__tag-dot" aria-hidden="true" />
              <span className="CC__hero__tag-text">Building in Public</span>
            </div>
            <h1 className="CC__hero__headline">
              Senior Dev Building
              <br />
              <span className="CC__hero__headline-accent">Social Media</span>
              <br />
              &amp; Ecom Tools
              <br />
              in Public
            </h1>

            <p className="CC__hero__sub">
              Free Chrome extensions for Instagram, YouTube, and ecommerce —
              shipped in public with live install stats and YouTube build logs.
            </p>

            <div className="CC__hero__actions">
              <a
                href="https://www.youtube.com/@CodedCitadel"
                target="_blank"
                rel="noopener noreferrer"
                className="CC__hero__btn CC__hero__btn--primary"
                aria-label="Watch on Youtube"
              >
                <span className="CC__hero__btn-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z" />
                  </svg>
                </span>
                Watch on Youtube
              </a>
              <Link to="/apps" className="CC__hero__btn CC__hero__btn--secondary" aria-label="View Apps">
                <span className="CC__hero__btn-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </span>
                View Apps
              </Link>
              <Link to="/live-stats" className="CC__hero__btn CC__hero__btn--secondary" aria-label="View stats">
                <span className="CC__hero__btn-icon" aria-hidden="true">
                  🔥
                </span>
                View Stats
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LiveStatsBar />

      <AppsGridSection sectionId="apps" showViewAllLink maxItems={6} />

      <div className="CC__home-youtube">
        <YoutubeSection />
      </div>

      <div className="CC__container CC__home-portfolio-analytics">
  
        <PortfolioAnalyticsSection idPrefix="home" />
      </div>

      <section id="about" className="CC__about CC__container">
        <div className="CC__about-grid">
          <div className="CC__about-content">
            <p className="CC__section-eyebrow">About Me</p>
            <h2 className="CC__section-title">Welcome!</h2>
            <p className="CC__about-text">
              My name is Diego. I&apos;m a senior software engineer and computer
              scientist with over a decade of experience in ecommerce and SaaS.
              At Coded Citadel I build social media and ecommerce tools in public —
              documenting the research, the bugs, and the launches so you can
              follow along.
            </p>
            
    
          </div>
          <div
            className={`CC__about-image-frame CC__cyber-accent${avatarError ? ' CC__about-image-frame--empty' : ''}`}
          >
            <CyberCorners />
            {!avatarError ? (
              <img
                src={`${import.meta.env.BASE_URL}avatar-citadel.jpg`}
                alt="Diego — Coded Citadel"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span>Add portrait as public/avatar-citadel.jpg</span>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
