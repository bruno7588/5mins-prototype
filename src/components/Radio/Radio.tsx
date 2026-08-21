import { type InputHTMLAttributes, forwardRef, useId } from 'react'
import './Radio.css'

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: string
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, checked, disabled, className, id, ...props },
  ref,
) {
  const reactId = useId()
  const controlId = id ?? `radio-${reactId}`

  /* className lands on the wrapper, not the input: the wrapper is what carries the
     state classes and what a host scopes its overrides to. It was accepted and then
     dropped, so callers styling a radio in context silently got nothing. */
  const wrapperClass = [
    'radio',
    checked ? 'radio--selected' : '',
    disabled ? 'radio--disabled' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  const control = (
    <span className={wrapperClass}>
      <input
        ref={ref}
        type="radio"
        id={controlId}
        className="radio__input"
        checked={checked}
        disabled={disabled}
        {...props}
      />
      <span className="radio__ring" aria-hidden="true" />
    </span>
  )

  if (!label) return control

  return (
    <label htmlFor={controlId} className={`radio-row${className ? ` ${className}` : ''}`}>
      {control}
      <span className="radio-row__label">{label}</span>
    </label>
  )
})

export default Radio
