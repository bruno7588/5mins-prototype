import { useState } from 'react'
import { createPortal } from 'react-dom'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import Button from '@/components/Button/Button'
import PhoneFrame from '@/components/mobile/PhoneFrame/PhoneFrame'
import QuizHeader from '@/pages/quiz-lab/components/QuizHeader'
import { QuizAdvanceContext } from '@/pages/quiz-lab/components/FeedbackFooter'
import MatchPairsPartial from '@/pages/quiz-lab/formats/MatchPairsPartial'
import FillBlank from '@/pages/quiz-lab/formats/FillBlank'
import Categorization from '@/pages/quiz-lab/formats/Categorization'
import SequencingDnd from '@/pages/quiz-lab/formats/SequencingDnd'
import SingleChoice from '@/pages/quiz-lab/formats/SingleChoice'
import FreeText from '@/pages/quiz-lab/formats/FreeText'
import '@/pages/quiz-lab/quiz-lab.css'
import { getAssessmentIllustration } from '@/assets/assessment-illustrations'
import { typeLabel } from '@/data/aiAssessmentGeneration'
import type { SituationalQuestion } from '../SituationalTestDrawer/SituationalTestDrawer'
import './SituationalTestPreview.css'

/* The situational test's own artwork, heading its brief. */
const briefIllustration = getAssessmentIllustration('situational-test', 'desktop')

interface Props {
  title: string
  brief: string
  questions: SituationalQuestion[]
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
function SituationalTestPreview({ title, brief, questions, onClose }: Props) {
  const [screen, setScreen] = useState(0)
  const onBrief = screen === 0
  const question = onBrief ? null : questions[screen - 1]
  const last = screen === questions.length

  return createPortal(
    <ConfirmModal
      open
      onClose={onClose}
      className="st-preview-modal"
      ariaLabel="Preview situational test"
    >
      <div className="st-preview__stage">
        <PhoneFrame>
          {/* Remounted per screen so each question starts unanswered, the way the
              learner meets it. */}
          <div className="ql-quizview" key={screen}>
            {onBrief ? (
              /* The brief as the course feed draws it (Figma 17024:82020): a card on the
                 page, headed by the situational test's own artwork. No quiz header —
                 there is no format to name and no attempt to count, and the card already
                 says what it is. */
              <div className="st-preview__brief-screen">
                <div className="st-preview__brief-card">
                  <div className="st-preview__brief-head">
                    <img src={briefIllustration} width={40} height={40} alt="" />
                    <span className="st-preview__brief-label">Brief</span>
                  </div>
                  <div className="st-preview__brief-divider" />
                  <div className="st-preview__brief-body">
                    <p className="st-preview__brief-title">
                      {title || 'Untitled situational test'}
                    </p>
                    <p className="st-preview__brief-text">{brief}</p>
                  </div>
                  <Button size="lg" onClick={() => setScreen(1)}>
                    Start Situational Test
                  </Button>
                </div>
              </div>
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
        </PhoneFrame>
      </div>

    </ConfirmModal>,
    document.body,
  )
}

/** The real renderer for the four interactive formats; the options for the rest. */
function QuestionScreen({ question }: { question: SituationalQuestion }) {
  const payload = question.interactive

  if (payload?.type === 'match-pairs') return <MatchPairsPartial question={payload} />
  if (payload?.type === 'fill-blank') return <FillBlank question={payload} formatKey="fill-blank" />
  if (payload?.type === 'categorization')
    return <Categorization question={payload} formatKey="categorization" />
  if (payload?.type === 'sequencing') return <SequencingDnd question={payload} />

  /* The rest are option or open-answer questions, played by the same two renderers the
     lab uses. A poll carries correctIndex -1, so SingleChoice asks without marking. */
  const options = question.options.filter((option) => option.trim())
  if (options.length > 0) {
    return (
      <SingleChoice
        question={{
          type: 'single-choice',
          prompt: question.text,
          options,
          correctIndex: question.format === 'poll' ? -1 : question.correctIndex,
        }}
      />
    )
  }

  return <FreeText question={{ type: 'free-text', prompt: question.text }} />
}

export default SituationalTestPreview
