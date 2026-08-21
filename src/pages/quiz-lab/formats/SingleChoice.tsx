import { useContext, useId, useState } from 'react'
import { CloseCircle, TickCircle } from 'iconsax-react'
import Radio from '@/components/Radio/Radio'
import type { SingleChoiceQuestion } from '../quizData'
import FeedbackFooter, { QuizAdvanceContext } from '../components/FeedbackFooter'
import ResultBanner from '../components/ResultBanner'
import type { FeedbackStatus } from '../components/FeedbackFooter'
import { cue } from '../quizSound'

/**
 * Multiple choice — one answer, tap-only (Figma 9051:860 / 1038 / 1199 / 1315).
 *
 * Each option is a quiz token carrying the DS radio: tap the row to select it (amber,
 * with the radio knocked out dark so it still reads on the fill), then Check.
 *
 * Grading collapses the list to the answer the learner gave, green or red, with a
 * tick or a cross where the radio was, and the explanation under it. The options they
 * did not pick are not shown as right or wrong — an untouched option never reveals
 * whether it was the answer, so the question is still worth asking on the retry, which
 * is the rule every graded format here follows.
 *
 * A poll is the same screen with nothing to mark (`correctIndex: -1`): it asks, so
 * there is no Check, no grading and no collapse — the pick is the whole interaction.
 */
function SingleChoice({ question }: { question: SingleChoiceQuestion }) {
  const [attempt, setAttempt] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [status, setStatus] = useState<FeedbackStatus>('idle')
  const [announce, setAnnounce] = useState('')
  /* Names the radio group. Two questions on one screen would otherwise share a group
     and steal each other's selection. */
  const group = useId()

  /* A poll's one button is its Continue, and it lives in the idle state — so it has to
     read the host's next itself, where the graded formats get it from the footer. */
  const advance = useContext(QuizAdvanceContext)
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
    const classes = ['ql-token', 'ql-token--block', 'ql-choice__option']
    if (locked) {
      classes.push('ql-token--locked')
      classes.push(status === 'correct' ? 'ql-token--correct' : 'ql-token--incorrect')
    } else if (picked === index) {
      classes.push('ql-token--selected')
    }
    return classes.join(' ')
  }

  return (
    <div className="ql-screen" key={attempt}>
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__q">{question.prompt}</span>
        </div>

        {locked && picked !== null ? (
          /* The graded answer, alone. Not a button any more — there is nothing left to
             choose, and the icon takes the radio's place so the row keeps its shape. */
          <div className={optionClass(picked)}>
            <span className="ql-choice__mark" aria-hidden="true">
              {status === 'correct' ? (
                <TickCircle size={20} color="currentColor" variant="Linear" />
              ) : (
                <CloseCircle size={20} color="currentColor" variant="Linear" />
              )}
            </span>
            <span className="ql-choice__label">{question.options[picked]}</span>
          </div>
        ) : (
          <div className="ql-choice__options" role="radiogroup" aria-label="Options">
            {question.options.map((option, index) => (
              /* A label rather than a button: the DS Radio is a real input, which a
                 button cannot contain, and the native group gives arrow-key movement
                 between options for free. */
              <label key={option} className={optionClass(index)}>
                <Radio
                  name={group}
                  checked={picked === index}
                  onChange={() => select(index)}
                  className="ql-choice__radio"
                />
                <span className="ql-choice__label">{option}</span>
              </label>
            ))}
          </div>
        )}

        {graded && <ResultBanner status={status} explanation={question.explanation} />}
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
          onCheck={advance ?? reset}
          onContinue={advance ?? reset}
        />
      )}
    </div>
  )
}

export default SingleChoice
