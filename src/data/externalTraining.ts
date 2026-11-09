import { useSyncExternalStore } from 'react'
import { THUMBS } from '@/pages/automations/courseCatalog'

/**
 * DES-336 external training: the approved list (providers, courses, retraining
 * rules), the one-off setting and every external training record.
 *
 * One in-memory store, so Account and Settings, Learning Records, the person
 * profile and My Team stay in sync while you move around the prototype. A page
 * refresh starts the demo over.
 */

/* ── Types ── */

export type DurationUnit = 'minutes' | 'hours' | 'days'
export type ExternalResult = 'Passed' | 'Not Passed'
export type DueState = 'overdue' | 'due-soon' | 'upcoming'

export interface ExternalProvider {
  id: string
  name: string
  archived: boolean
}

export interface ExternalCourse {
  id: string
  name: string
  providerIds: string[]
  duration: { value: number; unit: DurationUnit }
  /** null = No retraining. */
  retrainingMonths: number | null
  /** Spellings mapped in a CSV upload (D15); matched on later uploads. */
  otherNames: string[]
  archived: boolean
}

export interface ExternalRecord {
  id: string
  personId: string
  /** null for a one-off record. */
  courseId: string | null
  oneOff?: { name: string; provider: string; duration: string }
  providerId: string | null
  /** ISO day, "2026-10-14". */
  completionDate: string
  /** ISO day; null for No retraining and for Not Passed (D18). Stored, not derived (D9). */
  retrainingDueDate: string | null
  result: ExternalResult
  score: number | null
  /** File name; null when no certificate was added (D17). */
  certificate: string | null
  source: 'manual' | 'ai' | 'csv'
}

/** Who a record can belong to. Ids match the profile routes (/people/:id, /my-team/people/:id). */
export interface TrainingPerson {
  id: string
  name: string
  email: string
  /** Invited, not yet registered (D26). */
  invited?: boolean
}

/* ── Signed-in viewer ── The prototype has no role switcher: the admin is a full
   admin (D21). Set ADMIN_ROLE to 'limited' to see the limited-admin variant. */
export const ADMIN_ROLE: 'full' | 'limited' = 'full'
export const isFullAdmin = () => (ADMIN_ROLE as string) === 'full'

/** The signed-in learner on the learner side (matches profile id 1). */
export const SIGNED_IN_LEARNER_ID = '1'

/* ── Dates ── */

export const DUE_SOON_DAYS = 90

/** Local today as an ISO day. */
export const todayIso = () => toIso(new Date())

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const fromIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Add calendar months, clamping to the month's last day (31 Jan + 1 month = 28 Feb). */
export function addMonthsClamped(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const total = m - 1 + months
  const year = y + Math.floor(total / 12)
  const month = ((total % 12) + 12) % 12
  const lastDay = new Date(year, month + 1, 0).getDate()
  return toIso(new Date(year, month, Math.min(d, lastDay)))
}

/** The due date a new record gets: completion + the course rule. Not Passed gets none (D18). */
export function retrainingDueDate(
  completionDate: string,
  retrainingMonths: number | null,
  result: ExternalResult,
): string | null {
  if (result === 'Not Passed' || retrainingMonths == null || !completionDate) return null
  return addMonthsClamped(completionDate, retrainingMonths)
}

/** "Oct 14, 2026": the same order as the table's two-line date (.tbl-date), so a row
    never mixes two formats. */
