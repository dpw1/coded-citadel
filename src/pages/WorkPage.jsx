import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import PortfolioAnalyticsSection from '../components/PortfolioAnalyticsSection'
import AppsGridSection from '../components/AppsGridSection'
import WorkPortfolioSection from '../components/WorkPortfolioSection'
import WorkTestimonialsSection from '../components/WorkTestimonialsSection'
import { ContactSection } from './ContactPage'
import PageSEO from '../components/PageSEO'
import '../App.css'
import './ExtensionLandingPage.css'
import './PrivacyPolicyPage.css'
import './StatsPage.css'
import './WorkPage.css'

const FACEBOOK_REVIEWS_URL = 'https://www.facebook.com/diegofortesdev/reviews'
const YOUTUBE_URL = 'https://www.youtube.com/@CodedCitadel'

export default function WorkPage() {
  return (
    <>
      <PageSEO
        title="Work With Diego — Senior Fullstack Dev | Coded Citadel"
        description="Senior software engineer with over a decade of experience in Shopify and fullstack web apps. 12 Chrome extensions in 52 days, $1,400 Shopify project closed. Reviews dating back to 2018."
        canonicalPath="/work"
      />
      <SiteHeader />
      <main className="CC__work-page">
        <div className="CC__container CC__work-page__portfolio">
          <WorkPortfolioSection />
          <AppsGridSection
            sectionId="work-extensions"
            className="CC__work-page__extensions"
            contained={false}
            eyebrow={null}
            title="Chrome Extensions"
            subtitle="15+ extensions, 27k+ active users"
            showInstalls={false}
            showUsers={false}
            showPublished={false}
            showViewMore={false}
            showVideoStat={false}
            sortByInstalls
            maxItems={9}
          />
          <WorkTestimonialsSection />

          <section className="CC__work-about" aria-label="About me">
            <header className="CC__work-about__header">
              <p className="CC__section-eyebrow">About</p>
              <h2 className="CC__section-title">About Me</h2>
            </header>
          </section>
        </div>

        <div className="CC__container CC__work-page__inner">
          <article className="CC__work-page__body">
            <p className="CC__work-page__greeting">Hello!</p>

            <p>
              My name is Diego. I&apos;m a senior software engineer and computer scientist with over a
              decade of experience.
            </p>

            <p>
              My expertise lies in e-commerce (Shopify) and fullstack web apps, however, I have coded
              and worked with many different niches and technologies. 
            </p>

            <p>
              My blogs go in-depth with every work that I do: I explain step-by-step everything and
              include the entire process so you can see exactly how I think.
            </p>

            <p>
              My goal with Coded Citadel is to transparently showcase my work while finding a niche to build useful
              apps/projects.
            </p>

            <p>So far, I was able to:</p>

            <ul className="CC__work-page__list">
              <li>
                Build &amp; deploy 12 chrome extensions within 52 days (documented everything
                step-by-step on my <Link to="/blog">blog</Link> and on{' '}
                <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer">
                  youtube
                </a>
                )
              </li>
              <li>Close a Shopify project for $1400 USD (through Coded Citadel)</li>
            </ul>

            <p>
              If you&apos;re looking to hire a reliable developer, whether you want your project to be
              featured on my page or remain anonymous, feel free to reach out.
            </p>
          </article>
        </div>

        <div className="CC__container CC__home-portfolio-analytics">
          <PortfolioAnalyticsSection idPrefix="work" />
        </div>

        <div className="CC__container CC__work-page__inner CC__work-page__contact">
          <ContactSection idPrefix="work-contact" />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
