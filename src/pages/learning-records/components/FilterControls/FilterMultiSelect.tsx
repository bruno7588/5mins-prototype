import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { SearchNormal1 } from 'iconsax-react'
import { type DropdownOption } from '@/components/Dropdown/Dropdown'
import Chip from '@/components/Chip/Chip'
import Checkbox from '@/components/Checkbox/Checkbox'
import './FilterMultiSelect.css'

interface FilterMultiSelectProps {
  options: DropdownOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder: string
  /** Optional element rendered on the field's line, right after the input (e.g. a remove ×). */
  trailing?: ReactNode
}

/**
 * Searchable multi-select combobox used by the person/course filters
 * (Course, Category, Email, Team, Region, …). A bordered field with a search
 * icon, dismissible chips for the current selection, and a popover listbox of
 * options with checkboxes. Composed entirely from DS primitives.
 */
function FilterMultiSelect({ options, value, onChange, placeholder, trailing }: FilterMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  const selected = useMemo(() => options.filter((o) => value.includes(o.value)), [options, value])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options
  }, [options, query])

  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  }

  return (
    <div className={`fms${open ? ' fms--open' : ''}`} ref={ref}>
      <div className="fms-field-row">
      <div className="fms-field-wrap">
        <div
          className="fms-field"
          onClick={() => {
            setOpen(true)
            inputRef.current?.focus()
          }}
        >
          <SearchNormal1 size={20} color="var(--text-tertiary)" variant="Outline" className="fms-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="fms-input"
            value={query}
            placeholder={placeholder}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            aria-label={placeholder}
          />
        </div>

        {open && (
          <ul className="fms-menu" role="listbox" aria-multiselectable="true">
            {filtered.length === 0 && <li className="fms-empty">No matches</li>}
            {filtered.map((o) => {
              const checked = value.includes(o.value)
              return (
                <li key={o.value}>
                  <div
                    role="option"
                    aria-selected={checked}
                    className={`fms-option${checked ? ' is-selected' : ''}`}
                    onClick={() => toggle(o.value)}
                  >
                    <Checkbox checked={checked} />
                    <span className="fms-option-label">{o.label}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
        {trailing && <div className="fms-trailing">{trailing}</div>}
      </div>

      {/* Selected chips sit BELOW the input */}
      {selected.length > 0 && (
        <div className="fms-chips">
          {selected.map((o) => (
            <Chip key={o.value} label={o.label} selected iconRight onDismiss={() => toggle(o.value)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default FilterMultiSelect
