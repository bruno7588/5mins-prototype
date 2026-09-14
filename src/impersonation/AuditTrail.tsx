import { ShieldTick } from 'iconsax-react'
import { useImpersonation } from './ImpersonationContext'
import type { AuditKind } from './types'
import './AuditTrail.css'

/* One colour per kind, mirroring the bar/toast semantics: start = orange, exit =
   green, blocked = red, expired = grey, in-session activity = brand. */
const DOT: Record<AuditKind, string> = {
  start: 'var(--warning-500)',
  end: 'var(--success-500)',
  blocked: 'var(--text-error)',
  expired: 'var(--text-tertiary)',
  action: 'var(--primary-700)',
}

function when(at: number): string {
  const t = new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${t} · today`
}

/**
 * Admin-facing impersonation audit trail (DES-337). Renders under the People table
 * and lists every session event — start, exit, auto-expiry, blocked attempts and
 * in-session activity — newest first, read from the shared session context.
 */
function AuditTrail() {
  const { audit } = useImpersonation()

  return (
    <div className="imp-audit">
      <div className="imp-audit__head">
        <ShieldTick size={16} color="currentColor" variant="Bold" />
        Impersonation audit trail
        <span className="imp-audit__count">Last 30 days</span>
      </div>

      {audit.length === 0 ? (
        <div className="imp-audit__empty">
          No impersonation sessions yet. Start one from a person's ⋯ menu — every start, exit, blocked
          attempt and in-session activity is recorded here.
        </div>
      ) : (
        audit.map((e) => (
          <div key={e.id} className="imp-audit__row">
            <span className="imp-audit__dot" style={{ background: DOT[e.kind] }} />
            <span className="imp-audit__ev">{e.text}</span>
            <span className="imp-audit__when">{when(e.at)}</span>
          </div>
        ))
      )}
    </div>
  )
}

export default AuditTrail
