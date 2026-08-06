import { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

export type ButtonVariant = 'filled' | 'outlined' | 'outlined-2' | 'text' | 'link'
export type ButtonSemantic = 'primary' | 'danger' | 'warning' | 'success' | 'ai'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  semantic?: ButtonSemantic
  size?: ButtonSize
  /** Leading icon — rendered BEFORE the label. Pass an Iconsax icon sized 16/20/24 with color="currentColor". */
  icon?: ReactNode
  /** Trailing icon — AFTER the label. The 2026-08-04 rework made icons leading, so
   *  this is only for disclosure controls whose Figma shows a trailing chevron
   *  (My Team courses button, Figma 10837:17669). Prefer `icon` otherwise. */
  trailingIcon?: ReactNode
  loading?: boolean
  children?: ReactNode
}

/**
 * Button — implements docs/design-system/buttons.md.
 * Namespaced `ds-btn` to avoid colliding with the legacy global `.btn-*` utility
 * classes in tokens.css. New work should prefer this component.
 */
function Button({
  variant = 'filled',
  semantic = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  loading = false,
  disabled,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [
    'ds-btn',
    `ds-btn--${size}`,
    `ds-btn--${appearance(semantic, variant)}`,
    icon && children && 'ds-btn--has-icon',
    trailingIcon && children && 'ds-btn--has-trailing',
    loading && 'ds-btn--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {icon && <span className="ds-btn__icon">{icon}</span>}
      <span className="ds-btn__label">{children}</span>
      {trailingIcon && <span className="ds-btn__icon">{trailingIcon}</span>}
      {loading && <span className="ds-btn__spinner" aria-hidden="true" />}
    </button>
  )
}

/** Maps (semantic, variant) to the single appearance class that styles the button. */
function appearance(semantic: ButtonSemantic, variant: ButtonVariant): string {
  if (semantic === 'primary') return variant
  // Semantic families only mirror filled / outlined / text.
  if (variant === 'filled') return semantic
  if (variant === 'outlined' || variant === 'outlined-2') return `${semantic}-outlined`
  return `${semantic}-text` // text + link both use the text treatment
}

export default Button
