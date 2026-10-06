import { useEffect, useMemo, useRef, useState } from 'react'
import { MotionConfig, motion } from 'framer-motion'
import { Book1, Danger, Profile2User, TaskSquare } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import Tooltip from '@/components/Tooltip/Tooltip'
import { recordEnrolments, isActivelyEnrolled } from '@/data/enrolments'
import { PEOPLE } from '@/data/people'
import { SuccessTick } from '@/pages/programs/components/LaunchSuccessModal/LaunchSuccessModal'
import { confetti } from '@/lib/confetti'
import WizardShell, { type WizardStep } from '../WizardShell/WizardShell'
import PeoplePicker from '../PeoplePicker/PeoplePicker'
import CoursesStep from './CoursesStep'
import ReviewStep, { reviewCounts, willEnrol } from './ReviewStep'
import { plural, type AssignCourse } from './schedule'
import './AssignCoursesWizard.css'

/* Assign courses (DES-332): Courses → People → Review → success. A one-time bulk
   enrolment of several people into several courses, from Your Courses. */

type Step = 'courses' | 'people' | 'review'

const BY_ID = new Map(PEOPLE.map((p) => [p.id, p]))

/* One burst on launch (Confetti Studio, src/lib/confetti.js), on a canvas over the
   success screen. The canvas goes once the last piece has faded; with reduced motion
   the script draws nothing. */
function LaunchConfetti() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    return confetti(ref.current, { transparent: true, onComplete: () => setDone(true) })
  }, [])
  if (done) return null
  return <canvas ref={ref} className="acw-confetti" aria-hidden="true" />
}

interface Props {
  onClose: () => void
  /** Success: back to Your Courses, where the admin started (D10). */
  onDone: () => void
}

function AssignCoursesWizard({ onClose, onDone }: Props) {
  const [step, setStep] = useState<Step>('courses')
  const [courses, setCourses] = useState<AssignCourse[]>([])
  const [committed, setCommitted] = useState<string[]>([])
  const [leftOut, setLeftOut] = useState(0)
  // Courses where the admin chose to re-enrol people already on them (skipped by default).
  const [reEnrol, setReEnrol] = useState<Set<string>>(new Set())
  const toggleReEnrol = (courseId: string) =>
    setReEnrol((prev) => {
      const next = new Set(prev)
      if (next.has(courseId)) next.delete(courseId)
      else next.add(courseId)
      return next
    })
  const [draftCount, setDraftCount] = useState(0)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [launched, setLaunched] = useState<{ courses: number; people: number } | null>(null)

  const courseIds = useMemo(() => courses.map((c) => c.id), [courses])
  const courseNames = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c.name])), [courses])

  // Removing or adding a course can make a committed person fully enrolled;
  // they drop out of the count rather than lingering with nothing to enrol.
  const activeCommitted = useMemo(
    () => committed.filter((id) => courses.some((c) => !isActivelyEnrolled(BY_ID.get(id)!, c.id))),
    [committed, courses],
  )

  const hasWork = courses.length > 0 || committed.length > 0
  const requestClose = () => {
    if (launched) return onDone()
    if (hasWork) setConfirmDiscard(true)
    else onClose()
  }

  const launch = () => {
    const pairs = courses.flatMap((c) =>
      activeCommitted
        .filter((id) => willEnrol(id, c.id, reEnrol))
        .map((personId) => ({ personId, courseId: c.id })),
    )
    const counts = reviewCounts(courses, activeCommitted, reEnrol)
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
        ? (activeCommitted.length === 0 || draftCount === 0) && 'Select people to continue'
        : false

  const action =
    step === 'review' ? (
      <Button size="lg" onClick={launch}>
        Launch
      </Button>
    ) : (
      <Tooltip text={nextBlocked || ''} position="Top" icon={false} disabled={!nextBlocked}>
        <Button size="lg" disabled={!!nextBlocked} onClick={() => setStep(step === 'courses' ? 'people' : 'review')}>
          Next
        </Button>
      </Tooltip>
    )

  const success = launched && (
    <MotionConfig reducedMotion="user">
      <LaunchConfetti />
      <div className="acw-success">
        <div className="lsm-content">
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          >
            <SuccessTick />
          </motion.div>
          <motion.div
            className="lsm-info"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
          >
            <h2 className="lsm-title">{launched.courses === 1 ? 'Course assigned' : 'Courses assigned'}</h2>
            <p className="lsm-sub">
              {plural(launched.courses, 'course')} {launched.courses === 1 ? 'is' : 'are'} now assigned to{' '}
              {plural(launched.people, 'person', 'people')}.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35, ease: 'easeOut' }}
          >
            <Button size="lg" onClick={onDone} autoFocus>
              Continue To Courses
            </Button>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  )

  return (
    <>
      <WizardShell
        open
        title="Assign courses"
        closeLabel="Close Assign courses"
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
              onCommit={(ids, out) => {
                setCommitted(ids)
                setLeftOut(out)
              }}
              onDraftChange={setDraftCount}
            />
          )}
        </div>
        <div hidden={step !== 'review'}>
          {step === 'review' && <ReviewStep courses={courses} committedIds={activeCommitted} leftOut={leftOut} reEnrol={reEnrol} onToggleReEnrol={toggleReEnrol} onEdit={setStep} />}
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
