import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import AppsGridSection from '../components/AppsGridSection'
import PageSEO from '../components/PageSEO'
import '../App.css'

const APPS_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Chrome Extensions — Coded Citadel',
  description:
    'Browse free Chrome extensions built in public: Gmail to PDF, Instagram exporters, Claude tools, YouTube utilities, and more.',
  url: 'https://codedcitadel.com/apps',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Coded Citadel',
    url: 'https://codedcitadel.com',
  },
}

export default function AppsPage() {
  return (
    <>
      <PageSEO
        title="Chrome Extensions — Coded Citadel"
        description="Browse free Chrome extensions built in public: Gmail to PDF, Instagram exporters, Claude tools, YouTube utilities, and more."
        canonicalPath="/apps"
        jsonLd={APPS_JSON_LD}
      />
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
          titleAs="h1"
          enableTabs
          enablePagination
          showChromeStoreLink
        />
      </main>
      <SiteFooter />
    </>
  )
}
