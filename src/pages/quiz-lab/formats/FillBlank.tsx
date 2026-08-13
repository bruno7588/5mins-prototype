import { useMemo, useState } from 'react'
import type { FillBlankQuestion, FormatKey } from '../quizData'
import { shuffle } from '../quizData'
import FeedbackFooter from '../components/FeedbackFooter'
import ResultBanner from '../components/ResultBanner'
import DashedBorder from '../components/DashedBorder'
import type { FeedbackStatus } from '../components/FeedbackFooter'
import { cue } from '../quizSound'

const norm = (s: string) => s.trim().toLowerCase()

/**
 * Fill in the Blank (PRD FR2) — word-bank mode. Tap a chip to drop it into the
 * next empty gap; tap a filled gap to return the word. Bank includes distractors.
 */
function FillBlank({ question }: { question: FillBlankQuestion; formatKey: FormatKey }) {
  const gaps = useMemo(
    () => question.segments.filter((s): s is { blank: string } => typeof s !== 'string'),
    [question],
  )
  const [attempt, setAttempt] = useState(0)
  const bank = useMemo(() => shuffle(question.bank), [question, attempt])

  const [status, setStatus] = useState<FeedbackStatus>('idle')
  const [announce, setAnnounce] = useState('')
  // Each gap holds the bank index placed in it (or null).
  const [fills, setFills] = useState<(number | null)[]>(() => gaps.map(() => null))

  const usedBank = new Set(fills.filter((f): f is number => f !== null))

  function placeChip(bankIndex: number) {
    if (status !== 'idle' || usedBank.has(bankIndex)) return
    const nextEmpty = fills.findIndex((f) => f === null)
    if (nextEmpty === -1) return
    const next = fills.slice()
    next[nextEmpty] = bankIndex
    setFills(next)
    setAnnounce(`Placed ${bank[bankIndex]} in blank ${nextEmpty + 1}`)
    cue('place')
  }

  function clearGap(gapIndex: number) {
    if (status !== 'idle' || fills[gapIndex] === null) return
    const next = fills.slice()
    next[gapIndex] = null
    setFills(next)
    setAnnounce(`Cleared blank ${gapIndex + 1}`)
    cue('remove')
  }

  const gapCorrect = (gapIndex: number) => {
    const f = fills[gapIndex]
    return f !== null && norm(bank[f]) === norm(gaps[gapIndex].blank)
  }

  const canCheck = fills.every((f) => f !== null)

  function check() {
    const allCorrect = gaps.every((_, i) => gapCorrect(i))
    setStatus(allCorrect ? 'correct' : 'incorrect')
    setAnnounce(allCorrect ? 'All blanks correct' : 'Some blanks are incorrect')
    cue(allCorrect ? 'correct' : 'incorrect')
  }

  function reset() {
    setFills(gaps.map(() => null))
    setStatus('idle')
    setAnnounce('')
    setAttempt((a) => a + 1)
    cue('continue')
  }

  // Render the sentence, replacing gap segments with tappable slots.
  let gapCursor = -1
  const sentence = question.segments.map((seg, i) => {
    if (typeof seg === 'string')
      return seg
        .split(/\s+/)
        .filter(Boolean)
        .map((word, w) => (
          <span key={`${i}-${w}`} className="ql-word">
            {word}
          </span>
        ))
    gapCursor += 1
    const gapIndex = gapCursor
    const placed = fills[gapIndex]
    const cls = ['ql-blank']
    if (status !== 'idle') cls.push(gapCorrect(gapIndex) ? 'ql-blank--correct' : 'ql-blank--incorrect')
    else if (placed !== null) cls.push('ql-blank--filled')
    else cls.push('ql-blank--empty')
    return (
      <button key={i} type="button" className={cls.join(' ')} onClick={() => clearGap(gapIndex)}>
        {placed !== null ? bank[placed] : <DashedBorder />}
      </button>
    )
  })

  return (
    <div className="ql-screen">
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__q">{question.prompt}</span>
        </div>

        <div className="ql-fb">
          <div className="ql-sentence">{sentence}</div>

          <div className="ql-bank">
            {bank.map((word, b) => {
              const used = usedBank.has(b)
              return (
                <button
                  key={b}
                  type="button"
                  className={`ql-token ql-token--sm${used ? ' ql-token--used' : ''}`}
                  disabled={used || status !== 'idle'}
                  aria-hidden={used}
                  onClick={() => placeChip(b)}
                >
                  {word}
                </button>
              )
            })}
          </div>
        </div>
        <ResultBanner status={status} />
      </div>

      <div className="ql-sr-only" role="status" aria-live="polite">
        {announce}
      </div>

      <FeedbackFooter
        status={status}
        checkDisabled={!canCheck}
        onCheck={check}
        onContinue={reset}
      />
    </div>
  )
}

export default FillBlank
