import './Checkbox.css'

interface CheckboxProps {
  checked: boolean
  onChange?: () => void
}

function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <button
      className="checkbox"
      onClick={onChange}
      role="checkbox"
      aria-checked={checked}
    >
      {checked ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="16" height="16" rx="4" fill="var(--selected)" />
          <path d="M4.5 8.5L7 11L11.5 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.75" y="0.75" width="14.5" height="14.5" rx="3.25" stroke="var(--text-secondary, #656B7C)" strokeWidth="1.5" />
        </svg>
      )}
    </button>
  )
}

export default Checkbox
