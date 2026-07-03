import { type ReactElement } from 'react'

interface AddContentMenuItemProps {
  icon: ReactElement
  label: string
  hasDropdown?: boolean
  onClick?: () => void
}

function AddContentMenuItem({ icon, label, hasDropdown, onClick }: AddContentMenuItemProps) {
  return (
    <button className="sc-add-content-menu-item" onClick={onClick}>
      <span className="sc-add-content-menu-item-icon">{icon}</span>
      <span className="sc-add-content-menu-item-label">{label}</span>
      {hasDropdown && (
        <svg
          className="sc-add-content-menu-item-arrow"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}

export default AddContentMenuItem
