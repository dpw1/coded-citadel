import { useEffect, useRef, useState } from 'react'
import { formatNumber, formatRevenue, getAnnouncementBarStats } from '../utils/apps'

const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@CodedCitadel'
const MOBILE_MQ = '(max-width: 749px)'
const SCROLL_PX_PER_FRAME = 0.3
const LOOP_GAP_PX = 64

function readLayout() {
  if (typeof window === 'undefined') {
    return { mobile: false, reduced: false }
  }
  return {
    mobile: window.matchMedia(MOBILE_MQ).matches,
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }
}

function AnnouncementContent({ liveApps, totalActiveUsers, totalInstalls, totalProfit }) {
  return (
    <>
      <p className="CC__announcement-bar__tagline">VibeCoding Until I Make $100k USD</p>
      <ul className="CC__announcement-bar__stats">
        <li>{formatNumber(liveApps)} apps</li>
        <li>{formatNumber(totalActiveUsers)} users</li>
        <li>{formatNumber(totalInstalls)} installs</li>
        <li className="CC__announcement-bar__stat-profit">profit: {formatRevenue(totalProfit)}</li>
      </ul>
    </>
  )
}

function AnnouncementMobileMarquee({ stats }) {
  const trackRef = useRef(null)
  const measureRef = useRef(null)
  const offsetRef = useRef(0)
  const loopWidthRef = useRef(0)
  const rafRef = useRef(0)
  const pausedRef = useRef(false)
  const [layout, setLayout] = useState(readLayout)
  const scroll = layout.mobile && !layout.reduced

  useEffect(() => {
    const mobileMq = window.matchMedia(MOBILE_MQ)
    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)')

    const syncLayout = () => setLayout(readLayout())

    const onLoad = () => syncLayout()

    mobileMq.addEventListener('change', syncLayout)
    reducedMq.addEventListener('change', syncLayout)

    if (document.readyState === 'complete') {
      syncLayout()
    } else {
      window.addEventListener('load', onLoad)
    }

    return () => {
      window.removeEventListener('load', onLoad)
      mobileMq.removeEventListener('change', syncLayout)
      reducedMq.removeEventListener('change', syncLayout)
    }
  }, [])

  useEffect(() => {
    if (!scroll) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      offsetRef.current = 0
      if (trackRef.current) {
        trackRef.current.style.transform = 'translate3d(0, 0, 0)'
      }
      return undefined
    }

    const measureLoop = () => {
      const el = measureRef.current
      if (!el) return 0
      return Math.ceil(el.getBoundingClientRect().width) + LOOP_GAP_PX
    }

    const stopLoop = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }

    const runLoop = () => {
      stopLoop()

      const step = () => {
        const loopW = loopWidthRef.current
        const track = trackRef.current
        if (!track || loopW <= 0) {
          rafRef.current = requestAnimationFrame(step)
          return
        }

        if (!pausedRef.current) {
          offsetRef.current -= SCROLL_PX_PER_FRAME
          if (offsetRef.current <= -loopW) {
            offsetRef.current = 0
          }
          track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
        }

        rafRef.current = requestAnimationFrame(step)
      }

      rafRef.current = requestAnimationFrame(step)
    }

    const remeasure = () => {
      loopWidthRef.current = measureLoop()
    }

    const boot = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          remeasure()
          offsetRef.current = 0
          runLoop()
        })
      })
    }

    let resizeObserver
    if (measureRef.current) {
      resizeObserver = new ResizeObserver(remeasure)
      resizeObserver.observe(measureRef.current)
    }

    const onWindowResize = () => remeasure()
    window.addEventListener('resize', onWindowResize)

    if (document.readyState === 'complete') {
      boot()
    } else {
      window.addEventListener('load', boot, { once: true })
    }

    return () => {
      stopLoop()
      window.removeEventListener('load', boot)
      window.removeEventListener('resize', onWindowResize)
      resizeObserver?.disconnect()
    }
  }, [scroll, stats.liveApps, stats.totalActiveUsers, stats.totalInstalls, stats.totalProfit])

  if (!layout.mobile) return null

  if (!scroll) {
    return (
      <div className="CC__announcement-bar__marquee CC__announcement-bar__marquee--static">
        <div className="CC__announcement-bar__marquee-item">
          <AnnouncementContent {...stats} />
        </div>
      </div>
    )
  }

  return (
    <div
      className="CC__announcement-bar__marquee"
      onPointerEnter={() => {
        pausedRef.current = true
      }}
      onPointerLeave={() => {
        pausedRef.current = false
      }}
    >
      <div className="CC__announcement-bar__marquee-viewport">
        <div ref={trackRef} className="CC__announcement-bar__marquee-track">
          <div ref={measureRef} className="CC__announcement-bar__marquee-item">
            <AnnouncementContent {...stats} />
          </div>
          <div className="CC__announcement-bar__marquee-item" aria-hidden="true">
            <AnnouncementContent {...stats} />
          </div>
        </div>
      </div>
    </div>
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

      <AnnouncementMobileMarquee stats={stats} />
    </div>
  )
}
