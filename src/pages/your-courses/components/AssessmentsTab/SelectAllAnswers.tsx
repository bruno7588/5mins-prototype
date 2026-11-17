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
 * Image options (DES-345) show the image with its label beside it, when it has one.
 * Right answers the learner did not tick are listed too, each marked Missed.
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

  const correct = a.correctIndices ?? [a.correctIndex]
  /* The label names the image, so the image itself is decorative. One with no label
     is "Image N", as the overview above names it. */
  const option = (p: number) => (
    <>
      {a.optionImages ? <img className="lrn-answer__img" src={a.optionImages[p]} alt="" /> : null}
      <span className="lrn-answer__body">
        <span className="lrn-answer__a">{a.options[p] || `Image ${p + 1}`}</span>
      </span>
    </>
  )

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
          const picks = r.picks ?? [r.optionIndex]
          /* What they picked and the right answers they missed, in the options' own
             order, so the rows read in the same order as the chart above. */
          const shown = a.options.map((_, i) => i).filter((i) => picks.includes(i) || correct.includes(i))
          return (
            <li key={r.learner.id} className={`lrn-card${isOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="lrn-row"
                aria-expanded={isOpen}
                onClick={() => toggle(r.learner.id)}
              >
                <span className="lrn-cell lrn-c-learner">
                  <Avatar name={r.learner.name} src={r.learner.avatar} size={40} />
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
                  <ul className="lrn-answers lrn-answers--options mqa-answers">
                    {/* Only the exact set scores, so a right answer left unticked is why a
                        learner with nothing but ticks is still Incorrect. Each one is named. */}
                    {shown.map((p) =>
                      picks.includes(p) ? (
                        <li key={p} className="lrn-answer">
                          <span className="lrn-answer__v">
                            {correct.includes(p) ? (
                              <TickCircle size={20} color="var(--success-500)" variant="Bold" aria-label="Correct" />
                            ) : (
                              <CloseCircle size={20} color="var(--danger-500)" variant="Bold" aria-label="Incorrect" />
                            )}
                          </span>
                          {option(p)}
                        </li>
                      ) : (
                        <li key={p} className="lrn-answer lrn-answer--missed">
                          {/* The badge beside the label says it; the empty dashed circle only
                              holds the tick's place. */}
                          <span className="lrn-answer__v" aria-hidden="true">
                            <span className="lrn-answer__unticked" />
                          </span>
                          {option(p)}
                          <Badge type="informative" label="Missed" />
                        </li>
                      ),
                    )}
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
