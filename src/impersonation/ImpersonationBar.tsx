import { Eye, Clock, ShieldTick, LogoutCurve, Forward } from 'iconsax-react'
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
 * The persistent bar across the top of the impersonated view: who you're viewing
 * as, a live countdown to the 60-minute cap, the standing "audited" reminder, and
 * one-click exit. It shifts amber → red as the cap approaches (see .css). The
 * "Simulate time" control is prototype-only, so the warning states are demoable.
 */
function ImpersonationBar() {
  const { person, adminName, remaining, phase, exit, simulateTime } = useImpersonation()
  if (!person) return null
  const adminFirst = adminName.split(' ')[0]

  return (
    <div className={`imp-bar imp-bar--${phase}`} role="status" aria-live="polite">
      <Eye size={22} color="currentColor" variant="Bold" className="imp-bar__eye" />
      <div className="imp-bar__who">
        You're viewing 5Mins as {person.name}
        <small>{person.email}</small>
      </div>

      <span className="imp-bar__pill">
        <Clock size={13} color="currentColor" variant="Bold" />
        <span className="imp-bar__timer">{mmss(remaining)}</span>
      </span>

      <button
        type="button"
        className="imp-bar__demo"
        onClick={simulateTime}
        title="Prototype only — fast-forward the session clock"
      >
        <Forward size={13} color="currentColor" variant="Bold" />
        Simulate time
      </button>

      <span className="imp-bar__spacer" />

      <span className="imp-bar__audit">
        <ShieldTick size={14} color="currentColor" variant="Bold" />
        Audited · acting as {adminFirst}
      </span>

      <button type="button" className="imp-bar__exit" onClick={exit}>
        <LogoutCurve size={14} color="currentColor" variant="Linear" />
        Exit impersonation
      </button>
    </div>
  )
}

export default ImpersonationBar
