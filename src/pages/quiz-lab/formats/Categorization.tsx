import { useMemo, useState } from 'react'
import type { CategorizationQuestion, FormatKey } from '../quizData'
import { shuffle } from '../quizData'
import FeedbackFooter from '../components/FeedbackFooter'
import type { FeedbackStatus } from '../components/FeedbackFooter'

/**
 * Categorization (PRD, SC Training pattern) — tap-only, no drag. Tap a pool item
 * to select it (amber), then tap a category to drop it in. Tap a placed item to
 * return it to the pool. Each item graded against its correct category.
 */
function Categorization({ question }: { question: CategorizationQuestion; formatKey: FormatKey }) {
  const [attempt, setAttempt] = useState(0)
  const order = useMemo(() => shuffle(question.items.map((_, i) => i)), [question, attempt])

  // itemIndex → categoryId (or null while still in the pool).
  const [placement, setPlacement] = useState<Record<number, string | null>>(() =>
    Object.fromEntries(question.items.map((_, i) => [i, null])),
  )
  const [selected, setSelected] = useState<number | null>(null)
  const [status, setStatus] = useState<FeedbackStatus>('idle')
  const [announce, setAnnounce] = useState('')

  const poolItems = order.filter((i) => placement[i] === null)
  const itemsIn = (catId: string) => order.filter((i) => placement[i] === catId)
  const allPlaced = question.items.every((_, i) => placement[i] !== null)
  const itemCorrect = (i: number) => placement[i] === question.items[i].categoryId

  function selectItem(i: number) {
    if (status !== 'idle') return
    setSelected((cur) => (cur === i ? null : i))
    setAnnounce(`Selected ${question.items[i].label}`)
  }

  function dropInto(catId: string) {
    if (status !== 'idle' || selected === null) return
    setPlacement((p) => ({ ...p, [selected]: catId }))
    const label = question.items[selected].label
    setSelected(null)
    setAnnounce(`Placed ${label} in ${question.categories.find((c) => c.id === catId)?.label}`)
  }

  function returnToPool(i: number) {
    if (status !== 'idle') return
    setPlacement((p) => ({ ...p, [i]: null }))
    setSelected(null)
    setAnnounce(`Returned ${question.items[i].label} to the pool`)
  }

  function check() {
    const correctCount = question.items.filter((_, i) => itemCorrect(i)).length
    setStatus(correctCount === question.items.length ? 'correct' : 'incorrect')
    setAnnounce(`${correctCount} of ${question.items.length} sorted correctly`)
  }

  function reset() {
    setPlacement(Object.fromEntries(question.items.map((_, i) => [i, null])))
    setSelected(null)
    setStatus('idle')
    setAnnounce('')
    setAttempt((a) => a + 1)
  }

  const placedClass = (i: number) => {
    const classes = ['ql-token', 'ql-token--sm', 'ql-token--locked']
    if (status !== 'idle') classes.push(itemCorrect(i) ? 'ql-token--correct' : 'ql-token--incorrect')
    return classes.join(' ')
  }

  const correctCount = question.items.filter((_, i) => itemCorrect(i)).length

  return (
    <div className="ql-screen">
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__eyebrow">Tap an item, then tap a category</span>
          <span className="ql-stem__q">{question.prompt}</span>
        </div>

        <div className="ql-cat__pool">
          {poolItems.length === 0 ? (
            <span className="ql-cat__empty">All items sorted</span>
          ) : (
            poolItems.map((i) => (
              <button
                key={i}
                type="button"
                className={`ql-token ql-token--sm${selected === i ? ' ql-token--selected' : ''}`}
                aria-pressed={selected === i}
                disabled={status !== 'idle'}
                onClick={() => selectItem(i)}
              >
                {question.items[i].label}
              </button>
            ))
          )}
        </div>

        <div className="ql-cat__buckets">
          {question.categories.map((cat) => (
            <div key={cat.id} className="ql-cat__group">
              <span className="ql-bucket__label">{cat.label}</span>
              <div
                className={`ql-bucket${selected !== null && status === 'idle' ? ' ql-bucket--target' : ''}`}
                onClick={() => dropInto(cat.id)}
                role="button"
                aria-label={cat.label}
                tabIndex={selected !== null && status === 'idle' ? 0 : -1}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && selected !== null) {
                    e.preventDefault()
                    dropInto(cat.id)
                  }
                }}
              >
                <div className="ql-bucket__items">
                  {itemsIn(cat.id).map((i) => (
                    <button
                      key={i}
                      type="button"
                      className={placedClass(i)}
                      disabled={status !== 'idle'}
                      onClick={(e) => {
                        e.stopPropagation()
                        returnToPool(i)
                      }}
                    >
                      {question.items[i].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ql-sr-only" role="status" aria-live="polite">
        {announce}
      </div>

      <FeedbackFooter
        status={status}
        checkDisabled={!allPlaced}
        onCheck={check}
        onContinue={reset}
        title={status === 'correct' ? 'All sorted!' : `${correctCount} of ${question.items.length} correct`}
        detail={question.explanation}
      />
    </div>
  )
}

export default Categorization
