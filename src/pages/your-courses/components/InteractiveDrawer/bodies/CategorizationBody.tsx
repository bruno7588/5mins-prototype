import { Add } from 'iconsax-react'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import Radio from '@/components/Radio/Radio'
import { draftErrors, makeRow, type Draft, type DraftRow } from '@/data/interactiveQuestions'
import type { BodyProps } from '../InteractiveDrawer'
import { autoGrow } from '../autoGrow'

type CategorizationDraft = Extract<Draft, { type: 'categorization' }>

const MIN_CATEGORIES = 2
const MIN_ITEMS = 2

/**
 * Categorise authoring: name the categories, then say where each item belongs.
 *
 * The radio writes the category **row id**, never its label, so renaming a
 * category updates every item that points at it for free.
 *
 * Radios rather than a dropdown per row: the DS Dropdown portals its menu to
 * <body>, outside the focus trap this drawer installs, and its Escape handler
 * doesn't stop propagation — so Escape would close the whole drawer with the menu
 * open. Radio is also the codebase's established mark-the-answer control.
 */
function CategorizationBody({ draft, onChange, showErrors }: BodyProps<CategorizationDraft>) {
  const { categories, items } = draft

  const setCategories = (next: DraftRow[]) => onChange({ ...draft, categories: next })
  const setItems = (next: DraftRow[]) => onChange({ ...draft, items: next })

  /* Removing a category orphans its items, so their assignment is cleared in the
     same update. Left dangling, a categoryId pointing at nothing reaches the
     learner as an item that can never be graded — and nothing in the editor
     would show it. Deliberately unlike the situational drawer, which falls back
     to the first option: guessing a category here would silently make the
     question wrong. */
  const removeCategory = (id: string) =>
    onChange({
      ...draft,
      categories: categories.filter((c) => c.id !== id),
      items: items.map((i) => (i.b === id ? { ...i, b: '' } : i)),
    })

  const errors = showErrors ? draftErrors(draft) : []
  const named = categories.filter((c) => c.a.trim())

  return (
    <>
      <div className="iq-drawer__field">
        <span className="iq-drawer__label">Categories</span>
        <div className="iq-drawer__rows" role="group" aria-label="Categories">
          {categories.map((category, index) => (
            <div className="iq-drawer__row" key={category.id}>
              <textarea
                ref={autoGrow}
                rows={1}
                className="iq-drawer__row-input"
                placeholder={`Category ${index + 1}`}
                aria-label={`Category ${index + 1} name`}
                value={category.a}
                onInput={(e) => autoGrow(e.currentTarget)}
                onChange={(e) =>
                  setCategories(
                    categories.map((c) => (c.id === category.id ? { ...c, a: e.target.value } : c)),
                  )
                }
              />
              {categories.length > MIN_CATEGORIES && (
                <CloseButton
                  size={16}
                  className="iq-drawer__row-remove"
                  ariaLabel={`Remove category ${index + 1}`}
                  onClick={() => removeCategory(category.id)}
                />
              )}
            </div>
          ))}
        </div>
        <div className="iq-drawer__row-actions">
          <Button
            variant="outlined-2"
            icon={<Add size={20} color="currentColor" variant="Linear" />}
            onClick={() => setCategories([...categories, makeRow()])}
          >
            Add Category
          </Button>
        </div>
      </div>

      <div className="iq-drawer__field">
        <span className="iq-drawer__label">Items to sort</span>
        <div
          className="iq-drawer__rows"
          role="group"
          aria-label="Items to sort"
          aria-describedby={errors.length ? 'iq-items-error' : undefined}
        >
          {items.map((item, index) => (
            <div className="iq-drawer__item" key={item.id}>
              <div className="iq-drawer__row">
                <textarea
                  ref={autoGrow}
                  rows={1}
                  className="iq-drawer__row-input"
                  placeholder={`Item ${index + 1}`}
                  aria-label={`Item ${index + 1}`}
                  value={item.a}
                  onInput={(e) => autoGrow(e.currentTarget)}
                  onChange={(e) =>
                    setItems(items.map((i) => (i.id === item.id ? { ...i, a: e.target.value } : i)))
                  }
                />
                {items.length > MIN_ITEMS && (
                  <CloseButton
                    size={16}
                    className="iq-drawer__row-remove"
                    ariaLabel={`Remove item ${index + 1}`}
                    onClick={() => setItems(items.filter((i) => i.id !== item.id))}
                  />
                )}
              </div>
              {/* Named categories only — an unnamed one has nothing to label its
                  radio with, and it is dropped on save anyway. */}
              {named.length > 0 && (
                <div
                  className="iq-drawer__choices"
                  role="radiogroup"
                  aria-label={`Category for item ${index + 1}`}
                >
                  {named.map((category) => (
                    <label className="iq-drawer__choice" key={category.id}>
                      <Radio
                        name={`iq-item-${item.id}`}
                        checked={item.b === category.id}
                        onChange={() =>
                          setItems(
                            items.map((i) => (i.id === item.id ? { ...i, b: category.id } : i)),
                          )
                        }
                      />
                      <span>{category.a}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {errors.length > 0 && (
          <span
            className="iq-drawer__helper iq-drawer__helper--error"
            id="iq-items-error"
            role="alert"
          >
            {errors[0]}
          </span>
        )}

        <div className="iq-drawer__row-actions">
          <Button
            variant="outlined-2"
            icon={<Add size={20} color="currentColor" variant="Linear" />}
            onClick={() => setItems([...items, makeRow()])}
          >
            Add Item
          </Button>
        </div>
      </div>
    </>
  )
}

export default CategorizationBody
