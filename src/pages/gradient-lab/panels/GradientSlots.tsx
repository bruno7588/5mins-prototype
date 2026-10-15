import { Add, TickCircle, Trash } from 'iconsax-react'
import RowActionsMenu from '@/components/RowActionsMenu/RowActionsMenu'
import Tooltip from '@/components/Tooltip/Tooltip'
import type { SavedGradient } from '../gradients'

/* The saved gradients, as a strip under the preview: every slot up to the
   highest saved (or active) one, then a + tile that adds an empty slot.
   Clicking a slot makes it the active one (and loads it when saved); the tick
   under the active slot saves the current gradient into it. Prefix: gl-slots- */

interface Props {
  gradients: SavedGradient[]
  activeSlot: number
  saving: boolean
  /** False until an image is picked: there is no gradient to save. */
  canSave: boolean
  onSelect: (slot: number) => void
  onSave: () => void
  onClear: () => void
}

function GradientSlots({ gradients, activeSlot, saving, canSave, onSelect, onSave, onClear }: Props) {
  const bySlot = new Map(gradients.map((g) => [g.slot, g]))
  const count = Math.max(1, activeSlot, ...gradients.map((g) => g.slot))

  return (
    <section className="gl-slots" aria-labelledby="gl-slots-title">
      <div className="gl-slots__head">
        <h2 id="gl-slots-title" className="gl-section__title">
          Gradients <span className="gl-slots__count">{gradients.length} saved</span>
        </h2>
      </div>

      <ol className="gl-slots__grid">
        {Array.from({ length: count }, (_, i) => {
          const slot = i + 1
          const saved = bySlot.get(slot)
          const isActive = slot === activeSlot
          return (
            <li key={slot}>
              <button
                type="button"
                className={`gl-slots__slot${saved ? ' gl-slots__slot--saved' : ''}${isActive ? ' gl-slots__slot--active' : ''}`}
                aria-pressed={isActive}
                aria-label={saved ? `Gradient ${slot}, saved. Open it` : `Gradient ${slot}, empty`}
                onClick={() => onSelect(slot)}
              >
                {saved ? (
                  <img src={`${saved.image}?v=${encodeURIComponent(saved.savedAt)}`} alt="" />
                ) : (
                  <span className="gl-slots__number">{slot}</span>
                )}
              </button>
              {isActive && (canSave || saved) && (
                <div className="gl-slots__tools">
                  {canSave && (
                    <Tooltip icon={false} text={saved ? `Update gradient ${slot}` : `Save as gradient ${slot}`} className="gl-slots__save-wrap">
                      <button
                        type="button"
                        className="gl-slots__save"
                        aria-label={saved ? `Update gradient ${slot}` : `Save as gradient ${slot}`}
                        aria-busy={saving}
                        disabled={saving}
                        onClick={onSave}
                      >
                        {saving ? (
                          <span className="ds-btn__spinner ds-btn__spinner--inline" aria-hidden="true" />
                        ) : (
                          <TickCircle size={20} variant="Linear" color="var(--text-primary)" />
                        )}
                      </button>
                    </Tooltip>
                  )}
                  {saved && (
                    <Tooltip icon={false} text={`Clear gradient ${slot}`} className="gl-slots__save-wrap">
                      {/* A small yes / no menu rather than a dialog: clearing is quick to redo by saving again. */}
                      <RowActionsMenu
                        ariaLabel={`Clear gradient ${slot}?`}
                        triggerClassName="gl-slots__save"
                        menuClassName="gl-slots__menu"
                        triggerContent={<Trash size={20} variant="Linear" color="var(--text-primary)" />}
                        items={[
                          { key: 'yes', label: 'Yes, clear it', danger: true },
                          { key: 'no', label: 'No' },
                        ]}
                        onSelect={(key) => key === 'yes' && onClear()}
                      />
                    </Tooltip>
                  )}
                </div>
              )}
            </li>
          )
        })}
        <li>
          <Tooltip icon={false} text="Add a slot" className="gl-slots__add-wrap">
            <button type="button" className="gl-slots__slot gl-slots__add" aria-label="Add a slot" onClick={() => onSelect(count + 1)}>
              <Add size={20} variant="Linear" color="var(--text-secondary)" />
            </button>
          </Tooltip>
        </li>
      </ol>

    </section>
  )
}

export default GradientSlots
