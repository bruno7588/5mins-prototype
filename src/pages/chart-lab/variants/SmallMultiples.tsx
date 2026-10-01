import { AnswerBars } from '@/pages/your-courses/components/AssessmentsTab/AnswerStats'
import {
  questionOptionTally,
  type MultiAssessment,
} from '@/pages/your-courses/components/AssessmentsTab/assessmentResults'

/** B — every question's option breakdown stacked at once, no chip to click between
 *  them. The rows are the real `AnswerBars` mark, so the only thing being tested here is
 *  the information architecture: see the whole quiz vs. one question at a time. */
function SmallMultiples({ quiz }: { quiz: MultiAssessment }) {
  const responded = quiz.responses.length
  return (
    <div className="cl-sm">
      {quiz.questions.map((q, qi) => (
        <div key={qi} className="cl-sm__q">
          <p className="cl-sm__prompt">
            <span className="cl-sm__num">Q{qi + 1}</span>
            {q.prompt}
          </p>
          <AnswerBars
            options={q.options}
            correctIndex={q.correctIndex}
            tally={questionOptionTally(quiz, qi)}
            responded={responded}
          />
        </div>
      ))}
    </div>
  )
}

export default SmallMultiples
