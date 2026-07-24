import { useMemo, useState } from 'react'
import CyberCorners from './CyberCorners'
import {
  appFilterLabel,
  appStoreUrl,
  appYoutubeHowToUse,
  appBuildYoutubeUrl,
  youtubeEmbedId,
} from '../utils/apps'
import './ExtensionFeedbackForm.css'

const SUPABASE_URL = 'https://pinypmgcawshibcmyxqp.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpbnlwbWdjYXdzaGliY215eHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTA2OTMsImV4cCI6MjA5Mzc2NjY5M30.Oabrt3eiLuYA-Lr5uH4w9VPh_CWqQJ2uo-hE07WQsFM'

const VISITOR_ID_KEY = 'feedbackwidgetcc_visitor_id'

const UNINSTALL_REASONS = [
  {
    id: 'reinstalling',
    label: 'Reinstalling',
    panel: 'store',
  },
  {
    id: 'missing-feature',
    label: 'Missing a feature',
    panel: 'textarea',
    prompt: 'Which feature is missing?',
    placeholder: 'Tell us what feature you needed…',
  },
  {
    id: 'slow-ui',
    label: 'Slow or laggy UI',
    panel: 'textarea',
    prompt: 'What felt laggy?',
    placeholder: 'Describe what felt slow or laggy…',
  },
  {
    id: 'didnt-work',
    label: "Didn't work as expected",
    panel: 'textarea',
    prompt: "What didn't work as expected?",
    placeholder: 'What were you trying to do, and what happened instead?',
  },
  {
    id: 'bug',
    label: 'Bug or problem',
    panel: 'textarea',
    prompt: 'What bug or problem did you run into?',
    placeholder: 'Describe the bug or problem…',
  },
  {
    id: 'alternative',
    label: 'Found an alternative',
    panel: 'textarea',
    prompt: 'What alternative did you find?',
    placeholder: 'Which tool or extension are you switching to?',
  },
  {
    id: 'too-complicated',
    label: 'Too complicated to use',
    panel: 'video',
  },
  {
    id: 'privacy',
    label: 'Privacy concerns',
    panel: 'privacy',
  },
  {
    id: 'other',
    label: 'Other',
    panel: 'textarea',
    prompt: 'Please tell us more',
    placeholder: 'Share a bit more about why you uninstalled…',
  },
]

function getFeedbackPostUrl() {
  return `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/feedback`
}

function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(VISITOR_ID_KEY, id)
    }
    return id
  } catch {
    return 'anonymous'
  }
}

function isValidOptionalEmail(raw) {
  const s = String(raw ?? '').trim()
  if (!s) return true
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(s)
}

/** Prefer extension-provided idfp / fingerprint from the uninstall URL when present. */
function resolveSubmitFingerprint(explicitFingerprint) {
  const fromProp = String(explicitFingerprint ?? '').trim()
  if (fromProp) return fromProp

  try {
    const params = new URLSearchParams(window.location.search)
    const fromQuery =
      params.get('idfp')?.trim() ||
      params.get('fingerprint')?.trim() ||
      params.get('fp')?.trim() ||
      ''
    if (fromQuery) return fromQuery
  } catch {
    /* ignore */
  }

  return getVisitorId()
}

function getChromeReviewsUrl(extensionId) {
  const id = String(extensionId ?? '').trim()
  if (!id) return null
  return `https://chromewebstore.google.com/detail/${id}/reviews`
}

function tutorialVideoId(app) {
  const howTo = appYoutubeHowToUse(app)
  const build = appBuildYoutubeUrl(app)
  return youtubeEmbedId(howTo) || youtubeEmbedId(build)
}

