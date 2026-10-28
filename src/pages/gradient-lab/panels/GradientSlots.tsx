import { useEffect, useState, type DragEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Add, ClipboardImport, Copy, DocumentCopy, TickCircle, Trash } from 'iconsax-react'
import RowActionsMenu from '@/components/RowActionsMenu/RowActionsMenu'
import Tooltip from '@/components/Tooltip/Tooltip'
import { arriveTransition } from '@/components/AIWorkingCard/arrive'
import type { SavedGradient } from '../gradients'

/** Slots 1 and 2 are the company image in light and dark mode, 3 and 4 likewise (slotMode in brandTheme.ts). */
const MODE_LABEL: Record<number, string> = { 1: 'Light', 2: 'Dark', 3: 'Light', 4: 'Dark' }

/* The saved gradients, as a strip under the preview: the saved slots in order
   (no gaps), the active slot when it is a new empty one, then a + tile that adds
   one. Clicking a slot makes it the active one (and loads it when saved); the
   tick under the active slot saves the current gradient into it, and the copy
   button saves it as a new slot at the end. Copy Settings keeps the gradient on screen and Paste
   Settings loads it into the open slot, to save with the tick. Saved slots
   drag to a new position; the strip reorders live and saves on drop. Prefix: gl-slots- */

interface Props {
  gradients: SavedGradient[]
  activeSlot: number
  saving: boolean
  /** True while the new slot has unsaved changes: its tile stays when another slot is open. */
  hasDraft: boolean
  /** False until an image is picked: there is no gradient to save. */
  canSave: boolean
  onSelect: (slot: number) => void
  onSave: () => void
  /** Saves the current gradient as a new slot at the end. */
  onDuplicate: () => void
  onClear: () => void
  /** Keeps the gradient on screen to paste into another slot. */
  onCopy: () => void
  /** The slot the copied settings came from, or null when nothing is copied. */
  copiedFrom: number | null
  onPaste: () => void
  /** Every saved slot once, in the new order. */
  onReorder: (slots: number[]) => void
}

function GradientSlots({ gradients, activeSlot, saving, hasDraft, canSave, onSelect, onSave, onDuplicate, onClear, onCopy, copiedFrom, onPaste, onReorder }: Props) {
  const reduce = useReducedMotion()
  const bySlot = new Map(gradients.map((g) => [g.slot, g]))
  const [dragSlot, setDragSlot] = useState<number | null>(null)
  // The order while dragging, and after a drop until the saved list comes back.
  const [order, setOrder] = useState<number[] | null>(null)
  useEffect(() => setOrder(null), [gradients])

  const slots = order ?? gradients.map((g) => g.slot)
  const nextSlot = Math.max(0, ...gradients.map((g) => g.slot)) + 1
  const shown = bySlot.has(activeSlot) ? (hasDraft ? [...slots, nextSlot] : slots) : [...slots, activeSlot]

  const dragOver = (over: number) => (e: DragEvent) => {
    if (dragSlot === null) return
    e.preventDefault()
    if (over === dragSlot || !bySlot.has(over)) return
    const next = slots.filter((s) => s !== dragSlot)
    next.splice(slots.indexOf(over), 0, dragSlot)
    setOrder(next)
  }

  const dragEnd = () => {
    setDragSlot(null)
    if (order && order.some((s, i) => s !== gradients[i]?.slot)) onReorder(order)
    else setOrder(null)
  }

  return (
    <section className="gl-slots" aria-labelledby="gl-slots-title">
      <div className="gl-slots__head">
        <h2 id="gl-slots-title" className="gl-section__title">
          Gradients <span className="gl-slots__count">{gradients.length} saved</span>
        </h2>
      </div>

      <ol className="gl-slots__grid">
        {shown.map((slot) => {
          const saved = bySlot.get(slot)
          const isActive = slot === activeSlot
          return (
            // Keyed by the gradient, not its number, so a reorder slides tiles instead of swapping them.
            <motion.li
              key={saved ? saved.savedAt : 'new'}
              layout="position"
              transition={arriveTransition(reduce)}
              onDragOver={dragOver(slot)}
              onDrop={(e) => e.preventDefault()}
            >
              <button
                type="button"
                className={`gl-slots__slot${saved ? ' gl-slots__slot--saved' : ''}${isActive ? ' gl-slots__slot--active' : ''}${slot === dragSlot ? ' gl-slots__slot--dragging' : ''}`}
                aria-pressed={isActive}
                aria-label={`Gradient ${slot}${MODE_LABEL[slot] ? ` (${MODE_LABEL[slot].toLowerCase()} mode)` : ''}, ${saved ? 'saved. Open it' : 'empty'}`}
                draggable={Boolean(saved)}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move'
                  setDragSlot(slot)
                }}
                onDragEnd={dragEnd}
                onClick={() => onSelect(slot)}
              >
                {saved ? (
                  <img src={`${saved.image}?v=${encodeURIComponent(saved.savedAt)}`} alt="" draggable={false} />
                ) : (
                  <span className="gl-slots__number">{slot}</span>
                )}
              </button>
              {MODE_LABEL[slot] && <span className="gl-slots__mode" aria-hidden="true">{MODE_LABEL[slot]}</span>}
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
                    <Tooltip icon={false} text={`Duplicate gradient ${slot}`} className="gl-slots__save-wrap">
                      <button
                        type="button"
                        className="gl-slots__save"
                        aria-label={`Duplicate gradient ${slot}`}
                        disabled={saving}
                        onClick={onDuplicate}
                      >
                        <Copy size={20} variant="Linear" color="var(--text-primary)" />
                      </button>
                    </Tooltip>
                  )}
                  <Tooltip icon={false} text={`Copy settings of gradient ${slot}`} className="gl-slots__save-wrap">
                    <button type="button" className="gl-slots__save" aria-label={`Copy settings of gradient ${slot}`} onClick={onCopy}>
                      <DocumentCopy size={20} variant="Linear" color="var(--text-primary)" />
                    </button>
                  </Tooltip>
                  {copiedFrom !== null && copiedFrom !== slot && (
                    <Tooltip icon={false} text={`Paste settings of gradient ${copiedFrom}`} className="gl-slots__save-wrap">
                      <button type="button" className="gl-slots__save" aria-label={`Paste settings of gradient ${copiedFrom}`} onClick={onPaste}>
                        <ClipboardImport size={20} variant="Linear" color="var(--text-primary)" />
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
            </motion.li>
          )
        })}
        <li>
          <Tooltip icon={false} text="Add a slot" className="gl-slots__add-wrap">
            <button type="button" className="gl-slots__slot gl-slots__add" aria-label="Add a slot" onClick={() => onSelect(nextSlot)}>
              <Add size={20} variant="Linear" color="var(--text-secondary)" />
            </button>
          </Tooltip>
        </li>
      </ol>

    </section>
  )
}

export default GradientSlots
