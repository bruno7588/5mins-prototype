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

      <div className="imp-confirm__headline">
        <h3 className="imp-confirm__title">Impersonate this user?</h3>
      </div>

      <div className="imp-confirm__content">
        <div className="imp-confirm__who">
          <span className="imp-confirm__avatar" style={{ background: person.color }}>
            {person.avatarImg ? <img src={person.avatarImg} alt="" /> : person.initials}
          </span>
          <div className="imp-confirm__who-id">
            <div className="imp-confirm__who-name">{person.name}</div>
            <div className="imp-confirm__who-role">{person.role}</div>
          </div>
        </div>

        <ul className="imp-confirm__facts">
          <li>
            <TickCircle size={20} color="var(--success-500)" variant="Bold" className="imp-confirm__fi" />
            <span>You'll see their home, courses and progress <b>as they do</b>.</span>
          </li>
          <li>
            <Danger size={20} color="var(--warning-500)" variant="Bold" className="imp-confirm__fi" />
            <span>Your actions are <b>real</b> and <b>logged under your name ({adminName})</b>.</span>
          </li>
          <li>
            <CloseCircle size={20} color="var(--text-error)" variant="Bold" className="imp-confirm__fi" />
            <span>You <b>can't change</b> their password, email, role or notification settings.</span>
          </li>
          <li>
            <Clock size={20} color="var(--text-tertiary)" variant="Bold" className="imp-confirm__fi" />
            <span>The session <b>ends after 60 minutes</b>, with a warning first.</span>
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
