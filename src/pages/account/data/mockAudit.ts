// Mock audit-log data for Account & Settings → Audit Log (DES-318).
//
// Model = OPERATIONS, not items. One save is ONE row, however many fields it
// touched (SafetyCulture-style). The collapsed row states only what happened,
// who did it, their role at the time, the surface, and when — no target and no
// values. The target and per-field new values live only in the expanded detail.
//
// New-values-only: there is no before/after diff. An entry is written only when
// a value actually changes, so the recorded value is by definition the new one.
//
// The shape is intentionally event-type-agnostic: `eventType` is a union so the
// upcoming enrolment and user-change types (DEV-4540) reuse the exact same row
// behaviour, differing only in their expanded content.

/** Event types. Only `course-settings` records at launch; the rest arrive in DEV-4540. */
export type AuditEventType = 'course-settings' | 'course-enrolment' | 'user-change'

/** Where the change was made — drives the Surface filter. */
export type AuditSurfaceKey = 'settings-tab' | 'compliance-config' | 'bulk-upload' | 'system'

export interface AuditSurface {
  key: AuditSurfaceKey
  label: string
}

export const SURFACES: Record<AuditSurfaceKey, string> = {
  'settings-tab': 'Settings tab',
  'compliance-config': 'Compliance configuration',
  'bulk-upload': 'Bulk upload',
  system: 'System',
}

/** A course that can be a target — id links through to its Settings tab. */
export interface AuditCourse {
  id: string
  name: string
}

export const COURSES: AuditCourse[] = [
  { id: 'building-company-culture', name: 'Building Company Culture' },
  { id: 'harassment-prevention', name: 'Harassment Prevention' },
  { id: 'fire-safety', name: 'Fire Safety' },
  { id: 'food-safety-essentials', name: 'Food Safety Essentials' },
  { id: 'anti-money-laundering', name: 'Anti-Money Laundering' },
  { id: 'gdpr-basics', name: 'GDPR Basics' },
  { id: 'cash-handling', name: 'Cash Handling' },
  { id: 'conflict-resolution', name: 'Conflict Resolution' },
]

const courseById = Object.fromEntries(COURSES.map((c) => [c.id, c])) as Record<string, AuditCourse>

/**
 * The course whose Settings tab the prototype renders (CourseDetails).
 * The "Settings history" button counts and deep-links to this course.
 */
export const SETTINGS_TAB_COURSE_ID = 'building-company-culture'

/**
 * A changed setting's new value. Different settings resolve to different shapes;
 * with new-values-only we only ever render the value it became.
 *  - text   → a scalar (percent, number, enum, On/Off)
 *  - list   → a multi-value setting (e.g. course categories)
 *  - object → a structured value with an optional sub-line (e.g. a certificate)
 */
export type AuditValue =
  | { kind: 'text'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'object'; label: string; sub?: string }

/** One field-level change inside an operation. Rendered as one line on expand. */
export interface AuditChange {
  /** Stable key used by the Setting filter. */
  settingKey: string
  /** Human label, e.g. "Pass score". */
  setting: string
  value: AuditValue
}

/** One operation = one collapsed row. */
export interface AuditOperation {
  id: string
  eventType: AuditEventType
  /** Actor + role captured AT THE TIME of the change (not their current role). */
  actor: string
  actorEmail: string
  role: string
  surfaceKey: AuditSurfaceKey
  /** ISO 8601 timestamp. */
  timestamp: string
  /** Target course — shown only when expanded, links to the course Settings tab. */
  courseId: string
  /** Field-level changes in this save. Length drives the operation label + count. */
  changes: AuditChange[]
}

const t = (text: string): AuditValue => ({ kind: 'text', text })
const list = (items: string[]): AuditValue => ({ kind: 'list', items })

