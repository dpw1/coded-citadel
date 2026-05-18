import React, { useEffect, useState } from 'react'
import './App.css'

const RSS2JSON_URL =
  'https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=UC4Ts3s6hRQXY1L-Awh4PzPg'

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function excerpt(text, len = 160) {
  const t = stripHtml(text)
  if (!t) return ''
  return t.length <= len ? t : `${t.slice(0, len)}…`
}

function extractDuration(text) {
  if (!text) return null
  const m = stripHtml(text).match(/\b(\d{1,2}:\d{2}(?::\d{2})?)\b/)
  return m ? m[1] : null
}

export default function App() {
  const [videos, setVideos] = useState([])
  const [videosStatus, setVideosStatus] = useState('loading')
  const [avatarError, setAvatarError] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch(RSS2JSON_URL)
        const data = await response.json()
        if (cancelled) return
        if (data.items?.length) {
          setVideos(data.items.slice(0, 2))
        }
        setVideosStatus('ready')
      } catch {
        if (!cancelled) setVideosStatus('error')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      {menuOpen ? (
        <button type="button" className="CC__nav-backdrop" aria-label="Close menu" onClick={closeMenu} />
      ) : null}
      <header className="CC__header CC__container">
        <div className="CC__header-brand">
          <a href="#" className="CC__logo" onClick={closeMenu}>
            <span className="CC__logo-icon">&lt;/&gt;</span> CODED CITADEL
          </a>
        </div>
        <button
          type="button"
          className="CC__nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="CC__main-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="CC__nav-toggle-bar" />
          <span className="CC__nav-toggle-bar" />
          <span className="CC__nav-toggle-bar" />
        </button>
        <nav id="CC__main-nav" className={`CC__nav${menuOpen ? ' CC__nav--open' : ''}`}>
          <a href="#extensions" className="CC__nav-link" onClick={closeMenu}>
            Extensions
          </a>
          <a href="#youtube" className="CC__nav-link" onClick={closeMenu}>
            YouTube
          </a>
          <a href="#about" className="CC__nav-link" onClick={closeMenu}>
            About
          </a>
          {/* <a href="#" className="CC__nav-link">Roadmap</a> */}
        </nav>
      </header>

      <section className="CC__hero">
        <div className="CC__hero-inner CC__container">
          <p className="CC__section-eyebrow">• Building In Public</p>
          <h1 className="CC__hero-title">
            Follow the journey of a man coding his way to <span>$100K</span>
          </h1>
          <p className="CC__hero-description">
            Building Chrome extensions. Sharing every win, fail, and lesson learned. One extension at a time.
          </p>
          <div className="CC__hero-actions">
            <a
              href="https://www.youtube.com/@CodedCitadel"
              target="_blank"
              rel="noopener noreferrer"
              className="CC__btn CC__btn--primary"
            >
              Subscribe on YouTube
            </a>
            <a href="#extensions" className="CC__btn CC__btn--outline">
              View Extensions
            </a>
          </div>
        </div>
      </section>

      <div className="CC__stats-section CC__container">
        <div className="CC__stats-grid CC__cyber-accent">
          <div className="CC__stat-box CC__stat-box--live">
            <span>LIVE STATS •</span>
          </div>
          <div className="CC__stat-box">
            <span className="CC__stat-label">Total Revenue</span>
            <span className="CC__stat-value">
              $0 <span className="CC__stat-change">+$0 today</span>
            </span>
          </div>
          <div className="CC__stat-box">
            <span className="CC__stat-label">Total Installs</span>
            <span className="CC__stat-value">
              0 <span className="CC__stat-change">+$0 today</span>
            </span>
          </div>
          <div className="CC__stat-box">
            <span className="CC__stat-label">Extensions Built</span>
            <span className="CC__stat-value">
              1 <span className="CC__stat-subtext">+1 in progress</span>
            </span>
          </div>
          <div className="CC__stat-box">
            <span className="CC__stat-label">Days Into Journey</span>
            <span className="CC__stat-value">
              6 <span className="CC__stat-subtext">Since Day 1</span>
            </span>
          </div>
        </div>
      </div>

      <section id="extensions" className="CC__extensions CC__container">
        <div className="CC__section-header-row">
          <div>
            <p className="CC__section-eyebrow">My Extensions</p>
            <h2 className="CC__section-title">Built To Solve Real Problems</h2>
          </div>
          <a href="#" className="CC__view-all-link">
            View all extensions →
          </a>
        </div>

        <div className="CC__extensions-grid">
          <div className="CC__extension-card CC__cyber-accent">
            <div className="CC__extension-inner">
              <div className="CC__extension-top">
                <div className="CC__extension-icon-box">⚡</div>
                <div className="CC__extension-meta">
                  <h3>
                    YT Comments Exporter <span className="CC__extension-version">v1.0.0</span>
                  </h3>
                  <p className="CC__extension-summary">
                    Export YouTube comments flawlessly into structured analysis layouts.
                  </p>
                </div>
              </div>
              <div className="CC__extension-metrics">
                <div>
                  <span className="CC__metric-item-label">INSTALLS</span>
                  <div className="CC__metric-item-value">0</div>
                </div>
                <div>
                  <span className="CC__metric-item-label">REVENUE</span>
                  <div className="CC__metric-item-value">$0</div>
                </div>
              </div>
            </div>
            <a
              href="https://chromewebstore.google.com/detail/youtube-comments-exporter/epokpidfnienjjfncmhnallghfhaijbj"
              target="_blank"
              rel="noopener noreferrer"
              className="CC__btn CC__btn--primary CC__btn--full"
            >
              Install on Chrome
            </a>
          </div>

          <div className="CC__extension-card CC__extension-card--disabled CC__cyber-accent">
            <div className="CC__extension-inner">
              <div className="CC__extension-top">
                <div className="CC__extension-icon-box">🛡️</div>
                <div className="CC__extension-meta">
                  <h3>
                    Shieldy <span className="CC__extension-version">v1.0.3</span>
                  </h3>
                  <p className="CC__extension-summary">
                    Block distractions, filter out clickbait, and reclaim your digital focus.
                  </p>
                </div>
              </div>
              <div className="CC__extension-metrics">
                <div>
                  <span className="CC__metric-item-label">INSTALLS</span>
                  <div className="CC__metric-item-value">—</div>
                </div>
                <div>
                  <span className="CC__metric-item-label">REVENUE</span>
                  <div className="CC__metric-item-value">—</div>
                </div>
              </div>
            </div>
            <button type="button" disabled className="CC__btn CC__btn--outline CC__btn--full">
              Coming Soon
            </button>
          </div>
        </div>
      </section>

      <section id="youtube" className="CC__youtube CC__container">
        <div className="CC__section-header-row">
          <div>
            <p className="CC__section-eyebrow">YouTube Series</p>
            <h2 className="CC__section-title">The Journey</h2>
          </div>
          <a
            href="https://www.youtube.com/@CodedCitadel"
            target="_blank"
            rel="noopener noreferrer"
            className="CC__view-all-link"
          >
            View all videos on YouTube →
          </a>
        </div>

        <div className="CC__youtube-grid">
          {videosStatus === 'loading' && <p className="CC__youtube-loading">Loading latest videos...</p>}
          {videosStatus === 'error' && (
            <p className="CC__youtube-loading">Could not load videos. Try again later or open YouTube directly.</p>
          )}
          {videosStatus === 'ready' &&
            videos.map((vid, index) => {
              const meta = excerpt(vid.description, 200)
              const duration = extractDuration(vid.description || vid.content)
              return (
                <a
                  key={vid.guid || vid.link || index}
                  href={vid.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="CC__video-card"
                >
                  <div className="CC__video-thumb-wrapper">
                    {vid.thumbnail && <img src={vid.thumbnail} alt={vid.title} />}
                    {duration ? <span className="CC__video-duration">{duration}</span> : null}
                  </div>
                  <div className="CC__video-info">
                    <h3 className="CC__video-title">{vid.title}</h3>
                    {meta ? <p className="CC__video-meta">{meta}</p> : null}
                  </div>
                </a>
              )
            })}
          {videosStatus === 'ready' && videos.length === 0 && (
            <p className="CC__youtube-loading">No videos available right now.</p>
          )}
        </div>
      </section>

      <section id="about" className="CC__about CC__container">
        <div className="CC__about-grid">
          <div className="CC__about-content">
            <p className="CC__section-eyebrow">About Me</p>
            <h2 className="CC__section-title">
              Builder. Learner.
              <br />
              Documenting it all.
            </h2>
            <p className="CC__about-text">
              I'm just a guy who loves building things on the internet. No massive seed funding rounds, no large complex
              dev team—just code, curiosity, and execution consistency. I believe in working transparently, helping devs
              scale, and proving indie hackers can craft real businesses.
            </p>
            <p className="CC__about-signature">— Coded Citadel</p>
            <div className="CC__tag-cloud">
              <span className="CC__tag"># Indie Hacker</span>
              <span className="CC__tag"># Chrome Extension Dev</span>
              <span className="CC__tag"># Lifelong Learner</span>
            </div>
          </div>
          <div
            className={`CC__about-image-frame CC__cyber-accent${avatarError ? ' CC__about-image-frame--empty' : ''}`}
          >
            {!avatarError ? (
              <img
                src={`${import.meta.env.BASE_URL}avatar-citadel.png`}
                alt="Coded Citadel Dev Portrait"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span>Add portrait as public/avatar-citadel.png</span>
            )}
          </div>
        </div>
      </section>

      <footer className="CC__footer">
        <div className="CC__footer-grid CC__container">
          <div className="CC__footer-brand">
            <a href="#" className="CC__logo">
              <span className="CC__logo-icon">&lt;/&gt;</span> CODED CITADEL
            </a>
            <p>
              Building in public.
              <br />
              From $0 to $100k.
              <br />
              One extension at a time.
            </p>
          </div>
          <div>
            <h4 className="CC__footer-col-title">Explore</h4>
            <ul className="CC__footer-list">
              <li>
                <a href="#extensions">Chrome Extensions</a>
              </li>
              <li>
                <a href="#youtube">YouTube Channel</a>
              </li>
              {/* <li><a href="#">Roadmap</a></li> */}
            </ul>
          </div>
          <div>
            <h4 className="CC__footer-col-title">Connect</h4>
            <ul className="CC__footer-list">
              <li>
                <a href="https://www.youtube.com/@CodedCitadel" target="_blank" rel="noopener noreferrer">
                  YouTube
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/CodedCitadel" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          {/* Stay Updated — disabled for now
          <div>
            <h4 className="CC__footer-col-title">Stay Updated</h4>
            <p className="CC__footer-newsletter-blurb">Get updates on new apps, failures, and breakthroughs.</p>
            <form
              className="CC__newsletter-form"
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              <input type="email" placeholder="Enter your email" className="CC__newsletter-input" required />
              <button type="submit" className="CC__btn CC__btn--primary CC__newsletter-submit">
                ➔
              </button>
            </form>
          </div>
          */}
        </div>
        <div className="CC__footer-bottom">
          <p>&copy; 2026 Coded Citadel. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
