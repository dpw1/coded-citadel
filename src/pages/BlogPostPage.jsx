import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import BlogPostCover from '../components/BlogPostCover'
import BlogPostGrid from '../components/BlogPostGrid'
import { BlogPostSEO } from '../components/BlogPageSEO'
import {
  blogContentUrl,
  formatBlogDate,
  getBlogPostBySlug,
  getBlogRedirectTarget,
  getKeepReadingPosts,
  getPostCoverUrl,
  getPostYoutubeEmbedId,
} from '../utils/blog'
import { prepareBlogContentHtml, scrollToBlogSection } from '../utils/blogContent'
import '../App.css'
import './BlogPage.css'

function isSpaShellHtml(html) {
  return html.includes('<div id="root">') || html.includes('<!DOCTYPE html>')
}

function BlogTableOfContents({ items, onNavigate }) {
  if (!items.length) return null

  return (
    <nav className="CC__blog-post__toc" aria-label="Table of contents">
      <p className="CC__blog-post__toc-title">On this page</p>
      <ol className="CC__blog-post__toc-list">
        {items.map((item) => (
          <li
            key={item.id}
            className={
              item.level === 3 ? 'CC__blog-post__toc-item CC__blog-post__toc-item--nested' : 'CC__blog-post__toc-item'
            }
          >
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault()
                onNavigate(item.id)
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function BlogPostActionLink({ href, className, children }) {
  if (href.startsWith('/')) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}

function BlogPostFooterLinks({ download, stats }) {
  if (!download && !stats) return null

  return (
    <div className="CC__blog-post__footer-links">
      {download ? (
        <p>
          <a href={download} target="_blank" rel="noopener noreferrer">
            Download it here
          </a>
        </p>
      ) : null}
      {stats ? (
        <p>
          <BlogPostActionLink href={stats}>View live stats here</BlogPostActionLink>
        </p>
      ) : null}
    </div>
  )
}

function BlogNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="CC__blog-page">
        <div className="CC__container CC__blog-page__inner">
          <h1 className="CC__blog-post__title">Post not found</h1>
          <p className="CC__blog-page__intro">No blog post matches this URL.</p>
          <Link to="/blog" className="CC__btn CC__btn--primary" style={{ marginTop: '1.5rem' }}>
            Back to blog
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const redirectTo = getBlogRedirectTarget(slug)
  const post = getBlogPostBySlug(slug)
  const [contentHtml, setContentHtml] = useState('')
  const [contentError, setContentError] = useState(false)
  const [loadingContent, setLoadingContent] = useState(true)

  const youtubeEmbedId = post ? getPostYoutubeEmbedId(post) : null

  useEffect(() => {
    if (redirectTo || !post) {
      setLoadingContent(false)
      return undefined
    }

    let cancelled = false
    setLoadingContent(true)
    setContentError(false)

    fetch(blogContentUrl(post.slug))
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load post content')
        return res.text()
      })
      .then((html) => {
        if (cancelled) return
        if (isSpaShellHtml(html)) {
          if (post.contentHtml) {
            setContentHtml(post.contentHtml)
            return
          }
          throw new Error('Invalid blog content response')
        }
        setContentHtml(html)
      })
      .catch(() => {
        if (cancelled) return
        if (post.contentHtml) {
          setContentHtml(post.contentHtml)
          return
        }
        setContentError(true)
      })
      .finally(() => {
        if (!cancelled) setLoadingContent(false)
      })

    return () => {
      cancelled = true
    }
  }, [post, redirectTo])

  const { processedHtml, tocItems } = useMemo(() => {
    const { html, toc } = prepareBlogContentHtml(contentHtml)
    return { processedHtml: html, tocItems: toc }
  }, [contentHtml])

  useEffect(() => {
    if (!window.location.hash) return undefined
    const id = window.location.hash.slice(1)
    const timer = window.setTimeout(() => scrollToBlogSection(id), 100)
    return () => window.clearTimeout(timer)
  }, [processedHtml, loadingContent])

  if (redirectTo) {
    return <Navigate to={`/blog/${redirectTo}`} replace />
  }

  if (!post) return <BlogNotFound />

  const cover = getPostCoverUrl(post)
  const keepReadingPosts = getKeepReadingPosts(post.slug, 3)

  return (
    <>
      <BlogPostSEO post={post} />
      <SiteHeader />
      <main className="CC__blog-page">
        <article className="CC__container CC__blog-post">
          <Link to="/blog" className="CC__blog-post__back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All posts
          </Link>

          <header className="CC__blog-post__header">
            <time className="CC__blog-post__date" dateTime={post.date}>
              {formatBlogDate(post.date)}
            </time>
            <h1 className="CC__blog-post__title">{post.title}</h1>
            <div className="CC__blog-post__meta">
              <span>{post.readingTime} min read</span>
              {post.tags?.length ? (
                <ul className="CC__blog-post__tags">
                  {post.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            {post.canonicalUrl ? (
              <p className="CC__blog-post__crosspost">
                Also published at{' '}
                <a href={post.canonicalUrl} target="_blank" rel="noopener noreferrer">
                  {post.canonicalUrl}
                </a>
              </p>
            ) : null}
            {post.download || post.stats ? (
              <div className="CC__blog-post__actions">
                {post.download ? (
                  <a
                    href={post.download}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="CC__btn CC__btn--primary CC__blog-post__download"
                  >
                    Download
                  </a>
                ) : null}
                {post.stats ? (
                  <BlogPostActionLink
                    href={post.stats}
                    className="CC__btn CC__btn--outline CC__blog-post__stats"
                  >
                    Stats
                  </BlogPostActionLink>
                ) : null}
              </div>
            ) : null}
          </header>

          {cover || youtubeEmbedId ? (
            <BlogPostCover
              key={post.slug}
              coverUrl={cover}
              youtubeId={youtubeEmbedId}
              youtubeIsShort={Boolean(post.youtubeIsShort)}
              title={post.title}
            />
          ) : null}

          <div className="CC__blog-post__body">
            <BlogTableOfContents items={tocItems} onNavigate={scrollToBlogSection} />

            <div className="CC__blog-post__main">
              {post.keyTakeaways?.length ? (
                <section id="key-takeaways" className="CC__blog-post__takeaways">
                  <h2>Key takeaways</h2>
                  <ul>
                    {post.keyTakeaways.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {loadingContent ? (
                <p className="CC__blog-post__loading">Loading article…</p>
              ) : contentError ? (
                <p className="CC__blog-post__loading">Could not load article content.</p>
              ) : (
                <>
                  <div
                    className="CC__blog-post__content"
                    dangerouslySetInnerHTML={{ __html: processedHtml }}
                  />
                  <BlogPostFooterLinks download={post.download} stats={post.stats} />
                </>
              )}

            </div>
          </div>

          {keepReadingPosts.length > 0 ? (
            <section
              className="CC__blog-post__keep-reading"
              aria-labelledby="keep-reading-heading"
            >
              <header className="CC__blog-post__keep-reading-header">
                <p className="CC__section-eyebrow">More from the blog</p>
                <h2 id="keep-reading-heading" className="CC__section-title">
                  Keep reading
                </h2>
              </header>
              <BlogPostGrid posts={keepReadingPosts} gridClassName="CC__blog-grid--cols-3" />
            </section>
          ) : null}
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
