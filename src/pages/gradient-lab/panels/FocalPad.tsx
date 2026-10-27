import { useId, useRef, type KeyboardEvent, type PointerEvent } from 'react'

/* Focal point pad: a square with a draggable marker for gradient.offsetX/Y
   (-1 to 1 each, y down). The DS has no 2D pad, so this is page-local
   (prefix gl-pad-). The marker is one focusable slider: arrow keys move it
   (Shift for bigger steps), Home centres it; its value text reads both axes. */

const STEP = 0.01
const BIG_STEP = 0.1

const clamp = (v: number) => Math.min(1, Math.max(-1, v))
const round = (v: number) => Math.round(v * 100) / 100
const fmt = (v: number) => (v === 0 ? '0.00' : v.toFixed(2))

interface Props {
  x: number
  y: number
  onChange: (x: number, y: number) => void
  /** What the marker moves, for screen readers. */
  label?: string
}

function FocalPad({ x, y, onChange, label = 'Focal point' }: Props) {
  const hintId = useId()
  const padRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)

  const fromPointer = (e: PointerEvent) => {
    const rect = padRef.current?.getBoundingClientRect()
    if (!rect) return
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1
    onChange(round(clamp(nx)), round(clamp(ny)))
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    thumbRef.current?.focus()
    fromPointer(e)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.shiftKey ? BIG_STEP : STEP
    let nx = x
    let ny = y
    switch (e.key) {
      case 'ArrowLeft': nx -= step; break
      case 'ArrowRight': nx += step; break
      case 'ArrowUp': ny -= step; break
      case 'ArrowDown': ny += step; break
      case 'Home': nx = 0; ny = 0; break
      default: return
    }
    e.preventDefault()
    onChange(round(clamp(nx)), round(clamp(ny)))
  }

  const readout = `X ${fmt(x)} · Y ${fmt(y)}`

  return (
    <div className="gl-pad">
      <div
        ref={padRef}
        className="gl-pad__area"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        <span className="gl-pad__axis gl-pad__axis--x" aria-hidden="true" />
        <span className="gl-pad__axis gl-pad__axis--y" aria-hidden="true" />
        <div
          ref={thumbRef}
          className="gl-pad__thumb"
          style={{ left: `${((x + 1) / 2) * 100}%`, top: `${((y + 1) / 2) * 100}%` }}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={-1}
          aria-valuemax={1}
          aria-valuenow={x}
          aria-valuetext={`X ${fmt(x)}, Y ${fmt(y)}`}
          aria-describedby={hintId}
          onKeyDown={onKeyDown}
        />
      </div>
      <p className="gl-pad__readout" aria-hidden="true">{readout}</p>
      <p id={hintId} className="gl-visually-hidden">
        Arrow keys move the point, Shift moves it further, Home centres it.
      </p>
    </div>
  )
}

export default FocalPad
