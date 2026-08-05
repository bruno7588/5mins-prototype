import { useState } from 'react'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import CloseButton from '@/components/CloseButton/CloseButton'
import Button from '@/components/Button/Button'
import Dropdown, { type DropdownOption } from '@/components/Dropdown/Dropdown'
import DatePickerField from '@/components/DatePickerField/DatePickerField'
import './EditStartDateModal.css'

export interface StartDateChange {
  date: string
  timezone: string
}

/* Enough spread to cover the regions in the mock learner data (North America,
   Europe, Asia Pacific, Middle East) without pretending to be a full tz list. */
const TIMEZONES: DropdownOption[] = [
  { value: 'Europe/London', label: 'GMT +00:00 UK Time - London' },
  { value: 'Europe/Paris', label: 'GMT +01:00 Central European Time - Paris' },
  { value: 'Asia/Dubai', label: 'GMT +04:00 Gulf Standard Time - Dubai' },
  { value: 'Asia/Singapore', label: 'GMT +08:00 Singapore Time - Singapore' },
  { value: 'Australia/Sydney', label: 'GMT +10:00 Australian Eastern Time - Sydney' },
  { value: 'America/New_York', label: 'GMT -05:00 Eastern Time - New York' },
  { value: 'America/Los_Angeles', label: 'GMT -08:00 Pacific Time - Los Angeles' },
]

const DEFAULT_TZ = 'Europe/London'

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

interface EditStartDateModalProps {
  /** How many enrolments the change will apply to. */
  count: number
  /** Set when opened from a single row's menu — names that course in the copy. */
  courseName?: string
  /** Pre-fills the field when editing one row. */
  startDate?: string
  onClose: () => void
  onApply: (value: StartDateChange) => void
}

function EditStartDateModal({ count, courseName, startDate, onClose, onApply }: EditStartDateModalProps) {
  const [date, setDate] = useState(startDate || todayISO())
  const [timezone, setTimezone] = useState(DEFAULT_TZ)

  /* A row's menu acts on that row alone, which may not be part of the current
     selection — so the single-row wording must never say "selected". */
  const supporting = courseName
    ? `Update the enrolment start date on “${courseName}”`
    : `Update the enrolment start date on ${plural(count, 'course')}`

  return (
    <ConfirmModal open onClose={onClose} className="esd" ariaLabel="Edit start date">
      <CloseButton onClick={onClose} className="esd__close" size={24} />

      <header className="esd__header">
        <div className="esd__headline">
          <h2 className="esd__title">Edit start date</h2>
          <p className="esd__supporting">{supporting}</p>
        </div>
        <div className="esd__divider" />
      </header>

      <div className="esd__fields">
        <div className="esd__field">
          <span className="esd__label" id="esd-start-date-label">Start date</span>
          <DatePickerField value={date} onChange={setDate} ariaLabel="Start date" />
        </div>
        <Dropdown
          className="esd__timezone"
          label="Timezone"
          options={TIMEZONES}
          value={timezone}
          onChange={setTimezone}
        />
      </div>

      <Button
        variant="filled"
        onClick={() => onApply({ date, timezone })}
        disabled={!date}
        className="esd__cta"
      >
        Update Start Date
      </Button>
    </ConfirmModal>
  )
}

export default EditStartDateModal
