import { useState } from 'react'
import { ArrowDown, ArrowLeft2, ArrowRight2, ArrowDown2, CloseCircle, TickCircle } from 'iconsax-react'
import Collapse from '@/components/Collapse/Collapse'
import { multiScore, type MultiAssessment, type MultiResponse } from './assessmentResults'
/* The By Learner pivot is this same shape one level up — learner rows that open onto
   their answers — so the row-card chrome is borrowed rather than restated. */
import './LearnerList.css'
import './MultiQuestionAnswers.css'

/**
 * One multi-question assessment, read down the learners — a situational test running a
 * scenario, or a lesson quiz of two or three checks. The row states how the learner did
 * across it and opens onto every question they answered: several questions have no
 * single answer to put in a cell.
 */
interface Props {
  assessment: MultiAssessment
  /** The rows to draw. Defaults to every response — a caller that pages passes a slice. */
  responses?: MultiResponse[]
  /** Which way the score column is ordered, and how to turn it. The page owns this:
   *  sorting the ten rows it handed down would order a page rather than a cohort. */
  sort?: 'none' | 'asc' | 'desc'
  onToggleSort?: () => void
  /** Same footer the DS table draws, since this list is not one. */
  pagination?: {
    from: number
    to: number
    total: number
    onPrev?: () => void
    onNext?: () => void
  }
}

function MultiQuestionAnswers({ assessment: a, responses, sort = 'none', onToggleSort, pagination }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set())
  const rows = responses ?? a.responses

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
        <button
          type="button"
          className="lrn-sort"
          onClick={onToggleSort}
          aria-label={`Sort by score, ${sort === 'asc' ? 'highest first' : 'lowest first'}`}
        >
          Score
          {/* One arrow, turned — the way every other sortable header in the app draws it.
              Hidden until the header is hovered or the column is actually ordered: an
              arrow on an unsorted column claims an order that is not there. */}
          <ArrowDown
            size={16}
            color="currentColor"
            variant="Linear"
            className={`lrn-sort__icon${sort !== 'none' ? ' is-active' : ''}${
              sort === 'asc' ? ' is-asc' : ''
            }`}
          />
        </button>
        <span className="lrn-c-expand" aria-hidden="true" />
      </div>

      <ul className="lrn-list">
        {rows.map((r) => {
          const isOpen = open.has(r.learner.id)
          const score = multiScore(a, r)
          const pct = Math.round((score / a.questions.length) * 100)
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

                {/* The same figure the By Learner pivot shows, drawn the same way: a
                    percentage on its own. The bar beside it was redrawing what the
                    number already said, and which questions they missed is one row
                    below, ticked and crossed. */}
                <span className="lrn-cell lrn-c-score">
                  <span className="lrn-pct">{pct}%</span>
                </span>

                <span className="lrn-cell lrn-c-expand lrn-chevron" aria-hidden="true">
                  <ArrowDown2 size={20} color="var(--text-tertiary)" variant="Linear" />
                </span>
              </button>

              <Collapse open={isOpen}>
                <div className="lrn-detail">
                  <ul className="lrn-answers mqa-answers">
                    {a.questions.map((q, qi) => {
                      const right = r.picks[qi] === q.correctIndex
                      return (
                        <li key={qi} className="lrn-answer">
                          <span className="lrn-answer__v">
                            {right ? (
                              <TickCircle size={20} color="var(--success-500)" variant="Bold" aria-label="Correct" />
                            ) : (
                              <CloseCircle size={20} color="var(--danger-500)" variant="Bold" aria-label="Incorrect" />
                            )}
                          </span>
                          <span className="lrn-answer__body">
                            <span className="lrn-answer__title">
                              {qi + 1}. {q.prompt}
                            </span>
                            <span className="lrn-answer__a">{q.options[r.picks[qi]]}</span>
                            {/* Only where they missed it — on a right answer this is
                                the line directly above. */}
                            {right ? null : (
                              <span className="mqa-right">
                                Correct answer: {q.options[q.correctIndex]}
                              </span>
                            )}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </Collapse>
            </li>
          )
        })}
      </ul>

      {/* The DS table's own footer, restated because this list is not a table. Hidden on
          a single page, where it would be a count of the rows already visible beside two
          arrows that can never fire. */}
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

export default MultiQuestionAnswers
