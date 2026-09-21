import { useEffect, useMemo, useRef, useState } from 'react'
import Search from '../../components/Search/Search'
import {
  MOCK_COURSE_CATALOG,
  courseSourceLabel,
  type AutomationCatalogCourse,
} from './courseCatalog'
import './CourseSearch.css'

interface CourseSearchProps {
  /** Catalogue ids already on the automation — they drop out of the results. */
  excludeIds: string[]
  onSelect: (course: AutomationCatalogCourse) => void
}

/**
 * Course typeahead for the automation builder's Actions card: the DS Search field
 * over a listbox of catalogue courses, each drawn with its artwork and who wrote it.
 *
 * Sibling of RoleSearch and deliberately the same machinery — outside-mousedown to
 * close, preventDefault on the row so the field keeps focus through the click. It
 * differs in two places: the field is the DS Search component rather than a bare
 * input, and the supporting line is plain text, which is what listbox.md's
 * supporting-text slot and the Figma frame both draw.
 *
 * The thumbnail slot is page-local on purpose. listbox.md's slot matrix has icon,
 * avatar, skill icon, checkbox, radio and search — nothing rectangular — so this is
 * a documented gap rather than a component to promote into src/components.
 */
function CourseSearch({ excludeIds, onSelect }: CourseSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
    return MOCK_COURSE_CATALOG
      .filter((c) => !taken.has(c.id))
      .filter((c) => (q ? c.name.toLowerCase().includes(q) : true))
  }, [query, excludeIds])

  function handleSelect(course: AutomationCatalogCourse) {
    onSelect(course)
    setQuery('')
  }

  return (
    <div className="course-search" ref={ref}>
      <Search
        size="M"
        value={query}
        placeholder="Search for courses"
        onChange={setQuery}
        onFocus={() => setOpen(true)}
        ariaLabel="Search for courses"
      />
      {open && (
        <div className="course-search-popover" role="listbox">
          {suggestions.length > 0 ? (
            suggestions.map((course) => (
              <button
                key={course.id}
                type="button"
                role="option"
                aria-selected={false}
                className="course-search-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(course)}
              >
                <img className="course-search-item-thumb" src={course.thumb} alt="" />
                <span className="course-search-item-info">
                  <span className="course-search-item-name">{course.name}</span>
                  <span className="course-search-item-source">{courseSourceLabel(course.source)}</span>
                </span>
              </button>
            ))
          ) : (
            <div className="course-search-empty">No courses found</div>
          )}
        </div>
      )}
    </div>
  )
}

export default CourseSearch
