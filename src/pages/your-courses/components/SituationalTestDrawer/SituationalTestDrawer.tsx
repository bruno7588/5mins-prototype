import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Add, ArrowDown2, ArrowLeft, ArrowUp2, Trash } from 'iconsax-react'
import InfoIcon from '@/components/icons/InfoIcon'
import SparkleIcon from '@/components/icons/SparkleIcon'
import AIWorkingCard from '@/components/AIWorkingCard/AIWorkingCard'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import Collapse from '@/components/Collapse/Collapse'
import Radio from '@/components/Radio/Radio'
import Tooltip from '@/components/Tooltip/Tooltip'
import SectionHeader from '../SectionHeader/SectionHeader'
import ContextSources from './ContextSources'
import {
  generateMoreSituationalQuestions,
  generateSituationalTest,
} from './generateSituationalTest'
import './SituationalTestDrawer.css'

/* Four labels because the progress ladder has four beats — the card's activeStep maps
   1:1 onto aiStep, so any other length would light the wrong row. */
const AI_STEPS = [
  'Reading your brief',
  'Writing the brief',
  'Building the questions',
  'Done',
]

const AI_MORE_STEPS = [
  'Re-reading the brief',
  'Drafting more questions',
  'Checking the options',
  'Done',
]

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
}

export interface SituationalTestData {
  id: number
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
})

/* Question and option fields wrap instead of truncating — an admin reviewing generated
   content has to be able to read all of it, and AI options run long. Passed as both a
   ref callback and an onInput handler: the ref sizes content that arrives from state
   (a generation), the handler sizes it as the admin types. */
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
   mount and would otherwise make a pristine form look edited.

   Context sources are a generation input and never reach onSave, so strictly they can't
   be "unsaved". They're in here anyway: dirty means the admin has put work into this
   form, and losing an attached policy to a stray Escape is exactly what the discard
   guard exists to prevent. */
const snapshot = (brief: string, questions: SituationalQuestion[], sources: string[]) =>
  JSON.stringify({
    brief,
    questions: questions.map((q) => ({ t: q.text, o: q.options, c: q.correctIndex })),
    sources,
  })

interface Props {
  /** Prefilled when reopened from the course outline (FR-4); null when creating. */
  initial?: SituationalTestData | null
  onClose: () => void
  onSave: (brief: string, questions: SituationalQuestion[]) => void
  /** Lets the page guard the close paths while there is unsaved work. */
  onDirtyChange?: (dirty: boolean) => void
}

/* Situational test authoring, PRD DES-276. Two steps inside one drawer: the brief sets
   the scene, then the multiple-choice questions that judge it. The brief is mandatory
   before questions — deliberate friction so it exists before the questions that depend
   on it. */
