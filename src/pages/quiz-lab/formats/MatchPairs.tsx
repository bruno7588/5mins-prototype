import { useMemo, useState } from 'react'
import type { MatchPairsQuestion, FormatKey } from '../quizData'
import { shuffle } from '../quizData'
import FeedbackFooter from '../components/FeedbackFooter'

type Side = 'L' | 'R'
interface Selection {
  side: Side
  pos: number
}

/**
 * Match the Pairs — tap-to-select, tap-to-pair (no drag; PRD FR1, WCAG 2.5.7).
 * Tap a term then its definition (either column first). A correct pair flashes
 * green and collapses out; a wrong pair flashes red and bounces back.
 */
function MatchPairs({ question }: { question: MatchPairsQuestion; formatKey: FormatKey }) {
  const total = question.pairs.length
  const [attempt, setAttempt] = useState(0)

  // Right column is shuffled; `rightOrder[pos]` → the pair index it belongs to.
  const rightOrder = useMemo(() => shuffle(question.pairs.map((_, i) => i)), [question, attempt])

  const [selected, setSelected] = useState<Selection | null>(null)
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [wrong, setWrong] = useState<{ l: number; r: number } | null>(null)
  const [announce, setAnnounce] = useState('')

  const pairIdAt = (side: Side, pos: number) => (side === 'L' ? pos : rightOrder[pos])
  const isMatched = (side: Side, pos: number) => matched.has(pairIdAt(side, pos))
  const done = matched.size === total

  function handleTap(side: Side, pos: number) {
    if (wrong || isMatched(side, pos) || done) return

    if (!selected) {
      setSelected({ side, pos })
      setAnnounce(`Selected ${side === 'L' ? question.pairs[pos].left : question.pairs[rightOrder[pos]].right}`)
      return
    }
    // Tapping the same token clears the selection.
    if (selected.side === side && selected.pos === pos) {
      setSelected(null)
      return
    }
    // Same column → move the selection.
    if (selected.side === side) {
      setSelected({ side, pos })
      return
    }
    // Opposite column → evaluate the pair.
    const first = selected
    const lPos = side === 'L' ? pos : first.pos
    const rPos = side === 'R' ? pos : first.pos
    if (pairIdAt('L', lPos) === pairIdAt('R', rPos)) {
      const next = new Set(matched)
      next.add(lPos)
      setMatched(next)
      setSelected(null)
      setAnnounce(`Matched. ${next.size} of ${total} pairs complete.`)
    } else {
      setWrong({ l: lPos, r: rPos })
      setAnnounce('Not a match. Try again.')
      window.setTimeout(() => {
        setWrong(null)
        setSelected(null)
      }, 650)
    }
  }

  function reset() {
    setMatched(new Set())
    setSelected(null)
    setWrong(null)
    setAnnounce('')
    setAttempt((a) => a + 1)
  }

  const tokenClass = (side: Side, pos: number) => {
    const classes = ['ql-token', 'ql-token--block']
    if (isMatched(side, pos)) classes.push('ql-token--matched')
    else if (wrong && ((side === 'L' && wrong.l === pos) || (side === 'R' && wrong.r === pos)))
      classes.push('ql-token--incorrect', 'ql-shake')
    else if (selected && selected.side === side && selected.pos === pos) classes.push('ql-token--selected')
    return classes.join(' ')
  }

  return (
    <div className="ql-screen">
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__eyebrow">Tap a term, then its match</span>
          <span className="ql-stem__q">{question.prompt}</span>
        </div>

        <div className="ql-progress" aria-hidden="true">
          {question.pairs.map((_, i) => (
            <span key={i} className={`ql-progress__dot${i < matched.size ? ' is-done' : ''}`} />
          ))}
        </div>

        <div className="ql-match">
          <div className="ql-match__col">
            {question.pairs.map((pair, pos) => (
              <button
                key={`l-${pos}`}
                type="button"
                className={tokenClass('L', pos)}
                aria-pressed={selected?.side === 'L' && selected.pos === pos}
                onClick={() => handleTap('L', pos)}
              >
                {pair.left}
              </button>
            ))}
          </div>
          <div className="ql-match__col">
            {rightOrder.map((pairId, pos) => (
              <button
                key={`r-${pos}`}
                type="button"
                className={tokenClass('R', pos)}
                aria-pressed={selected?.side === 'R' && selected.pos === pos}
                onClick={() => handleTap('R', pos)}
              >
                {question.pairs[pairId].right}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="ql-sr-only" role="status" aria-live="polite">
        {announce}
      </div>

      <FeedbackFooter
        status={done ? 'correct' : 'idle'}
        showCheck={false}
        onContinue={reset}
        title="All matched!"
        detail={question.explanation}
        continueLabel="Try Again"
      />
    </div>
  )
}

export default MatchPairs
