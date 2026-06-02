import { Link } from 'react-router-dom'

export default function SiteFooter() {
  return (
    <footer className="CC__footer">
      <div className="CC__footer-grid CC__container">
        <div className="CC__footer-brand">
          <Link to="/" className="CC__logo">
            <img
              src={`${import.meta.env.BASE_URL}cc-logo-footer.png`}
              alt="Coded Citadel"
              className="CC__logo-img"
            />
            <span className="CC__logo-text">CODED CITADEL</span>
          </Link>
          <p>
            Building in public.
            <br />
            From $0 to $100k.
            <br />
            One app at a time.
          </p>
        </div>
        <div>
          <h4 className="CC__footer-col-title">Explore</h4>
          <ul className="CC__footer-list">
            <li>
              <Link to="/apps">Apps</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
            <li>
              <Link to="/live-stats">Live Stats</Link>
            </li>
            <li>
              <Link to="/#youtube">YouTube Channel</Link>
            </li>
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
            <li>
              <a href="https://x.com/codedCitadel" target="_blank" rel="noopener noreferrer">
                X
              </a>
            </li>
            <li>
              <a href="mailto:codedCitadel@gmail.com">codedCitadel@gmail.com</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="CC__footer-bottom CC__container">
        <p>&copy; 2026 Coded Citadel. All rights reserved.</p>
      </div>
    </footer>
  )
}
