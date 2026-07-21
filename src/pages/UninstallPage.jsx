import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import ExtensionFeedbackForm from '../components/ExtensionFeedbackForm'
import PageSEO from '../components/PageSEO'
import { getAppBySource } from '../utils/apps'
import '../App.css'
import './PrivacyPolicyPage.css'

export default function UninstallPage() {
  const [searchParams] = useSearchParams()
  const source = searchParams.get('source')
  const trimmedSource = source?.trim() || ''
  const app = useMemo(() => getAppBySource(source), [source])

  const appName = trimmedSource || app?.name || 'Coded Citadel Extension'

  return (
    <>
      <PageSEO
        title="Uninstall — Coded Citadel"
        description="Share feedback after uninstalling a Coded Citadel Chrome extension."
        canonicalPath="/uninstall"
        robots="noindex, follow"
      />
      <SiteHeader />
      <main className="CC__privacy-page">
        <div className="CC__container CC__privacy-page__inner">
          <header>
            <p className="CC__section-eyebrow">Before you go</p>
            <h1 className="CC__privacy-page__title">Sad to see you go 😞</h1>
            <p className="CC__privacy-page__meta">
              Please leave a feedback to help me do better. Every message is read.
            </p>
          </header>

          <div className="CC__privacy__body">
            <ExtensionFeedbackForm
              app={app}
              appName={appName}
              chromeExtensionId={app?.chromeExtensionId ?? null}
              title="What went wrong?"
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
