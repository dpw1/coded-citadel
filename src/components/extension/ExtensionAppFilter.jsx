import { useEffect, useId, useRef, useState } from 'react'
import ChromeIcon from '../ChromeIcon'
import { appFilterLabel } from '../../utils/apps'

export default function ExtensionAppFilter({ apps, selectedKeys, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()

  const allKeys = apps.map((a) => a.key)
  const allSelected = selectedKeys.size === apps.length
  const count = selectedKeys.size

  const singleSelected = count === 1 ? apps.find((a) => selectedKeys.has(a.key)) : null
  const triggerLabel =
    count === apps.length
      ? `All extensions (${apps.length})`
      : count === 1
        ? appFilterLabel(singleSelected)
        : `${count} extensions selected`

  useEffect(() => {
    if (!open) return undefined

    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function toggleKey(key) {
    const next = new Set(selectedKeys)
    if (next.has(key)) {
      if (next.size <= 1) return
      next.delete(key)
    } else {
      next.add(key)
    }
    onChange(next)
  }

  function selectAll() {
    onChange(new Set(allKeys))
  }

  return (
    <div className="ext-app-filter" ref={rootRef}>
      <button
        type="button"
        className="ext-app-filter__trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <ChromeIcon size={18} />
        <span className="ext-app-filter__trigger-label">{triggerLabel}</span>
        <svg
          className={`ext-app-filter__chevron${open ? ' ext-app-filter__chevron--open' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open ? (
        <div className="ext-app-filter__panel" id={listId} role="listbox" aria-multiselectable="true">
          <div className="ext-app-filter__panel-head">
            <span className="ext-app-filter__panel-title">Filter by extension</span>
            {!allSelected ? (
              <button type="button" className="ext-app-filter__select-all" onClick={selectAll}>
                Select all
              </button>
            ) : null}
          </div>
          <ul className="ext-app-filter__list">
            {apps.map((app) => {
              const checked = selectedKeys.has(app.key)
              const label = appFilterLabel(app)
              return (
                <li key={app.key} role="presentation">
                  <label className="ext-app-filter__option">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleKey(app.key)}
                    />
                    <span className="ext-app-filter__option-text">{label}</span>
                    <ChromeIcon size={18} className="ext-app-filter__option-icon" />
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
