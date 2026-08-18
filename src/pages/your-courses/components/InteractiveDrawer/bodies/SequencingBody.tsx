import { useState, type DragEvent } from 'react'
import { Add, ArrowDown, ArrowUp, Danger } from 'iconsax-react'
import Button from '@/components/Button/Button'
import Tooltip from '@/components/Tooltip/Tooltip'
import CloseButton from '@/components/CloseButton/CloseButton'
import {
  conflictFor,
  draftConflicts,
  makeRow,
  type Draft,
  type DraftRow,
} from '@/data/interactiveQuestions'
import type { BodyProps } from '../InteractiveDrawer'
import { autoGrow } from '../autoGrow'
import DragHandleIcon from './DragHandleIcon'

type SequencingDraft = Extract<Draft, { type: 'sequencing' }>

const MIN_STEPS = 3

/**
 * Sequence authoring. The list order **is** the answer — nothing is clicked to
 * mark it — so the rows are numbered and the drawer's callout says so outright.
 *
 * Reorder works by drag or by the ↑/↓ buttons. The buttons aren't a nicety:
 * order carries the answer here, so a mouse-only control would make this format
 * unauthorable by keyboard, and the learner side offers the same pair.
 */
function SequencingBody({ draft, onChange }: BodyProps<SequencingDraft>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  /* Announced on keyboard moves, where there is no pointer to watch. */
  const [announcement, setAnnouncement] = useState('')

  const steps = draft.steps
  /* Only the conflicts — two identical steps, which can't be ordered by reading
     them. The count rule stays silent (see InteractiveDrawer). */
  const conflicts = draftConflicts(draft)
  const setSteps = (next: DraftRow[]) => onChange({ ...draft, steps: next })

  const move = (from: number, to: number) => {
    const copy = [...steps]
    const [moved] = copy.splice(from, 1)
    copy.splice(to, 0, moved)
    setSteps(copy)
  }

  const moveByKeyboard = (from: number, to: number) => {
    move(from, to)
    setAnnouncement(`Step ${from + 1} moved to position ${to + 1} of ${steps.length}`)
  }

  /* Only the grip is draggable; the row is the drop target. Otherwise the
     textarea inside can't be selected with the mouse. */
  const handleDragStart = (i: number) => (e: DragEvent) => {
    setDragIndex(i)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(i))
  }

  const handleDragOver = (i: number) => (e: DragEvent) => {
    if (dragIndex === null || dragIndex === i) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(i)
  }

  const handleDrop = (i: number) => (e: DragEvent) => {
    e.preventDefault()
    if (dragIndex !== null && dragIndex !== i) move(dragIndex, i)
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const clearDrag = () => {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="iq-drawer__field">
      <span className="iq-drawer__label">Steps, in the correct order</span>
      <div
        className="iq-drawer__rows"
        role="group"
        aria-label="Steps in the correct order"
      >
        {steps.map((step, index) => {
          /* The DS error state goes on the rows actually holding the repeated
             text, and the message under each of them. */
          const conflict = conflictFor(conflicts, 'steps', step.a)
          const errored = Boolean(conflict)
          return (
          <div className="iq-drawer__row-field" key={step.id}>
          <div
            className={`iq-drawer__row${dragIndex === index ? ' iq-drawer__row--dragging' : ''}${
              dragOverIndex === index ? ' iq-drawer__row--dragover' : ''
            }${errored ? ' iq-drawer__row--error' : ''}`}
            onDragOver={handleDragOver(index)}
            onDrop={handleDrop(index)}
            onDragEnd={clearDrag}
          >
            <span
              className="iq-drawer__grip"
              draggable
              onDragStart={handleDragStart(index)}
              onDragEnd={clearDrag}
              aria-hidden="true"
            >
              <DragHandleIcon />
            </span>
            <span className="iq-drawer__row-index">{index + 1}</span>
            <textarea
              ref={autoGrow}
              rows={1}
              className="iq-drawer__row-input"
              placeholder={`Write step ${index + 1} here...`}
              aria-label={`Step ${index + 1} of ${steps.length}`}
              aria-invalid={errored || undefined}
              aria-describedby={errored ? `iq-conflict-${step.id}` : undefined}
              value={step.a}
              onInput={(e) => autoGrow(e.currentTarget)}
              onChange={(e) =>
                setSteps(steps.map((s) => (s.id === step.id ? { ...s, a: e.target.value } : s)))
              }
            />
            {/* Before the arrows, not after: the icon belongs to the field it is
                reporting on, and trailing it left the row ending on an alarm. */}
            {errored && (
              <span className="iq-drawer__row-danger">
                <Danger size={20} color="var(--text-error)" variant="Bold" />
              </span>
            )}
            {/* Tooltips off at the ends of the list: the button is disabled there,
                and a label for a move that can't happen is just noise. */}
            <div className="iq-drawer__row-move">
              <Tooltip text="Move up" position="Top" icon={false} disabled={index === 0}>
                <button
                  type="button"
                  className="iq-drawer__move-btn"
                  disabled={index === 0}
                  aria-label={`Move step ${index + 1} up`}
                  onClick={() => moveByKeyboard(index, index - 1)}
                >
                  {/* Shafted arrow, not a chevron — a chevron here reads as a
                      dropdown (Figma vuesax/linear/arrow-down, 10215:68484). */}
                  <ArrowUp size={16} color="currentColor" variant="Linear" />
                </button>
              </Tooltip>
              <Tooltip
                text="Move down"
                position="Top"
                icon={false}
                disabled={index === steps.length - 1}
              >
                <button
                  type="button"
                  className="iq-drawer__move-btn"
                  disabled={index === steps.length - 1}
                  aria-label={`Move step ${index + 1} down`}
                  onClick={() => moveByKeyboard(index, index + 1)}
                >
                  <ArrowDown size={16} color="currentColor" variant="Linear" />
                </button>
              </Tooltip>
            </div>
            {/* Three steps is the floor, so the control simply isn't there below it. */}
            {steps.length > MIN_STEPS && (
              <CloseButton
                size={16}
                className="iq-drawer__row-remove"
                ariaLabel={`Remove step ${index + 1}`}
                onClick={() => setSteps(steps.filter((s) => s.id !== step.id))}
              />
            )}
          </div>
          {conflict && (
            <span className="iq-drawer__conflict" id={`iq-conflict-${step.id}`} role="alert">
              {conflict.message}
            </span>
          )}
          </div>
          )
        })}
      </div>

      <div className="iq-drawer__row-actions">
        <Button
          variant="outlined-2"
          icon={<Add size={20} color="currentColor" variant="Linear" />}
          onClick={() => setSteps([...steps, makeRow()])}
        >
          Add Step
        </Button>
      </div>

      <span className="iq-drawer__sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </div>
  )
}

export default SequencingBody
