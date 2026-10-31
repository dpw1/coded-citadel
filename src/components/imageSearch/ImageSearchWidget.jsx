import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ACCEPT_ATTR,
  LINK_TTL_MS,
  MESSAGES,
  STATUSES,
  isUploadConfigured,
} from '../../utils/imageSearch/constants'
import { buildEngineUrl, engineLabel, enginesFor } from '../../utils/imageSearch/engines'
import { deleteUpload, errorKeyFor, uploadFile } from '../../utils/imageSearch/upload'
import { isSearchableUrl, validateFile } from '../../utils/imageSearch/validation'
import './ImageSearchWidget.css'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="CC__image-search__header-icon" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ImagePlaceholderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="CC__image-search__drop-icon" aria-hidden="true">
      <rect x="3" y="4" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="m4 16 4.5-4.5 3 3 3-3L20 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export default function ImageSearchWidget() {
  const fileRef = useRef(null)
  const expiryTimerRef = useRef(null)
  const objectUrlRef = useRef(null)
  const uploadKeyRef = useRef(null)

  const [ready, setReady] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [errorKey, setErrorKey] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [thumbSrc, setThumbSrc] = useState('')
  const [thumbVisible, setThumbVisible] = useState(false)
  const [engineLinks, setEngineLinks] = useState([])
  const [busy, setBusy] = useState(false)

  const engines = useMemo(() => enginesFor(), [])
  const uploadsEnabled = isUploadConfigured()

  const clearExpiryTimer = useCallback(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current)
      expiryTimerRef.current = null
    }
  }, [])

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])

  const showError = useCallback((key) => {
    setErrorKey(key)
    setShowResults(false)
    setEngineLinks([])
    setStatusText('')
  }, [])

  const renderEngineLinks = useCallback(
    (imageUrl) => {
      setEngineLinks(
        engines.map((engine) => ({
          id: engine.id,
          href: buildEngineUrl(engine.template, imageUrl),
          label: engineLabel(engine),
          icon: engine.icon,
          borderClass: engine.borderClass,
        })),
      )
    },
    [engines],
  )

  const startExpiryTimer = useCallback(
    (key) => {
      clearExpiryTimer()
      uploadKeyRef.current = key
      expiryTimerRef.current = setTimeout(() => {
        setEngineLinks([])
        showError('expired')
        if (key) {
          deleteUpload(key)
        }
        uploadKeyRef.current = null
      }, LINK_TTL_MS)
    },
    [clearExpiryTimer, showError],
  )

  const revealResults = useCallback(() => {
    setShowResults(true)
    setErrorKey(null)
    requestAnimationFrame(() => {
      const el = document.getElementById('search')
      if (!el) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' })
    })
  }, [])

  const handleFile = useCallback(
    async (file) => {
      if (!file) return
      const validation = validateFile(file)
      if (!validation.valid) {
        showError(validation.reason)
        return
      }

      if (!uploadsEnabled) {
        showError('unavailable')
        return
      }

      clearExpiryTimer()
      revokeObjectUrl()
      setBusy(true)
      setErrorKey(null)

      const objectUrl = URL.createObjectURL(file)
      objectUrlRef.current = objectUrl
      setThumbSrc(objectUrl)
      setThumbVisible(false)
      revealResults()
      setStatusText(STATUSES.uploading)

      try {
        const { getUrl, key } = await uploadFile(file)
        setStatusText(STATUSES.ready)
        renderEngineLinks(getUrl)
        startExpiryTimer(key)
      } catch (err) {
        revokeObjectUrl()
        setThumbSrc('')
        setShowResults(false)
        showError(errorKeyFor(err))
      } finally {
        setBusy(false)
      }
    },
    [
      clearExpiryTimer,
      renderEngineLinks,
      revealResults,
      revokeObjectUrl,
      showError,
      startExpiryTimer,
      uploadsEnabled,
    ],
  )

  const onChooseFile = useCallback(
    (event) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      const file = event.dataTransfer?.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
  }, [])

  const onPaste = useCallback(
    (event) => {
      const file = event.clipboardData?.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const onSearchUrl = useCallback(
    (event) => {
      event.preventDefault()
      clearExpiryTimer()
      uploadKeyRef.current = null
      setErrorKey(null)

      const value = urlValue.trim()
      if (!isSearchableUrl(value)) {
        showError('invalidUrl')
        return
      }

      setThumbSrc(value)
      setThumbVisible(false)
      setStatusText('')
      renderEngineLinks(value)
      revealResults()
    },
    [clearExpiryTimer, renderEngineLinks, revealResults, showError, urlValue],
  )

  const reset = useCallback(() => {
    clearExpiryTimer()
    if (uploadKeyRef.current) {
      deleteUpload(uploadKeyRef.current)
    }
    uploadKeyRef.current = null
    revokeObjectUrl()
    setShowResults(false)
    setErrorKey(null)
    setUrlValue('')
    setStatusText('')
    setThumbSrc('')
    setThumbVisible(false)
    setEngineLinks([])
    if (fileRef.current) fileRef.current.value = ''
  }, [clearExpiryTimer, revokeObjectUrl])

  useEffect(() => {
    setReady(true)
    document.addEventListener('paste', onPaste)

    const onPageHide = () => {
      const key = uploadKeyRef.current
      if (key) deleteUpload(key)
    }
    window.addEventListener('pagehide', onPageHide)

    return () => {
      document.removeEventListener('paste', onPaste)
      window.removeEventListener('pagehide', onPageHide)
      clearExpiryTimer()
      revokeObjectUrl()
    }
  }, [clearExpiryTimer, onPaste, revokeObjectUrl])

  const errorMessage = errorKey ? MESSAGES[errorKey] : null

  return (
    <section
      id="search"
      className="CC__image-search"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="CC__image-search__header">
        <SearchIcon />
        <h2 className="CC__image-search__header-title">Search any image</h2>
      </div>

      <div className="CC__image-search__body">
        <fieldset className="CC__image-search__controls" disabled={!ready || busy} aria-busy={busy}>
          <div className="CC__image-search__dropzone">
            <ImagePlaceholderIcon />
            <p className="CC__image-search__drop-label">Drop, paste, or choose an image</p>
            <label className="CC__image-search__choose">
              <svg viewBox="0 0 24 24" fill="none" className="CC__image-search__choose-icon" aria-hidden="true">
                <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="m8 8 4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path
                  d="M4 16v2.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Choose image
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT_ATTR}
                className="CC__image-search__file-input"
                onChange={onChooseFile}
              />
            </label>
          </div>

          <div className="CC__image-search__url-divider">
            <span className="CC__image-search__url-divider-line" />
            <span className="CC__image-search__url-divider-text">or paste an image URL</span>
            <span className="CC__image-search__url-divider-line" />
          </div>

          <form className="CC__image-search__url-form" onSubmit={onSearchUrl}>
            <input
              type="url"
              inputMode="url"
              placeholder="https://example.com/photo.jpg"
              className="CC__image-search__url-input"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
            />
            <button type="submit" className="CC__image-search__url-submit">
              Search this URL
            </button>
          </form>
        </fieldset>

        <p className="CC__image-search__privacy">
          Your image is uploaded so the search engines can fetch it. The link expires after 15 minutes,
          and the file is deleted automatically.
        </p>

        {!uploadsEnabled ? (
          <p className="CC__image-search__notice">
            File upload is not configured on this build — paste a public image URL below to search.
          </p>
        ) : null}

        {errorMessage ? (
          <p className="CC__image-search__error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {showResults ? (
          <div className="CC__image-search__results">
            <div className="CC__image-search__results-head">
              <img
                alt=""
                width={56}
                height={56}
                className={`CC__image-search__thumb${thumbVisible ? ' CC__image-search__thumb--visible' : ''}`}
                src={thumbSrc}
                onLoad={() => setThumbVisible(true)}
                onError={() => setThumbVisible(false)}
              />
              <p className="CC__image-search__status" aria-live="polite">
                {statusText}
              </p>
            </div>

            <p className="CC__image-search__engines-label">Search this image in:</p>
            <div className="CC__image-search__engines">
              {engineLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`CC__image-search__engine ${link.borderClass}`}
                >
                  <img src={link.icon} alt="" width={20} height={20} className="CC__image-search__engine-icon" />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>

            <button type="button" className="CC__image-search__reset" onClick={reset}>
              Use a different image
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
