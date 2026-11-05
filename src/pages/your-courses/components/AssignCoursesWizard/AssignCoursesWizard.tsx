import { useMemo, useState } from 'react'
import { Book1, Danger, Profile2User, TaskSquare } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import Tooltip from '@/components/Tooltip/Tooltip'
import { recordEnrolments } from '@/data/enrolments'
import WizardShell, { type WizardStep } from '../WizardShell/WizardShell'
import WizardSuccess from '../WizardShell/WizardSuccess'
import PeoplePicker from '../PeoplePicker/PeoplePicker'
import CoursesStep from './CoursesStep'
import ReviewStep, { includeChoice, outcomeFor, reviewCounts } from './ReviewStep'
import { recordCourseLaunches } from '../../activeEnrolments'
import { plural, startOffsets, type AssignCourse } from './schedule'
import './AssignCoursesWizard.css'

/* Assign courses (DES-332): Courses → People → Review → success. A one-time bulk
   enrolment of several people into several courses, from Your Courses. */

type Step = 'courses' | 'people' | 'review'

interface Props {
  onClose: () => void
  /** Success: View Enrolments, to the Active Enrolments tab where the new enrolments show. */
  onDone: () => void
  /** Opened from a person's profile: these people are already chosen, so there is no People step. */
  personIds?: string[]
  /** Who the preset people are, named on Review instead of a count. */
  personName?: string
  /** After launch: each course that enrolled someone, with its start in days from today. */
  onLaunched?: (assigned: { course: AssignCourse; startOffset: number }[]) => void
}

