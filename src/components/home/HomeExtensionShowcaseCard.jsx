import { useFinePointer } from '../../hooks/useFinePointer'
import {
  appActiveUsers,
  appCardSummary,
  appCategory,
  appFilterLabel,
  appHeroPreviewUrl,
  appIconUrl,
  appStoreUrl,
  formatNumber,
} from '../../utils/apps'
import { cardThumbUrl, resolveYoutubeVideoId } from './homeExtensionShowcaseUtils'

/* Video playback disabled for now — thumbnails only.
const PLAY_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
)
*/

function formatDailyUsers(app) {
  const count = appActiveUsers(app)
  if (count == null || count <= 0) return null
  return `${formatNumber(count)} daily users`
}

export default function HomeExtensionShowcaseCard({
  app,
  /* onPlayVideo, onMediaActivate, */
}) {
  const finePointer = useFinePointer()
  // const mediaButtonRef = useRef(null)

  if (!app) return null

  // const videoId = resolveYoutubeVideoId(app)
  const videoIdForThumb = resolveYoutubeVideoId(app)
  const thumbUrl = cardThumbUrl(app, videoIdForThumb)
  const displayName = appFilterLabel(app)
  const summary = appCardSummary(app)
  const storeUrl = appStoreUrl(app)
  const categoryLabel = appCategory(app)
  const dailyUsers = formatDailyUsers(app)
  const iconOnlyThumb = !videoIdForThumb && !appHeroPreviewUrl(app) && appIconUrl(app)

  const cardClassName = 'CC__home-featured__card CC__home-featured__card--featured'

  /* Video modal / store fallback on media click — disabled for now.
  const handleMediaClick = () => {
    onMediaActivate?.(mediaButtonRef.current)
    onPlayVideo?.(app)
  }
  */

  const ctaHref = finePointer && storeUrl ? storeUrl : '#email'
  const ctaExternal = finePointer && Boolean(storeUrl)
  const ctaLabel = finePointer && storeUrl ? 'Add to Chrome' : 'Send to my computer'
  const ctaClassName = [
    'CC__btn',
    'CC__btn--primary',
    finePointer && storeUrl ? 'CC__btn--chrome-extension' : null,
    finePointer && storeUrl ? null : 'CC__btn--outline',
    'CC__home-featured__download',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={cardClassName} role="listitem" data-category={categoryLabel}>
      <div className="CC__home-featured__card-media">
        {dailyUsers ? (
          <span className="CC__badge CC__home-featured__card-badge">{dailyUsers}</span>
        ) : null}
        {storeUrl ? (
          <a
            href={storeUrl}
            className="CC__home-featured__card-store-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${displayName} on Chrome Web Store`}
          >
            {thumbUrl ? (
              <img
                className={`CC__home-featured__card-thumb${iconOnlyThumb ? ' CC__home-featured__card-thumb--icon' : ''}`}
                src={thumbUrl}
                alt=""
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="CC__home-featured__card-thumb CC__home-featured__card-thumb--placeholder" />
            )}
          </a>
        ) : (
          <div className="CC__home-featured__card-media-fallback" aria-hidden="true">
            {thumbUrl ? (
              <img
                className={`CC__home-featured__card-thumb${iconOnlyThumb ? ' CC__home-featured__card-thumb--icon' : ''}`}
                src={thumbUrl}
                alt=""
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="CC__home-featured__card-thumb CC__home-featured__card-thumb--placeholder" />
            )}
          </div>
        )}
      </div>

      <div className="CC__home-featured__card-body">
        <div className="CC__home-featured__card-head">
          <h3 className="CC__home-featured__card-title">{displayName}</h3>
          <span className="CC__home-featured__card-tag">{categoryLabel}</span>
        </div>
        {summary ? <p className="CC__home-featured__card-summary">{summary}</p> : null}
        <div className="CC__home-featured__card-foot">
          <div className="CC__home-featured__card-ctas">
            {ctaExternal ? (
              <a
                href={ctaHref}
                className={ctaClassName}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ctaLabel}
              </a>
            ) : (
              <a href={ctaHref} className={ctaClassName}>
                {ctaLabel}
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
