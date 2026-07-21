import { useMemo, useState } from 'react'
import type { SequencingQuestion, FormatKey } from '../quizData'
import { shuffle } from '../quizData'
import FeedbackFooter from '../components/FeedbackFooter'
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

  return (
    <div className="ql-screen">
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__q">{question.prompt}</span>
        </div>

        <div className="ql-seq__answer">
          {order.length === 0 ? (
            <p className="ql-seq__hint">Tap a step below to add it here</p>
          ) : (
            order.map((stepIndex, pos) => (
              <div key={pos} className="ql-seq__slot">
                <span className="ql-seq__index">{pos + 1}</span>
                <button
                  type="button"
                  className={placedClass(pos)}
                  disabled={status !== 'idle'}
                  onClick={() => removeAt(pos)}
                >
                  {question.steps[stepIndex]}
                </button>
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
      </div>

      <div className="ql-sr-only" role="status" aria-live="polite">
        {announce}
      </div>

      <FeedbackFooter
        status={status}
        checkDisabled={!complete}
        onCheck={check}
        onContinue={reset}
        title={status === 'correct' ? 'Correct order!' : 'Not the right order'}
        detail={status === 'correct' ? question.explanation : 'Give it another go.'}
      />
    </div>
  )
}

export default Sequencing
