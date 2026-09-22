import { useEffect, useRef, useState } from 'react'
import { ArrowDown2, Danger, InfoCircle, Trash } from 'iconsax-react'
import CloseButton from '../../components/CloseButton/CloseButton'
import CourseSearch from './CourseSearch'
import Dropdown from '../../components/Dropdown/Dropdown'
import Tooltip from '../../components/Tooltip/Tooltip'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import { SummaryCard, SummaryCardList, formatCourseMeta } from './SummaryCards'
import { fieldIcon } from './TriggerFilters'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import EnrollmentPopover from './EnrollmentPopover'
import DueDatePopover from './DueDatePopover'
import FrequencyPopover from './FrequencyPopover'
import RoleSearch from './RoleSearch'
import type {
  AutomationCourse,
  AutomationRow,
  AutomationTrigger,
  DueDateConfig,
  EnrollmentType,
  RecurrenceConfig,
  TrackedAttribute,
} from './Automations'
import { ATTRIBUTE_LABELS, getAttributeValues } from './Automations'
import type { AutomationCatalogCourse } from './courseCatalog'
import TriggerFilters from './TriggerFilters'
import {
  getFilterField,
  OPERATOR_LABELS,
  matchesCriteria,
  type TriggerFilter,
} from './triggerCriteria'
import { mockUsers } from './mockPeople'
import './AutomationDetailsModal.css'
import Button from '@/components/Button/Button'

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

/* ── Review summary (DEV-4768) ──────────────────────────────────────────────
   The summary restates the automation in sentences rather than controls, so the
   admin reads what it will do rather than re-reading the form they just filled. */

function describeTrigger(trigger: AutomationTrigger): string {
  switch (trigger.kind) {
    case 'user-registered':
      return 'When a user registers on 5Mins.ai'
    case 'existing-users':
      return 'For users already on 5Mins.ai'
    case 'attribute-changed': {
      const value =
        getAttributeValues(trigger.attribute).find((v) => v.value === trigger.toValue)?.label ??
        trigger.toValue
      return `When a user's ${ATTRIBUTE_LABELS[trigger.attribute]} changes to ${value}`
    }
  }
}

/* The card already carries the field name in its title, so the terms start at
   the operator — "is one of Account Executive", not "Role is one of Role". */
function describeFilterTerms(filter: TriggerFilter): string {
  const def = getFilterField(filter.field)
  const operator = OPERATOR_LABELS[filter.operator]
  if (def.control === 'date') return `${operator} ${filter.date ?? '—'}`
  const labels = filter.values.map(
    (v) => def.options.find((o) => o.value === v)?.label ?? v,
  )
  return `${operator} ${labels.join(', ') || '—'}`
}

/**
 * Why the primary action is off. It names one fix and works down the page, so
 * it points at the topmost thing still open — except on a builder where
 * nothing is set at all, which is how a new automation opens: naming only the
 * title there would hide the two steps behind it.
 */
function blockedReason(hasName: boolean, hasTrigger: boolean, hasAction: boolean): string {
  if (hasName && hasTrigger && hasAction) return ''
  if (!hasName && !hasTrigger && !hasAction) {
    return 'Add a title, a trigger filter and at least one course'
  }
  if (!hasName) return 'Add a title to this automation'
  if (!hasTrigger && !hasAction) return 'Set a trigger filter and add at least one course'
  if (!hasTrigger) return 'Set a trigger filter with at least one value'
  return 'Add at least one course to enrol people in'
}

/* A filter row only counts once it carries what it matches on. An added but
   empty row is an unfinished thought, not a criterion, so it blocks save the
   same way a missing row does (DEV-4403 validation). */
function isFilterComplete(filter: TriggerFilter): boolean {
  return getFilterField(filter.field).control === 'date'
    ? !!filter.date
    : filter.values.length > 0
}

/**
 * Who the automation lands on — only ever shown for an existing-employee
 * trigger, where the count IS the enrolment set. A future-facing trigger fires
 * on registrations that have not happened yet, so counting today's people is a
 * number about the wrong population (DEV-4403); the builder already withholds
 * its live count for the same reason.
 */
function describeAudience(automation: AutomationRow): string {
  const total = mockUsers.length
  const matched =
    automation.filters.length === 0
      ? total
      : mockUsers.filter((u) => matchesCriteria(u, automation.filters)).length

  if (matched === 0) return 'No one matches these criteria, so nobody will be enrolled.'
  return `${matched} of ${total} people ${matched === 1 ? 'matches' : 'match'} these criteria and will be enrolled.`
}

export type AutomationDetailsMode = 'edit' | 'new' | 'duplicate'

