import { useState } from 'react'
import CyberCorners from './CyberCorners'
import './ContactForm.css'
import './AffiliateForm.css'

const WEB3FORMS_ACCESS_KEY = 'af2a6ce0-2169-43df-a0a0-4d64e07eec10'
const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/
const REVIEW_DAYS = 5

const AUDIENCE_OPTIONS = [
  { value: 'Under 1k', label: 'Under 1k' },
  { value: '1k-10k', label: '1k–10k' },
  { value: '10k+', label: '10k+' },
]

function isValidEmail(raw) {
  const value = String(raw ?? '').trim()
  if (!value) return false
  return EMAIL_REGEX.test(value)
}

export default function AffiliateForm({ idPrefix = 'affiliate' }) {
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function clearFieldError(field) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
    setError('')
  }

  async function onSubmit(event) {
    event.preventDefault()

    const form = event.target
    const formData = new FormData(form)
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const socialLink = String(formData.get('social_link') ?? '').trim()
    const audienceSize = String(formData.get('audience_size') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()
    const heardAbout = String(formData.get('heard_about') ?? '').trim()

    setResult('')
    setError('')

    const nextErrors = {}
    if (!name) nextErrors.name = true
    if (!email) nextErrors.email = true
    else if (!isValidEmail(email)) nextErrors.email = true
    if (!socialLink) nextErrors.social_link = true
    if (!audienceSize) nextErrors.audience_size = true
    if (!message) nextErrors.message = true

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors)
      if (nextErrors.email && email && !isValidEmail(email)) {
        setError('Enter a valid email address.')
      } else {
        setError('Please fill in all required fields.')
      }
      return
    }

    setFieldErrors({})
    setResult('Sending…')
    setSubmitting(true)

    formData.set('name', name)
    formData.set('email', email)
    formData.set('social_link', socialLink)
    formData.set('audience_size', audienceSize)
    formData.set('message', message)
    if (heardAbout) formData.set('heard_about', heardAbout)
    else formData.delete('heard_about')

    formData.append('access_key', WEB3FORMS_ACCESS_KEY)
    formData.append('subject', 'Affiliate Application — YouTube Filter Pro')
    formData.append('from_name', name)
    formData.append('form_name', 'YouTube Filter Pro Affiliate Application')

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setSubmitted(true)
        setResult('')
        form.reset()
      } else {
        setResult('Something went wrong. Please try again.')
      }
    } catch {
      setResult('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div
        className="CC__cyber-accent CC__privacy__callout CC__contact-form CC__affiliate-form__success"
        role="status"
        aria-live="polite"
      >
        <CyberCorners />
        <p className="CC__affiliate-form__success-title">Application received</p>
        <p>
          Thanks! I&apos;ll review your application and email you within {REVIEW_DAYS}{' '}
          days if approved.
        </p>
      </div>
    )
  }

  const resultIsError = result && result !== 'Sending…'

  return (
    <form
      className="CC__cyber-accent CC__privacy__callout CC__contact-form"
      onSubmit={onSubmit}
      noValidate
    >
      <CyberCorners />

      <label className="CC__footer-newsletter-blurb" htmlFor={`${idPrefix}-name`}>
        Name <span className="CC__contact-form__required" aria-hidden="true">*</span>
      </label>
      <input
        id={`${idPrefix}-name`}
        type="text"
        name="name"
        className="CC__newsletter-input CC__contact-form__input"
        autoComplete="name"
        disabled={submitting}
        aria-invalid={Boolean(fieldErrors.name)}
        onChange={() => clearFieldError('name')}
        style={{
          borderColor: fieldErrors.name ? 'var(--CC__color-danger)' : undefined,
        }}
      />

      <label className="CC__footer-newsletter-blurb" htmlFor={`${idPrefix}-email`}>
        Email <span className="CC__contact-form__required" aria-hidden="true">*</span>
      </label>
      <input
        id={`${idPrefix}-email`}
        type="email"
        name="email"
        className="CC__newsletter-input CC__contact-form__input"
        autoComplete="email"
        disabled={submitting}
        aria-invalid={Boolean(fieldErrors.email)}
        aria-describedby={error && fieldErrors.email ? `${idPrefix}-form-error` : undefined}
        onChange={() => clearFieldError('email')}
        style={{
          borderColor: fieldErrors.email ? 'var(--CC__color-danger)' : undefined,
        }}
      />

      <label className="CC__footer-newsletter-blurb" htmlFor={`${idPrefix}-social`}>
        Social media / channel link{' '}
        <span className="CC__contact-form__required" aria-hidden="true">*</span>
      </label>
      <input
        id={`${idPrefix}-social`}
        type="text"
        name="social_link"
        className="CC__newsletter-input CC__contact-form__input"
        placeholder="https://youtube.com/@yourchannel"
        autoComplete="url"
        disabled={submitting}
        aria-invalid={Boolean(fieldErrors.social_link)}
        onChange={() => clearFieldError('social_link')}
        style={{
          borderColor: fieldErrors.social_link ? 'var(--CC__color-danger)' : undefined,
        }}
      />

      <label className="CC__footer-newsletter-blurb" htmlFor={`${idPrefix}-audience`}>
        Audience size <span className="CC__contact-form__required" aria-hidden="true">*</span>
      </label>
      <select
        id={`${idPrefix}-audience`}
        name="audience_size"
        className="CC__newsletter-input CC__contact-form__input CC__affiliate-form__select"
        defaultValue=""
        disabled={submitting}
        aria-invalid={Boolean(fieldErrors.audience_size)}
        onChange={() => clearFieldError('audience_size')}
        style={{
          borderColor: fieldErrors.audience_size ? 'var(--CC__color-danger)' : undefined,
        }}
      >
        <option value="" disabled>
          Select audience size
        </option>
        {AUDIENCE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label className="CC__footer-newsletter-blurb" htmlFor={`${idPrefix}-message`}>
        How would you promote YouTube Filter Pro?{' '}
        <span className="CC__contact-form__required" aria-hidden="true">*</span>
      </label>
      <textarea
        id={`${idPrefix}-message`}
        name="message"
        className="CC__newsletter-input CC__contact-form__input CC__contact-form__textarea"
        rows={4}
        placeholder="e.g. YouTube videos, newsletter, Twitter threads…"
        disabled={submitting}
        aria-invalid={Boolean(fieldErrors.message)}
        onChange={() => clearFieldError('message')}
        style={{
          borderColor: fieldErrors.message ? 'var(--CC__color-danger)' : undefined,
        }}
      />

      <label className="CC__footer-newsletter-blurb" htmlFor={`${idPrefix}-heard`}>
        How did you hear about YouTube Filter Pro?{' '}
        <span className="CC__affiliate-form__optional">(optional)</span>
      </label>
      <input
        id={`${idPrefix}-heard`}
        type="text"
        name="heard_about"
        className="CC__newsletter-input CC__contact-form__input"
        disabled={submitting}
      />

      {error ? (
        <p id={`${idPrefix}-form-error`} className="CC__contact-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="CC__btn CC__btn--primary CC__btn--full" disabled={submitting}>
        {submitting ? 'Sending…' : 'Submit Application'}
      </button>

      {result ? (
        <p
          className={`CC__contact-form__result${
            resultIsError ? ' CC__contact-form__result--error' : ''
          }`}
          role="status"
          aria-live="polite"
        >
          {result}
        </p>
      ) : null}
    </form>
  )
}
