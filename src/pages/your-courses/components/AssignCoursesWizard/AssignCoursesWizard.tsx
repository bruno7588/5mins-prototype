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
import ReviewStep, { outcomeFor, reviewCounts, type ExistingChoice } from './ReviewStep'
import { plural, type AssignCourse } from './schedule'
import './AssignCoursesWizard.css'

/* Assign courses (DES-332): Courses → People → Review → success. A one-time bulk
   enrolment of several people into several courses, from Your Courses. */

type Step = 'courses' | 'people' | 'review'

interface Props {
  onClose: () => void
  /** Success: View Enrolments, to the Active Enrolments tab where the new enrolments show. */
  onDone: () => void
}

function AssignCoursesWizard({ onClose, onDone }: Props) {
  const [step, setStep] = useState<Step>('courses')
  const [courses, setCourses] = useState<AssignCourse[]>([])
  const [committed, setCommitted] = useState<string[]>([])
  // What happens to people who already have a course; both off by default, so a
  // straight Launch leaves every existing enrolment and completion alone.
  const [choice, setChoice] = useState<ExistingChoice>({ restart: false, again: false })
  // The ticked people on the People step; the footer button commits them.
  const [draftIds, setDraftIds] = useState<string[]>([])
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [launched, setLaunched] = useState<{ courses: number; people: number } | null>(null)

  const courseIds = useMemo(() => courses.map((c) => c.id), [courses])
  const courseNames = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c.name])), [courses])

  // Everyone picked stays in, including people who already have every course: Review
  // skips them by default and lets the admin restart or re-enrol them.
  const activeCommitted = committed

  const hasWork = courses.length > 0 || committed.length > 0
  const requestClose = () => {
    if (launched) return onDone()
    if (hasWork) setConfirmDiscard(true)
    else onClose()
  }

  const launch = () => {
    const pairs = courses.flatMap((c) =>
      activeCommitted
        .filter((id) => outcomeFor(id, c.id, choice) !== 'skip')
        .map((personId) => ({ personId, courseId: c.id })),
    )
    const counts = reviewCounts(courses, activeCommitted, choice)
    recordEnrolments(pairs)
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
    },
    {
      id: 'review',
      title: 'Review',
      sub: activeCommitted.length === 0 ? 'Select people first' : 'Check and launch',
      Icon: TaskSquare,
      state:
        step === 'review' ? 'current' : courses.length === 0 || activeCommitted.length === 0 ? 'locked' : 'reachable',
    },
  ]

  const nextBlocked =
    step === 'courses'
      ? courses.length === 0 && 'Add at least one course to continue'
      : step === 'people'
        ? draftIds.length === 0 && 'Select people to continue'
        : false

  const action =
    step === 'review' ? (
      <Button size="lg" onClick={launch}>
        Assign Courses
      </Button>
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
            } else setStep('people')
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
            <Button variant="outlined-2" size="lg" onClick={() => setStep(step === 'review' ? 'people' : 'courses')}>
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
          {courses.length > 0 && (
            <PeoplePicker
              courseIds={courseIds}
              courseNames={courseNames}
              modes={['all', 'people', 'teams', 'managers', 'cohorts']}
              committedIds={committed}
              onCommit={(ids) => setCommitted(ids)}
              includeEnrolled
              onDraftChange={(_, ids) => setDraftIds(ids)}
              commitInFooter
            />
          )}
        </div>
        <div hidden={step !== 'review'}>
          {step === 'review' && <ReviewStep courses={courses} committedIds={activeCommitted} choice={choice} onChoiceChange={setChoice} />}
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
