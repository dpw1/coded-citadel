import { useState } from 'react'
import CyberCorners from './CyberCorners'
import './ContactForm.css'

const WEB3FORMS_ACCESS_KEY = 'af2a6ce0-2169-43df-a0a0-4d64e07eec10'
const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/

function isValidEmail(raw) {
  const value = String(raw ?? '').trim()
  if (!value) return false
  return EMAIL_REGEX.test(value)
}

export default function ContactForm({ idPrefix = 'contact', submitLabel = 'Send message' }) {
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [messageError, setMessageError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function clearErrors() {
    setError('')
    setEmailError(false)
    setMessageError(false)
  }

  async function onSubmit(event) {
    event.preventDefault()

    const form = event.target
    const formData = new FormData(form)
    const email = String(formData.get('email') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()

    setResult('')
    clearErrors()

    if (!email) {
      setEmailError(true)
      setError('Please enter your email address.')
      return
    }

    if (!isValidEmail(email)) {
      setEmailError(true)
      setError('Enter a valid email address.')
      return
    }

    if (!message) {
      setMessageError(true)
      setError('Please enter your message.')
      return
    }

    setResult('Sending…')
    setSubmitting(true)
    formData.set('email', email)
    formData.set('message', message)
    formData.append('access_key', WEB3FORMS_ACCESS_KEY)

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setResult('Message sent successfully.')
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

  const resultIsError = result && result !== 'Sending…' && !result.includes('successfully')

  return (
    <form
      className="CC__cyber-accent CC__privacy__callout CC__contact-form"
      onSubmit={onSubmit}
      noValidate
    >
      <CyberCorners />

      <label className="CC__footer-newsletter-blurb" htmlFor={`${idPrefix}-name`}>
        Name
      </label>
      <input
        id={`${idPrefix}-name`}
        type="text"
        name="name"
        className="CC__newsletter-input CC__contact-form__input"
        autoComplete="name"
        disabled={submitting}
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
        aria-invalid={emailError}
        aria-describedby={error && emailError ? `${idPrefix}-form-error` : undefined}
        onChange={() => {
          if (emailError) {
            setEmailError(false)
            setError('')
          }
        }}
        style={{
          borderColor: emailError ? 'var(--CC__color-danger)' : undefined,
        }}
      />

      <label className="CC__footer-newsletter-blurb" htmlFor={`${idPrefix}-message`}>
        Message <span className="CC__contact-form__required" aria-hidden="true">*</span>
      </label>
      <textarea
        id={`${idPrefix}-message`}
        name="message"
        className="CC__newsletter-input CC__contact-form__input CC__contact-form__textarea"
        rows={4}
        placeholder="Tell me about your project"
        disabled={submitting}
        aria-invalid={messageError}
        aria-describedby={error && messageError ? `${idPrefix}-form-error` : undefined}
        onChange={() => {
          if (messageError) {
            setMessageError(false)
            setError('')
          }
        }}
        style={{
          borderColor: messageError ? 'var(--CC__color-danger)' : undefined,
        }}
      />

      {error ? (
        <p
          id={`${idPrefix}-form-error`}
          className="CC__contact-form__error"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button type="submit" className="CC__btn CC__btn--primary CC__btn--full" disabled={submitting}>
        {submitting ? 'Sending…' : submitLabel}
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
