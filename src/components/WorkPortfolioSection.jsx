import { useCallback, useEffect, useRef, useState } from 'react'
import { WorkPortfolioDescription } from './WorkPortfolioDescription'
import { getWorkPortfolioProjects } from '../utils/workPortfolio'
import './WorkPortfolioSection.css'

const CLOSE_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

const SHOPIFY_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#95BF46"
      d="M19.932 4.673a.233.233 0 0 0-.21-.195l-1.932-.144-1.422-1.413c-.141-.141-.415-.098-.522-.067l-.717.221C14.701 1.844 13.946.712 12.617.712c-.037 0-.074.001-.112.004C12.128.217 11.66 0 11.255 0 8.16 0 6.681 3.869 6.218 5.836c-1.203.372-2.057.637-2.166.672-.672.21-.693.231-.781.864-.067.479-1.823 14.063-1.823 14.063L15.136 24l7.417-1.604-2.621-17.723zM14.373 3.31l-1.158.358.001-.25c0-.765-.106-1.382-.277-1.87.685.087 1.141.866 1.434 1.762zM12.09 1.701c.19.477.314 1.161.314 2.085l-.001.134-2.392.741c.461-1.778 1.324-2.636 2.079-2.96zM11.17.83c.134 0 .268.045.397.134-.992.467-2.055 1.642-2.504 3.99l-1.891.586C7.698 3.749 8.947.83 11.17.83z"
    />
    <path
      fill="#5E8E3E"
      d="m19.723 4.478-1.932-.144-1.422-1.413a.36.36 0 0 0-.198-.091L15.136 24l7.416-1.604s-2.604-17.602-2.62-17.723a.232.232 0 0 0-.209-.195z"
    />
    <path
      fill="#FFF"
      d="m12.618 8.576-.914 2.72s-.801-.428-1.783-.428c-1.44 0-1.512.904-1.512 1.131 0 1.242 3.239 1.718 3.239 4.629 0 2.29-1.452 3.764-3.41 3.764-2.35 0-3.551-1.462-3.551-1.462l.629-2.079s1.235 1.06 2.277 1.06c.681 0 .958-.536.958-.928 0-1.621-2.657-1.693-2.657-4.356 0-2.241 1.609-4.41 4.856-4.41 1.25.001 1.868.359 1.868.359z"
    />
  </svg>
)

const projects = getWorkPortfolioProjects()

export default function WorkPortfolioSection() {
  const [activeProject, setActiveProject] = useState(null)
  const videoRef = useRef(null)

  const closeModal = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.removeAttribute('src')
      videoRef.current.load()
    }
    setActiveProject(null)
  }, [])

  useEffect(() => {
    if (!activeProject) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeModal()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeProject, closeModal])

  useEffect(() => {
    if (!activeProject?.video || !videoRef.current) return

    videoRef.current.src = activeProject.video
    videoRef.current.load()
    videoRef.current.play().catch(() => {})
  }, [activeProject])

  return (
    <>
      <section className="CC__work-portfolio" aria-label="Recent work">
        <div className="CC__work-portfolio__header">
          <p className="CC__section-eyebrow">Portfolio</p>
          <h2 className="CC__section-title">Recent Work</h2>
          <p className="CC__work-portfolio__subtitle">
            Working with Global brands since 2018, coding websites from scratch hosting thousands of
            visitors. Numbers verifiable via SimilarWeb.
          </p>
        </div>

        <div className="CC__work-portfolio__grid">
          {projects.map((project) => (
            <article key={project.id} className="CC__work-portfolio-card">
              <button
                type="button"
                className="CC__work-portfolio-card__hit"
                onClick={() => setActiveProject(project)}
                aria-label={
                  project.video
                    ? `Watch ${project.title} project video`
                    : `View ${project.title} case study`
                }
              >
                {project.video ? (
                  <video
                    className="CC__work-portfolio-card__thumb"
                    src={project.video}
                    muted
                    playsInline
                    preload="metadata"
                    aria-hidden="true"
                  />
                ) : project.image ? (
                  <img
                    className="CC__work-portfolio-card__thumb"
                    src={project.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div
                    className="CC__work-portfolio-card__thumb CC__work-portfolio-card__thumb--placeholder"
                    aria-hidden="true"
                  />
                )}
                {project.video ? (
                  <span className="CC__work-portfolio-card__play" aria-hidden="true">
                    ▶
                  </span>
                ) : project.image ? null : (
                  <span className="CC__work-portfolio-card__placeholder-mark" aria-hidden="true">
                    {SHOPIFY_ICON}
                  </span>
                )}
              </button>
              <div className="CC__work-portfolio-card__overlay">
                <span className="CC__work-portfolio-card__name">
                  <span className="CC__work-portfolio-card__name-icon" aria-hidden="true">
                    {SHOPIFY_ICON}
                  </span>
                  {project.title}
                </span>
                <span className="CC__work-portfolio-card__tag">
                  {project.platform}
                  {' · '}
                  <a
                    className="CC__work-portfolio-card__visitors"
                    href={project.similarwebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.visitorsLabel}
                  </a>
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {activeProject ? (
        <div
          className="CC__modal-backdrop CC__modal-backdrop--open CC__work-portfolio-modal"
          role="dialog"
          aria-modal="true"
          aria-label={
            activeProject.video
              ? `${activeProject.title} project video`
              : `${activeProject.title} case study`
          }
          onClick={closeModal}
        >
          <div className="CC__modal CC__work-portfolio-modal__box" onClick={(event) => event.stopPropagation()}>
            <div className="CC__modal__header">
              <a
                className="CC__modal__title CC__modal__title--link"
                href={activeProject.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {activeProject.title}
              </a>
              <button
                type="button"
                className="CC__modal__close"
                aria-label="Close"
                onClick={closeModal}
              >
                {CLOSE_ICON}
              </button>
            </div>

            <div
              className={`CC__work-portfolio-modal__body${
                activeProject.video || activeProject.image
                  ? ''
                  : ' CC__work-portfolio-modal__body--text-only'
              }`}
            >
              {activeProject.video ? (
                <video
                  ref={videoRef}
                  className="CC__work-portfolio-modal__video"
                  controls
                  playsInline
                />
              ) : activeProject.image ? (
                <img
                  className="CC__work-portfolio-modal__hero-image"
                  src={activeProject.image}
                  alt={`${activeProject.title} project screenshot`}
                  loading="eager"
                  decoding="async"
                />
              ) : null}

              <div className="CC__work-portfolio-modal__info">
                {activeProject.meta ? (
                  <p className="CC__work-portfolio-modal__meta">
                    {activeProject.meta}
                    {activeProject.instagramHandle && activeProject.instagramUrl ? (
                      <>
                        {' '}
                        <a
                          href={activeProject.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {activeProject.instagramHandle}
                        </a>
                      </>
                    ) : null}
                  </p>
                ) : null}
                <WorkPortfolioDescription description={activeProject.description} />
              </div>
            </div>

            <div className="CC__work-portfolio-modal__actions">
              <a
                href={activeProject.link}
                target="_blank"
                rel="noopener noreferrer"
                className="CC__work-portfolio-modal__link"
              >
                View live site: {activeProject.linkLabel} →
              </a>
              {activeProject.similarwebUrl ? (
                <a
                  href={activeProject.similarwebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="CC__work-portfolio-modal__link"
                >
                  View monthly visitors →
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
