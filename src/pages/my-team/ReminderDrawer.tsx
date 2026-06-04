import { useEffect, useState } from 'react'
import { InfoCircle } from 'iconsax-react'
import CloseButton from '../../components/CloseButton/CloseButton'
import { daysSince, formatRelativeShort } from './relativeTime'
import './ReminderDrawer.css'

// Reminders sent within this many days count as "recent" for the spam guard.
const RECENT_DAYS = 3

interface ReminderMember {
  id: string
  name: string
  role: string
  avatarSrc?: string
  initials: string
  overdue: number
  atRisk: number
  overallProgress: number
  lastReminderSentAt?: string
}

interface Props {
  open: boolean
  members: ReminderMember[]
  onClose: () => void
  onSend: (count: number) => void
}

function ReminderDrawer({ open, members, onClose, onSend }: Props) {
  const [closing, setClosing] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  // Reset form fields when drawer opens with new members
  useEffect(() => {
    if (open && members.length > 0) {
      const firstName = members[0].name.split(' ')[0]
      const subjectPrefix = members.length === 1 ? firstName : 'Team'
      setSubject(`${subjectPrefix}, quick reminder about your 5Mins courses ⏰`)
      setMessage(
        'Hi there,\nJust a gentle reminder to complete the courses that you are enrolled in.\nThanks.',
      )
    }
  }, [open, members])

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose()
    }, 300)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const segments = 8
  const total = members.length
  const shown = Math.min(5, total)
  const recentCount = members.filter(
    (m) => m.lastReminderSentAt && daysSince(m.lastReminderSentAt) <= RECENT_DAYS,
  ).length

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
          {recentCount > 0 && (
            <div className="rd-recent-banner" role="status">
              <InfoCircle size={20} color="var(--warning-600)" variant="Bold" />
              <p className="rd-recent-banner__text">
                {recentCount === total
                  ? total === 1
                    ? 'This learner was already reminded in the last 3 days.'
                    : `All ${total} selected learners were reminded in the last 3 days.`
                  : `${recentCount} of ${total} selected ${recentCount === 1 ? 'learner was' : 'learners were'} reminded in the last 3 days.`}{' '}
                Sending again may feel like spam.
              </p>
            </div>
          )}
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

            <div className="rd-field">
              <div className="rd-table">
                <div className="rd-table__header">
                  <div className="rd-table__cell rd-table__cell--name">Name</div>
                  <div className="rd-table__cell rd-table__cell--head-overdue">Courses Overdue</div>
                  <div className="rd-table__cell rd-table__cell--head-atrisk">At Risk</div>
                  <div className="rd-table__cell rd-table__cell--head-progress">Overall progress</div>
                </div>

                {members.slice(0, shown).map((m) => {
                  const filled = Math.round((m.overallProgress / 100) * segments)
                  return (
                    <div className="rd-table__row" key={m.id}>
                      <div className="rd-table__cell rd-table__cell--name">
                        {m.avatarSrc ? (
                          <img className="rd-avatar rd-avatar--img" src={m.avatarSrc} alt="" />
                        ) : (
                          <div className="rd-avatar" aria-hidden="true">{m.initials}</div>
                        )}
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
                      <div className="rd-table__cell rd-table__cell--overdue">
                        {m.overdue > 0 ? (
                          <span className="rd-metric--overdue">{m.overdue}</span>
                        ) : (
                          <span>–</span>
                        )}
                      </div>
                      <div className="rd-table__cell rd-table__cell--atrisk">
                        {m.atRisk > 0 ? (
                          <span className="rd-metric--at-risk">{m.atRisk}</span>
                        ) : (
                          <span>–</span>
                        )}
                      </div>
                      <div className="rd-table__cell rd-table__cell--progress">
                        <div className="rd-progress" role="progressbar" aria-valuenow={m.overallProgress} aria-valuemin={0} aria-valuemax={100}>
                          {Array.from({ length: segments }).map((_, i) => (
                            <span key={i} className={`rd-progress__seg${i < filled ? ' rd-progress__seg--filled' : ''}`} />
                          ))}
                        </div>
                        <span className="rd-progress__pct">{m.overallProgress}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="rd-pagination">
                <span>1–{shown} of {total}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="side-drawer__footer">
          <div className="side-drawer__footer-divider" />
          <div className="side-drawer__buttons">
            <button type="button" className="side-drawer__btn-primary" onClick={() => onSend(total)}>
              Send Reminders ({total})
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default ReminderDrawer
