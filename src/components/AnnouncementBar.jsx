import { formatNumber, formatRevenue, getAnnouncementBarStats } from '../utils/apps'

const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@CodedCitadel'

function MarqueeStrip({ liveApps, totalActiveUsers, totalInstalls, totalProfit }) {
  return (
    <>
      <span className="CC__announcement-bar__marquee-item CC__announcement-bar__marquee-item--tagline">
        VibeCoding Until I Make $100k USD
      </span>
      <span className="CC__announcement-bar__sep" aria-hidden="true" />
      <span className="CC__announcement-bar__marquee-item">{formatNumber(liveApps)} apps</span>
      <span className="CC__announcement-bar__sep" aria-hidden="true" />
      <span className="CC__announcement-bar__marquee-item">{formatNumber(totalActiveUsers)} users</span>
      <span className="CC__announcement-bar__sep" aria-hidden="true" />
      <span className="CC__announcement-bar__marquee-item">{formatNumber(totalInstalls)} installs</span>
      <span className="CC__announcement-bar__sep" aria-hidden="true" />
      <span className="CC__announcement-bar__marquee-item CC__announcement-bar__marquee-item--profit">
        profit: {formatRevenue(totalProfit)}
      </span>
      <span className="CC__announcement-bar__sep CC__announcement-bar__sep--trail" aria-hidden="true" />
    </>
  )
}

export default function AnnouncementBar() {
  const { liveApps, totalActiveUsers, totalInstalls, totalProfit } = getAnnouncementBarStats()

  const ariaLabel = [
    'VibeCoding Until I Make $100k USD',
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
        <p className="CC__announcement-bar__tagline">VibeCoding Until I Make $100k USD</p>
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
          <span className="CC__announcement-bar__marquee-copy">
            <MarqueeStrip {...stripProps} />
          </span>
          <span className="CC__announcement-bar__marquee-copy" aria-hidden="true">
            <MarqueeStrip {...stripProps} />
          </span>
        </div>
      </div>
    </div>
  )
}