function AssignCoursesWizard({ onClose, onDone, personIds, personName, onLaunched }: Props) {
  const preset = !!personIds
  const [step, setStep] = useState<Step>('courses')
  const [courses, setCourses] = useState<AssignCourse[]>([])
  const [committed, setCommitted] = useState<string[]>(personIds ?? [])
  // Courses whose existing people the admin chose to include (restart or re-enrol). None
  // by default, so a straight Launch leaves every existing enrolment and completion alone.
  const [included, setIncluded] = useState<string[]>([])
  const choiceFor = (courseId: string) => includeChoice(included.includes(courseId))
  const toggleIncluded = (courseId: string) =>
    setIncluded((ids) => (ids.includes(courseId) ? ids.filter((id) => id !== courseId) : [...ids, courseId]))
  // The ticked people on the People step; the footer button commits them.
  const [draftIds, setDraftIds] = useState<string[]>([])
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [launched, setLaunched] = useState<{ courses: number; people: number } | null>(null)

  const courseIds = useMemo(() => courses.map((c) => c.id), [courses])
  const courseNames = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c.name])), [courses])

  // Everyone picked stays in, including people who already have every course: Review
  // skips them by default and lets the admin restart or re-enrol them.
  const activeCommitted = committed

  const hasWork = courses.length > 0 || (!preset && committed.length > 0)
  const requestClose = () => {
    if (launched) return onDone()
    if (hasWork) setConfirmDiscard(true)
    else onClose()
  }

  const launch = () => {
    const pairs = courses.flatMap((c) =>
      activeCommitted
        .filter((id) => outcomeFor(id, c.id, choiceFor(c.id)) !== 'skip')
        .map((personId) => ({ personId, courseId: c.id })),
    )
    const counts = reviewCounts(courses, activeCommitted, choiceFor)
    recordEnrolments(pairs)
    // The courses land on Your Courses > Active Enrolments as enrolled today.
    recordCourseLaunches(counts.perCourse.map((r) => ({ id: r.course.id, name: r.course.name, thumb: r.course.thumb, enrolled: r.enrol })))
    const offsets = startOffsets(courses)
    onLaunched?.(
      courses
        .map((course, i) => ({ course, startOffset: offsets[i] }))
        .filter((_, i) => counts.perCourse[i].enrol > 0),
    )
    setLaunched({ courses: courses.length, people: counts.people })
  }

  const steps: WizardStep[] = [
    {
      id: 'courses',
      title: 'Courses',
      sub: courses.length === 0 ? 'No courses yet' : plural(courses.length, 'course'),
      Icon: Book1,
      state: step === 'courses' ? 'current' : 'reachable',
      done: courses.length > 0,
      count: courses.length,
    },
    ...(preset
      ? []
      : [
          {
            id: 'people',
            title: 'People',
            sub:
              courses.length === 0
                ? 'Add courses first'
                : activeCommitted.length === 0
                  ? 'No people yet'
                  : plural(activeCommitted.length, 'person', 'people'),
            Icon: Profile2User,
            state: step === 'people' ? 'current' : courses.length === 0 ? 'locked' : 'reachable',
            done: activeCommitted.length > 0,
            count: activeCommitted.length,
          } satisfies WizardStep,
        ]),
    {
      id: 'review',
      title: 'Review',
      sub: activeCommitted.length === 0 ? 'Select people first' : 'Check and launch',
      Icon: TaskSquare,
      state:
        step === 'review' ? 'current' : courses.length === 0 || activeCommitted.length === 0 ? 'locked' : 'reachable',
    },
  ]

  const launchBlocked =
    step === 'review' &&
    reviewCounts(courses, activeCommitted, choiceFor).people === 0 &&
    'No one to enrol. Include people already enrolled to continue'

  const nextBlocked =
    step === 'courses'
      ? courses.length === 0 && 'Add at least one course to continue'
      : step === 'people'
        ? draftIds.length === 0 && 'Select people to continue'
        : false

  const action =
    step === 'review' ? (
      // Everyone picked already has every course and none are included: nothing to launch.
      <Tooltip text={launchBlocked || ''} position="Top" icon={false} disabled={!launchBlocked}>
        <Button size="lg" disabled={!!launchBlocked} onClick={launch}>
          Assign Courses
        </Button>
      </Tooltip>
    ) : (
      <Tooltip text={nextBlocked || ''} position="Top" icon={false} disabled={!nextBlocked}>
        {/* People step: one button commits the ticked people and moves on, instead of a
            separate Select People in the picker plus Next. */}
        <Button
          size="lg"
          disabled={!!nextBlocked}
          onClick={() => {
            if (step === 'people') {
              setCommitted(draftIds)
              setStep('review')
            } else setStep(preset ? 'review' : 'people')
          }}
        >
          {step === 'people'
            ? draftIds.length === 0
              ? 'Select People & Continue'
              : `Select ${draftIds.length} ${draftIds.length === 1 ? 'Person' : 'People'} & Continue`
            : 'Continue'}
        </Button>
      </Tooltip>
    )

  const success = launched && (
    <WizardSuccess
      title={launched.courses === 1 ? 'Course assigned' : 'Courses assigned'}
      message={`${plural(launched.courses, 'course')} ${launched.courses === 1 ? 'is' : 'are'} now assigned to ${plural(launched.people, 'person', 'people')}.`}
      actionLabel="View Enrolments"
      onAction={onDone}
    />
  )

  return (
    <>
      <WizardShell
        open
        title="Assign courses"
        closeLabel="Exit"
        onClose={requestClose}
        action={action}
        backAction={
          step !== 'courses' && (
            <Button variant="outlined-2" size="lg" onClick={() => setStep(step === 'review' && !preset ? 'people' : 'courses')}>
              Back
            </Button>
          )
        }
        steps={steps}
        onStepSelect={(id) => setStep(id as Step)}
        takeover={success || undefined}
        layout="top"
      >
        {/* Every step stays mounted so going back keeps the draft (AC 12). */}
        <div hidden={step !== 'courses'}>
          <h3 className="wzs-section-title acw-step-title">Add courses</h3>
          <CoursesStep courses={courses} onChange={setCourses} />
        </div>
        <div hidden={step !== 'people'}>
          <h3 className="wzs-section-title acw-step-title">Select people to enrol</h3>
          {!preset && courses.length > 0 && (
            <PeoplePicker
              courseIds={courseIds}
              courseNames={courseNames}
              modes={['all', 'people', 'cohorts']}
              committedIds={committed}
              onCommit={(ids) => setCommitted(ids)}
              includeEnrolled
              onDraftChange={(_, ids) => setDraftIds(ids)}
              commitInFooter
            />
          )}
        </div>
        <div hidden={step !== 'review'}>
          {step === 'review' && <ReviewStep courses={courses} committedIds={activeCommitted} included={included} onToggleIncluded={toggleIncluded} personName={personName} />}
        </div>
      </WizardShell>

      {/* Warning, not Error: work is lost, nothing is destroyed (as Automations). */}
      <ConfirmModal open={confirmDiscard} onClose={() => setConfirmDiscard(false)} ariaLabel="Discard assignment">
        <div className="confirm-modal-header confirm-modal-header--center">
          <Danger size={72} color="var(--warning-500)" variant="Linear" />
          <h3 className="confirm-modal-title">Discard this assignment?</h3>
          <p className="confirm-modal-body">
            The courses and people you've chosen will be lost if you exit now.
          </p>
        </div>
        <div className="confirm-modal-actions confirm-modal-actions--center">
          <Button variant="outlined-2" onClick={() => setConfirmDiscard(false)}>
            Keep Editing
          </Button>
          <Button
            semantic="warning"
            onClick={() => {
              setConfirmDiscard(false)
              onClose()
            }}
          >
            Discard
          </Button>
        </div>
      </ConfirmModal>
    </>
  )
}

export default AssignCoursesWizard
