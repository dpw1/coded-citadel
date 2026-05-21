import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import AppsGridSection from '../components/AppsGridSection'
import LiveStatsBar from '../components/LiveStatsBar'
import CyberCorners from '../components/CyberCorners'
import youtubeFeed from '../data/youtube-videos.json'
import '../App.css'

const YOUTUBE_DISPLAY_COUNT = 2
const featuredVideos = youtubeFeed.videos.slice(0, YOUTUBE_DISPLAY_COUNT)

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

export default function HomePage() {
  const [avatarError, setAvatarError] = useState(false)

  return (
    <>
      <SiteHeader />

      <section className="CC__hero" aria-label="Hero – Code to $100K">
        <div className="CC__hero__image" aria-hidden="true">
          <img
            src={`${import.meta.env.BASE_URL}hero-img.png`}
            alt="Glowing dark castle with code symbols – the $100K journey"
          />
        </div>

        <div className="CC__hero__inner">
          <div className="CC__hero__rail" aria-hidden="true">
            <div className="CC__hero__rail-line" />
            <div className="CC__hero__rail-dots">
              <span className="CC__hero__rail-dot" />
              <span className="CC__hero__rail-dot" />
              <span className="CC__hero__rail-dot" />
              <span className="CC__hero__rail-dot" />
            </div>
          </div>

          <div className="CC__hero__content">
            <div className="CC__hero__tag">
              <span className="CC__hero__tag-dot" aria-hidden="true" />
              <span className="CC__hero__tag-text">Building in Public</span>
            </div>
            <h1 className="CC__hero__headline">
              Follow the
              <br />
              Journey of a Man
              <br />
              Coding His Way
              <br />
              to <span className="CC__hero__headline-accent">$100K</span>
            </h1>

            <p className="CC__hero__sub">
              This is not a marketing gist of "making X in Y days" to sell you some course. This is a true, transparent diary of my personal path.
            </p>

            <div className="CC__hero__actions">
              <a
                href="https://www.youtube.com/@CodedCitadel"
                target="_blank"
                rel="noopener noreferrer"
                className="CC__hero__btn CC__hero__btn--primary"
                aria-label="Watch on Youtube"
              >
                <span className="CC__hero__btn-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z" />
                  </svg>
                </span>
                Watch on Youtube
              </a>
              <Link to="/apps" className="CC__hero__btn CC__hero__btn--secondary" aria-label="View Apps">
                <span className="CC__hero__btn-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </span>
                View Apps
              </Link>
            </div>
          </div>
        </div>

        <span className="CC__hero__coords" aria-hidden="true">
          37.7749° N, 122.4194° W
        </span>
      </section>

      <LiveStatsBar />

      <AppsGridSection sectionId="apps" showViewAllLink />

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
          {featuredVideos.length > 0 ? (
            featuredVideos.map((vid) => {
              const meta = excerpt(vid.description, 200)
              const duration = vid.duration || extractDuration(vid.description)
              return (
                <a
                  key={vid.id || vid.link}
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
            })
          ) : (
            <p className="CC__youtube-loading">
              No videos in feed yet. Run <code>npm run fetch-youtube</code> locally, then commit{' '}
              <code>src/data/youtube-videos.json</code>.
            </p>
          )}
        </div>
      </section>

      <section id="about" className="CC__about CC__container">
        <div className="CC__about-grid">
          <div className="CC__about-content">
            <p className="CC__section-eyebrow">About Me</p>
            <h2 className="CC__section-title">Transparency is my priority.</h2>
            <p className="CC__about-text">
              I came across many projects of "making $x in Y days". They all seemed 
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
            <CyberCorners />
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

      <SiteFooter />
    </>
  )
}
