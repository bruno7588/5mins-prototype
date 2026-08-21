import type { FeedbackStatus } from './FeedbackFooter'

/**
 * Result message shown below the options once a quiz is graded (DS "Well done!"
 * pattern, Figma 10160:7182) — emoji + heading, no fill.
 *
 * Formats that carry a written explanation pass it here (multiple choice, Figma
 * 9051:1199 / 1315): it sits under the heading in body copy, so the reason arrives in
 * the same place the verdict does.
 */
function ResultBanner({
  status,
  explanation,
}: {
  status: FeedbackStatus
  explanation?: string
}) {
  if (status === 'idle') return null
  const correct = status === 'correct'
  return (
    <div className="ql-result-group">
      <div className={`ql-result ql-result--${status}`} role="status">
        <span className="ql-result__emoji" aria-hidden="true">
          {correct ? '👏' : '🙂'}
        </span>
        <span className="ql-result__title">{correct ? 'Well done!' : 'Not quite!'}</span>
      </div>
      {explanation && <p className="ql-result__explanation">{explanation}</p>}
    </div>
  )
}

export default ResultBanner
