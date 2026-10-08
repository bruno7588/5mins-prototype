import { useRef, useState } from 'react'
import { ArrowDown2 } from 'iconsax-react'
import DatePickerField from '@/components/DatePickerField/DatePickerField'
import Dropdown from '@/components/Dropdown/Dropdown'
import InputInteger from '@/components/InputInteger/InputInteger'
import Radio from '@/components/Radio/Radio'
import Tooltip from '@/components/Tooltip/Tooltip'
import type { RecurrenceConfig } from '@/pages/automations/Automations'
import { SchedulePopoverShell } from '../AssignCoursesWizard/SchedulePopover'

/* Enrol people, step 2: when the course starts, when it is due and whether it repeats.
   A calendar start date (unlike Assign courses, which counts from launch), a due date
   that is none, relative to the start or a specific day, and the Assign frequency. */

export type EnrolDue = { kind: 'none' } | { kind: 'relative'; days: number } | { kind: 'date'; date: string }

export interface EnrolTiming {
  /** ISO yyyy-mm-dd. */
  start: string
  due: EnrolDue
  repeat: RecurrenceConfig
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const addDays = (s: string, n: number) => {
  const d = fromIso(s)
  d.setDate(d.getDate() + n)
  return iso(d)
}

export const todayIso = () => iso(new Date())

/** Defaults from production: starts today, due 14 days later, one time only. */
export const defaultTiming = (): EnrolTiming => ({
  start: todayIso(),
  due: { kind: 'relative', days: 14 },
  repeat: { enabled: false },
})

/** "Oct 8, 2026" */
// Same format as the Assign courses dates (schedule.ts fmtDate).
export const fmtIso = (s: string) => fromIso(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const fmtShort = (s: string) => fromIso(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

/** The due date as ISO, or null when there is none. */
export function dueIso(t: EnrolTiming): string | null {
  if (t.due.kind === 'relative') return addDays(t.start, t.due.days)
  if (t.due.kind === 'date') return t.due.date || null
  return null
}

/** Stepper sub-line: "Oct 8 to Oct 22, 2026", or "Starts Oct 8, 2026" with no due date. */
export function timingSummary(t: EnrolTiming): string {
  const due = dueIso(t)
  return due ? `${fmtShort(t.start)} to ${fmtIso(due)}` : `Starts ${fmtIso(t.start)}`
}

export function dueLabel(t: EnrolTiming): string {
  if (t.due.kind === 'none') return 'No due date'
  if (t.due.kind === 'relative') return `${t.due.days} ${t.due.days === 1 ? 'day' : 'days'} after start date`
  return t.due.date ? `Due ${fmtIso(t.due.date)}` : 'Choose a due date'
}

export function repeatLabel(t: EnrolTiming): string {
  return t.repeat.enabled ? `Every ${t.repeat.interval} ${t.repeat.unit}` : 'One time only'
}

interface Props {
  timing: EnrolTiming
  onChange: (t: EnrolTiming) => void
}

function EnrolTimingStep({ timing, onChange }: Props) {
  const dueRef = useRef<HTMLButtonElement>(null)
  const [dueOpen, setDueOpen] = useState(false)
  const set = (patch: Partial<EnrolTiming>) => onChange({ ...timing, ...patch })

  const relDays = timing.due.kind === 'relative' ? timing.due.days : 14
  const specific = timing.due.kind === 'date' ? timing.due.date : ''
  const on = timing.repeat.enabled
  const interval = timing.repeat.enabled ? timing.repeat.interval : 12
  const unit = timing.repeat.enabled ? timing.repeat.unit : 'months'

  return (
    <div className="ecm-timing">
      <div className="ecm-dates">
        <div className="ecm-field">
          <span className="ecm-label">Start date</span>
          <DatePickerField
            value={timing.start}
            minDate={todayIso()}
            ariaLabel="Start date"
            onChange={(start) => {
              // A specific due date can't fall before the new start; move it along.
              if (timing.due.kind === 'date' && timing.due.date && timing.due.date < start) set({ start, due: { kind: 'date', date: start } })
              else set({ start })
            }}
          />
        </div>

        <div className="ecm-field">
          <span className="ecm-label">
            Due date <span className="ecm-optional">(optional)</span>
          </span>
          {/* Dropdown trigger look (dropdown.md); opens the shared radio popover, not a list. */}
          <div className="dropdown-field dropdown-md">
            <button
              ref={dueRef}
              type="button"
              className={`dropdown-trigger${dueOpen ? ' is-active' : ''}`}
              aria-haspopup="dialog"
              aria-expanded={dueOpen}
              onClick={() => setDueOpen((o) => !o)}
            >
              <span className="dropdown-trigger-text">{dueLabel(timing)}</span>
              <ArrowDown2 size={20} color="currentColor" variant="Linear" className="dropdown-chevron" />
            </button>
          </div>
          {dueOpen && (
            <SchedulePopoverShell anchorRef={dueRef} onClose={() => setDueOpen(false)} label="Due date">
              <div className="acw-pop-option">
                <Radio name="ecm-due" label="No due date" checked={timing.due.kind === 'none'} onChange={() => set({ due: { kind: 'none' } })} />
                <p className="acw-pop-desc">No time limit to complete the course</p>
              </div>
              <div className="acw-pop-option">
                <Radio
                  name="ecm-due"
                  label="Relative to start date"
                  checked={timing.due.kind === 'relative'}
                  onChange={() => set({ due: { kind: 'relative', days: relDays } })}
                />
                <p className="acw-pop-desc">X days after start date</p>
                <div className="acw-pop-inline">
                  <InputInteger
                    value={relDays}
                    min={1}
                    disabled={timing.due.kind !== 'relative'}
                    ariaLabel="Days after start date"
                    onChange={(n) => set({ due: { kind: 'relative', days: n } })}
                  />
                  <span className="acw-pop-days">{relDays === 1 ? 'day' : 'days'}</span>
                </div>
              </div>
              <div className="acw-pop-option">
                <Radio
                  name="ecm-due"
                  label="Specific date"
                  checked={timing.due.kind === 'date'}
                  onChange={() => set({ due: { kind: 'date', date: specific || addDays(timing.start, 14) } })}
                />
                <p className="acw-pop-desc">Choose a specific date the course is due by</p>
                {timing.due.kind === 'date' && (
                  <div className="acw-pop-inline ecm-due-date">
                    <DatePickerField
                      value={specific}
                      minDate={timing.start}
                      ariaLabel="Due date"
                      onChange={(date) => set({ due: { kind: 'date', date } })}
                    />
                  </div>
                )}
              </div>
            </SchedulePopoverShell>
          )}
        </div>
      </div>

      <fieldset className="ecm-frequency">
        <legend className="ecm-frequency-legend">
          Enrolment frequency
          <Tooltip
            text="Recurring re-enrols everyone each period, counted from the start date."
            position="Top"
            iconSize={16}
          />
        </legend>
        <div className="acw-pop-option ecm-option">
          <Radio name="ecm-repeat" label="One time only" checked={!on} onChange={() => set({ repeat: { enabled: false } })} />
          <p className="acw-pop-desc">Single enrolment with no repetition</p>
        </div>
        <div className="acw-pop-option ecm-option">
          <Radio name="ecm-repeat" label="Recurring" checked={on} onChange={() => set({ repeat: { enabled: true, interval, unit } })} />
          <p className="acw-pop-desc">Re-enrol every x months/weeks after start date</p>
          <div className="acw-pop-inline">
            <span className="acw-pop-desc">Repeat every</span>
            <InputInteger
              value={interval}
              min={1}
              disabled={!on}
              ariaLabel="Repeat every"
              onChange={(n) => set({ repeat: { enabled: true, interval: n, unit } })}
            />
            <Dropdown
              className="acw-pop-unit"
              options={[
                { value: 'weeks', label: 'weeks' },
                { value: 'months', label: 'months' },
              ]}
              value={unit}
              readOnly={!on}
              onChange={(v) => set({ repeat: { enabled: true, interval, unit: v as 'weeks' | 'months' } })}
            />
          </div>
        </div>
      </fieldset>
    </div>
  )
}

export default EnrolTimingStep
