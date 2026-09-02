import { useEffect, useState } from 'react'
import { ArrowLeft2, ArrowRight2, ArrowDown2 } from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import Collapse from '@/components/Collapse/Collapse'
import { typeLabel } from '@/data/aiAssessmentGeneration'
import { prefersReducedMotion } from '@/components/AIWorkingCard/useTyped'
import { answerScore, courseAssessments, PASS_SCORE, type LearnerRow } from './assessmentResults'
import './LearnerList.css'

interface Props {
  rows: LearnerRow[]
  pagination: { from: number; to: number; total: number; onPrev?: () => void; onNext?: () => void }
  /** A learner to open and scroll to — sent by the Insights card when a name is
   *  clicked. Carries a nonce so clicking the same name twice still arrives. */
  focus?: { id: string; n: number } | null
}

/**
 * Learners as expandable rows, following the Audit Log pattern: the whole row is
 * the toggle, a chevron sits at the far right, and the detail opens in place. The
 * shared Table component has no slot for expanded content, so this is hand-rolled
 * on the same grid the header uses.
 */
function LearnerList({ rows, pagination, focus }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set())

  /* Arriving from a name in the Insights card: open that row and bring it into view.
     Without the scroll the pivot switches and the row expands somewhere below the fold,
     which reads as the click having done nothing. */
  useEffect(() => {
    if (!focus) return
    setOpen((prev) => new Set(prev).add(focus.id))
    const el = document.getElementById(`lrn-${focus.id}`)
    el?.scrollIntoView({
      block: 'center',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }, [focus])

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
          /* Keyed so the detail can list every assessment in the course, not only the
             ones this learner reached — a gap is a finding, and leaving it out of the
             list turned it into a footnote nobody read. */
          const byId = new Map(r.answers.map((x) => [x.assessment.id, x]))
          return (
            <li
              key={r.learner.id}
              id={`lrn-${r.learner.id}`}
              className={`lrn-card${isOpen ? ' is-open' : ''}`}
            >
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
                    <span className="lrn-pct">{r.pct}%</span>
                  )}
                </span>

                <span className="lrn-cell lrn-c-expand lrn-chevron" aria-hidden="true">
                  <ArrowDown2 size={20} color="var(--text-tertiary)" variant="Linear" />
                </span>
              </button>

              <Collapse open={isOpen}>
                <div className="lrn-detail">
                  <ul className="lrn-answers lrn-answers--row">
                    {courseAssessments.map((a) => {
                      const x = byId.get(a.id)
                      const score = x ? answerScore(x) : null
                      return (
                        <li key={a.id} className="lrn-answer">
                          <span className="lrn-answer__body">
                            <span className="lrn-answer__name">{a.title}</span>
                            <span className="lrn-answer__type">
                              {a.lesson ? 'Lesson Quiz' : typeLabel(a.type)}
                            </span>
                          </span>
                          {/* Marked only where there is something to do about it: a badge
                              on every row is not a signal, it is a restyled column. A pass
                              is plain text, a fail and a gap are not — so a learner who is
                              fine shows one mark or none, and a learner who is not lights
                              the whole card up.

                              A percentage only where one can be counted. A poll has no right
                              answer and neither short text nor an exercise is marked, so those
                              say what is true — that it was answered — rather than wearing a
                              score the data cannot support, in either direction. */}
                          <span className="lrn-answer__score">
                            {!x ? (
                              <Badge type="warning" label="Not attempted" />
                            ) : score === null ? (
                              'Answered'
                            ) : score < PASS_SCORE ? (
                              /* No icon: the label is a percentage, and a mark beside a
                                 number reads as part of it. The fill already says which
                                 of the two states this is. */
                              <Badge type="error" label={`${score}%`} />
                            ) : (
                              `${score}%`
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

export default LearnerList
