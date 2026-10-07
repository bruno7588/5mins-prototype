import { useState } from 'react'
import { Calendar, PlayCircle, Refresh } from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import Checkbox from '@/components/Checkbox/Checkbox'
import InfoIcon from '@/components/icons/InfoIcon'
import AffectedPeopleDrawer from './AffectedPeopleDrawer'
import { PEOPLE } from '@/data/people'
import { enrolmentStatus, type EnrolmentStatus } from '@/data/enrolments'
import { plural, startOffsets, timingParts, type AssignCourse } from './schedule'

/* Review (DES-332 AC 10-12): one card row per course, in launch order, and one callout
   for people who already have some of the courses. */

const BY_ID = new Map(PEOPLE.map((p) => [p.id, p]))

/** What the admin chose for people who already have a course. Both off by default:
 *  launching without touching them leaves every existing enrolment and completion alone. */
export interface ExistingChoice {
  /** Restart people with an active enrolment (not started, in progress, overdue). */
  restart: boolean
  /** Enrol people who completed the course again. */
  again: boolean
}

export type Outcome = 'new' | 'skip' | 'restart' | 'again'

const isActive = (s: EnrolmentStatus) => s === 'not-started' || s === 'in-progress' || s === 'overdue'

/** What launching does for one person in one course. */
export function outcomeFor(personId: string, courseId: string, choice: ExistingChoice): Outcome {
  const s = enrolmentStatus(BY_ID.get(personId)!, courseId)
  if (isActive(s)) return choice.restart ? 'restart' : 'skip'
  if (s === 'completed') return choice.again ? 'again' : 'skip'
  return 'new'
}

export interface CourseCounts {
  course: AssignCourse
  /** Enrolments this course will create: new + restarted + enrolled again. */
  enrol: number
  fresh: number
  skipped: number
  restarted: number
  again: number
}

export interface AffectedRow {
  personId: string
  name: string
  courseId: string
  courseName: string
  status: EnrolmentStatus
}

export interface ReviewCounts {
  /** Unique people who get at least one enrolment. */
  people: number
  perCourse: CourseCounts[]
  /** Unique people with an active enrolment in at least one selected course. */
  current: number
  /** Of those, unique people overdue in at least one selected course. */
  overdue: number
  /** Unique people who completed at least one selected course. */
  completed: number
  /** Every person × course pair that already exists, for the View People list. */
  affected: AffectedRow[]
}

export function reviewCounts(
  courses: AssignCourse[],
  committedIds: string[],
  choice: ExistingChoice = { restart: false, again: false },
): ReviewCounts {
  const enrolling = new Set<string>()
  const current = new Set<string>()
  const overdue = new Set<string>()
  const completed = new Set<string>()
  const affected: AffectedRow[] = []

  const perCourse = courses.map((course) => {
    const c: CourseCounts = { course, enrol: 0, fresh: 0, skipped: 0, restarted: 0, again: 0 }
    committedIds.forEach((id) => {
      const s = enrolmentStatus(BY_ID.get(id)!, course.id)
      if (isActive(s)) current.add(id)
      if (s === 'overdue') overdue.add(id)
      if (s === 'completed') completed.add(id)
      if (s !== 'none') {
        affected.push({ personId: id, name: BY_ID.get(id)!.name, courseId: course.id, courseName: course.name, status: s })
      }
      const o = outcomeFor(id, course.id, choice)
      if (o === 'skip') c.skipped++
      else {
        enrolling.add(id)
        if (o === 'new') c.fresh++
        else if (o === 'restart') c.restarted++
        else c.again++
      }
    })
    c.enrol = c.fresh + c.restarted + c.again
    return c
  })

  return {
    people: enrolling.size,
    perCourse,
    current: current.size,
    overdue: overdue.size,
    completed: completed.size,
    affected,
  }
}

interface Props {
  courses: AssignCourse[]
  committedIds: string[]
  choice: ExistingChoice
  onChoiceChange: (choice: ExistingChoice) => void
}

