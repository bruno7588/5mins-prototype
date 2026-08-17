import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Add, ArrowDown2, ArrowLeft, ArrowUp2, Trash } from 'iconsax-react'
import InfoIcon from '@/components/icons/InfoIcon'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import Collapse from '@/components/Collapse/Collapse'
import Radio from '@/components/Radio/Radio'
import Tooltip from '@/components/Tooltip/Tooltip'
import SectionHeader from '../SectionHeader/SectionHeader'
import './SituationalTestDrawer.css'

/* The DS Callout (alerts-toast.md) with a chevron, so the guidance can be folded away
   once the admin knows it. Built from the Alert component's own classes rather than a
   copy of its styling — only the chevron is local. */
function GuidanceCallout({ title, bullets }: { title: string; bullets: string[] }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="alert alert--callout alert--with-body st-drawer__guidance">
      {/* The platform's own info glyph (Tooltip, PoolHeader) rather than Iconsax's. */}
      <InfoIcon size={20} color="currentColor" className="alert__icon" />
      <div className="alert__body">
        <p className="alert__title">{title}</p>
        <Collapse open={open}>
          <ul className="alert__bullets">
            {bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </Collapse>
      </div>
      <button
        type="button"
        className="st-drawer__guidance-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? `Hide ${title}` : `Show ${title}`}
      >
        {open
          ? <ArrowUp2 size={16} color="currentColor" variant="Linear" />
          : <ArrowDown2 size={16} color="currentColor" variant="Linear" />}
      </button>
    </div>
  )
}

export interface SituationalQuestion {
  id: string
  text: string
  options: string[]
  correctIndex: number
  /** Why the marked option is right. Optional, and dropped on save when left blank. */
  explanation?: string
}

export interface SituationalTestData {
  id: number
  title: string
  brief: string
  questions: SituationalQuestion[]
}

let nextQuestionId = 0
/* The first option is marked correct by default — every question needs exactly one
   answer, so starting from a valid state beats starting from an error. */
const makeQuestion = (): SituationalQuestion => ({
  id: `stq-${nextQuestionId++}`,
  text: '',
  options: ['', ''],
  correctIndex: 0,
  explanation: '',
})

/* Question and option fields wrap instead of truncating — options run long and an admin
   has to be able to read all of one. Passed as both a ref callback and an onInput
   handler: the ref sizes content that arrives from state (a reopened test), the handler
   sizes it as the admin types. */
const autoGrow = (el: HTMLTextAreaElement | null) => {
  if (!el) return
  el.style.height = 'auto'
  /* scrollHeight covers content + padding but not the border, while a border-box height
     has to include it — without this the bordered fields sit 2px short and clip. */
  const border = el.offsetHeight - el.clientHeight
  el.style.height = `${el.scrollHeight + border}px`
}

const questionIsComplete = (q: SituationalQuestion) =>
  q.text.trim().length > 0 &&
  q.options.filter((o) => o.trim().length > 0).length >= 2 &&
  (q.options[q.correctIndex] ?? '').trim().length > 0

/* Only the authored values matter for the dirty check — question ids are generated per
   mount and would otherwise make a pristine form look edited. */
const snapshot = (title: string, brief: string, questions: SituationalQuestion[]) =>
  JSON.stringify({
    title,
    brief,
    questions: questions.map((q) => ({
      t: q.text,
      o: q.options,
      c: q.correctIndex,
      e: q.explanation ?? '',
    })),
  })

interface Props {
  /** Prefilled when reopened from the course outline (FR-4); null when creating. */
  initial?: SituationalTestData | null
  onClose: () => void
  onSave: (title: string, brief: string, questions: SituationalQuestion[]) => void
  /** Lets the page guard the close paths while there is unsaved work. */
  onDirtyChange?: (dirty: boolean) => void
}

/* Situational test authoring, PRD DES-276. Two steps inside one drawer: the brief sets
   the scene, then the multiple-choice questions that judge it. The brief is mandatory
   before questions — deliberate friction so it exists before the questions that depend
   on it. */