function SituationalTestDrawerContent({ initial = null, onClose, onSave, onDirtyChange }: Props) {
  const isEdit = !!initial
  /* Editing jumps straight to the questions; the brief is one click away. */
  const [step, setStep] = useState<1 | 2>(initial ? 2 : 1)
  const [brief, setBrief] = useState(initial?.brief ?? '')
  const [briefBlurred, setBriefBlurred] = useState(false)
  const [questions, setQuestions] = useState<SituationalQuestion[]>(
    () => initial?.questions ?? [makeQuestion()],
  )
  /* Which question texts have been blurred — validation fires on blur, not on submit. */
  const [blurredQuestions, setBlurredQuestions] = useState<Set<string>>(new Set())
  /* Step 1 reached backwards from the questions — the CTA then just saves the brief. */
  const [returnedToBrief, setReturnedToBrief] = useState(false)
  /* Reopening a finished test starts every question folded so the whole thing can be
     scanned at once; questions you are writing start open. */
  const [collapsedQuestions, setCollapsedQuestions] = useState<Set<string>>(
    () => new Set(initial ? initial.questions.map((q) => q.id) : []),
  )

  /* Generation input. Not persisted — see the note on snapshot(). */
  const [sources, setSources] = useState<string[]>([])

  /* Transient generation state, deliberately outside the dirty snapshot. */
  const [aiLoading, setAiLoading] = useState(false)
  const [aiProgress, setAiProgress] = useState(0)
  const [aiStep, setAiStep] = useState(0)
  const [aiMoreLoading, setAiMoreLoading] = useState(false)
  /* How many times "Generate With AI" has run on step 2, so each press serves the next
     pair from the pack rather than repeating the first one. */
  const [aiMoreRound, setAiMoreRound] = useState(0)
  const timers = useRef<number[]>([])
  const cancelled = useRef(false)

  /* Escape mid-generation unmounts the drawer with timers and a promise still in
     flight; without this they keep firing into a dead component. Re-armed on mount
     rather than only torn down on unmount: StrictMode's double-invoke would otherwise
     latch the flag on first mount and swallow every generation in dev. */
  useEffect(() => {
    cancelled.current = false
    return () => {
      cancelled.current = true
      timers.current.forEach(clearTimeout)
    }
  }, [])

  /* The brief field hugs two lines and grows with its content. Height has to be reset to
     auto before reading scrollHeight, or the box can only ever get taller. Runs on `step`
     too, since the textarea unmounts when the questions step is showing. */
  const briefRef = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    autoGrow(briefRef.current)
  }, [brief, step, aiLoading])

  const briefFilled = brief.trim().length > 0
  const briefError = briefBlurred && !briefFilled

  /* Captured from the first render's own state, not from `initial` — creating a test
     seeds one blank question, so a baseline built from `initial` alone reads as edited
     before the admin has typed anything. */
  const pristine = useRef<string | null>(null)
  const current = snapshot(brief, questions, sources)
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

  const canContinue = briefFilled
  const canSave = questions.length > 0 && questions.every(questionIsComplete)

  /* Generating replaces the brief and every question, so the offer is withdrawn the
     moment there is work to destroy. Covers both routes in: straight after a generation,
     and coming back from step 2 via Edit Brief with questions already written. Editing a
     saved test starts on step 2, so the CTA never appears there either. */
  const hasQuestionContent = questions.some(
    (q) => q.text.trim() || q.options.some((o) => o.trim()),
  )

  /* Fake progress against the mock's fixed 2s, mirroring the roles panel. The ladder is
     cosmetic — the resolve is what actually gates the result. */
  const runProgressLadder = () => {
    setAiProgress(0)
    setAiStep(0)
    timers.current.push(
      setTimeout(() => { setAiProgress(35); setAiStep(1) }, 300),
      setTimeout(() => { setAiProgress(65); setAiStep(2) }, 800),
      setTimeout(() => setAiProgress(85), 1200),
    )
  }

  const handleGenerate = async () => {
    if (!canContinue) {
      setBriefBlurred(true)
      return
    }
    setAiLoading(true)
    runProgressLadder()

    const result = await generateSituationalTest(brief, sources)
    if (cancelled.current) return

    setAiProgress(100)
    setAiStep(3)
    timers.current.push(
      setTimeout(() => {
        if (cancelled.current) return
        setBrief(result.brief)
        /* makeQuestion() stays the only id source, so the generated questions slot into
           the same numbering as hand-written ones. */
        setQuestions(result.questions.map((q) => ({ ...makeQuestion(), ...q })))
        setCollapsedQuestions(new Set())
        setAiLoading(false)
      }, 400),
    )
  }

  const handleGenerateMore = async () => {
    setAiMoreLoading(true)
    runProgressLadder()

    const extras = await generateMoreSituationalQuestions(brief, sources, aiMoreRound)
    if (cancelled.current) return

    setAiProgress(100)
    setAiStep(3)
    timers.current.push(
      setTimeout(() => {
        if (cancelled.current) return
        /* Appended, never replacing — the existing list and its collapsed state survive. */
        setQuestions((prev) => [...prev, ...extras.map((q) => ({ ...makeQuestion(), ...q }))])
        setAiMoreLoading(false)
        setAiMoreRound((r) => r + 1)
      }, 400),
    )
  }

  const handleContinue = () => {
    if (!canContinue) {
      setBriefBlurred(true)
      return
    }
    setStep(2)
  }

  const handleSave = () => {
    onSave(
      brief.trim(),
      /* Blank options are dropped, so the correct index has to be re-derived against the
         kept ones — carrying the raw index over would point at the wrong answer. */
      questions.map((q) => {
        const correct = q.options[q.correctIndex]
        const options = q.options.filter((o) => o.trim().length > 0)
        return { ...q, options, correctIndex: options.indexOf(correct) }
      }),
    )
  }

  return (
    <>
      <SectionHeader
        /* Step 2 names the step rather than the object: the back arrow beside it already
           says which object you are inside, and the questions need no further preamble. */
        title={
          step === 2
            ? 'Add questions'
            : isEdit
              ? 'Edit Situational Test'
              : 'Add Situational Test'
        }
        description={step === 1 ? 'Write the brief learners will be tested on' : undefined}
        ctas={<CloseButton onClick={onClose} />}
        /* Step 2's only route back to the brief, replacing the footer's Edit Brief
           button (Figma 8998:55648). */
        leading={
          step === 2 ? (
            <button
              type="button"
              className="st-drawer__back"
              aria-label="Back to the brief"
              onClick={() => {
                setReturnedToBrief(true)
                setStep(1)
              }}
            >
              <ArrowLeft size={16} color="currentColor" variant="Linear" />
            </button>
          ) : undefined
        }
      />

      <div className="st-drawer__body">
        {step === 1 ? (
          aiLoading ? (
            /* Rendered where the brief will land, so the card doubles as its placeholder. */
            <>
              <AIWorkingCard steps={AI_STEPS} activeStep={aiStep} progress={aiProgress} />
              {/* The admin's own words stay on screen while AI rewrites them, with a
                  shimmer sweeping the text so it reads as being worked on rather than
                  frozen. Rendered as text, not a field — it is not editable right now. */}
              {brief.trim() && (
                <div className="st-drawer__field">
                  <span className="st-drawer__label st-drawer__label--section">Brief</span>
                  <p className="st-drawer__brief-shimmer">{brief}</p>
                </div>
              )}
            </>
          ) : (
          <>
            <GuidanceCallout
              title="Guidelines for writing a brief"
              bullets={[
                'Position — who the learner is in this situation',
                'Situation — the context, tied to the skill being tested',
                'Complication — the specific thing they have to respond to',
                'Question and goal — what to decide, and what a good answer achieves',
              ]}
            />

            <div className="st-drawer__field">
              <label className="st-drawer__label st-drawer__label--section" htmlFor="st-brief">
                Brief{' '}
                {/* Says the quiet part before it happens: Generate rewrites this field.
                    Withdrawn once there's generated work, when it stops being true. */}
                {!hasQuestionContent && (
                  <span className="st-drawer__label-hint">
                    (a rough outline is enough - AI will rewrite it in full)
                  </span>
                )}
              </label>
              <textarea
                ref={briefRef}
                id="st-brief"
                className={`st-drawer__textarea${briefError ? ' st-drawer__textarea--error' : ''}`}
                rows={2}
                placeholder="Describe a realistic situation the learner might face, the complication they run into, and the decision you want them to make…"
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

            {/* Only feeds generation, so it's withdrawn alongside the Generate CTA —
                otherwise editing a saved test shows an input that cannot do anything. */}
            {!hasQuestionContent && (
              <ContextSources sources={sources} onChange={setSources} />
            )}
          </>
          )
        ) : (
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
                  </div>
                  </Collapse>
                </div>
              )
            })}

            {/* Below the list, where the new questions will appear — the existing ones
                stay mounted and keep their scroll position and collapsed state. */}
            {aiMoreLoading && (
              <AIWorkingCard
                steps={AI_MORE_STEPS}
                activeStep={aiStep}
                progress={aiProgress}
              />
            )}

            <div className="st-drawer__question-actions">
              <Button
                variant="outlined-2"
                icon={<Add size={20} color="currentColor" variant="Linear" />}
                onClick={() => setQuestions((prev) => [...prev, makeQuestion()])}
              >
                Add Question
              </Button>
              {/* Stays put once used — generating more is a repeatable action, not a
                  one-shot, so the control shouldn't vanish out from under the admin. */}
              {!aiMoreLoading && (
                <Button
                  semantic="ai"
                  variant="outlined"
                  /* The outlined AI button gradient-clips its icon slot to *text*, so a
                     currentColor glyph resolves to transparent and vanishes. The icon
                     paints its own gradient instead — same ladder as the label. */
                  icon={<SparkleIcon size={20} gradient />}
                  onClick={handleGenerateMore}
                >
                  Generate With AI
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="st-drawer__footer">
        <div className="st-drawer__footer-actions">
          {step === 1 ? (
            /* Nothing to offer while it generates — the working card is the whole state. */
            aiLoading ? null : hasQuestionContent ? (
              <Button onClick={handleContinue} disabled={!canContinue}>
                {returnedToBrief ? 'Save Brief' : 'Review Questions'}
              </Button>
            ) : (
              <>
                {/* Wrapped rather than conditionally rendered so the tooltip fires over
                    the *disabled* button — handlers sit on Tooltip's own wrapper. */}
                <Tooltip
                  text="Write a brief first"
                  position="Top"
                  alignment="Start"
                  icon={false}
                  disabled={briefFilled}
                >
                  <Button
                    semantic="ai"
                    icon={<SparkleIcon size={20} />}
                    onClick={handleGenerate}
                    disabled={!canContinue}
                  >
                    Generate With AI
                  </Button>
                </Tooltip>
                <Tooltip
                  text="Write a brief first"
                  position="Top"
                  alignment="Start"
                  icon={false}
                  disabled={briefFilled}
                >
                  <Button variant="outlined" onClick={handleContinue} disabled={!canContinue}>
                    Add Questions Manually
                  </Button>
                </Tooltip>
              </>
            )
          ) : (
            /* Getting back to the brief is the header's back arrow, not a footer button. */
            <Button onClick={handleSave} disabled={!canSave}>
              {isEdit ? 'Update Situational Test' : 'Create Situational Test'}
            </Button>
          )}
        </div>
        <span className="st-drawer__step-indicator">Step {step} of 2</span>
      </div>
    </>
  )
}

export default SituationalTestDrawerContent
