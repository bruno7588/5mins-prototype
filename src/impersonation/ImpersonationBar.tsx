import { LogoutCurve } from 'iconsax-react'
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
 * The floating "Impersonating" pill shown while impersonating: identity inline on the
 * left, the session countdown and a compact Exit on the right. Amber at rest,
 * escalating to the DS warning then danger tokens as the 60-minute cap nears.
 */
function ImpersonationBar() {
  const { person, remaining, phase, exit } = useImpersonation()
  if (!person) return null

  return (
    <div className={`imp-bar imp-bar--${phase}`} role="status" aria-live="polite">
      <span className="imp-bar__who">
        <ImpersonateIcon size={20} className="imp-bar__eye" />
        <span className="imp-bar__prefix">Impersonating</span>
        <span className="imp-bar__avatar">
          {person.avatarImg ? <img src={person.avatarImg} alt="" /> : person.initials}
        </span>
        <span className="imp-bar__label">
          <strong>{person.name}</strong>
          <span className="imp-bar__role"> · {person.role}</span>
        </span>
      </span>

      <span className="imp-bar__spacer" />

      <span className="imp-bar__timer">
        <span className="imp-bar__dot" aria-hidden="true" />
        <span className="imp-bar__time">{mmss(remaining)}</span>
      </span>

      <Button
        onClick={exit}
        icon={<LogoutCurve size={20} color="currentColor" variant="Linear" />}
      >
        End Impersonation
      </Button>
    </div>
  )
}

export default ImpersonationBar
