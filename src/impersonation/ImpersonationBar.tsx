import { Eye, Clock, LogoutCurve } from 'iconsax-react'
import Button from '@/components/Button/Button'
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
 * The fixed banner across the top of the app while impersonating. Carries the same
 * avatar + name + role identity block as the confirm modal, a live countdown to the
 * 60-minute cap, and one-click exit. It shifts to the DS warning then danger tokens
 * as the cap approaches (see .css).
 */
function ImpersonationBar() {
  const { person, remaining, phase, exit } = useImpersonation()
  if (!person) return null

  return (
    <div className={`imp-bar imp-bar--${phase}`} role="status" aria-live="polite">
      <Eye size={20} color="currentColor" variant="Bold" className="imp-bar__eye" />
      <span className="imp-bar__label">Viewing as</span>

      <span className="imp-bar__who">
        <span className="imp-bar__avatar" style={{ background: person.color }}>
          {person.avatarImg ? <img src={person.avatarImg} alt="" /> : person.initials}
        </span>
        <span className="imp-bar__id">
          <span className="imp-bar__name">{person.name}</span>
          <span className="imp-bar__role">{person.role}</span>
        </span>
      </span>

      <span className="imp-bar__spacer" />

      <span className="imp-bar__pill">
        <Clock size={16} color="currentColor" variant="Linear" />
        {/* 16px = DS standard icon size (13 was off-scale) */}
        <span className="imp-bar__timer">{mmss(remaining)}</span>
      </span>

      <Button
        variant="outlined-2"
        onClick={exit}
        icon={<LogoutCurve size={20} color="currentColor" variant="Linear" />}
      >
        Exit Impersonation
      </Button>
    </div>
  )
}

export default ImpersonationBar
