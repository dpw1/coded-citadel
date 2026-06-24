import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import ExtensionFeedbackForm from '../components/ExtensionFeedbackForm'
import { appFilterLabel, getAppBySource } from '../utils/apps'
import '../App.css'
import './PrivacyPolicyPage.css'

export default function UninstallPage() {
  const [searchParams] = useSearchParams()
  const source = searchParams.get('source')
  const app = useMemo(() => getAppBySource(source), [source])

  const appName = app?.name ?? 'Coded Citadel Extension'
  const appLabel = app ? appFilterLabel(app) : null

  useEffect(() => {
    document.title = 'Uninstall — Coded Citadel'
    return () => {
      document.title = 'Coded Citadel'
    }
  }, [])

  return (
    <>
      <SiteHeader />
      <main className="CC__privacy-page">
        <div className="CC__container CC__privacy-page__inner">
          <header>
            <p className="CC__section-eyebrow">Before you go</p>
            <h1 className="CC__privacy-page__title">Sorry to see you go 😞</h1>
            <p className="CC__privacy-page__meta">
              {appLabel
                ? `If you have a moment, let us know why you uninstalled ${appLabel}. Every message is read.`
                : 'If you have a moment, let us know why you uninstalled. Every message is read.'}
            </p>
          </header>

          <div className="CC__privacy__body">
            <ExtensionFeedbackForm
              appName={appName}
              chromeExtensionId={app?.chromeExtensionId ?? null}
              title="What could we have done better?"
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
