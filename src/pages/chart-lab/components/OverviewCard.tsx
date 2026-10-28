import { type CSSProperties } from 'react'
import { ASSESSMENT, band, type ChartQuestion } from '../chartLabData'

/**
 * The whole assessment at a glance: average % correct on the left, one column per
 * question on the right, coloured by score band. Unscored questions (poll, short
 * text) keep their slot as a dashed outline so the numbering still lines up.
 * Clicking a column scrolls to that question's card.
 */
function OverviewCard({ questions }: { questions: ChartQuestion[] }) {
  const scores = questions.flatMap((q) => ('score' in q ? [q.score] : []))
  const average = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)

  const jump = (id: string) =>
    document.getElementById(`cl-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  return (
    <section className="cl-overview" aria-label="Assessment overview">
      <div className="cl-overview__summary">
        <div className="cl-overview__lead">
          <h3 className="cl-overview__title">{ASSESSMENT.title}</h3>
          <span className={`cl-overview__figure is-${band(average)}`}>{average}%</span>
          <span className="cl-overview__caption">
            average correct across {scores.length} scored questions
          </span>
        </div>
        <dl className="cl-overview__stats">
          <div>
            <dt>Learners</dt>
            <dd>{ASSESSMENT.learners}</dd>
          </div>
          <div>
            <dt>Passed</dt>
            <dd>{ASSESSMENT.passed}%</dd>
          </div>
        </dl>
      </div>

      <ol className="cl-cols">
        {questions.map((q, i) => {
          const score = 'score' in q ? q.score : null
          return (
            <li key={q.id} className="cl-col">
              <button
                type="button"
                className="cl-col__hit"
                onClick={() => jump(q.id)}
                aria-label={`Q${q.number}, ${q.type}: ${score === null ? 'not scored' : `${score}% correct`}`}
              >
                <span className={`cl-col__value${score === null ? ' is-muted' : ` is-${band(score)}`}`}>
                  {score === null ? 'Not scored' : `${score}%`}
                </span>
                <span className={`cl-col__area${score === null ? ' is-unscored' : ''}`}>
                  {score !== null && (
                    <span
                      className={`cl-col__bar is-${band(score)}`}
                      style={{ '--cl-h': `${score}%`, '--cl-i': i } as CSSProperties}
                    />
                  )}
                </span>
                <span className="cl-col__tick">
                  <span className="cl-col__number">Q{q.number}</span>
                  <span className="cl-col__type">{q.short}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export default OverviewCard
