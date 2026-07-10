import { useEffect, useState } from 'react'
import './CoursesDrawer.css'

export type DrawerCourseStatus = 'overdue' | 'at-risk' | 'in-progress' | 'completed'

export interface DrawerCourse {
  id: string
  title: string
  thumbnailSrc: string
  startDate: string  // ISO date
  dueDate: string    // ISO date
  progress: number   // 0–100
  status: DrawerCourseStatus
}

const STATUS_LABEL: Record<DrawerCourseStatus, string> = {
  overdue: 'Overdue',
  'at-risk': 'At Risk',
  'in-progress': 'In Progress',
  completed: 'Completed',
}

interface Props {
  open: boolean
  memberName: string
  memberRole: string
  memberAvatarSrc?: string
  memberInitials: string
  courses: DrawerCourse[]
  onClose: () => void
}

function formatDateSplit(iso: string): { top: string; year: string } {
  const d = new Date(iso)
  const top = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ','
  const year = String(d.getFullYear())
  return { top, year }
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
          </div>
          <div className="modal__divider" />
        </div>

        <div className="side-drawer__content">
          <div className="cd-table">
            <div className="cd-table__header">
              <div className="cd-table__cell cd-table__cell--course">Courses</div>
              <div className="cd-table__cell cd-table__cell--date">Start date</div>
              <div className="cd-table__cell cd-table__cell--date">Due date</div>
              <div className="cd-table__cell cd-table__cell--status">Status</div>
              <div className="cd-table__cell cd-table__cell--progress">Progress</div>
            </div>

            {courses.map((c) => {
              const filled = Math.round((c.progress / 100) * segments)
              const start = formatDateSplit(c.startDate)
              const due = formatDateSplit(c.dueDate)
              return (
                <div className="cd-table__row" key={c.id}>
                  <div className="cd-table__cell cd-table__cell--course">
                    <img className="cd-table__thumb" src={c.thumbnailSrc} alt="" />
                    <p className="cd-table__course-title">{c.title}</p>
                  </div>
                  <div className="cd-table__cell cd-table__cell--date">
                    <div className="cd-table__date-stack">
                      <span className="cd-table__date-top">{start.top}</span>
                      <span className="cd-table__date-year">{start.year}</span>
                    </div>
                  </div>
                  <div className={`cd-table__cell cd-table__cell--date${c.status === 'overdue' ? ' cd-table__cell--overdue' : ''}`}>
                    <div className="cd-table__date-stack">
                      <span className="cd-table__date-top">{due.top}</span>
                      <span className="cd-table__date-year">{due.year}</span>
                    </div>
                  </div>
                  <div className="cd-table__cell cd-table__cell--status">
                    <span className={`cd-table__status-badge cd-table__status-badge--${c.status}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
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
