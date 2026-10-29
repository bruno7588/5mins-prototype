import { useState } from 'react'
import { ArrowLeft2, ArrowRight2, ArrowDown2, CloseCircle, TickCircle } from 'iconsax-react'
import Avatar from '@/components/Avatar/Avatar'
import Badge from '@/components/Badge/Badge'
import Collapse from '@/components/Collapse/Collapse'
import type { ChoiceResponse, GradedAssessment } from './assessmentResults'
/* The same row-card as the scenario and lesson quiz answers, so every format whose
   answer is several parts opens the same way. */
import './LearnerList.css'
import './MultiQuestionAnswers.css'

/**
 * Select all that apply, read down the learners: the row states whether they got the
 * exact set, and opens onto every option they ticked, each marked right or wrong.
 */
interface Props {
  assessment: GradedAssessment
  responses: ChoiceResponse[]
  pagination?: {
    from: number
    to: number
    total: number
    onPrev?: () => void
    onNext?: () => void
  }
}

function SelectAllAnswers({ assessment: a, responses, pagination }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="lrn">
      <div className="lrn-head">
        <span className="lrn-c-learner">Learner</span>
        <span>Result</span>
        <span className="lrn-c-expand" aria-hidden="true" />
      </div>

      <ul className="lrn-list">
        {responses.map((r) => {
          const isOpen = open.has(r.learner.id)
          return (
            <li key={r.learner.id} className={`lrn-card${isOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="lrn-row"
                aria-expanded={isOpen}
                onClick={() => toggle(r.learner.id)}
              >
                <span className="lrn-cell lrn-c-learner">
                  <Avatar src={r.learner.avatar} size={40} />
                  <span className="lrn-person">
                    <span className="lrn-name">{r.learner.name}</span>
                    <span className="lrn-role">{r.learner.role}</span>
                  </span>
                </span>

                <span className="lrn-cell">
                  {r.correct ? <Badge type="success" label="Correct" /> : <Badge type="error" label="Incorrect" />}
                </span>

                <span className="lrn-cell lrn-c-expand lrn-chevron" aria-hidden="true">
                  <ArrowDown2 size={20} color="var(--text-tertiary)" variant="Linear" />
                </span>
              </button>

              <Collapse open={isOpen}>
                <div className="lrn-detail">
                  <ul className="lrn-answers mqa-answers">
                    {(r.picks ?? [r.optionIndex]).map((p) => (
                      <li key={p} className="lrn-answer">
                        <span className="lrn-answer__v">
                          {a.correctIndices?.includes(p) ? (
                            <TickCircle size={20} color="var(--success-500)" variant="Bold" aria-label="Correct" />
                          ) : (
                            <CloseCircle size={20} color="var(--danger-500)" variant="Bold" aria-label="Incorrect" />
                          )}
                        </span>
                        <span className="lrn-answer__body">
                          <span className="lrn-answer__a">{a.options[p]}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Collapse>
            </li>
          )
        })}
      </ul>

      {/* The DS table's own footer, as MultiQuestionAnswers restates it. */}
      {pagination && (pagination.from > 1 || pagination.to < pagination.total) ? (
        <div className="lrn-pagination">
          <span className="lrn-count">
            {pagination.from}-{pagination.to} of {pagination.total}
          </span>
          <button
            type="button"
            className="lrn-nav"
            aria-label="Previous page"
            aria-disabled={pagination.from <= 1}
            onClick={pagination.from <= 1 ? undefined : pagination.onPrev}
          >
            <ArrowLeft2 size={16} color="currentColor" variant="Linear" />
          </button>
          <button
            type="button"
            className="lrn-nav"
            aria-label="Next page"
            aria-disabled={pagination.to >= pagination.total}
            onClick={pagination.to >= pagination.total ? undefined : pagination.onNext}
          >
            <ArrowRight2 size={16} color="currentColor" variant="Linear" />
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default SelectAllAnswers