function ReviewStep({ courses, committedIds, choice, onChoiceChange }: Props) {
  const counts = reviewCounts(courses, committedIds, choice)
  const offsets = startOffsets(courses)
  const [viewing, setViewing] = useState(false)

  const hasExisting = counts.current > 0 || counts.completed > 0

  return (
    <div className="acw-review">
      <div className="acw-review-section">
        {/* No Edit buttons: the stepper's completed steps and Back already lead there. */}
        <h4 className="acw-review-heading">Review</h4>

        {/* One callout for everyone who already has some of the courses, above the table so
            a long course list can't push it out of view. Built from Alert's own classes
            (alerts-toast.md) because it holds checkboxes, which the Alert component has no
            slot for. Nothing here blocks Launch. */}
        {hasExisting && (
          <div className="alert alert--callout alert--with-body acw-existing">
            <InfoIcon size={20} color="currentColor" className="alert__icon" />
            <div className="alert__body">
              <p className="alert__title">Some people already have these courses</p>
              <p className="alert__message">They'll only be enrolled in the courses they don't have yet.</p>
              <div className="acw-existing__options">
                {counts.current > 0 && (
                  <label className="acw-existing__option">
                    <Checkbox
                      checked={choice.restart}
                      onChange={() => onChoiceChange({ ...choice, restart: !choice.restart })}
                    />
                    <span className="acw-existing__text">
                      <span>Restart for {plural(counts.current, 'person', 'people')} currently enrolled</span>
                      {counts.overdue > 0 && (
                        <span className="acw-existing__helper">{counts.overdue} of them are overdue.</span>
                      )}
                    </span>
                  </label>
                )}
                {counts.completed > 0 && (
                  <label className="acw-existing__option">
                    <Checkbox
                      checked={choice.again}
                      onChange={() => onChoiceChange({ ...choice, again: !choice.again })}
                    />
                    <span className="acw-existing__text">
                      <span>Enrol {plural(counts.completed, 'person', 'people')} who completed again</span>
                    </span>
                  </label>
                )}
              </div>
              <Button variant="text" size="md" className="acw-existing__view" onClick={() => setViewing(true)}>
                View People
              </Button>
            </div>
          </div>
        )}

        {/* A short list (1 to 5 courses), so no column header: each row labels its own
            number inline. Figma Programs "Card/course" (4240:92985). */}
        <ul className="acw-review-list">
          {counts.perCourse.map((r, index) => {
            const t = timingParts(r.course, offsets[index])
            return (
              <li key={r.course.id} className="acw-review-row">
                <span className="acw-review-counter">{index + 1}</span>
                <img className="acw-review-thumb" src={r.course.thumb} alt="" />
                <div className="acw-review-body">
                  {/* Opens the course in a new tab so the wizard keeps its selections. */}
                  <a
                    className="acw-review-course"
                    href={`/your-courses/course?title=${encodeURIComponent(r.course.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {r.course.name}
                  </a>
                  <span className="acw-review-info">
                    <span className="acw-review-info-item">
                      <PlayCircle size={16} color="var(--text-tertiary)" variant="Linear" />
                      {t.start}
                    </span>
                    <span className="acw-review-info-item">
                      <Calendar size={16} color="var(--text-tertiary)" variant="Linear" />
                      {t.due}
                    </span>
                    <span className="acw-review-info-item">
                      <Refresh size={16} color="var(--text-tertiary)" variant="Linear" />
                      {t.repeat}
                    </span>
                  </span>
                </div>
                <Badge type="in-progress" className="acw-review-people" label={`${plural(r.enrol, 'person', 'people')} to enrol`} />
              </li>
            )
          })}
        </ul>
      </div>

      <AffectedPeopleDrawer open={viewing} rows={counts.affected} onClose={() => setViewing(false)} />
    </div>
  )
}

export default ReviewStep
