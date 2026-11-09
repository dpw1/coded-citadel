import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import PageSEO from '../components/PageSEO'
import { getPrivacyPolicyIndexEntries } from '../utils/privacyPolicies'
import '../App.css'
import './PrivacyPolicyPage.css'

export default function PrivacyPoliciesIndexPage() {
  const policies = getPrivacyPolicyIndexEntries()

  return (
    <>
      <PageSEO
        title="Privacy Policies — Coded Citadel"
        description="Privacy policies for Coded Citadel Chrome extensions and related products."
        canonicalPath="/privacy-policies"
      />
      <SiteHeader />
      <main className="CC__privacy-page">
        <article className="CC__container CC__privacy-page__inner">
          <header>
            <h1 className="CC__privacy-page__title">Privacy policies</h1>
            <p className="CC__privacy-page__meta">
              Policies for our extensions and tools. Each product has its own document; choose the
              one that matches what you use.
            </p>
          </header>
          <ul className="CC__privacy-page__list">
            {policies.map(({ slug, appName, lastUpdated }) => (
              <li key={slug}>
                <Link to={`/privacy-policy/${slug}`} className="CC__privacy-page__list-link">
                  <span className="CC__privacy-page__list-title">{appName}</span>
                  <span className="CC__privacy-page__list-meta">Last updated {lastUpdated}</span>
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
