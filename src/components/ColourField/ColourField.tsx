import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Colorfilter } from 'iconsax-react'
import InputField from '@/components/InputField/InputField'
import Tooltip from '@/components/Tooltip/Tooltip'
import { clamp, hexToHsv, hsvToHex, normaliseHex, type Hsv } from './colour'
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
  // HSV is held here so the hue survives greys and black, where the hex loses it.
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value))
  const [text, setText] = useState(value.toLowerCase())

  useEffect(() => {
    const hex = normaliseHex(value)
    if (!hex) return
    setHsv((cur) => (hsvToHex(cur) === hex ? cur : hexToHsv(hex)))
    setText((cur) => (normaliseHex(cur) === hex ? cur : hex))
  }, [value])

  const update = (next: Hsv) => {
    setHsv(next)
    onChange(hsvToHex(next))
  }

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

  /* ── Saturation / brightness square ── */
  const fromSquare = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    update({
      h: hsv.h,
      s: Math.round(clamp((e.clientX - r.left) / r.width, 0, 1) * 100),
      v: Math.round((1 - clamp((e.clientY - r.top) / r.height, 0, 1)) * 100),
    })
  }
  const onSquareKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 1
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    }
    const move = moves[e.key]
    if (!move) return
    e.preventDefault()
    update({ h: hsv.h, s: clamp(hsv.s + move[0], 0, 100), v: clamp(hsv.v + move[1], 0, 100) })
  }

  /* ── Hue slider ── */
  const fromHue = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    update({ ...hsv, h: Math.round(clamp((e.clientX - r.left) / r.width, 0, 1) * 360) })
  }
  const onHueKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 1
    const delta = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step }[e.key]
    if (delta === undefined) return
    e.preventDefault()
    update({ ...hsv, h: clamp(hsv.h + delta, 0, 360) })
  }

  const drag = (handler: (e: PointerEvent<HTMLDivElement>) => void) => ({
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      e.currentTarget.focus()
      handler(e)
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) handler(e)
    },
  })

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
            <div
              className="colour-field__square"
              style={{ background: `hsl(${hsv.h} 100% 50%)` }}
              role="slider"
              tabIndex={0}
              aria-label="Saturation and brightness"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={hsv.s}
              aria-valuetext={`Saturation ${hsv.s}%, brightness ${hsv.v}%`}
              onKeyDown={onSquareKey}
              {...drag(fromSquare)}
            >
              <span
                className="colour-field__handle"
                style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, background: hex }}
                aria-hidden="true"
              />
            </div>
            <div
              className="colour-field__hue"
              role="slider"
              tabIndex={0}
              aria-label="Hue"
              aria-valuemin={0}
              aria-valuemax={360}
              aria-valuenow={hsv.h}
              aria-valuetext={`Hue ${hsv.h} degrees`}
              onKeyDown={onHueKey}
              {...drag(fromHue)}
            >
              <span
                className="colour-field__handle"
                style={{ left: `${(hsv.h / 360) * 100}%`, top: '50%', background: `hsl(${hsv.h} 100% 50%)` }}
                aria-hidden="true"
              />
            </div>
            <div className="colour-field__hex-row">
              <span className="colour-field__format" aria-hidden="true">
                HEX
              </span>
              <InputField
                className="colour-field__hex"
                ariaLabel={`${label} hex value`}
                placeholder="#000000"
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  const next = normaliseHex(e.target.value)
                  if (next) onChange(next)
                }}
                onBlur={() => setText(hex)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ColourField
