import { useState } from 'react'
import { Add, ArrowDown2, ArrowUp2, Trash } from 'iconsax-react'
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
}

export interface SituationalTestData {
  id: number
  brief: string
  questions: SituationalQuestion[]
}

/* Soft targets from the SJT authoring research (PRD FR-2 / FR-3): over-length is a
   warning, never a block. */
const BRIEF_WORD_TARGET = 80
const OPTION_WORD_TARGET = 25

const countWords = (value: string) => {
  const trimmed = value.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
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

const questionIsComplete = (q: SituationalQuestion) =>
  q.text.trim().length > 0 &&
  q.options.filter((o) => o.trim().length > 0).length >= 2 &&
  (q.options[q.correctIndex] ?? '').trim().length > 0

interface Props {
  /** Prefilled when reopened from the course outline (FR-4); null when creating. */
  initial?: SituationalTestData | null
  onClose: () => void
  onSave: (brief: string, questions: SituationalQuestion[]) => void
}

/* Situational test authoring, PRD DES-276. Two steps inside one drawer: the scenario
   brief sets the scene, then the multiple-choice questions that judge it. The brief is
   mandatory before questions — deliberate friction so the scenario exists before the
   questions that depend on it. */
function SituationalTestDrawerContent({ initial = null, onClose, onSave }: Props) {
  const isEdit = !!initial
  /* Editing jumps straight to the questions; the brief is one click away. */
  const [step, setStep] = useState<1 | 2>(initial ? 2 : 1)
  const [brief, setBrief] = useState(initial?.brief ?? '')
  const [briefBlurred, setBriefBlurred] = useState(false)
  const [questions, setQuestions] = useState<SituationalQuestion[]>(
    initial?.questions ?? [makeQuestion()],
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

  const briefWords = countWords(brief)
  const briefFilled = brief.trim().length > 0
  const briefError = briefBlurred && !briefFilled

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
        title={isEdit ? 'Edit situational test' : 'Add situational test'}
        description={
          step === 1
            ? 'Set the scene learners will be judged on'
            : 'Add the multiple-choice questions that judge this scenario'
        }
        ctas={<CloseButton onClick={onClose} />}
      />

      <div className="st-drawer__body">
        {step === 1 ? (
          <>
            <GuidanceCallout
              title="A strong scenario has four parts"
              bullets={[
                'Position — who the learner is in this situation',
                'Situation — the context, tied to the skill being tested',
                'Complication — the specific thing they have to respond to',
                'Question and goal — what to decide, and what a good answer achieves',
              ]}
            />

            <div className="st-drawer__field">
              <label className="st-drawer__label" htmlFor="st-brief">
                Scenario brief
              </label>
              <textarea
                id="st-brief"
                className={`st-drawer__textarea${briefError ? ' st-drawer__textarea--error' : ''}`}
                rows={7}
                placeholder="Describe a realistic situation the learner might face, the complication they run into, and the decision you want them to make…"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                onBlur={() => setBriefBlurred(true)}
                aria-invalid={briefError || undefined}
                aria-describedby="st-brief-helper"
              />
              <div className="st-drawer__helper-row" id="st-brief-helper">
                {briefError && (
                  <span className="st-drawer__helper st-drawer__helper--error">
                    Please enter a scenario brief.
                  </span>
                )}
                <span
                  className={`st-drawer__count${briefWords > BRIEF_WORD_TARGET ? ' st-drawer__count--over' : ''}`}
                >
                  {briefWords > BRIEF_WORD_TARGET
                    ? `${briefWords} words — aim for ${BRIEF_WORD_TARGET} or fewer`
                    : `${briefWords} / ${BRIEF_WORD_TARGET} words`}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* The brief stays in view so questions can be written against it. Label and
                action sit above the box, like every other field's label. */}
            <div className="st-drawer__field">
              <div className="st-drawer__brief-summary-head">
                <span className="st-drawer__label">Scenario brief</span>
                <button
                  type="button"
                  className="st-drawer__link"
                  onClick={() => {
                    setReturnedToBrief(true)
                    setStep(1)
                  }}
                >
                  Edit Brief
                </button>
              </div>
              <p className="st-drawer__brief-text">{brief}</p>
            </div>

            <GuidanceCallout
              title="Writing the options"
              bullets={[
                'Each question should test a single skill from the scenario',
                'Options are actions the learner could take, never the outcomes of those actions',
                'Keep every option plausible — an obviously wrong option tests nothing',
              ]}
            />

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
                      {/* Folded rows carry their question text so the list stays readable. */}
                      {!isOpen && question.text.trim() && (
                        <span className="st-drawer__question-preview">{question.text}</span>
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

                  <Collapse open={isOpen}>
                  <div className="st-drawer__question-body">
                  <div className="st-drawer__field">
                    <input
                      className={`st-drawer__input${textError ? ' st-drawer__input--error' : ''}`}
                      type="text"
                      placeholder="Write your question here..."
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      onBlur={() => markQuestionBlurred(question.id)}
                      aria-label={`Question ${index + 1} text`}
                      aria-invalid={textError || undefined}
                    />
                    {textError && (
                      <span className="st-drawer__helper st-drawer__helper--error">
                        Please write the question.
                      </span>
                    )}
                  </div>

                  <div className="st-drawer__field">
                    <span className="st-drawer__label">What are the options?</span>
                    <div className="st-drawer__options">
                      {question.options.map((option, optionIndex) => {
                        const optionWords = countWords(option)
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
                              <input
                                className="st-drawer__option-input"
                                type="text"
                                placeholder={`Write option ${optionIndex + 1} here...`}
                                value={option}
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
                            </div>
                            {optionWords > OPTION_WORD_TARGET && (
                              <span className="st-drawer__count st-drawer__count--over st-drawer__count--option">
                                {optionWords} words — aim for {OPTION_WORD_TARGET} or fewer
                              </span>
                            )}
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
                    {optionsError && (
                      <span className="st-drawer__helper st-drawer__helper--error">
                        Each question needs at least 2 answer options.
                      </span>
                    )}
                    {!optionsError && correctBlank && (
                      <span className="st-drawer__helper st-drawer__helper--error">
                        Mark one of the filled options as correct.
                      </span>
                    )}
                  </div>
                  </div>
                  </Collapse>
                </div>
              )
            })}

            <button
              className="st-drawer__add-question"
              type="button"
              onClick={() => setQuestions((prev) => [...prev, makeQuestion()])}
            >
              <Add size={24} color="currentColor" variant="Linear" />
              <span>Add Question</span>
            </button>
          </>
        )}
      </div>

      <div className="st-drawer__footer">
        {step === 1 ? (
          <Button onClick={handleContinue} disabled={!canContinue}>
            {returnedToBrief ? 'Save Brief' : 'Save Brief & Add Questions'}
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={!canSave}>
            {isEdit ? 'Save Changes' : 'Save'}
          </Button>
        )}
        <span className="st-drawer__step-indicator">Step {step} of 2</span>
      </div>
    </>
  )
}

export default SituationalTestDrawerContent
