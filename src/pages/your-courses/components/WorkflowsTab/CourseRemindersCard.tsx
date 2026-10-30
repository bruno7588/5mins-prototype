import { useMemo, useState } from 'react'
import { Add, Danger, Edit2, Trash } from 'iconsax-react'
import Toggle from '../../../../components/Toggle/Toggle'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal'
import ToastContainer, { useToast } from '../../../../components/Toast/Toast'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import EmailEditorModal, { type EmailEditorTarget } from './email/EmailEditorModal'
import { REMINDER_STARTER, reminderDefault, type EmailText } from './email/emailContent'

export interface Reminder {
  id: string
  days: number
  /** Editor HTML (subject and message). */
  subject: string
  body: string
  system?: boolean
  /** A built-in reminder whose text an admin has changed. */
  custom?: boolean
  paused?: boolean
}

interface Props {
  enabled: boolean
  reminders: Reminder[]
  onToggle: () => void
  onChange: (reminders: Reminder[]) => void
}

let nextId = 0
const newId = () => `r_${Date.now()}_${nextId++}`
const plural = (days: number) => `${days} ${days === 1 ? 'day' : 'days'}`

type ModalState = { mode: 'add' } | { mode: 'edit'; id: string } | null

function CourseRemindersCard({ enabled, reminders, onToggle, onChange }: Props) {
  const [modal, setModal] = useState<ModalState>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toasts, show: showToast } = useToast()

  const sorted = useMemo(
    () => [...reminders].sort((a, b) => b.days - a.days),
    [reminders],
  )
  const defaultReminders = useMemo(() => sorted.filter((r) => r.system), [sorted])
  const customReminders = useMemo(() => sorted.filter((r) => !r.system), [sorted])
  const deleting = sorted.find((r) => r.id === deletingId) ?? null
  const editing = modal?.mode === 'edit' ? reminders.find((r) => r.id === modal.id) ?? null : null

  const target: EmailEditorTarget | null = useMemo(() => {
    if (!modal) return null
    const others = new Set(reminders.filter((r) => r.id !== editing?.id).map((r) => r.days))
    if (editing?.system) {
      return {
        type: 'reminder',
        title: `Edit ${editing.days}-day reminder`,
        name: `${editing.days}-day reminder`,
        when: `Sent ${plural(editing.days)} before a course's due date. This day is built in and can't be changed.`,
        days: editing.days,
        initial: { subject: editing.subject, body: editing.body },
        customised: !!editing.custom,
        canReset: true,
        saveLabel: 'Save Reminder',
      }
    }
    if (editing) {
      return {
        type: 'reminder',
        title: 'Edit reminder',
        name: 'reminder',
        days: editing.days,
        takenDays: others,
        initial: { subject: editing.subject, body: editing.body },
        customised: true,
        canReset: false,
        saveLabel: 'Save Reminder',
      }
    }
    // Add mode: first free day, starter text
    const fallback = [3, 5, 14, 2, 10, 21, 30].find((d) => !others.has(d)) ?? 3
    return {
      type: 'reminder',
      title: 'Add reminder',
      name: 'reminder',
      days: fallback,
      takenDays: others,
      initial: REMINDER_STARTER,
      customised: true,
      canReset: false,
      isNew: true,
      saveLabel: 'Save Reminder',
    }
  }, [modal, editing, reminders])

  const handleSave = (text: EmailText, days: number) => {
    if (editing) {
      onChange(
        reminders.map((r) =>
          r.id === editing.id ? { ...r, ...text, days, custom: r.system ? true : r.custom } : r,
        ),
      )
      showToast('success', editing.system ? `${editing.days}-day reminder updated` : 'Reminder updated')
    } else {
      onChange([...reminders, { id: newId(), days, ...text }])
      showToast('success', 'Reminder added')
    }
    setModal(null)
  }

  const handleReset = () => {
    if (!editing) return
    onChange(
      reminders.map((r) =>
        r.id === editing.id ? { ...r, ...reminderDefault(r.days), custom: false } : r,
      ),
    )
    showToast('success', `${editing.days}-day reminder reset to default`)
    setModal(null)
  }

  const handleRemove = (id: string) => {
    onChange(reminders.filter((r) => r.id !== id))
  }

  const togglePause = (id: string) => {
    onChange(reminders.map((r) => (r.id === id ? { ...r, paused: !r.paused } : r)))
    const target = reminders.find((r) => r.id === id)
    if (target) {
      showToast('success', target.paused ? 'Reminder resumed' : 'Reminder paused')
    }
  }

  const rulesClass = `workflow-card__rules${enabled ? '' : ' workflow-card__rules--disabled'}`

  return (
    <article className="workflow-card">
      <header className="workflow-card__header">
        <div className="workflow-card__headline">
          <h3 className="workflow-card__title">Course reminders</h3>
          <p className="workflow-card__desc">
            Send automatic emails to learners before a course's due date. Sent at 10:00 in each learner's local time on the scheduled day.
          </p>
        </div>
        <Toggle checked={enabled} onChange={onToggle} />
      </header>

      <ul className={rulesClass}>
        {defaultReminders.length > 0 && (
          <li className="course-reminders-group">
            <div className="course-reminders-group__header">
              <span className="course-reminders-group__title">Default Reminders</span>
            </div>
            <div className="course-reminders-group__body">
              {defaultReminders.map((r) => {
                const isPaused = !!r.paused
                const rowClass = `course-reminders-row${isPaused ? ' course-reminders-row--paused' : ''}`
                return (
                  <div key={r.id} className={rowClass}>
                    <span className="course-reminders-row__text">Send email</span>
                    <span className="course-reminders-row__badge">{plural(r.days)}</span>
                    <span className="course-reminders-row__text">before due date</span>
                    {r.custom && <Badge type="informative" label="Custom reminder" />}
                    <span className="course-reminders-row__actions">
                      <Tooltip text="Edit reminder" icon={false} disabled={!enabled}>
                        <button
                          type="button"
                          className="course-reminders-row__icon-btn"
                          onClick={() => setModal({ mode: 'edit', id: r.id })}
                          disabled={!enabled}
                          aria-label="Edit reminder"
                        >
                          <Edit2 size={16} color="currentColor" variant="Linear" />
                        </button>
                      </Tooltip>
                      <Toggle
                        checked={enabled && !isPaused}
                        disabled={!enabled}
                        onChange={() => togglePause(r.id)}
                        aria-label={isPaused ? 'Resume reminder' : 'Pause reminder'}
                      />
                    </span>
                  </div>
                )
              })}
            </div>
          </li>
        )}

        {(customReminders.length > 0 || enabled) && (
          <li className="course-reminders-group">
            {customReminders.length > 0 && (
              <div className="course-reminders-group__header">
                <span className="course-reminders-group__title">Your reminders</span>
              </div>
            )}
            <div className="course-reminders-group__body">
              {customReminders.map((r) => (
                <div key={r.id} className="course-reminders-row">
                  <span className="course-reminders-row__text">Send email</span>
                  <span className="course-reminders-row__badge">{plural(r.days)}</span>
                  <span className="course-reminders-row__text">before due date</span>
                  <span className="course-reminders-row__actions">
                    <Tooltip text="Edit reminder" icon={false} disabled={!enabled}>
                      <button
                        type="button"
                        className="course-reminders-row__icon-btn"
                        onClick={() => setModal({ mode: 'edit', id: r.id })}
                        disabled={!enabled}
                        aria-label="Edit reminder"
                      >
                        <Edit2 size={16} color="currentColor" variant="Linear" />
                      </button>
                    </Tooltip>
                    <Tooltip text="Delete reminder" icon={false} disabled={!enabled}>
                      <button
                        type="button"
                        className="course-reminders-row__icon-btn course-reminders-row__icon-btn--danger"
                        onClick={() => setDeletingId(r.id)}
                        disabled={!enabled}
                        aria-label="Delete reminder"
                      >
                        <Trash size={16} color="currentColor" variant="Linear" />
                      </button>
                    </Tooltip>
                  </span>
                </div>
              ))}
              {enabled && (
                <Button icon={<Add size={20} color="currentColor" variant="Linear" />} variant="text"
                  onClick={() => setModal({ mode: 'add' })}
                >Add Reminder
                </Button>
              )}
            </div>
          </li>
        )}
      </ul>

      {target && (
        <EmailEditorModal
          key={modal?.mode === 'edit' ? modal.id : 'add'}
          target={target}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onReset={handleReset}
        />
      )}

      <ConfirmModal open={deleting !== null} onClose={() => setDeletingId(null)}>
        {deleting && (
          <>
            <div className="confirm-modal-header confirm-modal-header--center">
              <div className="confirm-modal-icon">
                <Danger size={72} color="var(--danger-500)" variant="Linear" />
              </div>
              <h2 className="confirm-modal-title">Delete reminder</h2>
              <p className="confirm-modal-body">
                This reminder will be removed.
              </p>
            </div>
            <div className="confirm-modal-actions confirm-modal-actions--center">
              <Button variant="outlined-2"
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </Button>
              <Button semantic="danger"
                onClick={() => {
                  handleRemove(deleting.id)
                  setDeletingId(null)
                  showToast('success', 'Reminder deleted')
                }}
              >
                Delete
              </Button>
            </div>
          </>
        )}
      </ConfirmModal>

      <ToastContainer toasts={toasts} />
    </article>
  )
}

export default CourseRemindersCard
