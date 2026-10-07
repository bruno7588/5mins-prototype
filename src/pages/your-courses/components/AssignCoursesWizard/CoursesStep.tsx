import { useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import { ArrowDown2, Trash } from 'iconsax-react'
import Tooltip from '@/components/Tooltip/Tooltip'
import EmptyState from '@/components/EmptyState/EmptyState'
import searchIllustration from '@/assets/empty-state-illustrations/search.svg'
import '@/pages/automations/AutomationDetailsModal.css'
import CourseSearch from '@/pages/automations/CourseSearch'
import SchedulePopover, { type ScheduleColumn } from './SchedulePopover'
import {
  dueSummary,
  enrolmentSummary,
  fmtDate,
  newAssignCourse,
  repeatSummary,
  startOffsets,
  type AssignCourse,
  type CellSummary,
} from './schedule'

/* Courses step (DES-332 AC 3-6). Order is drag and drop only (D21): pointer drag
   from the grip, or keyboard drag on the grip (Space to pick up, arrows to move,
   Space to drop, Escape to cancel). The drop target is a 2px var(--selected)
   line; the dragged row is never faded. */

interface Props {
  courses: AssignCourse[]
  onChange: (courses: AssignCourse[]) => void
}

function GripIcon() {
  // 6-dot grip, the drag handle used across the prototype's reorder lists.
  // Not an Iconsax glyph; the Library glyph is still to confirm (PRD B5).
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <circle cx="7" cy="5" r="1.5" />
      <circle cx="13" cy="5" r="1.5" />
      <circle cx="7" cy="10" r="1.5" />
      <circle cx="13" cy="10" r="1.5" />
      <circle cx="7" cy="15" r="1.5" />
      <circle cx="13" cy="15" r="1.5" />
    </svg>
  )
}

