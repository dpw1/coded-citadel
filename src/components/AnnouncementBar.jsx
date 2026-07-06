import { formatNumber, formatRevenue, getAnnouncementBarStats } from '../utils/apps'
import './AnnouncementBar.css'

const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@CodedCitadel'

function MarqueeStrip({ liveApps, totalActiveUsers, totalInstalls, totalProfit, duplicate = false }) {
  const dupClass = duplicate ? ' CC__announcement-bar__marquee-duplicate' : ''

  return (
    <>
      <span
        className={`CC__announcement-bar__marquee-item CC__announcement-bar__marquee-item--tagline${dupClass}`}
      >
        Coding Until I Make $100k USD
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
        profit: {formatRevenue(totalProfit)}
      </span>
      <span
        className={`CC__announcement-bar__sep CC__announcement-bar__sep--trail${dupClass}`}
        aria-hidden="true"
      />
    </>
  )
}

export default function AnnouncementBar() {
  const { liveApps, totalActiveUsers, totalInstalls, totalProfit } = getAnnouncementBarStats()

  const ariaLabel = [
    'Coding Until I Make $100k USD',
    `${formatNumber(liveApps)} apps`,
    `${formatNumber(totalActiveUsers)} users`,
    `${formatNumber(totalInstalls)} installs`,
    `profit: ${formatRevenue(totalProfit)}`,
  ].join(' | ')

  const stripProps = { liveApps, totalActiveUsers, totalInstalls, totalProfit }

  return (
    <div className="CC__announcement-bar">
      <a
        href={YOUTUBE_CHANNEL_URL}
        className="CC__announcement-bar__link"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${ariaLabel}. Open Coded Citadel on YouTube`}
      />

      <div className="CC__announcement-bar__desktop CC__container">
        <p className="CC__announcement-bar__tagline">Coding Until I Make $100k USD</p>
        <ul className="CC__announcement-bar__stats">
          <li>{formatNumber(liveApps)} apps</li>
          <li>{formatNumber(totalActiveUsers)} users</li>
          <li>{formatNumber(totalInstalls)} installs</li>
          <li>profit: {formatRevenue(totalProfit)}</li>
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
