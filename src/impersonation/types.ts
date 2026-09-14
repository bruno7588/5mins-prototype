/** A person the admin can view the app as. Carried into the session from the
 *  People row so the bar, learner view and audit trail all name the same user. */
export interface ImpersonatedPerson {
  id: number
  name: string
  email: string
  /** Initials fallback shown when there's no avatar image (e.g. "SR"). */
  initials: string
  avatarImg?: string
  /** Avatar circle background used when there's no image. */
  color: string
}

/** The shape of one line in the impersonation audit trail. `action` and `blocked`
 *  are recorded from inside the learner view; the rest bracket the session. */
export type AuditKind = 'start' | 'end' | 'blocked' | 'expired' | 'action'

export interface AuditEntry {
  id: number
  kind: AuditKind
  text: string
  /** epoch ms, stamped when the entry is created. */
  at: number
}
