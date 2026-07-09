// Mock audit-log data for the Account & Settings → Audit Log tab (DES-318).
// At launch the log records course-settings changes only.

export type AuditSurface = 'Settings tab' | 'Compliance configuration' | 'System'

export interface AuditEntry {
  id: string
  courseId: string
  course: string
  /** Human label of the setting that changed. */
  setting: string
  /** Stable key used by the Setting filter. */
  settingKey: string
  previousValue: string
  newValue: string
  actor: string
  actorEmail: string
  role: string
  surface: AuditSurface
  /** ISO 8601 timestamp. */
  timestamp: string
}

/** Settings tracked at launch — drives the Setting filter options. */
export const TRACKED_SETTINGS: { key: string; label: string }[] = [
  { key: 'pass-score', label: 'Pass score' },
  { key: 'awarded-jewels', label: 'Awarded jewels' },
  { key: 'assessment-attempts', label: 'Assessment attempts' },
  { key: 'access-after-due-date', label: 'Allow access after due date' },
  { key: 'electronic-signature', label: 'Requires electronic signature' },
  { key: 'enrolment-visibility', label: 'Enrolment visibility' },
  { key: 'compliance-status', label: 'Compliance status' },
  { key: 'background-playback', label: 'Disable background playback' },
  { key: 'course-categories', label: 'Course categories' },
  { key: 'course-certificate', label: 'Course certificate' },
]

export const SETTING_FILTER_OPTIONS = [
  { value: 'all', label: 'All settings' },
  ...TRACKED_SETTINGS.map((s) => ({ value: s.key, label: s.label })),
]

