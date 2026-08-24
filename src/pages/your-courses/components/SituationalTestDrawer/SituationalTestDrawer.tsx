import { useEffect, useRef, useState } from 'react'
import { Add, ArrowDown2, ArrowLeft, ArrowUp2, Danger } from 'iconsax-react'
import InfoIcon from '@/components/icons/InfoIcon'
import SparkleIcon from '@/components/icons/SparkleIcon'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import Collapse from '@/components/Collapse/Collapse'
import Tooltip from '@/components/Tooltip/Tooltip'
import { autoGrow, autoGrowRef } from '../InteractiveDrawer/autoGrow'
import '../InteractiveDrawer/InteractiveDrawer.css'
import QuestionCard from '../QuestionCard/QuestionCard'
import SectionHeader from '../SectionHeader/SectionHeader'
import SituationalTestPreview from '../SituationalTestPreview/SituationalTestPreview'
import { type GeneratableType } from '@/data/aiAssessmentGeneration'
import { type InteractiveQuestion } from '@/data/interactiveQuestions'
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

  /* Generate Again replaces the draft outright. That was harmless while the review was
     read-only; now that the questions are editable it can take edits with it, so it asks
     first — but only once there is something to lose. */
  const [confirmRegenerate, setConfirmRegenerate] = useState(false)

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
              /* One option is always marked; it just may be the blank one. */
              const blurred = blurredQuestions.has(question.id)
              return (
                <QuestionCard
                  key={question.id}
                  question={question}
                  label={`Question ${index + 1}`}
                  format={question.format}
                  isOpen={!collapsedQuestions.has(question.id)}
                  onToggle={() => toggleQuestion(question.id)}
                  onRemove={
                    questions.length > 1
                      ? () => setQuestions((prev) => prev.filter((q) => q.id !== question.id))
                      : undefined
                  }
                  /* A draft is edited where it is read. Saving is the approval, so
                     making the admin save before they can fix a question asked them to
                     approve something they had already decided was wrong. */
                  readOnly={false}
                  generated={!!review}
                  edit={{
                    onChange: (patch) => updateQuestion(question.id, patch),
                    onOptionChange: (optionIndex, value) =>
                      updateOption(question.id, optionIndex, value),
                    onAddOption: () => addOption(question.id),
                    onRemoveOption: (optionIndex) => removeOption(question.id, optionIndex),
                    onBlur: () => markQuestionBlurred(question.id),
                    errors: {
                      text: blurred && !question.text.trim(),
                      options: optionQuestion && blurred && filledOptions < 2,
                      correctBlank:
                        marked &&
                        blurred &&
                        filledOptions > 0 &&
                        !(question.options[question.correctIndex] ?? '').trim(),
                    },
                  }}
                />
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
                onClick={() => (dirty ? setConfirmRegenerate(true) : review.onGenerateAgain())}
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

      {review && (
        <ConfirmModal
          open={confirmRegenerate}
          onClose={() => setConfirmRegenerate(false)}
          ariaLabel="Replace this draft"
        >
          <div className="confirm-modal-header confirm-modal-header--center">
            <div className="confirm-modal-icon">
              <Danger size={56} color="var(--danger-500)" variant="Linear" />
            </div>
            <h2 className="confirm-modal-title">Replace this draft?</h2>
            <p className="confirm-modal-body">
              Generating again writes a new test from scratch. The edits you've made to
              this one can't be recovered.
            </p>
          </div>
          <div className="confirm-modal-actions">
            <Button variant="outlined-2" onClick={() => setConfirmRegenerate(false)}>
              Keep This Draft
            </Button>
            <Button
              semantic="danger"
              onClick={() => {
                setConfirmRegenerate(false)
                review.onGenerateAgain()
              }}
            >
              Generate Again
            </Button>
          </div>
        </ConfirmModal>
      )}
    </>
  )
}

export default SituationalTestDrawerContent
