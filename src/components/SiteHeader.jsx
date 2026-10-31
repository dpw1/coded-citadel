import { useEffect, useId, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { appFilterLabel, getAppsForPlatform } from '../utils/apps'
import { isPluginsPath, pluginsIndexPath } from '../utils/plugins'
import { scrollToSection } from '../utils/scroll'
import AnnouncementBar from './AnnouncementBar'

const YOUTUBE_URL = 'https://www.youtube.com/@CodedCitadel'

const APPS_DROPDOWN_LINKS = [
  { to: '/apps', label: 'Chrome Extensions' },
  { to: pluginsIndexPath(), label: 'DaVinci Resolve Plugins' },
]

const TOOLS_DROPDOWN_LINKS = [{ to: '/image-search', label: 'Image search' }]

const PLATFORM_MENU_GROUPS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube', label: 'YouTube' },
]

function navAppDisplayLabel(app) {
  const label = appFilterLabel(app)
  return label.replace(/\bYT\b/g, 'YouTube').replace(/\bIG\b/g, 'Instagram')
}

function ChevronIcon({ className = 'CC__nav-dropdown__chevron' }) {
  return (
    <svg
      className={className}
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
  )
}

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [appsOpen, setAppsOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [platformOpen, setPlatformOpen] = useState(null)
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const appsMenuId = useId().replace(/:/g, '')
  const aboutMenuId = useId().replace(/:/g, '')
  const toolsMenuId = useId().replace(/:/g, '')
  const isHome = pathname === '/'
  const appsNavActive =
    pathname === '/apps' ||
    pathname.startsWith('/apps/') ||
    isPluginsPath(pathname)
  const blogNavActive = pathname === '/blog' || pathname.startsWith('/blog/')
  const aboutSectionActive = isHome && hash === '#about'
  const aboutNavActive = blogNavActive || aboutSectionActive
  const toolsNavActive =
    pathname === '/image-search' || pathname === '/reverse-image-search'
  const workNavActive = pathname === '/work' || pathname.startsWith('/work/')
  const contactNavActive = pathname === '/contact'

  const platformGroups = useMemo(
    () =>
      PLATFORM_MENU_GROUPS.map((group) => ({
        ...group,
        apps: getAppsForPlatform(group.id),
      })).filter((group) => group.apps.length > 0),
    [],
  )

  const closeMenu = () => {
    setMenuOpen(false)
    setAppsOpen(false)
    setAboutOpen(false)
    setToolsOpen(false)
    setPlatformOpen(null)
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
    setToolsOpen(false)
    setPlatformOpen(null)
  }, [pathname, hash])

  useEffect(() => {
    if (!menuOpen) {
      setAppsOpen(false)
      setAboutOpen(false)
      setToolsOpen(false)
      setPlatformOpen(null)
      return undefined
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (platformOpen) {
          setPlatformOpen(null)
        } else if (appsOpen) {
          setAppsOpen(false)
        } else if (toolsOpen) {
          setToolsOpen(false)
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
  }, [menuOpen, appsOpen, aboutOpen, toolsOpen, platformOpen])

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
                  setToolsOpen(false)
                  setPlatformOpen(null)
                }}
              >
                Apps
                <ChevronIcon />
              </button>
              <div id={appsMenuId} className="CC__nav-dropdown__menu" role="menu">
                {APPS_DROPDOWN_LINKS.map((item) => {
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

                {platformGroups.map((group) => {
                  const submenuId = `${appsMenuId}-${group.id}`
                  const isOpen = platformOpen === group.id
                  const groupActive = group.apps.some(
                    (app) => pathname === `/apps/${app.slug}`,
                  )

                  return (
                    <div
                      key={group.id}
                      className={`CC__nav-submenu${isOpen ? ' CC__nav-submenu--open' : ''}${
                        groupActive ? ' CC__nav-submenu--active' : ''
                      }`}
                      onMouseEnter={() => setPlatformOpen(group.id)}
                      onFocus={() => setPlatformOpen(group.id)}
                    >
                      <button
                        type="button"
                        className={`CC__nav-dropdown__item CC__nav-submenu__trigger${
                          groupActive ? ' CC__nav-dropdown__item--active' : ''
                        }`}
                        aria-expanded={isOpen}
                        aria-controls={submenuId}
                        aria-haspopup="true"
                        onClick={() =>
                          setPlatformOpen((current) =>
                            current === group.id ? null : group.id,
                          )
                        }
                      >
                        {group.label}
                        <ChevronIcon className="CC__nav-submenu__chevron" />
                      </button>
                      <div id={submenuId} className="CC__nav-submenu__menu" role="menu">
                        {group.apps.map((app) => {
                          const to = `/apps/${app.slug}`
                          const itemActive = pathname === to
                          return (
                            <Link
                              key={app.slug}
                              to={to}
                              role="menuitem"
                              className={`CC__nav-dropdown__item${
                                itemActive ? ' CC__nav-dropdown__item--active' : ''
                              }`}
                              onClick={closeMenu}
                            >
                              {navAppDisplayLabel(app)}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                <Link
                  to="/apps"
                  role="menuitem"
                  className={`CC__nav-dropdown__item${
                    pathname === '/apps' ? ' CC__nav-dropdown__item--active' : ''
                  }`}
                  onClick={closeMenu}
                >
                  All Apps
                </Link>
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
                  setToolsOpen(false)
                  setPlatformOpen(null)
                }}
              >
                About
                <ChevronIcon />
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
            <div
              className={`CC__nav-dropdown${toolsOpen ? ' CC__nav-dropdown--open' : ''}${
                toolsNavActive ? ' CC__nav-dropdown--active' : ''
              }`}
            >
              <button
                type="button"
                className={`CC__nav-link CC__nav-dropdown__trigger${
                  toolsNavActive ? ' CC__nav-link--active' : ''
                }`}
                aria-expanded={toolsOpen}
                aria-controls={toolsMenuId}
                aria-haspopup="true"
                onClick={() => {
                  setToolsOpen((open) => !open)
                  setAppsOpen(false)
                  setAboutOpen(false)
                  setPlatformOpen(null)
                }}
              >
                Tools
                <ChevronIcon />
              </button>
              <div id={toolsMenuId} className="CC__nav-dropdown__menu" role="menu">
                {TOOLS_DROPDOWN_LINKS.map((item) => {
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
