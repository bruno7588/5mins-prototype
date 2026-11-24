import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import BottomSheet from '@/components/BottomSheet/BottomSheet'
import Button from '@/components/Button/Button'
import ScenarioMedia from '@/components/ScenarioMedia/ScenarioMedia'
import DesktopPreview from '@/components/DesktopPreview/DesktopPreview'
import QuizHeader from '@/pages/quiz-lab/components/QuizHeader'
import { QuizAdvanceContext } from '@/pages/quiz-lab/components/FeedbackFooter'
import {
  SituationalBrief,
  SituationalQuestionScreen as QuestionScreen,
} from '@/components/SituationalTestPlayer/SituationalTestPlayer'
import '@/pages/quiz-lab/quiz-lab.css'
import { typeLabel } from '@/data/aiAssessmentGeneration'
import type { SituationalQuestion } from '../SituationalTestDrawer/SituationalTestDrawer'
import type { ScenarioMediaData } from '@/data/scenarioMedia'
import './SituationalTestPreview.css'

interface Props {
  title: string
  brief: string
  questions: SituationalQuestion[]
  /** The scenario's image, audio clip or video, shown on the brief card (DES-371). */
  media?: ScenarioMediaData
  onClose: () => void
}

/**
 * The situational test on a phone, screen by screen (DES-279).
 *
 * The brief first, then one screen per question — each run by the same learner
 * renderer the format is played with everywhere else (`quiz-lab/formats/*`, the same
 * ones the assessment drawer and the course preview open). Nothing is re-drawn here:
 * the shuffle, the word bank, the buckets and the grading are the real thing, so what
 * the admin approves is what the learner meets.
 *
 * The way through is the learner's own: Start Situational Test opens the first question
 * and each Continue moves to the next, so the admin takes the same path they would. Just
 * the phone on the scrim — no dialog card, no paging beside it. ConfirmModal supplies the
 * scrim, focus trap and Escape, and it is portalled to the body because the drawer's
 * z-index makes a stacking context the overlay couldn't paint over.
 */
function SituationalTestPreview({ title, brief, questions, media, onClose }: Props) {
  const [screen, setScreen] = useState(0)
  const onBrief = screen === 0
  const question = onBrief ? null : questions[screen - 1]
  const last = screen === questions.length
  /* The frame has no details panel, so the scenario stays within reach the way it does
     in the app: "View Brief" beside the counter opens it in a sheet (DES-371). The
     media picks up where it was left on the brief card. */
  const [briefOpen, setBriefOpen] = useState(false)
  const mediaPosition = useRef(0)

  return createPortal(
    <ConfirmModal
      open
      onClose={onClose}
      className="st-preview-modal"
      ariaLabel="Preview situational test"
    >
      <div className="st-preview__stage">
        <DesktopPreview>
          {/* Remounted per screen so each question starts unanswered, the way the
              learner meets it. */}
          <div className="ql-quizview" key={screen}>
            {onBrief ? (
              /* The brief as the course feed draws it (Figma 17024:82020): a card on the
                 page, headed by the situational test's own artwork. The quiz header runs
                 empty here — no format to name and no attempt to count, and the card
                 already says what it is — but it still carries the close, which is the
                 way out of every other screen and has to be in the same place on this
                 one. */
              <>
                <QuizHeader showHearts={false} showAttempts={false} onClose={onClose} />
                <div className="st-preview__brief-screen">
                  <SituationalBrief
                    title={title}
                    brief={brief}
                    media={media}
                    mediaPosition={mediaPosition}
                    onStart={() => setScreen(1)}
                  />
                </div>
              </>
            ) : (
              <>
                <QuizHeader
                  label={typeLabel(question?.format ?? 'single-choice')}
                  /* Where you are in the test. The badge counts attempts in a real run,
                     but a walkthrough has no attempts — and a fixed 1/3 beside seven
                     questions reads as a question count that disagrees with itself.
                     Hearts stay off, so nothing else on screen claims otherwise. */
                  used={screen}
                  total={questions.length}
                  showHearts={false}
                  action={
                    <Button variant="text" size="sm" onClick={() => setBriefOpen(true)}>
                      View Brief
                    </Button>
                  }
                  onClose={onClose}
                />
                {/* Continue is the learner's way on, so in a walkthrough it goes to the
                    next question rather than resetting this one. On the last there is
                    nowhere to go, so the format keeps its own retry. */}
                <QuizAdvanceContext.Provider
                  value={last ? null : () => setScreen((s) => s + 1)}
                >
                  <QuestionScreen question={question as SituationalQuestion} />
                </QuizAdvanceContext.Provider>
              </>
            )}
          </div>
          {briefOpen ? (
            <BottomSheet ariaLabel="Brief" onClose={() => setBriefOpen(false)}>
              <div className="bottom-sheet__content st-preview__sheet">
                <h2 className="st-preview__sheet-title">{title || 'Untitled situational test'}</h2>
                {media ? <ScenarioMedia media={media} position={mediaPosition} /> : null}
                <p className="st-preview__sheet-text">{brief}</p>
              </div>
            </BottomSheet>
          ) : null}
        </DesktopPreview>
      </div>

    </ConfirmModal>,
    document.body,
  )
}

/**
 * One question on its own, as the learner meets it: the Preview of the one-at-a-time
 * AI reviews (course assessments and the lesson quiz). Same stage and renderers as the
 * situational walkthrough, minus the brief and the paging.
 */
export function QuestionPreview({ question, onClose }: { question: SituationalQuestion; onClose: () => void }) {
  return createPortal(
    <ConfirmModal
      open
      onClose={onClose}
      className="st-preview-modal"
      ariaLabel={`Preview - ${typeLabel(question.format ?? 'single-choice')}`}
    >
      <div className="st-preview__stage">
        <DesktopPreview>
          <div className="ql-quizview">
            <QuizHeader
              label={typeLabel(question.format ?? 'single-choice')}
              showHearts={false}
              showAttempts={false}
              onClose={onClose}
            />
            <QuestionScreen question={question} />
          </div>
        </DesktopPreview>
      </div>
    </ConfirmModal>,
    document.body,
  )
}

export default SituationalTestPreview
