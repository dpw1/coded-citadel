import { useEffect, useId, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isPluginsPath, pluginsIndexPath } from '../utils/plugins'
import { scrollToSection } from '../utils/scroll'
import AnnouncementBar from './AnnouncementBar'

const YOUTUBE_URL = 'https://www.youtube.com/@CodedCitadel'

const APPS_DROPDOWN_ITEMS = [
  { to: '/apps', label: 'Chrome Extensions' },
  { to: pluginsIndexPath(), label: 'DaVinci Resolve Plugins' },
]

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [appsOpen, setAppsOpen] = useState(false)
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const appsMenuId = useId().replace(/:/g, '')
  const isHome = pathname === '/'
  const appsNavActive =
    pathname === '/apps' ||
    pathname.startsWith('/apps/') ||
    isPluginsPath(pathname)
  const blogNavActive = pathname === '/blog' || pathname.startsWith('/blog/')
  const liveStatsNavActive = pathname === '/live-stats'

  const closeMenu = () => {
    setMenuOpen(false)
    setAppsOpen(false)
  }

  const handleAboutNav = (e) => {
    e.preventDefault()
    closeMenu()
    if (isHome) {
      scrollToSection('about', { updateHash: true })
    } else {
      navigate('/', { state: { scrollTo: 'about' } })
    }
  }

  useEffect(() => {
    setMenuOpen(false)
    setAppsOpen(false)
  }, [pathname, hash])

  useEffect(() => {
    if (!menuOpen) {
      setAppsOpen(false)
      return undefined
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (appsOpen) {
          setAppsOpen(false)
        } else {
          setMenuOpen(false)
        }
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen, appsOpen])

  return (
    <>
      {menuOpen ? (
        <button type="button" className="CC__nav-backdrop" aria-label="Close menu" onClick={closeMenu} />
      ) : null}
      <div className="CC__site-top">
        <AnnouncementBar />
        <header className="CC__header CC__container">
          <div className="CC__header-brand">
            <Link to="/" className="CC__logo" onClick={closeMenu}>
              <img
                src={`${import.meta.env.BASE_URL}cc-logo-header.png`}
                alt="Coded Citadel"
                className="CC__logo-img"
              />
              <span className="CC__logo-text">CODED CITADEL</span>
            </Link>
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
            <div
              className={`CC__nav-dropdown${appsOpen ? ' CC__nav-dropdown--open' : ''}${
                appsNavActive ? ' CC__nav-dropdown--active' : ''
              }`}
            >
              <button
                type="button"
                className={`CC__nav-link CC__nav-dropdown__trigger${
                  appsNavActive ? ' CC__nav-link--active' : ''
                }`}
                aria-expanded={appsOpen}
                aria-controls={appsMenuId}
                aria-haspopup="true"
                onClick={() => setAppsOpen((open) => !open)}
              >
                Apps
                <svg
                  className="CC__nav-dropdown__chevron"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div id={appsMenuId} className="CC__nav-dropdown__menu" role="menu">
                {APPS_DROPDOWN_ITEMS.map((item) => {
                  const itemActive =
                    pathname === item.to || pathname.startsWith(`${item.to}/`)
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      role="menuitem"
                      className={`CC__nav-dropdown__item${
                        itemActive ? ' CC__nav-dropdown__item--active' : ''
                      }`}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
            <Link
              to="/blog"
              className={`CC__nav-link${blogNavActive ? ' CC__nav-link--active' : ''}`}
              onClick={closeMenu}
            >
              Blog
            </Link>
            <Link
              to="/live-stats"
              className={`CC__nav-link CC__nav-link--with-badge${
                liveStatsNavActive ? ' CC__nav-link--active' : ''
              }`}
              onClick={closeMenu}
            >
              Live Stats
              <span className="CC__nav-badge">
                <span className="CC__nav-badge__fire" aria-hidden="true">
                  🔥
                </span>
                <span className="CC__nav-badge__label">hot</span>
              </span>
            </Link>
            <a
              href={YOUTUBE_URL}
              className="CC__nav-link"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
            >
              YouTube
            </a>
            <a
              href={isHome ? '#about' : '/'}
              className="CC__nav-link"
              onClick={handleAboutNav}
            >
              About
            </a>
          </nav>
        </header>
      </div>
    </>
  )
}
