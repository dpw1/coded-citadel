import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CyberCorners from '../components/CyberCorners'
import PageSEO from '../components/PageSEO'
import SiteFooter from '../components/SiteFooter'
import SiteHeader from '../components/SiteHeader'
import {
  fulfillErrorMessage,
  fulfillStripeCheckoutSession,
  platformReturnLabel,
  resolveStripeSuccessApp,
} from '../config/stripeSuccessApps'
import { appFilterLabel, appIconUrl, getAppBySource } from '../utils/apps'
import '../App.css'
import './ExtensionLandingPage.css'
import './ThankYouPage.css'
import './StripeSuccessPage.css'

const CONTACT_EMAIL = 'CodedCitadel@gmail.com'

function formatGrantUntil(iso) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function StripeSuccessPage() {
  const [searchParams] = useSearchParams()
  const cancelled = searchParams.get('cancelled') === '1'
  const sessionId = (searchParams.get('session_id') ?? '').trim()
  const appParam = (searchParams.get('app') ?? '').trim()

  const billingApp = useMemo(() => resolveStripeSuccessApp(appParam), [appParam])
  const platform = billingApp?.platform ?? 'other'

  const appRecord = useMemo(() => {
    if (!billingApp) {
      if (appParam) return getAppBySource(appParam)
      return getAppBySource('youtube-filter-pro')
    }
    return (
      getAppBySource(billingApp.stripeAppId) ||
      billingApp.aliases?.map((a) => getAppBySource(a)).find(Boolean) ||
      null
    )
  }, [appParam, billingApp])

  const productName = appRecord
    ? appFilterLabel(appRecord)
    : billingApp
      ? billingApp.stripeAppId
      : appParam || 'Your purchase'

  const appLandingPath = appRecord?.slug
    ? `/apps/${appRecord.slug}`
    : appParam
      ? `/apps/${appParam}`
      : '/apps/youtube-filter-pro'

  const canonicalPath = '/success'

  const [phase, setPhase] = useState(() => {
    if (cancelled) return 'cancelled'
    if (!sessionId) return 'invalid'
    if (appParam && !billingApp) return 'error'
    if (!billingApp) return 'invalid'
    return 'loading'
  })
  const [fulfill, setFulfill] = useState(null)
  const [errorMessage, setErrorMessage] = useState(() =>
    appParam && !billingApp && sessionId ? fulfillErrorMessage('unsupported_app', 'other') : '',
  )
  const [copyLabel, setCopyLabel] = useState('Copy key')

  useEffect(() => {
    if (cancelled || !sessionId || !billingApp) return

    let cancelledRequest = false

    async function run() {
      setPhase('loading')
      setErrorMessage('')
      setFulfill(null)

      try {
        const data = await fulfillStripeCheckoutSession(billingApp, sessionId)

        if (cancelledRequest) return

        if (!data?.ok) {
          const code = typeof data?.error === 'string' ? data.error : ''
          setErrorMessage(fulfillErrorMessage(code, platform))
          setPhase('error')
          return
        }

        setFulfill(data)
        setPhase('success')
      } catch {
        if (cancelledRequest) return
        setErrorMessage(fulfillErrorMessage(undefined, platform))
        setPhase('error')
      }
    }

    run()

    return () => {
      cancelledRequest = true
    }
  }, [billingApp, cancelled, platform, sessionId])

  const handleCopy = useCallback(async () => {
    const key = fulfill?.licenseKey
    if (!key) return
    try {
      await navigator.clipboard.writeText(key)
      setCopyLabel('Copied!')
      window.setTimeout(() => setCopyLabel('Copy key'), 2000)
    } catch {
      setCopyLabel('Select & copy')
    }
  }, [fulfill?.licenseKey])

  const pageTitle = useMemo(() => {
    if (cancelled) return 'Checkout cancelled — Coded Citadel'
    if (phase === 'invalid') return 'Invalid link — Coded Citadel'
    if (phase === 'error') return 'License pending — Coded Citadel'
    if (phase === 'success') return `Payment successful — Coded Citadel`
    return 'Payment successful — Coded Citadel'
  }, [cancelled, phase])

  const iconUrl = appRecord ? appIconUrl(appRecord) : null
  const grantLabel = formatGrantUntil(fulfill?.grantUntil)
  const returnWhere = platformReturnLabel(platform)
  const retryHint = billingApp
    ? `Close this tab and try again from ${productName} → Upgrade.`
    : 'Close this tab and open checkout again from the extension.'

  const pasteHint =
    platform === 'youtube'
      ? "If Pro didn't unlock on YouTube, paste this key in the extension checkout or upgrade dialog."
      : platform === 'instagram'
        ? "If Pro didn't unlock on Instagram, paste this key in the extension Upgrade panel (license field)."
        : "If Pro didn't unlock, paste this key in the extension's license field."

  return (
    <>
      <PageSEO
        title={pageTitle}
        description="Stripe checkout confirmation for Coded Citadel extensions."
        canonicalPath={canonicalPath}
        robots="noindex, follow"
      />

      <SiteHeader />
      <div className="CC__stripe-success-page CC__thank-you-page">
        <main className="CC__stripe-success-main">
          <div className="CC__container">
            <div className="CC__stripe-success-panel CC__cyber-accent">
              <CyberCorners />

              {phase === 'cancelled' ? (
                <>
                  <h1>Checkout cancelled</h1>
                  <p className="CC__stripe-success-lead">{retryHint}</p>
                  <div className="CC__stripe-success-actions">
                    <Link to={appLandingPath} className="CC__btn CC__btn--primary">
                      {productName}
                    </Link>
                  </div>
                </>
              ) : null}

              {phase === 'invalid' ? (
                <>
                  <h1>Invalid link</h1>
                  <p className="CC__stripe-success-error">Invalid or incomplete link.</p>
                  <div className="CC__stripe-success-actions">
                    <Link to={appLandingPath} className="CC__btn CC__btn--outline">
                      {productName}
                    </Link>
                  </div>
                </>
              ) : null}

              {phase === 'loading' ? (
                <>
                  <h1>Thanks for your purchase</h1>
                  {appRecord ? (
                    <div className="CC__stripe-success-product">
                      {iconUrl ? (
                        <div className="CC__stripe-success-product-icon">
                          <img src={iconUrl} alt="" />
                        </div>
                      ) : null}
                      <p className="CC__stripe-success-product-name">{productName}</p>
                    </div>
                  ) : null}
                  <div className="CC__stripe-success-loading" role="status" aria-live="polite">
                    <div className="CC__stripe-success-spinner" aria-hidden="true" />
                    <span>Loading your license…</span>
                  </div>
                </>
              ) : null}

              {phase === 'success' ? (
                <>
                  <h1>
                    Thanks for your <span>purchase</span>
                  </h1>
                  <div className="CC__stripe-success-product">
                    {iconUrl ? (
                      <div className="CC__stripe-success-product-icon">
                        <img src={iconUrl} alt="" />
                      </div>
                    ) : null}
                    <p className="CC__stripe-success-product-name">{productName}</p>
                  </div>

                  {fulfill?.livemode === false ? (
                    <div className="CC__stripe-success-banner CC__stripe-success-banner--test" role="status">
                      Test mode — sandbox only
                    </div>
                  ) : fulfill?.livemode === true ? (
                    <div className="CC__stripe-success-banner CC__stripe-success-banner--live" role="status">
                      <span className="CC__stripe-success-banner--live-dot" aria-hidden="true" />
                      Live payment
                    </div>
                  ) : null}

                  <p className="CC__stripe-success-lead">
                    You can close this tab and go back to {returnWhere} — the extension usually activates Pro
                    within a minute.
                  </p>

                  {grantLabel ? (
                    <p className="CC__stripe-success-grant">Access through {grantLabel}.</p>
                  ) : null}

                  {fulfill?.licenseKey ? (
                    <>
                      <p className="CC__stripe-success-key-label">Your license key</p>
                      <div className="CC__stripe-success-key-row">
                        <div className="CC__stripe-success-key" id="stripe-license-key">
                          {fulfill.licenseKey}
                        </div>
                        <button
                          type="button"
                          className="CC__btn CC__btn--primary CC__stripe-success-copy-btn"
                          onClick={handleCopy}
                        >
                          {copyLabel}
                        </button>
                      </div>
                      <p className="CC__stripe-success-hint">{pasteHint}</p>
                    </>
                  ) : null}

                  <div className="CC__stripe-success-actions">
                    <Link to={appLandingPath} className="CC__btn CC__btn--outline">
                      {productName} page
                    </Link>
                  </div>
                </>
              ) : null}

              {phase === 'error' ? (
                <>
                  <h1>Almost there</h1>
                  <p className="CC__stripe-success-error">{errorMessage}</p>
                  <p className="CC__stripe-success-hint">
                    Return to {returnWhere} — Pro may still activate automatically. {pasteHint}
                  </p>
                  <div className="CC__stripe-success-actions">
                    <Link to={appLandingPath} className="CC__btn CC__btn--outline">
                      {productName} page
                    </Link>
                  </div>
                </>
              ) : null}

              {(phase === 'error' || phase === 'success') && (
                <p className="CC__stripe-success-support">
                  Questions?{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
      <SiteFooter />
    </>
  )
}
