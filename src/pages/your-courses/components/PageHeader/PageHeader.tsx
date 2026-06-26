import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import './PageHeader.css'

export interface PageHeaderTab {
  label: string
}

interface PageHeaderProps {
  title?: string
  tabs?: PageHeaderTab[]
  activeTab?: string
  onTabChange?: (label: string) => void
  secondaryLabel?: string
  onSecondary?: () => void
  secondaryDisabled?: boolean
  /** Hide the secondary (Save Draft) button entirely — e.g. the Program Builder. */
  hideSecondary?: boolean
  primaryLabel?: string
  primaryIcon?: ReactNode
  onPrimary?: () => void
  primaryDisabled?: boolean
  onClose?: () => void
}

const DEFAULT_TABS: PageHeaderTab[] = [
  { label: 'Details' },
  { label: 'Course Content' },
  { label: 'Resources' },
  { label: 'Settings' },
]

/**
 * Builder page header — title, Save Draft / primary action, close, and tabs.
 * Defaults reproduce the Create Course header so existing callers (`<PageHeader />`)
 * are unchanged; pass props to reuse it for other builders (e.g. Create Program).
 */
function PageHeader({
  title = 'Create course',
  tabs = DEFAULT_TABS,
  activeTab = 'Course Content',
  onTabChange,
  secondaryLabel = 'Save Draft',
  onSecondary,
  secondaryDisabled = true,
  hideSecondary = false,
  primaryLabel = 'Create Course',
  primaryIcon,
  onPrimary,
  primaryDisabled = true,
  onClose,
}: PageHeaderProps) {
  const navigate = useNavigate()
  const handleClose = onClose ?? (() => navigate('/your-courses'))

  return (
    <header className="page-header">
      <div className="page-header-top">
        <h2 className="page-header-title">{title}</h2>
        <div className="page-header-actions">
          {!hideSecondary && (
            <button
              className={`page-header-btn-outline-primary${secondaryDisabled ? ' page-header-btn-disabled' : ''}`}
              onClick={secondaryDisabled ? undefined : onSecondary}
            >
              {secondaryLabel}
            </button>
          )}
          <button
            className={`page-header-btn-filled${primaryDisabled ? ' page-header-btn-disabled' : ''}`}
            onClick={primaryDisabled ? undefined : onPrimary}
          >
            {primaryLabel}
            {primaryIcon}
          </button>
          <CloseButton onClick={handleClose} className="page-header-close" />
        </div>
      </div>
      <div className="page-header-divider" aria-hidden="true" />
      <nav className="page-header-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`page-header-tab ${tab.label === activeTab ? 'page-header-tab--active' : ''}`}
            onClick={onTabChange ? () => onTabChange(tab.label) : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  )
}

export default PageHeader
