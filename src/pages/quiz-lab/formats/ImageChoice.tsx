import { useState } from 'react'
import { CloseCircle, TickCircle } from 'iconsax-react'
import Checkbox from '@/components/Checkbox/Checkbox'
import Radio from '@/components/Radio/Radio'
import { gradeImageChoice, type ImageChoiceQuestion } from '../quizData'
import FeedbackFooter from '../components/FeedbackFooter'
import ResultBanner from '../components/ResultBanner'
import type { FeedbackStatus } from '../components/FeedbackFooter'
import { cue } from '../quizSound'

type Grade = ReturnType<typeof gradeImageChoice>

const images = (n: number) => (n === 1 ? 'image' : 'images')

/* Names what went right before saying why it still failed: a correct pick beside a
   wrong result only makes sense once the learner can see the rule and the gap. */
function feedback(g: Grade, multiple: boolean): { title?: string; line: string } {
  if (g.right) return { line: '' }
  if (!multiple) return { line: "That isn't the correct image. The correct one is outlined in green." }
  if (g.hits === 0) {
    return {
      line: `None of your picks were correct. The correct ${g.total === 1 ? 'image is' : 'images are'} outlined in green.`,
    }
  }
  if (g.wrongPicks === 0) {
    return {
      title: 'Partly right',
      line: `You got ${g.hits} of ${g.total} correct images but missed ${g.missed}. Select every correct image to get it right.`,
    }
  }
  const missed = g.missed > 0 ? ` and missed ${g.missed}` : ''
  return {
    line: `You got ${g.hits} of ${g.total} correct images, picked ${g.wrongPicks} wrong ${images(g.wrongPicks)}${missed}.`,
  }
}

/**
 * Image Choice (DES-345). The images are the answers, and one of them is right unless
 * the admin allowed more than one.
 *
 * Each option is a quiz token framing a square image, with a DS control in its corner:
 * a radio when one image is right ("Select one image"), a checkbox when several can be
 * ("Select all that apply"). Tap the tile, then Check. With several, the prompt never
 * says how many are right, so the count does not give the answer away.
 *
 * Right only when the picks are exactly the correct set. Once graded every image
 * stays: right picks green with a tick, wrong picks red with a cross, and correct
 * images the learner left out in a dashed green frame, so the reason for a fail is on
 * screen rather than only in the copy.
 */
function ImageChoice({ question }: { question: ImageChoiceQuestion }) {
  const [attempt, setAttempt] = useState(0)
  const [picked, setPicked] = useState<number[]>([])
  const [status, setStatus] = useState<FeedbackStatus>('idle')
  const [grade, setGrade] = useState<Grade | null>(null)
  const [announce, setAnnounce] = useState('')
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
    const result = gradeImageChoice(picked, question.correctIndices)
    const { title, line } = feedback(result, multiple)
    setGrade(result)
    setStatus(result.right ? 'correct' : 'incorrect')
    setAnnounce(result.right ? 'Correct' : `${title ?? 'Not quite'}. ${line}`)
    cue(result.right ? 'correct' : 'incorrect')
  }

  function reset() {
    setPicked([])
    setStatus('idle')
    setGrade(null)
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
      else if (isCorrect(index)) classes.push('ql-imgchoice__tile--missed')
    } else if (picked.includes(index)) {
      classes.push('ql-token--selected')
    }
    return classes.join(' ')
  }

  const title = grade ? feedback(grade, multiple).title : undefined
  /* On screen the marks on the images say what went right and wrong, so only the heading
     and the admin's own explanation show; the counts are for screen readers (announce). */
  const explanation = question.explanation

  return (
    <div className="ql-screen" key={attempt}>
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__q">{question.prompt}</span>
          <span className="ql-imgchoice__hint">{multiple ? 'Select all that apply' : 'Select one image'}</span>
        </div>

        <div className="ql-imgchoice__grid" role={multiple ? 'group' : 'radiogroup'} aria-label="Options">
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
                ) : isCorrect(index) ? (
                  <span className="ql-sr-only">{optionName(index)}, missed correct image</span>
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

        <ResultBanner status={status} title={title} explanation={explanation || undefined} />
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
