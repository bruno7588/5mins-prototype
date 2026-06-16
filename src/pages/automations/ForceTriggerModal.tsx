import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp2, TickCircle, UserTick } from 'iconsax-react'
import CloseButton from '../../components/CloseButton/CloseButton'
import Search from '../../components/Search/Search'
import Badge from '../../components/Badge/Badge'
import Chip from '../../components/Chip/Chip'
import type { AutomationRow, AutomationCourse, User } from './Automations'
import './ForceTriggerModal.css'

function formatCourseMeta(c: AutomationCourse): string {
  const parts: string[] = []

  // Enrollment
  if (c.enrollmentType.kind === 'immediate') {
    parts.push('Immediate')
  } else {
    const unit = c.enrollmentType.days === 1 ? 'day' : 'days'
    parts.push(`${c.enrollmentType.days} ${unit} after previous course`)
  }

  // Due date
  if (c.dueDate.kind === 'none') {
    parts.push('No due date')
  } else {
    const unit = c.dueDate.daysAfterStart === 1 ? 'day' : 'days'
    parts.push(`Due ${c.dueDate.daysAfterStart} ${unit} after start date`)
  }

  // Recurrence
  if (c.recurrence.enabled) {
    const { interval, unit } = c.recurrence
    const unitLabel =
      unit === 'months' ? (interval === 1 ? 'month' : 'months') : interval === 1 ? 'week' : 'weeks'
    parts.push(`Repeats every ${interval} ${unitLabel}`)
  } else {
    parts.push('Never repeats')
  }

  return parts.join(' \u00b7 ')
}

interface ForceTriggerModalProps {
  automation: AutomationRow | null
  users: User[]
  previouslyTriggeredUserIds: Set<string>
  onClose: () => void
  onDone: () => void
  onTrigger: (automationId: string, userIds: string[]) => void
}

