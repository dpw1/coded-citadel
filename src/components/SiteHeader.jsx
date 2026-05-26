import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { scrollToSection } from '../utils/scroll'

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const isHome = pathname === '/'
  const appsNavActive = pathname === '/apps' || pathname.startsWith('/apps/')

  const closeMenu = () => setMenuOpen(false)

  const handleYoutubeNav = (e) => {
    e.preventDefault()
    closeMenu()
    if (isHome) {
      scrollToSection('youtube', { updateHash: true })
    } else {
      navigate('/', { state: { scrollTo: 'youtube' } })
    }
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
  }, [pathname, hash])

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

  return (
    <>
      {menuOpen ? (
        <button type="button" className="CC__nav-backdrop" aria-label="Close menu" onClick={closeMenu} />
      ) : null}
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
          <Link
            to="/apps"
            className={`CC__nav-link${appsNavActive ? ' CC__nav-link--active' : ''}`}
            onClick={closeMenu}
          >
            Apps
          </Link>
          <a
            href={isHome ? '#youtube' : '/'}
            className="CC__nav-link"
            onClick={handleYoutubeNav}
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
    </>
  )
}
