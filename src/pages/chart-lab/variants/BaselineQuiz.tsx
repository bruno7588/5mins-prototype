import AnswerStats from '@/pages/your-courses/components/AssessmentsTab/AnswerStats'
import type { MultiAssessment } from '@/pages/your-courses/components/AssessmentsTab/assessmentResults'

/** A — the chart exactly as it ships today, rendered from the real component so the
 *  baseline can never drift from what the Assessments tab actually shows. */
function BaselineQuiz({ quiz }: { quiz: MultiAssessment }) {
  return <AnswerStats assessment={quiz} />
}

export default BaselineQuiz
