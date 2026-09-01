import { useState } from 'react'
import { ArrowDown2, CloseCircle, TickCircle } from 'iconsax-react'
import Collapse from '@/components/Collapse/Collapse'
import { situationalScore, type SituationalAssessment } from './assessmentResults'
/* The By Learner pivot is this same shape one level up — learner rows that open onto
   their answers — so the row-card chrome is borrowed rather than restated. */
import './LearnerList.css'
import './SituationalAnswers.css'

/** Below this, a run through the scenario is worth an admin's attention. */
const WEAK_SCORE = 60

/**
 * One situational test, read down the learners. A scenario is answered over a dozen
 * questions, so the row states how the learner did across it and opens onto every
 * question they answered — the format has no single answer to put in a cell.
 */
function SituationalAnswers({ assessment: a }: { assessment: SituationalAssessment }) {
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
        {a.responses.map((r) => {
          const isOpen = open.has(r.learner.id)
          const score = situationalScore(a, r)
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

                <span className="lrn-cell lrn-c-score">
                  <span className="lrn-bar" aria-hidden="true">
                    <span
                      className={`lrn-bar__fill${pct < WEAK_SCORE ? ' lrn-bar__fill--weak' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="lrn-pct">
                    {score} of {a.questions.length} correct
                  </span>
                </span>

                <span className="lrn-cell lrn-c-expand lrn-chevron" aria-hidden="true">
                  <ArrowDown2 size={20} color="var(--text-tertiary)" variant="Linear" />
                </span>
              </button>

              <Collapse open={isOpen}>
                <div className="lrn-detail">
                  <ul className="lrn-answers sit-answers">
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
                              <span className="sit-right">
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
    </div>
  )
}

export default SituationalAnswers
