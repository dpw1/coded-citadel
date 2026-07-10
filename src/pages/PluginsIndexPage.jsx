import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import PluginsGridSection from '../components/PluginsGridSection'
import PageSEO from '../components/PageSEO'
import { pluginsIndexPath } from '../utils/plugins'
import '../App.css'

const PLUGINS_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'DaVinci Resolve Plugins — Coded Citadel',
  description:
    'Browse free DaVinci Resolve Fusion macros and plugins from Coded Citadel, built in public.',
  url: `https://codedcitadel.com${pluginsIndexPath()}`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'Coded Citadel',
    url: 'https://codedcitadel.com',
  },
}

export default function PluginsIndexPage() {
  return (
    <>
      <PageSEO
        title="DaVinci Resolve Plugins — Free Fusion Macros | Coded Citadel"
        description="Browse free DaVinci Resolve Fusion macros and plugins from Coded Citadel. Download tools like Wobubble and follow the build-in-public journey."
        canonicalPath={pluginsIndexPath()}
        jsonLd={PLUGINS_JSON_LD}
      />
      <SiteHeader />
      <main className="CC__apps-page">
        <PluginsGridSection
          sectionId="plugins-list"
          eyebrow="DaVinci Resolve"
          title={
            <>
              All <span className="CC__section-title-accent">Plugins</span>
            </>
          }
          titleAs="h1"
          enableTabs
          enablePagination
          showRandomLink
        />
      </main>
      <SiteFooter />
    </>
  )
}
