import { useState } from 'react'
import { Calendar, Danger, Profile2User, TaskSquare, User } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import Tooltip from '@/components/Tooltip/Tooltip'
import WorkspaceCourseCard from '@/components/WorkspaceCourseCard/WorkspaceCourseCard'
import { COURSE_DETAILS_ID, recordEnrolments } from '@/data/enrolments'
import courseThumb from '@/assets/programs/course-thumbs/course-thumb-1.jpg'
import WizardShell, { type WizardStep } from '../WizardShell/WizardShell'
import WizardSuccess from '../WizardShell/WizardSuccess'
import PeoplePicker from '../PeoplePicker/PeoplePicker'
import ExistingEnrolmentsCallout from '../AssignCoursesWizard/ExistingEnrolmentsCallout'
import { outcomeFor, reviewCounts, type ExistingChoice } from '../AssignCoursesWizard/ReviewStep'
import { plural, type AssignCourse } from '../AssignCoursesWizard/schedule'
import EnrolTimingStep, { defaultTiming, dueIso, fmtIso, fmtShortIso, timingSummary, type EnrolTiming } from './EnrolTimingStep'
import EnrolSponsorStep, { type Sponsor } from './EnrolSponsorStep'
import '../AssignCoursesWizard/AssignCoursesWizard.css'
import './EnrolCourseModal.css'

/* Enrol people to one course, from Course details: People → Dates → Sponsor → Review →
   success. Same shell, footer, stepper and success screen as Assign courses. */

type Step = 'people' | 'dates' | 'sponsor' | 'review'
// The Course details header's figures for this course (17 lessons, 20 min).
const COURSE_LESSONS = 17
const COURSE_MINUTES = 20
const ORDER: Step[] = ['people', 'dates', 'sponsor', 'review']

interface Props {
  open: boolean
  onClose: () => void
  /** Success: View Enrolments, with the number of people enrolled. */
  onEnrol: (count: number) => void
  courseTitle?: string
}

