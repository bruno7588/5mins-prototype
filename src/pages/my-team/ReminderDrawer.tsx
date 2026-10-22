import { useEffect, useState, type ReactNode } from 'react'
import Button from '../../components/Button/Button'
import CloseButton from '../../components/CloseButton/CloseButton'
import Avatar from '@/components/Avatar/Avatar'
import { formatRelativeShort } from './relativeTime'
import { coursesTotal } from './memberStatus'
import './ReminderDrawer.css'

interface ReminderMember {
  id: string
  name: string
  role: string
  avatarSrc?: string
  initials: string
  overdue: number
  atRisk: number
  inProgress: number
  completed: number
  overallProgress: number
  lastReminderSentAt?: string
}

interface Props {
  open: boolean
  members: ReminderMember[]
  onClose: () => void
  onSend: (count: number) => void
}

/** The drawer's copy and recipient list, so another page can send its own reminder
 *  (DES-335 Sign-off tab) in the same drawer. Defaults are My Team's. */
export interface ReminderContent {
  subject: string
  message: string
  count: number
  table: ReactNode
}

const SEGMENTS = 8

function ReminderDrawer({ open, members, onClose, onSend }: Props) {
  const firstName = members[0]?.name.split(' ')[0] ?? ''
  return (
    <ReminderDrawerShell
      open={open}
      onClose={onClose}
      onSend={onSend}
      content={{
        subject: `${members.length === 1 ? firstName : 'Team'}, quick reminder about your 5Mins courses ⏰`,
        message: 'Hi there,\nJust a gentle reminder to complete the courses that you are enrolled in.\nThanks.',
        count: members.length,
        table: <MemberTable members={members} />,
      }}
    />
  )
}

/** Recipient table with the same row look as My Team's: name and a supporting line,
 *  then whatever columns the page needs. */
export function ReminderRecipients({ children, total, shown }: { children: ReactNode; total: number; shown: number }) {
  return (
    <>
      <div className="rd-table">{children}</div>
      {total > shown && (
        <div className="rd-pagination">
          <span>1–{shown} of {total}</span>
        </div>
      )}
    </>
  )
}

function MemberTable({ members }: { members: ReminderMember[] }) {
  const total = members.length
  const shown = Math.min(5, total)
  return (
    <ReminderRecipients total={total} shown={shown}>
      <div className="rd-table__header">
        <div className="rd-table__cell rd-table__cell--name">Name</div>
        <div className="rd-table__cell rd-table__cell--head-courses">Courses</div>
        <div className="rd-table__cell rd-table__cell--head-progress">Overall progress</div>
      </div>

      {members.slice(0, shown).map((m) => {
        const filled = Math.round((m.overallProgress / 100) * SEGMENTS)
        return (
          <div className="rd-table__row" key={m.id}>
            <div className="rd-table__cell rd-table__cell--name">
              <Avatar src={m.avatarSrc} size={40} />
              <div className="rd-member-info">
                <span className="rd-member-name">{m.name}</span>
                <span className="rd-member-role">
                  {m.role}
                  {m.lastReminderSentAt && (
                    <span className="rd-member-lastsent">
                      {' · '}Last remind {formatRelativeShort(m.lastReminderSentAt)}
                    </span>
                  )}
                </span>
              </div>
            </div>
            <div className="rd-table__cell rd-table__cell--courses">
              {coursesTotal(m) > 0 ? <span>{coursesTotal(m)}</span> : <span>–</span>}
            </div>
            <div className="rd-table__cell rd-table__cell--progress">
              <div className="rd-progress" role="progressbar" aria-valuenow={m.overallProgress} aria-valuemin={0} aria-valuemax={100}>
                {Array.from({ length: SEGMENTS }).map((_, i) => (
                  <span key={i} className={`rd-progress__seg${i < filled ? ' rd-progress__seg--filled' : ''}`} />
                ))}
              </div>
              <span className="rd-progress__pct">{m.overallProgress}%</span>
            </div>
          </div>
        )
      })}
    </ReminderRecipients>
  )
}

interface ShellProps {
  open: boolean
  content: ReminderContent
  onClose: () => void
  onSend: (count: number) => void
}

/** The reminder side drawer: title, editable subject and message, recipients, send. */
export function ReminderDrawerShell({ open, content, onClose, onSend }: ShellProps) {
  const [closing, setClosing] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  // Reset form fields each time the drawer opens
  useEffect(() => {
    if (open) {
      setSubject(content.subject)
      setMessage(content.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose()
    }, 300)
  }


  if (!open) return null

  return (
    <>
      <div
        className={`overlay-backdrop${closing ? ' overlay-backdrop--closing' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <aside
        className={`side-drawer${closing ? ' side-drawer--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reminder-drawer-title"
      >
        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <div className="rd-header-text">
              <h2 id="reminder-drawer-title" className="rd-title">Send reminder</h2>
              <p className="rd-subtitle">
                Keep it short and friendly. This will be sent as an email.
              </p>
            </div>
            <CloseButton onClick={handleClose} />
          </div>
          <div className="modal__divider" />
        </div>

        <div className="side-drawer__content">
          <div className="rd-form">
            <div className="rd-field">
              <label className="rd-label" htmlFor="rd-subject">Subject</label>
              <input
                id="rd-subject"
                className="rd-input"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="rd-field">
              <label className="rd-label" htmlFor="rd-message">Message</label>
              <textarea
                id="rd-message"
                className="rd-input rd-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="rd-field">{content.table}</div>
          </div>
        </div>

        <div className="side-drawer__footer">
          <div className="side-drawer__footer-divider" />
          <div className="side-drawer__buttons">
            <Button onClick={() => onSend(content.count)}>Send Reminders ({content.count})</Button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default ReminderDrawer
