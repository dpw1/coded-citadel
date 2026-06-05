import { useEffect, useId, useState } from 'react'
import ChromeIcon from '../ChromeIcon'
import { appFilterLabel } from '../../utils/apps'
import {
  detectDatePreset,
  getDateRangeForPreset,
  PORTFOLIO_DATE_PRESETS,
} from '../../utils/portfolioAnalytics'
import './PortfolioStatsFilter.css'

function FilterIcon() {
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
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

export default function PortfolioStatsFilter({
  apps,
  selectedKeys,
  onSelectedKeysChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  minDate,
  maxDate,
}) {
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const [draftKeys, setDraftKeys] = useState(selectedKeys)
  const [draftFrom, setDraftFrom] = useState(dateFrom)
  const [draftTo, setDraftTo] = useState(dateTo)
  const [draftDateMode, setDraftDateMode] = useState('all')

  const allKeys = apps.map((app) => app.key)
  const allSelected = selectedKeys.size === apps.length
  const hasDateFilter = Boolean(dateFrom || dateTo)
  const isFiltered = hasDateFilter || !allSelected

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

  function openModal() {
    setDraftKeys(new Set(selectedKeys))
    setDraftFrom(dateFrom)
    setDraftTo(dateTo)
    setDraftDateMode(detectDatePreset(dateFrom, dateTo, maxDate, minDate))
    setOpen(true)
  }

  function closeModal() {
    setOpen(false)
  }

  function selectDatePreset(presetId) {
    setDraftDateMode(presetId)

    if (presetId === 'custom') return

    const range = getDateRangeForPreset(presetId, maxDate, minDate)
    if (!range) return

    setDraftFrom(range.from)
    setDraftTo(range.to)
  }

  function onCustomFromChange(value) {
    setDraftDateMode('custom')
    setDraftFrom(value)
  }

  function onCustomToChange(value) {
    setDraftDateMode('custom')
    setDraftTo(value)
  }

  function toggleDraftKey(key) {
    setDraftKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size <= 1) return prev
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function selectAllDraft() {
    setDraftKeys(new Set(allKeys))
  }

  function applyFilters() {
    if (draftFrom && draftTo && draftFrom > draftTo) return
    onSelectedKeysChange(draftKeys)
    onDateFromChange(draftFrom)
    onDateToChange(draftTo)
    closeModal()
  }

  function resetFilters() {
    const fullKeys = new Set(allKeys)
    setDraftKeys(fullKeys)
    setDraftFrom('')
    setDraftTo('')
    setDraftDateMode('all')
    onSelectedKeysChange(fullKeys)
    onDateFromChange('')
    onDateToChange('')
    closeModal()
  }

  const draftAllSelected = draftKeys.size === apps.length
  const dateRangeInvalid = Boolean(draftFrom && draftTo && draftFrom > draftTo)
  const showCustomDates = draftDateMode === 'custom'

  return (
    <div className="stats-filter">
      <button
        type="button"
        className={`stats-filter__trigger${isFiltered ? ' stats-filter__trigger--active' : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={openModal}
      >
        <span className="stats-filter__trigger-icon">
          <FilterIcon />
        </span>
        Filter
        {isFiltered ? <span className="stats-filter__badge" aria-hidden="true" /> : null}
      </button>

      {open ? (
        <div className="stats-filter__overlay" role="presentation" onClick={closeModal}>
          <div
            className="stats-filter__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="stats-filter__header">
              <h2 id={titleId} className="stats-filter__title">
                Filters
              </h2>
              <button
                type="button"
                className="stats-filter__close"
                aria-label="Close filters"
                onClick={closeModal}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <div className="stats-filter__body">
              <section className="stats-filter__section">
                <h3 className="stats-filter__section-title">Date range</h3>
                <div className="stats-filter__quick-dates" role="group" aria-label="Quick date ranges">
                  {PORTFOLIO_DATE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`stats-filter__quick-btn${
                        draftDateMode === preset.id ? ' stats-filter__quick-btn--active' : ''
                      }`}
                      aria-pressed={draftDateMode === preset.id}
                      onClick={() => selectDatePreset(preset.id)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {showCustomDates ? (
                  <div className="stats-filter__custom-dates">
                    <p className="stats-filter__custom-hint">Pick a custom start and end date.</p>
                    <div className="stats-filter__dates">
                      <label className="stats-filter__date-field">
                        <span className="stats-filter__date-label">From</span>
                        <input
                          type="date"
                          className="stats-filter__date-input"
                          value={draftFrom}
                          min={minDate}
                          max={draftTo || maxDate}
                          onChange={(e) => onCustomFromChange(e.target.value)}
                        />
                      </label>
                      <label className="stats-filter__date-field">
                        <span className="stats-filter__date-label">To</span>
                        <input
                          type="date"
                          className="stats-filter__date-input"
                          value={draftTo}
                          min={draftFrom || minDate}
                          max={maxDate}
                          onChange={(e) => onCustomToChange(e.target.value)}
                        />
                      </label>
                    </div>
                    {dateRangeInvalid ? (
                      <p className="stats-filter__error" role="alert">
                        &ldquo;From&rdquo; must be on or before &ldquo;To&rdquo;.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </section>

              <section className="stats-filter__section">
                <div className="stats-filter__section-head">
                  <h3 className="stats-filter__section-title">Extensions</h3>
                  {!draftAllSelected ? (
                    <button type="button" className="stats-filter__select-all" onClick={selectAllDraft}>
                      Select all
                    </button>
                  ) : null}
                </div>
                <ul className="stats-filter__list">
                  {apps.map((app) => {
                    const checked = draftKeys.has(app.key)
                    return (
                      <li key={app.key}>
                        <label className="stats-filter__option">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleDraftKey(app.key)}
                          />
                          <span className="stats-filter__option-text">{appFilterLabel(app)}</span>
                          <ChromeIcon size={18} className="stats-filter__option-icon" />
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </section>
            </div>

            <footer className="stats-filter__footer">
              <button type="button" className="CC__btn CC__btn--outline stats-filter__reset" onClick={resetFilters}>
                Reset
              </button>
              <button
                type="button"
                className="CC__btn CC__btn--primary stats-filter__apply"
                disabled={dateRangeInvalid}
                onClick={applyFilters}
              >
                Apply filters
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  )
}
