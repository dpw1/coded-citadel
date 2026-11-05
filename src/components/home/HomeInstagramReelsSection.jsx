import {
  formatUploadedAgo,
  getHomeInstagramReels,
  getHomeInstagramReelsProfileUrl,
  homeInstagramReelThumbnailSrc,
} from '../../utils/homeInstagramReels'
import { CODED_CITADEL_INSTAGRAM_URL } from '../../constants/socialUrls'

export default function HomeInstagramReelsSection() {
  const reels = getHomeInstagramReels()
  const profileUrl = getHomeInstagramReelsProfileUrl() || CODED_CITADEL_INSTAGRAM_URL

  if (!reels.length) return null

  return (
    <section
      id="reels"
      className="CC__home-instagram CC__home-section CC__container"
      aria-label="Instagram reels"
    >
      <div className="CC__home-instagram__head">
        <h2 className="CC__home-featured__subsection-title">On Instagram</h2>
        <a
          className="CC__home-instagram__profile-link"
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          @CodedCitadel
        </a>
      </div>
      <div className="CC__home-reels-scroll">
        <div className="CC__home-reels" role="list">
        {reels.map((reel) => {
          const thumbSrc = homeInstagramReelThumbnailSrc(reel.thumbnail)
          const uploadedLabel = formatUploadedAgo(reel.uploadedAt)
          return (
            <a
              key={reel.shortcode || reel.url}
              href={reel.url}
              className="CC__home-reels__item"
              role="listitem"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={
                uploadedLabel ? `${uploadedLabel}. Open reel on Instagram` : 'Open reel on Instagram'
              }
            >
              {thumbSrc ? (
                <img
                  className="CC__home-reels__thumb"
                  src={thumbSrc}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
              {uploadedLabel ? (
                <>
                  <span className="CC__home-reels__overlay" aria-hidden="true" />
                  <span className="CC__home-reels__uploaded">{uploadedLabel}</span>
                </>
              ) : null}
            </a>
          )
        })}
        </div>
      </div>
    </section>
  )
}
