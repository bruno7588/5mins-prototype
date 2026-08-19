import { useState } from 'react'
import type { SingleChoiceQuestion } from '../quizData'
import FeedbackFooter from '../components/FeedbackFooter'
import ResultBanner from '../components/ResultBanner'
import type { FeedbackStatus } from '../components/FeedbackFooter'
import { cue } from '../quizSound'

/**
 * Multiple choice — one answer, tap-only. Tap an option to select it (amber), then
 * Check. The pick turns green or red and nothing else moves: an option the learner did
 * not touch never says whether it was the answer, so the question is still worth asking
 * on the retry.
 *
 * A poll is the same screen with nothing to mark (`correctIndex: -1`): it asks, so there
 * is no Check and no result — the pick is the whole interaction.
 */
function SingleChoice({ question }: { question: SingleChoiceQuestion }) {
  const [attempt, setAttempt] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [status, setStatus] = useState<FeedbackStatus>('idle')
  const [announce, setAnnounce] = useState('')

  const graded = question.correctIndex >= 0
  const locked = status !== 'idle'

  function select(index: number) {
    if (locked) return
    setPicked(index)
    setAnnounce(`Selected ${question.options[index]}`)
    cue('select')
  }

  function check() {
    if (picked === null) return
    const right = picked === question.correctIndex
    setStatus(right ? 'correct' : 'incorrect')
    setAnnounce(right ? 'Correct' : 'Not quite')
    cue(right ? 'correct' : 'incorrect')
  }

  function reset() {
    setPicked(null)
    setStatus('idle')
    setAnnounce('')
    setAttempt((a) => a + 1)
    cue('continue')
  }

  const optionClass = (index: number) => {
    const classes = ['ql-token', 'ql-token--block']
    if (!locked) {
      if (picked === index) classes.push('ql-token--selected')
      return classes.join(' ')
    }
    classes.push('ql-token--locked')
    /* Only the learner's own pick is graded — an untouched option never reveals whether
       it was the answer, the same rule SelectAll follows. A wrong pick turns red and the
       question stays askable on the retry. */
    if (index === picked) classes.push(status === 'correct' ? 'ql-token--correct' : 'ql-token--incorrect')
    return classes.join(' ')
  }

  return (
    <div className="ql-screen" key={attempt}>
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__q">{question.prompt}</span>
        </div>

        <div className="ql-choice__options" role="radiogroup" aria-label="Options">
          {question.options.map((option, index) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={picked === index}
              disabled={locked}
              className={optionClass(index)}
              onClick={() => select(index)}
            >
              {option}
            </button>
          ))}
        </div>

        {graded && <ResultBanner status={status} />}
      </div>

      <div className="ql-sr-only" role="status" aria-live="polite">
        {announce}
      </div>

      {/* A poll has nothing to check, so its one action is the one that moves on. */}
      {graded ? (
        <FeedbackFooter
          status={status}
          checkDisabled={picked === null}
          onCheck={check}
          onContinue={reset}
        />
      ) : (
        <FeedbackFooter
          status="idle"
          checkLabel="Continue"
          checkDisabled={picked === null}
          onCheck={reset}
          onContinue={reset}
        />
      )}
    </div>
  )
}

export default SingleChoice
