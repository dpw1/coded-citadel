import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import PageSEO from '../components/PageSEO'
import { getPrivacyPolicyBySlug } from '../utils/privacyPolicies'
import '../App.css'
import './PrivacyPolicyPage.css'

function PrivacyNotFound() {
  return (
    <>
      <PageSEO
        title="Privacy Policy — Coded Citadel"
        description="Privacy policy not found."
        canonicalPath="/privacy-policy"
        robots="noindex, follow"
      />
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

  if (!policy) return <PrivacyNotFound />

  const { appName, lastUpdated, contact, Content } = policy
  const summary = `Privacy policy for ${appName}. Last updated ${lastUpdated}.`

  return (
    <>
      <PageSEO
        title={`Privacy Policy — ${appName} — Coded Citadel`}
        description={summary}
        canonicalPath={`/privacy-policy/${slug}`}
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
              name: 'Privacy Policy',
              item: `https://codedcitadel.com/privacy-policy/${slug}`,
            },
          ],
        }}
      />
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
