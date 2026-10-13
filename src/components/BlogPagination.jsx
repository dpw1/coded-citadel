import { Link } from 'react-router-dom'
import { getBlogIndexPath } from '../utils/blog'

const PREV_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

const NEXT_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 18l6-6-6-6" />
  </svg>
)

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total]
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '…', current - 1, current, current + 1, '…', total]
}

export default function BlogPagination({
  currentPage,
  totalPosts,
  pageSize,
  searchQuery = '',
}) {
  const totalPages = totalPosts === 0 ? 1 : Math.max(1, Math.ceil(totalPosts / pageSize))
  if (totalPages <= 1 && !searchQuery) return null
  if (totalPages <= 1 && totalPosts === 0) return null

  const pathOpts = { q: searchQuery }
  const pageList = buildPageList(currentPage, totalPages)
  const start = totalPosts === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalPosts)

  const prevPath = currentPage > 1 ? getBlogIndexPath(currentPage - 1, pathOpts) : null
  const nextPath = currentPage < totalPages ? getBlogIndexPath(currentPage + 1, pathOpts) : null

  return (
    <footer className="CC__blog-pagination">
      <nav className="CC__pagination" aria-label="Blog pages">
        {prevPath ? (
          <Link to={prevPath} className="CC__pagination__btn" rel="prev">
            {PREV_ICON}
            <span className="CC__blog-pagination__label">Previous</span>
          </Link>
        ) : (
          <span className="CC__pagination__btn" aria-disabled="true">
            {PREV_ICON}
            <span className="CC__blog-pagination__label">Previous</span>
          </span>
        )}

        {pageList.map((page, index) =>
          page === '…' ? (
            <span key={`ellipsis-${index}`} className="CC__pagination__ellipsis" aria-hidden="true">
              …
            </span>
          ) : (
            <Link
              key={page}
              to={getBlogIndexPath(page, pathOpts)}
              className={`CC__pagination__btn${page === currentPage ? ' CC__pagination__btn--active' : ''}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Link>
          ),
        )}

        {nextPath ? (
          <Link to={nextPath} className="CC__pagination__btn" rel="next">
            <span className="CC__blog-pagination__label">Next</span>
            {NEXT_ICON}
          </Link>
        ) : (
          <span className="CC__pagination__btn" aria-disabled="true">
            <span className="CC__blog-pagination__label">Next</span>
            {NEXT_ICON}
          </span>
        )}
      </nav>
      <p className="CC__pagination__info">
        Showing {start}–{end} of {totalPosts} posts
      </p>
    </footer>
  )
}
