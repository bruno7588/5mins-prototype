import { useState, type ReactElement, type ReactNode } from 'react'

interface AddContentMenuItemProps {
  icon: ReactElement
  activeIcon?: ReactElement
  label: string
  hasDropdown?: boolean
  children?: ReactNode
  onClick?: () => void
  collapsed?: boolean
  active?: boolean
}

function AddContentMenuItem({ icon, activeIcon, label, hasDropdown, children, onClick, collapsed, active }: AddContentMenuItemProps) {
  const [expanded, setExpanded] = useState(false)

  const handleClick = () => {
    if (hasDropdown) {
      setExpanded(!expanded)
    } else {
      onClick?.()
    }
  }

  return (
    <>
      <button
        className={`add-content-menu-item${active ? ' add-content-menu-item--active' : ''}`}
        onClick={handleClick}
        data-tooltip={collapsed ? label : undefined}
      >
        <span className="add-content-menu-item-icon">{active && activeIcon ? activeIcon : icon}</span>
        {!collapsed && <span className="add-content-menu-item-label">{label}</span>}
        {hasDropdown && !collapsed && (
          <svg
            className={`add-content-menu-item-arrow${expanded ? ' add-content-menu-item-arrow--open' : ''}`}
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
      {hasDropdown && expanded && !collapsed && (
        <div className="add-content-sub-items">
          {children}
        </div>
      )}
    </>
  )
}

export default AddContentMenuItem
