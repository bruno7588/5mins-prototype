import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown2, Edit2, Trash } from 'iconsax-react'
import CloseButton from '../../components/CloseButton/CloseButton'
import Search from '../../components/Search/Search'
import Dropdown from '../../components/Dropdown/Dropdown'
import Tooltip from '../../components/Tooltip/Tooltip'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import EnrollmentPopover from './EnrollmentPopover'
import DueDatePopover from './DueDatePopover'
import FrequencyPopover from './FrequencyPopover'
import RoleSearch from './RoleSearch'
import type {
  AutomationCourse,
  AutomationFilters,
  AutomationRow,
  AutomationTrigger,
  DueDateConfig,
  EnrollmentType,
  RecurrenceConfig,
  TrackedAttribute,
} from './Automations'
import {
  COHORT_VALUES,
  MOCK_COURSE_CATALOG,
  REGION_VALUES,
  getAttributeValues,
} from './Automations'
import './AutomationDetailsModal.css'

function formatEnrollment(c: AutomationCourse): { title: string; description?: string } {
  if (c.enrollmentType.kind === 'immediate') {
    return { title: 'Immediate' }
  }
  const unit = c.enrollmentType.days === 1 ? 'day' : 'days'
  return {
    title: 'After delay',
    description: `${c.enrollmentType.days} ${unit} after previous course enrolment`,
  }
}

function formatDueDate(c: AutomationCourse): { title: string; description?: string } {
  if (c.dueDate.kind === 'none') {
    return { title: 'No due date' }
  }
  const unit = c.dueDate.daysAfterStart === 1 ? 'day' : 'days'
  return { title: `${c.dueDate.daysAfterStart} ${unit} after start date` }
}

function formatFrequency(c: AutomationCourse): { title: string; description?: string } {
  if (!c.recurrence.enabled) {
    return { title: 'One time only' }
  }
  const { interval, unit } = c.recurrence
  const unitLabel =
    unit === 'months' ? (interval === 1 ? 'month' : 'months') : interval === 1 ? 'week' : 'weeks'
  return {
    title: 'Recurring',
    description: `Every ${interval} ${unitLabel} after previous enrolment`,
  }
}

export type AutomationDetailsMode = 'edit' | 'new' | 'duplicate'

interface AutomationDetailsModalProps {
  automation: AutomationRow | null
  mode?: AutomationDetailsMode
  onClose: () => void
  onSave?: (automation: AutomationRow) => void
  onTriggerChange?: (automationId: string, trigger: AutomationTrigger) => void
  onFiltersChange?: (automationId: string, filters: AutomationFilters) => void
  onCourseChange?: (automationId: string, courseId: string, patch: Partial<AutomationCourse>) => void
  onCourseAdd?: (automationId: string, courseName: string) => void
  onCourseRemove?: (automationId: string, courseId: string) => void
  onCoursesReorder?: (automationId: string, fromIndex: number, toIndex: number) => void
}

const SAVE_BUTTON_LABEL: Record<AutomationDetailsMode, string> = {
  edit: 'Update Automation',
  new: 'Save Automation',
  duplicate: 'Create new automation',
}

type FilterKind = 'role' | 'cohort' | 'region' | 'joinDate'

const FILTER_PHRASE: Record<FilterKind, { first: string; rest: string }> = {
  role:     { first: 'With',         rest: 'And with' },
  cohort:   { first: 'With',         rest: 'And with' },
  region:   { first: 'From',         rest: 'And from' },
  joinDate: { first: 'Join date is', rest: 'And join date is' },
}

const FILTER_LABEL: Record<FilterKind, string> = {
  role:     'Role',
  cohort:   'Cohort',
  region:   'Region',
  joinDate: 'Join date',
}

const ALL_FILTER_KINDS: FilterKind[] = ['role', 'cohort', 'region', 'joinDate']

