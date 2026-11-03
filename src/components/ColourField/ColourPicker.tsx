import { useEffect, useState, type KeyboardEvent, type PointerEvent } from 'react'
import InputField from '@/components/InputField/InputField'
import { clamp, hexToHsv, hsvToHex, normaliseHex, type Hsv } from './colour'
import './ColourField.css'

/* The picker inside the Colour field popover (docs/design-system/colour-field.md):
   saturation/brightness square, hue slider, hex input. Shared with any control that
   needs the same picker in its own popover, such as the email editor's text colour. */

interface ColourPickerProps {
  /** Names the hex input for screen readers ("<label> hex value"). */
  label: string
  /** #rrggbb */
  value: string
  onChange: (hex: string) => void
}

function ColourPicker({ label, value, onChange }: ColourPickerProps) {
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
    <>
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
    </>
  )
}

export default ColourPicker
