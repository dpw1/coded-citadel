import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import AppsGridSection from '../components/AppsGridSection'
import { appFilterLabel, getAppBySource } from '../utils/apps'
import '../App.css'
import './PrivacyPolicyPage.css'

export default function ThankYouPage() {
  const [searchParams] = useSearchParams()
  const source = searchParams.get('source')
  const installedApp = useMemo(() => getAppBySource(source), [source])

  useEffect(() => {
    document.title = 'Thank You — Coded Citadel'
    return () => {
      document.title = 'Coded Citadel'
    }
  }, [])

  const headline = installedApp
    ? `Thank you for installing ${appFilterLabel(installedApp)}!`
    : 'Thank you for installing our Chrome extension!'

  const subheadline = installedApp
    ? 'Here are a few other Chrome extensions you might also like:'
    : 'Here are a few other extensions you might also like:'

  return (
    <>
      <SiteHeader />
      <main className="CC__privacy-page">
        <div className="CC__container CC__privacy-page__inner" style={{ maxWidth: 'var(--CC__max-width)' }}>
          <header style={{ marginBottom: '2rem' }}>
            <p className="CC__section-eyebrow">Installation complete</p>
            <h1 className="CC__privacy-page__title">{headline}</h1>
            <p className="CC__privacy-page__meta" style={{ marginBottom: 0 }}>
              {subheadline}
            </p>
          </header>
        </div>
        <AppsGridSection
          sectionId="thank-you-extensions"
          excludeSlug={installedApp?.slug ?? null}
          eyebrow="More from Coded Citadel"
          title="You Might Also Like"
          showViewAllLink
        />
      </main>
      <SiteFooter />
    </>
  )
}
