import { Link } from 'react-router-dom'
import PageSEO from '../components/PageSEO'
import SiteFooter from '../components/SiteFooter'
import SiteHeader from '../components/SiteHeader'
import '../App.css'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <>
      <PageSEO
        title="Page not found — Coded Citadel"
        description="This page doesn’t exist. Head back to the Coded Citadel homepage."
        canonicalPath="/"
        robots="noindex, follow"
      />
      <SiteHeader />
      <main className="CC__not-found">
        <section className="CC__not-found__section" aria-labelledby="not-found-title">
          <div className="CC__container CC__not-found__inner">
            <p className="CC__section-eyebrow">Error 404</p>
            <h1 id="not-found-title" className="CC__not-found__title">
              Page not found
            </h1>
            <p className="CC__not-found__copy">
              Oops! This URL doesn’t match anything on the site. Still, why not take a look around?
            </p>
            <div className="CC__not-found__actions">
              <Link to="/" className="CC__btn CC__btn--primary">
                Back to home
              </Link>
              <Link to="/apps" className="CC__btn CC__btn--outline">
                Browse apps
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
