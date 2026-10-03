import { Profile2User, TickCircle } from 'iconsax-react'
import Alert from '@/components/Alert/Alert'
import Button from '@/components/Button/Button'
import { PEOPLE } from '@/data/people'
import { hasCompleted, isActivelyEnrolled } from '@/data/enrolments'
import { SummaryCard, SummaryCardList } from '@/pages/automations/SummaryCards'
import { plural, startOffsets, timingLine, type AssignCourse } from './schedule'

/* Review (DES-332 AC 10-12, D2, D14, D18) in the Automations review language:
   grouped summary rows, each a tinted 32px icon square (Figma "Filters
   thumbnail" 9136:22791) over a title and a secondary meta line. */

const BY_ID = new Map(PEOPLE.map((p) => [p.id, p]))

export interface ReviewCounts {
  people: number
  enrolments: number
  skipped: number
  perCourse: { course: AssignCourse; enrol: number; skipped: number }[]
  reEnrolled: number
  teams: [string, number][]
}

export function reviewCounts(courses: AssignCourse[], committedIds: string[]): ReviewCounts {
  const people = committedIds.map((id) => BY_ID.get(id)!).filter(Boolean)
  const perCourse = courses.map((course) => {
    const skipped = people.filter((p) => isActivelyEnrolled(p, course.id)).length
    return { course, enrol: people.length - skipped, skipped }
  })
  const enrolling = people.filter((p) => courses.some((c) => !isActivelyEnrolled(p, c.id)))
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
  onEdit: (step: 'courses' | 'people') => void
}

const MAX_TEAMS = 3

function ReviewStep({ courses, committedIds, leftOut, onEdit }: Props) {
  const counts = reviewCounts(courses, committedIds)
  const offsets = startOffsets(courses)

  const skipBullets = counts.perCourse
    .filter((r) => r.skipped > 0)
    .map(
      (r) =>
        `${plural(r.skipped, 'person', 'people')} ${r.skipped === 1 ? 'is' : 'are'} already enrolled in ${r.course.name}, so they'll be skipped for that course.`,
    )
  const notes = [
    ...skipBullets,
    counts.reEnrolled > 0 && 'People who have completed a course will be enrolled again.',
    leftOut > 0 &&
      `${plural(leftOut, 'person', 'people')} ${leftOut === 1 ? 'is' : 'are'} already enrolled in every course, so they've been left out.`,
  ].filter(Boolean) as string[]

  const teamNames = counts.teams.slice(0, MAX_TEAMS).map(([t]) => t)
  const moreTeams = counts.teams.length - teamNames.length
  const teamsMeta = [...teamNames, moreTeams > 0 && `${moreTeams} more ${moreTeams === 1 ? 'team' : 'teams'}`]
    .filter(Boolean)
    .join(' · ')

  const icon = (I: typeof TickCircle) => <I size={16} color="currentColor" variant="Linear" />

  return (
    <div className="acw-review">
      <div className="acw-review-intro">
        <h3 className="acw-review-title">Ready to launch?</h3>
        <p className="acw-review-sub">Check who will be enrolled and when before you launch.</p>
      </div>

      <div className="acw-review-section">
        <div className="acw-review-section-head">
          <p className="acw-review-heading">Summary</p>
          <Button variant="text" size="md" onClick={() => onEdit('people')}>
            Edit People
          </Button>
        </div>
        <SummaryCardList grouped>
          <SummaryCard
            badge={icon(Profile2User)}
            tone="var(--course-assessments)"
            title={`${plural(counts.people, 'person', 'people')} will be enrolled in ${plural(courses.length, 'course')}`}
            meta={teamsMeta ? `From ${teamsMeta}` : undefined}
          />
          <SummaryCard
            badge={icon(TickCircle)}
            tone="var(--success-500)"
            title={`${plural(counts.enrolments, 'enrolment')} to create`}
            meta={counts.skipped > 0 ? `${counts.skipped} skipped, already enrolled` : 'None skipped'}
          />
        </SummaryCardList>
      </div>

      {notes.length > 0 && (
        <Alert
          type="Callout"
          icon
          title={skipBullets.length > 0 ? 'Some enrolments will be skipped' : notes[0]}
          bullets={skipBullets.length > 0 ? notes : notes.slice(1)}
        />
      )}

      <div className="acw-review-section">
        <div className="acw-review-section-head">
          <p className="acw-review-heading">Courses, in order</p>
          <Button variant="text" size="md" onClick={() => onEdit('courses')}>
            Edit Courses
          </Button>
        </div>
        <SummaryCardList grouped>
          {counts.perCourse.map((r, i) => (
            <SummaryCard
              key={r.course.id}
              badge={i + 1}
              title={r.course.name}
              meta={[timingLine(r.course, offsets[i]), `${r.enrol} to enrol`, r.skipped > 0 && `${r.skipped} skipped`]
                .filter(Boolean)
                .join(' · ')}
            />
          ))}
        </SummaryCardList>
      </div>
    </div>
  )
}

export default ReviewStep
