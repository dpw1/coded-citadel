import { useState } from 'react'

export default function HomeEmailSection() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    // TODO: wire to a newsletter / email API when available
    setSubmitted(true)
  }

  return (
    <section id="email" className="CC__home-email CC__container" aria-label="Email extension links">
      <div className="CC__home-email__panel">
        <h2 className="CC__section-title">On your phone right now?</h2>
        <p className="CC__section-subtitle CC__home-email__blurb">
          Chrome extensions install on a computer. Get the link by email and add it later in two
          clicks. Plus a heads-up when new extensions launch.
        </p>
        <form className="CC__home-email__form" onSubmit={handleSubmit}>
          <label className="CC__home-email__label" htmlFor="home-email-input">
            Email
          </label>
          <input
            id="home-email-input"
            className="CC__input CC__home-email__input"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            disabled={submitted}
          />
          <button type="submit" className="CC__btn CC__btn--primary" disabled={submitted}>
            Send me the link
          </button>
        </form>
        {submitted ? (
          <p className="CC__home-email__success" role="status">
            Thanks! We&apos;ll send extension links when signup is live — check back soon.
          </p>
        ) : null}
      </div>
    </section>
  )
}
