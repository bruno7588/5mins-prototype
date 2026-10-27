import { useContext, useId, useState } from 'react'
import { CloseCircle, TickCircle } from 'iconsax-react'
import Checkbox from '@/components/Checkbox/Checkbox'
import Radio from '@/components/Radio/Radio'
import { gradeImageChoice, type SingleChoiceQuestion } from '../quizData'
import FeedbackFooter, { QuizAdvanceContext, QuizFooterLayoutContext } from '../components/FeedbackFooter'
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
 * With several correct options (the admin's "Multiple correct options"), each row carries
 * a checkbox and the stem says "Select all that apply". Grading is all or nothing, as on
 * Image Choice. A right answer collapses to every pick, green. A wrong one says "Not
 * quite" and nothing more (no count) and collapses to the wrong picks only, red with a
 * cross; when every pick was right but some answers were missed, no rows show at all, as
 * a right answer in red would read as wrong (all-or-nothing tools such as Rise and Kahoot
 * do the same: a plain "Incorrect", no marks on the picks).
 *
 * A poll is the same screen with nothing to mark (`correctIndex: -1`): it asks, so
 * there is no Check, no grading and no collapse — the pick is the whole interaction.
 */
function SingleChoice({ question }: { question: SingleChoiceQuestion }) {
  const [attempt, setAttempt] = useState(0)
  const [picked, setPicked] = useState<number[]>([])
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
  const multiple = graded && !!question.multipleCorrect
  // As on Image Choice: on the web the result sits beside Continue; at phone width it stays under the options.
  const inFooter = useContext(QuizFooterLayoutContext) === 'hug'

  function select(index: number) {
    if (locked) return
    const on = multiple && picked.includes(index)
    setPicked(multiple ? (on ? picked.filter((i) => i !== index) : [...picked, index]) : [index])
    setAnnounce(`${on ? 'Removed' : 'Selected'} ${question.options[index]}`)
    cue('select')
  }

  function check() {
    if (picked.length === 0) return
    const correct = question.correctIndices ?? [question.correctIndex]
    const right = multiple ? gradeImageChoice(picked, correct).right : picked[0] === question.correctIndex
    setStatus(right ? 'correct' : 'incorrect')
    setAnnounce(right ? 'Correct' : 'Not quite')
    cue(right ? 'correct' : 'incorrect')
  }

  function reset() {
    setPicked([])
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
    } else if (picked.includes(index)) {
      classes.push('ql-token--selected')
    }
    return classes.join(' ')
  }

  const result = <ResultBanner status={status} explanation={question.explanation} />

  return (
    <div className="ql-screen" key={attempt}>
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__q">{question.prompt}</span>
          {multiple && <span className="ql-imgchoice__hint">Select all that apply</span>}
        </div>

        {locked && picked.length > 0 ? (() => {
          const correct = question.correctIndices ?? [question.correctIndex]
          const wrongPicks = picked.filter((i) => !correct.includes(i))
          // A wrong multi-pick answer shows only the wrong picks; with none (answers missed), no rows.
          const shown = multiple && status === 'incorrect' ? wrongPicks : picked
          if (shown.length === 0) return null
          return (
          /* The graded answer, alone. Not a button any more — there is nothing left to
             choose, and the icon takes the radio's place so the row keeps its shape. */
          <div className="ql-choice__options">
            {[...shown].sort((a, b) => a - b).map((index) => (
              <div key={index} className={optionClass(index)}>
                <span className="ql-choice__mark" aria-hidden="true">
                  {status === 'correct' ? (
                    <TickCircle size={20} color="currentColor" variant="Linear" />
                  ) : (
                    <CloseCircle size={20} color="currentColor" variant="Linear" />
                  )}
                </span>
                <span className="ql-choice__label">{question.options[index]}</span>
              </div>
            ))}
          </div>
          )
        })() : (
          <div className="ql-choice__options" role={multiple ? 'group' : 'radiogroup'} aria-label="Options">
            {question.options.map((option, index) => (
              /* A label rather than a button: the DS Radio is a real input, which a
                 button cannot contain, and the native group gives arrow-key movement
                 between options for free. */
              <label key={option} className={optionClass(index)}>
                {multiple ? (
                  <Checkbox
                    checked={picked.includes(index)}
                    onChange={() => select(index)}
                    ariaLabel={option}
                    className="ql-choice__check"
                  />
                ) : (
                  <Radio
                    name={group}
                    checked={picked.includes(index)}
                    onChange={() => select(index)}
                    className="ql-choice__radio"
                  />
                )}
                <span className="ql-choice__label">{option}</span>
              </label>
            ))}
          </div>
        )}

        {graded && !inFooter && result}
      </div>

      <div className="ql-sr-only" role="status" aria-live="polite">
        {announce}
      </div>

      {/* A poll has nothing to check, so its one action is the one that moves on. */}
      {graded ? (
        <FeedbackFooter
          result={result}
          status={status}
          checkDisabled={picked.length === 0}
          onCheck={check}
          onContinue={reset}
        />
      ) : (
        <FeedbackFooter
          status="idle"
          checkLabel="Continue"
          checkDisabled={picked.length === 0}
          onCheck={advance ?? reset}
          onContinue={advance ?? reset}
        />
      )}
    </div>
  )
}

export default SingleChoice
