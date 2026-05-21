import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import { getPrivacyPolicyBySlug } from '../utils/privacyPolicies'
import '../App.css'
import './PrivacyPolicyPage.css'

function PrivacyNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="CC__privacy-page">
        <div className="CC__container CC__privacy-page__inner">
          <h1 className="CC__privacy-page__title">Privacy policy not found</h1>
          <p className="CC__privacy-page__meta">No policy matches this URL.</p>
          <Link to="/" className="CC__btn CC__btn--primary">
            Back to home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

export default function PrivacyPolicyPage() {
  const { slug } = useParams()
  const policy = getPrivacyPolicyBySlug(slug)

  useEffect(() => {
    if (!policy) {
      document.title = 'Privacy Policy — Coded Citadel'
      return () => {
        document.title = 'Coded Citadel'
      }
    }

    document.title = `Privacy Policy — ${policy.appName} — Coded Citadel`
    const description = document.querySelector('meta[name="description"]')
    const previousDescription = description?.getAttribute('content') ?? null
    const summary = `Privacy policy for ${policy.appName}. Last updated ${policy.lastUpdated}.`
    if (description) description.setAttribute('content', summary)

    return () => {
      document.title = 'Coded Citadel'
      if (description && previousDescription != null) {
        description.setAttribute('content', previousDescription)
      }
    }
  }, [policy])

  if (!policy) return <PrivacyNotFound />

  const { appName, lastUpdated, contact, Content } = policy

  return (
    <>
      <SiteHeader />
      <main className="CC__privacy-page">
        <article className="CC__container CC__privacy-page__inner">
          <header>
            <h1 className="CC__privacy-page__title">Privacy Policy — {appName}</h1>
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
