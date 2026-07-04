import { useNavigate } from 'react-router-dom'
import CyberCorners from './CyberCorners'
import {
  appActiveUsers,
  appBuildYoutubeUrl,
  appCardInstalls,
  appCardSummary,
  appFilterLabel,
  appIconUrl,
  formatAppPublishedAgo,
  isAppLive,
  youtubeEmbedId,
} from '../utils/apps'

const DL_ICON = (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3v9" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" />
    <path
      d="M6.5 8.5 L10 12 L13.5 8.5"
      stroke="#22c55e"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M4 16h12" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const USERS_ICON = (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="7" r="2.5" stroke="#7a8599" strokeWidth="1.65" />
    <path
      d="M2.5 16.5c0-2.8 2.5-5 5.5-5s5.5 2.2 5.5 5"
      stroke="#7a8599"
      strokeWidth="1.65"
      strokeLinecap="round"
    />
    <circle cx="14.5" cy="7.5" r="2" stroke="#7a8599" strokeWidth="1.4" opacity="0.65" />
    <path
      d="M17.5 15.5c0-1.8-1.3-3.3-3-3.8"
      stroke="#7a8599"
      strokeWidth="1.4"
      strokeLinecap="round"
      opacity="0.65"
    />
  </svg>
)

const YOUTUBE_ICON = (
  <svg viewBox="0 0 28.57 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z"
      fill="#FF0000"
    />
    <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white" />
  </svg>
)

const PLAY_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const ARROW_ICON = (
  <svg viewBox="0 0 24 24">
    <path d="M5 12h14M13 6l6 6-6-6" />
  </svg>
)

function formatExtensionStat(value) {
  if (value == null || value <= 0) return '—'
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(value)
}

export default function ExtensionCard({ app, index = 0, onPlayVideo }) {
  const navigate = useNavigate()
  const live = isAppLive(app)
  const youtubeUrl = appBuildYoutubeUrl(app)
  const videoId = youtubeUrl ? youtubeEmbedId(youtubeUrl) : null
  const hasVideo = Boolean(videoId)
  const installs = appCardInstalls(app)
  const activeUsers = appActiveUsers(app)
  const summary = appCardSummary(app)
  const iconUrl = appIconUrl(app)
  const displayName = appFilterLabel(app)
  const publishedLabel = formatAppPublishedAgo(app)

  const playVideo = (event) => {
    event.stopPropagation()
    if (videoId) onPlayVideo?.({ videoId, title: displayName })
  }

  const handleVideoKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      playVideo(event)
    }
  }

  const openAppPage = () => {
    if (!live) return
    navigate(`/apps/${app.slug}`)
  }

  const handleCardClick = () => {
    openAppPage()
  }

  const handleCardKeyDown = (event) => {
    if (!live) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openAppPage()
    }
  }

  return (
    <article
      className={`CC__extension-card${live ? ' CC__extension-card--clickable' : ' CC__extension-card--disabled'}`}
      role={live ? 'link' : 'listitem'}
      tabIndex={live ? 0 : undefined}
      style={{ '--delay': `${index * 55}ms` }}
      aria-label={live ? `View ${displayName}` : displayName}
      onClick={live ? handleCardClick : undefined}
      onKeyDown={live ? handleCardKeyDown : undefined}
    >
      <CyberCorners />

      <div className="CC__ext-top">
        <div
          className={`CC__ext-icon${hasVideo ? ' CC__ext-icon--video' : ''}`}
          role={hasVideo ? 'button' : undefined}
          tabIndex={hasVideo ? 0 : undefined}
          aria-label={hasVideo ? `Play video for ${displayName}` : undefined}
          onClick={hasVideo ? playVideo : undefined}
          onKeyDown={hasVideo ? handleVideoKeyDown : undefined}
        >
          {iconUrl ? (
            <img src={iconUrl} alt={`${displayName} icon`} width={54} height={54} />
          ) : (
            app.icon ?? '⚡'
          )}
          {hasVideo ? (
            <span className="CC__ext-icon__play" aria-hidden="true">
              {PLAY_ICON}
            </span>
          ) : null}
        </div>

        <div className="CC__ext-meta">
          <div className="CC__ext-name-row">
            <span className="CC__ext-name">{displayName}</span>
            {app.version ? (
              <span className="CC__ext-version">v{app.version}</span>
            ) : null}
          </div>
          {publishedLabel ? (
            <p className="CC__ext-published">{publishedLabel}</p>
          ) : null}
          <p className="CC__ext-summary">{summary}</p>
        </div>
      </div>

      <div className="CC__ext-stats">
        <div className="CC__ext-stat" title={`${installs ?? 0} installs`}>
          <span className="CC__ext-stat__icon--dl" aria-hidden="true">
            {DL_ICON}
          </span>
          <span className="CC__ext-stat__val">{formatExtensionStat(installs)}</span>
          <span className="CC__ext-stat__label">installs</span>
        </div>
        <div className="CC__ext-stat-sep" aria-hidden="true" />
        <div className="CC__ext-stat" title={`${activeUsers ?? 0} users`}>
          <span className="CC__ext-stat__icon--users" aria-hidden="true">
            {USERS_ICON}
          </span>
          <span className="CC__ext-stat__val">{formatExtensionStat(activeUsers)}</span>
          <span className="CC__ext-stat__label">users</span>
        </div>
        {hasVideo ? (
          <>
            <div className="CC__ext-stat-sep" aria-hidden="true" />
            <button
              type="button"
              className="CC__ext-stat CC__ext-stat--video"
              title="Watch on YouTube"
              aria-label={`Watch on YouTube for ${displayName}`}
              onClick={playVideo}
            >
              <span className="CC__ext-stat__icon--video" aria-hidden="true">
                {YOUTUBE_ICON}
              </span>
              <span className="CC__ext-stat__label">youtube</span>
            </button>
          </>
        ) : null}
      </div>

      {live ? (
        <span className="CC__ext-cta CC__ext-cta--visible" aria-hidden="true">
          View more
          {ARROW_ICON}
        </span>
      ) : (
        <span className="CC__ext-cta CC__ext-cta--visible CC__ext-cta--disabled" aria-disabled="true">
          Coming soon
        </span>
      )}
    </article>
  )
}
