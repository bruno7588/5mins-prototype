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

/** Event types. `live` ones carry seeded rows; the rest are roadmap ("Soon"). */
export type AuditEventType =
  | 'course-settings'
  | 'course-enrolment'
  | 'user-change'
  | 'role-change'
  | 'integration-change'
  | 'program-change'

/**
 * The Events filter's taxonomy: the single "what happened" axis. `live` types
 * record today; the rest are shown disabled ("Soon") so the filter advertises
 * the roadmap and the row model proves out before the data lands (DEV-4540).
 * Change / Target / Surface are NOT filters — they're columns on the row.
 */
export const EVENT_TYPES: Record<AuditEventType, { label: string; live: boolean }> = {
  'course-settings': { label: 'Course settings', live: true },
  'course-enrolment': { label: 'Course enrolments', live: true },
  'user-change': { label: 'User changes', live: true },
  'role-change': { label: 'Roles & permissions', live: true },
  'integration-change': { label: 'Integrations & HRIS', live: false },
  'program-change': { label: 'Programs', live: false },
}

/** Where the change was made — shown in the Surface column. */
export type AuditSurfaceKey =
  | 'settings-tab'
  | 'compliance-config'
  | 'bulk-upload'
  | 'system'
  | 'enrolment'
  | 'user-admin'
  | 'roles-admin'

export interface AuditSurface {
  key: AuditSurfaceKey
  label: string
}

export const SURFACES: Record<AuditSurfaceKey, string> = {
  'settings-tab': 'Settings tab',
  'compliance-config': 'Compliance configuration',
  'bulk-upload': 'Bulk upload',
  system: 'System',
  enrolment: 'Enrolment',
  'user-admin': 'People admin',
  'roles-admin': 'Roles & permissions',
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
  // `emails` (parallel to `items`) is set when the list represents people, so the
  // impacted-users drawer can show each name's email as supporting text.
  | { kind: 'list'; items: string[]; emails?: string[] }
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
  /**
   * The object the event acted on, shown in the Target column.
   *  - `courseId` → a course event (settings/enrolment); links to the Settings tab.
   *  - `target`   → a non-course object's display label (a user, a role, …).
   * Course events set `courseId`; everything else sets `target`.
   */
  courseId?: string
  target?: string
  /** Field-level changes in this save. Length drives the operation label + count. */
  changes: AuditChange[]
}

const t = (text: string): AuditValue => ({ kind: 'text', text })
const list = (items: string[]): AuditValue => ({ kind: 'list', items })

/** Slugify a display name into a company email — "M. Silva" → m.silva@company.com. */
const emailFor = (name: string): string =>
  `${name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // strip accents (Fernández → fernandez)
    .toLowerCase()
    .replace(/\./g, '')
    .trim()
    .replace(/\s+/g, '.')}@company.com`

/** A people list-value — carries derived emails for the impacted-users drawer. */
const people = (names: string[]): AuditValue => ({
  kind: 'list',
  items: names,
  emails: names.map(emailFor),
})

// Newest first. Multi-change saves exist so the "Updated N course settings"
// count and the multi-line expanded detail are both exercised.
export const auditOperations: AuditOperation[] = ([
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
    role: 'Team Manager',
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
    role: 'Subject Expert',
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
    role: 'Team Manager',
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
    role: 'Subject Expert',
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
    role: 'Team Manager',
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
    role: 'Subject Expert',
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

  // ── Other event types (demo data) — enrolments, user changes, role changes.
  // Same row model; `target` stands in for `courseId` on non-course objects.
  {
    id: 'op-e1',
    eventType: 'course-enrolment',
    actor: 'Priya Nair',
    actorEmail: 'priya.n@company.com',
    role: 'Admin',
    surfaceKey: 'enrolment',
    timestamp: '2026-07-14T10:15:00Z',
    courseId: 'fire-safety',
    changes: [
      {
        settingKey: 'enrolled',
        setting: 'Enrolled 24 learners',
        // Full impacted list — the row shows the first few + a "+N" chip that
        // opens the drawer with every name.
        value: people([
          'Marco Rossi', 'Ana Ferreira', 'Liam Walsh', 'Sofia Almeida', 'Tomás Costa',
          'Isabel Moreira', 'Hugo Santos', 'Clara Nunes', 'Diego Fernández', 'Beatriz Lopes',
          'Nuno Carvalho', 'Elena Petrova', 'Rui Tavares', 'Mariana Silva', 'Pedro Gonçalves',
          'Inês Dias', 'Bruno Machado', 'Carla Ribeiro', 'André Pinto', 'Teresa Cardoso',
          'João Mendes', 'Patrícia Sousa', 'Filipe Ramos', 'Andreia Correia',
        ]),
      },
    ],
  },
  {
    id: 'op-u1',
    eventType: 'user-change',
    actor: 'Sarah Mitchell',
    actorEmail: 'sarah.m@company.com',
    role: 'Admin',
    surfaceKey: 'user-admin',
    timestamp: '2026-07-14T08:30:00Z',
    target: 'Michael Torres',
    changes: [
      { settingKey: 'department', setting: 'Department', value: t('Housekeeping') },
      { settingKey: 'manager', setting: 'Manager', value: t('Priya Nair') },
    ],
  },
  {
    id: 'op-r1',
    eventType: 'role-change',
    actor: 'Sarah Mitchell',
    actorEmail: 'sarah.m@company.com',
    role: 'Admin',
    surfaceKey: 'roles-admin',
    timestamp: '2026-07-13T16:45:00Z',
    target: 'Content Manager',
    changes: [
      { settingKey: 'perm-courses', setting: 'Manage courses', value: t('Granted') },
      { settingKey: 'perm-reports', setting: 'View reports', value: t('Granted') },
      { settingKey: 'perm-billing', setting: 'Manage billing', value: t('Revoked') },
    ],
  },
  {
    id: 'op-u2',
    eventType: 'user-change',
    actor: 'System',
    actorEmail: '—',
    role: 'System',
    surfaceKey: 'system',
    timestamp: '2026-07-12T02:00:00Z',
    target: 'Elena Rossi',
    changes: [{ settingKey: 'status', setting: 'Account status', value: t('Deactivated') }],
  },
  {
    id: 'op-e2',
    eventType: 'course-enrolment',
    actor: 'James Okafor',
    actorEmail: 'james.o@company.com',
    role: 'Admin',
    surfaceKey: 'bulk-upload',
    timestamp: '2026-07-11T14:00:00Z',
    courseId: 'harassment-prevention',
    changes: [
      { settingKey: 'unenrolled', setting: 'Removed 3 learners', value: people(['Alex Kim', 'Sam Doe', 'Jo Ray']) },
    ],
  },
  {
    id: 'op-u3',
    eventType: 'user-change',
    actor: 'James Okafor',
    actorEmail: 'james.o@company.com',
    role: 'Admin',
    surfaceKey: 'bulk-upload',
    timestamp: '2026-07-10T13:20:00Z',
    target: '8 new hires (bulk)',
    changes: [
      {
        settingKey: 'created',
        setting: 'Created 8 users',
        value: people([
          'G. Alves', 'M. Silva', 'R. Costa', 'L. Pereira',
          'N. Ferreira', 'S. Martins', 'T. Rocha', 'V. Sousa',
        ]),
      },
    ],
  },
  {
    id: 'op-r2',
    eventType: 'role-change',
    actor: 'Priya Nair',
    actorEmail: 'priya.n@company.com',
    role: 'Admin',
    surfaceKey: 'roles-admin',
    timestamp: '2026-07-09T11:00:00Z',
    target: 'David Chen',
    changes: [{ settingKey: 'role-assign', setting: 'Assigned role', value: t('Team Manager') }],
  },
  // Newest first — sorted by timestamp so demo rows interleave with course-settings.
] as AuditOperation[]).sort((a, b) => b.timestamp.localeCompare(a.timestamp))

