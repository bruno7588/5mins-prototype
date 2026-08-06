import { useEffect, useMemo, useState } from 'react'
import { Add, Minus } from 'iconsax-react'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import InputField from '../../../../components/InputField/InputField'
import '../../../../components/ConfirmModal/ConfirmModal.css'
import './EditReminderModal.css'
import Button from '@/components/Button/Button'

const MIN_DAYS = 1
const MAX_DAYS = 30

export interface ReminderDraft {
  days: number
  subject: string
  body: string
}

interface Props {
  open: boolean
  mode: 'add' | 'edit'
  initial?: ReminderDraft
  takenDays: Set<number>
  onClose: () => void
  onSave: (data: ReminderDraft) => void
}

function EditReminderModal({ open, mode, initial, takenDays, onClose, onSave }: Props) {
  const [days, setDays] = useState<number>(initial?.days ?? 3)
  const [subject, setSubject] = useState<string>(initial?.subject ?? '')
  const [body, setBody] = useState<string>(initial?.body ?? '')

  useEffect(() => {
    if (open) {
      setDays(initial?.days ?? 3)
      setSubject(initial?.subject ?? '')
      setBody(initial?.body ?? '')
    }
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const dayConflict = useMemo(
    () => days !== initial?.days && takenDays.has(days),
    [days, initial?.days, takenDays],
  )
  const trimmedSubject = subject.trim()
  const trimmedBody = body.trim()
  const canSave =
    !dayConflict &&
    days >= MIN_DAYS &&
    days <= MAX_DAYS &&
    trimmedSubject.length > 0 &&
    trimmedBody.length > 0

  if (!open) return null

  const heading = mode === 'add' ? 'Add reminder' : 'Edit reminder'
  const cta = mode === 'add' ? 'Add reminder' : 'Save changes'
  const dayLabel = days === 1 ? 'day' : 'days'

  const handleDaysInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (digits === '') {
      setDays(MIN_DAYS)
      return
    }
    setDays(Math.min(MAX_DAYS, Math.max(MIN_DAYS, parseInt(digits, 10))))
  }

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div
        className="confirm-modal edit-reminder-modal"
        role="dialog"
        aria-label={heading}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton className="edit-reminder-modal__close" onClick={onClose} />

        <div className="edit-reminder-modal__header">
          <h2 className="edit-reminder-modal__heading">{heading}</h2>
        </div>
        <div className="edit-reminder-modal__divider" />

        <div className="edit-reminder-modal__form">
          <div className="edit-reminder-modal__field">
            <div className="edit-reminder-modal__sentence">
              <span>Send</span>
              <div
                className={`edit-reminder-modal__stepper${dayConflict ? ' edit-reminder-modal__stepper--error' : ''}`}
              >
                <button
                  type="button"
                  className="edit-reminder-modal__step-btn"
                  onClick={() => setDays((d) => Math.max(MIN_DAYS, d - 1))}
                  disabled={days <= MIN_DAYS}
                  aria-label="Decrease days"
                >
                  <Minus size={16} color="currentColor" variant="Linear" />
                </button>
                <input
                  id="edit-reminder-days"
                  type="text"
                  inputMode="numeric"
                  className="edit-reminder-modal__step-input"
                  value={String(days)}
                  onChange={(e) => handleDaysInput(e.target.value)}
                  aria-label="Days before due date"
                  aria-invalid={dayConflict || undefined}
                />
                <button
                  type="button"
                  className="edit-reminder-modal__step-btn"
                  onClick={() => setDays((d) => Math.min(MAX_DAYS, d + 1))}
                  disabled={days >= MAX_DAYS}
                  aria-label="Increase days"
                >
                  <Add size={16} color="currentColor" variant="Linear" />
                </button>
              </div>
              <span>{dayLabel} before due date</span>
            </div>
            {dayConflict && (
              <p className="edit-reminder-modal__error" role="alert">
                Another reminder is already scheduled for {days} {dayLabel} before due date.
              </p>
            )}
          </div>

          <InputField
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <div className="edit-reminder-modal__field">
            <label className="edit-reminder-modal__label" htmlFor="edit-reminder-body">
              Message
            </label>
            <textarea
              id="edit-reminder-body"
              className="edit-reminder-modal__textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        <div className="edit-reminder-modal__actions">
          <Button variant="outlined-2"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            disabled={!canSave}
            onClick={() => canSave && onSave({ days, subject: trimmedSubject, body: trimmedBody })}
          >
            {cta}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EditReminderModal
