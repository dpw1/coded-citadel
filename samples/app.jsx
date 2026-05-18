import React, { useEffect, useState } from 'react';
import './App.css'; // Add your component-specific BEM styles here

function App() {
  const [videos, setVideos] = useState([]);

  // Note: Fetching YouTube XML directly from the client might hit CORS issues.
  // For a static site, consider using an intermediary service like rss2json.com 
  // or a GitHub Action that fetches the XML and saves it as a local JSON file before building.
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=UC4Ts3s6hRQXY1L-Awh4PzPg`;
        const response = await fetch(rss2jsonUrl);
        const data = await response.json();
        if (data.items) {
          setVideos(data.items.slice(0, 2)); // Grab latest 2 videos
        }
      } catch (error) {
        console.error("Failed to fetch videos", error);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="CC__app">
      {/* HEADER */}
      <header className="CC__header CC__container">
        <div className="CC__header-logo">
          <img src="/logo.svg" alt="Coded Citadel" className="CC__logo-img" />
        </div>
        <nav className="CC__header-nav">
          <a href="#extensions" className="CC__nav-link">Extensions</a>
          <a href="#youtube" className="CC__nav-link">YouTube</a>
          <a href="#about" className="CC__nav-link">About</a>
          <a href="#roadmap" className="CC__nav-link">Roadmap</a>
        </nav>
      </header>

      {/* HERO SECTION */}
      {/* Background image should be applied via CSS to CC__hero */}
      <section className="CC__hero CC__container">
        <div className="CC__hero-content">
          <p className="CC__hero-eyebrow">• BUILDING IN PUBLIC</p>
          <h1 className="CC__hero-title">
            FOLLOW THE JOURNEY OF A MAN CODING HIS WAY TO <span className="CC__highlight">$100K</span>
          </h1>
          <p className="CC__hero-subtitle">
            Building Chrome extensions. Sharing every win, fail, and lesson learned. One extension at a time.
          </p>
          <div className="CC__hero-actions">
            <a href="https://www.youtube.com/@CodedCitadel" target="_blank" className="CC__btn CC__btn--primary">
              Subscribe on YouTube
            </a>
            <a href="#extensions" className="CC__btn CC__btn--outline">
              View Extensions
            </a>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="CC__stats-wrapper CC__container">
        <div className="CC__stats-bar">
          <div className="CC__stat-item CC__stat-item--live">
            <span className="CC__stat-label">LIVE STATS •</span>
          </div>
          <div className="CC__stat-item">
            <span className="CC__stat-label">TOTAL REVENUE</span>
            <span className="CC__stat-value">$0</span>
          </div>
          <div className="CC__stat-item">
            <span className="CC__stat-label">TOTAL INSTALLS</span>
            <span className="CC__stat-value">0</span>
          </div>
          <div className="CC__stat-item">
            <span className="CC__stat-label">EXTENSIONS BUILT</span>
            <span className="CC__stat-value">1 <span className="CC__stat-sub">+ 1 in progress</span></span>
          </div>
          <div className="CC__stat-item">
            <span className="CC__stat-label">DAYS INTO JOURNEY</span>
            <span className="CC__stat-value">5 <span className="CC__stat-sub">Since May 12, 2026</span></span>
          </div>
        </div>
      </section>

      {/* EXTENSIONS SECTION */}
      <section id="extensions" className="CC__extensions CC__container">
        <div className="CC__section-header">
          <div>
            <p className="CC__section-eyebrow">MY EXTENSIONS</p>
            <h2 className="CC__section-title">BUILT TO SOLVE REAL PROBLEMS</h2>
          </div>
          <a href="#" className="CC__link-arrow">View all extensions →</a>
        </div>

        <div className="CC__extensions-grid">
          {/* Extension 1: YouTube Comments Exporter */}
          <div className="CC__extension-card">
            <div className="CC__extension-card-header">
              <div className="CC__extension-icon">YT</div>
              <div>
                <h3 className="CC__extension-name">YT Comments Exporter <span className="CC__badge">v1.0.0</span></h3>
                <p className="CC__extension-desc">Export YouTube comments seamlessly for analysis and backup.</p>
              </div>
            </div>
            <div className="CC__extension-stats">
              <div className="CC__ext-stat">
                <span className="CC__ext-stat-label">INSTALLS</span>
                <span className="CC__ext-stat-value">0</span>
              </div>
              <div className="CC__ext-stat">
                <span className="CC__ext-stat-label">REVENUE</span>
                <span className="CC__ext-stat-value">$0</span>
              </div>
            </div>
            <a href="https://chromewebstore.google.com/detail/youtube-comments-exporter/epokpidfnienjjfncmhnallghfhaijbj" target="_blank" className="CC__btn CC__btn--primary CC__btn--full">
              Install on Chrome
            </a>
          </div>

          {/* Extension 2: In Progress */}
          <div className="CC__extension-card CC__extension-card--inactive">
            <div className="CC__extension-card-header">
              <div className="CC__extension-icon">?</div>
              <div>
                <h3 className="CC__extension-name">Project Two <span className="CC__badge">In Dev</span></h3>
                <p className="CC__extension-desc">Currently building in the shadows. Subscribe to see it launch.</p>
              </div>
            </div>
            <div className="CC__extension-stats">
              <div className="CC__ext-stat">
                <span className="CC__ext-stat-label">INSTALLS</span>
                <span className="CC__ext-stat-value">-</span>
              </div>
              <div className="CC__ext-stat">
                <span className="CC__ext-stat-label">REVENUE</span>
                <span className="CC__ext-stat-value">-</span>
              </div>
            </div>
            <button disabled className="CC__btn CC__btn--outline CC__btn--full">
              Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* YOUTUBE SECTION */}
      <section id="youtube" className="CC__youtube CC__container">
         <div className="CC__section-header">
          <div>
            <p className="CC__section-eyebrow">YOUTUBE SERIES</p>
            <h2 className="CC__section-title">THE JOURNEY</h2>
          </div>
          <a href="https://www.youtube.com/@CodedCitadel" target="_blank" className="CC__link-arrow">View all videos on YouTube →</a>
        </div>
        
        <div className="CC__youtube-grid">
          {videos.length > 0 ? (
            videos.map((vid, index) => (
              <a href={vid.link} target="_blank" key={index} className="CC__video-card">
                <div className="CC__video-thumbnail">
                  <img src={vid.thumbnail} alt={vid.title} />
                </div>
                <h3 className="CC__video-title">{vid.title}</h3>
              </a>
            ))
          ) : (
             <p className="CC__text-muted">Loading latest videos...</p>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="CC__footer CC__container">
        <div className="CC__footer-content">
          <div className="CC__footer-brand">
            <img src="/logo.svg" alt="Coded Citadel" className="CC__footer-logo" />
            <p>Building in public.<br/>From $0 to $100k.<br/>One extension at a time.</p>
          </div>
          <div className="CC__footer-links">
             <h4 className="CC__footer-heading">CONNECT</h4>
             <a href="https://www.youtube.com/@CodedCitadel" target="_blank">YouTube</a>
             <a href="https://www.instagram.com/CodedCitadel" target="_blank">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;