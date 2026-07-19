import { Link } from 'react-router-dom'
import { formatNumber, getAnnouncementBarStats } from '../utils/apps'
import './AnnouncementBar.css'

const PROFIT_DISPLAY = '$1400'

function MarqueeStrip({ liveApps, totalActiveUsers, totalInstalls, duplicate = false }) {
  const dupClass = duplicate ? ' CC__announcement-bar__marquee-duplicate' : ''

  return (
    <>
      <span
        className={`CC__announcement-bar__marquee-item CC__announcement-bar__marquee-item--tagline${dupClass}`}
      >
        Coding in Public Until I Make $100k USD
      </span>
      <span className={`CC__announcement-bar__sep${dupClass}`} aria-hidden="true" />
      <span className={`CC__announcement-bar__marquee-item${dupClass}`}>
        {formatNumber(liveApps)} apps
      </span>
      <span className={`CC__announcement-bar__sep${dupClass}`} aria-hidden="true" />
      <span className={`CC__announcement-bar__marquee-item${dupClass}`}>
        {formatNumber(totalActiveUsers)} users
      </span>
      <span className={`CC__announcement-bar__sep${dupClass}`} aria-hidden="true" />
      <span className={`CC__announcement-bar__marquee-item${dupClass}`}>
        {formatNumber(totalInstalls)} installs
      </span>
      <span className={`CC__announcement-bar__sep${dupClass}`} aria-hidden="true" />
      <span
        className={`CC__announcement-bar__marquee-item CC__announcement-bar__marquee-item--profit${dupClass}`}
      >
        profit: {PROFIT_DISPLAY}
      </span>
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
    'Coding in Public Until I Make $100k USD',
    `${formatNumber(liveApps)} apps`,
    `${formatNumber(totalActiveUsers)} users`,
    `${formatNumber(totalInstalls)} installs`,
    `profit: ${PROFIT_DISPLAY}`,
  ].join(' | ')

  const stripProps = { liveApps, totalActiveUsers, totalInstalls }

  return (
    <div className="CC__announcement-bar">
      <Link
        to="/live-stats"
        className="CC__announcement-bar__link"
        aria-label={`${ariaLabel}. View live stats`}
      />

      <div className="CC__announcement-bar__desktop CC__container">
        <p className="CC__announcement-bar__tagline">Coding in Public Until I Make $100k USD</p>
        <ul className="CC__announcement-bar__stats">
          <li>{formatNumber(liveApps)} apps</li>
          <li>{formatNumber(totalActiveUsers)} users</li>
          <li>{formatNumber(totalInstalls)} installs</li>
          <li>profit: {PROFIT_DISPLAY}</li>
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
