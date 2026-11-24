import { CloseCircle, TickCircle } from 'iconsax-react'
import Button from '@/components/Button/Button'
import { getAssessmentIllustration } from '@/assets/assessment-illustrations'
import heartFilled from '@/assets/quiz-hearts/heart-filled.svg'
import type { SituationalQuestion } from '@/pages/your-courses/components/SituationalTestDrawer/SituationalTestDrawer'
import './SituationalResults.css'

const illustration = getAssessmentIllustration('situational-test', 'desktop')

/** How each question went on this attempt; null where there was nothing to mark. */
export type QuestionResults = (boolean | null)[]

/** Share of the marked questions answered right, 0-100. */
export function scoreOf(results: QuestionResults): number {
  const marked = results.filter((r) => r !== null)
  if (marked.length === 0) return 100
  return Math.round((marked.filter(Boolean).length / marked.length) * 100)
}

/* Success for 100%, warning between 1% and 99%, danger only for 0% (Figma callout
   17024:84947). */
const toneOf = (score: number) => (score >= 100 ? 'success' : score <= 0 ? 'danger' : 'warning')

const SIZE = 160
const STROKE = 5
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Score ring (Course feed Figma 17024:79492): the arc runs clockwise from 12 o'clock. */
export function ScoreRing({ score }: { score: number }) {
  return (
    <div className={`st-res__ring st-res__ring--${toneOf(score)}`} role="img" aria-label={`Score ${score}%`}>
      <span className="st-res__disc" aria-hidden="true" />
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        <circle
          className="st-res__arc"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - score / 100)}
        />
      </svg>
      <span className="st-res__score" aria-hidden="true">
        <span className="st-res__scorelabel">Score</span>
        <span className="st-res__scorevalue">{score}%</span>
      </span>
    </div>
  )
}

interface ResultsProps {
  score: number
  /** Attempts still to use. With none, or a full score, there is nothing to retake. */
  attemptsLeft: number
  variant: 'web' | 'mobile'
  onReview: () => void
  onRetake: () => void
  onContinue: () => void
}

/**
 * Situational test results (Course feed Figma 17024:79480 web, 17024:75451 mobile): the
 * score, Review Answers, the attempts left, then Retake and Continue. On mobile the
 * actions sit at the foot of the screen, under the card.
 */
export function SituationalResults({ score, attemptsLeft, variant, onReview, onRetake, onContinue }: ResultsProps) {
  const canRetake = attemptsLeft > 0 && score < 100
  const size = variant === 'mobile' ? 'lg' : 'md'
  const actions = (
    <div className="st-res__actions">
      {canRetake ? (
        <Button variant="outlined" size={size} onClick={onRetake}>
          {variant === 'mobile' ? 'Retake Situational Test' : 'Retake Test'}
        </Button>
      ) : null}
      <Button size={size} onClick={onContinue}>
        Continue
      </Button>
    </div>
  )
  return (
    <div className={`st-res st-res--${variant}`}>
      <div className="st-res__card">
        <div className="st-res__head">
          <img src={illustration} width={32} height={32} alt="" />
          <h2 className="st-res__title">Situational test results</h2>
        </div>
        <div className="st-res__scoreblock">
          <ScoreRing score={score} />
          <button type="button" className="st-res__review" onClick={onReview}>
            Review Answers
          </button>
          {canRetake ? (
            <div className="st-res__attempts">
              <span className="st-res__hearts" aria-hidden="true">
                {Array.from({ length: attemptsLeft }).map((_, i) => (
                  <img key={i} src={heartFilled} width={20} height={20} alt="" />
                ))}
              </span>
              <span>
                {attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining
              </span>
            </div>
          ) : null}
        </div>
        {variant === 'web' ? actions : null}
      </div>
      {variant === 'mobile' ? actions : null}
    </div>
  )
}

interface ReviewProps {
  questions: SituationalQuestion[]
  results: QuestionResults
  variant: 'web' | 'mobile'
}

/**
 * Review answers (Course feed Figma 17024:80030 web drawer, 17024:76047 mobile): each
 * question with whether it was answered right. Web opens with the correct and incorrect
 * shares; the answers themselves are not shown.
 */
export function ReviewAnswers({ questions, results, variant }: ReviewProps) {
  const score = scoreOf(results)
  return (
    <div className={`st-review st-review--${variant}`}>
      {variant === 'web' ? (
        <div className="st-review__insights">
          <div className="st-review__insight">
            <TickCircle size={40} color="var(--success-500)" variant="Linear" />
            <div>
              <p className="st-review__insightlabel">Correct</p>
              <p className="st-review__insightvalue">{score}%</p>
            </div>
          </div>
          <div className="st-review__insight">
            <CloseCircle size={40} color="var(--danger-400)" variant="Linear" />
            <div>
              <p className="st-review__insightlabel">Incorrect</p>
              <p className="st-review__insightvalue">{100 - score}%</p>
            </div>
          </div>
        </div>
      ) : null}
      <ol className="st-review__list">
        {questions.map((question, i) => {
          const right = results[i] === true
          return (
            <li key={question.id} className="st-review__row">
              <div className="st-review__rowtext">
                <span className="st-review__count">
                  Question {i + 1}/{questions.length}
                </span>
                <span className="st-review__question">{question.text}</span>
              </div>
              <span className="st-review__mark" role="img" aria-label={right ? 'Correct' : 'Incorrect'}>
                {right ? (
                  <TickCircle size={24} color="var(--success-500)" variant="Bold" />
                ) : (
                  <CloseCircle size={24} color="var(--danger-400)" variant="Bold" />
                )}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** The copy and artwork of the "Don't give up!" confirmation (17024:82745, 17024:76172). */
export const LEAVE_TITLE = "Don't give up!"
export const LEAVE_BODY = 'Every question gets you one step closer to mastery.'
export const leaveIllustration = illustration
