import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const CLOSE_ICON = (
  <svg viewBox="0 0 24 24">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export default function ExtensionVideoModal({ open, videoId, title, titleHref, onClose }) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open || !videoId) return null

  const embedSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
  const isExternal = typeof titleHref === 'string' && /^https?:\/\//i.test(titleHref)

  return (
    <div
      className="CC__modal-backdrop CC__modal-backdrop--open"
      role="dialog"
      aria-modal="true"
      aria-label="Video player"
      onClick={onClose}
    >
      <div className="CC__modal" onClick={(event) => event.stopPropagation()}>
        <div className="CC__modal__header">
          {titleHref ? (
            isExternal ? (
              <a
                className="CC__modal__title CC__modal__title--link"
                href={titleHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {title}
              </a>
            ) : (
              <Link className="CC__modal__title CC__modal__title--link" to={titleHref} onClick={onClose}>
                {title}
              </Link>
            )
          ) : (
            <span className="CC__modal__title">{title}</span>
          )}
          <button type="button" className="CC__modal__close" aria-label="Close video" onClick={onClose}>
            {CLOSE_ICON}
          </button>
        </div>
        <div className="CC__modal__video">
          <iframe
            src={embedSrc}
            title={title}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>
    </div>
  )
}
