import Alert from '@/components/Alert/Alert'
import Button from '@/components/Button/Button'
import Checkbox from '@/components/Checkbox/Checkbox'
import { PEOPLE } from '@/data/people'
import { hasCompleted, isActivelyEnrolled } from '@/data/enrolments'
import Table, { type Column } from '@/components/Table/Table'
import { plural, startOffsets, timingLine, type AssignCourse } from './schedule'

/* Review (DES-332 AC 10-12, D2, D14, D18): one card row per course, in launch order. */

const BY_ID = new Map(PEOPLE.map((p) => [p.id, p]))

export interface ReviewCounts {
  people: number
  enrolments: number
  skipped: number
  perCourse: {
    course: AssignCourse
    enrol: number
    skipped: number
    /** Already on the course: still in progress, and completed. */
    inProgress: number
    completed: number
  }[]
  reEnrolled: number
  teams: [string, number][]
}

/** Whether this person gets an enrolment in this course. Completing a course ends the
 *  enrolment, so people who completed it are enrolled again as a matter of course;
 *  people still in progress are skipped unless the admin chose to restart them. */
export function willEnrol(personId: string, courseId: string, reEnrol: ReadonlySet<string>) {
  const p = BY_ID.get(personId)!
  return reEnrol.has(courseId) || !isActivelyEnrolled(p, courseId)
}

export function reviewCounts(
  courses: AssignCourse[],
  committedIds: string[],
  reEnrol: ReadonlySet<string> = new Set(),
): ReviewCounts {
  const people = committedIds.map((id) => BY_ID.get(id)!).filter(Boolean)
  const perCourse = courses.map((course) => {
    const inProgress = people.filter((p) => isActivelyEnrolled(p, course.id)).length
    const completed = people.filter((p) => hasCompleted(p, course.id)).length
    const skipped = reEnrol.has(course.id) ? 0 : inProgress
    return { course, enrol: people.length - skipped, skipped, inProgress, completed }
  })
  const enrolling = people.filter((p) => courses.some((c) => willEnrol(p.id, c.id, reEnrol)))
  const reEnrolled = people.filter((p) => courses.some((c) => hasCompleted(p, c.id))).length
  const byTeam = new Map<string, number>()
  enrolling.forEach((p) => byTeam.set(p.team, (byTeam.get(p.team) ?? 0) + 1))
  return {
    people: enrolling.length,
    enrolments: perCourse.reduce((n, r) => n + r.enrol, 0),
    skipped: perCourse.reduce((n, r) => n + r.skipped, 0),
    perCourse,
    reEnrolled,
    teams: [...byTeam.entries()].sort((a, b) => b[1] - a[1]),
  }
}

interface Props {
  courses: AssignCourse[]
  committedIds: string[]
  leftOut: number
  /** Courses where the admin chose to restart people still in progress. */
  reEnrol: ReadonlySet<string>
  onToggleReEnrol: (courseId: string) => void
  onEdit: (step: 'courses' | 'people') => void
}

type CourseRow = ReviewCounts['perCourse'][number] & { index: number }

function ReviewStep({ courses, committedIds, leftOut, reEnrol, onToggleReEnrol, onEdit }: Props) {
  const counts = reviewCounts(courses, committedIds, reEnrol)
  const offsets = startOffsets(courses)

  /* Admins think courses first, then people: one card row per course, in launch order,
     with who it enrols. People who completed a course are enrolled again; people still in
     progress are skipped by default, and the admin decides per course whether to restart
     them, since that resets their progress. */
  const columns: Column<CourseRow>[] = [
    {
      key: 'course',
      header: 'Course',
      render: (r) => (
        <span className="tbl-media">
          {/* Same position counter as the Courses step (AutomationDetailsModal.css). */}
          <span className="automation-details-row-counter">{r.index + 1}</span>
          <img className="tbl-thumb" src={r.course.thumb} alt="" />
          <span className="tbl-stack">
            <span className="primary">{r.course.name}</span>
            <span className="supporting">{timingLine(r.course, offsets[r.index])}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'existing',
      header: 'Currently enrolled',
      width: '0 0 280px',
      render: (r) =>
        r.inProgress === 0 ? (
          'None'
        ) : (
          <label className="tbl-media acw-reenrol">
            <Checkbox checked={reEnrol.has(r.course.id)} onChange={() => onToggleReEnrol(r.course.id)} />
            <span className="tbl-stack">
              <span className="primary">Restart {r.inProgress} in progress</span>
              <span className="supporting">Resets their progress</span>
            </span>
          </label>
        ),
    },
    {
      key: 'people',
      header: 'People',
      width: '0 0 240px',
      align: 'right',
      render: (r) => `${plural(r.enrol, 'person', 'people')} to enrol`,
    },
  ]

  return (
    <div className="acw-review">
      <div className="acw-review-section">
        <div className="acw-review-section-head">
          <h4 className="acw-review-heading">Review</h4>
          <span className="acw-review-edits">
            <Button variant="text" size="md" onClick={() => onEdit('courses')}>
              Edit Courses
            </Button>
            <Button variant="text" size="md" onClick={() => onEdit('people')}>
              Edit People
            </Button>
          </span>
        </div>
        <Table
          columns={columns}
          rows={counts.perCourse.map((r, index) => ({ ...r, index }))}
          getRowKey={(r) => r.course.id}
        />
      </div>

      {leftOut > 0 && (
        <Alert
          type="Callout"
          icon
          title={`${plural(leftOut, 'person', 'people')} ${leftOut === 1 ? 'is' : 'are'} already enrolled in every course, so they've been left out.`}
        />
      )}
    </div>
  )
}

export default ReviewStep
