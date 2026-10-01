import { useEffect } from 'react'
import PageSEO from '../components/PageSEO'

export default function StoreRedirectPage({ url, title }) {
  useEffect(() => {
    window.location.replace(url)
  }, [url])

  return (
    <>
      <PageSEO
        title={title}
        description="Redirecting to the Chrome Web Store."
        canonicalUrl={url}
        robots="noindex, follow"
      />
      <main className="CC__privacy-page">
        <div className="CC__container CC__privacy-page__inner">
          <p className="CC__privacy-page__meta">
            Redirecting…{' '}
            <a href={url} rel="noopener noreferrer">
              Continue to the Chrome Web Store
            </a>
          </p>
        </div>
      </main>
    </>
  )
}
