/**
 * Mock person × course enrolments (DES-332 D13). Seeded deterministically from
 * the person's index and the course id; launches from the Assign courses wizard
 * are layered on top for the rest of the session.
 */
import type { PersonRow } from './people'
import { HEADCOUNT } from './people'

export type EnrolmentStatus = 'none' | 'not-started' | 'in-progress' | 'overdue' | 'completed'

/** The course on the Course details page (its Enrolments tab shows 128). */
export const COURSE_DETAILS_ID = 'course-details'

const launched = new Map<string, EnrolmentStatus>()
const key = (personId: string, courseId: string) => `${personId}|${courseId}`

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973
  return h
}

const SEEDED: EnrolmentStatus[] = ['not-started', 'in-progress', 'overdue', 'completed']

export function enrolmentStatus(person: PersonRow, courseId: string): EnrolmentStatus {
  const hit = launched.get(key(person.id, courseId))
  if (hit) return hit
  if (courseId === COURSE_DETAILS_ID) {
    // 37 is coprime with 716, so exactly 128 indices land below 128.
    return (person.index * 37) % HEADCOUNT < 128 ? 'in-progress' : 'none'
  }
  // Groups are picked from a scrambled index: names cycle every 30 people, so a plain
  // modulo would line whole groups up on one name-sorted page.
  const g = (person.index * 7919) % 100
  // About 4% hold a live enrolment in every course ("Enrolled in 4 of 4").
  if (g < 4) return SEEDED[person.index % 3]
  // About 8% hold a live enrolment in roughly 60% of courses (5 of 8, say), so partly
  // enrolled people with a long course list show up too.
  if (g < 12 && (hash(courseId) * 31 + person.index * 17) % 5 < 3) return SEEDED[person.index % 3]
  // About 4% hold a live enrolment and 2% a completed one, per course, so most people
  // show as Not enrolled even with several courses picked.
  const n = (person.index * 53 + hash(courseId) * 7) % 100
  if (n < 4) return SEEDED[n % 3]
  if (n < 6) return SEEDED[3]
  return 'none'
}

/** Completed enrolments can be enrolled again, so they don't count (D14). */
export function isActivelyEnrolled(person: PersonRow, courseId: string) {
  const s = enrolmentStatus(person, courseId)
  return s === 'not-started' || s === 'in-progress' || s === 'overdue'
}

export function hasCompleted(person: PersonRow, courseId: string) {
  return enrolmentStatus(person, courseId) === 'completed'
}

/** Records new enrolments so the wizard shows them as enrolled afterwards. */
export function recordEnrolments(pairs: { personId: string; courseId: string }[]) {
  pairs.forEach((p) => launched.set(key(p.personId, p.courseId), 'not-started'))
}