export const formatDay = (iso: string) =>
  fromIso(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

/** "Expires after 12 months" / "No expiry" (same wording everywhere). */
export const retrainingLabel = (months: number | null) =>
  months == null ? 'No expiry' : `Expires after ${months} month${months === 1 ? '' : 's'}`

export const durationLabel = ({ value, unit }: ExternalCourse['duration']) =>
  `${value} ${value === 1 ? unit.replace(/s$/, '') : unit}`

/* ── Due state ── */

const sameTraining = (a: ExternalRecord, b: ExternalRecord) =>
  a.personId === b.personId &&
  (a.courseId
    ? a.courseId === b.courseId
    : !b.courseId && a.oneOff?.name.trim().toLowerCase() === b.oneOff?.name.trim().toLowerCase())

/** The newer passed record that replaces this one, if any (by completion date, not entry date). */
export function supersededBy(record: ExternalRecord, all: ExternalRecord[]): ExternalRecord | null {
  let newest: ExternalRecord | null = null
  for (const r of all) {
    if (r.id === record.id || r.result !== 'Passed' || !sameTraining(record, r)) continue
    if (r.completionDate <= record.completionDate) continue
    if (!newest || r.completionDate > newest.completionDate) newest = r
  }
  return newest
}

/**
 * null when the record has no due date or a newer passed record replaces it (D10, D18).
 * The course's archived flag is ignored: archived courses keep flagging (D20).
 */
export function dueState(record: ExternalRecord, all: ExternalRecord[], today = todayIso()): DueState | null {
  if (!record.retrainingDueDate || supersededBy(record, all)) return null
  if (record.retrainingDueDate < today) return 'overdue'
  const soon = new Date(fromIso(today))
  soon.setDate(soon.getDate() + DUE_SOON_DAYS)
  return record.retrainingDueDate <= toIso(soon) ? 'due-soon' : 'upcoming'
}

/** Sort weight for "Overdue, Due soon, then newest". */
export const dueRank = (s: DueState | null) => (s === 'overdue' ? 0 : s === 'due-soon' ? 1 : 2)

/* ── Seed ── */

export const TRAINING_PEOPLE: TrainingPerson[] = [
  { id: '1', name: 'Anthonny Wallace', email: 'anthonny@example.com' },
  { id: '2', name: 'Brenda Kwasaki', email: 'brenda@email.com' },
  { id: '3', name: 'Carlos Mendes', email: 'carlos@example.com' },
  { id: '4', name: 'Diana Ross', email: 'diana.ross@company.com' },
  { id: '5', name: 'Erik Johansson', email: 'erik.j@email.com' },
  ...[
    'Michael Thompson', 'Jessica Hart', 'David Johnson', 'Noah Williams', 'Mei Tanaka', 'Ethan Brooks',
    'Priya Shah', 'Samantha Rivers', 'Laura Chen', 'Marcus Reid', 'Sofia Alvarez', 'Oliver Tran',
    'Jamal Carter', 'Hana Ito', 'Diego Ramirez', 'Aisha Bello', 'Luke Patterson',
  ].map((name, i) => ({ id: `m${i + 1}`, name, email: `${name.toLowerCase().replace(/\s+/g, '.')}@email.com` })),
  { id: 'inv1', name: 'Tariq Osman', email: 'tariq.osman@email.com', invited: true },
  { id: 'inv2', name: 'Ruth Adeyemi', email: 'ruth.adeyemi@email.com', invited: true },
]

export const personById = (id: string) => TRAINING_PEOPLE.find((p) => p.id === id)

/** Same person if the surname matches and the first names share an initial ("S. Chen" ≈ "Sarah Chen"). */
export const samePerson = (a: string, b: string) => {
  const parts = (n: string) => n.toLowerCase().replace(/\./g, '').trim().split(/\s+/)
  const [pa, pb] = [parts(a), parts(b)]
  return pa[pa.length - 1] === pb[pb.length - 1] && pa[0][0] === pb[0][0]
}

const seedProviders: ExternalProvider[] = [
  { id: 'p1', name: 'St John Ambulance', archived: false },
  { id: 'p2', name: 'Red Cross Training', archived: false },
  { id: 'p3', name: 'NEBOSH', archived: false },
  { id: 'p4', name: 'Highfield Qualifications', archived: false },
  { id: 'p5', name: 'SafeWork Training', archived: false },
  { id: 'p6', name: 'RTITB', archived: false },
  { id: 'p7', name: 'Allergen Aware Ltd', archived: false },
]

const seedCourses: ExternalCourse[] = [
  { id: 'c1', name: 'First Aid at Work', providerIds: ['p1', 'p2'], duration: { value: 3, unit: 'days' }, retrainingMonths: 36, otherNames: [], archived: false },
  { id: 'c2', name: 'Food Hygiene Level 2', providerIds: ['p4'], duration: { value: 6, unit: 'hours' }, retrainingMonths: 36, otherNames: [], archived: false },
  { id: 'c3', name: 'Fire Marshal', providerIds: ['p5'], duration: { value: 4, unit: 'hours' }, retrainingMonths: 12, otherNames: [], archived: false },
  { id: 'c4', name: 'NEBOSH General Certificate', providerIds: ['p3'], duration: { value: 10, unit: 'days' }, retrainingMonths: null, otherNames: [], archived: false },
  { id: 'c5', name: 'Forklift Counterbalance', providerIds: ['p6'], duration: { value: 3, unit: 'days' }, retrainingMonths: 36, otherNames: [], archived: false },
  { id: 'c6', name: 'Personal Licence Holder', providerIds: ['p4'], duration: { value: 1, unit: 'days' }, retrainingMonths: 120, otherNames: [], archived: false },
  { id: 'c7', name: 'Allergen Awareness', providerIds: ['p7', 'p4'], duration: { value: 90, unit: 'minutes' }, retrainingMonths: 12, otherNames: [], archived: false },
  { id: 'c8', name: 'Emergency First Aid', providerIds: ['p2'], duration: { value: 1, unit: 'days' }, retrainingMonths: 36, otherNames: [], archived: true },
]

const rec = (
  id: string,
  personId: string,
  courseId: string,
  providerId: string,
  completionDate: string,
  result: ExternalResult = 'Passed',
  score: number | null = null,
  certificate: string | null = 'certificate.pdf',
): ExternalRecord => {
  const course = seedCourses.find((c) => c.id === courseId)!
  return {
    id, personId, courseId, providerId, completionDate, result, score, certificate, source: 'manual',
    retrainingDueDate: retrainingDueDate(completionDate, course.retrainingMonths, result),
  }
}

const oneOff = (
  id: string,
  personId: string,
  name: string,
  provider: string,
  duration: string,
  completionDate: string,
  dueDate: string | null,
  result: ExternalResult,
  score: number | null,
  hasCertificate: boolean,
): ExternalRecord => ({
  id, personId, courseId: null, oneOff: { name, provider, duration }, providerId: null, completionDate,
  retrainingDueDate: result === 'Not Passed' ? null : dueDate, result, score,
  certificate: hasCertificate ? `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf` : null, source: 'manual',
})

/* Today is 5 Nov 2026 in the demo. The mix covers every due state: overdue, due
   soon (within 90 days), upcoming, superseded (renewed) and Not Passed. */
const seedRecords: ExternalRecord[] = [
  // Anthonny (profile 1, also the signed-in learner)
  rec('r1', '1', 'c1', 'p1', '2023-10-20', 'Passed', null, 'first-aid-at-work-wallace.pdf'), // superseded by r2
  rec('r2', '1', 'c1', 'p2', '2026-10-14', 'Passed', 92, 'first-aid-renewal-wallace.pdf'),
  rec('r3', '1', 'c3', 'p5', '2025-12-01', 'Passed', 100), // due soon (1 Dec 2026)
  rec('r4', '1', 'c4', 'p3', '2024-06-30', 'Passed', 78), // no retraining
  // Brenda (profile 2)
  rec('r5', '2', 'c2', 'p4', '2023-09-12'), // overdue
  rec('r6', '2', 'c7', 'p7', '2026-01-20', 'Passed', null, null), // due soon, no certificate
  rec('r7', '2', 'c8', 'p2', '2024-02-02'), // archived course, still flags (D20)
  // Carlos (profile 3)
  rec('r8', '3', 'c5', 'p6', '2024-03-18', 'Not Passed', 45), // no due date
  rec('r9', '3', 'c5', 'p6', '2024-04-02', 'Passed', 88),
  // Team (manager view)
  rec('r10', 'm1', 'c1', 'p1', '2023-08-30'), // overdue
  rec('r11', 'm3', 'c3', 'p5', '2025-11-28'), // due soon
  rec('r12', 'm5', 'c2', 'p4', '2025-05-14'),
  rec('r13', 'm9', 'c6', 'p4', '2021-07-01'),
  rec('r14', 'm11', 'c7', 'p4', '2025-10-30'), // overdue by a week
  // Today's free-text records, carried over as one-offs keeping their expiration.
  oneOff('e1', 'm1', 'Project Management Fundamentals', 'Leadership Academy', '2 days', '2026-04-25', '2026-05-10', 'Passed', 100, true),
  oneOff('e2', 'm2', 'Advanced Excel for Finance', 'SkillBridge Online', '3 days', '2026-04-02', null, 'Not Passed', null, false),
  oneOff('e3', 'm3', 'Data Analytics Bootcamp', 'TechForward Institute', '5 days', '2026-04-15', '2027-04-15', 'Passed', 92, true),
  oneOff('e4', 'm4', 'Customer Experience Design', 'CX Academy', '2 days', '2026-03-22', '2026-09-22', 'Passed', 100, true),
  oneOff('e5', 'm5', 'First Aid & CPR Certification', 'Red Cross Training', '1 day', '2026-02-16', null, 'Not Passed', null, false),
  oneOff('e6', 'm6', 'Barista Mastery Program', 'Coffee Institute', '2 days', '2026-04-12', '2027-04-12', 'Passed', 100, true),
  oneOff('e7', 'm7', 'Leadership & Team Management', 'Leadership Academy', '3 days', '2026-04-08', null, 'Not Passed', null, false),
  oneOff('e8', 'm8', 'Financial Modelling Workshop', 'FinanceHub', '2 days', '2026-04-18', '2027-04-18', 'Passed', 95, true),
  oneOff('e9', 'm9', 'ISO 27001 Auditor Training', 'CompliancePro', '5 days', '2026-03-15', '2027-03-15', 'Passed', 88, true),
  oneOff('e10', 'm10', 'Workplace Safety Advanced', 'SafeWork Training', '2 days', '2026-03-05', '2026-09-05', 'Passed', 100, true),
]

/* ── Store ── */

export interface ExternalTrainingState {
  providers: ExternalProvider[]
  courses: ExternalCourse[]
  records: ExternalRecord[]
  allowOneOffs: boolean
}

let state: ExternalTrainingState = {
  providers: seedProviders,
  courses: seedCourses,
  records: seedRecords,
  allowOneOffs: true,
}
const listeners = new Set<() => void>()

const set = (next: Partial<ExternalTrainingState>) => {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export const getExternalTraining = () => state
export const useExternalTraining = () => useSyncExternalStore(subscribe, getExternalTraining)

let seq = 0
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${++seq}`

/* Lookups */
/** Mock artwork for a course picker row: the course-thumbs pool, cycled by catalogue order. */
export const courseThumb = (id: string) => {
  const i = state.courses.findIndex((c) => c.id === id)
  return THUMBS[(i < 0 ? 0 : i) % THUMBS.length]
}

export const courseById = (id: string | null) => state.courses.find((c) => c.id === id)
export const providerById = (id: string | null) => state.providers.find((p) => p.id === id)
export const recordsForCourse = (id: string) => state.records.filter((r) => r.courseId === id).length
export const recordsForProvider = (id: string) => state.records.filter((r) => r.providerId === id).length
export const coursesForProvider = (id: string) => state.courses.filter((c) => c.providerIds.includes(id)).length

/** Display name of a record's training: the course's current name (D19) or the one-off name. */
export const recordTrainingName = (r: ExternalRecord) =>
  r.courseId ? courseById(r.courseId)?.name ?? 'Unknown course' : r.oneOff?.name ?? ''
export const recordProviderName = (r: ExternalRecord) =>
  r.providerId ? providerById(r.providerId)?.name ?? '' : r.oneOff?.provider ?? ''
export const recordDurationLabel = (r: ExternalRecord) => {
  const c = courseById(r.courseId)
  return c ? durationLabel(c.duration) : r.oneOff?.duration ?? ''
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/** Another course already uses this name with any of these providers. */
export const duplicateCourse = (name: string, providerIds: string[], exceptId?: string) =>
  state.courses.find(
    (c) => c.id !== exceptId && sameName(c.name, name) && c.providerIds.some((p) => providerIds.includes(p)),
  )
export const duplicateProvider = (name: string, exceptId?: string) =>
  state.providers.find((p) => p.id !== exceptId && sameName(p.name, name))

/* Mutations */
export const setAllowOneOffs = (allowOneOffs: boolean) => set({ allowOneOffs })

export const saveCourse = (course: ExternalCourse) =>
  set({
    courses: state.courses.some((c) => c.id === course.id)
      ? state.courses.map((c) => (c.id === course.id ? course : c))
      : [...state.courses, course],
  })
export const setCourseArchived = (id: string, archived: boolean) =>
  set({ courses: state.courses.map((c) => (c.id === id ? { ...c, archived } : c)) })
export const deleteCourse = (id: string) => set({ courses: state.courses.filter((c) => c.id !== id) })

export const saveProvider = (provider: ExternalProvider) =>
  set({
    providers: state.providers.some((p) => p.id === provider.id)
      ? state.providers.map((p) => (p.id === provider.id ? provider : p))
      : [...state.providers, provider],
  })
export const setProviderArchived = (id: string, archived: boolean) =>
  set({ providers: state.providers.map((p) => (p.id === id ? { ...p, archived } : p)) })
export const deleteProvider = (id: string) =>
  set({
    providers: state.providers.filter((p) => p.id !== id),
    courses: state.courses.map((c) => ({ ...c, providerIds: c.providerIds.filter((p) => p !== id) })),
  })

export const addCourses = (courses: ExternalCourse[], providers: ExternalProvider[]) =>
  set({ courses: [...state.courses, ...courses], providers: [...state.providers, ...providers] })

export const saveRecord = (record: ExternalRecord) =>
  set({
    records: state.records.some((r) => r.id === record.id)
      ? state.records.map((r) => (r.id === record.id ? record : r))
      : [...state.records, record],
  })
export const deleteRecord = (id: string) => set({ records: state.records.filter((r) => r.id !== id) })
export const addRecords = (records: ExternalRecord[]) => set({ records: [...state.records, ...records] })

/** Remember a CSV spelling as another name for a course (D15). */
export const addOtherName = (courseId: string, name: string) =>
  set({
    courses: state.courses.map((c) =>
      c.id === courseId && !c.otherNames.some((n) => sameName(n, name))
        ? { ...c, otherNames: [...c.otherNames, name] }
        : c,
    ),
  })
export const removeOtherName = (courseId: string, name: string) =>
  set({
    courses: state.courses.map((c) =>
      c.id === courseId ? { ...c, otherNames: c.otherNames.filter((n) => n !== name) } : c,
    ),
  })

/** Course matching a name or a remembered name. Archived courses never match. */
export const matchCourse = (name: string) =>
  state.courses.find((c) => !c.archived && (sameName(c.name, name) || c.otherNames.some((n) => sameName(n, name))))

/** A name that's already taken by a course or remembered for one (blocks cross-course mapping). */
export const nameOwner = (name: string) =>
  state.courses.find((c) => sameName(c.name, name) || c.otherNames.some((n) => sameName(n, name)))

/** Test hook: reset to the seed. */
export const resetExternalTraining = () =>
  set({ providers: seedProviders, courses: seedCourses, records: seedRecords, allowOneOffs: true })
