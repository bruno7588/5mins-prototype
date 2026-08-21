import { useEffect, useRef, useState } from 'react'
import { Add, ArrowDown2, ArrowLeft, ArrowUp2, Trash } from 'iconsax-react'
import InfoIcon from '@/components/icons/InfoIcon'
import SparkleIcon from '@/components/icons/SparkleIcon'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import Collapse from '@/components/Collapse/Collapse'
import Radio from '@/components/Radio/Radio'
import Tooltip from '@/components/Tooltip/Tooltip'
import CategorizationBody from '../InteractiveDrawer/bodies/CategorizationBody'
import FillBlankBody from '../InteractiveDrawer/bodies/FillBlankBody'
import MatchPairsBody from '../InteractiveDrawer/bodies/MatchPairsBody'
import SequencingBody from '../InteractiveDrawer/bodies/SequencingBody'
import { autoGrow, autoGrowRef } from '../InteractiveDrawer/autoGrow'
import '../InteractiveDrawer/InteractiveDrawer.css'
import SectionHeader from '../SectionHeader/SectionHeader'
import SituationalTestPreview from '../SituationalTestPreview/SituationalTestPreview'
import { typeLabel, type GeneratableType } from '@/data/aiAssessmentGeneration'
import {
  toDraft,
  toQuestion,
  type Draft,
  type InteractiveQuestion,
} from '@/data/interactiveQuestions'
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
  /** Generated questions carry the format they were written for — it is what the admin
   *  picked, and what the preview renders. Absent on hand-authored ones, which are
   *  option questions by construction. */
  format?: GeneratableType
  /** The four interactive formats can't be expressed as a flat option list, so they
   *  bring the structure the learner actually meets. */
  interactive?: InteractiveQuestion
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

/* A question is answered with options unless its format says otherwise: the four
   interactive formats carry a structure instead, and short text and exercise are
   answered in the learner's own words. Hand-authored questions carry no format at all
   and are option questions by construction. */
const isOptionQuestion = (q: SituationalQuestion) =>
  !q.interactive && q.format !== 'short-text' && q.format !== 'exercise'

/* A poll asks; it doesn't mark. Everything else has exactly one right answer. */
const marksCorrect = (q: SituationalQuestion) => isOptionQuestion(q) && q.format !== 'poll'

const questionIsComplete = (q: SituationalQuestion) => {
  if (q.text.trim().length === 0) return false
  if (!isOptionQuestion(q)) return true
  const filled = q.options.filter((o) => o.trim().length > 0).length
  if (filled < 2) return false
  return !marksCorrect(q) || (q.options[q.correctIndex] ?? '').trim().length > 0
}

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
  /**
   * AI review (DES-279): the same two-pane editor, holding a generated draft that
   * hasn't been added to the course yet. Nothing about the form changes — the admin
   * reads and edits it exactly as they would their own — only what the surface calls
   * itself, and the extra way out: ask for a different draft.
   */
  review?: { onGenerateAgain: () => void }
}

/* Situational test authoring, PRD DES-276. Two steps inside one drawer: the brief sets
   the scene, then the multiple-choice questions that judge it. The brief is mandatory
   before questions — deliberate friction so it exists before the questions that depend
   on it. */
