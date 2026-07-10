// Mock audit-log data for the Account & Settings → Audit Log tab (DES-318).
// Generic event ledger (CloudTrail-style): each row is one action an actor
// performed on a target, recording the value it became. No field-level diffs —
// a prior value is inferable from the preceding entry for the same target.

export type AuditCategory =
  | 'Course settings'
  | 'Passcode'
  | 'Enrolment'
  | 'Course'
  | 'People & access'

/** Whether the affected target is a course or a person — gates row navigation. */
export type AuditTargetKind = 'course' | 'person'

export interface AuditEntry {
  id: string
  category: AuditCategory
  /** Stable key used by the Category filter. */
  categoryKey: string
  /** What happened, e.g. "Updated pass score", "Reset course passcode". */
  action: string
  /** The resource the action affected — a course, a learner, or a person. */
  target: string
  targetKind: AuditTargetKind
  /** The value the target became; '—' when the action carries no value (reset, delete, archive). */
  value: string
  actor: string
  actorEmail: string
  role: string
  /** ISO 8601 timestamp. */
  timestamp: string
}

/** Categories tracked at launch — drives the Category filter options. */
export const TRACKED_CATEGORIES: { key: string; label: AuditCategory }[] = [
  { key: 'course-settings', label: 'Course settings' },
  { key: 'passcode', label: 'Passcode' },
  { key: 'enrolment', label: 'Enrolment' },
  { key: 'course', label: 'Course' },
  { key: 'people', label: 'People & access' },
]

export const CATEGORY_FILTER_OPTIONS = [
  { value: 'all', label: 'All activity' },
  ...TRACKED_CATEGORIES.map((c) => ({ value: c.key, label: c.label })),
]

