import { Fragment } from 'react'
import { Add, ArrangeHorizontal } from 'iconsax-react'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import { draftConflicts, makeRow, type Draft, type DraftRow } from '@/data/interactiveQuestions'
import type { BodyProps } from '../InteractiveDrawer'
import { autoGrow } from '../autoGrow'

type MatchPairsDraft = Extract<Draft, { type: 'match-pairs' }>

const MIN_PAIRS = 3

/**
 * Match-the-pairs authoring. Each row is one correct pair — correctness is index
 * identity, so there is nothing to mark and no per-row "Correct" badge: every row
 * is correct by construction.
 *
 * No reordering either. The renderer shuffles the right column, so row order
 * carries no meaning and a grip would imply otherwise.
 */
function MatchPairsBody({ draft, onChange }: BodyProps<MatchPairsDraft>) {
  const pairs = draft.pairs
  /* Only the conflicts — a repeated term or match, which reads as fine until you
     notice the same word twice. The count rule is in the callout. */
  const conflicts = draftConflicts(draft)
  const setPairs = (next: DraftRow[]) => onChange({ ...draft, pairs: next })

  const update = (id: string, patch: Partial<DraftRow>) =>
    setPairs(pairs.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  return (
    <div className="iq-drawer__field">
      <div className="iq-drawer__pair-head">
        <span className="iq-drawer__label">Term</span>
        <span className="iq-drawer__label">Match</span>
      </div>
      {/* One grid, not a row per pair: the term and its match are separate fields
          in their own columns, so terms line up down the page and the link glyph
          sits between the two columns rather than inside one box. */}
      <div
        className="iq-drawer__pair-grid"
        role="group"
        aria-label="Pairs"
        aria-describedby={conflicts.length ? 'iq-pairs-conflict' : undefined}
      >
        {pairs.map((pair, index) => (
          <Fragment key={pair.id}>
            <div className="iq-drawer__row">
              <textarea
                ref={autoGrow}
                rows={1}
                className="iq-drawer__row-input"
                placeholder={`Term ${index + 1}`}
                aria-label={`Term ${index + 1}`}
                value={pair.a}
                onInput={(e) => autoGrow(e.currentTarget)}
                onChange={(e) => update(pair.id, { a: e.target.value })}
              />
            </div>
            {/* Same glyph the Add Content strip files Match the Pairs under. */}
            <ArrangeHorizontal
              size={20}
              color="var(--text-tertiary)"
              variant="Linear"
              className="iq-drawer__pair-link"
            />
            <div className="iq-drawer__row">
              <textarea
                ref={autoGrow}
                rows={1}
                className="iq-drawer__row-input"
                placeholder={`Match ${index + 1}`}
                aria-label={`Match for term ${index + 1}`}
                value={pair.b}
                onInput={(e) => autoGrow(e.currentTarget)}
                onChange={(e) => update(pair.id, { b: e.target.value })}
              />
            </div>
            {/* The slot is always occupied — an empty cell keeps the columns from
                shifting when the last removable pair is deleted. */}
            {pairs.length > MIN_PAIRS ? (
              <CloseButton
                size={16}
                className="iq-drawer__row-remove"
                ariaLabel={`Remove pair ${index + 1}`}
                onClick={() => setPairs(pairs.filter((p) => p.id !== pair.id))}
              />
            ) : (
              <span aria-hidden="true" />
            )}
          </Fragment>
        ))}
      </div>

      {conflicts.length > 0 && (
        <span className="iq-drawer__conflict" id="iq-pairs-conflict" role="alert">
          {conflicts[0].message}
        </span>
      )}

      <div className="iq-drawer__row-actions">
        <Button
          variant="outlined-2"
          icon={<Add size={20} color="currentColor" variant="Linear" />}
          onClick={() => setPairs([...pairs, makeRow()])}
        >
          Add Pair
        </Button>
      </div>
    </div>
  )
}

export default MatchPairsBody
