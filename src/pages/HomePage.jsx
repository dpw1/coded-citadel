import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
// import AppsGridSection from '../components/AppsGridSection'
import CyberCorners from '../components/CyberCorners'
import HomePageSEO from '../components/HomePageSEO'
import HomeHeroSection from '../components/home/HomeHeroSection'
import HomeExtensionsSection from '../components/home/HomeExtensionsSection'
import HomeInstagramReelsSection from '../components/home/HomeInstagramReelsSection'
import HomeWebToolsSection from '../components/home/HomeWebToolsSection'
import { scrollToSection } from '../utils/scroll'
import '../App.css'
import './ExtensionLandingPage.css'
import './HomePage.css'

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
    <div className="CC__home">
      <HomePageSEO />
      <SiteHeader />

      <HomeHeroSection />
      <HomeExtensionsSection />
      <HomeInstagramReelsSection />
      <HomeWebToolsSection />

      {/*
      <section className="CC__hero" aria-label="Hero – Building social media and ecom tools in public">
        … legacy photo hero (Senior Dev Building…) — hidden for new homepage layout
      </section>
      */}

      {/*
      <AppsGridSection sectionId="apps" showViewAllLink maxItems={6} />
      */}

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
    </div>
  )
}