export const auditEntries: AuditEntry[] = [
  { id: 'a1', categoryKey: 'course-settings', category: 'Course settings', action: 'Updated pass score', target: 'Harassment Prevention', targetKind: 'course', value: '80%', actor: 'Sarah Mitchell', actorEmail: 'sarah.m@company.com', role: 'Admin', timestamp: '2026-07-09T14:32:00Z' },
  { id: 'a2', categoryKey: 'passcode', category: 'Passcode', action: 'Reset course passcode', target: 'Fire Safety', targetKind: 'course', value: '—', actor: 'James Okafor', actorEmail: 'james.o@company.com', role: 'Admin', timestamp: '2026-07-09T11:05:00Z' },
  { id: 'a3', categoryKey: 'enrolment', category: 'Enrolment', action: 'Enrolled learner', target: 'Food Safety Essentials', targetKind: 'course', value: 'David Chen', actor: 'Sarah Mitchell', actorEmail: 'sarah.m@company.com', role: 'Admin', timestamp: '2026-07-08T16:48:00Z' },
  { id: 'a4', categoryKey: 'course-settings', category: 'Course settings', action: 'Set compliance status', target: 'Anti-Money Laundering', targetKind: 'course', value: 'Compliance', actor: 'Priya Nair', actorEmail: 'priya.n@company.com', role: 'Admin', timestamp: '2026-07-08T09:20:00Z' },
  { id: 'a5', categoryKey: 'people', category: 'People & access', action: 'Changed user role', target: 'James Okafor', targetKind: 'person', value: 'Admin', actor: 'Sarah Mitchell', actorEmail: 'sarah.m@company.com', role: 'Admin', timestamp: '2026-07-07T13:11:00Z' },
  { id: 'a6', categoryKey: 'course', category: 'Course', action: 'Archived course', target: 'Allergen Awareness', targetKind: 'course', value: '—', actor: 'Elena Rossi', actorEmail: 'elena.r@company.com', role: 'Admin', timestamp: '2026-07-07T10:02:00Z' },
  { id: 'a7', categoryKey: 'passcode', category: 'Passcode', action: 'Changed course passcode', target: 'Cash Handling', targetKind: 'course', value: '—', actor: 'David Chen', actorEmail: 'david.c@company.com', role: 'Course Admin', timestamp: '2026-07-06T15:39:00Z' },
  { id: 'a8', categoryKey: 'enrolment', category: 'Enrolment', action: 'Bulk-enrolled department', target: 'GDPR Basics', targetKind: 'course', value: 'Finance · 24 learners', actor: 'Priya Nair', actorEmail: 'priya.n@company.com', role: 'Admin', timestamp: '2026-07-06T08:54:00Z' },
  { id: 'a9', categoryKey: 'course-settings', category: 'Course settings', action: 'Updated awarded jewels', target: 'Harassment Prevention', targetKind: 'course', value: '120', actor: 'David Chen', actorEmail: 'david.c@company.com', role: 'Course Admin', timestamp: '2026-07-05T17:23:00Z' },
  { id: 'a10', categoryKey: 'people', category: 'People & access', action: 'Deactivated user', target: 'Michael Grant', targetKind: 'person', value: '—', actor: 'System', actorEmail: '—', role: 'System', timestamp: '2026-07-05T02:00:00Z' },
  { id: 'a11', categoryKey: 'course', category: 'Course', action: 'Created course', target: 'Conflict Resolution', targetKind: 'course', value: '—', actor: 'Sarah Mitchell', actorEmail: 'sarah.m@company.com', role: 'Admin', timestamp: '2026-07-04T14:17:00Z' },
  { id: 'a12', categoryKey: 'enrolment', category: 'Enrolment', action: 'Removed enrolment', target: 'Allergen Awareness', targetKind: 'course', value: 'Priya Nair', actor: 'Elena Rossi', actorEmail: 'elena.r@company.com', role: 'Admin', timestamp: '2026-07-04T09:41:00Z' },
  { id: 'a13', categoryKey: 'course-settings', category: 'Course settings', action: 'Set compliance status', target: 'Fire Safety', targetKind: 'course', value: 'Non-compliance', actor: 'System', actorEmail: '—', role: 'System', timestamp: '2026-07-04T02:00:00Z' },
  { id: 'a14', categoryKey: 'passcode', category: 'Passcode', action: 'Enabled passcode protection', target: 'Anti-Money Laundering', targetKind: 'course', value: 'On', actor: 'James Okafor', actorEmail: 'james.o@company.com', role: 'Admin', timestamp: '2026-07-03T16:08:00Z' },
  { id: 'a15', categoryKey: 'course-settings', category: 'Course settings', action: 'Updated assessment attempts', target: 'GDPR Basics', targetKind: 'course', value: '3', actor: 'Priya Nair', actorEmail: 'priya.n@company.com', role: 'Admin', timestamp: '2026-07-03T11:30:00Z' },
  { id: 'a16', categoryKey: 'people', category: 'People & access', action: 'Invited user', target: 'lauren.b@company.com', targetKind: 'person', value: 'Course Admin', actor: 'Sarah Mitchell', actorEmail: 'sarah.m@company.com', role: 'Admin', timestamp: '2026-07-02T13:52:00Z' },
  { id: 'a17', categoryKey: 'course-settings', category: 'Course settings', action: 'Changed enrolment visibility', target: 'Cash Handling', targetKind: 'course', value: 'Managers only', actor: 'Elena Rossi', actorEmail: 'elena.r@company.com', role: 'Admin', timestamp: '2026-07-02T08:19:00Z' },
  { id: 'a18', categoryKey: 'course', category: 'Course', action: 'Published course', target: 'Conflict Resolution', targetKind: 'course', value: '—', actor: 'Sarah Mitchell', actorEmail: 'sarah.m@company.com', role: 'Admin', timestamp: '2026-07-01T15:44:00Z' },
  { id: 'a19', categoryKey: 'course-settings', category: 'Course settings', action: 'Updated course certificate', target: 'Food Safety Essentials', targetKind: 'course', value: 'Accredited certificate', actor: 'James Okafor', actorEmail: 'james.o@company.com', role: 'Admin', timestamp: '2026-07-01T10:26:00Z' },
  { id: 'a20', categoryKey: 'passcode', category: 'Passcode', action: 'Reset course passcode', target: 'GDPR Basics', targetKind: 'course', value: '—', actor: 'David Chen', actorEmail: 'david.c@company.com', role: 'Course Admin', timestamp: '2026-06-30T17:03:00Z' },
  { id: 'a21', categoryKey: 'enrolment', category: 'Enrolment', action: 'Enrolled learner', target: 'Fire Safety', targetKind: 'course', value: 'Elena Rossi', actor: 'Priya Nair', actorEmail: 'priya.n@company.com', role: 'Admin', timestamp: '2026-06-30T09:12:00Z' },
  { id: 'a22', categoryKey: 'people', category: 'People & access', action: 'Changed user role', target: 'David Chen', targetKind: 'person', value: 'Course Admin', actor: 'Sarah Mitchell', actorEmail: 'sarah.m@company.com', role: 'Admin', timestamp: '2026-06-29T14:38:00Z' },
  { id: 'a23', categoryKey: 'course-settings', category: 'Course settings', action: 'Updated pass score', target: 'Conflict Resolution', targetKind: 'course', value: '70%', actor: 'James Okafor', actorEmail: 'james.o@company.com', role: 'Admin', timestamp: '2026-06-29T08:47:00Z' },
  { id: 'a24', categoryKey: 'course', category: 'Course', action: 'Duplicated course', target: 'Harassment Prevention', targetKind: 'course', value: '—', actor: 'Elena Rossi', actorEmail: 'elena.r@company.com', role: 'Admin', timestamp: '2026-06-28T16:15:00Z' },
  { id: 'a25', categoryKey: 'enrolment', category: 'Enrolment', action: 'Bulk-enrolled department', target: 'Cash Handling', targetKind: 'course', value: 'Operations · 18 learners', actor: 'David Chen', actorEmail: 'david.c@company.com', role: 'Course Admin', timestamp: '2026-06-28T11:09:00Z' },
  { id: 'a26', categoryKey: 'enrolment', category: 'Enrolment', action: 'Removed enrolment', target: 'Anti-Money Laundering', targetKind: 'course', value: 'Michael Grant', actor: 'James Okafor', actorEmail: 'james.o@company.com', role: 'Admin', timestamp: '2026-06-27T15:20:00Z' },
]