function SituationalTestDrawerContent({ initial = null, onClose, onSave, onDirtyChange }: Props) {
  const isEdit = !!initial
  /* Only the create path is stepped — see the note on the body below. */
  const [step, setStep] = useState<1 | 2>(1)
  /* Names the test in the course outline, so it is required the same way the brief is —
     an outline row has to have something to call itself. */
  const [title, setTitle] = useState(initial?.title ?? '')
  const [titleBlurred, setTitleBlurred] = useState(false)
  const [brief, setBrief] = useState(initial?.brief ?? '')
  const [briefBlurred, setBriefBlurred] = useState(false)
  const [questions, setQuestions] = useState<SituationalQuestion[]>(
    () => initial?.questions ?? [makeQuestion()],
  )
  /* Which question texts have been blurred — validation fires on blur, not on submit. */
  const [blurredQuestions, setBlurredQuestions] = useState<Set<string>>(new Set())
  /* Reopening a finished test starts every question folded so the whole thing can be
     scanned at once; questions you are writing start open. */
  const [collapsedQuestions, setCollapsedQuestions] = useState<Set<string>>(
    () => new Set(initial ? initial.questions.map((q) => q.id) : []),
  )

  /* The brief field hugs two lines and grows with its content. Height has to be reset to
     auto before reading scrollHeight, or the box can only ever get taller. Runs on `step`
     too, since the textarea unmounts when the questions step is showing. */
  const briefRef = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    autoGrow(briefRef.current)
  }, [brief, step])

  const titleFilled = title.trim().length > 0
  const titleError = titleBlurred && !titleFilled
  const briefFilled = brief.trim().length > 0
  const briefError = briefBlurred && !briefFilled

  /* Captured from the first render's own state, not from `initial` — creating a test
     seeds one blank question, so a baseline built from `initial` alone reads as edited
     before the admin has typed anything. */
  const pristine = useRef<string | null>(null)
  const current = snapshot(title, brief, questions)
  if (pristine.current === null) pristine.current = current
  const dirty = current !== pristine.current
  useEffect(() => {
    onDirtyChange?.(dirty)
  }, [dirty, onDirtyChange])

  const updateQuestion = (id: string, patch: Partial<SituationalQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)))
  }

  const updateOption = (id: string, index: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, options: q.options.map((o, i) => (i === index ? value : o)) } : q,
      ),
    )
  }

  const addOption = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, options: [...q.options, ''] } : q)),
    )
  }

  /* Dropping an option shifts everything below it, so the marked answer moves with it —
     and if the marked one is what went, the mark falls back to the first option. */
  const removeOption = (id: string, index: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q
        const correctIndex =
          q.correctIndex === index ? 0 : q.correctIndex > index ? q.correctIndex - 1 : q.correctIndex
        return { ...q, options: q.options.filter((_, i) => i !== index), correctIndex }
      }),
    )
  }

  const markQuestionBlurred = (id: string) => {
    setBlurredQuestions((prev) => new Set(prev).add(id))
  }

  const toggleQuestion = (id: string) => {
    setCollapsedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const canContinue = titleFilled && briefFilled
  const canSave = questions.length > 0 && questions.every(questionIsComplete)
  /* The edit form commits every field at once, so it has to check both halves. On create
     this is reached from step 2, where step 1 already gated the title and brief. */
  const canSubmit = canContinue && canSave

  const handleContinue = () => {
    if (!canContinue) {
      setTitleBlurred(true)
      setBriefBlurred(true)
      return
    }
    setStep(2)
  }

  const handleSave = () => {
    onSave(
      title.trim(),
      brief.trim(),
      /* Blank options are dropped, so the correct index has to be re-derived against the
         kept ones — carrying the raw index over would point at the wrong answer. */
      questions.map((q) => {
        const correct = q.options[q.correctIndex]
        const options = q.options.filter((o) => o.trim().length > 0)
        return {
          ...q,
          options,
          correctIndex: options.indexOf(correct),
          /* Optional, so a blank one is dropped rather than saved as an empty string —
             same as the assessment drawer. */
          explanation: q.explanation?.trim() || undefined,
        }
      }),
    )
  }

  return (
    <>
      <SectionHeader
        /* Create's step 2 names the step rather than the object: the back arrow beside it
           already says which object you are inside. The edit form names the object, since
           it is the whole test on one surface. */
        title={
          step === 2
            ? isEdit ? 'Edit questions' : 'Add questions'
            : isEdit ? 'Edit Situational Test' : 'Add Situational Test'
        }
        description={
          !isEdit && step === 1 ? 'Write the brief users will be tested on' : undefined
        }
        ctas={<CloseButton onClick={onClose} />}
        /* Step 2's route back to the title and brief (Figma 8998:55648, 9037:62042). */
        leading={
          step === 2 ? (
            <button
              type="button"
              className="st-drawer__back"
              aria-label="Back to the title and brief"
              onClick={() => setStep(1)}
            >
              <ArrowLeft size={16} color="currentColor" variant="Linear" />
            </button>
          ) : undefined
        }
      />

      {/* Two surfaces on both paths, but they behave differently. Creating gates: the
          brief has to exist before the questions that depend on it, and nothing persists
          until the last step. Editing does not gate — either surface commits the whole
          test, so this is a two-pane editor rather than a wizard, and the step counter is
          create-only (Figma 9037:61788 / 9037:62042). */}
      <div className="st-drawer__body">
        {step === 1 ? (
          <>
            {/* Scaffolding for the blank page, so it is create-only — on a written brief
                it would push the fields the admin came for below the fold. */}
            {!isEdit && (
              <GuidanceCallout
                title="Guidelines for writing a brief"
                bullets={[
                  'Position — who the user is in this situation',
                  'Situation — the context, tied to the skill being tested',
                  'Complication — the specific thing they have to respond to',
                  'Question and goal — what to decide, and what a good answer achieves',
                ]}
              />
            )}

            {/* Single-line: this is the label the outline row carries, not prose — the
                brief below is where the scenario goes. */}
            <div className="st-drawer__field">
              <label className="st-drawer__label" htmlFor="st-title">
                Title
              </label>
              <input
                id="st-title"
                type="text"
                className={`st-drawer__input${titleError ? ' st-drawer__input--error' : ''}`}
                placeholder="Add a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setTitleBlurred(true)}
                aria-invalid={titleError || undefined}
                aria-describedby={titleError ? 'st-title-helper' : undefined}
              />
              {titleError && (
                <span
                  className="st-drawer__helper st-drawer__helper--error"
                  id="st-title-helper"
                  role="alert"
                >
                  Enter a title
                </span>
              )}
            </div>

            <div className="st-drawer__field">
              <label className="st-drawer__label" htmlFor="st-brief">
                Brief
              </label>
              <textarea
                ref={briefRef}
                id="st-brief"
                className={`st-drawer__textarea${briefError ? ' st-drawer__textarea--error' : ''}`}
                /* Hugs its content like every other field here; the two-line floor for
                   the placeholder is CSS, so it applies only while the field is empty. */
                rows={1}
                placeholder="Describe a realistic situation the user might face, the complication they run into, and the decision you want them to make…"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                onBlur={() => setBriefBlurred(true)}
                aria-invalid={briefError || undefined}
                aria-describedby={briefError ? 'st-brief-helper' : undefined}
              />
              {briefError && (
                <span
                  className="st-drawer__helper st-drawer__helper--error"
                  id="st-brief-helper"
                  role="alert"
                >
                  Enter a brief
                </span>
              )}
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            {questions.map((question, index) => {
              const filledOptions = question.options.filter((o) => o.trim().length > 0).length
              const textError = blurredQuestions.has(question.id) && !question.text.trim()
              const optionsError = blurredQuestions.has(question.id) && filledOptions < 2
              /* One option is always marked; it just may be the blank one. */
              const correctBlank =
                blurredQuestions.has(question.id) &&
                filledOptions > 0 &&
                !(question.options[question.correctIndex] ?? '').trim()
              const isOpen = !collapsedQuestions.has(question.id)

              return (
                <div className="st-drawer__question" key={question.id}>
                  <div className="st-drawer__question-head">
                    <button
                      type="button"
                      className="st-drawer__question-toggle"
                      onClick={() => toggleQuestion(question.id)}
                      aria-expanded={isOpen}
                    >
                      <span className="st-drawer__question-index">Question {index + 1}</span>
                    </button>
                    {questions.length > 1 && (
                      <Tooltip
                        text="Remove question"
                        position="Top"
                        alignment="End"
                        icon={false}
                        className="st-drawer__question-remove-tooltip"
                      >
                        <button
                          type="button"
                          className="st-drawer__question-remove"
                          aria-label={`Remove question ${index + 1}`}
                          onClick={() =>
                            setQuestions((prev) => prev.filter((q) => q.id !== question.id))
                          }
                        >
                          <Trash size={20} color="currentColor" variant="Linear" />
                        </button>
                      </Tooltip>
                    )}
                    {/* Chevron last, hard against the card's right edge. */}
                    <button
                      type="button"
                      className="st-drawer__question-chevron"
                      onClick={() => toggleQuestion(question.id)}
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? 'Collapse' : 'Expand'} question ${index + 1}`}
                    >
                      {isOpen
                        ? <ArrowUp2 size={20} color="currentColor" variant="Linear" />
                        : <ArrowDown2 size={20} color="currentColor" variant="Linear" />}
                    </button>
                  </div>

                  {/* The question itself stays visible when the card is folded — it is
                      what identifies the card. Only the options collapse. */}
                  <div className="st-drawer__question-body">
                  <div className="st-drawer__field">
                    <textarea
                      ref={autoGrow}
                      rows={1}
                      className={`st-drawer__input${textError ? ' st-drawer__input--error' : ''}`}
                      placeholder="Write your question here..."
                      value={question.text}
                      onInput={(e) => autoGrow(e.currentTarget)}
                      onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      onBlur={() => markQuestionBlurred(question.id)}
                      aria-label={`Question ${index + 1} text`}
                      aria-invalid={textError || undefined}
                      aria-describedby={textError ? `${question.id}-text-error` : undefined}
                    />
                    {textError && (
                      <span
                        className="st-drawer__helper st-drawer__helper--error"
                        id={`${question.id}-text-error`}
                        role="alert"
                      >
                        Write the question
                      </span>
                    )}
                  </div>
                  </div>

                  <Collapse open={isOpen}>
                  <div className="st-drawer__question-options">
                  <div className="st-drawer__field">
                    <span className="st-drawer__label">What are the options?</span>
                    {/* A group, so the "needs 2 options" / "mark one correct" errors
                        describe the set rather than any single field. */}
                    <div
                      className="st-drawer__options"
                      role="group"
                      aria-label={`Answer options for question ${index + 1}`}
                      aria-describedby={
                        optionsError || correctBlank ? `${question.id}-options-error` : undefined
                      }
                    >
                      {question.options.map((option, optionIndex) => {
                        const isCorrect = question.correctIndex === optionIndex
                        return (
                          <div key={optionIndex}>
                            <div className="st-drawer__option-field">
                              <Radio
                                name={`st-correct-${question.id}`}
                                checked={isCorrect}
                                onChange={() =>
                                  updateQuestion(question.id, { correctIndex: optionIndex })
                                }
                                aria-label={`Mark option ${optionIndex + 1} of question ${index + 1} as the correct answer`}
                              />
                              <textarea
                                ref={autoGrow}
                                rows={1}
                                className="st-drawer__option-input"
                                placeholder={`Write option ${optionIndex + 1} here...`}
                                aria-label={`Option ${optionIndex + 1} of question ${index + 1}`}
                                value={option}
                                onInput={(e) => autoGrow(e.currentTarget)}
                                onChange={(e) =>
                                  updateOption(question.id, optionIndex, e.target.value)
                                }
                                onBlur={() => markQuestionBlurred(question.id)}
                              />
                              {isCorrect && (
                                <Badge
                                  type="success"
                                  label="Correct"
                                  className="st-drawer__correct-badge"
                                />
                              )}
                              {/* Two options is the floor, so the last pair can't be
                                  removed and the control simply isn't there. */}
                              {question.options.length > 2 && (
                                <CloseButton
                                  size={16}
                                  className="st-drawer__option-remove"
                                  ariaLabel={`Remove option ${optionIndex + 1} of question ${index + 1}`}
                                  onClick={() => removeOption(question.id, optionIndex)}
                                />
                              )}
                            </div>
                          </div>
                        )
                      })}
                      <button
                        className="st-drawer__add-option"
                        type="button"
                        onClick={() => addOption(question.id)}
                      >
                        <Add size={24} color="currentColor" variant="Linear" />
                        <span>Add Option</span>
                      </button>
                    </div>
                    {(optionsError || correctBlank) && (
                      <span
                        className="st-drawer__helper st-drawer__helper--error"
                        id={`${question.id}-options-error`}
                        role="alert"
                      >
                        {optionsError ? 'Add at least 2 answer options' : 'Mark the correct answer'}
                      </span>
                    )}
                  </div>

                  {/* Same field as the Add assessment drawer's explanation
                      (AssessmentModal.tsx), down to the label and placeholder. Folds with
                      the options, since it explains which of them is right. */}
                  <div className="st-drawer__field">
                    <label className="st-drawer__label" htmlFor={`${question.id}-explanation`}>
                      Add an explanation for the correct answer{' '}
                      <span className="st-drawer__label-optional">(optional)</span>
                    </label>
                    <textarea
                      ref={autoGrow}
                      rows={1}
                      id={`${question.id}-explanation`}
                      className="st-drawer__input"
                      placeholder="Write an explanation..."
                      value={question.explanation ?? ''}
                      onInput={(e) => autoGrow(e.currentTarget)}
                      onChange={(e) =>
                        updateQuestion(question.id, { explanation: e.target.value })
                      }
                    />
                  </div>
                  </div>
                  </Collapse>
                </div>
              )
            })}

            <div className="st-drawer__question-actions">
              <Button
                variant="outlined-2"
                icon={<Add size={20} color="currentColor" variant="Linear" />}
                onClick={() => setQuestions((prev) => [...prev, makeQuestion()])}
              >
                Add Question
              </Button>
            </div>
          </>
        ) : null}
      </div>

      <div className="st-drawer__footer">
        <div className="st-drawer__footer-actions">
          {isEdit && step === 1 ? (
            <>
              {/* Filled = commit, outlined = navigate: the two buttons differ in kind, so
                  weight is what says which is which. Both surfaces save the same whole
                  test under the same label — Edit Questions carries the title and brief
                  forward and step 2 commits them, so nothing typed here can be lost by
                  going to look at the questions. */}
              <Button onClick={handleSave} disabled={!canSubmit}>
                Update Situational Test
              </Button>
              {/* Names its destination and its size, so the jump is predictable. */}
              <Button variant="outlined" onClick={handleContinue} disabled={!canContinue}>
                Edit Questions ({questions.length})
              </Button>
            </>
          ) : step === 1 ? (
            /* Wrapped rather than conditionally rendered so the tooltip fires over the
               *disabled* button — handlers sit on Tooltip's own wrapper. The label names
               where it goes rather than claiming to save: nothing persists until Create
               Situational Test on step 2. */
            <Tooltip
              /* Names whichever field is actually missing — "write a brief first" over a
                 filled brief would send the admin looking in the wrong place. */
              text={!titleFilled ? 'Name the situational test first' : 'Write a brief first'}
              position="Top"
              alignment="Start"
              icon={false}
              disabled={canContinue}
            >
              <Button onClick={handleContinue} disabled={!canContinue}>
                Add Questions
              </Button>
            </Tooltip>
          ) : (
            /* Same label as step 1's commit — one action shouldn't have two names. */
            <Button onClick={handleSave} disabled={!canSubmit}>
              {isEdit ? 'Update Situational Test' : 'Create Situational Test'}
            </Button>
          )}
        </div>
        {/* Create only. A counter implies a sequence you finish, and on the edit path
            either surface commits, so there is nothing to count down to. */}
        {!isEdit && <span className="st-drawer__step-indicator">Step {step} of 2</span>}
      </div>
    </>
  )
}

export default SituationalTestDrawerContent
