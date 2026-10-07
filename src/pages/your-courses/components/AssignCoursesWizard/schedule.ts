/* Per-course timing for Assign courses (DES-332 D16): a numbered sequence where
   each course starts on assignment (the day the admin launches, for every course)
   or x days after the previous course starts. */
import type { DueDateConfig, EnrollmentType, RecurrenceConfig } from '@/pages/automations/Automations'
import type { AutomationCatalogCourse } from '@/pages/automations/courseCatalog'

export interface AssignCourse extends AutomationCatalogCourse {
  enrolment: EnrollmentType
  due: DueDateConfig
  repeat: RecurrenceConfig
}

export const newAssignCourse = (c: AutomationCatalogCourse): AssignCourse => ({
  ...c,
  enrolment: { kind: 'immediate' },
  due: { kind: 'none' },
  repeat: { enabled: false },
})

/** Days from launch at which each course starts. Immediate is always launch day;
 *  a delay counts from the previous course's start. */
export function startOffsets(courses: AssignCourse[]): number[] {
  let prev = 0
  return courses.map((c) => (prev = c.enrolment.kind === 'after-delay' ? prev + c.enrolment.days : 0))
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

export function fmtDate(daysFromToday: number) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export interface CellSummary {
  title: string
  desc?: string
}

export function enrolmentSummary(c: AssignCourse, offset: number): CellSummary {
  if (c.enrolment.kind === 'immediate') {
    return { title: 'Immediate', desc: 'Starts on assignment' }
  }
  return { title: `After ${plural(c.enrolment.days, 'day')}`, desc: `Starts on ${fmtDate(offset)}` }
}

export function dueSummary(c: AssignCourse, offset: number): CellSummary {
  if (c.due.kind === 'none') return { title: 'No due date' }
  return { title: `Due in ${plural(c.due.daysAfterStart, 'day')}`, desc: `Due ${fmtDate(offset + c.due.daysAfterStart)}` }
}

export function repeatSummary(c: AssignCourse): CellSummary {
  if (!c.repeat.enabled) return { title: 'One time only' }
  const unit = c.repeat.unit === 'weeks' ? 'week' : 'month'
  return { title: `Every ${plural(c.repeat.interval, unit)}` }
}

/** Start, due and repeat terms for a Review row ("Starts on assignment", "No due date", "One time only"). */
export function timingParts(c: AssignCourse, offset: number) {
  return {
    start: offset === 0 ? 'Starts on assignment' : `Starts on ${fmtDate(offset)}`,
    due: c.due.kind === 'none' ? 'No due date' : `Due ${fmtDate(offset + c.due.daysAfterStart)}`,
    repeat: repeatSummary(c).title,
  }
}

export { plural }
