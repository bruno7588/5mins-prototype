import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import Radio from '@/components/Radio/Radio'
import InputInteger from '@/components/InputInteger/InputInteger'
import Dropdown from '@/components/Dropdown/Dropdown'
import { fmtDate, type AssignCourse } from './schedule'

/* One anchored settings popover with three configurations (DES-332 design
   research c): DS Radio rows in a fieldset, InputInteger always rendered and
   disabled until its option is chosen, changes apply live. */

export type ScheduleColumn = 'enrolment' | 'due' | 'repeat'

const LEGEND: Record<ScheduleColumn, string> = { enrolment: 'Enrolment', due: 'Due date', repeat: 'Frequency' }

interface Props {
  column: ScheduleColumn
  course: AssignCourse
  /** Position in the list; course 1 counts from launch. */
  index: number
  previousName?: string
  /** Days from launch this course starts. */
  offset: number
  onChange: (patch: Partial<AssignCourse>) => void
  onClose: () => void
  anchorRef: RefObject<HTMLElement | null>
  /** "end" opens leftwards, for the last column. */
  align?: 'start' | 'end'
}

function SchedulePopover({ column, course, index, previousName, offset, onChange, onClose, anchorRef, align = 'start' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left?: number; right?: number } | null>(null)

  // Portalled (table cells clip, the table scrolls), so it follows its trigger.
  useLayoutEffect(() => {
    const place = () => {
      const r = anchorRef.current?.getBoundingClientRect()
      if (!r) return
      setPos(
        align === 'end'
          ? { top: r.bottom + 8, right: window.innerWidth - r.right }
          : { top: r.bottom + 8, left: r.left },
      )
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [anchorRef, align])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (ref.current?.contains(t) || anchorRef.current?.contains(t)) return
      // Dropdown menus portal to <body>; a click inside one isn't "outside".
      if ((t as HTMLElement).closest?.('.dropdown-menu, [role="listbox"]')) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Close the popover only, not the wizard behind it.
      e.stopPropagation()
      onClose()
      anchorRef.current?.focus()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [anchorRef, onClose])

  // Focus the checked radio once placed.
  useEffect(() => {
    if (pos) ref.current?.querySelector<HTMLInputElement>('input[type="radio"]:checked')?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!pos])

  const name = `acw-${column}-${course.id}`
  const anchor = index === 0 ? 'launch' : previousName ?? 'the previous course'

  let body
  if (column === 'enrolment') {
    const delayed = course.enrolment.kind === 'after-delay'
    const days = course.enrolment.kind === 'after-delay' ? course.enrolment.days : 1
    body = (
      <>
        <div className="acw-pop-option">
          <Radio
            name={name}
            label="Immediate"
            checked={!delayed}
            onChange={() => onChange({ enrolment: { kind: 'immediate' } })}
          />
          <p className="acw-pop-desc">{index === 0 ? 'Starts on launch' : 'Starts with the previous course'}</p>
        </div>
        <div className="acw-pop-option">
          <Radio
            name={name}
            label="After a delay"
            checked={delayed}
            onChange={() => onChange({ enrolment: { kind: 'after-delay', days, relativeTo: 'previous-course' } })}
          />
          <div className="acw-pop-inline">
            <InputInteger
              value={days}
              min={1}
              disabled={!delayed}
              ariaLabel="Days"
              onChange={(n) => onChange({ enrolment: { kind: 'after-delay', days: n, relativeTo: 'previous-course' } })}
            />
            <span className="acw-pop-desc">days after {anchor}</span>
          </div>
          {delayed && <p className="acw-pop-desc">Starts {fmtDate(offset)}</p>}
        </div>
      </>
    )
  } else if (column === 'due') {
    const hasDue = course.due.kind === 'relative'
    const days = course.due.kind === 'relative' ? course.due.daysAfterStart : 30
    body = (
      <>
        <div className="acw-pop-option">
          <Radio name={name} label="No due date" checked={!hasDue} onChange={() => onChange({ due: { kind: 'none' } })} />
          <p className="acw-pop-desc">No time limit to complete the course</p>
        </div>
        <div className="acw-pop-option">
          <Radio
            name={name}
            label="Relative to start date"
            checked={hasDue}
            onChange={() => onChange({ due: { kind: 'relative', daysAfterStart: days } })}
          />
          <p className="acw-pop-desc">X days after start date</p>
          <div className="acw-pop-inline">
            <InputInteger
              value={days}
              min={1}
              disabled={!hasDue}
              ariaLabel="Days after start date"
              onChange={(n) => onChange({ due: { kind: 'relative', daysAfterStart: n } })}
            />
            <span className="acw-pop-desc">{days === 1 ? 'day' : 'days'}</span>
          </div>
          {hasDue && <p className="acw-pop-desc">Due {fmtDate(offset + days)}</p>}
        </div>
      </>
    )
  } else {
    const on = course.repeat.enabled
    const interval = course.repeat.enabled ? course.repeat.interval : 12
    const unit = course.repeat.enabled ? course.repeat.unit : 'months'
    body = (
      <>
        <div className="acw-pop-option">
          <Radio name={name} label="One time only" checked={!on} onChange={() => onChange({ repeat: { enabled: false } })} />
          <p className="acw-pop-desc">Single enrolment with no repetition</p>
        </div>
        <div className="acw-pop-option">
          <Radio
            name={name}
            label="Recurring"
            checked={on}
            onChange={() => onChange({ repeat: { enabled: true, interval, unit } })}
          />
          <p className="acw-pop-desc">Re-enrol every x months/weeks after start date</p>
          <div className="acw-pop-inline">
            <span className="acw-pop-desc">Repeat every</span>
            <InputInteger
              value={interval}
              min={1}
              disabled={!on}
              ariaLabel="Repeat every"
              onChange={(n) => onChange({ repeat: { enabled: true, interval: n, unit } })}
            />
            <Dropdown
              className="acw-pop-unit"
              options={[
                { value: 'weeks', label: 'weeks' },
                { value: 'months', label: 'months' },
              ]}
              value={unit}
              readOnly={!on}
              onChange={(v) => onChange({ repeat: { enabled: true, interval, unit: v as 'weeks' | 'months' } })}
            />
          </div>
        </div>
      </>
    )
  }

  if (!pos) return null

  return createPortal(
    <div
      ref={ref}
      className={`acw-pop${align === 'end' ? ' acw-pop--end' : ''}`}
      style={pos}
      role="dialog"
      aria-label={LEGEND[column]}
    >
      <span className="acw-pop-caret" aria-hidden="true" />
      <fieldset className="acw-pop-fieldset">
        <legend className="acw-visually-hidden">{LEGEND[column]}</legend>
        {body}
      </fieldset>
    </div>,
    document.body,
  )
}

export default SchedulePopover
