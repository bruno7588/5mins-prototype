import Button from '@/components/Button/Button'
import { getProgressIllustration } from '@/assets/progress-illustrations'
import heartFilled from '@/assets/quiz-hearts/heart-filled.svg'
import type { QuestionResults } from '@/components/SituationalTestPlayer/SituationalResults'
import './LessonQuizResult.css'

interface Props {
  results: QuestionResults
  /** Points the quiz is worth; earned only when every question is right. */
  points: number
  attemptsLeft: number
  variant: 'web' | 'mobile'
  onRetake: () => void
  onContinue: () => void
}

/**
 * End of a lesson quiz (Course feed Figma 17024:79770 web, 17024:84272 mobile): the
 * points earned, how it went, then Continue. While attempts remain and something was
 * missed, the hearts and Retake Quiz show too (17024:85058, 17024:83993).
 */
function LessonQuizResult({ results, points, attemptsLeft, variant, onRetake, onContinue }: Props) {
  const total = results.length
  const right = results.filter(Boolean).length
  const all = right === total
  const none = right === 0
  const canRetake = !all && attemptsLeft > 0
  const size = variant === 'mobile' ? 'lg' : 'md'

  return (
    <div className={`lqr lqr--${variant}`}>
      <div className="lqr__body">
        <img src={getProgressIllustration(all ? 'passed' : 'nearly-there')} width={96} height={96} alt="" />
        <p className={`lqr__points${all ? '' : ' lqr__points--none'}`}>{all ? points : 0} pts</p>
        <div className="lqr__text">
          <h2 className="lqr__title">{all ? 'Well done!' : none ? 'Not quite!' : 'Nearly there!'}</h2>
          <p className="lqr__copy">
            {all ? (
              <>
                You answered all questions <strong className="lqr__good">correctly</strong>
              </>
            ) : none ? (
              <>
                You answered all questions <strong className="lqr__bad">incorrectly</strong>
              </>
            ) : (
              `You answered ${right}/${total} questions correctly`
            )}
          </p>
        </div>
        {canRetake ? (
          <div className="lqr__attempts">
            <span className="lqr__hearts" aria-hidden="true">
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
      <div className="lqr__actions">
        {canRetake ? (
          <Button variant="outlined" size={size} onClick={onRetake}>
            Retake Quiz
          </Button>
        ) : null}
        <Button size={size} onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  )
}

export default LessonQuizResult