export default function ExtensionFeedbackForm({
  app = null,
  appName = 'Coded Citadel Extension',
  chromeExtensionId = null,
  fingerprint: fingerprintProp = null,
  title = 'What went wrong?',
}) {
  const [reasonId, setReasonId] = useState('')
  const [details, setDetails] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const reason = useMemo(
    () => UNINSTALL_REASONS.find((item) => item.id === reasonId) ?? null,
    [reasonId],
  )

  const reviewUrl = getChromeReviewsUrl(chromeExtensionId ?? app?.chromeExtensionId)
  const storeUrl = appStoreUrl(app)
  const videoId = tutorialVideoId(app)
  const privacySubject = app ? appFilterLabel(app) : 'Our extensions'
  const privacyVerb = app ? 'never collects, stores, or sells' : 'never collect, store, or sell'

  const needsDetails = reason?.panel === 'textarea'
  const detailsTrimmed = details.trim()
  const emailTrimmed = email.trim()
  const showEmail = needsDetails && detailsTrimmed.length > 0
  const canSubmit = Boolean(reason) && !submitting

  function selectReason(id) {
    setReasonId(id)
    setDetails('')
    setEmail('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')

    if (!reason) {
      setError('Please select a reason.')
      return
    }

    if (showEmail && !isValidOptionalEmail(emailTrimmed)) {
      setError('Please enter a valid email, or leave it blank.')
      return
    }

    const suggestion = needsDetails && detailsTrimmed
      ? `[${reason.label}] ${detailsTrimmed}`
      : `[${reason.label}]`

    setSubmitting(true)

    try {
      const res = await fetch(getFeedbackPostUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          app_name: appName,
          email: showEmail && emailTrimmed ? emailTrimmed : null,
          suggestion,
          fingerprint: resolveSubmitFingerprint(fingerprintProp),
        }),
      })

      if (!res.ok) throw new Error('feedback post failed')
      setSubmitted(true)
    } catch {
      setError('Something went wrong, please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="CC__cyber-accent CC__privacy__callout CC__uninstall-form">
        <CyberCorners />
        <h2 className="CC__section-title CC__uninstall-form__heading">Thanks for the feedback!</h2>
        <p className="CC__privacy-page__meta" style={{ marginBottom: reviewUrl ? '1rem' : 0 }}>
          We really appreciate you taking the time.
        </p>
        {reviewUrl ? (
          <a
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="CC__btn CC__btn--outline"
          >
            Leave us a review
          </a>
        ) : null}
      </div>
    )
  }

  return (
    <form
      className="CC__cyber-accent CC__privacy__callout CC__uninstall-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <CyberCorners />
      <h2 className="CC__section-title CC__uninstall-form__heading">{title}</h2>

      <fieldset className="CC__uninstall-form__fieldset">
        <div className="CC__uninstall-form__reasons" role="radiogroup" aria-label="Uninstall reason">
          {UNINSTALL_REASONS.map((item) => {
            const selected = reasonId === item.id
            return (
              <label
                key={item.id}
                className={`CC__uninstall-form__reason${selected ? ' CC__uninstall-form__reason--selected' : ''}`}
              >
                <input
                  type="radio"
                  name="uninstall-reason"
                  value={item.id}
                  checked={selected}
                  onChange={() => selectReason(item.id)}
                  disabled={submitting}
                />
                <span className="CC__uninstall-form__radio" aria-hidden="true" />
                <span className="CC__uninstall-form__reason-label">{item.label}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {reason?.panel === 'store' ? (
        <div className="CC__uninstall-form__panel">
          {storeUrl ? (
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="CC__uninstall-form__card"
            >
              <span className="CC__uninstall-form__card-title">Get the latest version here</span>
              <span className="CC__uninstall-form__card-text">
                Install the newest version from the Chrome Web Store with the latest fixes and
                improvements.
              </span>
            </a>
          ) : (
            <p className="CC__privacy-page__meta">
              Reinstall from the Chrome Web Store to get the latest version.
            </p>
          )}
        </div>
      ) : null}

      {reason?.panel === 'privacy' ? (
        <div className="CC__uninstall-form__panel">
          <div className="CC__uninstall-form__card CC__uninstall-form__card--static">
            <span className="CC__uninstall-form__card-title">Privacy policy</span>
            <span className="CC__uninstall-form__card-text">
              {privacySubject} {privacyVerb} your personal data. All processing happens locally
              in your browser, and we don&apos;t track your browsing activity.
            </span>
            <span className="CC__uninstall-form__card-text">
              If you have any privacy questions or concerns, email us directly at{' '}
              <a href="mailto:CodedCitadel@gmail.com">CodedCitadel@gmail.com</a>, we read every
              message.
            </span>
          </div>
        </div>
      ) : null}

      {reason?.panel === 'video' ? (
        <div className="CC__uninstall-form__panel">
          {videoId ? (
            <div className="CC__uninstall-form__video">
              <p className="CC__footer-newsletter-blurb" style={{ marginBottom: '0.5rem' }}>
                Here&apos;s a quick walkthrough that may help:
              </p>
              <div className="CC__uninstall-form__video-frame">
                <iframe
                  title="Extension tutorial"
                  src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          ) : (
            <p className="CC__privacy-page__meta">
              Check the extension page or our YouTube channel for a quick how-to video.
            </p>
          )}
        </div>
      ) : null}

      {reason?.panel === 'textarea' ? (
        <div className="CC__uninstall-form__panel">
          <label className="CC__footer-newsletter-blurb" htmlFor="uninstall-details">
            {reason.prompt}
          </label>
          <textarea
            id="uninstall-details"
            className="CC__newsletter-input CC__uninstall-form__textarea"
            rows={4}
            placeholder={reason.placeholder}
            value={details}
            onChange={(event) => {
              setDetails(event.target.value)
              setError('')
            }}
            disabled={submitting}
          />
          {showEmail ? (
            <div className="CC__uninstall-form__email">
              <label className="CC__footer-newsletter-blurb" htmlFor="uninstall-email">
                Email <span className="CC__uninstall-form__optional">(optional)</span>
              </label>
              <input
                id="uninstall-email"
                type="email"
                className="CC__newsletter-input CC__uninstall-form__email-input"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setError('')
                }}
                disabled={submitting}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="CC__uninstall-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="CC__btn CC__btn--primary CC__btn--full"
        disabled={!canSubmit}
      >
        {submitting ? 'Sending…' : 'Confirm uninstall'}
      </button>
    </form>
  )
}
