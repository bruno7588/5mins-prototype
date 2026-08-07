import { useMemo, useState } from 'react'
import type { SelectAllQuestion } from '../quizData'
import { shuffle } from '../quizData'
import FeedbackFooter from '../components/FeedbackFooter'
import ResultBanner from '../components/ResultBanner'
import type { FeedbackStatus } from '../components/FeedbackFooter'
import { cue } from '../quizSound'

const PICK = 4

/**
 * Select all that apply (Figma 9041:550, "Connections") — tap-only. One flat
 * pool of eight words; four meet the criterion named in the prompt and four are
 * distractors. Tap to select up to four, then Check. A wrong set turns red
 * without revealing which of the words were right.
 */
function SelectAll({ question }: { question: SelectAllQuestion }) {
  const [attempt, setAttempt] = useState(0)
  const words = useMemo(
    () => shuffle([...question.answers, ...question.distractors]),
    [question, attempt],
  )

  const [selected, setSelected] = useState<string[]>([])
  const [status, setStatus] = useState<FeedbackStatus>('idle')
  const [announce, setAnnounce] = useState('')

  const isSelected = (word: string) => selected.includes(word)

  function toggle(word: string) {
    if (status !== 'idle') return
    if (isSelected(word)) {
      setSelected((s) => s.filter((w) => w !== word))
      setAnnounce(`Removed ${word}`)
      cue('remove')
      return
    }
    // Cap the selection at four — a fifth tap is a no-op, not a silent swap.
    if (selected.length === PICK) return
    setSelected((s) => [...s, word])
    setAnnounce(`Selected ${word}, ${selected.length + 1} of ${PICK}`)
    cue('select')
  }

  function check() {
    const allCorrect = selected.every((w) => question.answers.includes(w))
    setStatus(allCorrect ? 'correct' : 'incorrect')
    setAnnounce(allCorrect ? 'Correct — all four picked' : 'Not quite — that is not the right four')
    cue(allCorrect ? 'correct' : 'incorrect')
  }

  function reset() {
    setSelected([])
    setStatus('idle')
    setAnnounce('')
    setAttempt((a) => a + 1)
    cue('continue')
  }

  const wordClass = (word: string) => {
    const classes = ['ql-token', 'ql-token--sm']
    if (status === 'idle') {
      if (isSelected(word)) classes.push('ql-token--selected')
      return classes.join(' ')
    }
    classes.push('ql-token--locked')
    // Only the learner's own picks are graded — an unpicked word never reveals
    // whether it was one of the answers.
    if (isSelected(word)) classes.push(status === 'correct' ? 'ql-token--correct' : 'ql-token--incorrect')
    return classes.join(' ')
  }

  return (
    <div className="ql-screen">
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__q">{question.prompt}</span>
        </div>

        <div className="ql-sel__pool">
          {words.map((word) => (
            <button
              key={word}
              type="button"
              className={wordClass(word)}
              aria-pressed={isSelected(word)}
              disabled={status !== 'idle'}
              onClick={() => toggle(word)}
            >
              {word}
            </button>
          ))}
        </div>

        <ResultBanner status={status} />
      </div>

      <div className="ql-sr-only" role="status" aria-live="polite">
        {announce}
      </div>

      <FeedbackFooter
        status={status}
        checkDisabled={selected.length !== PICK}
        onCheck={check}
        onContinue={reset}
      />
    </div>
  )
}

export default SelectAll
