import youtubeFeed from '../data/youtube-videos.json'

const YOUTUBE_DISPLAY_COUNT = 2
const featuredVideos = youtubeFeed.videos.slice(0, YOUTUBE_DISPLAY_COUNT)

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function excerpt(text, len = 160) {
  const t = stripHtml(text)
  if (!t) return ''
  return t.length <= len ? t : `${t.slice(0, len)}…`
}

function extractDuration(text) {
  if (!text) return null
  const m = stripHtml(text).match(/\b(\d{1,2}:\d{2}(?::\d{2})?)\b/)
  return m ? m[1] : null
}

export default function YoutubeSection() {
  return (
    <section id="youtube" className="CC__youtube CC__container">
      <div className="CC__section-header-row">
        <div>
          <p className="CC__section-eyebrow">YouTube Series</p>
          <h2 className="CC__section-title">The Journey</h2>
        </div>
        <a
          href="https://www.youtube.com/@CodedCitadel"
          target="_blank"
          rel="noopener noreferrer"
          className="CC__view-all-link"
        >
          View all videos on YouTube →
        </a>
      </div>

      <div className="CC__youtube-grid">
        {featuredVideos.length > 0 ? (
          featuredVideos.map((vid) => {
            const meta = excerpt(vid.description, 200)
            const duration = vid.duration || extractDuration(vid.description)
            return (
              <a
                key={vid.id || vid.link}
                href={vid.link}
                target="_blank"
                rel="noopener noreferrer"
                className="CC__video-card"
              >
                <div className="CC__video-thumb-wrapper">
                  {vid.thumbnail ? <img src={vid.thumbnail} alt={vid.title} /> : null}
                  {duration ? <span className="CC__video-duration">{duration}</span> : null}
                </div>
                <div className="CC__video-info">
                  <h3 className="CC__video-title">{vid.title}</h3>
                  {meta ? <p className="CC__video-meta">{meta}</p> : null}
                </div>
              </a>
            )
          })
        ) : (
          <p className="CC__youtube-loading">
            No videos in feed yet. Run <code>npm run fetch-youtube</code> locally, then commit{' '}
            <code>src/data/youtube-videos.json</code>.
          </p>
        )}
      </div>
    </section>
  )
}
