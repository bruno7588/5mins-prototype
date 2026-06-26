import { useEffect, useRef, useState } from 'react'
import { Add, Calendar, Minus } from 'iconsax-react'
import Radio from '../../../../components/Radio/Radio'
import MiniCalendar from './MiniCalendar'
import type { ReleaseRule } from '../../programStore'
import '../../../automations/EnrollmentPopover.css'

/* Program-course enrolment timing (Figma 2420:44116): On program start / After
 * delay (+ day stepper) / On specific date (+ calendar). Operates directly on the
 * program ReleaseRule model. */

const todayISO = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return d && m && y ? `${d}/${m}/${y}` : iso
}

interface Props {
  value: ReleaseRule
  onChange: (next: ReleaseRule) => void
  onClose: () => void
  closing?: boolean
  anchorRef: React.RefObject<HTMLElement | null>
}

function ReleasePopover({ value, onChange, onClose, closing = false, anchorRef }: Props) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [days, setDays] = useState(value.kind === 'after-days' ? value.days : 1)
  const [date, setDate] = useState(value.kind === 'on-date' ? value.date : todayISO())
  const [calOpen, setCalOpen] = useState(false)

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node
      if (popoverRef.current?.contains(target)) return
      if (anchorRef.current?.contains(target)) return
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

  const selectOnStart = () => onChange({ kind: 'on-start' })

  const selectAfterDelay = (nextDays = days) => {
    const n = Math.max(1, nextDays)
    setDays(n)
    onChange({ kind: 'after-days', days: n })
  }

  const selectOnDate = (nextDate = date) => {
    setDate(nextDate)
    onChange({ kind: 'on-date', date: nextDate })
  }

  return (
    <div
      ref={popoverRef}
      className={`enrollment-popover${closing ? ' enrollment-popover--closing' : ''}`}
      role="dialog"
    >
      <span className="enrollment-popover__caret" aria-hidden="true" />

      {/* On program start */}
      <div className="enrollment-popover__group">
        <button type="button" className="enrollment-popover__option" onClick={selectOnStart}>
          <Radio checked={value.kind === 'on-start'} readOnly tabIndex={-1} />
          <span className="enrollment-popover__option-text">
            <span className="enrollment-popover__option-title">On program start</span>
            <span className="enrollment-popover__option-desc">Enrol users when program starts</span>
          </span>
        </button>
      </div>

      {/* After delay */}
      <div className="enrollment-popover__group">
        <button type="button" className="enrollment-popover__option" onClick={() => selectAfterDelay()}>
          <Radio checked={value.kind === 'after-days'} readOnly tabIndex={-1} />
          <span className="enrollment-popover__option-text">
            <span className="enrollment-popover__option-title">After delay</span>
            <span className="enrollment-popover__option-desc">Enrol x days after previous course</span>
          </span>
        </button>

        {value.kind === 'after-days' && (
          <div className="enrollment-popover__stepper-row">
            <div className="enrollment-popover__stepper">
              <button
                type="button"
                className="enrollment-popover__stepper-btn"
                onClick={() => selectAfterDelay(days - 1)}
                disabled={days <= 1}
                aria-label="Decrease days"
              >
                <Minus size={20} color="currentColor" variant="Linear" />
              </button>
              <input
                type="number"
                className="enrollment-popover__stepper-value"
                value={days}
                onChange={(e) => selectAfterDelay(Math.max(1, parseInt(e.target.value, 10) || 1))}
                min={1}
                aria-label="Days"
              />
              <button
                type="button"
                className="enrollment-popover__stepper-btn"
                onClick={() => selectAfterDelay(days + 1)}
                aria-label="Increase days"
              >
                <Add size={20} color="currentColor" variant="Linear" />
              </button>
            </div>
            <span className="enrollment-popover__unit">{days === 1 ? 'day' : 'days'}</span>
          </div>
        )}
      </div>

      {/* On specific date */}
      <div className="enrollment-popover__group">
        <button type="button" className="enrollment-popover__option" onClick={() => selectOnDate()}>
          <Radio checked={value.kind === 'on-date'} readOnly tabIndex={-1} />
          <span className="enrollment-popover__option-text">
            <span className="enrollment-popover__option-title">On specific date</span>
            <span className="enrollment-popover__option-desc">Select a day from the calendar</span>
          </span>
        </button>

        {value.kind === 'on-date' && (
          <div className="enrollment-popover__date-row">
            <button
              type="button"
              className={`co-date-trigger${calOpen ? ' co-date-trigger--active' : ''}`}
              onClick={() => setCalOpen((o) => !o)}
            >
              <span>{fmtDate(date)}</span>
              <Calendar size={20} color="var(--text-secondary)" variant="Linear" />
            </button>
            {calOpen && (
              <div className="co-calendar-pop">
                <MiniCalendar
                  value={date}
                  onSelect={(iso) => {
                    selectOnDate(iso)
                    setCalOpen(false)
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReleasePopover
