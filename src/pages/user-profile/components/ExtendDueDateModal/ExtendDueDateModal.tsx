import { useId, useState } from 'react'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import CloseButton from '@/components/CloseButton/CloseButton'
import Button from '@/components/Button/Button'
import Radio from '@/components/Radio/Radio'
import Alert from '@/components/Alert/Alert'
import DatePickerField from '@/components/DatePickerField/DatePickerField'
import InputInteger from '@/components/InputInteger/InputInteger'
import './ExtendDueDateModal.css'

/** Either a single date for every selection, or an offset applied to each. */
export type ExtendDueDate =
  | { mode: 'date'; date: string }
  | { mode: 'days'; days: number }

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const longDate = (iso: string) => {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

interface ExtendDueDateModalProps {
  /** How many enrolments the change will apply to. */
  count: number
  /** Set when opened from a single row's menu — names that course in the copy. */
  courseName?: string
  onClose: () => void
  onApply: (value: ExtendDueDate) => void
}

/* One row's menu acts on that row alone, which may not be part of the current
   selection — so the single-row wording must never say "selected". */
const copyFor = (count: number, courseName?: string) =>
  courseName
    ? {
        supporting: `Update the due date on “${courseName}”`,
        dateDesc: 'Set a new due date for this course',
        daysDesc: 'Move this course’s current due date out by a number of days',
        dateNote: (when: string) => `This course must be completed by ${when}`,
        daysNote: (n: number) => `This course’s due date will be extended by ${plural(n, 'day')}`,
      }
    : {
        supporting: `Update the due date on ${plural(count, 'course')}`,
        dateDesc: 'Same due date for every selected course',
        daysDesc: 'Extend each course’s current due date by the same number of days',
        dateNote: (when: string) => `Every selected course must be completed by ${when}`,
        daysNote: (n: number) => `Each selected course’s due date will be extended by ${plural(n, 'day')}`,
      }

function ExtendDueDateModal({ count, courseName, onClose, onApply }: ExtendDueDateModalProps) {
  const name = useId()
  const [mode, setMode] = useState<ExtendDueDate['mode']>('date')
  const [date, setDate] = useState(todayISO())
  const [days, setDays] = useState(1)

  const copy = copyFor(count, courseName)
  const isDate = mode === 'date'
  // The date mode needs a date; the days mode is floored at 1, so it always has one.
  const canApply = !isDate || date !== ''

  const apply = () => onApply(isDate ? { mode: 'date', date } : { mode: 'days', days })

  return (
    <ConfirmModal open onClose={onClose} className="edd" ariaLabel="Extend due date">
      <CloseButton onClick={onClose} className="edd__close" size={24} />

      <header className="edd__header">
        <div className="edd__headline">
          <h2 className="edd__title">Extend due date</h2>
          <p className="edd__supporting">{copy.supporting}</p>
        </div>
        <div className="edd__divider" />
      </header>

      <div className="edd__body">
        <div className="edd__option">
          <Radio
            id={`${name}-date`}
            name={name}
            checked={isDate}
            onChange={() => setMode('date')}
          />
          <div className="edd__info">
            <div className="edd__text">
              <label className="edd__label" htmlFor={`${name}-date`}>Specific date</label>
              <p className="edd__desc">{copy.dateDesc}</p>
            </div>
            {isDate && (
              <DatePickerField value={date} onChange={setDate} ariaLabel="New due date" />
            )}
          </div>
        </div>

        <div className="edd__option">
          <Radio
            id={`${name}-days`}
            name={name}
            checked={!isDate}
            onChange={() => setMode('days')}
          />
          <div className="edd__info">
            <div className="edd__text">
              <label className="edd__label" htmlFor={`${name}-days`}>Add days to existing due date</label>
              <p className="edd__desc">{copy.daysDesc}</p>
            </div>
            {!isDate && (
              <div className="edd__stepper">
                <InputInteger value={days} onChange={setDays} min={1} max={365} ariaLabel="Days to add" />
                <span className="edd__unit">{days === 1 ? 'day' : 'days'}</span>
              </div>
            )}
          </div>
        </div>

        <Alert
          type="Callout"
          customIcon={<span className="edd__callout-icon" aria-hidden="true">🗓️</span>}
          message={isDate ? copy.dateNote(longDate(date)) : copy.daysNote(days)}
        />
      </div>

      <Button variant="filled" onClick={apply} disabled={!canApply} className="edd__cta">
        Update Due Date
      </Button>
    </ConfirmModal>
  )
}

export default ExtendDueDateModal
