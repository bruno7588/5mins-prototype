import { useState } from 'react'
import type { SequencingQuestion } from '../quizData'
import { shuffle } from '../quizData'
import FeedbackFooter from '../components/FeedbackFooter'
import ResultBanner from '../components/ResultBanner'
import DashedBorder from '../components/DashedBorder'
import type { FeedbackStatus } from '../components/FeedbackFooter'
import { cue } from '../quizSound'

/**
 * Sorting / Sequencing — receiver-on-top, bank-below, fully drag-and-drop.
 * Steps start in a shuffled bank at the bottom. Drag (or tap) a bank step into
 * the receiver to add it; drag a placed row's grip — or use ↑/↓ — to reorder
 * within the receiver; drag a placed row back down into the bank to remove it.
 *
 * Cross-container moves (bank↔receiver) commit on drop: moving a node between
 * two lists mid-drag would unmount it and cancel the HTML5 drag, so only the
 * in-receiver reorder is live. Position-based grading: slot `pos` is right when
 * it holds step `pos` (steps are stored in correct order).
 */
function SequencingDnd({ question }: { question: SequencingQuestion }) {
  const total = question.steps.length
  // `bank` = step indices not yet placed; `placed` = ordered receiver contents.
  const [bank, setBank] = useState<number[]>(() => shuffle(question.steps.map((_, i) => i)))
  const [placed, setPlaced] = useState<number[]>([])
  const [dragging, setDragging] = useState<number | null>(null)
  const [overBank, setOverBank] = useState(false)
  const [overReceiver, setOverReceiver] = useState(false)
  const [status, setStatus] = useState<FeedbackStatus>('idle')
  const [announce, setAnnounce] = useState('')

  const complete = placed.length === total
  const slotCorrect = (pos: number) => placed[pos] === pos
  const draggingFromBank = dragging !== null && bank.includes(dragging)
  const draggingPlaced = dragging !== null && placed.includes(dragging)

  function add(stepIndex: number) {
    if (status !== 'idle') return
    setBank((b) => b.filter((i) => i !== stepIndex))
    setPlaced((p) => [...p, stepIndex])
    setAnnounce(`Added ${question.steps[stepIndex]} as step ${placed.length + 1}`)
    cue('place')
  }

  /** Move the step at `from` to index `to` within the receiver. */
  function move(from: number, to: number) {
    if (to < 0 || to >= placed.length || from === to) return
    setPlaced((p) => {
      const next = p.slice()
      const [step] = next.splice(from, 1)
      next.splice(to, 0, step)
      return next
    })
  }

  function onDragStart(stepIndex: number) {
    if (status !== 'idle') return
    setDragging(stepIndex)
    cue('select')
  }

  function onDragEnd() {
    setDragging(null)
    setOverBank(false)
    setOverReceiver(false)
  }

  // ── Receiver: live reorder for placed rows; drop target for bank adds ───────
  function onSlotDragEnter(pos: number) {
    if (!draggingPlaced) return
    setOverBank(false)
    const from = placed.indexOf(dragging as number)
    if (from !== pos) {
      move(from, pos)
      cue('place')
    }
  }

  // ── Keyboard reorder (↑/↓ moves the focused step) ──────────────────────────
  function onKeyDown(e: React.KeyboardEvent, pos: number) {
    if (status !== 'idle') return
    const to = e.key === 'ArrowUp' ? pos - 1 : e.key === 'ArrowDown' ? pos + 1 : -2
    if (to === -2 || to < 0 || to >= placed.length) return
    e.preventDefault()
    move(pos, to)
    setAnnounce(`${question.steps[placed[pos]]} moved to step ${to + 1}`)
    cue('place')
  }

  /** Drag a placed step down into the bank to remove it from the sequence. */
  function removeToBank() {
    if (!draggingPlaced) return
    const stepIndex = dragging as number
    setPlaced((p) => p.filter((i) => i !== stepIndex))
    setBank((b) => (b.includes(stepIndex) ? b : [...b, stepIndex]))
    setAnnounce(`Removed ${question.steps[stepIndex]}`)
    cue('remove')
  }

  function check() {
    const allCorrect = placed.every((_, pos) => slotCorrect(pos))
    setStatus(allCorrect ? 'correct' : 'incorrect')
    setAnnounce(allCorrect ? 'Correct order' : 'Order is not quite right')
    cue(allCorrect ? 'correct' : 'incorrect')
  }

  function reset() {
    setBank(shuffle(question.steps.map((_, i) => i)))
    setPlaced([])
    setDragging(null)
    setOverBank(false)
    setOverReceiver(false)
    setStatus('idle')
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

  const showBank = status === 'idle' && (bank.length > 0 || draggingPlaced)

  return (
    <div className="ql-screen">
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__q">{question.prompt}</span>
        </div>

        <div
          className={`ql-seq__answer ql-seqdnd${overReceiver ? ' ql-seqdnd__receiver--drop' : ''}`}
          onDragOver={(e) => {
            if (draggingFromBank) {
              e.preventDefault()
              setOverReceiver(true)
            }
          }}
          onDrop={(e) => {
            if (draggingFromBank && dragging !== null) {
              e.preventDefault()
              add(dragging)
            }
            setOverReceiver(false)
          }}
        >
          <DashedBorder />
          {placed.length === 0 ? (
            <p className="ql-seq__hint">Drag a step up here to put it in order</p>
          ) : (
            placed.map((stepIndex, pos) => {
              const isDragging = dragging === stepIndex
              const slotClass = `ql-seq__slot ql-seqdnd__slot${isDragging ? ' ql-seqdnd__slot--dragging' : ''}`
              return (
                <div
                  key={stepIndex}
                  className={slotClass}
                  draggable={status === 'idle'}
                  onDragStart={() => onDragStart(stepIndex)}
                  onDragEnter={() => onSlotDragEnter(pos)}
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
            })
          )}
        </div>

        {showBank && (
          <div
            className={`ql-seq__bank ql-seqdnd__bank${overBank ? ' ql-seqdnd__bank--drop' : ''}`}
            onDragOver={(e) => {
              if (draggingPlaced) {
                e.preventDefault()
                setOverBank(true)
                setOverReceiver(false)
              }
            }}
            onDrop={(e) => {
              if (draggingPlaced) {
                e.preventDefault()
                removeToBank()
              }
              setOverBank(false)
            }}
          >
            {bank.map((stepIndex) => (
              <button
                key={stepIndex}
                type="button"
                className={`ql-token ql-token--block ql-seqdnd__bankitem${
                  dragging === stepIndex ? ' ql-seqdnd__bankitem--dragging' : ''
                }`}
                draggable={status === 'idle'}
                onDragStart={() => onDragStart(stepIndex)}
                onDragEnd={onDragEnd}
                onClick={() => add(stepIndex)}
              >
                {question.steps[stepIndex]}
              </button>
            ))}
            {draggingPlaced && <p className="ql-seq__hint">Drop here to remove</p>}
          </div>
        )}
        <ResultBanner status={status} />
      </div>

      <div className="ql-sr-only" role="status" aria-live="polite">
        {announce}
      </div>

      <FeedbackFooter status={status} checkDisabled={!complete} onCheck={check} onContinue={reset} />
    </div>
  )
}

export default SequencingDnd
