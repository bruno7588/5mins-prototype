import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import ImpersonationBar from './ImpersonationBar'
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
  /** Record an attempt at something not allowed while impersonating. `action` is the
   *  same verb phrase the lock's tooltip uses ("open Admin", "change their email"). */
  logBlocked: (action: string) => void
  /** Prototype review: jump the countdown to just before the next phase (5:03 → 1:03 → back to 60:00). */
  skipAhead: () => void
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
  const navigate = useNavigate()

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
      addAudit('start', `Impersonation of ${target.name} by ${admin.name} started`)
      show('success', `Impersonating ${target.name}`)
      /* Drop into the learner's real home rather than a mock — the banner rides on top. */
      navigate('/workspace')
      window.scrollTo(0, 0)
    },
    [admin.name, addAudit, show, navigate],
  )

  const exit = useCallback(() => {
    setPerson((current) => {
      if (current) addAudit('end', `Impersonation of ${current.name} by ${admin.name} ended`)
      return null
    })
    show('success', 'Impersonation ended')
    navigate('/people')
    window.scrollTo(0, 0)
  }, [admin.name, addAudit, show, navigate])

  const logActivity = useCallback(
    (text: string) => {
      /* The standing "Audited · acting as …" line in the bar is the reminder, so
         activity is logged silently — no per-action toast. */
      if (person) addAudit('action', `${text} while impersonating ${person.name}`)
    },
    [person, addAudit],
  )

  /* No toast: the locked control's tooltip has already said why, so the attempt is
     only recorded. */
  const logBlocked = useCallback(
    (action: string) => {
      addAudit('blocked', `Blocked: ${admin.name} tried to ${action} while impersonating`)
    },
    [admin.name, addAudit],
  )

  const skipAhead = useCallback(() => {
    setRemaining((r) => {
      if (r > WARN_AT + 3) return WARN_AT + 3
      if (r > CRIT_AT + 3) return CRIT_AT + 3
      warned.current = false
      critWarned.current = false
      return SESSION_SECONDS
    })
  }, [])

  /* Push the app down by the fixed banner's height while a session is live, so it
     sits above the real page instead of covering its first rows. */
  useEffect(() => {
    document.body.classList.toggle('imp-impersonating', Boolean(person))
    return () => document.body.classList.remove('imp-impersonating')
  }, [person])

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
      show('warning', '5 minutes left')
    }
    if (remaining <= CRIT_AT && remaining > 0 && !critWarned.current) {
      critWarned.current = true
      show('warning', 'Less than 1 minute left')
    }
    if (remaining <= 0) {
      addAudit('expired', `Impersonation of ${person.name} by ${admin.name} expired after 60 minutes`)
      setPerson(null)
      show('success', 'Impersonation expired')
      navigate('/people')
      window.scrollTo(0, 0)
    }
  }, [remaining, person, admin.name, addAudit, show, navigate])

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
    skipAhead,
  }

  return (
    <ImpersonationCtx.Provider value={value}>
      {children}
      {/* Fixed banner over the real app (the learner's Workspace); toasts sit above it. */}
      {person && <ImpersonationBar />}
      <ToastContainer toasts={toasts} />
    </ImpersonationCtx.Provider>
  )
}