const move = <T,>(list: T[], from: number, to: number) => {
  const next = list.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function CoursesStep({ courses, onChange }: Props) {
  const offsets = startOffsets(courses)
  const [open, setOpen] = useState<{ id: string; column: ScheduleColumn } | null>(null)
  const triggerRefs = useRef(new Map<string, HTMLButtonElement | null>())

  // Pointer drag
  const fromGrip = useRef(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  /** Gap the dragged row would land in: 0 = above the first row, n = below the last. */
  const [gap, setGap] = useState<number | null>(null)

  // Keyboard drag
  const [grabbed, setGrabbed] = useState<string | null>(null)
  const snapshot = useRef<AssignCourse[] | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const update = (id: string, patch: Partial<AssignCourse>) =>
    onChange(courses.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  const remove = (id: string) => {
    setOpen(null)
    onChange(courses.filter((c) => c.id !== id))
  }

  const announceMove = (list: AssignCourse[], id: string) => {
    const i = list.findIndex((c) => c.id === id)
    const at = startOffsets(list)[i]
    setAnnouncement(
      `${list[i].name} moved to position ${i + 1} of ${list.length}. ${at === 0 ? 'Starts on assignment' : `Starts on ${fmtDate(at)}`}.`,
    )
  }

  const onDragStart = (e: DragEvent, i: number) => {
    if (!fromGrip.current) {
      e.preventDefault()
      return
    }
    setOpen(null)
    setDragIndex(i)
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDragOver = (e: DragEvent<HTMLElement>, i: number) => {
    if (dragIndex === null) return
    e.preventDefault()
    const r = e.currentTarget.getBoundingClientRect()
    setGap(e.clientY < r.top + r.height / 2 ? i : i + 1)
  }

  const endDrag = () => {
    fromGrip.current = false
    setDragIndex(null)
    setGap(null)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    if (dragIndex !== null && gap !== null) {
      const to = gap > dragIndex ? gap - 1 : gap
      if (to !== dragIndex) {
        const next = move(courses, dragIndex, to)
        onChange(next)
        announceMove(next, courses[dragIndex].id)
      }
    }
    endDrag()
  }

  const onGripKey = (e: KeyboardEvent, c: AssignCourse, i: number) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (grabbed === c.id) {
        setGrabbed(null)
        snapshot.current = null
        setAnnouncement(`${c.name} dropped at position ${i + 1} of ${courses.length}.`)
      } else {
        setOpen(null)
        setGrabbed(c.id)
        snapshot.current = courses
        setAnnouncement(`${c.name} picked up. Use the arrow keys to move it, Space to drop, Escape to cancel.`)
      }
    } else if (grabbed === c.id && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()
      const to = e.key === 'ArrowUp' ? i - 1 : i + 1
      if (to < 0 || to >= courses.length) return
      const next = move(courses, i, to)
      onChange(next)
      announceMove(next, c.id)
    } else if (grabbed === c.id && e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      if (snapshot.current) onChange(snapshot.current)
      snapshot.current = null
      setGrabbed(null)
      setAnnouncement(`Move cancelled. ${c.name} is back where it was.`)
    }
  }

  /* Markup and classes are the Automations course rows (AutomationDetailsModal
     CourseRow), so the two lists look identical. Our own popovers, drag line and
     keyboard drag sit on top; the dragged row is never faded. */
  const cell = (c: AssignCourse, i: number, column: ScheduleColumn, s: CellSummary) => {
    const isOpen = open?.id === c.id && open.column === column
    const refKey = `${c.id}:${column}`
    return (
      <div className="automation-details-td automation-details-td--editable">
        <button
          type="button"
          ref={(el) => {
            triggerRefs.current.set(refKey, el)
          }}
          className={`automation-details-cell-trigger${isOpen ? ' automation-details-cell-trigger--open' : ''}`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={() => setOpen(isOpen ? null : { id: c.id, column })}
        >
          <span className="automation-details-cell-trigger__body">
            <span className="automation-details-cell-trigger__title">{s.title}</span>
            {s.desc && <span className="automation-details-cell-trigger__desc">{s.desc}</span>}
          </span>
          <ArrowDown2 size={20} color="currentColor" variant="Linear" className="automation-details-cell-trigger__chevron" />
        </button>
        {isOpen && (
          <SchedulePopover
            column={column}
            course={c}
            index={i}
            offset={offsets[i]}
            align={column === 'repeat' ? 'end' : 'start'}
            onChange={(patch) => update(c.id, patch)}
            onClose={() => setOpen(null)}
            anchorRef={{ current: triggerRefs.current.get(refKey) ?? null }}
          />
        )}
      </div>
    )
  }

  const reorderable = courses.length > 1

  return (
    <div className="acw-courses">
      <CourseSearch excludeIds={courses.map((c) => c.id)} onSelect={(c) => onChange([...courses, newAssignCourse(c)])} />

      {courses.length === 0 ? (
        <EmptyState
          illustration={<img src={searchIllustration} width={72} height={72} alt="" />}
          title="No courses added yet"
          description="Search for a course to add it."
        />
      ) : (
        <div className="automation-details-table" onDragOver={(e) => dragIndex !== null && e.preventDefault()} onDrop={onDrop}>
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
                <svg className="automation-details-th-info-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M7.75 2C4.57469 2 2 4.57469 2 7.75C2 10.9253 4.57469 13.5 7.75 13.5C10.9253 13.5 13.5 10.9253 13.5 7.75C13.5 4.57469 10.9253 2 7.75 2Z" stroke="currentColor" strokeMiterlimit="10" />
                  <path d="M6.875 6.875H7.875V10.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6.5 10.625H9.25" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" />
                  <circle cx="7.75" cy="4.875" r="0.8125" fill="currentColor" />
                </svg>
              </Tooltip>
            </div>
          </div>

          {courses.map((c, i) => (
            <div
              key={c.id}
              className={[
                'automation-details-row acw-row',
                dragIndex === i && 'acw-row--dragging',
                grabbed === c.id && 'acw-row--grabbed',
                gap === i && dragIndex !== null && 'acw-row--drop-before',
                gap === i + 1 && i === courses.length - 1 && dragIndex !== null && 'acw-row--drop-after',
              ]
                .filter(Boolean)
                .join(' ')}
              draggable={reorderable}
              onDragStart={(e) => onDragStart(e, i)}
              onDragOver={(e) => onDragOver(e, i)}
              onDragEnd={endDrag}
            >
              <Tooltip text="Drag to reorder" position="Top" alignment="Center" icon={false} disabled={!reorderable}>
                <button
                  type="button"
                  className="automation-details-row-drag"
                  aria-label={`Reorder ${c.name}`}
                  aria-pressed={grabbed === c.id}
                  disabled={!reorderable}
                  onMouseDown={() => (fromGrip.current = true)}
                  onMouseUp={() => (fromGrip.current = false)}
                  onKeyDown={(e) => onGripKey(e, c, i)}
                  onBlur={() => grabbed === c.id && setGrabbed(null)}
                >
                  <GripIcon />
                </button>
              </Tooltip>
              <div className="automation-details-row-card">
                <div className="automation-details-td automation-details-td--course">
                  <span className="automation-details-row-counter">{i + 1}</span>
                  <img className="automation-details-row-thumb" src={c.thumb} alt="" aria-hidden="true" />
                  {/* Opens the course in a new tab so the wizard keeps its selections. */}
                  <a
                    className="automation-details-row-name"
                    href={`/your-courses/course?title=${encodeURIComponent(c.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {c.name}
                  </a>
                </div>
                {cell(c, i, 'enrolment', enrolmentSummary(c, offsets[i]))}
                {cell(c, i, 'due', dueSummary(c, offsets[i]))}
                {cell(c, i, 'repeat', repeatSummary(c))}
              </div>
              <Tooltip text="Remove course" position="Top" alignment="Center" icon={false}>
                <button
                  type="button"
                  className="automation-details-row-remove"
                  aria-label={`Remove ${c.name}`}
                  onClick={() => remove(c.id)}
                >
                  <Trash size={20} color="currentColor" variant="Linear" />
                </button>
              </Tooltip>
            </div>
          ))}
        </div>
      )}

      <p className="acw-visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  )
}

export default CoursesStep
