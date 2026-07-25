import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import PortfolioAnalyticsSection from '../components/PortfolioAnalyticsSection'
import WorkRecentTabsSection from '../components/WorkRecentTabsSection'
// import AppsGridSection from '../components/AppsGridSection'
// import WorkPortfolioSection from '../components/WorkPortfolioSection'
import WorkTestimonialsSection from '../components/WorkTestimonialsSection'
import { ContactSection } from './ContactPage'
import PageSEO from '../components/PageSEO'
import { youtubeEmbedId } from '../utils/apps'
import { Link } from 'react-router-dom'
import '../App.css'
import './ExtensionLandingPage.css'
import './PrivacyPolicyPage.css'
import './StatsPage.css'
import './WorkPage.css'

const STORY_YOUTUBE_URL = 'https://youtu.be/J55nTKwjIt8'
const STORY_EMBED_ID = youtubeEmbedId(STORY_YOUTUBE_URL)

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
          <section className="CC__work-story" aria-label="My story">
            <div className="CC__work-story__layout">
              <div className="CC__work-story__copy">
                <p className="CC__section-eyebrow">My Story</p>
                <h2 className="CC__section-title">10+ years of coding, now in public</h2>
                <ul className="CC__work-story__list">
                  <li>
                    Worked with brands like <strong>McDonald&apos;s</strong> and{' '}
                    <strong>Heineken</strong> on my first job as a dev, back in 2016
                  </li>
                  <li>
                    Almost a decade of Shopify development, building stores with now thousands of
                    visitors
                  </li>
                  <li>
                    Currently building in public (shipped 12 Chrome extensions within 2 months &amp; 1
                    Shopify store —{' '}
                    <Link to="/blog/my-first-sale" className="CC__work-story__link">
                      read the blog
                    </Link>
                    )
                  </li>
                  <li>Looking for new opportunities!</li>
                </ul>
              </div>
              {STORY_EMBED_ID ? (
                <div className="CC__work-story__media">
                  <div className="CC__work-story__video">
                    <iframe
                      title="My story — introduction video"
                      src={`https://www.youtube.com/embed/${STORY_EMBED_ID}?rel=0&modestbranding=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <WorkRecentTabsSection />
          {/* <WorkPortfolioSection />
          <AppsGridSection
            sectionId="work-extensions"
            className="CC__work-page__extensions"
            contained={false}
            eyebrow={null}
            title="Chrome Extensions"
            subtitle="Every single extension has been thoroughly documented on my blog, from how I found the idea, validated it, coded it and deployed."
            showInstalls={false}
            showUsers={false}
            showPublished={false}
            showViewMore={false}
            showVideoStat={false}
            showBlogLink
            showStoreDownload
            sortByInstalls
            maxItems={9}
          /> */}
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

            <dl className="CC__work-page__skills">
              <div className="CC__work-page__skills-row">
                <dt>Frontend</dt>
                <dd>JavaScript, TypeScript, React, Next.js, Tailwind CSS, HTML5/CSS3</dd>
              </div>
              <div className="CC__work-page__skills-row">
                <dt>Backend</dt>
                <dd>Node.js, Express, REST APIs, GraphQL</dd>
              </div>
              <div className="CC__work-page__skills-row">
                <dt>Databases</dt>
                <dd>PostgreSQL, MongoDB, Redis, Prisma</dd>
              </div>
              <div className="CC__work-page__skills-row">
                <dt>DevOps &amp; Cloud</dt>
                <dd>Docker, AWS/GCP, CI/CD (GitHub Actions), Git</dd>
              </div>
              <div className="CC__work-page__skills-row">
                <dt>Other</dt>
                <dd>
                  System Design, OAuth/JWT Authentication, Testing (Jest, Playwright), AI/LLM
                  Integration
                </dd>
              </div>
            </dl>

            <p>
              My blogs go in-depth with every work that I do: I explain step-by-step everything and
              include the entire process so you can see exactly how I think.
            </p>

            <p>
              My goal with Coded Citadel is to transparently showcase my work while finding a niche to build useful
              apps/projects.
            </p>

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
