import { useState } from 'react'
import { TickCircle, CloseCircle } from 'iconsax-react'
import type { TrueFalseQuestion, FormatKey } from '../quizData'
import FeedbackFooter from '../components/FeedbackFooter'
import type { FeedbackStatus } from '../components/FeedbackFooter'
import { cue } from '../quizSound'

/** True / False (MCQ backbone). Tap an option to select, then Check. */
function TrueFalse({ question }: { question: TrueFalseQuestion; formatKey: FormatKey }) {
  const [choice, setChoice] = useState<boolean | null>(null)
  const [status, setStatus] = useState<FeedbackStatus>('idle')
  const [announce, setAnnounce] = useState('')

  const options: { value: boolean; label: string }[] = [
    { value: true, label: 'True' },
    { value: false, label: 'False' },
  ]

  function check() {
    const correct = choice === question.answer
    setStatus(correct ? 'correct' : 'incorrect')
    setAnnounce(correct ? 'Correct' : 'Incorrect')
    cue(correct ? 'correct' : 'incorrect')
  }

  function reset() {
    setChoice(null)
    setStatus('idle')
    setAnnounce('')
    cue('continue')
  }

  const tokenClass = (value: boolean) => {
    const classes = ['ql-token', 'ql-token--block']
    if (status !== 'idle') {
      if (value === question.answer) classes.push('ql-token--correct')
      else if (value === choice) classes.push('ql-token--incorrect')
      else classes.push('ql-token--locked')
    } else if (choice === value) classes.push('ql-token--selected')
    return classes.join(' ')
  }

  return (
    <div className="ql-screen">
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__eyebrow">{question.prompt}</span>
          <span className="ql-stem__q">{question.statement}</span>
        </div>

        <div className="ql-tf">
          {options.map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              className={tokenClass(opt.value)}
              aria-pressed={choice === opt.value}
              disabled={status !== 'idle'}
              onClick={() => {
                setChoice(opt.value)
                cue('select')
              }}
            >
              <span className="ql-token__icon" aria-hidden="true">
                {opt.value ? (
                  <TickCircle size={20} color="currentColor" variant="Linear" />
                ) : (
                  <CloseCircle size={20} color="currentColor" variant="Linear" />
                )}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ql-sr-only" role="status" aria-live="polite">
        {announce}
      </div>

      <FeedbackFooter
        status={status}
        checkDisabled={choice === null}
        onCheck={check}
        onContinue={reset}
        title={status === 'correct' ? 'Correct!' : 'Not quite'}
        detail={
          status === 'incorrect' ? (
            <>
              <div>
                The statement is <strong>{question.answer ? 'True' : 'False'}</strong>.
              </div>
              <div>{question.explanation}</div>
            </>
          ) : (
            question.explanation
          )
        }
      />
    </div>
  )
}

export default TrueFalse
