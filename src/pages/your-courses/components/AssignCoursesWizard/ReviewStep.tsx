import { useState } from 'react'
import { Calendar, PlayCircle, Refresh } from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import Checkbox from '@/components/Checkbox/Checkbox'
import AffectedPeopleDrawer from './AffectedPeopleDrawer'
import { PEOPLE } from '@/data/people'
import { enrolmentStatus, type EnrolmentStatus } from '@/data/enrolments'
import { plural, startOffsets, timingParts, type AssignCourse } from './schedule'

/* Review (DES-332 AC 10-12): one card row per course, in launch order. A row whose course
   some people already have offers one checkbox to include them (restarting anyone
   enrolled, enrolling again anyone who completed) and View People to see who they are. */

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
  /** People picked who already have this course (enrolled or completed). */
  existing: number
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
  /** One choice for every course, or one per course (Assign courses decides row by row). */
  choice: ExistingChoice | ((courseId: string) => ExistingChoice) = { restart: false, again: false },
): ReviewCounts {
  const enrolling = new Set<string>()
  const current = new Set<string>()
  const overdue = new Set<string>()
  const completed = new Set<string>()
  const affected: AffectedRow[] = []

  const perCourse = courses.map((course) => {
    const c: CourseCounts = { course, enrol: 0, fresh: 0, skipped: 0, restarted: 0, again: 0, existing: 0 }
    const courseChoice = typeof choice === 'function' ? choice(course.id) : choice
    committedIds.forEach((id) => {
      const s = enrolmentStatus(BY_ID.get(id)!, course.id)
      if (isActive(s)) current.add(id)
      if (s === 'overdue') overdue.add(id)
      if (s === 'completed') completed.add(id)
      if (s !== 'none') {
        c.existing++
        affected.push({ personId: id, name: BY_ID.get(id)!.name, courseId: course.id, courseName: course.name, status: s })
      }
      const o = outcomeFor(id, course.id, courseChoice)
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

/** Including a course's existing people restarts the enrolled and re-enrols the completed. */
export const includeChoice = (included: boolean): ExistingChoice => ({ restart: included, again: included })

interface Props {
  courses: AssignCourse[]
  committedIds: string[]
  /** Courses whose existing people are included; off by default, so they are skipped. */
  included: string[]
  onToggleIncluded: (courseId: string) => void
}

function ReviewStep({ courses, committedIds, included, onToggleIncluded }: Props) {
  const counts = reviewCounts(courses, committedIds, (id) => includeChoice(included.includes(id)))
  const offsets = startOffsets(courses)
  // The course whose existing people the View People drawer lists.
  const [viewing, setViewing] = useState<string | null>(null)

  /* Every count on this step is anchored to the people picked on the People step,
     the same number the stepper shows, so admins see one total and parts of it. */
  const selected = committedIds.length

  return (
    <div className="acw-review">
      <div className="acw-review-section">
        {/* No Edit buttons: the stepper's completed steps and Back already lead there. */}
        <h4 className="acw-review-heading">
          Assign {plural(courses.length, 'course')} to {plural(selected, 'person', 'people')}
        </h4>

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
                <div className="acw-review-side">
                  <Badge type="in-progress" className="acw-review-people" label={`${plural(r.enrol, 'person', 'people')} to enrol`} />
                  {r.existing > 0 && (
                    <div className="acw-review-existing">
                      {/* The label text toggles the box too. */}
                      <label className="acw-review-include">
                        <Checkbox checked={included.includes(r.course.id)} onChange={() => onToggleIncluded(r.course.id)} />
                        Include {r.existing} already enrolled
                      </label>
                      <Button variant="text" size="sm" onClick={() => setViewing(r.course.id)}>
                        View People
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <AffectedPeopleDrawer
        open={viewing !== null}
        rows={counts.affected.filter((a) => a.courseId === viewing)}
        onClose={() => setViewing(null)}
      />

    </div>
  )
}

export default ReviewStep
