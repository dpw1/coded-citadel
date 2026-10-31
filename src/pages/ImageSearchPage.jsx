import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import PageSEO from '../components/PageSEO'
import AppsGridSection from '../components/AppsGridSection'
import ImageSearchWidget from '../components/imageSearch/ImageSearchWidget'
import { SITE_URL } from '../utils/seo'
import '../App.css'
import './ImageSearchPage.css'

const PAGE_TITLE = 'Reverse Image Search — Google, Bing, Yandex & TinEye | Coded Citadel'
const PAGE_DESCRIPTION =
  'Free reverse image search in your browser. Upload a photo or paste a URL, then open Google Lens, Yandex, Bing Visual, and TinEye. Links expire and files delete after 15 minutes.'

const IMAGE_SEARCH_JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Coded Citadel Reverse Image Search',
    url: `${SITE_URL}/image-search`,
    description: PAGE_DESCRIPTION,
    applicationCategory: 'UtilitiesApplication',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Reverse image search',
        item: `${SITE_URL}/image-search`,
      },
    ],
  },
]

export default function ImageSearchPage() {
  return (
    <>
      <PageSEO
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        socialDescription={PAGE_DESCRIPTION}
        canonicalPath="/image-search"
        jsonLd={IMAGE_SEARCH_JSON_LD}
      />
      <SiteHeader />
      <main className="CC__image-search-page">
        <section className="CC__image-search-page__hero">
          <div className="CC__image-search-page__hero-gradient" aria-hidden="true" />
          <div className="CC__container CC__image-search-page__hero-inner">
            <h1 className="CC__image-search-page__title">
              Reverse image search that actually
              <br className="CC__image-search-page__title-break" /> works everywhere.
            </h1>

            <div className="CC__image-search-page__hero-stack">
              <p className="CC__image-search-page__intro">
                Search any image across{' '}
                <b>Google Lens, Yandex, Bing Visual and TinEye at once</b>. Find results across the
                entire web (Google, Instagram, Pinterest, Websites &amp; More)
              </p>

              <ImageSearchWidget />
            </div>
          </div>
        </section>

        <section className="CC__image-search-page__promo">
          <div className="CC__container">
            <header className="CC__image-search-page__promo-header">
              <p className="CC__section-eyebrow">Chrome extensions</p>
              <h2 className="CC__image-search-page__promo-title">More tools from Coded Citadel</h2>
              <p className="CC__image-search-page__promo-meta">
                I build privacy-friendly browser extensions in public — filters, exporters, and workflow
                shortcuts. <Link to="/apps">Browse all extensions</Link>.
              </p>
            </header>
            <AppsGridSection
              titleAs="h3"
              title="Popular extensions"
              maxItems={6}
              sortByInstalls
              showViewAllLink
              contained={false}
              className="CC__image-search-page__apps-grid"
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
