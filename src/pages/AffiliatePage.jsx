import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import AffiliateForm from '../components/AffiliateForm'
import PageSEO from '../components/PageSEO'
import '../App.css'
import './PrivacyPolicyPage.css'
import './AffiliatePage.css'

const STEPS = [
  {
    title: 'Apply',
    body: 'Fill out the form below with your details and how you plan to promote YouTube Filter Pro.',
  },
  {
    title: 'Get approved',
    body: 'Applications are reviewed manually. If approved, you’ll get a personal promo code by email.',
  },
  {
    title: 'Share & earn',
    body: 'Earn 20% commission on sales made with your code. Lemon Squeezy handles checkout, your affiliate dashboard, and monthly payouts.',
  },
]

export default function AffiliatePage() {
  return (
    <>
      <PageSEO
        title="Affiliate Program — YouTube Filter Pro | Coded Citadel"
        description="Apply to the YouTube Filter Pro affiliate program. Share your promo code and earn 20% commission on sales. Manual review — no instant signup."
        canonicalPath="/affiliate"
      />
      <SiteHeader />
      <main className="CC__privacy-page CC__affiliate-page">
        <div className="CC__container CC__privacy-page__inner">
          <header>
            <p className="CC__section-eyebrow">YouTube Filter Pro</p>
            <h1 className="CC__privacy-page__title">Become an Affiliate</h1>
            <p className="CC__privacy-page__meta">
              If you create content or have an audience interested in YouTube research and
              filtering tools, you can earn a <strong>20% commission</strong> by sharing{' '}
              <Link to="/apps/youtube-filter-pro">YouTube Filter Pro</Link> with your own
              promo code. Applications are reviewed manually.
            </p>
          </header>

          <section className="CC__affiliate-page__steps" aria-labelledby="affiliate-how-it-works">
            <h2 id="affiliate-how-it-works" className="CC__affiliate-page__steps-title">
              How it works
            </h2>
            <ol className="CC__affiliate-page__steps-list">
              {STEPS.map((step, index) => (
                <li key={step.title} className="CC__affiliate-page__step">
                  <span className="CC__affiliate-page__step-num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="CC__affiliate-page__step-title">{step.title}</h3>
                    <p className="CC__affiliate-page__step-body">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="CC__privacy__body" aria-labelledby="affiliate-apply">
            <h2 id="affiliate-apply">Apply</h2>
            <AffiliateForm idPrefix="affiliate-page" />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
