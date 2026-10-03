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
  // About 10% hold a live enrolment and 5% a completed one, per course.
  const n = (person.index * 53 + hash(courseId) * 7) % 100
  if (n < 10) return SEEDED[n % 3]
  if (n < 15) return SEEDED[3]
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
