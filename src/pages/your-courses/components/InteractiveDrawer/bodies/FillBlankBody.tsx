import { Add } from 'iconsax-react'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import { draftErrors, makeRow, markBlanks, type Draft, type DraftRow } from '@/data/interactiveQuestions'
import type { BodyProps } from '../InteractiveDrawer'
import { autoGrow } from '../autoGrow'

type FillBlankDraft = Extract<Draft, { type: 'fill-blank' }>

/**
 * Fill-in-the-blanks authoring: the sentence is written in full, and the words to
 * hide are listed under it.
 *
 * The sentence field therefore holds exactly what the learner reads — no braces,
 * no markers, nothing to escape — and the preview under the list is the parse
 * read back, so the author can see which occurrence each mark actually claimed
 * before saving.
 */
function FillBlankBody({ draft, onChange, showErrors }: BodyProps<FillBlankDraft>) {
  const setText = (text: string) => onChange({ ...draft, text })
  const setBlanks = (next: DraftRow[]) => onChange({ ...draft, blanks: next })
  const setDistractors = (next: DraftRow[]) => onChange({ ...draft, distractors: next })

  const { segments } = markBlanks(
    draft.text,
    draft.blanks.map((b) => b.a),
  )
  const errors = showErrors ? draftErrors(draft) : []
  const sentenceErrors = errors.filter((e) => e.field === 'sentence')
  const blankErrors = errors.filter((e) => e.field === 'blanks')
  const wrongWordErrors = errors.filter((e) => e.field === 'wrong-words')

  return (
    <>
      <div className="iq-drawer__field">
        <label className="iq-drawer__label" htmlFor="iq-sentence">
          Sentence
        </label>
        <textarea
          id="iq-sentence"
          ref={autoGrow}
          rows={1}
          className={`iq-drawer__textarea${sentenceErrors.length ? ' iq-drawer__textarea--error' : ''}`}
          placeholder="Write the sentence learners will complete…"
          value={draft.text}
          onInput={(e) => autoGrow(e.currentTarget)}
          onChange={(e) => setText(e.target.value)}
          aria-describedby={sentenceErrors.length ? 'iq-fb-sentence-error' : undefined}
          aria-invalid={sentenceErrors.length ? true : undefined}
        />

        {sentenceErrors.length > 0 && (
          <span
            className="iq-drawer__helper iq-drawer__helper--error"
            id="iq-fb-sentence-error"
            role="alert"
          >
            {sentenceErrors[0].message}
          </span>
        )}
      </div>

      <div className="iq-drawer__field">
        <span className="iq-drawer__label">Words to blank</span>
        <div
          className="iq-drawer__rows"
          role="group"
          aria-label="Words to blank"
          aria-describedby={blankErrors.length ? 'iq-fb-blanks-error' : undefined}
        >
          {draft.blanks.map((blank, index) => (
            <div className="iq-drawer__row" key={blank.id}>
              <input
                type="text"
                className="iq-drawer__row-input"
                placeholder="Mark a word from your sentence to be blanked"
                aria-label={`Word to blank ${index + 1}`}
                value={blank.a}
                onChange={(e) =>
                  setBlanks(
                    draft.blanks.map((b) => (b.id === blank.id ? { ...b, a: e.target.value } : b)),
                  )
                }
              />
              {draft.blanks.length > 1 && (
                <CloseButton
                  size={16}
                  className="iq-drawer__row-remove"
                  ariaLabel={`Remove word to blank ${index + 1}`}
                  onClick={() => setBlanks(draft.blanks.filter((b) => b.id !== blank.id))}
                />
              )}
            </div>
          ))}
        </div>

        {blankErrors.length > 0 && (
          <span
            className="iq-drawer__helper iq-drawer__helper--error"
            id="iq-fb-blanks-error"
            role="alert"
          >
            {blankErrors[0].message}
          </span>
        )}

        <div className="iq-drawer__row-actions">
          <Button
            variant="outlined-2"
            icon={<Add size={20} color="currentColor" variant="Linear" />}
            onClick={() => setBlanks([...draft.blanks, makeRow()])}
          >
            Add Word
          </Button>
        </div>

        {/* The parse read back: which word each mark actually claimed, in the
            sentence, before it reaches a learner. */}
        {draft.text.trim() && (
          <>
            <span className="iq-drawer__label-sub" id="iq-fb-preview-label">
              How learners will see it
            </span>
            <div className="iq-drawer__preview" aria-describedby="iq-fb-preview-label">
              {segments.map((segment, i) =>
                typeof segment === 'string' ? (
                  <span key={i}>{segment}</span>
                ) : (
                  <span className="iq-drawer__preview-blank" key={i}>
                    {segment.blank}
                  </span>
                ),
              )}
            </div>
          </>
        )}
      </div>

      <div className="iq-drawer__field">
        <span className="iq-drawer__label">Wrong words</span>
        <div
          className="iq-drawer__rows"
          role="group"
          aria-label="Wrong words"
          aria-describedby={wrongWordErrors.length ? 'iq-fb-error' : undefined}
        >
          {draft.distractors.map((distractor, index) => (
            <div className="iq-drawer__row" key={distractor.id}>
              <input
                type="text"
                className="iq-drawer__row-input"
                placeholder={`Wrong word ${index + 1}`}
                aria-label={`Wrong word ${index + 1}`}
                value={distractor.a}
                onChange={(e) =>
                  setDistractors(
                    draft.distractors.map((d) =>
                      d.id === distractor.id ? { ...d, a: e.target.value } : d,
                    ),
                  )
                }
              />
              {draft.distractors.length > 1 && (
                <CloseButton
                  size={16}
                  className="iq-drawer__row-remove"
                  ariaLabel={`Remove wrong word ${index + 1}`}
                  onClick={() =>
                    setDistractors(draft.distractors.filter((d) => d.id !== distractor.id))
                  }
                />
              )}
            </div>
          ))}
        </div>
        <span className="iq-drawer__helper">
          These join the answers in the word bank. Two or three make the question worth asking.
        </span>

        {wrongWordErrors.length > 0 && (
          <span className="iq-drawer__helper iq-drawer__helper--error" id="iq-fb-error" role="alert">
            {wrongWordErrors[0].message}
          </span>
        )}

        <div className="iq-drawer__row-actions">
          <Button
            variant="outlined-2"
            icon={<Add size={20} color="currentColor" variant="Linear" />}
            onClick={() => setDistractors([...draft.distractors, makeRow()])}
          >
            Add Wrong Word
          </Button>
        </div>
      </div>
    </>
  )
}

export default FillBlankBody
