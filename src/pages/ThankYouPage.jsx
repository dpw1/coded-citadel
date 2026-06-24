import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import AppsGridSection from '../components/AppsGridSection'
import CyberCorners from '../components/CyberCorners'
import { getAppBySource } from '../utils/apps'
import '../App.css'
import './ThankYouPage.css'

const YOUTUBE_URL = 'https://www.youtube.com/@CodedCitadel'
const CONTACT_EMAIL = 'CodedCitadel@gmail.com'

const YOUTUBE_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z" />
  </svg>
)

export default function ThankYouPage() {
  const [searchParams] = useSearchParams()
  const source = searchParams.get('source')
  const installedApp = useMemo(() => getAppBySource(source), [source])
  const installedName = installedApp?.name?.trim() || 'my extension'

  useEffect(() => {
    document.title = 'Thank You — Coded Citadel'
    return () => {
      document.title = 'Coded Citadel'
    }
  }, [])

  return (
    <>
      <SiteHeader />
      <main className="CC__thank-you-page">
        <div className="CC__container CC__thank-you-welcome-wrap">
          <div className="CC__thank-you-welcome CC__cyber-accent">
            <div className="CC__thank-you-welcome__corners" aria-hidden="true">
              <CyberCorners />
            </div>
            <h2 className="CC__thank-you__title">
              Thank You for Installing {installedName}!
            </h2>

            <p className="CC__thank-you__text">
              This extension is 100% free, and part of my{' '}
              <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer">
                <strong>Coding Until I Make $100k USD challenge</strong>
              </a>
              .
            </p>

            <p className="CC__thank-you__text">
              I coded it in public and documented step-by-step on{' '}
              <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer">
                YouTube
              </a>{' '}
              and <Link to="/blog">Blog</Link>.
            </p>


            <p className="CC__thank-you__text">
              Requests, feedback, bugs?{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </div>
        </div>

        <AppsGridSection
          sectionId="apps"
          excludeSlug={installedApp?.slug ?? null}
          showViewAllLink
          maxItems={6}
          randomize
        />
      </main>
      <SiteFooter />
    </>
  )
}
