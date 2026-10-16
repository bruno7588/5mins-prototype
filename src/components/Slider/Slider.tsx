import type { CSSProperties } from 'react'
import './Slider.css'

/* Library Slider (EC26cSVe9KNTCWXvYovakw 10662:14039): a 4px rail, a 6px Selected
   track up to the value and a 20px Selected thumb. Hover adds a soft halo, focus a
   cyan ring, Disabled greys it out. A native range input sits on top for pointer
   and keyboard input. */

interface SliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  disabled?: boolean
  'aria-label': string
  className?: string
}

function Slider({ value, min = 0, max = 100, step = 1, onChange, disabled, className, ...rest }: SliderProps) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0
  return (
    <div
      className={`ds-slider${disabled ? ' ds-slider--disabled' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--slider-pct': pct } as CSSProperties}
    >
      <input
        type="range"
        className="ds-slider__input"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={rest['aria-label']}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="ds-slider__rail" aria-hidden="true" />
      <span className="ds-slider__track" aria-hidden="true" />
      <span className="ds-slider__thumb" aria-hidden="true" />
    </div>
  )
}

export default Slider
