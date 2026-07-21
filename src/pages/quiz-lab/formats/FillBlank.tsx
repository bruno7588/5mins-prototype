import { Fragment, useMemo, useState } from 'react'
import type { FillBlankQuestion, FormatKey } from '../quizData'
import { shuffle } from '../quizData'
import Toggle from '@/components/Toggle/Toggle'
import FeedbackFooter from '../components/FeedbackFooter'
import type { FeedbackStatus } from '../components/FeedbackFooter'

const norm = (s: string) => s.trim().toLowerCase()

/**
 * Fill in the Blank (PRD FR2). Word-bank mode: tap a chip to drop it into the
 * next empty gap; tap a filled gap to return the word. Free-type mode swaps the
 * bank for keyboard inputs (case-insensitive matching) for progressive recall.
 */
function FillBlank({ question }: { question: FillBlankQuestion; formatKey: FormatKey }) {
  const gaps = useMemo(
    () => question.segments.filter((s): s is { blank: string } => typeof s !== 'string'),
    [question],
  )
  const [attempt, setAttempt] = useState(0)
  const bank = useMemo(() => shuffle(question.bank), [question, attempt])

  const [freeType, setFreeType] = useState(false)
  const [status, setStatus] = useState<FeedbackStatus>('idle')
  const [announce, setAnnounce] = useState('')

  // Word-bank mode: each gap holds the bank index placed in it (or null).
  const [fills, setFills] = useState<(number | null)[]>(() => gaps.map(() => null))
  // Free-type mode: raw text per gap.
  const [typed, setTyped] = useState<string[]>(() => gaps.map(() => ''))

  const usedBank = new Set(fills.filter((f): f is number => f !== null))

  function placeChip(bankIndex: number) {
    if (status !== 'idle' || usedBank.has(bankIndex)) return
    const nextEmpty = fills.findIndex((f) => f === null)
    if (nextEmpty === -1) return
    const next = fills.slice()
    next[nextEmpty] = bankIndex
    setFills(next)
    setAnnounce(`Placed ${bank[bankIndex]} in blank ${nextEmpty + 1}`)
  }

  function clearGap(gapIndex: number) {
    if (status !== 'idle' || fills[gapIndex] === null) return
    const next = fills.slice()
    next[gapIndex] = null
    setFills(next)
    setAnnounce(`Cleared blank ${gapIndex + 1}`)
  }

  const answers = (): string[] =>
    freeType ? typed : fills.map((f) => (f === null ? '' : bank[f]))

  const gapCorrect = (gapIndex: number) => norm(answers()[gapIndex]) === norm(gaps[gapIndex].blank)

  const canCheck = freeType ? typed.every((t) => t.trim() !== '') : fills.every((f) => f !== null)

  function check() {
    const allCorrect = gaps.every((_, i) => gapCorrect(i))
    setStatus(allCorrect ? 'correct' : 'incorrect')
    setAnnounce(allCorrect ? 'All blanks correct' : 'Some blanks are incorrect')
  }

  function reset() {
    setFills(gaps.map(() => null))
    setTyped(gaps.map(() => ''))
    setStatus('idle')
    setAnnounce('')
    setAttempt((a) => a + 1)
  }

  // Render the sentence, replacing gap segments with the right slot type.
  let gapCursor = -1
  const sentence = question.segments.map((seg, i) => {
    if (typeof seg === 'string') return <Fragment key={i}>{seg}</Fragment>
    gapCursor += 1
    const gapIndex = gapCursor

    if (freeType) {
      const cls = ['ql-blank__input']
      if (status !== 'idle') cls.push(gapCorrect(gapIndex) ? 'is-correct' : 'is-incorrect')
      return (
        <input
          key={i}
          className={cls.join(' ')}
          value={typed[gapIndex]}
          disabled={status !== 'idle'}
          aria-label={`Blank ${gapIndex + 1}`}
          placeholder="type…"
          size={Math.max(6, seg.blank.length)}
          onChange={(e) => {
            const next = typed.slice()
            next[gapIndex] = e.target.value
            setTyped(next)
          }}
        />
      )
    }

    const placed = fills[gapIndex]
    const cls = ['ql-blank']
    if (status !== 'idle') cls.push(gapCorrect(gapIndex) ? 'ql-blank--correct' : 'ql-blank--incorrect')
    else if (placed !== null) cls.push('ql-blank--filled')
    else cls.push('ql-blank--empty')
    return (
      <button key={i} type="button" className={cls.join(' ')} onClick={() => clearGap(gapIndex)}>
        {placed !== null ? bank[placed] : ' '}
      </button>
    )
  })

  const detail =
    status === 'incorrect' ? (
      <>
        <div>
          Answer:{' '}
          <strong>{gaps.map((g) => g.blank).join(', ')}</strong>
        </div>
        <div>{question.explanation}</div>
      </>
    ) : (
      question.explanation
    )

  return (
    <div className="ql-screen">
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__eyebrow">Fill in the missing words</span>
          <span className="ql-stem__q">{question.prompt}</span>
        </div>

        {question.allowFreeType && (
          <div className="ql-mode">
            <Toggle
              label="Type it myself"
              labelPosition="left"
              size="sm"
              checked={freeType}
              disabled={status !== 'idle'}
              onChange={(e) => setFreeType(e.target.checked)}
            />
          </div>
        )}

        <p className="ql-sentence">{sentence}</p>

        {!freeType && (
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
        )}
      </div>

      <div className="ql-sr-only" role="status" aria-live="polite">
        {announce}
      </div>

      <FeedbackFooter
        status={status}
        checkDisabled={!canCheck}
        onCheck={check}
        onContinue={reset}
        title={status === 'correct' ? 'Correct!' : 'Not quite'}
        detail={detail}
      />
    </div>
  )
}

export default FillBlank
