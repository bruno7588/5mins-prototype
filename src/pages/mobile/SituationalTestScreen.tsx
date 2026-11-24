import { useState, type MutableRefObject } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { MobileStatusBar } from '@/components/mobile/TopNav/TopNav'
import QuizHeader from '@/pages/quiz-lab/components/QuizHeader'
import { QuizAdvanceContext, QuizResultContext } from '@/pages/quiz-lab/components/FeedbackFooter'
import BottomSheet from '@/components/BottomSheet/BottomSheet'
import ScenarioMedia from '@/components/ScenarioMedia/ScenarioMedia'
import type { ScenarioMediaData } from '@/data/scenarioMedia'
import Button from '@/components/Button/Button'
import { LEAVE_BODY, LEAVE_TITLE, leaveIllustration } from '@/components/SituationalTestPlayer/SituationalResults'
import { SituationalQuestionScreen } from '@/components/SituationalTestPlayer/SituationalTestPlayer'
import { ARRIVE, arriveTransition } from '@/components/AIWorkingCard/arrive'
import { FEED_ATTEMPTS } from '@/data/courseFeed'
import type { SituationalQuestion } from '@/pages/your-courses/components/SituationalTestDrawer/SituationalTestDrawer'
import './SituationalTestScreen.css'

/**
 * A run of questions, one per screen, full screen over the tab bar: the situational
 * test's (Figma 17024:75290) or a lesson quiz's (17024:76785).
 * The close asks first ("Don't give up!", 17024:76085), then returns to the brief; the
 * last Continue completes the attempt.
 */
export function MobileSituationalQuestions({
  questions,
  label,
  ariaLabel = 'Situational test',
  brief,
  attemptsUsed,
  onResult,
  onClose,
  onComplete,
}: {
  questions: SituationalQuestion[]
  /** The header's counter, e.g. "Question 1/4" or "Lesson Quiz (1/2)". */
  label: (n: number, total: number) => string
  ariaLabel?: string
  /** The scenario to keep within reach: "View Brief" in the header opens it in a sheet
   *  with the media where it was left (DES-371). Omit for a lesson quiz. */
  brief?: { title: string; text: string; media?: ScenarioMediaData; mediaPosition: MutableRefObject<number> }
  /** Attempts already spent; the heart counts what is left. */
  attemptsUsed: number
  /** How question `index` went, as the learner moves on from it. */
  onResult: (index: number, correct: boolean) => void
  onClose: () => void
  onComplete: () => void
}) {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [briefOpen, setBriefOpen] = useState(false)
  const next = () => (index === questions.length - 1 ? onComplete() : setIndex((i) => i + 1))

  return (
    <motion.div
      className="m-sittest m-sittest--overlay"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      {...ARRIVE(reduce)}
      exit={{ opacity: 0 }}
      transition={arriveTransition(reduce)}
    >
      <MobileStatusBar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          className="ql-quizview m-sittest__quiz"
          {...ARRIVE(reduce)}
          exit={{ opacity: 0 }}
          transition={arriveTransition(reduce)}
        >
          <QuizHeader
            label={label(index + 1, questions.length)}
            used={attemptsUsed}
            total={FEED_ATTEMPTS}
            showAttempts={false}
            heartCount
            action={
              brief ? (
                <Button variant="text" size="sm" onClick={() => setBriefOpen(true)}>
                  View Brief
                </Button>
              ) : undefined
            }
            onClose={() => setLeaveOpen(true)}
          />
          <QuizAdvanceContext.Provider value={next}>
            <QuizResultContext.Provider value={(correct) => onResult(index, correct)}>
              <SituationalQuestionScreen question={questions[index]} />
            </QuizResultContext.Provider>
          </QuizAdvanceContext.Provider>
        </motion.div>
      </AnimatePresence>
      {brief && briefOpen ? (
        <BottomSheet ariaLabel="Brief" onClose={() => setBriefOpen(false)}>
          <div className="bottom-sheet__content m-sittest__brief">
            <h2 className="m-sittest__brieftitle">{brief.title}</h2>
            {brief.media ? <ScenarioMedia media={brief.media} position={brief.mediaPosition} /> : null}
            <p className="m-sittest__brieftext">{brief.text}</p>
          </div>
        </BottomSheet>
      ) : null}
      {leaveOpen ? (
        <BottomSheet ariaLabel={LEAVE_TITLE} onClose={() => setLeaveOpen(false)}>
          <div className="m-sittest__leave">
            <img src={leaveIllustration} width={72} height={72} alt="" />
            <div className="m-sittest__leavetext">
              <h2 className="m-sittest__leavetitle">{LEAVE_TITLE}</h2>
              <p className="m-sittest__leavebody">{LEAVE_BODY}</p>
            </div>
            <div className="m-sittest__leaveactions">
              <Button variant="outlined" size="md" onClick={onClose}>
                Exit
              </Button>
              <Button size="md" onClick={() => setLeaveOpen(false)}>
                Resume
              </Button>
            </div>
          </div>
        </BottomSheet>
      ) : null}
    </motion.div>
  )
}
