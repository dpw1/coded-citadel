import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import PageSEO from '../components/PageSEO'
import { getTermsOfServiceBySlug } from '../utils/termsOfService'
import '../App.css'
import './PrivacyPolicyPage.css'

function TermsNotFound() {
  return (
    <>
      <PageSEO
        title="Terms of Service — Coded Citadel"
        description="Terms of service not found."
        canonicalPath="/terms-of-service"
        robots="noindex, follow"
      />
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

  if (!terms) return <TermsNotFound />

  const { appName, lastUpdated, contact, Content } = terms
  const summary = `Terms of service for ${appName}. Last updated ${lastUpdated}.`

  return (
    <>
      <PageSEO
        title={`Terms of Service — ${appName} — Coded Citadel`}
        description={summary}
        canonicalPath={`/terms-of-service/${slug}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://codedcitadel.com',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Terms of Service',
              item: `https://codedcitadel.com/terms-of-service/${slug}`,
            },
          ],
        }}
      />
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
