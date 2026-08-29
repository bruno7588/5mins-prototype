import { useState } from 'react'
import { ArrowDown2, CloseCircle, TickCircle } from 'iconsax-react'
import Collapse from '@/components/Collapse/Collapse'
import { courseAssessments, type LearnerRow } from './assessmentResults'
import './LearnerList.css'

const WEAK_SCORE = 60

interface Props {
  rows: LearnerRow[]
  pagination: { from: number; to: number; total: number; onPrev?: () => void; onNext?: () => void }
}

/**
 * Learners as expandable rows, following the Audit Log pattern: the whole row is
 * the toggle, a chevron sits at the far right, and the detail opens in place. The
 * shared Table component has no slot for expanded content, so this is hand-rolled
 * on the same grid the header uses.
 */
function LearnerList({ rows, pagination }: Props) {
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
        <span className="lrn-c-score">Score</span>
        <span className="lrn-c-expand" aria-hidden="true" />
      </div>

      <ul className="lrn-list">
        {rows.map((r) => {
          const isOpen = open.has(r.learner.id)
          const missing = courseAssessments.length - r.answers.length
          return (
            <li key={r.learner.id} className={`lrn-card${isOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="lrn-row"
                aria-expanded={isOpen}
                onClick={() => toggle(r.learner.id)}
              >
                <span className="lrn-cell lrn-c-learner">
                  {r.learner.avatar ? (
                    <img className="lrn-avatar" src={r.learner.avatar} alt="" />
                  ) : (
                    <span className="lrn-avatar lrn-avatar--fallback">{r.learner.initials}</span>
                  )}
                  <span className="lrn-person">
                    <span className="lrn-name">{r.learner.name}</span>
                    <span className="lrn-role">{r.learner.role}</span>
                  </span>
                </span>

                <span className="lrn-cell lrn-c-score">
                  {r.pct === null ? (
                    <span className="lrn-none">Nothing scored</span>
                  ) : (
                    <>
                      <span className="lrn-bar" aria-hidden="true">
                        <span
                          className={`lrn-bar__fill${r.pct < WEAK_SCORE ? ' lrn-bar__fill--weak' : ''}`}
                          style={{ width: `${r.pct}%` }}
                        />
                      </span>
                      <span className="lrn-pct">
                        {r.correct} of {r.scored} correct
                      </span>
                    </>
                  )}
                </span>

                <span className="lrn-cell lrn-c-expand lrn-chevron" aria-hidden="true">
                  <ArrowDown2 size={20} color="var(--text-tertiary)" variant="Linear" />
                </span>
              </button>

              <Collapse open={isOpen}>
                <div className="lrn-detail">
                  <ul className="lrn-answers">
                    {r.answers.map((x) => (
                      <li
                        key={x.assessment.id}
                        className={`lrn-answer${x.correct === null ? '' : x.correct ? ' lrn-answer--right' : ' lrn-answer--wrong'}`}
                      >
                        <span className="lrn-answer__body">
                          <span className="lrn-answer__title">{x.assessment.title}</span>
                          <span className="lrn-answer__a">{x.answer}</span>
                        </span>
                        <span className="lrn-answer__v">
                          {/* Only graded formats carry a verdict; the rest show none. */}
                          {x.correct === null ? null : x.correct ? (
                            <TickCircle size={20} color="var(--success-500)" variant="Bold" aria-label="Correct" />
                          ) : (
                            <CloseCircle size={20} color="var(--danger-500)" variant="Bold" aria-label="Incorrect" />
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {missing > 0 ? (
                    <p className="lrn-none">
                      {missing} assessment{missing === 1 ? '' : 's'} not answered yet.
                    </p>
                  ) : null}
                </div>
              </Collapse>
            </li>
          )
        })}
      </ul>

      {pagination.from > 1 || pagination.to < pagination.total ? (
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
            ‹
          </button>
          <button
            type="button"
            className="lrn-nav"
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

export default LearnerList
