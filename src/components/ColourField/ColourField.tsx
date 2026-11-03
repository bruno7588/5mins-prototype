import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Colorfilter } from 'iconsax-react'
import Tooltip from '@/components/Tooltip/Tooltip'
import { normaliseHex } from './colour'
import ColourPicker from './ColourPicker'
import './ColourField.css'

/* Colour field (docs/design-system/colour-field.md): an Input-styled trigger showing
   a swatch and the hex value, a trailing eyedropper where the browser supports it,
   and a popover picker (saturation/brightness square, hue slider, hex input).
   Source: production Edit theme recording (2026-10-19), pending the Library component.
   Prefix: colour-field */

interface ColourFieldProps {
  label: string
  /** #rrggbb */
  value: string
  onChange: (hex: string) => void
  id?: string
}

interface EyeDropperApi {
  open: () => Promise<{ sRGBHex: string }>
}
type EyeDropperCtor = new () => EyeDropperApi
const EyeDropper = (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper

const POPOVER_WIDTH = 264
const DROPPER_LABEL = 'Pick colour from screen'

function ColourField({ label, value, onChange, id }: ColourFieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const popoverId = `${fieldId}-picker`
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const reduce = useReducedMotion()

  const [open, setOpen] = useState(false)
  const [alignEnd, setAlignEnd] = useState(false)
  const close = (refocus: boolean) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }

  const toggle = () => {
    if (open) return close(false)
    // Open towards the end when the popover would run past the dialog (or window) edge.
    const root = rootRef.current
    if (root) {
      const rect = root.getBoundingClientRect()
      const right = root.closest('[aria-modal]')?.getBoundingClientRect().right ?? window.innerWidth
      setAlignEnd(rect.left + POPOVER_WIDTH > right)
    }
    setOpen(true)
  }

  // Outside pointerdown closes. Capture phase, because the modal panel stops mousedown bubbling.
  useEffect(() => {
    if (!open) return
    const onDown = (e: globalThis.PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown, true)
    return () => document.removeEventListener('pointerdown', onDown, true)
  }, [open])

  const onRootKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      // Keep the Escape from also closing a surrounding modal.
      e.stopPropagation()
      close(true)
    }
  }

  const pickFromScreen = async () => {
    if (!EyeDropper) return
    try {
      const hex = normaliseHex((await new EyeDropper().open()).sRGBHex)
      if (hex) onChange(hex)
    } catch {
      /* the user cancelled the eyedropper */
    }
  }

  const hex = value.toLowerCase()

  return (
    <div className="colour-field" ref={rootRef} onKeyDown={onRootKeyDown}>
      <label className="colour-field__label" htmlFor={fieldId}>
        {label}
      </label>
      <div className={`colour-field__control${open ? ' is-open' : ''}`}>
        <button
          ref={triggerRef}
          id={fieldId}
          type="button"
          className="colour-field__trigger"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? popoverId : undefined}
          onClick={toggle}
        >
          <span className="colour-field__swatch" style={{ background: hex }} aria-hidden="true" />
          <span className="colour-field__value">{hex}</span>
        </button>
        {EyeDropper && (
          <Tooltip text={DROPPER_LABEL} position="Top" icon={false}>
            <button type="button" className="colour-field__dropper" aria-label={DROPPER_LABEL} onClick={pickFromScreen}>
              <Colorfilter size={20} color="var(--text-primary)" variant="Linear" />
            </button>
          </Tooltip>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id={popoverId}
            className={`colour-field__popover${alignEnd ? ' colour-field__popover--end' : ''}`}
            role="dialog"
            aria-label={`${label} colour`}
            initial={reduce ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
          >
            <ColourPicker label={label} value={value} onChange={onChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ColourField