function AutomationDetailsModal({
  automation,
  mode = 'edit',
  onClose,
  onSave,
  onTriggerChange,
  onFiltersChange,
  onCourseChange,
  onCourseAdd,
  onCourseRemove,
  onCoursesReorder,
}: AutomationDetailsModalProps) {
  const [closing, setClosing] = useState(false)
  const [courseQuery, setCourseQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [openPopover, setOpenPopover] = useState<{ courseId: string; column: 'enrollment' | 'due' | 'frequency' } | null>(null)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const draggingIndexRef = useRef<number | null>(null)
  const [addedFilterKinds, setAddedFilterKinds] = useState<Set<FilterKind>>(new Set())
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const filterMenuRef = useRef<HTMLDivElement>(null)
  const { toasts, show: showToast } = useToast()

  useEffect(() => {
    if (automation) {
      setClosing(false)
      setCourseQuery('')
      setSearchFocused(false)
      setOpenPopover(null)
      setAddedFilterKinds(new Set())
      setFilterMenuOpen(false)
    }
  }, [automation?.id])

  const courseSuggestions = useMemo(() => {
    const q = courseQuery.trim().toLowerCase()
    if (!q || !automation) return []
    const alreadyAdded = new Set(automation.courses.map((c) => c.name))
    return MOCK_COURSE_CATALOG
      .filter((name) => !alreadyAdded.has(name))
      .filter((name) => name.toLowerCase().includes(q))
      .slice(0, 8)
  }, [courseQuery, automation])

  useEffect(() => {
    if (!filterMenuOpen) return
    function onMouseDown(e: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setFilterMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [filterMenuOpen])

  useEffect(() => {
    if (!automation) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automation])

  function handleClose() {
    setClosing(true)
    setTimeout(onClose, 200)
  }

  if (!automation) return null

  return (
    <div
      className={`automation-details-modal${closing ? ' automation-details-modal--closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="automation-details-title"
    >
      <CloseButton onClick={handleClose} className="automation-details-close" />

      <div className="automation-details-content">
        <header className="automation-details-header">
          <div className="automation-details-headline">
            <h2 id="automation-details-title" className="automation-details-title">
              {automation.name}
            </h2>
            <button type="button" className="automation-details-edit-name" aria-label="Edit name">
              <Edit2 size={20} color="currentColor" variant="Linear" />
            </button>
          </div>
          <div className="automation-details-divider" />
        </header>

        <section className="automation-details-section">
          <div className="automation-details-section-header">
            <h3 className="automation-details-section-title">Trigger</h3>
            <p className="automation-details-section-desc">
              Set conditions for automatic course enrolment
            </p>
          </div>
          <div className="automation-details-card">
            {automation.trigger.kind === 'user-registered' && (
              <p className="automation-details-card-lead">When a user registers on 5Mins.ai</p>
            )}
            {automation.trigger.kind === 'attribute-changed' && (
              <div className="automation-details-trigger-attribute">
                <span className="automation-details-card-lead">When a user's</span>
                <Dropdown
                  size="md"
                  options={[
                    { value: 'role',   label: 'Role'   },
                    { value: 'cohort', label: 'Cohort' },
                    { value: 'region', label: 'Region' },
                  ]}
                  value={automation.trigger.attribute}
                  onChange={(next) => {
                    const attribute = next as TrackedAttribute
                    const firstValue = getAttributeValues(attribute)[0]?.value ?? ''
                    onTriggerChange?.(automation.id, {
                      kind: 'attribute-changed',
                      attribute,
                      toValue: firstValue,
                    })
                  }}
                  className="automation-details-condition-dropdown"
                />
                <span className="automation-details-card-lead">changes to</span>
                {automation.trigger.attribute === 'role' ? (
                  <RoleSearch
                    value={automation.trigger.toValue}
                    onChange={(next) =>
                      onTriggerChange?.(automation.id, {
                        kind: 'attribute-changed',
                        attribute: 'role',
                        toValue: next,
                      })
                    }
                  />
                ) : (
                  <Dropdown
                    size="md"
                    options={getAttributeValues(automation.trigger.attribute).map((v) => ({
                      value: v.value,
                      label: v.label,
                    }))}
                    value={automation.trigger.toValue}
                    onChange={(next) => {
                      const trigger = automation.trigger as Extract<
                        AutomationTrigger,
                        { kind: 'attribute-changed' }
                      >
                      onTriggerChange?.(automation.id, {
                        kind: 'attribute-changed',
                        attribute: trigger.attribute,
                        toValue: next,
                      })
                    }}
                    className="automation-details-condition-dropdown"
                  />
                )}
              </div>
            )}
            {(() => {
              const a: AutomationRow = automation
              const watchedAttribute: TrackedAttribute | null =
                a.trigger.kind === 'attribute-changed'
                  ? a.trigger.attribute
                  : null

              const visibleFilters = ALL_FILTER_KINDS.filter((kind) => {
                if ((kind as TrackedAttribute) === watchedAttribute) return false
                if (a.filters[kind] !== undefined) return true
                if (addedFilterKinds.has(kind)) return true
                return false
              })

              const availableToAdd = ALL_FILTER_KINDS.filter(
                (k) =>
                  (k as TrackedAttribute) !== watchedAttribute &&
                  !visibleFilters.includes(k),
              )

              function removeFilter(kind: FilterKind) {
                setAddedFilterKinds((prev) => {
                  const next = new Set(prev)
                  next.delete(kind)
                  return next
                })
                if (a.filters[kind] !== undefined) {
                  onFiltersChange?.(a.id, {
                    ...a.filters,
                    [kind]: undefined,
                  })
                }
              }

              return (
                <>
                  {visibleFilters.map((kind, index) => {
                    const label =
                      index === 0 ? FILTER_PHRASE[kind].first : FILTER_PHRASE[kind].rest

                    const dropdown =
                      kind === 'role' ? (
                        <RoleSearch
                          value={a.filters.role ?? ''}
                          onChange={(next) =>
                            onFiltersChange?.(a.id, {
                              ...a.filters,
                              role: next || undefined,
                            })
                          }
                        />
                      ) : kind === 'joinDate' ? (
                        <Dropdown
                          size="md"
                          options={[{ value: 'none', label: 'not required' }]}
                          value={a.filters.joinDate ?? 'none'}
                          onChange={() => {
                            /* only one option for now */
                          }}
                          className="automation-details-condition-dropdown"
                        />
                      ) : (
                        (() => {
                          const taxonomy =
                            kind === 'cohort' ? COHORT_VALUES : REGION_VALUES
                          const allLabel =
                            kind === 'cohort' ? 'All cohorts' : 'All regions'
                          const currentValue = a.filters[kind] ?? 'all'
                          return (
                            <Dropdown
                              size="md"
                              options={[
                                { value: 'all', label: allLabel },
                                ...taxonomy.map((v) => ({ value: v.value, label: v.label })),
                              ]}
                              value={currentValue}
                              onChange={(next) =>
                                onFiltersChange?.(a.id, {
                                  ...a.filters,
                                  [kind]: next === 'all' ? undefined : next,
                                })
                              }
                              className="automation-details-condition-dropdown"
                            />
                          )
                        })()
                      )

                    return (
                      <div key={kind} className="automation-details-condition">
                        <span className="automation-details-condition-label">{label}</span>
                        {dropdown}
                        <button
                          type="button"
                          className="automation-details-condition-remove"
                          aria-label={`Remove ${FILTER_LABEL[kind].toLowerCase()} filter`}
                          onClick={() => removeFilter(kind)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M11.5 11.5L4.5 4.5M11.5 4.5L4.5 11.5"
                              stroke="currentColor"
                              strokeWidth="1.25"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    )
                  })}

                  {availableToAdd.length > 0 && (
                    <div
                      className="automation-details-add-filter"
                      ref={filterMenuRef}
                    >
                      <button
                        type="button"
                        className="automation-details-add-filter-trigger"
                        aria-haspopup="menu"
                        aria-expanded={filterMenuOpen}
                        onClick={() => setFilterMenuOpen((o) => !o)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M8 3.5V12.5M3.5 8H12.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        Add filter
                      </button>
                      {filterMenuOpen && (
                        <div className="automation-details-add-filter-menu" role="menu">
                          {availableToAdd.map((kind) => (
                            <button
                              key={kind}
                              type="button"
                              role="menuitem"
                              className="automation-details-add-filter-menu-item"
                              onClick={() => {
                                setAddedFilterKinds((prev) => {
                                  const next = new Set(prev)
                                  next.add(kind)
                                  return next
                                })
                                setFilterMenuOpen(false)
                              }}
                            >
                              {FILTER_LABEL[kind]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </section>

        <section className="automation-details-section">
          <div className="automation-details-section-header">
            <h3 className="automation-details-section-title">Actions</h3>
            <p className="automation-details-section-desc">
              Select which courses to assign when conditions in the trigger are met
            </p>
          </div>
          <div className="automation-details-card">
            <div className="automation-details-actions-toolbar">
              <p className="automation-details-card-lead">Then enrol them in these courses</p>
              <div className="automation-details-search">
                <Search
                  size="M"
                  value={courseQuery}
                  placeholder="Search for courses"
                  onChange={setCourseQuery}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                {searchFocused && courseQuery.trim() !== '' && (
                  <div
                    className="automation-details-search-suggestions"
                    role="listbox"
                  >
                    {courseSuggestions.length > 0 ? (
                      courseSuggestions.map((name) => (
                        <button
                          key={name}
                          type="button"
                          role="option"
                          className="automation-details-search-suggestion"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            onCourseAdd?.(automation.id, name)
                            setCourseQuery('')
                            showToast('success', 'Course added')
                          }}
                        >
                          {name}
                        </button>
                      ))
                    ) : (
                      <div className="automation-details-search-empty">
                        No courses found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {automation.courses.length > 0 && (
            <div className="automation-details-table">
              <div className="automation-details-table-header">
                <div className="automation-details-th automation-details-th--course">Course</div>
                <div className="automation-details-th">Enrolment</div>
                <div className="automation-details-th">Due date</div>
                <div className="automation-details-th automation-details-th--with-info">
                  <span>Frequency</span>
                  <Tooltip
                    text="Automatically re-enrol learners on a recurring interval. Ideal for refresher or compliance training."
                    position="Top"
                    alignment="Center"
                    icon={false}
                  >
                    <svg
                      className="automation-details-th-info-icon"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path d="M7.75 2C4.57469 2 2 4.57469 2 7.75C2 10.9253 4.57469 13.5 7.75 13.5C10.9253 13.5 13.5 10.9253 13.5 7.75C13.5 4.57469 10.9253 2 7.75 2Z" stroke="currentColor" strokeMiterlimit="10" />
                      <path d="M6.875 6.875H7.875V10.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6.5 10.625H9.25" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" />
                      <path d="M7.75 4.0625C7.5893 4.0625 7.43221 4.11015 7.2986 4.19943C7.16498 4.28871 7.06084 4.4156 6.99935 4.56407C6.93785 4.71253 6.92176 4.8759 6.95311 5.03351C6.98446 5.19112 7.06185 5.33589 7.17548 5.44952C7.28911 5.56315 7.43388 5.64054 7.59149 5.67189C7.7491 5.70324 7.91247 5.68715 8.06093 5.62565C8.2094 5.56416 8.33629 5.46002 8.42557 5.3264C8.51485 5.19279 8.5625 5.0357 8.5625 4.875C8.5625 4.65951 8.4769 4.45285 8.32452 4.30048C8.17215 4.1481 7.96549 4.0625 7.75 4.0625Z" fill="currentColor" />
                    </svg>
                  </Tooltip>
                </div>
              </div>

              {automation.courses.map((course, i) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  index={i}
                  isEnrollmentOpen={openPopover?.courseId === course.id && openPopover.column === 'enrollment'}
                  isDueOpen={openPopover?.courseId === course.id && openPopover.column === 'due'}
                  isFrequencyOpen={openPopover?.courseId === course.id && openPopover.column === 'frequency'}
                  isDragging={draggingIndex === i}
                  onToggleColumn={(column) =>
                    setOpenPopover((prev) =>
                      prev?.courseId === course.id && prev.column === column
                        ? null
                        : { courseId: course.id, column },
                    )
                  }
                  onClosePopover={() => setOpenPopover(null)}
                  onChangeEnrollment={(next) =>
                    onCourseChange?.(automation.id, course.id, { enrollmentType: next })
                  }
                  onChangeDueDate={(next) =>
                    onCourseChange?.(automation.id, course.id, { dueDate: next })
                  }
                  onChangeFrequency={(next) =>
                    onCourseChange?.(automation.id, course.id, { recurrence: next })
                  }
                  onRemove={() => {
                    onCourseRemove?.(automation.id, course.id)
                    showToast('success', 'Course removed')
                  }}
                  onDragStart={() => {
                    draggingIndexRef.current = i
                    setDraggingIndex(i)
                    setOpenPopover(null)
                  }}
                  onDragEnter={() => {
                    const from = draggingIndexRef.current
                    if (from === null || from === i) return
                    onCoursesReorder?.(automation.id, from, i)
                    draggingIndexRef.current = i
                    setDraggingIndex(i)
                  }}
                  onDragEnd={() => {
                    draggingIndexRef.current = null
                    setDraggingIndex(null)
                  }}
                />
              ))}
            </div>
            )}
          </div>
        </section>

        <footer className="automation-details-footer">
          <button
            type="button"
            className="confirm-modal-btn confirm-modal-btn--primary"
            onClick={() => onSave?.(automation)}
          >
            {SAVE_BUTTON_LABEL[mode]}
          </button>
        </footer>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

interface CourseRowProps {
  course: AutomationCourse
  index: number
  isEnrollmentOpen: boolean
  isDueOpen: boolean
  isFrequencyOpen: boolean
  isDragging: boolean
  onToggleColumn: (column: 'enrollment' | 'due' | 'frequency') => void
  onClosePopover: () => void
  onChangeEnrollment: (next: EnrollmentType) => void
  onChangeDueDate: (next: DueDateConfig) => void
  onChangeFrequency: (next: RecurrenceConfig) => void
  onRemove: () => void
  onDragStart: () => void
  onDragEnter: () => void
  onDragEnd: () => void
}

function CourseRow({
  course,
  index,
  isEnrollmentOpen,
  isDueOpen,
  isFrequencyOpen,
  isDragging,
  onToggleColumn,
  onClosePopover,
  onChangeEnrollment,
  onChangeDueDate,
  onChangeFrequency,
  onRemove,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: CourseRowProps) {
  const enrollmentRef = useRef<HTMLButtonElement>(null)
  const dueRef = useRef<HTMLButtonElement>(null)
  const frequencyRef = useRef<HTMLButtonElement>(null)
  const enrollment = formatEnrollment(course)
  const due = formatDueDate(course)
  const frequency = formatFrequency(course)

  const rowClass = [
    'automation-details-row',
    isDragging && 'automation-details-row--dragging',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={rowClass}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        // Required for Firefox to initiate drag
        e.dataTransfer.setData('text/plain', String(index))
        onDragStart()
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }}
      onDragEnter={onDragEnter}
      onDrop={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
    >
      <button
        type="button"
        className="automation-details-row-drag"
        aria-label="Drag to reorder"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="7" cy="5" r="1.5" fill="currentColor" />
          <circle cx="13" cy="5" r="1.5" fill="currentColor" />
          <circle cx="7" cy="10" r="1.5" fill="currentColor" />
          <circle cx="13" cy="10" r="1.5" fill="currentColor" />
          <circle cx="7" cy="15" r="1.5" fill="currentColor" />
          <circle cx="13" cy="15" r="1.5" fill="currentColor" />
        </svg>
      </button>
      <div className="automation-details-row-card">
        <div className="automation-details-td automation-details-td--course">
          <span className="automation-details-row-counter">{index + 1}</span>
          <img
            className="automation-details-row-thumb"
            src={`https://picsum.photos/seed/${encodeURIComponent(course.id)}/160/84`}
            alt=""
            aria-hidden="true"
          />
          <span className="automation-details-row-name">{course.name}</span>
        </div>
        <div className="automation-details-td automation-details-td--editable">
          <button
            ref={enrollmentRef}
            type="button"
            className={`automation-details-cell-trigger${isEnrollmentOpen ? ' automation-details-cell-trigger--open' : ''}`}
            aria-haspopup="dialog"
            aria-expanded={isEnrollmentOpen}
            onClick={() => onToggleColumn('enrollment')}
          >
            <span className="automation-details-cell-trigger__body">
              <span className="automation-details-cell-trigger__title">{enrollment.title}</span>
              {enrollment.description && (
                <span className="automation-details-cell-trigger__desc">{enrollment.description}</span>
              )}
            </span>
            <ArrowDown2
              size={20}
              color="currentColor"
              variant="Linear"
              className="automation-details-cell-trigger__chevron"
            />
          </button>
          {isEnrollmentOpen && (
            <EnrollmentPopover
              value={course.enrollmentType}
              onChange={onChangeEnrollment}
              onClose={onClosePopover}
              anchorRef={enrollmentRef}
            />
          )}
        </div>
        <div className="automation-details-td automation-details-td--editable">
          <button
            ref={dueRef}
            type="button"
            className={`automation-details-cell-trigger${isDueOpen ? ' automation-details-cell-trigger--open' : ''}`}
            aria-haspopup="dialog"
            aria-expanded={isDueOpen}
            onClick={() => onToggleColumn('due')}
          >
            <span className="automation-details-cell-trigger__body">
              <span className="automation-details-cell-trigger__title">{due.title}</span>
              {due.description && (
                <span className="automation-details-cell-trigger__desc">{due.description}</span>
              )}
            </span>
            <ArrowDown2
              size={20}
              color="currentColor"
              variant="Linear"
              className="automation-details-cell-trigger__chevron"
            />
          </button>
          {isDueOpen && (
            <DueDatePopover
              value={course.dueDate}
              onChange={onChangeDueDate}
              onClose={onClosePopover}
              anchorRef={dueRef}
            />
          )}
        </div>
        <div className="automation-details-td automation-details-td--editable">
          <button
            ref={frequencyRef}
            type="button"
            className={`automation-details-cell-trigger${isFrequencyOpen ? ' automation-details-cell-trigger--open' : ''}`}
            aria-haspopup="dialog"
            aria-expanded={isFrequencyOpen}
            onClick={() => onToggleColumn('frequency')}
          >
            <span className="automation-details-cell-trigger__body">
              <span className="automation-details-cell-trigger__title">{frequency.title}</span>
              {frequency.description && (
                <span className="automation-details-cell-trigger__desc">{frequency.description}</span>
              )}
            </span>
            <ArrowDown2
              size={20}
              color="currentColor"
              variant="Linear"
              className="automation-details-cell-trigger__chevron"
            />
          </button>
          {isFrequencyOpen && (
            <FrequencyPopover
              value={course.recurrence}
              onChange={onChangeFrequency}
              onClose={onClosePopover}
              anchorRef={frequencyRef}
            />
          )}
        </div>
      </div>
      <Tooltip text="Remove course" position="Top" alignment="Center" icon={false}>
        <button
          type="button"
          className="automation-details-row-remove"
          aria-label="Remove course"
          onClick={onRemove}
        >
          <Trash size={20} color="currentColor" variant="Linear" />
        </button>
      </Tooltip>
    </div>
  )
}

export default AutomationDetailsModal
