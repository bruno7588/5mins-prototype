import { useId, useState, type ReactNode } from 'react'
import { Add, Minus } from 'iconsax-react'
import './InputInteger.css'

interface InputIntegerProps {
  label?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  helperText?: ReactNode
  validation?: 'none' | 'error' | 'success'
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

/**
 * Integer stepper input — DS "Input field / Integer".
 * A bordered field with a minus control, centred value, and a plus control.
 */
function InputInteger({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  helperText,
  validation = 'none',
  disabled = false,
  className,
  ariaLabel,
}: InputIntegerProps) {
  const id = useId()
  const atMin = min != null && value <= min
  const atMax = max != null && value >= max

  // Holds the raw text while the field is focused, so typing/clearing isn't fought by the
  // controlled numeric value. Committed (and clamped) on blur.
  const [draft, setDraft] = useState<string | null>(null)

  function decrement() {
    if (disabled || atMin) return
    onChange(value - step)
  }

  function increment() {
    if (disabled || atMax) return
    onChange(value + step)
  }

  function handleType(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setDraft(raw)
    if (raw !== '') {
      let n = parseInt(raw, 10)
      if (max != null && n > max) n = max
      onChange(n)
    }
  }

  function handleBlur() {
    let n = draft === null || draft === '' ? value : parseInt(draft, 10)
    if (Number.isNaN(n)) n = value
    if (min != null && n < min) n = min
    if (max != null && n > max) n = max
    if (n !== value) onChange(n)
    setDraft(null)
  }

  return (
    <div
      className={`input-integer${validation !== 'none' ? ` input-integer--${validation}` : ''}${
        disabled ? ' input-integer--disabled' : ''
      }${className ? ` ${className}` : ''}`}
    >
      {label && (
        <label className="input-integer__label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="input-integer__control">
        <button
          type="button"
          className="input-integer__step"
          onClick={decrement}
          disabled={disabled || atMin}
          aria-label="Decrease"
          tabIndex={-1}
        >
          <Minus size={20} color="currentColor" variant="Linear" />
        </button>
        <input
          className="input-integer__value"
          id={id}
          type="text"
          inputMode="numeric"
          value={draft ?? String(value)}
          onChange={handleType}
          onBlur={handleBlur}
          disabled={disabled}
          aria-label={ariaLabel ?? label}
        />
        <button
          type="button"
          className="input-integer__step"
          onClick={increment}
          disabled={disabled || atMax}
          aria-label="Increase"
          tabIndex={-1}
        >
          <Add size={20} color="currentColor" variant="Linear" />
        </button>
      </div>
      {helperText && (
        <span className={`input-integer__helper${validation === 'error' ? ' input-integer__helper--error' : ''}`}>
          {helperText}
        </span>
      )}
    </div>
  )
}

export default InputInteger
