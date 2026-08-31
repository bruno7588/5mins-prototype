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
  /** Word to show beside the spinner while `loading` — "Generating", "Saving".
   *
   *  Without it the button takes the DS Loading state: the label is replaced by a
   *  centred spinner and the width is preserved. With it the spinner moves into the
   *  leading-icon slot and the button says what it is doing, at the cost of that
   *  preserved width — the button sizes to whichever word it is showing. Use it where
   *  the wait is long enough that a bare spinner leaves the reader guessing. */
  loadingLabel?: string
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
  loadingLabel,
  disabled,
  children,
  className = '',
  type = 'button',
  'aria-label': ariaLabel,
  ...props
}: ButtonProps) {
  /* Two shapes of loading: the DS one that swaps the label for a centred spinner, and
     the labelled one that keeps a word and moves the spinner to the icon slot. */
  const labelled = loading && loadingLabel !== undefined
  const label = labelled ? loadingLabel : children

  const classes = [
    'ds-btn',
    `ds-btn--${size}`,
    `ds-btn--${appearance(semantic, variant)}`,
    ((icon && children) || labelled) && 'ds-btn--has-icon',
    trailingIcon && children && 'ds-btn--has-trailing',
    loading && (labelled ? 'ds-btn--loading-labelled' : 'ds-btn--loading'),
    className,
  ]
    .filter(Boolean)
    .join(' ')

  /* The DS Loading state hides the label to make room for the spinner, and the label is
     what names the button — without this it is announced as an unnamed disabled button
     for as long as the work runs. Only when the caller has not named it themselves, and
     only when the label is a string there is a name to recover from. */
  const name =
    ariaLabel ?? (loading && !labelled && typeof children === 'string' ? children : undefined)

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={name}
      {...props}
    >
      {labelled ? (
        <span className="ds-btn__icon">
          <span className="ds-btn__spinner ds-btn__spinner--inline" aria-hidden="true" />
        </span>
      ) : (
        icon && <span className="ds-btn__icon">{icon}</span>
      )}
      <span className="ds-btn__label">{label}</span>
      {trailingIcon && <span className="ds-btn__icon">{trailingIcon}</span>}
      {loading && !labelled && <span className="ds-btn__spinner" aria-hidden="true" />}
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
