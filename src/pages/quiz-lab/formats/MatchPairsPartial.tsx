import { useMemo, useState } from 'react'
import type { MatchPairsQuestion } from '../quizData'
import { shuffle } from '../quizData'
import FeedbackFooter from '../components/FeedbackFooter'
import type { FeedbackStatus } from '../components/FeedbackFooter'
import { cue } from '../quizSound'

/**
 * Match the Pairs — partial-credit variant (PRD FR1.4). Unlike the instant
 * model, the learner assembles *all* pairs (right or wrong) into a "Your matches"
 * list, then Check grades each row independently and awards equal-weight partial
 * credit (e.g. 3 of 4 = 75%), revealing the correct definition for wrong rows.
 * Still tap-only (WCAG 2.5.7).
 */
function MatchPairsPartial({ question }: { question: MatchPairsQuestion }) {
  const total = question.pairs.length
  const [attempt, setAttempt] = useState(0)
  const rightPoolOrder = useMemo(() => shuffle(question.pairs.map((_, i) => i)), [question, attempt])

  // links[leftPairId] = rightPairId it's connected to (or null while unpaired).
  const [links, setLinks] = useState<Record<number, number | null>>(() =>
    Object.fromEntries(question.pairs.map((_, i) => [i, null])),
  )
  const [selected, setSelected] = useState<{ side: 'L' | 'R'; id: number } | null>(null)
  const [status, setStatus] = useState<FeedbackStatus>('idle')
  const [announce, setAnnounce] = useState('')

  const usedRights = new Set(Object.values(links).filter((v): v is number => v !== null))
  const leftPool = question.pairs.map((_, i) => i).filter((i) => links[i] === null)
  const rightPool = rightPoolOrder.filter((i) => !usedRights.has(i))
  const rows = question.pairs
    .map((_, i) => i)
    .filter((i) => links[i] !== null)
    .map((leftId) => ({ leftId, rightId: links[leftId] as number }))

  const allPaired = leftPool.length === 0
  const correctCount = rows.filter((r) => r.leftId === r.rightId).length

  function tap(side: 'L' | 'R', id: number) {
    if (status !== 'idle') return
    if (!selected) {
      setSelected({ side, id })
      setAnnounce(`Selected ${side === 'L' ? question.pairs[id].left : question.pairs[id].right}`)
      cue('select')
      return
    }
    if (selected.side === side && selected.id === id) {
      setSelected(null)
      return
    }
    if (selected.side === side) {
      setSelected({ side, id })
      return
    }
    // Opposite side → form a link.
    const leftId = side === 'L' ? id : selected.id
    const rightId = side === 'R' ? id : selected.id
    setLinks((l) => ({ ...l, [leftId]: rightId }))
    setSelected(null)
    setAnnounce(`Matched ${question.pairs[leftId].left}`)
    cue('place')
  }

  function unpair(leftId: number) {
    if (status !== 'idle') return
    setLinks((l) => ({ ...l, [leftId]: null }))
    setSelected(null)
    setAnnounce(`Unmatched ${question.pairs[leftId].left}`)
    cue('remove')
  }

  function check() {
    setStatus(correctCount === total ? 'correct' : 'incorrect')
    setAnnounce(`${correctCount} of ${total} pairs correct`)
    cue(correctCount === total ? 'correct' : 'incorrect')
  }

  function reset() {
    setLinks(Object.fromEntries(question.pairs.map((_, i) => [i, null])))
    setSelected(null)
    setStatus('idle')
    setAnnounce('')
    setAttempt((a) => a + 1)
    cue('continue')
  }

  const pct = Math.round((correctCount / total) * 100)

  return (
    <div className="ql-screen">
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__q">{question.prompt}</span>
        </div>

        <div className="ql-pairs">
          {rows.length === 0 ? (
            <div className="ql-pairs__empty">Your matches will appear here</div>
          ) : (
            rows.map(({ leftId, rightId }) => {
              const isCorrect = leftId === rightId
              const rowClass =
                status === 'idle'
                  ? 'ql-pair'
                  : `ql-pair ql-pair--${isCorrect ? 'correct' : 'incorrect'}`
              return (
                <div key={leftId} className={rowClass}>
                  {status === 'idle' && (
                    <button
                      type="button"
                      className="ql-pair__remove"
                      aria-label={`Unmatch ${question.pairs[leftId].left}`}
                      onClick={() => unpair(leftId)}
                    >
                      <svg width="24" height="24" viewBox="0 0 21 21" fill="none" aria-hidden="true">
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
                  <div className="ql-pair__body">
                    <span className="ql-pair__term">{question.pairs[leftId].left}</span>
                    <span className="ql-pair__def">{question.pairs[rightId].right}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {status === 'idle' && !allPaired && (
          <div className="ql-match">
            <div className="ql-match__col">
              {leftPool.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`ql-token ql-token--block${
                    selected?.side === 'L' && selected.id === id ? ' ql-token--selected' : ''
                  }`}
                  aria-pressed={selected?.side === 'L' && selected.id === id}
                  onClick={() => tap('L', id)}
                >
                  {question.pairs[id].left}
                </button>
              ))}
            </div>
            <div className="ql-match__col">
              {rightPool.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`ql-token ql-token--block${
                    selected?.side === 'R' && selected.id === id ? ' ql-token--selected' : ''
                  }`}
                  aria-pressed={selected?.side === 'R' && selected.id === id}
                  onClick={() => tap('R', id)}
                >
                  {question.pairs[id].right}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="ql-sr-only" role="status" aria-live="polite">
        {announce}
      </div>

      <FeedbackFooter
        status={status}
        checkDisabled={!allPaired}
        onCheck={check}
        onContinue={reset}
        title={status === 'correct' ? 'All matched!' : `${correctCount} of ${total} correct · ${pct}%`}
        detail={status === 'correct' ? question.explanation : 'Give it another go.'}
      />
    </div>
  )
}

export default MatchPairsPartial
