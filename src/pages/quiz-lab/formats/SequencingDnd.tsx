import { useState } from 'react'
import type { SequencingQuestion } from '../quizData'
import { shuffle } from '../quizData'
import FeedbackFooter from '../components/FeedbackFooter'
import ResultBanner from '../components/ResultBanner'
import type { FeedbackStatus } from '../components/FeedbackFooter'
import { cue } from '../quizSound'

/**
 * Sorting / Sequencing — drag-and-drop variant of {@link Sequencing}.
 * All steps start pre-placed in a random order; the learner drags a step (or
 * uses ↑/↓) to reorder the whole list, then checks. Position-based grading —
 * steps are stored in correct order, so slot `pos` is right when it holds step
 * index `pos`. Reorder happens live as you drag over a neighbour (list-sort).
 */

/** Random starting order that is never already the correct sequence. */
function makeStart(question: SequencingQuestion): number[] {
  const ids = question.steps.map((_, i) => i)
  let start = shuffle(ids)
  if (ids.length > 1 && start.every((v, i) => v === i)) start = shuffle(ids)
  return start
}

function SequencingDnd({ question }: { question: SequencingQuestion }) {
  const total = question.steps.length
  // `order` holds step indices in the sequence the learner has arranged.
  const [order, setOrder] = useState<number[]>(() => makeStart(question))
  const [dragging, setDragging] = useState<number | null>(null)
  const [status, setStatus] = useState<FeedbackStatus>('idle')
  const [announce, setAnnounce] = useState('')

  const slotCorrect = (pos: number) => order[pos] === pos

  /** Move the step at `from` to index `to`, returning a new order array. */
  function move(from: number, to: number) {
    if (to < 0 || to >= total || from === to) return
    setOrder((o) => {
      const next = o.slice()
      const [step] = next.splice(from, 1)
      next.splice(to, 0, step)
      return next
    })
  }

  // ── Pointer drag (list-sort: reorder live as the drag crosses a slot) ──────
  function onDragStart(stepIndex: number) {
    if (status !== 'idle') return
    setDragging(stepIndex)
    cue('select')
  }

  function onDragEnter(pos: number) {
    if (dragging === null) return
    const from = order.indexOf(dragging)
    if (from !== pos) {
      move(from, pos)
      cue('place')
    }
  }

  function onDragEnd() {
    setDragging(null)
  }

  // ── Keyboard reorder (↑/↓ moves the focused step) ──────────────────────────
  function onKeyDown(e: React.KeyboardEvent, pos: number) {
    if (status !== 'idle') return
    const to = e.key === 'ArrowUp' ? pos - 1 : e.key === 'ArrowDown' ? pos + 1 : -2
    if (to === -2 || to < 0 || to >= total) return
    e.preventDefault()
    move(pos, to)
    setAnnounce(`${question.steps[order[pos]]} moved to step ${to + 1}`)
    cue('place')
  }

  function check() {
    const allCorrect = order.every((_, pos) => slotCorrect(pos))
    setStatus(allCorrect ? 'correct' : 'incorrect')
    setAnnounce(allCorrect ? 'Correct order' : 'Order is not quite right')
    cue(allCorrect ? 'correct' : 'incorrect')
  }

  function reset() {
    setOrder(makeStart(question))
    setStatus('idle')
    setDragging(null)
    setAnnounce('')
    cue('continue')
  }

  const tokenClass = (pos: number) => {
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

        <div className="ql-seq__answer ql-seqdnd">
          {order.map((stepIndex, pos) => {
            const isDragging = dragging === stepIndex
            const slotClass = `ql-seq__slot ql-seqdnd__slot${isDragging ? ' ql-seqdnd__slot--dragging' : ''}`
            return (
              <div
                key={stepIndex}
                className={slotClass}
                draggable={status === 'idle'}
                onDragStart={() => onDragStart(stepIndex)}
                onDragEnter={() => onDragEnter(pos)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={onDragEnd}
                onDrop={(e) => e.preventDefault()}
                tabIndex={status === 'idle' ? 0 : -1}
                onKeyDown={(e) => onKeyDown(e, pos)}
                role="button"
                aria-label={`Step ${pos + 1} of ${total}: ${question.steps[stepIndex]}. Use arrow up or down to reorder.`}
              >
                <span className={indexClass(pos)}>{pos + 1}</span>
                <div className={tokenClass(pos)}>
                  {question.steps[stepIndex]}
                  {status === 'idle' && (
                    <span className="ql-seqdnd__grip" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="7.5" cy="5" r="1.25" fill="currentColor" />
                        <circle cx="12.5" cy="5" r="1.25" fill="currentColor" />
                        <circle cx="7.5" cy="10" r="1.25" fill="currentColor" />
                        <circle cx="12.5" cy="10" r="1.25" fill="currentColor" />
                        <circle cx="7.5" cy="15" r="1.25" fill="currentColor" />
                        <circle cx="12.5" cy="15" r="1.25" fill="currentColor" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <ResultBanner status={status} />
      </div>

      <div className="ql-sr-only" role="status" aria-live="polite">
        {announce}
      </div>

      <FeedbackFooter status={status} onCheck={check} onContinue={reset} />
    </div>
  )
}

export default SequencingDnd
