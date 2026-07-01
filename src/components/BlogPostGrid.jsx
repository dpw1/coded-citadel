import { Link } from 'react-router-dom'
import CyberCorners from './CyberCorners'
import { formatBlogDate, getPostCoverUrl } from '../utils/blog'

export default function BlogPostGrid({ posts, gridClassName = '' }) {
  if (!posts.length) return null

  const gridClasses = ['CC__blog-grid', gridClassName].filter(Boolean).join(' ')

  return (
    <div className={gridClasses}>
      {posts.map((post) => {
        const cover = getPostCoverUrl(post)

        return (
          <article key={post.slug} className="CC__blog-card CC__cyber-accent">
            <CyberCorners />
            <Link to={`/blog/${post.slug}`} className="CC__blog-card__link">
              {cover ? (
                <div className="CC__blog-card__cover">
                  <img src={cover} alt={`Cover image for ${post.title}`} loading="lazy" />
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
  )
}
