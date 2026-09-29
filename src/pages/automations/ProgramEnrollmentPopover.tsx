import { useEffect, useRef } from 'react'
import Radio from '../../components/Radio/Radio'
import DatePickerField from '../../components/DatePickerField/DatePickerField'
import type { ProgramEnrollment } from './Automations'
import './EnrollmentPopover.css'

interface Props {
  value: ProgramEnrollment
  onChange: (next: ProgramEnrollment) => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement | null>
}

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Enrolment timing for a program row (DES-341), the program twin of
 * EnrollmentPopover: Immediate, or Specific date with the date field revealed
 * underneath, the way After delay reveals its stepper.
 */
function ProgramEnrollmentPopover({ value, onChange, onClose, anchorRef }: Props) {
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node
      if (popoverRef.current?.contains(target)) return
      if (anchorRef.current?.contains(target)) return
      /* The calendar is portalled to <body>, so a click on a day lands outside. */
      if ((target as Element).closest?.('.dpf-popover')) return
      onClose()
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [anchorRef, onClose])

  const isImmediate = value.kind === 'immediate'

  return (
    <div ref={popoverRef} className="enrollment-popover" role="dialog">
      <span className="enrollment-popover__caret" aria-hidden="true" />

      <div className="enrollment-popover__group">
        <button
          type="button"
          className="enrollment-popover__option"
          onClick={() => onChange({ kind: 'immediate' })}
        >
          <Radio checked={isImmediate} readOnly tabIndex={-1} />
          <span className="enrollment-popover__option-text">
            <span className="enrollment-popover__option-title">Immediate</span>
            <span className="enrollment-popover__option-desc">
              Enrol user as soon as automation is triggered
            </span>
          </span>
        </button>
      </div>

      <div className="enrollment-popover__group">
        <button
          type="button"
          className="enrollment-popover__option"
          onClick={() => {
            if (isImmediate) onChange({ kind: 'specific-date', date: '' })
          }}
        >
          <Radio checked={!isImmediate} readOnly tabIndex={-1} />
          <span className="enrollment-popover__option-text">
            <span className="enrollment-popover__option-title">Specific date</span>
            <span className="enrollment-popover__option-desc">
              Enrol user on a chosen date, or when they register after it
            </span>
          </span>
        </button>

        {value.kind === 'specific-date' && (
          <div className="enrollment-popover__stepper-row">
            <DatePickerField
              value={value.date}
              onChange={(date) => onChange({ kind: 'specific-date', date })}
              minDate={todayISO()}
              ariaLabel="Enrolment date"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgramEnrollmentPopover
