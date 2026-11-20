import { InputHTMLAttributes, forwardRef, useId } from 'react'
import './Toggle.css'

type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: React.ReactNode
  labelPosition?: 'left' | 'right'
  size?: 'md' | 'sm'
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, labelPosition = 'right', size = 'md', checked, disabled, id, className, ...props }, ref) => {
    const reactId = useId()
    const controlId = id ?? `toggle-${reactId}`
    const wrapperClass = [
      'toggle',
      size === 'sm' ? 'toggle--sm' : '',
      checked ? 'toggle--on' : '',
      disabled ? 'toggle--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ')

    const control = (
      <span className={wrapperClass}>
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={controlId}
          className="toggle__input"
          checked={checked}
          disabled={disabled}
          aria-checked={checked ? 'true' : 'false'}
          {...props}
        />
        <span className="toggle__track" aria-hidden="true" />
        <span className="toggle__thumb" aria-hidden="true" />
      </span>
    )

    if (!label) return control

    return (
      <label
        htmlFor={controlId}
        className={`toggle-row toggle-row--${labelPosition} ${className ?? ''}`.trim()}
      >
        {labelPosition === 'left' && <span className="toggle-row__label">{label}</span>}
        {control}
        {labelPosition === 'right' && <span className="toggle-row__label">{label}</span>}
      </label>
    )
  },
)

Toggle.displayName = 'Toggle'

export default Toggle
