import { useState } from 'react'
import { Link } from 'react-router-dom'
import CyberCorners from './CyberCorners'
import BlogCoverFallback from './BlogCoverFallback'
import BlogReadingMeta from './BlogReadingMeta'
import { formatBlogDate, getPostCoverUrl } from '../utils/blog'

function BlogCardCover({ cover, title }) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <div className="CC__blog-card__cover">
      {cover && !imageFailed ? (
        <img
          src={cover}
          alt={`Cover image for ${title}`}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <BlogCoverFallback title={title} />
      )}
    </div>
  )
}

export default function BlogPostGrid({ posts, gridClassName = '', captionOverrides = {} }) {
  if (!posts.length) return null

  const gridClasses = ['CC__blog-grid', gridClassName].filter(Boolean).join(' ')

  return (
    <div className={gridClasses}>
      {posts.map((post) => {
        const cover = getPostCoverUrl(post)
        const caption = captionOverrides[post.slug] ?? post.description

        return (
          <article key={post.slug} className="CC__blog-card CC__cyber-accent">
            <CyberCorners />
            <Link to={`/blog/${post.slug}`} className="CC__blog-card__link">
              <BlogCardCover cover={cover} title={post.title} />
              <div className="CC__blog-card__body">
                <time className="CC__blog-card__date" dateTime={post.date}>
                  {formatBlogDate(post.date)}
                </time>
                <h2 className="CC__blog-card__title">{post.title}</h2>
                {caption ? (
                  <p className="CC__blog-card__description">{caption}</p>
                ) : null}
                <div className="CC__blog-card__meta">
                  <BlogReadingMeta readingTime={post.readingTime} views={post.views} />
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
