import {
  questionTally,
  type MultiAssessment,
} from '@/pages/your-courses/components/AssessmentsTab/assessmentResults'

const pct = (n: number, of: number) => Math.round((n / of) * 100)

/** C — overview first: one "correct" bar per question, in the order they were asked.
 *  The whole quiz's shape reads in three rows; the option breakdown (the baseline bars)
 *  would open on click. Trades the per-option detail for a scannable at-a-glance read. */
function Scoreboard({ quiz }: { quiz: MultiAssessment }) {
  const responded = quiz.responses.length
  const tally = questionTally(quiz)
  return (
    <ol className="cl-score">
      {quiz.questions.map((q, qi) => {
        const p = pct(tally[qi], responded)
        return (
          <li key={qi} className="cl-score__row">
            <span className="cl-score__num">Q{qi + 1}</span>
            <span className="cl-score__body">
              <span className="cl-score__prompt">{q.prompt}</span>
              <span className="cl-score__track">
                <span
                  className="cl-score__fill"
                  style={{ '--cl-w': `${p}%`, '--cl-i': qi } as React.CSSProperties}
                  aria-hidden="true"
                />
              </span>
            </span>
            <span className="cl-score__pct">{p}%</span>
          </li>
        )
      })}
    </ol>
  )
}

export default Scoreboard
