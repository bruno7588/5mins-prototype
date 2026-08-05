import { useRef, useState } from 'react'
import { useOverlayA11y } from '../../../../hooks/useOverlayA11y'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import Search from '../../../../components/Search/Search'
import Dropdown from '../../../../components/Dropdown/Dropdown'
import ContentSwitcher from '../../../../components/ContentSwitcher/ContentSwitcher'
import {
  FUNCTION_OPTIONS,
  SKILL_OPTIONS,
  fiveMinsCourses,
  yourCourses,
  type CatalogCourse,
} from '../../coursesCatalog'
import './CoursePickerDrawer.css'

interface Props {
  /** Course ids already in the program — those rows show "Remove". */
  existingCourseIds: string[]
  onAdd: (course: CatalogCourse) => void
  onRemove: (courseId: string) => void
  onClose: () => void
}

type Tab = 'yours' | '5mins'

function CoursePickerDrawer({ existingCourseIds, onAdd, onRemove, onClose }: Props) {
  const [closing, setClosing] = useState(false)
  const panelRef = useRef<HTMLElement>(null)
  const [tab, setTab] = useState<Tab>('yours')
  const [query, setQuery] = useState('')
  const [dimension, setDimension] = useState<'functions' | 'skills'>('functions')
  const [functionFilter, setFunctionFilter] = useState('all')
  const [skillFilter, setSkillFilter] = useState('all')

  const existing = new Set(existingCourseIds)

  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 300)
  }

  useOverlayA11y(panelRef, !closing, { onEscape: handleClose })

  const switchTab = (next: Tab) => {
    setTab(next)
    setQuery('')
    setDimension('functions')
    setFunctionFilter('all')
    setSkillFilter('all')
  }

  const q = query.trim().toLowerCase()
  const results = (tab === 'yours' ? yourCourses() : fiveMinsCourses()).filter((c) => {
    if (q && !c.title.toLowerCase().includes(q)) return false
    if (tab === '5mins') {
      if (dimension === 'functions' && functionFilter !== 'all' && !c.functionIds?.includes(functionFilter)) return false
      if (dimension === 'skills' && skillFilter !== 'all' && c.skillId !== skillFilter) return false
    }
    return true
  })

  return (
    <div className={`cpd-overlay${closing ? ' cpd-overlay--closing' : ''}`} onMouseDown={handleClose}>
      <aside
        ref={panelRef}
        className={`cpd-panel${closing ? ' cpd-panel--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cpd-title"
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="cpd-header">
          <h2 className="cpd-header__title" id="cpd-title">Add courses to program</h2>
          <CloseButton onClick={handleClose} />
        </header>

        <div className="cpd-divider" />

        <div className="cpd-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'yours'}
            className={`cpd-tab${tab === 'yours' ? ' cpd-tab--active' : ''}`}
            onClick={() => switchTab('yours')}
          >
            Your Courses
          </button>
          <button
            role="tab"
            aria-selected={tab === '5mins'}
            className={`cpd-tab${tab === '5mins' ? ' cpd-tab--active' : ''}`}
            onClick={() => switchTab('5mins')}
          >
            5Mins Courses
          </button>
        </div>

        {tab === '5mins' && (
          <div className="cpd-controls">
            <ContentSwitcher
              items={[
                { key: 'functions', label: 'Functions' },
                { key: 'skills', label: 'Skills' },
              ]}
              activeKey={dimension}
              onChange={(k) => setDimension(k as 'functions' | 'skills')}
            />
            <Dropdown
              className="cpd-controls__filter"
              menuAlign="end"
              options={dimension === 'functions' ? FUNCTION_OPTIONS : SKILL_OPTIONS}
              value={dimension === 'functions' ? functionFilter : skillFilter}
              onChange={dimension === 'functions' ? setFunctionFilter : setSkillFilter}
            />
          </div>
        )}

        <div className="cpd-search">
          <Search
            size="M"
            value={query}
            placeholder="Search for courses"
            onChange={setQuery}
            className="cpd-search__input"
          />
        </div>

        <div className="cpd-body">
          {results.length === 0 ? (
            <div className="cpd-empty">
              <p>{q ? `No courses match “${query.trim()}”.` : 'No courses here yet.'}</p>
            </div>
          ) : (
            <>
              <p className="cpd-col-head">Course name</p>
              <div className="cpd-list">
                {results.map((course) => {
                  const added = existing.has(course.courseId)
                  return (
                    <div key={course.courseId} className="cpd-row">
                      <span className="cpd-row__thumb" style={{ backgroundImage: `url(${course.thumb})` }} />
                      <span className="cpd-row__info">
                        <span className="cpd-row__title">{course.title}</span>
                        <span className="cpd-row__meta">
                          {course.lessonCount} lessons · {course.durationMinutes}min
                        </span>
                      </span>
                      {added ? (
                        <button
                          className="cpd-row__btn cpd-row__btn--remove"
                          onClick={() => onRemove(course.courseId)}
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          className="cpd-row__btn cpd-row__btn--add"
                          onClick={() => onAdd(course)}
                        >
                          Add
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}

export default CoursePickerDrawer
