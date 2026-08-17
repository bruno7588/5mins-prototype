import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Alert from '@/components/Alert/Alert'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import QuizIllustration from '@/components/icons/QuizIllustration'
import {
  TYPE_CONFIG,
  draftErrors,
  emptyDraft,
  toDraft,
  toQuestion,
  type Draft,
  type InteractiveQuestion,
  type InteractiveQuestionType,
} from '@/data/interactiveQuestions'
import { QuizFooterLayoutContext } from '@/pages/quiz-lab/components/FeedbackFooter'
import MatchPairsPartial from '@/pages/quiz-lab/formats/MatchPairsPartial'
import FillBlank from '@/pages/quiz-lab/formats/FillBlank'
import Categorization from '@/pages/quiz-lab/formats/Categorization'
import SequencingDnd from '@/pages/quiz-lab/formats/SequencingDnd'
import '@/pages/quiz-lab/quiz-lab.css'
import SectionHeader from '../SectionHeader/SectionHeader'
import CategorizationBody from './bodies/CategorizationBody'
import FillBlankBody from './bodies/FillBlankBody'
import MatchPairsBody from './bodies/MatchPairsBody'
import SequencingBody from './bodies/SequencingBody'
import { autoGrow } from './autoGrow'
import './InteractiveDrawer.css'

export interface BodyProps<D extends Draft = Draft> {
  draft: D
  onChange: (next: D) => void
  /** Errors are held back until the admin has tried to save or left a field. */
  showErrors: boolean
}

interface Props {
  type: InteractiveQuestionType
  /** Prefilled when reopened from the course outline; null when creating. */
  initial?: InteractiveQuestion | null
  onClose: () => void
  onSave: (question: InteractiveQuestion) => void
  /** Lets the page guard the close paths while there is unsaved work. */
  onDirtyChange?: (dirty: boolean) => void
}

/* Only the authored values matter for the dirty check — row ids are minted per
   mount and would otherwise make a pristine form read as edited. */
const snapshot = (prompt: string, draft: Draft) =>
  JSON.stringify({
    prompt,
    draft: JSON.parse(JSON.stringify(draft), (key, value) => (key === 'id' ? undefined : value)),
  })

/**
 * Authoring for the four interactive question formats (fill in the blanks, match
 * the pairs, categorise, sequence). One drawer rather than four: the chrome —
 * prompt, validation, dirty guard, footer — is identical, and only the middle of
 * the form differs, so the bodies switch and everything else is written once.
 *
 * Single surface, not a wizard: a situational test is a container of N questions
 * and earns its steps, but this is one question.
 */