function EnrolCourseModal({ open, onClose, onEnrol, courseTitle = 'This course' }: Props) {
  const [step, setStep] = useState<Step>('people')
  // The furthest step reached; earlier steps count as done once they've been passed.
  const [reached, setReached] = useState(0)
  const [committed, setCommitted] = useState<string[]>([])
  // The ticked people on the People step; the footer button commits them.
  const [draftIds, setDraftIds] = useState<string[]>([])
  const [timing, setTiming] = useState<EnrolTiming>(defaultTiming)
  const [sponsor, setSponsor] = useState<Sponsor>({ name: '', role: '' })
  // Both off by default, so a straight Enrol leaves existing enrolments alone.
  const [choice, setChoice] = useState<ExistingChoice>({ restart: false, again: false })
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [launched, setLaunched] = useState<number | null>(null)

  // reviewCounts works on Assign's course shape; this wizard has the one course.
  const course: AssignCourse = {
    id: COURSE_DETAILS_ID,
    name: courseTitle,
    thumb: courseThumb,
    source: 'tenant',
    enrolment: { kind: 'immediate' },
    due: { kind: 'none' },
    repeat: { enabled: false },
  }
  const counts = reviewCounts([course], committed, choice)

  const go = (next: Step) => {
    setStep(next)
    setReached((r) => Math.max(r, ORDER.indexOf(next)))
  }

  const hasWork = committed.length > 0 || draftIds.length > 0 || sponsor.name.trim() !== ''
  const requestClose = () => {
    if (launched !== null) return onEnrol(launched)
    if (hasWork) setConfirmDiscard(true)
    else onClose()
  }

  const launch = () => {
    const pairs = committed
      .filter((id) => outcomeFor(id, COURSE_DETAILS_ID, choice) !== 'skip')
      .map((personId) => ({ personId, courseId: COURSE_DETAILS_ID }))
    recordEnrolments(pairs)
    setLaunched(counts.people)
  }

  const noPeople = committed.length === 0
  const lockedState = (id: Step): WizardStep['state'] => (step === id ? 'current' : noPeople ? 'locked' : 'reachable')
  const passed = (id: Step) => !noPeople && ORDER.indexOf(id) < reached

  const steps: WizardStep[] = [
    {
      id: 'people',
      title: 'People',
      sub: noPeople ? 'No people yet' : plural(committed.length, 'person', 'people'),
      Icon: Profile2User,
      state: step === 'people' ? 'current' : 'reachable',
      done: !noPeople,
      count: committed.length,
    },
    {
      id: 'dates',
      title: 'Dates',
      sub: noPeople ? 'Select people first' : timingSummary(timing),
      Icon: Calendar,
      state: lockedState('dates'),
      done: passed('dates'),
    },
    {
      id: 'sponsor',
      title: 'Sponsor',
      sub: noPeople ? 'Select people first' : sponsor.name.trim() || 'Optional',
      Icon: User,
      state: lockedState('sponsor'),
      done: passed('sponsor'),
    },
    {
      id: 'review',
      title: 'Review',
      sub: noPeople ? 'Select people first' : 'Check and enrol',
      Icon: TaskSquare,
      state: lockedState('review'),
    },
  ]

  const nextBlocked =
    step === 'people'
      ? draftIds.length === 0 && 'Select people to continue'
      : step === 'dates'
        ? timing.due.kind === 'date' && !timing.due.date && 'Choose a due date to continue'
        : false

  const action =
    step === 'review' ? (
      <Button size="lg" onClick={launch}>
        Enrol People
      </Button>
    ) : (
      <Tooltip text={nextBlocked || ''} position="Top" icon={false} disabled={!nextBlocked}>
        <Button
          size="lg"
          disabled={!!nextBlocked}
          onClick={() => {
            if (step === 'people') {
              setCommitted(draftIds)
              go('dates')
            } else go(ORDER[ORDER.indexOf(step) + 1])
          }}
        >
          {step === 'people'
            ? draftIds.length === 0
              ? 'Select People & Continue'
              : `Select ${draftIds.length} ${draftIds.length === 1 ? 'Person' : 'People'} & Continue`
            : step === 'dates'
              ? 'Save & Continue'
              : 'Continue'}
        </Button>
      </Tooltip>
    )

  const due = dueIso(timing)
  // People who will actually get the enrolment: the picked people minus any skipped.
  const enrolCount = counts.perCourse[0].enrol
  const sponsorLine = sponsor.name.trim() ? [sponsor.name.trim(), sponsor.role.trim()].filter(Boolean).join(', ') : ''

  const success = launched !== null && (
    <WizardSuccess
      title="Success"
      message={
        <>
          {plural(launched, 'person', 'people')} {launched === 1 ? 'is' : 'are'} now enrolled in <strong>{courseTitle}</strong>.
        </>
      }
      actionLabel="View Enrolments"
      onAction={() => onEnrol(launched)}
    />
  )

  return (
    <>
      <WizardShell
        open={open}
        title="Enrol people"
        closeLabel="Exit"
        onClose={requestClose}
        action={action}
        backAction={
          step !== 'people' && (
            <Button variant="outlined-2" size="lg" onClick={() => setStep(ORDER[ORDER.indexOf(step) - 1])}>
              Back
            </Button>
          )
        }
        steps={steps}
        onStepSelect={(id) => go(id as Step)}
        takeover={success || undefined}
        layout="top"
      >
        {/* Every step stays mounted so going back keeps the draft. */}
        <div hidden={step !== 'people'}>
          <h3 className="wzs-section-title acw-step-title">Select people to enrol</h3>
          <PeoplePicker
            courseIds={[COURSE_DETAILS_ID]}
            courseNames={{ [COURSE_DETAILS_ID]: courseTitle }}
            modes={['all', 'people', 'teams', 'managers', 'cohorts']}
            // Production opens with "Enrolment is Not enrolled" already applied.
            initialFilters={{ enrolment: 'not-enrolled' }}
            committedIds={committed}
            onCommit={(ids) => setCommitted(ids)}
            includeEnrolled
            onDraftChange={(_, ids) => setDraftIds(ids)}
            commitInFooter
          />
        </div>
        <div hidden={step !== 'dates'}>
          <h3 className="wzs-section-title acw-step-title">Set a start and due date</h3>
          <EnrolTimingStep timing={timing} onChange={setTiming} />
        </div>
        <div hidden={step !== 'sponsor'}>
          <h3 className="wzs-section-title acw-step-title">Name a sponsor (optional)</h3>
          <EnrolSponsorStep sponsor={sponsor} onChange={setSponsor} />
        </div>
        <div hidden={step !== 'review'}>
          {step === 'review' && (
            <div className="acw-review">
              <div className="acw-review-section">
                {/* A decision point, so above the summary. */}
                <ExistingEnrolmentsCallout
                  counts={counts}
                  choice={choice}
                  onChoiceChange={setChoice}
                  title="Some people already have this course and will be skipped"
                />
                {/* The course as learners will see it (DS Course card, static preview, as on
                    Course created), then the summary in words: who, when, whether it repeats. */}
                <div className="ecm-review-launch">
                  <h3 className="ecm-review-title">Your course is ready to launch 🙌</h3>
                  <WorkspaceCourseCard
                    course={{
                      id: COURSE_DETAILS_ID,
                      title: courseTitle,
                      image: courseThumb,
                      // The photo is always set, so the gradient fallback never shows.
                      thumbnailGradient: '',
                      progress: 0,
                      lessonCount: COURSE_LESSONS,
                      durationMinutes: COURSE_MINUTES,
                      // Library Card/Courses "New + Due date" (10276:13283): new to the learner, due pill when dated.
                      isNew: true,
                      dueLabel: due ? `Due on ${fmtShortIso(due)}` : undefined,
                    }}
                  />
                  <div className="ecm-review-summary">
                    <p className="ecm-review-text">
                      It will be assigned to <strong>{plural(enrolCount, 'person', 'people')}</strong>
                      {due ? (
                        <>
                          , scheduled for <strong>{fmtIso(timing.start)}</strong> to <strong>{fmtIso(due)}</strong>.
                        </>
                      ) : (
                        <>
                          , starting <strong>{fmtIso(timing.start)}</strong> with no due date.
                        </>
                      )}
                    </p>
                    <p className="ecm-review-text">
                      {timing.repeat.enabled
                        ? `It repeats every ${timing.repeat.interval} ${timing.repeat.unit} from the start date.`
                        : "This is a one-time enrolment and won't repeat."}
                    </p>
                    {sponsorLine && (
                      <p className="ecm-review-text">
                        Sponsored by <strong>{sponsorLine}</strong>.
                      </p>
                    )}
                    <p className="ecm-review-text">You can find this course on the Courses page.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </WizardShell>

      {/* Warning, not Error: work is lost, nothing is destroyed (as Assign courses). */}
      <ConfirmModal open={confirmDiscard} onClose={() => setConfirmDiscard(false)} ariaLabel="Discard enrolment">
        <div className="confirm-modal-header confirm-modal-header--center">
          <Danger size={72} color="var(--warning-500)" variant="Linear" />
          <h3 className="confirm-modal-title">Discard this enrolment?</h3>
          <p className="confirm-modal-body">The people, dates and sponsor you've chosen will be lost if you exit now.</p>
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

export default EnrolCourseModal
