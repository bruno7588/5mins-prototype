import { useEffect, useState } from 'react'
import SideDrawer from '@/components/SideDrawer/SideDrawer'
import Tabs from '@/components/Tabs/Tabs'
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
  open: boolean
  /** Course ids already in the program — those rows show "Remove". */
  existingCourseIds: string[]
  onAdd: (course: CatalogCourse) => void
  onRemove: (courseId: string) => void
  onClose: () => void
}

type Tab = 'yours' | '5mins'

function CoursePickerDrawer({ open, existingCourseIds, onAdd, onRemove, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('yours')
  const [query, setQuery] = useState('')
  const [dimension, setDimension] = useState<'functions' | 'skills'>('functions')
  const [functionFilter, setFunctionFilter] = useState('all')
  const [skillFilter, setSkillFilter] = useState('all')

  const existing = new Set(existingCourseIds)

  const switchTab = (next: Tab) => {
    setTab(next)
    setQuery('')
    setDimension('functions')
    setFunctionFilter('all')
    setSkillFilter('all')
  }

  // The drawer stays mounted between opens, so each open starts fresh on Your Courses.
  useEffect(() => {
    if (open) switchTab('yours')
  }, [open])

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
    <SideDrawer
      open={open}
      onClose={onClose}
      title="Add courses to program"
      subheader={
        <div className="cpd-subheader">
          <Tabs
            items={[
              { key: 'yours', label: 'Your Courses' },
              { key: '5mins', label: '5Mins Courses' },
            ]}
            activeKey={tab}
            onChange={(k) => switchTab(k as Tab)}
            ariaLabel="Course source"
          />

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

          <Search
            size="M"
            value={query}
            placeholder="Search for courses"
            onChange={setQuery}
            className="cpd-search__input"
          />
        </div>
      }
    >
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
    </SideDrawer>
  )
}

export default CoursePickerDrawer
