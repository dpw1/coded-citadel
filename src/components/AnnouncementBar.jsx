import { useEffect } from 'react'
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

  useEffect(() => {
    let cancelled = false

    function startMarquee() {
      if (cancelled) return
      import('../utils/marquee3k.js').then(({ initAnnouncementMarquee }) => {
        if (!cancelled) initAnnouncementMarquee()
      })
    }

    if (document.readyState === 'complete') {
      startMarquee()
    } else {
      window.addEventListener('load', startMarquee)
    }

    return () => {
      cancelled = true
      window.removeEventListener('load', startMarquee)
      import('../utils/marquee3k.js').then(({ destroyAnnouncementMarquee }) => {
        destroyAnnouncementMarquee()
      })
    }
  }, [])

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
        <AnnouncementContent {...stats} />
      </div>

      <div className="CC__announcement-bar__marquee" aria-hidden="true">
        <div
          className="CC__announcement-bar__marquee-root"
          data-cc-announcement-marquee
          data-speed-desktop="0.55"
          data-speed-mobile="0.65"
          data-pausable="true"
          data-reverse="false"
          data-gap-desktop="48"
          data-gap-mobile="32"
        >
          <div className="CC__announcement-bar__marquee-content">
            <div className="CC__announcement-bar__segment">
              <AnnouncementContent {...stats} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
