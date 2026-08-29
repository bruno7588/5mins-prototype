import Button from '@/components/Button/Button'
import { typeLabel } from '@/data/aiAssessmentGeneration'
import { assessmentTypeIcon } from '../assessmentTypeIcons'
import type { AssessmentResult } from './assessmentResults'
import './AssessmentList.css'

interface Props {
  rows: AssessmentResult[]
  resultCell: (a: AssessmentResult) => React.ReactNode
  onView: (a: AssessmentResult) => void
  pagination: { from: number; to: number; total: number; onPrev?: () => void; onNext?: () => void }
}

/** Assessments as rows; the answers open in a drawer rather than in place. */
function AssessmentList({ rows, resultCell, onView, pagination }: Props) {
  return (
    <div className="asl">
      <div className="asl-head">
        <span className="asl-c-title">Assessment</span>
        <span className="asl-c-type">Type</span>
        <span className="asl-c-responses">Responses</span>
        <span className="asl-c-result">Result</span>
        <span className="asl-c-action" aria-hidden="true" />
      </div>

      <ul className="asl-list">
        {rows.map((a) => (
          <li key={a.id} className="asl-card">
            <div className="asl-row">
              <span className="asl-cell asl-c-title">
                <span className="asl-title">{a.title}</span>
              </span>
              <span className="asl-cell asl-c-type">
                {assessmentTypeIcon(a.type, { size: 20 })}
                {typeLabel(a.type)}
              </span>
              <span className="asl-cell asl-c-responses">
                <span className="asl-n">{a.responses.length}</span>
                <span className="asl-of">of {a.enrolled}</span>
              </span>
              <span className="asl-cell asl-c-result">{resultCell(a)}</span>
              <span className="asl-cell asl-c-action">
                <Button variant="outlined-2" size="sm" onClick={() => onView(a)}>
                  View Answers
                </Button>
              </span>
            </div>
          </li>
        ))}
      </ul>

      {pagination.from > 1 || pagination.to < pagination.total ? (
        <div className="asl-pagination">
          <span className="asl-count">
            {pagination.from}-{pagination.to} of {pagination.total}
          </span>
          <button
            type="button"
            className="asl-nav"
            aria-label="Previous page"
            aria-disabled={pagination.from <= 1}
            onClick={pagination.from <= 1 ? undefined : pagination.onPrev}
          >
            ‹
          </button>
          <button
            type="button"
            className="asl-nav"
            aria-label="Next page"
            aria-disabled={pagination.to >= pagination.total}
            onClick={pagination.to >= pagination.total ? undefined : pagination.onNext}
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default AssessmentList
