import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Sort } from 'iconsax-react'
import CloseButton from '../../components/CloseButton/CloseButton'
import Search from '../../components/Search/Search'
import Dropdown, { type DropdownOption } from '../../components/Dropdown/Dropdown'
import StatusBadge from './StatusBadge'
import { type CourseStatus, COURSE_STATUS_LABEL, COURSE_STATUS_ORDER } from './memberStatus'
import './CoursesDrawer.css'

export interface DrawerCourse {
  id: string
  title: string
  thumbnailSrc: string
  startDate: string  // ISO date
  dueDate: string    // ISO date
  progress: number   // 0–100
  status: CourseStatus
}

const STATUS_FILTER_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'Status: All' },
  ...COURSE_STATUS_ORDER.map((s) => ({ value: s, label: COURSE_STATUS_LABEL[s] })),
]

interface Props {
  open: boolean
  memberName: string
  memberRole: string
  memberAvatarSrc?: string
  memberInitials: string
  courses: DrawerCourse[]
  onClose: () => void
}

function CoursesDrawer({
  open,
  memberName,
  memberRole,
  memberAvatarSrc,
  memberInitials,
  courses,
  onClose,
}: Props) {
  const [closing, setClosing] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  // Status is the only sortable column, so it is never unsorted. Ascending =
  // COURSE_STATUS_ORDER = most urgent first, which is what a manager opens this for.
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose()
    }, 300)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Reset filters each time the drawer opens for a new member
  useEffect(() => {
    if (open) {
      setQuery('')
      setStatusFilter('all')
      setSortDir('asc')
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = courses.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (q && !c.title.toLowerCase().includes(q)) return false
      return true
    })
    // Stable sort, so courses inside one status keep their incoming order
    return matches.sort((a, b) => {
      const diff = COURSE_STATUS_ORDER.indexOf(a.status) - COURSE_STATUS_ORDER.indexOf(b.status)
      return sortDir === 'asc' ? diff : -diff
    })
  }, [courses, query, statusFilter, sortDir])

  if (!open) return null

  const segments = 8

  return (
    <>
      <div
        className={`overlay-backdrop${closing ? ' overlay-backdrop--closing' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <aside
        className={`side-drawer${closing ? ' side-drawer--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <div className="cd-drawer__member">
              {memberAvatarSrc ? (
                <img className="cd-drawer__avatar cd-drawer__avatar--img" src={memberAvatarSrc} alt="" />
              ) : (
                <div className="cd-drawer__avatar" aria-hidden="true">{memberInitials}</div>
              )}
              <div className="cd-drawer__member-info">
                <h2 id="drawer-title" className="cd-drawer__member-name">{memberName}</h2>
                <p className="cd-drawer__member-role">{memberRole}</p>
              </div>
            </div>
            <CloseButton onClick={handleClose} />
          </div>
          <div className="modal__divider" />
        </div>

        <div className="cd-toolbar">
          <div className="cd-toolbar__search">
            <Search
              size="M"
              value={query}
              onChange={setQuery}
              placeholder="Search courses"
              ariaLabel="Search courses"
            />
          </div>
          <div className="cd-toolbar__filter">
            <Dropdown
              size="md"
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
              iconLeft={<Sort size={20} color="var(--text-secondary)" variant="Linear" />}
            />
          </div>
        </div>

        <div className="side-drawer__content">
          <div className="cd-table">
            <div className="cd-table__header">
              <div className="cd-table__cell cd-table__cell--course">Courses</div>
              <button
                type="button"
                className="cd-table__cell cd-table__cell--status cd-table__th-btn"
                onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                aria-label={`Sort by status, currently ${sortDir === 'asc' ? 'most urgent first' : 'least urgent first'}`}
              >
                Status
                {sortDir === 'asc' ? (
                  <ArrowUp size={16} color="currentColor" variant="Linear" />
                ) : (
                  <ArrowDown size={16} color="currentColor" variant="Linear" />
                )}
              </button>
              <div className="cd-table__cell cd-table__cell--progress">Progress</div>
            </div>

            {filtered.length === 0 ? (
              <div className="cd-table__empty">
                <p className="cd-table__empty-text">No courses found</p>
                <p className="cd-table__empty-subtext">Try a different search or status filter</p>
              </div>
            ) : filtered.map((c) => {
              const filled = Math.round((c.progress / 100) * segments)
              return (
                <div className="cd-table__row" key={c.id}>
                  <div className="cd-table__cell cd-table__cell--course">
                    <img className="cd-table__thumb" src={c.thumbnailSrc} alt="" />
                    <p className="cd-table__course-title">{c.title}</p>
                  </div>
                  <div className="cd-table__cell cd-table__cell--status">
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="cd-table__cell cd-table__cell--progress">
                    <div className="cd-table__progress" role="progressbar" aria-valuenow={c.progress} aria-valuemin={0} aria-valuemax={100}>
                      {Array.from({ length: segments }).map((_, i) => (
                        <span key={i} className={`cd-table__progress-seg${i < filled ? ' cd-table__progress-seg--filled' : ''}`} />
                      ))}
                    </div>
                    <span className="cd-table__progress-pct">{c.progress}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </aside>
    </>
  )
}

export default CoursesDrawer
