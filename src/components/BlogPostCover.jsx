import { useState } from 'react'

function youtubeThumbnailUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

export default function BlogPostCover({ coverUrl, youtubeId, title }) {
  const [playing, setPlaying] = useState(false)
  const thumbnail = coverUrl || (youtubeId ? youtubeThumbnailUrl(youtubeId) : null)

  if (!thumbnail && !youtubeId) return null

  if (youtubeId && playing) {
    return (
      <div className="CC__blog-post__cover CC__blog-post__cover--video">
        <iframe
          title={`YouTube video: ${title}`}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  if (youtubeId && thumbnail) {
    return (
      <div className="CC__blog-post__cover CC__blog-post__cover--video">
        <button
          type="button"
          className="CC__blog-post__cover-play"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
        >
          <img src={thumbnail} alt="" />
          <span className="CC__blog-post__cover-play-icon" aria-hidden="true">
            <svg viewBox="0 0 68 48" width="68" height="48">
              <path
                className="CC__blog-post__cover-play-bg"
                d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.64 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
                fill="currentColor"
              />
              <path d="M45 24 27 14v20" fill="#fff" />
            </svg>
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="CC__blog-post__cover">
      <img src={thumbnail} alt="" />
    </div>
  )
}
