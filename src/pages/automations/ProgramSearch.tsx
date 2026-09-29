import { useEffect, useMemo, useRef, useState } from 'react'
import Search from '../../components/Search/Search'
import { getAllPrograms } from '@/pages/programs/programStore'
import type { WorkspaceProgram } from '@/pages/workspace/mockItems'
import './CourseSearch.css'

interface ProgramSearchProps {
  /** Program ids already on the automation. They drop out of the results. */
  excludeIds: string[]
  onSelect: (program: WorkspaceProgram) => void
  placeholder?: string
}

/**
 * Program typeahead for the automation builder's Actions card (DES-341). The
 * twin of CourseSearch, drawn with its classes. Only enabled programs can be
 * picked, and getAllPrograms already returns published ones only.
 */
function ProgramSearch({ excludeIds, onSelect, placeholder = 'Search for a program' }: ProgramSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const programs = useMemo(() => getAllPrograms(), [])

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  const suggestions = useMemo(() => {
    const taken = new Set(excludeIds)
    const q = query.trim().toLowerCase()
    return programs
      .filter((p) => !taken.has(p.id))
      .filter((p) => (q ? p.title.toLowerCase().includes(q) : true))
  }, [programs, query, excludeIds])

  function handleSelect(program: WorkspaceProgram) {
    onSelect(program)
    setQuery('')
    setOpen(false) // single choice: nothing left to pick
  }

  return (
    <div className="course-search" ref={ref}>
      <Search
        size="M"
        value={query}
        placeholder={placeholder}
        onChange={(q) => {
          setQuery(q)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        ariaLabel={placeholder}
      />
      {open && (
        <div className="course-search-popover" role="listbox">
          {suggestions.length > 0 ? (
            suggestions.map((program) => (
              <button
                key={program.id}
                type="button"
                role="option"
                aria-selected={false}
                className="course-search-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(program)}
              >
                <img className="course-search-item-thumb" src={program.image} alt="" />
                <span className="course-search-item-info">
                  <span className="course-search-item-name">{program.title}</span>
                  <span className="course-search-item-source">
                    {program.courseCount} {program.courseCount === 1 ? 'course' : 'courses'}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <div className="course-search-empty">No programs found</div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProgramSearch
