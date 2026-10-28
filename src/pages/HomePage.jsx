import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import AppsGridSection from '../components/AppsGridSection'
import CyberCorners from '../components/CyberCorners'
import HomePageSEO from '../components/HomePageSEO'
import { scrollToSection } from '../utils/scroll'
import '../App.css'
import './ExtensionLandingPage.css'

export default function HomePage() {
  const [avatarError, setAvatarError] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const sectionId =
      location.hash === '#about' || location.state?.scrollTo === 'about' ? 'about' : null
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
                href="https://www.instagram.com/codedcitadel"
                target="_blank"
                rel="noopener noreferrer"
                className="CC__hero__btn CC__hero__btn--primary"
                aria-label="View on Instagram"
              >
                <span className="CC__hero__btn-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </span>
                View on Instagram
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
            </div>
          </div>
        </div>
      </section>

      <AppsGridSection sectionId="apps" showViewAllLink maxItems={6} />

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
