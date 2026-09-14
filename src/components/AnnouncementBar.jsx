import { Link } from 'react-router-dom'
import { formatNumber, getAnnouncementBarStats } from '../utils/apps'
import './AnnouncementBar.css'

const TAGLINE = 'Building Social Media & Ecom Tools in Public'

function MarqueeStrip({ liveApps, totalActiveUsers, totalInstalls, duplicate = false }) {
  const dupClass = duplicate ? ' CC__announcement-bar__marquee-duplicate' : ''

  return (
    <>
      <span
        className={`CC__announcement-bar__marquee-item CC__announcement-bar__marquee-item--tagline${dupClass}`}
      >
        {TAGLINE}
      </span>
      <span className={`CC__announcement-bar__sep${dupClass}`} aria-hidden="true" />
      <Link
        to="/live-stats"
        className={`CC__announcement-bar__marquee-item${dupClass}`}
        tabIndex={duplicate ? -1 : undefined}
      >
        {formatNumber(liveApps)} apps
      </Link>
      <span className={`CC__announcement-bar__sep${dupClass}`} aria-hidden="true" />
      <Link
        to="/live-stats"
        className={`CC__announcement-bar__marquee-item${dupClass}`}
        tabIndex={duplicate ? -1 : undefined}
      >
        {formatNumber(totalActiveUsers)} users
      </Link>
      <span className={`CC__announcement-bar__sep${dupClass}`} aria-hidden="true" />
      <Link
        to="/live-stats"
        className={`CC__announcement-bar__marquee-item${dupClass}`}
        tabIndex={duplicate ? -1 : undefined}
      >
        {formatNumber(totalInstalls)} installs
      </Link>
      <span
        className={`CC__announcement-bar__sep CC__announcement-bar__sep--trail${dupClass}`}
        aria-hidden="true"
      />
    </>
  )
}

export default function AnnouncementBar() {
  const { liveApps, totalActiveUsers, totalInstalls } = getAnnouncementBarStats()

  const ariaLabel = [
    TAGLINE,
    `${formatNumber(liveApps)} apps`,
    `${formatNumber(totalActiveUsers)} users`,
    `${formatNumber(totalInstalls)} installs`,
  ].join(' | ')

  const stripProps = { liveApps, totalActiveUsers, totalInstalls }

  return (
    <div className="CC__announcement-bar" aria-label={ariaLabel}>
      <div className="CC__announcement-bar__desktop CC__container">
        <p className="CC__announcement-bar__tagline">{TAGLINE}</p>
        <ul className="CC__announcement-bar__stats">
          <li>
            <Link to="/live-stats">{formatNumber(liveApps)} apps</Link>
          </li>
          <li>
            <Link to="/live-stats">{formatNumber(totalActiveUsers)} users</Link>
          </li>
          <li>
            <Link to="/live-stats">{formatNumber(totalInstalls)} installs</Link>
          </li>
        </ul>
      </div>

      <div
        className="CC__announcement-bar__marquee-row CC__announcement-bar__marquee-row--ltr"
        aria-hidden="true"
      >
        <div className="CC__announcement-bar__marquee-track">
          <MarqueeStrip {...stripProps} />
          <MarqueeStrip {...stripProps} duplicate />
        </div>
      </div>
    </div>
  )
}
