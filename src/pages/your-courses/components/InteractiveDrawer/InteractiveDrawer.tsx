import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Alert from '@/components/Alert/Alert'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import QuizIllustration from '@/components/icons/QuizIllustration'
import PhoneFrame from '@/components/mobile/PhoneFrame/PhoneFrame'
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
import QuizHeader from '@/pages/quiz-lab/components/QuizHeader'
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
 *
 * Validation speaks only for conflicts (draftErrors' 'conflict' kind): two
 * identical steps, a wrong word that is also an answer. Those can't be seen by
 * reading the form back, and can't exist until the author has typed. The
 * 'incomplete' rules stay silent — on an untouched draft they all fire at once,
 * each restating the label above it — and hold Save disabled instead.
 */
function InteractiveDrawer({ type, initial = null, onClose, onSave, onDirtyChange }: Props) {
  const isEdit = !!initial
  const config = TYPE_CONFIG[type]

  const [prompt, setPrompt] = useState(initial?.prompt ?? '')
  const [draft, setDraft] = useState<Draft>(() => (initial ? toDraft(initial) : emptyDraft(type)))
  const [previewing, setPreviewing] = useState(false)

  /* The prompt grows with its content; height must reset to auto before reading
     scrollHeight or the box can only ever get taller. */
  const promptRef = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    autoGrow(promptRef.current)
  }, [prompt])

  const promptFilled = prompt.trim().length > 0
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

  const body =
    draft.type === 'sequencing' ? (
      <SequencingBody draft={draft} onChange={setDraft} />
    ) : draft.type === 'match-pairs' ? (
      <MatchPairsBody draft={draft} onChange={setDraft} />
    ) : draft.type === 'categorization' ? (
      <CategorizationBody draft={draft} onChange={setDraft} />
    ) : (
      <FillBlankBody draft={draft} onChange={setDraft} />
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
            className="iq-drawer__input"
            placeholder={config.promptPlaceholder}
            value={prompt}
            onInput={(e) => autoGrow(e.currentTarget)}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="iq-drawer__body-slot">{body}</div>
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

      {/* Just the phone on the scrim — no dialog card, no title bar; the format
          label and the close sit in the quiz's own header (Figma 9111:4633).
          ConfirmModal still supplies the scrim, focus trap and escape, and it is
          portalled to the body because the drawer's z-index makes a stacking
          context the overlay could not paint over the content rail from. */}
      {createPortal(
        <ConfirmModal
          open={previewing && !!previewQuestion}
          onClose={() => setPreviewing(false)}
          className="iq-preview-modal"
          ariaLabel={`Preview - ${config.title}`}
        >
          {previewQuestion && (
            <div className="iq-drawer__preview-stage">
              <PhoneFrame>
                <div className="ql-quizview">
                  {/* No hearts: they track a real attempt, and this is a preview
                      of one question rather than a run. */}
                  <QuizHeader
                    label={config.title}
                    used={1}
                    total={3}
                    showHearts={false}
                    onClose={() => setPreviewing(false)}
                  />
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
              </PhoneFrame>
            </div>
          )}
        </ConfirmModal>,
        document.body,
      )}
    </>
  )
}

export default InteractiveDrawer
