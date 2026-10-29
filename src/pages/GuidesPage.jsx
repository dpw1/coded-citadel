import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageSEO from '../components/PageSEO'
import LinksHubCell from '../components/linksHub/LinksHubCell'
import LinksHubHero from '../components/linksHub/LinksHubHero'
import LinksHubSocial from '../components/linksHub/LinksHubSocial'
import {
  getGuideBySlug,
  getGuides,
  hasGuideContent,
  isGuideRedirect,
} from '../utils/guides'
import '../App.css'
import '../components/linksHub/linksHub.css'
import './GuidesPage.css'

const GUIDES_INDEX_DESCRIPTION =
  'Quick guides from Coded Citadel — tap a topic to read the full guide.'

function openGuideRedirect(redirectUrl) {
  window.location.assign(redirectUrl)
}

export default function GuidesPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const guides = getGuides()
  const activeGuide = getGuideBySlug(slug)
  const showingDetail = Boolean(
    slug && activeGuide && hasGuideContent(activeGuide) && !isGuideRedirect(activeGuide),
  )

  useEffect(() => {
    if (slug && !activeGuide) {
      navigate('/guides', { replace: true })
      return
    }
    if (activeGuide?.redirectUrl) {
      openGuideRedirect(activeGuide.redirectUrl)
    }
  }, [slug, activeGuide, navigate])

  const seoTitle = activeGuide
    ? `${activeGuide.title} — Guides — Coded Citadel`
    : 'Guides — Coded Citadel'
  const seoDescription = activeGuide?.subtitle ?? GUIDES_INDEX_DESCRIPTION
  const canonicalPath = activeGuide ? `/guides/${activeGuide.url}` : '/guides'

  function handleGuideActivate(guide) {
    if (isGuideRedirect(guide)) {
      openGuideRedirect(guide.redirectUrl)
      return
    }
    navigate(`/guides/${guide.url}`)
  }

  return (
    <>
      <PageSEO title={seoTitle} description={seoDescription} canonicalPath={canonicalPath} />
      <main className="CC__links-page CC__guides-page">
        <div className="CC__links-page__inner CC__guides-page__inner">
          <div
            className={`CC__guides-slider${showingDetail ? ' CC__guides-slider--detail' : ''}`}
          >
            <div className="CC__guides-slider__track">
              <div className="CC__guides-slider__panel CC__guides-slider__panel--list">
                <LinksHubHero
                  title="Coded Citadel"
                  description="Collection of tutorials & useful tools."
                />
                <nav className="CC__links-list" aria-label="Guides">
                  {guides.map((guide) => (
                    <LinksHubCell
                      key={guide.url}
                      as="button"
                      type="button"
                      title={guide.title}
                      subtitle={guide.subtitle}
                      imageUrl={guide.image}
                      imageAlt=""
                      onClick={() => handleGuideActivate(guide)}
                    />
                  ))}
                </nav>
              </div>

              <div
                className="CC__guides-slider__panel CC__guides-slider__panel--detail"
                aria-hidden={!showingDetail}
              >
                {activeGuide && showingDetail ? (
                  <article className="CC__guides-detail">
                    <button
                      type="button"
                      className="CC__guides-detail__back"
                      onClick={() => navigate('/guides')}
                    >
                      ← Back
                    </button>
                    <h1 className="CC__guides-detail__title">{activeGuide.title}</h1>
                    <div
                      className="CC__guides-detail__content"
                      dangerouslySetInnerHTML={{ __html: activeGuide.content }}
                    />
                  </article>
                ) : null}
              </div>
            </div>
          </div>
          <LinksHubSocial />
        </div>
      </main>
    </>
  )
}