function InteractiveDrawer({ type, initial = null, onClose, onSave, onDirtyChange }: Props) {
  const isEdit = !!initial
  const config = TYPE_CONFIG[type]

  const [prompt, setPrompt] = useState(initial?.prompt ?? '')
  const [promptBlurred, setPromptBlurred] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => (initial ? toDraft(initial) : emptyDraft(type)))
  /* Validation fires on blur, not on submit — the footer button is disabled while
     the draft is invalid, so a submit-driven flag could never be set. One handler
     on the body wrapper covers all four bodies, since focusout bubbles. */
  const [bodyTouched, setBodyTouched] = useState(false)
  const [previewing, setPreviewing] = useState(false)

  /* The prompt grows with its content; height must reset to auto before reading
     scrollHeight or the box can only ever get taller. */
  const promptRef = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    autoGrow(promptRef.current)
  }, [prompt])

  const promptFilled = prompt.trim().length > 0
  const promptError = promptBlurred && !promptFilled
  const bodyErrors = draftErrors(draft)
  const canSave = promptFilled && bodyErrors.length === 0

  const pristine = useRef<string | null>(null)
  const current = snapshot(prompt, draft)
  if (pristine.current === null) pristine.current = current
  const dirty = current !== pristine.current
  useEffect(() => {
    onDirtyChange?.(dirty)
  }, [dirty, onDirtyChange])

  const handleSave = () => onSave(toQuestion(draft, prompt))

  /* The shell's Escape handler lives on document and closes the whole drawer, so
     while the preview is up this one runs first (capture) and stops there —
     Escape backs out of the preview, not out of the unsaved question. */
  useEffect(() => {
    if (!previewing) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setPreviewing(false)
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [previewing])

  /* The preview runs the real learner renderer on the draft as it stands, so the
     author sees the shuffle, the word bank and the buckets before saving rather
     than after — the only way to tell a good question from a plausible one. It
     needs a valid draft, since the renderers grade what they're given. */
  const previewQuestion = canSave ? toQuestion(draft, prompt) : null

  const bodyProps = { showErrors: bodyTouched }
  const body =
    draft.type === 'sequencing' ? (
      <SequencingBody draft={draft} onChange={setDraft} {...bodyProps} />
    ) : draft.type === 'match-pairs' ? (
      <MatchPairsBody draft={draft} onChange={setDraft} {...bodyProps} />
    ) : draft.type === 'categorization' ? (
      <CategorizationBody draft={draft} onChange={setDraft} {...bodyProps} />
    ) : (
      <FillBlankBody draft={draft} onChange={setDraft} {...bodyProps} />
    )

  return (
    <>
      <SectionHeader
        /* Same header pattern as the classic assessment modal — every assessment
           reads "Add assessment - <format>". */
        title={`${isEdit ? 'Edit' : 'Add'} assessment - ${config.title}`}
        description={config.description}
        ctas={<CloseButton onClick={onClose} />}
      />

      <div className="iq-drawer__body">
        {/* How the format works, and — for sequence and match-pairs — the only
            statement of where the correct answer lives, since nothing is clicked
            to mark it. */}
        <Alert
          type="Callout"
          className="iq-drawer__callout"
          customIcon={<QuizIllustration className="alert__icon" />}
          message={config.callout}
        />

        <div className="iq-drawer__field">
          <label className="iq-drawer__label" htmlFor="iq-prompt">
            Question
          </label>
          <textarea
            ref={promptRef}
            id="iq-prompt"
            rows={1}
            className={`iq-drawer__input${promptError ? ' iq-drawer__input--error' : ''}`}
            placeholder="Write your question here..."
            value={prompt}
            onInput={(e) => autoGrow(e.currentTarget)}
            onChange={(e) => setPrompt(e.target.value)}
            onBlur={() => setPromptBlurred(true)}
            aria-invalid={promptError || undefined}
            aria-describedby={promptError ? 'iq-prompt-helper' : undefined}
          />
          {promptError && (
            <span
              className="iq-drawer__helper iq-drawer__helper--error"
              id="iq-prompt-helper"
              role="alert"
            >
              Write the question
            </span>
          )}
        </div>

        {/* focusout bubbles, so one handler here arms validation for whichever
            body is mounted, instead of four copies of the same blur plumbing. */}
        <div className="iq-drawer__body-slot" onBlur={() => setBodyTouched(true)}>
          {body}
        </div>
      </div>

      <div className="iq-drawer__footer">
        {/* Plain "Save", like the classic assessment modal — the header
            already names the format. */}
        <Button onClick={handleSave} disabled={!canSave}>
          Save
        </Button>
        {/* Secondary action, sitting beside Save on the footer's 16px gap. */}
        {previewQuestion && (
          <Button variant="outlined" onClick={() => setPreviewing(true)}>
            Preview
          </Button>
        )}
      </div>

      {/* Centred over the page rather than swapped into the drawer body, so the
          form stays exactly where it was when the preview closes. No phone frame
          — the quiz runs on desktop too — and no attempt hearts or counter,
          which belong to a real run. */}
      <ConfirmModal
        open={previewing && !!previewQuestion}
        onClose={() => setPreviewing(false)}
        className="iq-preview-modal"
        ariaLabel={`Preview - ${config.title}`}
      >
        <SectionHeader
          title={`Preview - ${config.title}`}
          ctas={<CloseButton onClick={() => setPreviewing(false)} />}
        />
        {previewQuestion && (
          /* 'hug' because the modal is 720px wide — the quiz's default full-bleed
             action is sized for a phone. */
          <QuizFooterLayoutContext.Provider value="hug">
            <div className="iq-drawer__preview-stage">
              <div className="ql-quizview">
                {previewQuestion.type === 'match-pairs' ? (
                  <MatchPairsPartial question={previewQuestion} />
                ) : previewQuestion.type === 'fill-blank' ? (
                  <FillBlank question={previewQuestion} formatKey="fill-blank" />
                ) : previewQuestion.type === 'categorization' ? (
                  <Categorization question={previewQuestion} formatKey="categorization" />
                ) : (
                  <SequencingDnd question={previewQuestion} />
                )}
              </div>
            </div>
          </QuizFooterLayoutContext.Provider>
        )}
      </ConfirmModal>
    </>
  )
}

export default InteractiveDrawer
