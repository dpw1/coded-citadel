import { useState } from 'react'
import CyberCorners from './CyberCorners'

const SUPABASE_URL = 'https://pinypmgcawshibcmyxqp.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpbnlwbWdjYXdzaGliY215eHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTA2OTMsImV4cCI6MjA5Mzc2NjY5M30.Oabrt3eiLuYA-Lr5uH4w9VPh_CWqQJ2uo-hE07WQsFM'

const VISITOR_ID_KEY = 'feedbackwidgetcc_visitor_id'

function getFeedbackPostUrl() {
  return `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/feedback`
}

function isValidOptionalEmail(raw) {
  const s = String(raw ?? '').trim()
  if (!s) return true
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(s)
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

function getChromeReviewsUrl(extensionId) {
  const id = String(extensionId ?? '').trim()
  if (!id) return null
  return `https://chromewebstore.google.com/detail/${id}/reviews`
}

export default function ExtensionFeedbackForm({
  appName = 'Coded Citadel Extension',
  chromeExtensionId = null,
  title = 'All suggestions are read. What can be improved?',
}) {
  const [email, setEmail] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [suggestionError, setSuggestionError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const reviewUrl = getChromeReviewsUrl(chromeExtensionId)

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmedSuggestion = suggestion.trim()
    setError('')
    setEmailError(false)
    setSuggestionError(false)

    if (!trimmedSuggestion) {
      setSuggestionError(true)
      setError('Please enter your feedback.')
      return
    }

    if (!isValidOptionalEmail(email)) {
      setEmailError(true)
      setError('Enter a valid email address.')
      return
    }

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
          email: email.trim() || null,
          suggestion: trimmedSuggestion,
          fingerprint: getVisitorId(),
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
      <div className="CC__cyber-accent CC__privacy__callout">
        <CyberCorners />
        <h2 className="CC__section-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Thanks for the feedback!
        </h2>
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
      className="CC__cyber-accent CC__privacy__callout"
      onSubmit={handleSubmit}
      noValidate
    >
      <CyberCorners />
      <h2 className="CC__section-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
        {title}
      </h2>

      <label className="CC__footer-newsletter-blurb" htmlFor="feedback-email">
        Your email (optional)
      </label>
      <input
        id="feedback-email"
        type="email"
        className="CC__newsletter-input"
        style={{ display: 'block', width: '100%', marginTop: '0.35rem', marginBottom: '0.75rem' }}
        value={email}
        onChange={(event) => {
          setEmail(event.target.value)
          setEmailError(false)
          setError('')
        }}
        autoComplete="email"
        disabled={submitting}
      />

      <label className="CC__footer-newsletter-blurb" htmlFor="feedback-suggestion">
        Your feedback
      </label>
      <textarea
        id="feedback-suggestion"
        className="CC__newsletter-input"
        rows={4}
        style={{
          display: 'block',
          width: '100%',
          marginTop: '0.35rem',
          marginBottom: '0.75rem',
          minHeight: '6rem',
          resize: 'vertical',
        }}
        placeholder="Write your suggestion"
        value={suggestion}
        onChange={(event) => {
          setSuggestion(event.target.value)
          setSuggestionError(false)
          setError('')
        }}
        disabled={submitting}
      />

      {error ? (
        <p
          className="CC__footer-newsletter-blurb"
          style={{ color: 'var(--CC__color-danger)', marginBottom: '0.75rem' }}
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="CC__btn CC__btn--primary CC__btn--full"
        disabled={submitting}
        style={{
          borderColor: emailError || suggestionError ? 'var(--CC__color-danger)' : undefined,
        }}
      >
        {submitting ? 'Sending…' : 'Send Feedback'}
      </button>
    </form>
  )
}