function SituationalTestDrawerContent({
  initial = null, onClose, onSave, onDirtyChange, review,
}: Props) {
  /* A review carries a draft, so it takes the two-pane editor rather than the
     create wizard — there is nothing to gate when the fields arrive filled in. */
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

  /* The draft as the learner would meet it. Review only — an admin approving prose they
     did not write is the one place where seeing it played back is worth a screen. */
  const [previewing, setPreviewing] = useState(false)

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

  /* Steps are for an order you have to go through: creating, you write the brief before
     there are questions to write. Reviewing or editing, both halves already exist and
     either may be the one you came to read — so they are two views of one object, and a
     switcher is what that is (chips-switcher-tabs.md). */
  const twoPane = !!review || isEdit
  const [pane, setPane] = useState<'brief' | 'questions'>('brief')
  const showBrief = twoPane ? pane === 'brief' : step === 1
  const showQuestions = twoPane ? pane === 'questions' : step === 2

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
          twoPane
            ? review ? 'Review situational test' : 'Edit Situational Test'
            : step === 2 ? 'Add questions' : 'Add Situational Test'
        }
        /* No description on the review: it said read this through and edit what you
           disagree with, which is what the surface visibly is — and it cost two lines
           at the top of a screen the admin is here to read. */
        description={
          !review && !isEdit && step === 1 ? 'Write the brief users will be tested on' : undefined
        }
        ctas={<CloseButton onClick={onClose} />}
        /* Step 2's route back to the title and brief (Figma 8998:55648, 9037:62042). */
        leading={
          !twoPane && step === 2 ? (
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
        {twoPane && (
          /* The count rides the label: a segmented control has no counter slot, and the
             page behind this drawer already has a tab bar for its own sections. */
          <ContentSwitcher
            className="st-drawer__panes"
            ariaLabel="Situational test"
            items={[
              { key: 'brief', label: 'Brief' },
              { key: 'questions', label: `Questions (${questions.length})` },
            ]}
            activeKey={pane}
            onChange={(key) => setPane(key as 'brief' | 'questions')}
          />
        )}
        {showBrief ? (
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
                /* Sized on mount and as it is typed into, like every other field here —
                   the pane it lives in mounts when it is switched to, so a measurement
                   tied to anything else arrives too late or not at all. */
                ref={autoGrowRef}
                id="st-brief"
                className={`st-drawer__textarea${briefError ? ' st-drawer__textarea--error' : ''}`}
                /* Hugs its content like every other field here; the two-line floor for
                   the placeholder is CSS, so it applies only while the field is empty. */
                rows={1}
                placeholder="Describe a realistic situation the user might face, the complication they run into, and the decision you want them to make…"
                value={brief}
                onInput={(e) => autoGrow(e.currentTarget)}
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

        {showQuestions ? (
          <>
            {questions.map((question, index) => {
              const optionQuestion = isOptionQuestion(question)
              const marked = marksCorrect(question)
              const filledOptions = question.options.filter((o) => o.trim().length > 0).length
              const textError = blurredQuestions.has(question.id) && !question.text.trim()
              const optionsError =
                optionQuestion && blurredQuestions.has(question.id) && filledOptions < 2
              /* One option is always marked; it just may be the blank one. */
              const correctBlank =
                marked &&
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
                      {/* Generated questions say which format they are: the admin picked
                          the formats, so the output has to show which one it got. */}
                      {question.format && (
                        <span className="st-drawer__question-format">
                          {typeLabel(question.format)}
                        </span>
                      )}
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
                      what identifies the card. Only the answer collapses. */}
                  <div className="st-drawer__question-body">
                  <div className="st-drawer__field">
                    <textarea
                      ref={autoGrowRef}
                      rows={1}
                      className={`st-drawer__input${textError ? ' st-drawer__input--error' : ''}`}
                      readOnly={!!review}
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
                  {question.interactive ? (
                    <InteractiveQuestionBody
                      question={question}
                      onChange={(next) => updateQuestion(question.id, { interactive: next })}
                      readOnly={!!review}
                    />
                  ) : !optionQuestion ? (
                    /* Short text and exercise: there is nothing to author but the
                       question, which is above. */
                    <div className="st-drawer__field">
                      <span className="st-drawer__label">The answer</span>
                      <p className="st-drawer__structure-note">
                        The learner answers in their own words.
                      </p>
                    </div>
                  ) : (
                  <>
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
                              {marked && (
                                <Radio
                                  disabled={!!review}
                                  name={`st-correct-${question.id}`}
                                  checked={isCorrect}
                                  onChange={() =>
                                    updateQuestion(question.id, { correctIndex: optionIndex })
                                  }
                                  aria-label={`Mark option ${optionIndex + 1} of question ${index + 1} as the correct answer`}
                                />
                              )}
                              <textarea
                                ref={autoGrowRef}
                                rows={1}
                                className="st-drawer__option-input"
                                readOnly={!!review}
                                placeholder={`Write option ${optionIndex + 1} here...`}
                                aria-label={`Option ${optionIndex + 1} of question ${index + 1}`}
                                value={option}
                                onInput={(e) => autoGrow(e.currentTarget)}
                                onChange={(e) =>
                                  updateOption(question.id, optionIndex, e.target.value)
                                }
                                onBlur={() => markQuestionBlurred(question.id)}
                              />
                              {marked && isCorrect && (
                                <Badge
                                  type="success"
                                  label="Correct"
                                  className="st-drawer__correct-badge"
                                />
                              )}
                              {/* Two options is the floor, so the last pair can't be
                                  removed and the control simply isn't there. */}
                              {!review && question.options.length > 2 && (
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
                      {!review && (
                        <button
                          className="st-drawer__add-option"
                          type="button"
                          onClick={() => addOption(question.id)}
                        >
                          <Add size={24} color="currentColor" variant="Linear" />
                          <span>Add Option</span>
                        </button>
                      )}
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
                      ref={autoGrowRef}
                      rows={1}
                      id={`${question.id}-explanation`}
                      className="st-drawer__input"
                      readOnly={!!review}
                      placeholder="Write an explanation..."
                      value={question.explanation ?? ''}
                      onInput={(e) => autoGrow(e.currentTarget)}
                      onChange={(e) =>
                        updateQuestion(question.id, { explanation: e.target.value })
                      }
                    />
                  </div>
                  </>
                  )}
                  </div>
                  </Collapse>
                </div>
              )
            })}

            {/* Approve or drop — a generated draft isn't a form to fill in, so there is
                nothing here to add to. Writing questions is the manual path's job. */}
            {!review && (
              <div className="st-drawer__question-actions">
                <Button
                  variant="text"
                  className="st-drawer__add-btn"
                  icon={<Add size={20} color="currentColor" variant="Linear" />}
                  onClick={() => setQuestions((prev) => [...prev, makeQuestion()])}
                >
                  Add Question
                </Button>
              </div>
            )}
          </>
        ) : null}
      </div>

      <div className="st-drawer__footer">
        <div className="st-drawer__footer-actions">
          {review ? (
            /* Both actions sit together on the left: one adds this draft to the course,
               the other throws it away and asks for another. They are alternatives to
               each other, so they read as a pair rather than as opposite ends of a bar.
               AI-Outlined (buttons.md § AI Variants) — the same generative action that
               produced this draft, at secondary weight beside the commit. */
            <>
              <Button onClick={handleSave} disabled={!canSubmit}>
                Save Situational Test
              </Button>
              <Button
                semantic="ai"
                variant="outlined"
                /* The label gradient is background-clip: text, which an SVG cannot take —
                   so the sparkle paints its own, from the same two stops. */
                icon={<SparkleIcon size={20} gradient />}
                onClick={review.onGenerateAgain}
              >
                Generate Again
              </Button>
            </>
          ) : isEdit ? (
            /* One commit for the whole test, whichever pane is showing — the switcher
               moved the navigation out of the footer, so nothing here is a detour. */
            <Button onClick={handleSave} disabled={!canSubmit}>
              Update Situational Test
            </Button>
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
              Create Situational Test
            </Button>
          )}
        </div>
        {/* Create only. A counter implies a sequence you finish, and on the edit path
            either surface commits, so there is nothing to count down to. */}
        {!twoPane && <span className="st-drawer__step-indicator">Step {step} of 2</span>}
        {/* Opposite the commit actions: the two on the left decide the draft's fate,
            this one only looks at it. */}
        {review && (
          <Button variant="outlined-2" onClick={() => setPreviewing(true)}>
            View
          </Button>
        )}
      </div>

      {previewing && (
        <SituationalTestPreview
          title={title}
          brief={brief}
          questions={questions}
          onClose={() => setPreviewing(false)}
        />
      )}
    </>
  )
}

/**
 * An interactive question, in the form the admin already knows.
 *
 * These four formats are authored from the Assessments menu through
 * `InteractiveDrawer`, whose per-format bodies are the form — so the review shows the
 * same bodies rather than a second, prettier description of the same thing. One shape
 * to learn, one place to fix.
 *
 * The draft is held here rather than derived on every render: `toDraft` mints fresh row
 * ids each call, and a new id per keystroke would remount the field being typed into.
 */
function InteractiveQuestionBody({
  question,
  onChange,
  readOnly,
}: {
  question: SituationalQuestion
  onChange: (next: InteractiveQuestion) => void
  readOnly: boolean
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(question.interactive as InteractiveQuestion))

  const update = (next: Draft) => {
    setDraft(next)
    onChange(toQuestion(next, question.text))
  }

  switch (draft.type) {
    case 'match-pairs':
      return <MatchPairsBody draft={draft} onChange={update} readOnly={readOnly} />
    case 'sequencing':
      return <SequencingBody draft={draft} onChange={update} readOnly={readOnly} />
    case 'categorization':
      return <CategorizationBody draft={draft} onChange={update} readOnly={readOnly} />
    case 'fill-blank':
      return <FillBlankBody draft={draft} onChange={update} readOnly={readOnly} />
  }
}

export default SituationalTestDrawerContent
