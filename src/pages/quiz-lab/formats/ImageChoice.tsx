import { useState } from 'react'
import { CloseCircle, TickCircle } from 'iconsax-react'
import Checkbox from '@/components/Checkbox/Checkbox'
import Radio from '@/components/Radio/Radio'
import { gradeImageChoice, type ImageChoiceQuestion } from '../quizData'
import FeedbackFooter from '../components/FeedbackFooter'
import ResultBanner from '../components/ResultBanner'
import type { FeedbackStatus } from '../components/FeedbackFooter'
import { cue } from '../quizSound'

/**
 * Image Choice (DES-345). The images are the answers, and one of them is right unless
 * the admin allowed more than one.
 *
 * Each option is a quiz token framing a square image, with a DS control in its corner:
 * a radio when one image is right ("Select one image"), a checkbox when several can be
 * ("Select all that apply"). Tap the tile, then Check. With several, the prompt never
 * says how many are right, so the count does not give the answer away.
 *
 * Right only when the picks are exactly the correct set. Only the learner's own picks are
 * marked, each by itself: a right pick green with a tick, a wrong one red with a cross. An
 * image they didn't pick is never marked, so a reattempt still has to find what's missing.
 * With several correct images a wrong answer says how many they got ("You got 2 of 3
 * correct"), counted against the correct images so leaving one out reads as wrong too.
 */
function ImageChoice({ question }: { question: ImageChoiceQuestion }) {
  const [attempt, setAttempt] = useState(0)
  const [picked, setPicked] = useState<number[]>([])
  const [status, setStatus] = useState<FeedbackStatus>('idle')
  const [announce, setAnnounce] = useState('')
  /* The wrong answer's heading; unset for a right one, or with one correct image. */
  const [verdict, setVerdict] = useState<string>()
  const locked = status !== 'idle'
  const multiple = question.multipleCorrect ?? question.correctIndices.length > 1

  function toggle(index: number) {
    if (locked) return
    if (!multiple) {
      if (picked.includes(index)) return
      setPicked([index])
      setAnnounce(`Selected option ${index + 1}`)
      cue('select')
      return
    }
    const on = picked.includes(index)
    setPicked((p) => (on ? p.filter((i) => i !== index) : [...p, index]))
    setAnnounce(`${on ? 'Removed' : 'Selected'} option ${index + 1}`)
    cue(on ? 'remove' : 'select')
  }

  function check() {
    const { right, hits, total } = gradeImageChoice(picked, question.correctIndices)
    const count = !right && multiple ? `You got ${hits} of ${total} correct` : undefined
    setStatus(right ? 'correct' : 'incorrect')
    setVerdict(count)
    setAnnounce(right ? 'Correct' : count ?? 'Not quite')
    cue(right ? 'correct' : 'incorrect')
  }

  function reset() {
    setPicked([])
    setStatus('idle')
    setVerdict(undefined)
    setAnnounce('')
    setAttempt((a) => a + 1)
    cue('continue')
  }

  const isCorrect = (index: number) => question.correctIndices.includes(index)
  /* The admin's optional words under an image; the option's accessible name carries them. */
  const labelOf = (index: number) => question.labels?.[index]?.trim() || ''
  const optionName = (index: number) => `Option ${index + 1}${labelOf(index) ? `, ${labelOf(index)}` : ''}`

  const tileClass = (index: number) => {
    const classes = ['ql-token', 'ql-imgchoice__tile']
    if (locked) {
      classes.push('ql-token--locked')
      if (picked.includes(index)) classes.push(isCorrect(index) ? 'ql-token--correct' : 'ql-token--incorrect')
    } else if (picked.includes(index)) {
      classes.push('ql-token--selected')
    }
    return classes.join(' ')
  }


  return (
    <div className="ql-screen" key={attempt}>
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__q">{question.prompt}</span>
          <span className="ql-imgchoice__hint">{multiple ? 'Select all that apply' : 'Select one image'}</span>
        </div>

        <div className={`ql-imgchoice__grid${question.images.length === 3 ? ' ql-imgchoice__grid--three' : ''}`} role={multiple ? 'group' : 'radiogroup'} aria-label="Options">
          {question.images.map((src, index) =>
            locked ? (
              <div key={index} className={tileClass(index)}>
                <span className="ql-imgchoice__frame">
                  <img className="ql-imgchoice__img" src={src} alt="" />
                </span>
                {labelOf(index) && <span className="ql-imgchoice__label">{labelOf(index)}</span>}
                {picked.includes(index) ? (
                  <span className="ql-imgchoice__mark" aria-label={`${optionName(index)}, ${isCorrect(index) ? 'correct' : 'wrong'}`}>
                    {isCorrect(index) ? (
                      <TickCircle size={32} color="currentColor" variant="Bold" />
                    ) : (
                      <CloseCircle size={32} color="currentColor" variant="Bold" />
                    )}
                  </span>
                ) : null}
              </div>
            ) : (
              /* A label, so a tap anywhere on the tile reaches the control inside it,
                 which carries the focus, the name and the checked state. */
              <label key={index} className={tileClass(index)}>
                <span className="ql-imgchoice__frame">
                  <img className="ql-imgchoice__img" src={src} alt="" />
                </span>
                {labelOf(index) && <span className="ql-imgchoice__label">{labelOf(index)}</span>}
                {multiple ? (
                  <Checkbox
                    className="ql-imgchoice__check"
                    checked={picked.includes(index)}
                    onChange={() => toggle(index)}
                    ariaLabel={optionName(index)}
                  />
                ) : (
                  <Radio
                    className="ql-imgchoice__check"
                    name={`image-choice-${attempt}`}
                    checked={picked.includes(index)}
                    onChange={() => toggle(index)}
                    aria-label={optionName(index)}
                  />
                )}
              </label>
            ),
          )}
        </div>

        <ResultBanner status={status} title={verdict} explanation={question.explanation || undefined} />
      </div>

      <div className="ql-sr-only" role="status" aria-live="polite">
        {announce}
      </div>

      <FeedbackFooter
        status={status}
        checkDisabled={picked.length === 0}
        onCheck={check}
        onContinue={reset}
      />
    </div>
  )
}

export default ImageChoice
