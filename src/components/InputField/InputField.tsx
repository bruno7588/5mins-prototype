import { type ChangeEventHandler, type FocusEventHandler, type ReactNode, useId } from 'react'
import { Danger, TickCircle } from 'iconsax-react'
import './InputField.css'

interface InputFieldProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  helperText?: string
  validation?: 'none' | 'error' | 'warning' | 'success'
  iconRight?: ReactNode
  disabled?: boolean
  type?: string
  className?: string
  autoFocus?: boolean
}

function InputField({
  label,
  placeholder = 'Input text',
  value,
  onChange,
  onBlur,
  helperText,
  validation = 'none',
  iconRight,
  disabled = false,
  type = 'text',
  className,
  autoFocus,
}: InputFieldProps) {
  const id = useId()
  const helperId = helperText ? `${id}-helper` : undefined

  return (
    <div className={`input-field${disabled ? ' input-field--disabled' : ''}${validation !== 'none' ? ` input-field--${validation}` : ''}${className ? ` ${className}` : ''}`}>
      {label && (
        <label className="input-field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="input-field__wrapper">
        <input
          id={id}
          className="input-field__input"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={validation === 'error' ? true : undefined}
          aria-describedby={helperId}
        />
        {(validation !== 'none' || iconRight) && (
          <div className="input-field__icons">
            {validation === 'error' && <Danger size={20} color="var(--text-error)" variant="Bold" />}
            {validation === 'warning' && <Danger size={20} color="var(--text-warning)" variant="Linear" />}
            {validation === 'success' && <TickCircle size={20} color="var(--text-success)" variant="Bold" />}
            {iconRight}
          </div>
        )}
      </div>
      {helperText && (
        <span className="input-field__helper" id={helperId}>
          {helperText}
        </span>
      )}
    </div>
  )
}

export default InputField
