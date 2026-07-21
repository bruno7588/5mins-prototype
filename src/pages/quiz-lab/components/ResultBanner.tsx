import type { FeedbackStatus } from './FeedbackFooter'

/**
 * Result message shown below the options once a quiz is graded (DS "Well done!"
 * pattern, Figma 10160:7182) — emoji + heading, no fill, no explanation.
 */
function ResultBanner({ status }: { status: FeedbackStatus }) {
  if (status === 'idle') return null
  const correct = status === 'correct'
  return (
    <div className={`ql-result ql-result--${status}`} role="status">
      <span className="ql-result__emoji" aria-hidden="true">
        {correct ? '👏' : '🙂'}
      </span>
      <span className="ql-result__title">{correct ? 'Well done!' : 'Not quite!'}</span>
    </div>
  )
}

export default ResultBanner
