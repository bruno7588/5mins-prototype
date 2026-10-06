/* Per-course timing for Assign courses (DES-332 D16): the Automations model, a
   numbered sequence where each course starts Immediately (with the previous
   course; course 1 at launch) or x days after the previous course. */
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

const delayOf = (c: AssignCourse) => (c.enrolment.kind === 'after-delay' ? c.enrolment.days : 0)

/** Days from launch at which each course starts. */
export function startOffsets(courses: AssignCourse[]): number[] {
  let acc = 0
  return courses.map((c) => (acc += delayOf(c)))
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

export function fmtDate(daysFromToday: number) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export interface CellSummary {
  title: string
  desc?: string
}

export function enrolmentSummary(c: AssignCourse, offset: number): CellSummary {
  if (c.enrolment.kind === 'immediate') {
    return { title: 'Immediate', desc: offset === 0 ? 'Starts on launch' : `Starts ${fmtDate(offset)}` }
  }
  return { title: `After ${plural(c.enrolment.days, 'day')}`, desc: `Starts ${fmtDate(offset)}` }
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

/** "Starts on launch · No due date · Once", for Review. */
export function timingLine(c: AssignCourse, offset: number) {
  const start = offset === 0 ? 'Starts on launch' : `Starts ${fmtDate(offset)}`
  const due = c.due.kind === 'none' ? 'No due date' : `Due ${fmtDate(offset + c.due.daysAfterStart)}`
  return [start, due, repeatSummary(c).title].join(' · ')
}

export { plural }
