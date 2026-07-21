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
  const [aboutOpen, setAboutOpen] = useState(false)
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const appsMenuId = useId().replace(/:/g, '')
  const aboutMenuId = useId().replace(/:/g, '')
  const isHome = pathname === '/'
  const appsNavActive =
    pathname === '/apps' ||
    pathname.startsWith('/apps/') ||
    isPluginsPath(pathname)
  const blogNavActive = pathname === '/blog' || pathname.startsWith('/blog/')
  const aboutSectionActive = isHome && hash === '#about'
  const aboutNavActive = blogNavActive || aboutSectionActive
  const liveStatsNavActive = pathname === '/live-stats'
  const workNavActive = pathname === '/work'
  const contactNavActive = pathname === '/contact'

  const closeMenu = () => {
    setMenuOpen(false)
    setAppsOpen(false)
    setAboutOpen(false)
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
    setAboutOpen(false)
  }, [pathname, hash])

  useEffect(() => {
    if (!menuOpen) {
      setAppsOpen(false)
      setAboutOpen(false)
      return undefined
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (appsOpen) {
          setAppsOpen(false)
        } else if (aboutOpen) {
          setAboutOpen(false)
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
  }, [menuOpen, appsOpen, aboutOpen])

  return (
    <>
      {menuOpen ? (
        <button type="button" className="CC__nav-backdrop" aria-label="Close menu" onClick={closeMenu} />
      ) : null}
      <div className="CC__site-top">
        {!workNavActive ? <AnnouncementBar /> : null}
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
                onClick={() => {
                  setAppsOpen((open) => !open)
                  setAboutOpen(false)
                }}
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
            <div
              className={`CC__nav-dropdown${aboutOpen ? ' CC__nav-dropdown--open' : ''}${
                aboutNavActive ? ' CC__nav-dropdown--active' : ''
              }`}
            >
              <button
                type="button"
                className={`CC__nav-link CC__nav-dropdown__trigger${
                  aboutNavActive ? ' CC__nav-link--active' : ''
                }`}
                aria-expanded={aboutOpen}
                aria-controls={aboutMenuId}
                aria-haspopup="true"
                onClick={() => {
                  setAboutOpen((open) => !open)
                  setAppsOpen(false)
                }}
              >
                About
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
              <div id={aboutMenuId} className="CC__nav-dropdown__menu" role="menu">
                <Link
                  to="/blog"
                  role="menuitem"
                  className={`CC__nav-dropdown__item${
                    blogNavActive ? ' CC__nav-dropdown__item--active' : ''
                  }`}
                  onClick={closeMenu}
                >
                  Blog
                </Link>
                <a
                  href={YOUTUBE_URL}
                  role="menuitem"
                  className="CC__nav-dropdown__item"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                >
                  YouTube
                </a>
                <a
                  href={isHome ? '#about' : '/'}
                  role="menuitem"
                  className={`CC__nav-dropdown__item${
                    aboutSectionActive ? ' CC__nav-dropdown__item--active' : ''
                  }`}
                  onClick={handleAboutNav}
                >
                  About me
                </a>
              </div>
            </div>
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
            <Link
              to="/work"
              className={`CC__nav-link${workNavActive ? ' CC__nav-link--active' : ''}`}
              onClick={closeMenu}
            >
              Hire me
            </Link>
            <Link
              to="/contact"
              className={`CC__nav-link${contactNavActive ? ' CC__nav-link--active' : ''}`}
              onClick={closeMenu}
            >
              Contact
            </Link>
          </nav>
        </header>
      </div>
    </>
  )
}
