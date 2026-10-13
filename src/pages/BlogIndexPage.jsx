import { useEffect, useMemo } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import { BlogIndexSEO } from '../components/BlogPageSEO'
import BlogPostGrid from '../components/BlogPostGrid'
import BlogPagination from '../components/BlogPagination'
import BlogSearch from '../components/BlogSearch'
import {
  BLOG_INDEX_PAGE_SIZE,
  getAllBlogPosts,
  getBlogPageCount,
  getBlogPostsForPage,
  normalizeBlogPageNumber,
  normalizeBlogSearchQuery,
  searchBlogPosts,
} from '../utils/blog'
import '../App.css'
import './BlogPage.css'

export default function BlogIndexPage() {
  const { page: pageParam } = useParams()
  const [searchParams] = useSearchParams()
  const searchQuery = normalizeBlogSearchQuery(searchParams.get('q'))

  const allPosts = getAllBlogPosts()
  const filteredPosts = useMemo(
    () => searchBlogPosts(allPosts, searchQuery),
    [allPosts, searchQuery],
  )

  const totalPages = getBlogPageCount(BLOG_INDEX_PAGE_SIZE, filteredPosts)

  const requestedPage = pageParam ? Number.parseInt(pageParam, 10) : 1
  const invalidPage =
    pageParam != null &&
    (!Number.isFinite(requestedPage) || requestedPage < 1 || requestedPage > totalPages)
  const redirectPageOne = pageParam != null && requestedPage === 1
  const redirectOvershoot =
    invalidPage && Number.isFinite(requestedPage) && requestedPage > totalPages

  const currentPage = normalizeBlogPageNumber(
    pageParam ?? 1,
    BLOG_INDEX_PAGE_SIZE,
    filteredPosts,
  )
  const posts = useMemo(
    () => getBlogPostsForPage(currentPage, BLOG_INDEX_PAGE_SIZE, filteredPosts),
    [currentPage, filteredPosts],
  )

  useEffect(() => {
    if (redirectPageOne || invalidPage) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage, redirectPageOne, invalidPage, searchQuery])

  if (redirectPageOne) {
    const q = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''
    return <Navigate to={`/blog${q}`} replace />
  }

  if (invalidPage) {
    const q = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''
    return (
      <Navigate
        to={
          redirectOvershoot
            ? `/blog/page/${totalPages}${q}`
            : `/blog${q}`
        }
        replace
      />
    )
  }

  return (
    <>
      <BlogIndexSEO
        page={currentPage}
        totalPages={totalPages}
        posts={posts}
        searchQuery={searchQuery}
      />
      <SiteHeader />
      <main className="CC__blog-page" id="main-content">
        <div className="CC__container CC__blog-page__inner">
          <header className="CC__blog-page__header">
            <p className="CC__section-eyebrow">Blog</p>
            <div className="CC__blog-page__title-row">
              <h1 className="CC__section-title">
                Build Logs &amp; Updates
                {currentPage > 1 ? (
                  <span className="CC__blog-page__page-title"> — Page {currentPage}</span>
                ) : null}
              </h1>
              <BlogSearch resultCount={filteredPosts.length} totalCount={allPosts.length} />
            </div>
            <p className="CC__blog-page__intro">
              Lessons from shipping Chrome extensions in public — metrics, mistakes, and more.
            </p>
          </header>

          {allPosts.length === 0 ? (
            <p className="CC__blog-page__empty">No posts yet. Check back soon.</p>
          ) : filteredPosts.length === 0 ? (
            <p className="CC__blog-page__empty">
              No posts match your search. Try different keywords or{' '}
              <a href="/blog">view all posts</a>.
            </p>
          ) : (
            <>
              <BlogPostGrid posts={posts} />
              <BlogPagination
                currentPage={currentPage}
                totalPosts={filteredPosts.length}
                pageSize={BLOG_INDEX_PAGE_SIZE}
                searchQuery={searchQuery}
              />
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