// Newest first. Multi-change saves exist so the "Updated N course settings"
// count and the multi-line expanded detail are both exercised.
export const auditOperations: AuditOperation[] = [
  {
    id: 'op1',
    eventType: 'course-settings',
    actor: 'Sarah Mitchell',
    actorEmail: 'sarah.m@company.com',
    role: 'Admin',
    surfaceKey: 'settings-tab',
    timestamp: '2026-07-13T14:32:00Z',
    courseId: 'building-company-culture',
    changes: [
      { settingKey: 'pass-score', setting: 'Pass score', value: t('80%') },
      { settingKey: 'retakes', setting: 'Assessment retakes', value: t('3 attempts') },
      { settingKey: 'auto-reset', setting: 'Auto-reset on failure', value: t('On · 3 re-attempts') },
    ],
  },
  {
    id: 'op2',
    eventType: 'course-settings',
    actor: 'James Okafor',
    actorEmail: 'james.o@company.com',
    role: 'Admin',
    surfaceKey: 'compliance-config',
    timestamp: '2026-07-13T11:05:00Z',
    courseId: 'fire-safety',
    changes: [{ settingKey: 'compliance', setting: 'Compliance course', value: t('On') }],
  },
  {
    id: 'op3',
    eventType: 'course-settings',
    actor: 'Priya Nair',
    actorEmail: 'priya.n@company.com',
    role: 'Admin',
    surfaceKey: 'settings-tab',
    timestamp: '2026-07-12T16:48:00Z',
    courseId: 'building-company-culture',
    changes: [
      { settingKey: 'categories', setting: 'Course categories', value: list(['Compliance', 'Onboarding', 'HR']) },
      { settingKey: 'managers-see-all', setting: 'Managers see all enrolments', value: t('On') },
    ],
  },
  {
    id: 'op4',
    eventType: 'course-settings',
    actor: 'Priya Nair',
    actorEmail: 'priya.n@company.com',
    role: 'Admin',
    surfaceKey: 'settings-tab',
    timestamp: '2026-07-11T09:20:00Z',
    courseId: 'anti-money-laundering',
    changes: [
      { settingKey: 'certificate', setting: 'Certificate', value: { kind: 'object', label: 'Accredited certificate', sub: 'ISO 9001 template' } },
    ],
  },
  {
    id: 'op5',
    eventType: 'course-settings',
    actor: 'System',
    actorEmail: '—',
    role: 'System',
    surfaceKey: 'system',
    timestamp: '2026-07-11T02:00:00Z',
    courseId: 'fire-safety',
    changes: [{ settingKey: 'compliance', setting: 'Compliance course', value: t('Off') }],
  },
  {
    id: 'op6',
    eventType: 'course-settings',
    actor: 'David Chen',
    actorEmail: 'david.c@company.com',
    role: 'Course Admin',
    surfaceKey: 'settings-tab',
    timestamp: '2026-07-10T17:23:00Z',
    courseId: 'harassment-prevention',
    changes: [
      { settingKey: 'rewards', setting: 'Reward jewels', value: t('120 jewels') },
      { settingKey: 'pass-score', setting: 'Pass score', value: t('85%') },
    ],
  },
  {
    id: 'op7',
    eventType: 'course-settings',
    actor: 'Sarah Mitchell',
    actorEmail: 'sarah.m@company.com',
    role: 'Admin',
    surfaceKey: 'settings-tab',
    timestamp: '2026-07-10T08:54:00Z',
    courseId: 'building-company-culture',
    changes: [{ settingKey: 'enrolment-visibility', setting: 'Enrolment visibility', value: t('Managers only') }],
  },
  {
    id: 'op8',
    eventType: 'course-settings',
    actor: 'Elena Rossi',
    actorEmail: 'elena.r@company.com',
    role: 'Admin',
    surfaceKey: 'settings-tab',
    timestamp: '2026-07-09T15:39:00Z',
    courseId: 'gdpr-basics',
    changes: [
      { settingKey: 'access-after-due', setting: 'Access after due date', value: t('On') },
      { settingKey: 'lessons-in-order', setting: 'Complete lessons in order', value: t('On') },
      { settingKey: 'fast-forward', setting: 'Fast forwarding', value: t('Off') },
    ],
  },
  {
    id: 'op9',
    eventType: 'course-settings',
    actor: 'David Chen',
    actorEmail: 'david.c@company.com',
    role: 'Course Admin',
    surfaceKey: 'settings-tab',
    timestamp: '2026-07-09T08:47:00Z',
    courseId: 'building-company-culture',
    changes: [{ settingKey: 'rewards', setting: 'Reward jewels', value: t('200 jewels') }],
  },
  {
    id: 'op10',
    eventType: 'course-settings',
    actor: 'James Okafor',
    actorEmail: 'james.o@company.com',
    role: 'Admin',
    surfaceKey: 'settings-tab',
    timestamp: '2026-07-08T10:26:00Z',
    courseId: 'food-safety-essentials',
    changes: [
      { settingKey: 'certificate', setting: 'Certificate', value: { kind: 'object', label: 'Standard certificate' } },
      { settingKey: 'pass-score', setting: 'Pass score', value: t('75%') },
    ],
  },
  {
    id: 'op11',
    eventType: 'course-settings',
    actor: 'Elena Rossi',
    actorEmail: 'elena.r@company.com',
    role: 'Admin',
    surfaceKey: 'settings-tab',
    timestamp: '2026-07-07T08:19:00Z',
    courseId: 'cash-handling',
    changes: [{ settingKey: 'enrolment-visibility', setting: 'Enrolment visibility', value: t('Everyone') }],
  },
  {
    id: 'op12',
    eventType: 'course-settings',
    actor: 'Sarah Mitchell',
    actorEmail: 'sarah.m@company.com',
    role: 'Admin',
    surfaceKey: 'settings-tab',
    timestamp: '2026-07-06T13:11:00Z',
    courseId: 'building-company-culture',
    changes: [
      { settingKey: 'background-playback', setting: 'Background playback', value: t('On') },
      { settingKey: 'fast-forward', setting: 'Fast forwarding', value: t('On') },
    ],
  },
  {
    id: 'op13',
    eventType: 'course-settings',
    actor: 'Priya Nair',
    actorEmail: 'priya.n@company.com',
    role: 'Admin',
    surfaceKey: 'compliance-config',
    timestamp: '2026-07-05T11:30:00Z',
    courseId: 'gdpr-basics',
    changes: [{ settingKey: 'retakes', setting: 'Assessment retakes', value: t('2 attempts') }],
  },
  {
    id: 'op14',
    eventType: 'course-settings',
    actor: 'David Chen',
    actorEmail: 'david.c@company.com',
    role: 'Course Admin',
    surfaceKey: 'settings-tab',
    timestamp: '2026-07-04T16:15:00Z',
    courseId: 'harassment-prevention',
    changes: [{ settingKey: 'categories', setting: 'Course categories', value: list(['Compliance', 'HR']) }],
  },
  {
    id: 'op15',
    eventType: 'course-settings',
    actor: 'Elena Rossi',
    actorEmail: 'elena.r@company.com',
    role: 'Admin',
    surfaceKey: 'settings-tab',
    timestamp: '2026-07-03T09:41:00Z',
    courseId: 'building-company-culture',
    changes: [
      { settingKey: 'access-after-due', setting: 'Access after due date', value: t('Off') },
      { settingKey: 'auto-reset', setting: 'Auto-reset on failure', value: t('Off') },
    ],
  },
  {
    id: 'op16',
    eventType: 'course-settings',
    actor: 'James Okafor',
    actorEmail: 'james.o@company.com',
    role: 'Admin',
    surfaceKey: 'settings-tab',
    timestamp: '2026-07-02T13:52:00Z',
    courseId: 'conflict-resolution',
    changes: [{ settingKey: 'pass-score', setting: 'Pass score', value: t('70%') }],
  },
  {
    id: 'op17',
    eventType: 'course-settings',
    actor: 'System',
    actorEmail: '—',
    role: 'System',
    surfaceKey: 'system',
    timestamp: '2026-07-01T02:00:00Z',
    courseId: 'anti-money-laundering',
    changes: [{ settingKey: 'compliance', setting: 'Compliance course', value: t('On') }],
  },
  {
    id: 'op18',
    eventType: 'course-settings',
    actor: 'Sarah Mitchell',
    actorEmail: 'sarah.m@company.com',
    role: 'Admin',
    surfaceKey: 'settings-tab',
    timestamp: '2026-06-30T10:02:00Z',
    courseId: 'building-company-culture',
    changes: [{ settingKey: 'certificate', setting: 'Certificate', value: { kind: 'object', label: 'Accredited certificate', sub: 'CPD-branded' } }],
  },
]

