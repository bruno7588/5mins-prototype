import { Add, ArrowForward, Danger } from 'iconsax-react'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import { conflictFor, draftConflicts, makeRow, type Draft } from '@/data/interactiveQuestions'
import type { BodyProps } from '../InteractiveDrawer'
import { autoGrow } from '../autoGrow'

type CategorizationDraft = Extract<Draft, { type: 'categorization' }>

/**
 * Categorise authoring: each category owns the concepts that belong in it.
 *
 * Exactly two categories, fixed — there is no add or remove. The format is a
 * this-or-that sort, and the emptyDraft mints both, so the author's whole job is
 * naming them and filling them.
 *
 * The draft still holds one flat item list — an item's `b` is its category's row
 * id — so renaming a category updates every concept that points at it for free,
 * and nothing has to be remapped on save. The nesting is a view of that list.
 *
 * Writing the answer key is therefore the same act as writing the concepts: one
 * typed under a category IS assigned to it. The previous shape — a flat list with
 * a radio row per concept — asked the author to state the same fact twice.
 */
function CategorizationBody({ draft, onChange }: BodyProps<CategorizationDraft>) {
  const { categories, items } = draft
  /* Only the conflicts — two categories or two concepts with the same label,
     which grade as a coin flip. The count rules stay silent (see
     InteractiveDrawer). */
  const conflicts = draftConflicts(draft)

  return (
    <div className="iq-drawer__field">
      <span className="iq-drawer__label">Categories</span>
      <div
        className="iq-drawer__categories"
        role="group"
        aria-label="Categories"
      >
        {categories.map((category, index) => {
          const own = items.filter((i) => i.b === category.id)
          const named = category.a.trim() || `Category ${index + 1}`
          const categoryConflict = conflictFor(conflicts, 'categories', category.a)
          return (
            <div className="iq-drawer__category" key={category.id}>
              <div className="iq-drawer__row-field">
              <div
                className={`iq-drawer__row${categoryConflict ? ' iq-drawer__row--error' : ''}`}
              >
                <textarea
                  ref={autoGrow}
                  rows={1}
                  className="iq-drawer__row-input"
                  placeholder={`Category ${index + 1}`}
                  aria-label={`Category ${index + 1} name`}
                  aria-invalid={categoryConflict ? true : undefined}
                  aria-describedby={categoryConflict ? `iq-conflict-${category.id}` : undefined}
                  value={category.a}
                  onInput={(e) => autoGrow(e.currentTarget)}
                  onChange={(e) =>
                    onChange({
                      ...draft,
                      categories: categories.map((c) =>
                        c.id === category.id ? { ...c, a: e.target.value } : c,
                      ),
                    })
                  }
                />
                {categoryConflict && (
                  <span className="iq-drawer__row-danger">
                    <Danger size={20} color="var(--text-error)" variant="Bold" />
                  </span>
                )}
              </div>
              {categoryConflict && (
                <span className="iq-drawer__conflict" id={`iq-conflict-${category.id}`} role="alert">
                  {categoryConflict.message}
                </span>
              )}
              </div>

              {/* The indent alone left it to the reader to infer that these
                  belong to the category above; the arrow says it. */}
              <div className="iq-drawer__category-items">
                {own.map((item, i) => {
                  const itemConflict = conflictFor(conflicts, 'items', item.a)
                  return (
                  <div className="iq-drawer__concept" key={item.id}>
                    <ArrowForward
                      size={20}
                      color="currentColor"
                      variant="Linear"
                      className="iq-drawer__category-arrow"
                    />
                    <div className="iq-drawer__row-field">
                    <div
                      className={`iq-drawer__row${itemConflict ? ' iq-drawer__row--error' : ''}`}
                    >
                      <textarea
                        ref={autoGrow}
                        rows={1}
                        className="iq-drawer__row-input"
                        placeholder={`Concept ${i + 1}`}
                        aria-label={`Concept ${i + 1} in ${named}`}
                        aria-invalid={itemConflict ? true : undefined}
                        aria-describedby={itemConflict ? `iq-conflict-${item.id}` : undefined}
                        value={item.a}
                        onInput={(e) => autoGrow(e.currentTarget)}
                        onChange={(e) =>
                          onChange({
                            ...draft,
                            items: items.map((x) =>
                              x.id === item.id ? { ...x, a: e.target.value } : x,
                            ),
                          })
                        }
                      />
                      {itemConflict && (
                        <span className="iq-drawer__row-danger">
                          <Danger size={20} color="var(--text-error)" variant="Bold" />
                        </span>
                      )}
                      {own.length > 1 && (
                        <CloseButton
                          size={16}
                          className="iq-drawer__row-remove"
                          ariaLabel={`Remove concept ${i + 1} from ${named}`}
                          onClick={() => onChange({ ...draft, items: items.filter((x) => x.id !== item.id) })}
                        />
                      )}
                    </div>
                    {itemConflict && (
                      <span className="iq-drawer__conflict" id={`iq-conflict-${item.id}`} role="alert">
                        {itemConflict.message}
                      </span>
                    )}
                    </div>
                  </div>
                  )
                })}
                <Button
                  variant="outlined-2"
                  icon={<Add size={20} color="currentColor" variant="Linear" />}
                  onClick={() => onChange({ ...draft, items: [...items, makeRow('', category.id)] })}
                >
                  Add Concept
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CategorizationBody
