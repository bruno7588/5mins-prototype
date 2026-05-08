import { useEffect, useMemo, useRef, useState } from 'react'
import { Global, House2, SearchNormal1 } from 'iconsax-react'
import { ROLE_VALUES, type RoleOption } from './Automations'
import './RoleSearch.css'

interface RoleSearchProps {
  value: string
  onChange: (next: string) => void
  placeholder?: string
}

function RoleSearch({ value, onChange, placeholder = 'Search for a role' }: RoleSearchProps) {
  const selected = ROLE_VALUES.find((r) => r.value === value)
  const [query, setQuery] = useState(selected?.label ?? '')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setQuery(selected?.label ?? '')
    }
  }, [selected, open])

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setQuery(selected?.label ?? '')
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open, selected])

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || (selected && q === selected.label.toLowerCase())) {
      return ROLE_VALUES
    }
    return ROLE_VALUES.filter((r) => r.label.toLowerCase().includes(q))
  }, [query, selected])

  function handleSelect(role: RoleOption) {
    onChange(role.value)
    setQuery(role.label)
    setOpen(false)
  }

  return (
    <div className="role-search" ref={ref}>
      <div className="role-search-input-wrap">
        <SearchNormal1
          size={18}
          color="var(--text-tertiary)"
          variant="Outline"
          className="role-search-icon"
        />
        <input
          type="text"
          className="role-search-input"
          value={query}
          placeholder={placeholder}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          aria-label={placeholder}
        />
      </div>
      {open && (
        <div className="role-search-popover" role="listbox">
          {suggestions.length > 0 ? (
            suggestions.map((r) => (
              <button
                key={r.value}
                type="button"
                role="option"
                aria-selected={r.value === value}
                className={`role-search-item${r.value === value ? ' role-search-item--selected' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(r)}
              >
                <span className="role-search-item-label">{r.label}</span>
                <span className="role-search-item-meta">
                  {r.source === '5mins' ? (
                    <Global size={14} color="var(--primary-600)" variant="Linear" />
                  ) : (
                    <House2 size={14} color="var(--lesson-quiz)" variant="Linear" />
                  )}
                  <span>{r.source === '5mins' ? '5Mins role' : 'Tenant role'}</span>
                </span>
              </button>
            ))
          ) : (
            <div className="role-search-empty">No roles found</div>
          )}
        </div>
      )}
    </div>
  )
}

export default RoleSearch
