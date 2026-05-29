import { formatNumber, formatRevenue, getAnnouncementBarStats } from '../utils/apps'

const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@CodedCitadel'

function AnnouncementContent({ liveApps, totalActiveUsers, totalInstalls, totalProfit }) {
  return (
    <>
      <p className="CC__announcement-bar__tagline">VibeCoding Until I Make $100k USD</p>
      <ul className="CC__announcement-bar__stats">
        <li>{formatNumber(liveApps)} apps</li>
        <li>{formatNumber(totalActiveUsers)} users</li>
        <li>{formatNumber(totalInstalls)} installs</li>
        <li>profit: {formatRevenue(totalProfit)}</li>
      </ul>
    </>
  )
}

export default function AnnouncementBar() {
  const { liveApps, totalActiveUsers, totalInstalls, totalProfit } = getAnnouncementBarStats()
  const stats = { liveApps, totalActiveUsers, totalInstalls, totalProfit }

  const ariaLabel = [
    'VibeCoding Until I Make $100k USD',
    `${formatNumber(liveApps)} apps`,
    `${formatNumber(totalActiveUsers)} users`,
    `${formatNumber(totalInstalls)} installs`,
    `profit: ${formatRevenue(totalProfit)}`,
  ].join(' | ')

  return (
    <a
      href={YOUTUBE_CHANNEL_URL}
      className="CC__announcement-bar"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${ariaLabel}. Open Coded Citadel on YouTube`}
    >
      <div className="CC__announcement-bar__desktop CC__container">
        <AnnouncementContent {...stats} />
      </div>

      <div className="CC__announcement-bar__marquee">
        <div className="CC__announcement-bar__track">
          <div className="CC__announcement-bar__segment">
            <AnnouncementContent {...stats} />
          </div>
          <div className="CC__announcement-bar__segment" aria-hidden="true">
            <AnnouncementContent {...stats} />
          </div>
        </div>
      </div>
    </a>
  )
}