// ── Derived helpers ─────────────────────────────────────────────────────────

/** The operation label. Carries the change count so the collapsed row conveys
 *  scale without exposing the target ("Updated 3 course settings"). */
export function operationLabel(op: AuditOperation): string {
  if (op.eventType === 'course-settings') {
    const n = op.changes.length
    return n === 1 ? 'Updated course settings' : `Updated ${n} course settings`
  }
  // Placeholders for the upcoming event types (DEV-4540).
  if (op.eventType === 'course-enrolment') return 'Enrolled learners'
  return 'Updated user'
}

export function courseForOp(op: AuditOperation): AuditCourse {
  return courseById[op.courseId] ?? { id: op.courseId, name: op.courseId }
}

/** Distinct filter options, derived from the data so the bar stays in sync. */
function distinctBy<K extends string>(pairs: { value: K; label: string }[]) {
  const seen = new Map<string, string>()
  pairs.forEach((p) => {
    if (!seen.has(p.value)) seen.set(p.value, p.label)
  })
  return [...seen.entries()].map(([value, label]) => ({ value, label }))
}

export const SETTING_OPTIONS = distinctBy(
  auditOperations
    .flatMap((op) => op.changes)
    .map((c) => ({ value: c.settingKey, label: c.setting })),
).sort((a, b) => a.label.localeCompare(b.label))

export const ACTOR_OPTIONS = distinctBy(
  auditOperations.map((op) => ({ value: op.actor, label: op.actor })),
).sort((a, b) => a.label.localeCompare(b.label))

export const COURSE_OPTIONS = distinctBy(
  auditOperations.map((op) => {
    const c = courseForOp(op)
    return { value: c.id, label: c.name }
  }),
).sort((a, b) => a.label.localeCompare(b.label))

export const SURFACE_OPTIONS = distinctBy(
  auditOperations.map((op) => ({ value: op.surfaceKey, label: SURFACES[op.surfaceKey] })),
)

/** Preset date-range windows (days back from today). `null` = All time. */
export const DATE_RANGE_OPTIONS: { value: string; label: string; days: number | null }[] = [
  { value: 'all', label: 'All time', days: null },
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
]

/** How many recorded operations touched a given course (for the count badge). */
export function operationCountForCourse(courseId: string): number {
  return auditOperations.filter((op) => op.courseId === courseId).length
}
