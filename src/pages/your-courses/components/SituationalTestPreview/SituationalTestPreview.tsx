import { useState } from 'react'
import { createPortal } from 'react-dom'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import Button from '@/components/Button/Button'
import PhoneFrame from '@/components/mobile/PhoneFrame/PhoneFrame'
import QuizHeader from '@/pages/quiz-lab/components/QuizHeader'
import MatchPairsPartial from '@/pages/quiz-lab/formats/MatchPairsPartial'
import FillBlank from '@/pages/quiz-lab/formats/FillBlank'
import Categorization from '@/pages/quiz-lab/formats/Categorization'
import SequencingDnd from '@/pages/quiz-lab/formats/SequencingDnd'
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
 * Just the phone on the scrim — no dialog card. ConfirmModal supplies the scrim, focus
 * trap and Escape, and it is portalled to the body because the drawer's z-index makes a
 * stacking context the overlay couldn't paint over.
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
                  /* Attempts, not position — hearts belong to a real run, and this is a
                     preview. The position lives under the phone. */
                  used={1}
                  total={3}
                  showHearts={false}
                  onClose={onClose}
                />
                <QuestionScreen question={question as SituationalQuestion} />
              </>
            )}
          </div>
        </PhoneFrame>
      </div>

      {/* The walkthrough's own controls, outside the phone: paging between questions is
          the admin's business, not something the learner would have. */}
      <div className="st-preview__nav">
        <Button variant="outlined" disabled={onBrief} onClick={() => setScreen((s) => s - 1)}>
          Back
        </Button>
        <span className="st-preview__counter">
          {onBrief ? 'Brief' : `Question ${screen} of ${questions.length}`}
        </span>
        <Button disabled={last} onClick={() => setScreen((s) => s + 1)}>
          Next
        </Button>
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

  /* Multiple choice, poll, short text and exercise have no learner renderer in the
     prototype yet — quiz-lab covers the four interactive formats. Shown in the quiz's
     own screen and token styles so the screen still belongs to the same UI, and inert,
     since there is nothing here that could grade it. */
  return (
    <div className="ql-screen">
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__q">{question.text}</span>
        </div>
        {question.options.filter((option) => option.trim()).length > 0 ? (
          <div className="st-preview__options">
            {question.options
              .filter((option) => option.trim())
              .map((option) => (
                <span className="ql-token ql-token--block" key={option}>
                  {option}
                </span>
              ))}
          </div>
        ) : (
          <p className="st-preview__brief">The learner answers in their own words.</p>
        )}
      </div>
    </div>
  )
}

export default SituationalTestPreview