// ── Derived helpers ─────────────────────────────────────────────────────────

/** The operation label. Carries the change count so the collapsed row conveys
 *  scale without exposing the target ("Updated 3 course settings"). */
export function operationLabel(op: AuditOperation): string {
  const n = op.changes.length
  switch (op.eventType) {
    case 'course-settings':
      return n === 1 ? 'Updated course settings' : `Updated ${n} course settings`
    case 'course-enrolment':
      return 'Updated enrolments'
    case 'user-change':
      return n === 1 ? 'Updated user' : `Updated user (${n} changes)`
    case 'role-change':
      return 'Updated role'
    // No seeded rows yet — labels ready for when the data lands.
    case 'integration-change':
      return 'Updated integration'
    case 'program-change':
      return 'Updated program'
  }
}

export function courseForOp(op: AuditOperation): AuditCourse {
  return (op.courseId && courseById[op.courseId]) || { id: op.courseId ?? '', name: op.courseId ?? '—' }
}

/** The Target column's label: the course name for course events, else the object. */
export function targetLabelForOp(op: AuditOperation): string {
  if (op.courseId) return courseForOp(op).name
  return op.target ?? '—'
}

/**
 * Stable key for the Target filter. Course events key off `courseId` (so the
 * Settings-history deep link can pre-select by id, not by display name);
 * everything else keys off its `target` label. Empty = untargeted, unfilterable.
 */
export function targetKeyForOp(op: AuditOperation): string {
  return op.courseId ?? op.target ?? ''
}

/** Distinct filter options, derived from the data so the bar stays in sync. */
function distinctBy<K extends string>(pairs: { value: K; label: string }[]) {
  const seen = new Map<string, string>()
  pairs.forEach((p) => {
    if (!seen.has(p.value)) seen.set(p.value, p.label)
  })
  return [...seen.entries()].map(([value, label]) => ({ value, label }))
}

/**
 * The Events filter options. Live types come first; the roadmap types follow as
 * `disabled` ("Soon") rows. Derived from EVENT_TYPES so the bar stays in sync as
 * types go live. Actor / Target stay filters (who / what was acted on);
 * Setting and Surface don't.
 */
export const EVENT_TYPE_OPTIONS = (Object.keys(EVENT_TYPES) as AuditEventType[])
  .map((key) => ({ value: key, label: EVENT_TYPES[key].label, disabled: !EVENT_TYPES[key].live }))
  .sort((a, b) => Number(a.disabled) - Number(b.disabled))

export const ACTOR_OPTIONS = distinctBy(
  auditOperations.map((op) => ({ value: op.actor, label: op.actor })),
).sort((a, b) => a.label.localeCompare(b.label))

/**
 * The Target filter options — every object the log has touched. Deliberately flat
 * and heterogeneous (courses alongside users and roles), mirroring the Target
 * column: the Events filter is what narrows it to one kind.
 */
export const TARGET_OPTIONS = distinctBy(
  auditOperations
    .filter((op) => targetKeyForOp(op) !== '')
    .map((op) => ({ value: targetKeyForOp(op), label: targetLabelForOp(op) })),
).sort((a, b) => a.label.localeCompare(b.label))

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