interface AutomationDetailsModalProps {
  automation: AutomationRow | null
  mode?: AutomationDetailsMode
  /** Whether the draft differs from what was opened — drives the exit guard. */
  dirty?: boolean
  onClose: () => void
  onSave?: (automation: AutomationRow) => void
  onTriggerChange?: (automationId: string, trigger: AutomationTrigger) => void
  onFiltersChange?: (automationId: string, filters: TriggerFilter[]) => void
  onRename?: (automationId: string, name: string) => void
  onCourseChange?: (automationId: string, courseId: string, patch: Partial<AutomationCourse>) => void
  onCourseAdd?: (automationId: string, course: AutomationCatalogCourse) => void
  onCourseRemove?: (automationId: string, courseId: string) => void
  onCoursesReorder?: (automationId: string, fromIndex: number, toIndex: number) => void
}

/* Save when the automation already exists, Create when this click is what
   brings it into being — a duplicate is a new automation, so it creates too. */
const SAVE_BUTTON_LABEL: Record<AutomationDetailsMode, string> = {
  edit: 'Save Automation',
  new: 'Create Automation',
  duplicate: 'Create Automation',
}

function AutomationDetailsModal({
  automation,
  mode = 'edit',
  dirty = false,
  onClose,
  onSave,
  onTriggerChange,
  onFiltersChange,
  onRename,
  onCourseChange,
  onCourseAdd,
  onCourseRemove,
  onCoursesReorder,
}: AutomationDetailsModalProps) {
  const [openPopover, setOpenPopover] = useState<{ courseId: string; column: 'enrollment' | 'due' | 'frequency' } | null>(null)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const draggingIndexRef = useRef<number | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const { toasts, show: showToast } = useToast()
  /* The two safeguards on the way out and the way in: an exit guard when the
     draft has moved (DEV-4770), and a review of what will run before it is
     written (DEV-4768). */
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [reviewing, setReviewing] = useState(false)

  useEffect(() => {
    if (automation) {
      setOpenPopover(null)
      setConfirmDiscard(false)
      setReviewing(false)
      /* Opens Active (Figma 9051:91164): the caret sits in the title, so an
         automation that arrives untitled can be named without a click first.
         Here rather than autoFocus, which only fires on mount and would miss
         swiping from one automation to another. */
      titleRef.current?.focus()
    }
  }, [automation?.id])

  useEffect(() => {
    if (!automation) return
    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      /* The two dialogs close themselves, so this listener stays out of their way. */
      if (confirmDiscard || reviewing) return
      requestClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automation, confirmDiscard, reviewing, dirty])

  /* Every exit route runs through here, so the guard cannot be walked around by
     using the X instead of Escape. Nothing changed means nothing to warn about. */
  function requestClose() {
    if (dirty) {
      setConfirmDiscard(true)
      return
    }
    onClose()
  }

  if (!automation) return null

  /* Save needs a name and both halves of the rule: something to match on, and
     something to enrol. */
  const hasName = automation.name.trim() !== ''
  const hasTrigger =
    automation.filters.length > 0 && automation.filters.every(isFilterComplete)
  const hasAction = automation.courses.length > 0
  const canSave = hasName && hasTrigger && hasAction
  const saveBlockedReason = blockedReason(hasName, hasTrigger, hasAction)

  return (
    <div
      className="automation-details-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="automation-details-title"
    >
      <CloseButton onClick={requestClose} className="automation-details-close" />

      <div className="automation-details-content">
        <header className="automation-details-header">
          {/* Inline input (input.md), the same title editor Course and Programs
              use — the name is the field, so it is always editable and reaches
              the draft as it is typed, like every other control here. */}
          <input
            ref={titleRef}
            id="automation-details-title"
            className="automation-details-title"
            value={automation.name}
            placeholder="Add a title to automation"
            aria-label="Automation name"
            onChange={(e) => onRename?.(automation.id, e.target.value.slice(0, 100))}
          />
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
            {automation.trigger.kind === 'existing-users' && (
              <p className="automation-details-card-lead">For users already on 5Mins.ai</p>
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

            {/* Criteria narrow who the trigger applies to. None means everyone,
                so there is no "all roles" row to clear. */}
            <TriggerFilters
              filters={automation.filters}
              onChange={(next) => onFiltersChange?.(automation.id, next)}
            />

            {/* Existing-employee automations enrol people who are already here, so
                the count is the whole point: it moves as the criteria change and
                says plainly when nobody is left (DEV-4403). New-employee ones fire
                on future registrations, where a count of today's people would be
                a number about the wrong population. */}
            {automation.trigger.kind === 'existing-users' && (
              <p className="automation-details-eligible">
                {(() => {
                  const total = mockUsers.length
                  if (automation.filters.length === 0) {
                    return `Applies to all ${total} people. Add a filter to narrow it.`
                  }
                  const matched = mockUsers.filter((u) => matchesCriteria(u, automation.filters)).length
                  if (matched === 0) return 'No one matches these criteria.'
                  // "people" counts the total, so only the verb agrees with the match count.
                  return `${matched} of ${total} people ${matched === 1 ? 'matches' : 'match'} these criteria.`
                })()}
              </p>
            )}
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
              {/* Keyed per automation so the query resets when you swipe to another. */}
              <CourseSearch
                key={automation.id}
                excludeIds={automation.courses.map((c) => c.catalogId ?? c.name)}
                onSelect={(course) => onCourseAdd?.(automation.id, course)}
              />
            </div>

            <div className="automation-details-table">
              {/* Column names with no rows under them label nothing, so the
                  header waits for the first course. */}
              {automation.courses.length > 0 && (
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
              )}

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
          </div>
        </section>

        <footer className="automation-details-footer">
          <Tooltip
            text={saveBlockedReason}
            position="Top"
            icon={false}
            disabled={canSave}
          >
            <Button disabled={!canSave} onClick={() => setReviewing(true)}>
              {SAVE_BUTTON_LABEL[mode]}
            </Button>
          </Tooltip>
        </footer>
      </div>

      {/* Warning, not Error: the admin is walking away from work that has not
          landed, not destroying anything. Same shape as the course editor's
          unsaved-changes dialog (DEV-4770). */}
      <ConfirmModal
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        ariaLabel="Unsaved changes"
      >
        <div className="confirm-modal-header confirm-modal-header--center">
          <Danger size={72} color="var(--warning-500)" variant="Linear" />
          <h3 className="confirm-modal-title">You've got unsaved changes!</h3>
          <p className="confirm-modal-body">
            Changes to this automation will be lost if you exit now. Do you want to leave
            without saving?
          </p>
        </div>
        <div className="confirm-modal-actions confirm-modal-actions--center">
          <Button variant="outlined-2" onClick={() => setConfirmDiscard(false)}>
            Keep Editing
          </Button>
          <Button
            semantic="warning"
            onClick={() => {
              setConfirmDiscard(false)
              onClose()
            }}
          >
            Discard Changes
          </Button>
        </div>
      </ConfirmModal>

      {/* Last look before it runs, mirroring the Enrol People review step: what
          fires, what it enrols, and who it lands on (DEV-4768). */}
      <ConfirmModal
        open={reviewing}
        onClose={() => setReviewing(false)}
        className="automation-review"
        ariaLabel="Review this automation"
      >
        {/* overlays.md puts the close at a modal's top right. Note it also says
            a Dialog has none — this surface is a review to read, not a confirm
            to answer, so it takes the modal's affordance. */}
        <CloseButton
          onClick={() => setReviewing(false)}
          className="automation-review-close"
          ariaLabel="Close review"
        />

        {/* Section Header (headers.md): 20px title over a divider, no
            supporting text — the sections below say what they are. */}
        <div className="confirm-modal-header">
          <h3 className="confirm-modal-title">Review automation</h3>
          <div className="automation-review-divider" />
        </div>

        <div className="automation-review-section">
          {/* The event is the sentence the criteria narrow, so it reads as one
              rather than as the first card in the list — and it names the
              trigger well enough that a "Trigger" label over it would only
              repeat it. */}
          <p className="automation-review-lead">{describeTrigger(automation.trigger)}</p>
          <SummaryCardList grouped previewCount={3}>
            {automation.filters.map((f) => {
              const Icon = fieldIcon(f.field)
              return (
                <SummaryCard
                  key={f.id}
                  badge={<Icon size={16} color="currentColor" variant="Linear" />}
                  title={getFilterField(f.field).label}
                  meta={describeFilterTerms(f)}
                />
              )
            })}
          </SummaryCardList>
        </div>

        <div className="automation-review-section">
          <p className="automation-review-heading">Enrol them in these courses</p>
          {automation.courses.length === 0 ? (
            <p className="automation-review-empty">No courses yet</p>
          ) : (
            <SummaryCardList previewCount={3}>
              {automation.courses.map((c, i) => (
                <SummaryCard key={c.id} badge={i + 1} title={c.name} meta={formatCourseMeta(c)} />
              ))}
            </SummaryCardList>
          )}
        </div>

        {automation.trigger.kind === 'existing-users' && (
          <p className="automation-review-audience">
            <InfoCircle size={20} color="currentColor" variant="Linear" />
            {describeAudience(automation)}
          </p>
        )}

        <div className="confirm-modal-actions">
          <Button variant="outlined-2" onClick={() => setReviewing(false)}>
            Back to Edit
          </Button>
          <Button
            onClick={() => {
              setReviewing(false)
              onSave?.(automation)
            }}
          >
            {SAVE_BUTTON_LABEL[mode]}
          </Button>
        </div>
      </ConfirmModal>

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
          <img className="automation-details-row-thumb" src={course.thumb} alt="" aria-hidden="true" />
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
