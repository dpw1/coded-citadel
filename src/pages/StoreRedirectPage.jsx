import { useEffect } from 'react'
import PageSEO from '../components/PageSEO'

export default function StoreRedirectPage({ url, title, continueLabel = 'Continue' }) {
  useEffect(() => {
    window.location.replace(url)
  }, [url])

  return (
    <>
      <PageSEO
        title={title}
        description={`Redirecting to ${title}.`}
        canonicalUrl={url}
        robots="noindex, follow"
      />
      <main className="CC__privacy-page">
        <div className="CC__container CC__privacy-page__inner">
          <p className="CC__privacy-page__meta">
            Redirecting…{' '}
            <a href={url} rel="noopener noreferrer">
              {continueLabel}
            </a>
          </p>
        </div>
      </main>
    </>
  )
}
