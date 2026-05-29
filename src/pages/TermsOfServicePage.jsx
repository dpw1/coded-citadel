import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import { getTermsOfServiceBySlug } from '../utils/termsOfService'
import '../App.css'
import './PrivacyPolicyPage.css'

function TermsNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="CC__privacy-page">
        <div className="CC__container CC__privacy-page__inner">
          <h1 className="CC__privacy-page__title">Terms of service not found</h1>
          <p className="CC__privacy-page__meta">No terms match this URL.</p>
          <Link to="/" className="CC__btn CC__btn--primary">
            Back to home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

export default function TermsOfServicePage() {
  const { slug } = useParams()
  const terms = getTermsOfServiceBySlug(slug)

  useEffect(() => {
    if (!terms) {
      document.title = 'Terms of Service — Coded Citadel'
      return () => {
        document.title = 'Coded Citadel'
      }
    }

    document.title = `Terms of Service — ${terms.appName} — Coded Citadel`
    const description = document.querySelector('meta[name="description"]')
    const previousDescription = description?.getAttribute('content') ?? null
    const summary = `Terms of service for ${terms.appName}. Last updated ${terms.lastUpdated}.`
    if (description) description.setAttribute('content', summary)

    return () => {
      document.title = 'Coded Citadel'
      if (description && previousDescription != null) {
        description.setAttribute('content', previousDescription)
      }
    }
  }, [terms])

  if (!terms) return <TermsNotFound />

  const { appName, lastUpdated, contact, Content } = terms

  return (
    <>
      <SiteHeader />
      <main className="CC__privacy-page">
        <article className="CC__container CC__privacy-page__inner">
          <header>
            <h1 className="CC__privacy-page__title">Terms of Service — {appName}</h1>
            <p className="CC__privacy-page__meta">
              Last updated: {lastUpdated}
              <br />
              Contact:{' '}
              <a href={`mailto:${contact}`}>{contact}</a>
            </p>
          </header>
          <div className="CC__privacy__body">
            <Content />
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
