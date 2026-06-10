import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import AppsGridSection from '../components/AppsGridSection'
import YoutubeSection from '../components/YoutubeSection'
import LiveStatsBar from '../components/LiveStatsBar'
import CyberCorners from '../components/CyberCorners'
import HomePageSEO from '../components/HomePageSEO'
import { scrollToSection } from '../utils/scroll'
import '../App.css'

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

      <section className="CC__hero" aria-label="Hero – Code to $100K">
        <div className="CC__hero__image" aria-hidden="true">
          <picture>
            <source
              media="(max-width: 768px)"
              srcSet={`${import.meta.env.BASE_URL}diego-hero-mobile.png`}
            />
            <img
              src={`${import.meta.env.BASE_URL}diego-hero.png`}
              alt="Diego — Coded Citadel founder on the $100K journey"
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
              Follow the
              <br />
              Journey of a Man
              <br />
              Coding His Way
              <br />
              to <span className="CC__hero__headline-accent">$100K</span>
            </h1>

            <p className="CC__hero__sub">
            This is not marketing. Not a "making X in Y days" type of video to sell you some course. This my true, transparent journey: a senior dev going from $0 to $100k.
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

      <AppsGridSection sectionId="apps" showViewAllLink />

      <YoutubeSection />

      <section id="about" className="CC__about CC__container">
        <div className="CC__about-grid">
          <div className="CC__about-content">
            <p className="CC__section-eyebrow">About Me</p>
            <h2 className="CC__section-title">Welcome!</h2>
            <p className="CC__about-text">
            My name is Diego. I'm a senior software engineer and computer scientist with over a decade of experience. I have always had the desire to start a project of the "going from 0 to X USD" sort, but I was never completely sure what exactly I should do or how to make progress with it. And that hasn't changed: I still have no clue. All I know is that the only way through is forward. So join me on my journey, and let's see where it leads us.
            </p>
            
    
          </div>
          <div
            className={`CC__about-image-frame CC__cyber-accent${avatarError ? ' CC__about-image-frame--empty' : ''}`}
          >
            <CyberCorners />
            {!avatarError ? (
              <img
                src={`${import.meta.env.BASE_URL}avatar-citadel.png`}
                alt="Coded Citadel Dev Portrait"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span>Add portrait as public/avatar-citadel.png</span>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
