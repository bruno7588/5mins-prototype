import { useLayoutEffect, useRef } from 'react'
import { Add } from 'iconsax-react'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import {
  blanksOf,
  draftErrors,
  makeRow,
  parseSentence,
  type Draft,
  type DraftRow,
} from '@/data/interactiveQuestions'
import type { BodyProps } from '../InteractiveDrawer'
import { autoGrow } from '../autoGrow'

type FillBlankDraft = Extract<Draft, { type: 'fill-blank' }>

/**
 * Fill-in-the-blanks authoring.
 *
 * The source of truth is ONE string with gaps marked `{{answer}}`, not a segment
 * array. The renderer needs each literal's exact whitespace, and a segmented
 * editor would make the admin manage those spaces by hand and get them wrong;
 * slicing them out of one string is exact and invisible.
 *
 * The admin never has to learn the syntax — "Make Blank" wraps whatever they have
 * selected — but can type it directly once they know it.
 */
function FillBlankBody({ draft, onChange, showErrors }: BodyProps<FillBlankDraft>) {
  const sentenceRef = useRef<HTMLTextAreaElement>(null)
  /* Set by Make Blank, applied after the controlled re-render — the DOM selection
     is lost when React rewrites the value. */
  const pendingSelection = useRef<[number, number] | null>(null)

  const setText = (text: string) => onChange({ ...draft, text })
  const setDistractors = (next: DraftRow[]) => onChange({ ...draft, distractors: next })

  useLayoutEffect(() => {
    autoGrow(sentenceRef.current)
    const selection = pendingSelection.current
    if (!selection || !sentenceRef.current) return
    sentenceRef.current.focus()
    sentenceRef.current.setSelectionRange(selection[0], selection[1])
    pendingSelection.current = null
  }, [draft.text])

  const makeBlank = () => {
    const el = sentenceRef.current
    if (!el) return
    const { selectionStart: start, selectionEnd: end } = el
    const selected = draft.text.slice(start, end)
    /* Nothing selected: drop in a placeholder and select it so the admin types
       straight over it. */
    const word = selected.trim() || 'answer'
    /* Any whitespace the admin happened to select stays outside the braces —
       the literal on either side has to keep its own spacing. */
    const lead = selected.length - selected.trimStart().length
    const trail = selected.length - selected.trimEnd().length
    const before = draft.text.slice(0, start + lead)
    const after = draft.text.slice(end - trail)
    setText(`${before}{{${word}}}${after}`)
    const caret = before.length + 2
    pendingSelection.current = [caret, caret + word.length]
  }

  const segments = parseSentence(draft.text)
  const answers = blanksOf(segments)
  const errors = showErrors ? draftErrors(draft) : []

  return (
    <>
      <div className="iq-drawer__field">
        <div className="iq-drawer__field-head">
          <label className="iq-drawer__label" htmlFor="iq-sentence">
            Sentence
          </label>
          <Button variant="text" size="sm" onClick={makeBlank}>
            Make Blank
          </Button>
        </div>
        <textarea
          ref={sentenceRef}
          id="iq-sentence"
          rows={1}
          className="iq-drawer__textarea"
          placeholder="Write the sentence, then select a word and choose Make Blank…"
          value={draft.text}
          onInput={(e) => autoGrow(e.currentTarget)}
          onChange={(e) => setText(e.target.value)}
        />
        <span className="iq-drawer__helper">
          Anything wrapped in {'{{ }}'} becomes a blank.
        </span>

        {/* The only confirmation that the syntax parsed the way the admin meant.
            Inert spans rather than the DS Chip — nothing here is clickable. */}
        {draft.text.trim() && (
          <div className="iq-drawer__preview" aria-label="Sentence preview">
            {segments.map((segment, i) =>
              typeof segment === 'string' ? (
                <span key={i}>{segment}</span>
              ) : (
                <span className="iq-drawer__preview-blank" key={i}>
                  {segment.blank || '—'}
                </span>
              ),
            )}
          </div>
        )}
      </div>

      <div className="iq-drawer__field">
        <span className="iq-drawer__label">
          Answers <span className="iq-drawer__label-optional">(from your sentence)</span>
        </span>
        {answers.length > 0 ? (
          <div className="iq-drawer__chips">
            {/* Repeats are kept: the renderer disables a placed chip by its bank
                index but grades by text, so two gaps answered the same way need
                two chips or the second can never be filled. */}
            {answers.map((answer, i) => (
              <span className="iq-drawer__chip iq-drawer__chip--answer" key={i}>
                {answer || '—'}
              </span>
            ))}
          </div>
        ) : (
          <span className="iq-drawer__helper">Mark a word as a blank and it appears here.</span>
        )}
      </div>

      <div className="iq-drawer__field">
        <span className="iq-drawer__label">Wrong words</span>
        <div
          className="iq-drawer__rows"
          role="group"
          aria-label="Wrong words"
          aria-describedby={errors.length ? 'iq-fb-error' : undefined}
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

        {errors.length > 0 && (
          <span className="iq-drawer__helper iq-drawer__helper--error" id="iq-fb-error" role="alert">
            {errors[0]}
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
