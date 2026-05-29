import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import { BlogIndexSEO } from '../components/BlogPageSEO'
import CyberCorners from '../components/CyberCorners'
import {
  formatBlogDate,
  getAllBlogPosts,
  getPostCoverUrl,
} from '../utils/blog'
import '../App.css'
import './BlogPage.css'

export default function BlogIndexPage() {
  const posts = getAllBlogPosts()

  return (
    <>
      <BlogIndexSEO />
      <SiteHeader />
      <main className="CC__blog-page">
        <div className="CC__container CC__blog-page__inner">
          <header className="CC__blog-page__header">
            <p className="CC__section-eyebrow">Blog</p>
            <h1 className="CC__section-title">Build Logs &amp; Updates</h1>
            <p className="CC__blog-page__intro">
              Lessons from shipping Chrome extensions in public — metrics, mistakes, and what actually moved the needle.
            </p>
          </header>

          {posts.length === 0 ? (
            <p className="CC__blog-page__empty">No posts yet. Check back soon.</p>
          ) : (
            <div className="CC__blog-grid">
              {posts.map((post) => {
                const cover = getPostCoverUrl(post)

                return (
                  <article
                    key={post.slug}
                    className="CC__blog-card CC__cyber-accent"
                  >
                    <CyberCorners />
                    <Link to={`/blog/${post.slug}`} className="CC__blog-card__link">
                      {cover ? (
                        <div className="CC__blog-card__cover">
                          <img src={cover} alt="" loading="lazy" />
                        </div>
                      ) : null}
                      <div className="CC__blog-card__body">
                        <time className="CC__blog-card__date" dateTime={post.date}>
                          {formatBlogDate(post.date)}
                        </time>
                        <h2 className="CC__blog-card__title">{post.title}</h2>
                        {post.description ? (
                          <p className="CC__blog-card__description">{post.description}</p>
                        ) : null}
                        <div className="CC__blog-card__meta">
                          <span>{post.readingTime} min read</span>
                          {post.tags?.length ? (
                            <ul className="CC__blog-card__tags">
                              {post.tags.map((tag) => (
                                <li key={tag}>{tag}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
