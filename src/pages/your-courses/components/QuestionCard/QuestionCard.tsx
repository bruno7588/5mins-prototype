import { useState } from 'react'
import { Add, ArrowDown2, ArrowUp2, Trash } from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import CloseButton from '@/components/CloseButton/CloseButton'
import Collapse from '@/components/Collapse/Collapse'
import Radio from '@/components/Radio/Radio'
import Tooltip from '@/components/Tooltip/Tooltip'
import CategorizationBody from '../InteractiveDrawer/bodies/CategorizationBody'
import FillBlankBody from '../InteractiveDrawer/bodies/FillBlankBody'
import MatchPairsBody from '../InteractiveDrawer/bodies/MatchPairsBody'
import SequencingBody from '../InteractiveDrawer/bodies/SequencingBody'
import { autoGrow, autoGrowRef } from '../InteractiveDrawer/autoGrow'
import { typeLabel, type GeneratableType } from '@/data/aiAssessmentGeneration'
import {
  toDraft,
  toQuestion,
  type Draft,
  type InteractiveQuestion,
} from '@/data/interactiveQuestions'
import type { SituationalQuestion } from '../SituationalTestDrawer/SituationalTestDrawer'

/* Type-only import above, so this file does not pull the drawer in at runtime — the
   drawer imports this card. */

export interface QuestionCardEdit {
  onChange: (patch: Partial<SituationalQuestion>) => void
  onOptionChange: (optionIndex: number, value: string) => void
  onAddOption: () => void
  onRemoveOption: (optionIndex: number) => void
  onBlur: () => void
  errors: { text: boolean; options: boolean; correctBlank: boolean }
}

interface Props {
  question: SituationalQuestion
  /** What the head calls this card: a numbered question inside a situational test, or
   *  the format of a standalone assessment. */
  label: string
  /** Shown beside the label where the card is one of several formats in one test. */
  format?: GeneratableType
  isOpen: boolean
  onToggle: () => void
  /** Absent where the card cannot be dropped — the last question of a test. */
  onRemove?: () => void
  /** What dropping the card removes: a question inside a test, or a whole assessment. */
  removeLabel?: string
  /** A generated draft being approved: every field is inert and the only actions are
   *  folding the card and dropping it. */
  readOnly: boolean
  /** Required when the card is not read-only. */
  edit?: QuestionCardEdit
}

const isOptionQuestion = (q: SituationalQuestion) =>
  !q.interactive && q.format !== 'short-text' && q.format !== 'exercise'

/** A poll asks; it does not mark. Everything else with options has a right answer. */
const marksCorrect = (q: SituationalQuestion) => isOptionQuestion(q) && q.format !== 'poll'

/**
 * One question, in the shape the admin authors it in.
 *
 * The card is the same whether it is being written, edited or read: a generated draft is
 * approved in the form it would have been written in, so reviewing one and writing one
 * are the same skill. `readOnly` is the only difference — it takes away the affordances
 * that would change the question, and leaves the ones that fold or drop the card.
 */
