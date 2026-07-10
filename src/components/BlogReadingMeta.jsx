import EyeIcon from './EyeIcon'

function formatViewCount(value) {
  return new Intl.NumberFormat('en-US').format(value)
}

export default function BlogReadingMeta({ readingTime, views }) {
  return (
    <span className="CC__blog-reading-meta">
      <span>{readingTime} min read</span>
      {typeof views === 'number' && views > 0 ? (
        <>
          <span className="CC__blog-reading-meta__sep" aria-hidden="true">
            ·
          </span>
          <span className="CC__blog-reading-meta__views" title="Page views">
            <EyeIcon size={14} />
            {formatViewCount(views)}
          </span>
        </>
      ) : null}
    </span>
  )
}
