import { useRef, useState } from 'react'
import { Add } from 'iconsax-react'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import {
  draftErrors,
  makeRow,
  remapBlanks,
  tokenize,
  type BlankRange,
  type Draft,
  type DraftRow,
  type SentenceToken,
} from '@/data/interactiveQuestions'
import type { BodyProps } from '../InteractiveDrawer'
import { autoGrow } from '../autoGrow'

type FillBlankDraft = Extract<Draft, { type: 'fill-blank' }>

/**
 * Fill-in-the-blanks authoring: the sentence is written in full, then the words
 * to hide are clicked in place.
 *
 * There is no second field listing the words. A mark is the range the author
 * clicked, so the word is never retyped, the second "the" can be blanked without
 * blanking the first, and the sentence shown here is both the control and the
 * read-back of what a learner will see.
 */
function FillBlankBody({ draft, onChange, showErrors }: BodyProps<FillBlankDraft>) {
  /* Marks are positions, so editing the sentence has to carry them along. */
  const setText = (text: string) =>
    onChange({ ...draft, text, blanks: remapBlanks(draft.blanks, draft.text, text) })
  const setBlanks = (next: BlankRange[]) => onChange({ ...draft, blanks: next })
  const setDistractors = (next: DraftRow[]) => onChange({ ...draft, distractors: next })

  const tokens = tokenize(draft.text)
  const words = tokens.filter((t) => t.isWord)
  /** Word offset → its place in the arrow-key order. */
  const wordIndex = new Map(words.map((w, i) => [w.start, i]))

  /* Roving tabindex: the marked-up sentence is one stop in the tab order, and
     the arrow keys move between its words — a tab stop per word would bury the
     rest of the form behind however long the sentence is. */
  const [focused, setFocused] = useState(0)
  const wordRefs = useRef<(HTMLButtonElement | null)[]>([])

  const blankOn = (token: SentenceToken) =>
    draft.blanks.find((b) => token.start < b.end && token.end > b.start)

  /** A gap is always exactly one word — phrases aren't blankable. */
  function toggle(token: SentenceToken) {
    const existing = blankOn(token)
    if (existing) setBlanks(draft.blanks.filter((b) => b !== existing))
    else setBlanks([...draft.blanks, { start: token.start, end: token.end }])
  }

  function moveFocus(to: number) {
    const next = Math.max(0, Math.min(words.length - 1, to))
    setFocused(next)
    wordRefs.current[next]?.focus()
  }

  const errors = showErrors ? draftErrors(draft) : []
  const sentenceErrors = errors.filter((e) => e.field === 'sentence')
  const blankErrors = errors.filter((e) => e.field === 'blanks')

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
          placeholder="Write the sentence users will complete…"
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

      {draft.text.trim() && (
        <div className="iq-drawer__field">
          <span className="iq-drawer__label" id="iq-fb-marker-label">
            Words to blank
          </span>
          <span className="iq-drawer__label-sub" id="iq-fb-marker-hint">
            Click a word to blank it. Click it again to put it back.
          </span>

          {/* Both the control and the read-back: what is amber here is what
              reaches the learner as a gap. */}
          <div
            className={`iq-drawer__marker${blankErrors.length ? ' iq-drawer__marker--error' : ''}`}
            role="group"
            aria-labelledby="iq-fb-marker-label"
            aria-describedby={`iq-fb-marker-hint${blankErrors.length ? ' iq-fb-blanks-error' : ''}`}
          >
            {tokens.map((token, i) => {
              if (!token.isWord) return <span key={i}>{token.text}</span>

              const isBlank = !!blankOn(token)
              const index = wordIndex.get(token.start)!
              return (
                <button
                  type="button"
                  key={i}
                  ref={(el) => {
                    wordRefs.current[index] = el
                  }}
                  className={`iq-drawer__marker-word${
                    isBlank ? ' iq-drawer__marker-word--blank' : ''
                  }`}
                  tabIndex={index === Math.min(focused, words.length - 1) ? 0 : -1}
                  aria-pressed={isBlank}
                  aria-label={`${token.text}${isBlank ? ', blanked' : ''}`}
                  onFocus={() => setFocused(index)}
                  onClick={() => toggle(token)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') {
                      e.preventDefault()
                      moveFocus(index + 1)
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault()
                      moveFocus(index - 1)
                    } else if (e.key === 'Home') {
                      e.preventDefault()
                      moveFocus(0)
                    } else if (e.key === 'End') {
                      e.preventDefault()
                      moveFocus(words.length - 1)
                    }
                  }}
                >
                  {token.text}
                </button>
              )
            })}
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
        </div>
      )}

      <div className="iq-drawer__field">
        <span className="iq-drawer__label">Wrong words</span>
        <div className="iq-drawer__rows" role="group" aria-label="Wrong words">
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
              {/* Two wrong words is the floor the drawer opens on, so there is
                  nothing to remove until a third is added. */}
              {draft.distractors.length > 2 && (
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
