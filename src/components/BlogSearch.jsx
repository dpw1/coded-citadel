import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { normalizeBlogSearchQuery } from '../utils/blog'

const SEARCH_ICON = (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path
      fill="currentColor"
      d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
    />
  </svg>
)

const CLEAR_ICON = (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path
      fill="currentColor"
      d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
    />
  </svg>
)

export default function BlogSearch({ resultCount, totalCount }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlQuery = normalizeBlogSearchQuery(searchParams.get('q'))
  const [value, setValue] = useState(urlQuery)

  useEffect(() => {
    setValue(urlQuery)
  }, [urlQuery])

  function commitSearch(nextRaw) {
    const next = normalizeBlogSearchQuery(nextRaw)
    const params = new URLSearchParams()
    if (next) params.set('q', next)
    const qs = params.toString()
    navigate(qs ? `/blog?${qs}` : '/blog', { replace: true })
  }

  function handleSubmit(event) {
    event.preventDefault()
    commitSearch(value)
  }

  function handleClear() {
    setValue('')
    commitSearch('')
  }

  const searching = Boolean(urlQuery)
  const showClear = Boolean(value || searching)

  return (
    <div className="CC__blog-search" role="search">
      <form className="CC__blog-search__form" onSubmit={handleSubmit}>
        <label className="CC__blog-search__label CC__visually-hidden" htmlFor="blog-search-input">
          Search posts
        </label>
        <div className="CC__blog-search__row">
          <div className="CC__blog-search__field">
            <input
              id="blog-search-input"
              className="CC__blog-search__input"
              type="search"
              name="q"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Search…"
              autoComplete="off"
              enterKeyHint="search"
            />
            {showClear ? (
              <button
                type="button"
                className="CC__blog-search__clear-inline"
                onClick={handleClear}
                aria-label="Clear search"
              >
                {CLEAR_ICON}
              </button>
            ) : null}
          </div>
          <button type="submit" className="CC__blog-search__submit" aria-label="Search posts">
            {SEARCH_ICON}
            <span className="CC__blog-search__submit-text">Search</span>
          </button>
        </div>
      </form>
      {searching ? (
        <p className="CC__blog-search__status" aria-live="polite">
          {resultCount === 0
            ? `No posts match “${urlQuery}”.`
            : `${resultCount} of ${totalCount} post${resultCount === 1 ? '' : 's'} match “${urlQuery}”.`}
        </p>
      ) : null}
    </div>
  )
}
