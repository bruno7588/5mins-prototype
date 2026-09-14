import { TickCircle, Danger, CloseCircle, Clock } from 'iconsax-react'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import CloseButton from '@/components/CloseButton/CloseButton'
import Button from '@/components/Button/Button'
import { useImpersonation } from './ImpersonationContext'
import type { ImpersonatedPerson } from './types'
import './ImpersonateConfirmModal.css'

interface Props {
  /** The person to impersonate; null closes the dialog. */
  person: ImpersonatedPerson | null
  onClose: () => void
  onConfirm: () => void
}

/**
 * Pre-flight confirmation for impersonation (DES-337), built on the DS Modal pattern
 * (overlays.md): 720px, close button, section header + divider, content, footer. It
 * states plainly what the admin can and can't do, that actions are real and recorded
 * against them, and that the session self-terminates after 60 minutes.
 */
function ImpersonateConfirmModal({ person, onClose, onConfirm }: Props) {
  const { adminName } = useImpersonation()
  if (!person) return null

  return (
    <ConfirmModal open onClose={onClose} ariaLabel="Impersonate this user" className="imp-confirm">
      <CloseButton onClick={onClose} size={24} className="imp-confirm__close" />

      <div className="imp-confirm__header">
        <div className="imp-confirm__headline">
          <h3 className="imp-confirm__title">Impersonate this user?</h3>
          <p className="imp-confirm__supporting">
            You'll enter the learner app exactly as they experience it, so you can check their access or
            reproduce an issue.
          </p>
        </div>
        <div className="imp-confirm__divider" />
      </div>

      <div className="imp-confirm__content">
        <div className="imp-confirm__who">
          <span className="imp-confirm__avatar" style={{ background: person.color }}>
            {person.avatarImg ? <img src={person.avatarImg} alt="" /> : person.initials}
          </span>
          <div>
            <div className="imp-confirm__who-name">{person.name}</div>
            <div className="imp-confirm__who-email">{person.email}</div>
          </div>
        </div>

        <ul className="imp-confirm__facts">
          <li>
            <TickCircle size={20} color="var(--success-500)" variant="Bold" className="imp-confirm__fi" />
            <span>You'll see their home, courses, progress and notifications <b>as they see them</b>.</span>
          </li>
          <li>
            <Danger size={20} color="var(--warning-500)" variant="Bold" className="imp-confirm__fi" />
            <span>
              Actions you take are <b>real</b> — lesson progress counts and normal notifications may fire.
              Everything is <b>recorded against you ({adminName})</b>.
            </span>
          </li>
          <li>
            <CloseCircle size={20} color="var(--text-error)" variant="Bold" className="imp-confirm__fi" />
            <span>
              Sensitive actions are <b>blocked</b>: their password, email, role and notification settings
              can't be changed.
            </span>
          </li>
          <li>
            <Clock size={20} color="var(--text-tertiary)" variant="Bold" className="imp-confirm__fi" />
            <span>
              The session <b>ends automatically after 60 minutes</b> — with a warning before it does. Start,
              exit and everything you do are logged in your audit trail.
            </span>
          </li>
        </ul>
      </div>

      <div className="imp-confirm__foot">
        <Button variant="outlined-2" onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm}>Start impersonating</Button>
      </div>
    </ConfirmModal>
  )
}

export default ImpersonateConfirmModal
