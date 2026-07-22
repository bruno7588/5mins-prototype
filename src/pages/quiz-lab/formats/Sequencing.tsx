import { useMemo, useState } from 'react'
import type { SequencingQuestion, FormatKey } from '../quizData'
import { shuffle } from '../quizData'
import FeedbackFooter from '../components/FeedbackFooter'
import ResultBanner from '../components/ResultBanner'
import type { FeedbackStatus } from '../components/FeedbackFooter'
import { cue } from '../quizSound'

/**
 * Sorting / Sequencing (PRD FR3) — tap tokens in order to assemble the answer.
 * Steps are stored in correct order; the bank is shuffled. Tap a bank step to
 * append it to the answer, tap a placed step to return it. Position-based grading.
 */
function Sequencing({ question }: { question: SequencingQuestion; formatKey: FormatKey }) {
  const total = question.steps.length
  const [attempt, setAttempt] = useState(0)
  const bankOrder = useMemo(() => shuffle(question.steps.map((_, i) => i)), [question, attempt])

  // `order` holds placed step indices in the sequence the learner tapped.
  const [order, setOrder] = useState<number[]>([])
  const [status, setStatus] = useState<FeedbackStatus>('idle')
  const [announce, setAnnounce] = useState('')

  const remaining = bankOrder.filter((i) => !order.includes(i))
  const complete = order.length === total
  const slotCorrect = (pos: number) => order[pos] === pos

  function place(stepIndex: number) {
    if (status !== 'idle') return
    setOrder((o) => [...o, stepIndex])
    setAnnounce(`Added ${question.steps[stepIndex]} as step ${order.length + 1}`)
    cue('place')
  }

  function removeAt(pos: number) {
    if (status !== 'idle') return
    setOrder((o) => o.filter((_, idx) => idx !== pos))
    setAnnounce(`Removed step ${pos + 1}`)
    cue('remove')
  }

  function check() {
    const allCorrect = order.every((_, pos) => slotCorrect(pos))
    setStatus(allCorrect ? 'correct' : 'incorrect')
    setAnnounce(allCorrect ? 'Correct order' : 'Order is not quite right')
    cue(allCorrect ? 'correct' : 'incorrect')
  }

  function reset() {
    setOrder([])
    setStatus('idle')
    setAnnounce('')
    setAttempt((a) => a + 1)
    cue('continue')
  }

  const placedClass = (pos: number) => {
    const classes = ['ql-token', 'ql-token--block']
    if (status !== 'idle') classes.push(slotCorrect(pos) ? 'ql-token--correct' : 'ql-token--incorrect')
    else classes.push('ql-token--selected')
    return classes.join(' ')
  }

  const indexClass = (pos: number) => {
    const classes = ['ql-seq__index']
    if (status !== 'idle') classes.push(slotCorrect(pos) ? 'ql-seq__index--correct' : 'ql-seq__index--incorrect')
    return classes.join(' ')
  }

  return (
    <div className="ql-screen">
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__q">{question.prompt}</span>
        </div>

        <div className="ql-seq__answer">
          {order.length === 0 ? (
            <p className="ql-seq__hint">Tap the steps below in the correct order</p>
          ) : (
            order.map((stepIndex, pos) => (
              <div key={pos} className="ql-seq__slot">
                <span className={indexClass(pos)}>{pos + 1}</span>
                <div className={placedClass(pos)}>
                  {question.steps[stepIndex]}
                  {status === 'idle' && (
                    <button
                      type="button"
                      className="ql-seq__remove"
                      aria-label={`Remove step ${pos + 1}`}
                      onClick={() => removeAt(pos)}
                    >
                      <svg width="20" height="20" viewBox="0 0 21 21" fill="none" aria-hidden="true">
                        <path
                          d="M15.0938 15.0938L5.90625 5.90625M15.0938 5.90625L5.90625 15.0938"
                          stroke="currentColor"
                          strokeWidth="1.3125"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {remaining.length > 0 && status === 'idle' && (
          <div className="ql-seq__bank">
            {remaining.map((stepIndex) => (
              <button
                key={stepIndex}
                type="button"
                className="ql-token ql-token--block"
                onClick={() => place(stepIndex)}
              >
                {question.steps[stepIndex]}
              </button>
            ))}
          </div>
        )}
        <ResultBanner status={status} />
      </div>

      <div className="ql-sr-only" role="status" aria-live="polite">
        {announce}
      </div>

      <FeedbackFooter
        status={status}
        checkDisabled={!complete}
        onCheck={check}
        onContinue={reset}
      />
    </div>
  )
}

export default Sequencing
