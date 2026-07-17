import { useCallback, useEffect, useRef, useState } from 'react'
import portfolioData from '../data/work-portfolio.json'
import './WorkPortfolioSection.css'

const CLOSE_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

const projects = portfolioData.projects ?? []

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
    if (!activeProject || !videoRef.current) return

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
                aria-label={`Watch ${project.title} project video`}
              >
                <video
                  className="CC__work-portfolio-card__thumb"
                  src={project.video}
                  muted
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                />
                <span className="CC__work-portfolio-card__play" aria-hidden="true">
                  ▶
                </span>
              </button>
              <div className="CC__work-portfolio-card__overlay">
                <span className="CC__work-portfolio-card__name">{project.title}</span>
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
          aria-label={`${activeProject.title} project video`}
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
                aria-label="Close video"
                onClick={closeModal}
              >
                {CLOSE_ICON}
              </button>
            </div>

            <video
              ref={videoRef}
              className="CC__work-portfolio-modal__video"
              controls
              playsInline
            />

            <div className="CC__work-portfolio-modal__info">
              {activeProject.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <a
                href={activeProject.link}
                target="_blank"
                rel="noopener noreferrer"
                className="CC__work-portfolio-modal__link"
              >
                View live site: {activeProject.linkLabel} →
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