function ForceTriggerModal({
  automation,
  users,
  previouslyTriggeredUserIds,
  onClose,
  onDone,
  onTrigger,
}: ForceTriggerModalProps) {
  const [closing, setClosing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [searchFocused, setSearchFocused] = useState(false)
  const [coursesExpanded, setCoursesExpanded] = useState(false)
  const [enrolledTooltip, setEnrolledTooltip] = useState<{ top: number; right: number } | null>(null)
  const [triggered, setTriggered] = useState(false)
  const searchWrapperRef = useRef<HTMLDivElement>(null)

  // Reset state every time the drawer opens for a (new) automation.
  useEffect(() => {
    if (automation) {
      setClosing(false)
      setSearchQuery('')
      setSelectedUserIds([])
      setSearchFocused(false)
      setCoursesExpanded(false)
      setTriggered(false)
    }
  }, [automation])

  // Esc closes the drawer.
  useEffect(() => {
    if (!automation) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automation])

  // Click-outside closes the search dropdown (but not the drawer).
  useEffect(() => {
    if (!searchFocused) return
    function onMouseDown(e: MouseEvent) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [searchFocused])

  function handleClose() {
    setClosing(true)
    setTimeout(onClose, 300)
  }

  const selectedUsers = useMemo(
    () => selectedUserIds.map((id) => users.find((u) => u.id === id)).filter(Boolean) as User[],
    [selectedUserIds, users],
  )

  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const selectedSet = new Set(selectedUserIds)
    return users
      .filter(
        (u) =>
          !selectedSet.has(u.id) &&
          (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [searchQuery, selectedUserIds, users])

  function selectUser(userId: string) {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev : [...prev, userId]))
    setSearchQuery('')
  }

  function removeUser(userId: string) {
    setSelectedUserIds((prev) => prev.filter((id) => id !== userId))
  }

  if (!automation) return null

  const showResults = searchFocused && filteredResults.length > 0
  const triggerLabel = 'Run Automation'
  const COURSE_PREVIEW_COUNT = 3
  const previewCourses = automation.courses.slice(0, COURSE_PREVIEW_COUNT)
  const overflowCourses = automation.courses.slice(COURSE_PREVIEW_COUNT)

  function handleTrigger() {
    if (!automation || selectedUsers.length === 0) return
    onTrigger(automation.id, selectedUsers.map((u) => u.id))
    setTriggered(true)
  }

  return (
    <>
      <div
        className={`force-trigger-overlay${closing ? ' force-trigger-overlay--closing' : ''}`}
        onClick={handleClose}
      />
      <aside
        className={`force-trigger-drawer${closing ? ' force-trigger-drawer--closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="force-trigger-title"
      >
        {triggered ? (
          <div className="force-trigger-success">
            <div className="force-trigger-success-icon">
              <TickCircle size={80} color="var(--success-500)" variant="Bold" />
            </div>
            <h2 className="force-trigger-success-title">
              Automation triggered for {selectedUsers.length}{' '}
              {selectedUsers.length === 1 ? 'user' : 'users'}
            </h2>
            <p className="force-trigger-success-subtitle">{automation.name}</p>
            <div className="force-trigger-success-card">
              {selectedUsers.map((user) => (
                <div key={user.id} className="force-trigger-success-user">
                  <TickCircle size={20} color="var(--success-500)" variant="Bold" />
                  <span>{user.name}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="force-trigger-btn-primary"
              onClick={() => {
                setClosing(true)
                setTimeout(onDone, 300)
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="force-trigger-header">
              <div className="force-trigger-headline">
                <h2 id="force-trigger-title" className="force-trigger-title">
                  Trigger automation
                </h2>
                <p className="force-trigger-subtitle">
                  {automation.name}
                </p>
                <CloseButton onClick={handleClose} className="force-trigger-close" />
              </div>
              <div className="force-trigger-divider" />
            </div>

            {/* Body */}
            <div className="force-trigger-body">
              {/* Course list */}
              <div className="force-trigger-courses">
                <p className="force-trigger-courses-label">
                  Users will be enrolled in these courses
                </p>
                <div className="force-trigger-courses-card">
                  {previewCourses.map((c, i) => (
                    <div key={i} className="force-trigger-course-item">
                      <span className="force-trigger-course-badge">{i + 1}</span>
                      <div className="force-trigger-course-info">
                        <span className="force-trigger-course-name">{c.name}</span>
                        <span className="force-trigger-course-meta">{formatCourseMeta(c)}</span>
                      </div>
                    </div>
                  ))}
                  {overflowCourses.length > 0 && (
                    <div
                      className={`force-trigger-courses-collapsible${coursesExpanded ? ' force-trigger-courses-collapsible--open' : ''}`}
                      aria-hidden={!coursesExpanded}
                    >
                      <div className="force-trigger-courses-collapsible-inner">
                        {overflowCourses.map((c, i) => (
                          <div key={i} className="force-trigger-course-item">
                            <span className="force-trigger-course-badge">{COURSE_PREVIEW_COUNT + i + 1}</span>
                            <div className="force-trigger-course-info">
                              <span className="force-trigger-course-name">{c.name}</span>
                              <span className="force-trigger-course-meta">{formatCourseMeta(c)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {overflowCourses.length > 0 && (
                    <button
                      type="button"
                      className="force-trigger-toggle-courses"
                      onClick={() => setCoursesExpanded((v) => !v)}
                    >
                      {coursesExpanded ? 'View less' : 'View all'}
                      <ArrowUp2
                        size={16}
                        color="currentColor"
                        variant="Linear"
                        className={`force-trigger-toggle-chevron${coursesExpanded ? '' : ' force-trigger-toggle-chevron--down'}`}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* User picker */}
              <div className="force-trigger-section">
                <p className="force-trigger-section-label">Select users</p>
                <div className="force-trigger-search-wrapper" ref={searchWrapperRef}>
                  <Search
                    size="M"
                    value={searchQuery}
                    placeholder="Search by name or email"
                    onChange={setSearchQuery}
                    onFocus={() => setSearchFocused(true)}
                  />
                  {showResults && (
                    <div className="force-trigger-results" role="listbox">
                      <div className="force-trigger-results-list">
                        {filteredResults.length === 0 ? (
                          <div className="force-trigger-results-empty">
                            No users match "{searchQuery}"
                          </div>
                        ) : (
                          filteredResults.map((user) => {
                            const wasTriggered = previouslyTriggeredUserIds.has(user.id)
                            return (
                              <button
                                key={user.id}
                                type="button"
                                role="option"
                                aria-selected={false}
                                aria-disabled={wasTriggered || undefined}
                                className={`force-trigger-result${wasTriggered ? ' force-trigger-result--disabled' : ''}`}
                                onClick={wasTriggered ? undefined : () => selectUser(user.id)}
                                onMouseEnter={wasTriggered ? (e) => {
                                  const rect = e.currentTarget.getBoundingClientRect()
                                  setEnrolledTooltip({ top: rect.top - 4, right: window.innerWidth - rect.right })
                                } : undefined}
                                onMouseLeave={wasTriggered ? () => setEnrolledTooltip(null) : undefined}
                              >
                                <div className="force-trigger-result-info">
                                  <span className="force-trigger-result-name">{user.name}</span>
                                  <span className="force-trigger-result-email">{user.email}</span>
                                </div>
                                {wasTriggered ? (
                                  <Badge type="informative" customIcon={<UserTick size={16} color="currentColor" variant="Linear" />} label="Enrolled" />
                                ) : (
                                  <svg className="force-trigger-result__add" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3.75v10.5M3.75 9h10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                )}
                              </button>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedUsers.length > 0 && (
                  <div className="force-trigger-chips">
                    {selectedUsers.map((user) => (
                      <Chip
                        key={user.id}
                        label={user.name}
                        iconRight
                        onDismiss={() => removeUser(user.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {enrolledTooltip && (
              <div
                className="force-trigger-tooltip"
                style={{
                  position: 'fixed',
                  top: enrolledTooltip.top,
                  right: enrolledTooltip.right,
                  transform: 'translateY(-100%)',
                }}
              >
                <span className="force-trigger-tooltip__content">
                  This user is already enrolled in this automation.
                </span>
                <svg className="force-trigger-tooltip__caret" width="12" height="6" viewBox="0 0 12 6" fill="none">
                  <path d="M6 6L0 0H12L6 6Z" fill="var(--tooltip-background, #0f1014)" />
                </svg>
              </div>
            )}

            {/* Footer */}
            <div className="force-trigger-footer">
              <div className="force-trigger-footer-divider" />
              <div className="force-trigger-footer-buttons">
                <button
                  type="button"
                  className="force-trigger-btn-primary"
                  disabled={selectedUsers.length === 0}
                  onClick={handleTrigger}
                >
                  {triggerLabel}
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  )
}

export default ForceTriggerModal
