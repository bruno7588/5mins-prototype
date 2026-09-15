import { Logout } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ImpersonateIcon from '@/components/icons/ImpersonateIcon'
import { useImpersonation } from './ImpersonationContext'
import './ImpersonationBar.css'

/** Formats seconds as mm:ss with tabular digits so the countdown doesn't jitter. */
function mmss(total: number): string {
  const secs = Math.max(total, 0)
  const m = String(Math.floor(secs / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${m}:${s}`
}

/**
 * The banner shown while impersonating: identity on the left, the session countdown and
 * End Impersonation on the right. A tinted bar whose colour escalates from primary to
 * warning to danger as the 60-minute cap nears (Figma People 9600:43180 / 9601:44620 /
 * 9601:46094). The End button stays the primary Filled button in every state: ending is
 * the safe exit, not a destructive or cautionary action.
 */
function ImpersonationBar() {
  const { person, remaining, phase, exit, skipAhead } = useImpersonation()
  if (!person) return null

  return (
    <div className={`imp-bar imp-bar--${phase}`} role="status" aria-live="polite">
      <span className="imp-bar__identity">
        <span className="imp-bar__prefix">
          <ImpersonateIcon size={20} className="imp-bar__mask" />
          <span className="imp-bar__prefix-text">Impersonating</span>
        </span>
        <span className="imp-bar__person">
          <span className="imp-bar__avatar">
            {person.avatarImg ? <img src={person.avatarImg} alt="" /> : person.initials}
          </span>
          <span className="imp-bar__label">
            <strong className="imp-bar__name">{person.name}</strong>
            <span className="imp-bar__role">· {person.role}</span>
          </span>
        </span>
      </span>

      <span className="imp-bar__session">
        {/* Prototype review: click the timer to jump to 5:03, then 1:03, then back to 60:00,
            so the warning and critical states can be seen without waiting out the session.
            Kept in deployed builds too, so reviewers can use it. */}
        <button type="button" className="imp-bar__timer" onClick={skipAhead} title="Skip ahead">
          <span className="imp-bar__dot" aria-hidden="true" />
          <span className="imp-bar__time">{mmss(remaining)}</span>
        </button>

        <Button
          onClick={exit}
          icon={<Logout size={20} color="currentColor" variant="Linear" />}
        >
          End Impersonation
        </Button>
      </span>
    </div>
  )
}

export default ImpersonationBar
