import { useEffect } from 'react'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import AppsGridSection from '../components/AppsGridSection'
import '../App.css'

export default function AppsPage() {
  useEffect(() => {
    document.title = 'Apps — Coded Citadel'
    return () => {
      document.title = 'Coded Citadel'
    }
  }, [])

  return (
    <>
      <SiteHeader />
      <main className="CC__apps-page">
        <AppsGridSection
          sectionId="apps-list"
          eyebrow="Chrome Extensions"
          title={
            <>
              All <span className="CC__section-title-accent">Tools</span>
            </>
          }
          enableTabs
          enablePagination
          showChromeStoreLink
        />
      </main>
      <SiteFooter />
    </>
  )
}
