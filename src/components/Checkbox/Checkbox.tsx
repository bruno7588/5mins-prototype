import './Checkbox.css'

// Figma Library checkbox (light 11917:3924 / dark 6339:10484): the tick and minus
// bar are cut out of the filled box, so the surface behind shows through (light
// on light pages, dark in dark mode). Paths in the Figma 32px frame; the
// viewBox crops to the 16px box. Figma has no disabled-checked variant, so a
// disabled box that is checked keeps the checked fill; only the empty box greys out.
const CHECKED_PATH = 'M19.3577 8H12.6503C9.73687 8 8 9.736 8 12.648V19.344C8 22.264 9.73687 24 12.6503 24H19.3497C22.2631 24 24 22.264 24 19.352V12.648C24.008 9.736 22.2711 8 19.3577 8ZM19.8299 14.16L15.2916 18.696C15.1796 18.808 15.0275 18.872 14.8674 18.872C14.7073 18.872 14.5553 18.808 14.4432 18.696L12.1781 16.432C11.946 16.2 11.946 15.816 12.1781 15.584C12.4102 15.352 12.7944 15.352 13.0265 15.584L14.8674 17.424L18.9815 13.312C19.2136 13.08 19.5978 13.08 19.8299 13.312C20.062 13.544 20.062 13.92 19.8299 14.16Z'
const INDETERMINATE_PATH = 'M19.3577 8H12.6503C9.73687 8 8 9.736 8 12.648V19.344C8 22.264 9.73687 24 12.6503 24H19.3497C22.2631 24 24 22.264 24 19.352V12.648C24.008 9.736 22.2711 8 19.3577 8ZM19.2056 16.6H12.8024C12.4742 16.6 12.2021 16.328 12.2021 16C12.2021 15.672 12.4742 15.4 12.8024 15.4H19.2056C19.5337 15.4 19.8059 15.672 19.8059 16C19.8059 16.328 19.5337 16.6 19.2056 16.6Z'

interface CheckboxProps {
  checked: boolean
  /** Partial selection — some but not all children selected. Renders the DS minus bar. */
  indeterminate?: boolean
  onChange?: () => void
  disabled?: boolean
}

function Checkbox({ checked, indeterminate = false, onChange, disabled = false }: CheckboxProps) {
  return (
    <button
      className={`checkbox${disabled ? ' checkbox--disabled' : ''}`}
      onClick={disabled ? undefined : onChange}
      disabled={disabled}
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-disabled={disabled || undefined}
    >
      {indeterminate ? (
        <svg width="16" height="16" viewBox="8 8 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d={INDETERMINATE_PATH} fill="var(--selected)" />
        </svg>
      ) : checked ? (
        <svg width="16" height="16" viewBox="8 8 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d={CHECKED_PATH} fill="var(--selected)" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.75" y="0.75" width="14.5" height="14.5" rx="3.25" stroke={disabled ? 'var(--text-disabled)' : 'var(--text-secondary)'} strokeWidth="1.5" />
        </svg>
      )}
    </button>
  )
}

export default Checkbox
