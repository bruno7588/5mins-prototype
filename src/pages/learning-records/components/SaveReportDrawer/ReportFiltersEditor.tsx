import { useEffect, useRef, useState } from 'react'
import FilterListbox, { FILTER_BY_ID, filterOptions } from '../FilterListbox/FilterListbox'
import type { FilterEntry } from '../../../../utils/lrSavedFilters'

interface ReportFiltersEditorProps {
  filters: FilterEntry[]
  onChange: (filters: FilterEntry[]) => void
}

/**
 * Inline, editable filter set for a report. Each filter is a chip whose value
 * can be changed in place (click to open a value menu) or removed; "+ Add
 * filter" opens the shared FilterListbox. Edits are local until the drawer saves.
 */
function ReportFiltersEditor({ filters, onChange }: ReportFiltersEditorProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [valueOpenId, setValueOpenId] = useState<string | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const valueWrapRef = useRef<HTMLDivElement>(null)

  // Close an open value menu on outside click.
  useEffect(() => {
    if (!valueOpenId) return
    const onDown = (e: MouseEvent) => {
      if (valueWrapRef.current && !valueWrapRef.current.contains(e.target as Node)) {
        setValueOpenId(null)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [valueOpenId])

  function addFilter(id: string) {
    if (!filters.some((f) => f.id === id)) onChange([...filters, { id, value: null }])
    setAddOpen(false)
    setValueOpenId(id) // let them pick a value right away
  }

  function setValue(id: string, value: string) {
    onChange(filters.map((f) => (f.id === id ? { ...f, value } : f)))
    setValueOpenId(null)
  }

  function removeFilter(id: string) {
    onChange(filters.filter((f) => f.id !== id))
    if (valueOpenId === id) setValueOpenId(null)
  }

  return (
    <div className="rfe" ref={sectionRef}>
      {filters.map((f) => {
        const meta = FILTER_BY_ID[f.id]
        if (!meta) return null
        const options = filterOptions(f.id)
        const opt = options.find((o) => o.value === f.value)
        const label = opt ? `${meta.title}: ${opt.label}` : meta.title
        const isOpen = valueOpenId === f.id
        return (
          <div className="rfe-chip-wrap" key={f.id} ref={isOpen ? valueWrapRef : undefined}>
            <div className={`rfe-chip${isOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="rfe-chip-main"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setValueOpenId(isOpen ? null : f.id)}
              >
                <meta.Icon size={16} color="var(--text-secondary)" variant="Linear" />
                <span className="rfe-chip-label">{label}</span>
              </button>
              <button
                type="button"
                className="rfe-chip-remove"
                aria-label={`Remove ${meta.title} filter`}
                onClick={() => removeFilter(f.id)}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M11 5L5 11M5 5L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {isOpen && (
              <ul className="rfe-value-menu" role="listbox">
                {options.map((o) => (
                  <li key={o.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={o.value === f.value}
                      className={`rfe-value-opt${o.value === f.value ? ' is-active' : ''}`}
                      onClick={() => setValue(f.id, o.value)}
                    >
                      {o.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}

      <button
        type="button"
        className="rfe-add"
        aria-haspopup="dialog"
        aria-expanded={addOpen}
        onClick={() => {
          setValueOpenId(null)
          setAddOpen((o) => !o)
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Add filter
      </button>

      <FilterListbox
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSelect={addFilter}
        anchorRef={sectionRef}
      />
    </div>
  )
}

export default ReportFiltersEditor