export const auditEntries: AuditEntry[] = [
  { id: 'a1', courseId: 'c1', course: 'Harassment Prevention', setting: 'Pass score', settingKey: 'pass-score', previousValue: '70%', newValue: '80%', actor: 'Sarah Mitchell', actorEmail: 'sarah.m@company.com', role: 'Admin', surface: 'Settings tab', timestamp: '2026-07-09T14:32:00Z' },
  { id: 'a2', courseId: 'c2', course: 'Food Safety Essentials', setting: 'Compliance status', settingKey: 'compliance-status', previousValue: 'Non-compliance', newValue: 'Compliance', actor: 'James Okafor', actorEmail: 'james.o@company.com', role: 'Admin', surface: 'Compliance configuration', timestamp: '2026-07-09T11:05:00Z' },
  { id: 'a3', courseId: 'c3', course: 'Fire Safety', setting: 'Requires electronic signature', settingKey: 'electronic-signature', previousValue: 'No', newValue: 'Yes', actor: 'Sarah Mitchell', actorEmail: 'sarah.m@company.com', role: 'Admin', surface: 'Settings tab', timestamp: '2026-07-08T16:48:00Z' },
  { id: 'a4', courseId: 'c4', course: 'Anti-Money Laundering', setting: 'Awarded jewels', settingKey: 'awarded-jewels', previousValue: '50', newValue: '100', actor: 'Priya Nair', actorEmail: 'priya.n@company.com', role: 'Admin', surface: 'Settings tab', timestamp: '2026-07-08T09:20:00Z' },
  { id: 'a5', courseId: 'c1', course: 'Harassment Prevention', setting: 'Assessment attempts', settingKey: 'assessment-attempts', previousValue: 'Unlimited', newValue: '3', actor: 'David Chen', actorEmail: 'david.c@company.com', role: 'Course Admin', surface: 'Settings tab', timestamp: '2026-07-07T13:11:00Z' },
  { id: 'a6', courseId: 'c5', course: 'Allergen Awareness', setting: 'Enrolment visibility', settingKey: 'enrolment-visibility', previousValue: 'All learners', newValue: 'Managers only', actor: 'Elena Rossi', actorEmail: 'elena.r@company.com', role: 'Admin', surface: 'Settings tab', timestamp: '2026-07-07T10:02:00Z' },
  { id: 'a7', courseId: 'c6', course: 'GDPR Basics', setting: 'Course certificate', settingKey: 'course-certificate', previousValue: 'None', newValue: 'Completion certificate', actor: 'Priya Nair', actorEmail: 'priya.n@company.com', role: 'Admin', surface: 'Settings tab', timestamp: '2026-07-06T15:39:00Z' },
  { id: 'a8', courseId: 'c2', course: 'Food Safety Essentials', setting: 'Allow access after due date', settingKey: 'access-after-due-date', previousValue: 'Yes', newValue: 'No', actor: 'James Okafor', actorEmail: 'james.o@company.com', role: 'Admin', surface: 'Settings tab', timestamp: '2026-07-06T08:54:00Z' },
  { id: 'a9', courseId: 'c7', course: 'Conflict Resolution', setting: 'Disable background playback', settingKey: 'background-playback', previousValue: 'Off', newValue: 'On', actor: 'David Chen', actorEmail: 'david.c@company.com', role: 'Course Admin', surface: 'Settings tab', timestamp: '2026-07-05T17:23:00Z' },
  { id: 'a10', courseId: 'c3', course: 'Fire Safety', setting: 'Compliance status', settingKey: 'compliance-status', previousValue: 'Compliance', newValue: 'Non-compliance', actor: 'System', actorEmail: '—', role: 'System', surface: 'System', timestamp: '2026-07-05T02:00:00Z' },
  { id: 'a11', courseId: 'c8', course: 'Cash Handling', setting: 'Course categories', settingKey: 'course-categories', previousValue: 'Operations', newValue: 'Operations, Compliance', actor: 'Sarah Mitchell', actorEmail: 'sarah.m@company.com', role: 'Admin', surface: 'Settings tab', timestamp: '2026-07-04T14:17:00Z' },
  { id: 'a12', courseId: 'c5', course: 'Allergen Awareness', setting: 'Pass score', settingKey: 'pass-score', previousValue: '60%', newValue: '75%', actor: 'Elena Rossi', actorEmail: 'elena.r@company.com', role: 'Admin', surface: 'Settings tab', timestamp: '2026-07-04T09:41:00Z' },
  { id: 'a13', courseId: 'c4', course: 'Anti-Money Laundering', setting: 'Compliance status', settingKey: 'compliance-status', previousValue: 'Non-compliance', newValue: 'Compliance', actor: 'James Okafor', actorEmail: 'james.o@company.com', role: 'Admin', surface: 'Compliance configuration', timestamp: '2026-07-03T16:08:00Z' },
  { id: 'a14', courseId: 'c6', course: 'GDPR Basics', setting: 'Assessment attempts', settingKey: 'assessment-attempts', previousValue: '2', newValue: '3', actor: 'Priya Nair', actorEmail: 'priya.n@company.com', role: 'Admin', surface: 'Settings tab', timestamp: '2026-07-03T11:30:00Z' },
  { id: 'a15', courseId: 'c1', course: 'Harassment Prevention', setting: 'Awarded jewels', settingKey: 'awarded-jewels', previousValue: '75', newValue: '120', actor: 'David Chen', actorEmail: 'david.c@company.com', role: 'Course Admin', surface: 'Settings tab', timestamp: '2026-07-02T13:52:00Z' },
  { id: 'a16', courseId: 'c7', course: 'Conflict Resolution', setting: 'Requires electronic signature', settingKey: 'electronic-signature', previousValue: 'Yes', newValue: 'No', actor: 'Sarah Mitchell', actorEmail: 'sarah.m@company.com', role: 'Admin', surface: 'Settings tab', timestamp: '2026-07-02T08:19:00Z' },
  { id: 'a17', courseId: 'c8', course: 'Cash Handling', setting: 'Enrolment visibility', settingKey: 'enrolment-visibility', previousValue: 'Managers only', newValue: 'All learners', actor: 'Elena Rossi', actorEmail: 'elena.r@company.com', role: 'Admin', surface: 'Settings tab', timestamp: '2026-07-01T15:44:00Z' },
  { id: 'a18', courseId: 'c2', course: 'Food Safety Essentials', setting: 'Course certificate', settingKey: 'course-certificate', previousValue: 'Completion certificate', newValue: 'Accredited certificate', actor: 'James Okafor', actorEmail: 'james.o@company.com', role: 'Admin', surface: 'Settings tab', timestamp: '2026-07-01T10:26:00Z' },
  { id: 'a19', courseId: 'c3', course: 'Fire Safety', setting: 'Pass score', settingKey: 'pass-score', previousValue: '80%', newValue: '90%', actor: 'Priya Nair', actorEmail: 'priya.n@company.com', role: 'Admin', surface: 'Settings tab', timestamp: '2026-06-30T17:03:00Z' },
  { id: 'a20', courseId: 'c5', course: 'Allergen Awareness', setting: 'Disable background playback', settingKey: 'background-playback', previousValue: 'On', newValue: 'Off', actor: 'David Chen', actorEmail: 'david.c@company.com', role: 'Course Admin', surface: 'Settings tab', timestamp: '2026-06-30T09:12:00Z' },
  { id: 'a21', courseId: 'c4', course: 'Anti-Money Laundering', setting: 'Allow access after due date', settingKey: 'access-after-due-date', previousValue: 'No', newValue: 'Yes', actor: 'Sarah Mitchell', actorEmail: 'sarah.m@company.com', role: 'Admin', surface: 'Settings tab', timestamp: '2026-06-29T14:38:00Z' },
  { id: 'a22', courseId: 'c6', course: 'GDPR Basics', setting: 'Course categories', settingKey: 'course-categories', previousValue: 'Compliance', newValue: 'Compliance, Data', actor: 'Elena Rossi', actorEmail: 'elena.r@company.com', role: 'Admin', surface: 'Settings tab', timestamp: '2026-06-29T08:47:00Z' },
  { id: 'a23', courseId: 'c7', course: 'Conflict Resolution', setting: 'Pass score', settingKey: 'pass-score', previousValue: '65%', newValue: '70%', actor: 'James Okafor', actorEmail: 'james.o@company.com', role: 'Admin', surface: 'Settings tab', timestamp: '2026-06-28T16:15:00Z' },
  { id: 'a24', courseId: 'c8', course: 'Cash Handling', setting: 'Assessment attempts', settingKey: 'assessment-attempts', previousValue: '3', newValue: 'Unlimited', actor: 'David Chen', actorEmail: 'david.c@company.com', role: 'Course Admin', surface: 'Settings tab', timestamp: '2026-06-28T11:09:00Z' },
]
