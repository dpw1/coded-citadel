import { useEffect, useId, useState } from 'react'
import {
  CHANGELOG_TIME_PRESETS,
  getChangelogTimePresetLabel,
} from '../../utils/extensionChangelogs'
import './PortfolioStatsFilter.css'

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export default function ChangelogTimeFilter({ value = 'all', onChange }) {
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const isFiltered = value !== 'all'
  const label = getChangelogTimePresetLabel(value)

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function selectPreset(presetId) {
    onChange?.(presetId)
    setOpen(false)
  }

  return (
    <div className="stats-filter">
      <button
        type="button"
        className={`stats-filter__trigger${isFiltered ? ' stats-filter__trigger--active' : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <span className="stats-filter__trigger-icon">
          <CalendarIcon />
        </span>
        {label}
        {isFiltered ? <span className="stats-filter__badge" aria-hidden="true" /> : null}
      </button>

      {open ? (
        <div className="stats-filter__overlay" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="stats-filter__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="stats-filter__header">
              <h2 id={titleId} className="stats-filter__title">
                Time range
              </h2>
              <button
                type="button"
                className="stats-filter__close"
                aria-label="Close time filter"
                onClick={() => setOpen(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <div className="stats-filter__body">
              <section className="stats-filter__section">
                <h3 className="stats-filter__section-title">Show changes from</h3>
                <div className="stats-filter__quick-dates" role="group" aria-label="Changelog time ranges">
                  {CHANGELOG_TIME_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`stats-filter__quick-btn${
                        value === preset.id ? ' stats-filter__quick-btn--active' : ''
                      }`}
                      aria-pressed={value === preset.id}
                      onClick={() => selectPreset(preset.id)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
