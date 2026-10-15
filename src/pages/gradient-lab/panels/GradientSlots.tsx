import { useState } from 'react'
import { TickCircle } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import Tooltip from '@/components/Tooltip/Tooltip'
import { GRADIENT_SLOTS, type SavedGradient } from '../gradients'

/* The 12 saved gradients, as a strip under the preview. Clicking a slot makes
   it the active one (and loads it when saved); the tick under the active slot
   saves the current gradient into it. Prefix: gl-slots- */

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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const bySlot = new Map(gradients.map((g) => [g.slot, g]))
  const active = bySlot.get(activeSlot)

  return (
    <section className="gl-slots" aria-labelledby="gl-slots-title">
      <div className="gl-slots__head">
        <h2 id="gl-slots-title" className="gl-section__title">
          Gradients <span className="gl-slots__count">{gradients.length} of {GRADIENT_SLOTS} saved</span>
        </h2>
        <div className="gl-slots__actions">
          {active && (
            <Button variant="outlined-2" size="sm" disabled={saving} onClick={() => setConfirmOpen(true)}>
              Clear Slot
            </Button>
          )}
        </div>
      </div>

      <ol className="gl-slots__grid">
        {Array.from({ length: GRADIENT_SLOTS }, (_, i) => {
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
              {isActive && canSave && (
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
            </li>
          )
        })}
      </ol>

      <ConfirmModal open={confirmOpen} onClose={() => setConfirmOpen(false)} ariaLabel={`Clear gradient ${activeSlot}`}>
        <div className="confirm-modal-header">
          <h2 className="confirm-modal-title">Clear gradient {activeSlot}?</h2>
          <p className="confirm-modal-body">
            Its settings are deleted and the app goes back to the placeholder image for this slot.
          </p>
        </div>
        <div className="confirm-modal-actions">
          <Button variant="outlined-2" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            semantic="danger"
            onClick={() => {
              setConfirmOpen(false)
              onClear()
            }}
          >
            Clear Slot
          </Button>
        </div>
      </ConfirmModal>
    </section>
  )
}

export default GradientSlots
