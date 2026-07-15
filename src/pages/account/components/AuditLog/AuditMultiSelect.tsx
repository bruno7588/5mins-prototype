import { useEffect, useRef, useState } from 'react'
import { ArrowDown2 } from 'iconsax-react'
import Checkbox from '@/components/Checkbox/Checkbox'

export interface MultiOption {
  value: string
  label: string
  /** Not-yet-live option: rendered inert and dimmed with a "Soon" tag. */
  disabled?: boolean
}

interface AuditMultiSelectProps {
  /** Label shown when nothing is selected, e.g. "All actors". */
  allLabel: string
  /** Plural noun for the count summary, e.g. "actors" → "2 actors". */
  noun: string
  options: MultiOption[]
  selected: string[]
  onChange: (next: string[]) => void
}

/**
 * Multi-select filter styled to match the DS Dropdown (reuses .dropdown-*),
 * with checkbox rows and an "All …" row that clears the selection. Empty
 * selection == unfiltered. Used for the Actor / Setting / Course / Surface
 * audit filters; Date range stays a single-select Dropdown.
 */
function AuditMultiSelect({ allLabel, noun, options, selected, onChange }: AuditMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Prefix the filter's category so an applied trigger says *which* filter it is
  // ("Course: Cash Handling", "Actors: 4") — a bare value/count reads as an
  // unlabelled query, and on an audit log that makes a filtered view look like
  // an incomplete one.
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const singular = cap(noun.replace(/s$/, ''))
  const plural = cap(noun)
  const triggerLabel =
    selected.length === 0
      ? allLabel
      : selected.length === 1
        ? `${singular}: ${options.find((o) => o.value === selected[0])?.label ?? '1'}`
        : `${plural}: ${selected.length}`
  const applied = selected.length > 0

  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])

  // Trigger count and label only ever reflect live (selectable) options.

  return (
    <div ref={ref} className="dropdown-field dropdown-sm audit-filter">
      <button
        type="button"
        className={`dropdown-trigger${open ? ' is-active' : ''}${applied ? ' is-applied' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
        }}
      >
        <span className="dropdown-trigger-text">{triggerLabel}</span>
        <ArrowDown2 size={16} color="currentColor" variant="Linear" className="dropdown-chevron" />
      </button>

      {open && (
        <ul className="dropdown-menu" role="listbox" aria-multiselectable="true">
          <li className="audit-mo-all-row">
            <button
              type="button"
              className={`dropdown-option audit-mo-all${selected.length === 0 ? ' is-selected' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChange([])}
            >
              <span className="dropdown-option__text">
                <span>{allLabel}</span>
              </span>
            </button>
          </li>
          {options.map((opt) => {
            // Roadmap option: inert, dimmed, tagged "Soon" (dead-UI convention).
            if (opt.disabled) {
              return (
                <li key={opt.value}>
                  <div role="option" aria-selected={false} aria-disabled className="audit-mo audit-mo--soon">
                    <Checkbox checked={false} disabled />
                    <span>{opt.label}</span>
                    <span className="audit-mo-soon-tag">Soon</span>
                  </div>
                </li>
              )
            }
            const isSel = selected.includes(opt.value)
            return (
              <li key={opt.value}>
                <div
                  role="option"
                  aria-selected={isSel}
                  tabIndex={0}
                  className="audit-mo"
                  onClick={() => toggle(opt.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggle(opt.value)
                    }
                  }}
                >
                  {/* Presentational only — the row handles the click */}
                  <Checkbox checked={isSel} />
                  <span>{opt.label}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default AuditMultiSelect
