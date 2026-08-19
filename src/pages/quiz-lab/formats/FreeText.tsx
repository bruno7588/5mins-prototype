import { useState } from 'react'
import type { FreeTextQuestion } from '../quizData'
import FeedbackFooter from '../components/FeedbackFooter'
import { cue } from '../quizSound'

/**
 * Short text and exercise — the learner answers in their own words. Nothing is graded
 * here: there is no key to grade against, so the screen collects the answer and moves
 * on rather than pretending to mark it.
 */
function FreeText({ question }: { question: FreeTextQuestion }) {
  const [attempt, setAttempt] = useState(0)
  const [answer, setAnswer] = useState('')

  function submit() {
    setAnswer('')
    setAttempt((a) => a + 1)
    cue('continue')
  }

  return (
    <div className="ql-screen" key={attempt}>
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__q">{question.prompt}</span>
        </div>

        <textarea
          className="ql-answer"
          rows={6}
          placeholder={question.placeholder ?? 'Write your answer…'}
          aria-label="Your answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </div>

      {/* Held until something is written: an empty answer is not an answer. */}
      <FeedbackFooter
        status="idle"
        checkLabel="Submit"
        checkDisabled={!answer.trim()}
        onCheck={submit}
        onContinue={submit}
      />
    </div>
  )
}

export default FreeText