function QuestionCard({
  question,
  label,
  format,
  isOpen,
  onToggle,
  onRemove,
  removeLabel = 'Remove question',
  readOnly,
  edit,
}: Props) {
  const optionQuestion = isOptionQuestion(question)
  const marked = marksCorrect(question)
  const errors = edit?.errors ?? { text: false, options: false, correctBlank: false }

  return (
    <div className="st-drawer__question">
      <div className="st-drawer__question-head">
        <button
          type="button"
          className="st-drawer__question-toggle"
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          <span className="st-drawer__question-index">{label}</span>
          {/* Generated questions say which format they are: the admin picked the
              formats, so the output has to show which one it got. */}
          {format && <span className="st-drawer__question-format">{typeLabel(format)}</span>}
        </button>
        {onRemove && (
          <Tooltip
            text={removeLabel}
            position="Top"
            alignment="End"
            icon={false}
            className="st-drawer__question-remove-tooltip"
          >
            <button
              type="button"
              className="st-drawer__question-remove"
              aria-label={`Remove ${label}`}
              onClick={onRemove}
            >
              <Trash size={20} color="currentColor" variant="Linear" />
            </button>
          </Tooltip>
        )}
        {/* Chevron last, hard against the card's right edge. */}
        <button
          type="button"
          className="st-drawer__question-chevron"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${label}`}
        >
          {isOpen
            ? <ArrowUp2 size={20} color="currentColor" variant="Linear" />
            : <ArrowDown2 size={20} color="currentColor" variant="Linear" />}
        </button>
      </div>

      {/* The question itself stays visible when the card is folded — it is what
          identifies the card. Only the answer collapses. */}
      <div className="st-drawer__question-body">
        <div className="st-drawer__field">
          <textarea
            ref={autoGrowRef}
            rows={1}
            className={`st-drawer__input${errors.text ? ' st-drawer__input--error' : ''}`}
            readOnly={readOnly}
            placeholder="Write your question here..."
            value={question.text}
            onInput={(e) => autoGrow(e.currentTarget)}
            onChange={(e) => edit?.onChange({ text: e.target.value })}
            onBlur={() => edit?.onBlur()}
            aria-label={`${label} text`}
            aria-invalid={errors.text || undefined}
            aria-describedby={errors.text ? `${question.id}-text-error` : undefined}
          />
          {errors.text && (
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
              onChange={(next) => edit?.onChange({ interactive: next })}
              readOnly={readOnly}
            />
          ) : !optionQuestion ? (
            /* Short text and exercise: there is nothing to author but the question,
               which is above. */
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
                  aria-label={`Answer options for ${label}`}
                  aria-describedby={
                    errors.options || errors.correctBlank
                      ? `${question.id}-options-error`
                      : undefined
                  }
                >
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = question.correctIndex === optionIndex
                    return (
                      <div key={optionIndex}>
                        <div className="st-drawer__option-field">
                          {marked && (
                            <Radio
                              disabled={readOnly}
                              name={`st-correct-${question.id}`}
                              checked={isCorrect}
                              onChange={() => edit?.onChange({ correctIndex: optionIndex })}
                              aria-label={`Mark option ${optionIndex + 1} of ${label} as the correct answer`}
                            />
                          )}
                          <textarea
                            ref={autoGrowRef}
                            rows={1}
                            className="st-drawer__option-input"
                            readOnly={readOnly}
                            placeholder={`Write option ${optionIndex + 1} here...`}
                            aria-label={`Option ${optionIndex + 1} of ${label}`}
                            value={option}
                            onInput={(e) => autoGrow(e.currentTarget)}
                            onChange={(e) => edit?.onOptionChange(optionIndex, e.target.value)}
                            onBlur={() => edit?.onBlur()}
                          />
                          {marked && isCorrect && (
                            <Badge
                              type="success"
                              label="Correct"
                              className="st-drawer__correct-badge"
                            />
                          )}
                          {/* Two options is the floor, so the last pair can't be removed
                              and the control simply isn't there. */}
                          {!readOnly && question.options.length > 2 && (
                            <CloseButton
                              size={16}
                              className="st-drawer__option-remove"
                              ariaLabel={`Remove option ${optionIndex + 1} of ${label}`}
                              onClick={() => edit?.onRemoveOption(optionIndex)}
                            />
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {!readOnly && (
                    <button
                      className="st-drawer__add-option"
                      type="button"
                      onClick={() => edit?.onAddOption()}
                    >
                      <Add size={24} color="currentColor" variant="Linear" />
                      <span>Add Option</span>
                    </button>
                  )}
                </div>
                {(errors.options || errors.correctBlank) && (
                  <span
                    className="st-drawer__helper st-drawer__helper--error"
                    id={`${question.id}-options-error`}
                    role="alert"
                  >
                    {errors.options ? 'Add at least 2 answer options' : 'Mark the correct answer'}
                  </span>
                )}
              </div>

              {/* Same field as the Add assessment drawer's explanation
                  (AssessmentModal.tsx), down to the label and placeholder. Folds with the
                  options, since it explains which of them is right. */}
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
                  readOnly={readOnly}
                  placeholder="Write an explanation..."
                  value={question.explanation ?? ''}
                  onInput={(e) => autoGrow(e.currentTarget)}
                  onChange={(e) => edit?.onChange({ explanation: e.target.value })}
                />
              </div>
            </>
          )}
        </div>
      </Collapse>
    </div>
  )
}

/**
 * An interactive question, in the form the admin already knows.
 *
 * These four formats are authored from the Assessments menu through `InteractiveDrawer`,
 * whose per-format bodies are the form — so the card shows the same bodies rather than a
 * second, prettier description of the same thing. One shape to learn, one place to fix.
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
  const [draft, setDraft] = useState<Draft>(() =>
    toDraft(question.interactive as InteractiveQuestion),
  )

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

export default QuestionCard
