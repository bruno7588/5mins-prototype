import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import ImpersonationBar from './ImpersonationBar'
import ImpersonationView from './ImpersonationView'
import type { AuditEntry, AuditKind, ImpersonatedPerson } from './types'

/**
 * User impersonation ("Ghost Admin"), DES-337. A tenant admin views the app as a
 * learner to reproduce their issue. This provider is the whole session: it holds
 * who is being impersonated, runs the 60-minute cap with wrap-up warnings, records
 * every start/exit/blocked-action/activity to an audit trail, and renders the
 * persistent bar + the learner view over the admin app while a session is live.
 *
 * Prototype scope: the identity swap is local (the learner view is self-contained),
 * actions are logged in memory, and the learner sees no notification (V1).
 */

const SESSION_SECONDS = 60 * 60
/* Wrap-up warning at 5:00, then a critical warning under 1:00 before auto-exit —
   matches the PM prototype and the "warning before it ends" line in the dialog. */
const WARN_AT = 5 * 60
const CRIT_AT = 60

export type SessionPhase = 'normal' | 'warning' | 'critical'

interface ImpersonationValue {
  person: ImpersonatedPerson | null
  /** Full name of the admin every action is recorded against. */
  adminName: string
  remaining: number
  phase: SessionPhase
  audit: AuditEntry[]
  start: (person: ImpersonatedPerson) => void
  exit: () => void
  /** Record something the admin did inside the learner view (opened a course…). */
  logActivity: (text: string) => void
  /** Record + surface a blocked sensitive action (password, email, role, notifications). */
  logBlocked: (what: string) => void
  /** Prototype-only: fast-forward the clock to the next threshold so the warning
   *  and auto-exit states are demoable without waiting an hour. */
  simulateTime: () => void
}

const ImpersonationCtx = createContext<ImpersonationValue | null>(null)

export function useImpersonation(): ImpersonationValue {
  const ctx = useContext(ImpersonationCtx)
  if (!ctx) throw new Error('useImpersonation must be used within ImpersonationProvider')
  return ctx
}

let auditIdCounter = 0

export function ImpersonationProvider({ children }: { children: ReactNode }) {
  const admin = useCurrentUser()
  const adminFirst = admin.name.split(' ')[0]

  const [person, setPerson] = useState<ImpersonatedPerson | null>(null)
  const [remaining, setRemaining] = useState(SESSION_SECONDS)
  const [audit, setAudit] = useState<AuditEntry[]>([])
  const { toasts, show } = useToast()

  /* Threshold toasts fire once per session; refs so the interval tick doesn't
     re-arm them and doesn't need them in its dependency list. */
  const warned = useRef(false)
  const critWarned = useRef(false)

  const phase: SessionPhase =
    remaining <= CRIT_AT ? 'critical' : remaining <= WARN_AT ? 'warning' : 'normal'

  const addAudit = useCallback((kind: AuditKind, text: string) => {
    setAudit((prev) => [{ id: ++auditIdCounter, kind, text, at: Date.now() }, ...prev])
  }, [])

  const start = useCallback(
    (target: ImpersonatedPerson) => {
      warned.current = false
      critWarned.current = false
      setRemaining(SESSION_SECONDS)
      setPerson(target)
      addAudit('start', `${admin.name} started impersonating ${target.name}`)
      show('success', `Impersonating ${target.name} · session started and logged`)
      window.scrollTo(0, 0)
    },
    [admin.name, addAudit, show],
  )

  const exit = useCallback(() => {
    setPerson((current) => {
      if (current) addAudit('end', `${admin.name} exited impersonation of ${current.name}`)
      return null
    })
    show('success', `Impersonation ended · you're back as ${admin.name}`)
    window.scrollTo(0, 0)
  }, [admin.name, addAudit, show])

  const logActivity = useCallback(
    (text: string) => {
      /* The standing "Audited · acting as …" line in the bar is the reminder, so
         activity is logged silently — no per-action toast. */
      if (person) addAudit('action', `${text} — acting as ${person.name}`)
    },
    [person, addAudit],
  )

  const logBlocked = useCallback(
    (what: string) => {
      const first = person ? person.name.split(' ')[0] : 'the learner'
      addAudit('blocked', `Blocked: ${admin.name} tried to change ${first}'s ${what}`)
      show('error', `Blocked while impersonating — you can't change someone else's ${what}`)
    },
    [person, admin.name, addAudit, show],
  )

  const simulateTime = useCallback(() => {
    setRemaining((r) => {
      if (r > WARN_AT) return WARN_AT + 3
      if (r > CRIT_AT + 4) return CRIT_AT + 4
      return 5
    })
  }, [])

  /* One ticking clock, alive only while a session is. It decrements the second
     counter and fires the two wrap-up warnings; expiry is handled as a side
     effect of the counter reaching zero (below) so it runs once. */
  useEffect(() => {
    if (!person) return
    const id = window.setInterval(() => {
      setRemaining((r) => Math.max(r - 1, 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [person])

  useEffect(() => {
    if (!person) return
    if (remaining <= WARN_AT && remaining > CRIT_AT && !warned.current) {
      warned.current = true
      show('warning', '5 minutes left in this impersonation session — wrap up soon.')
    }
    if (remaining <= CRIT_AT && remaining > 0 && !critWarned.current) {
      critWarned.current = true
      show('warning', `Under a minute left — the session will end and return you to ${adminFirst} automatically.`)
    }
    if (remaining <= 0) {
      addAudit('expired', `Session with ${person.name} auto-expired after 60 minutes`)
      setPerson(null)
      show('success', `Session auto-expired after 60 minutes · back as ${admin.name}`)
      window.scrollTo(0, 0)
    }
  }, [remaining, person, adminFirst, admin.name, addAudit, show])

  const value: ImpersonationValue = {
    person,
    adminName: admin.name,
    remaining,
    phase,
    audit,
    start,
    exit,
    logActivity,
    logBlocked,
    simulateTime,
  }

  return (
    <ImpersonationCtx.Provider value={value}>
      {children}
      {person && (
        <div className="imp-overlay">
          <ImpersonationBar />
          <ImpersonationView />
        </div>
      )}
      {/* Sibling of the overlay so warning / blocked toasts sit above it. */}
      <ToastContainer toasts={toasts} />
    </ImpersonationCtx.Provider>
  )
}
