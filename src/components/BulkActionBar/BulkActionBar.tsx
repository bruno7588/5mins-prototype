import { type ReactNode } from 'react'
import { Add } from 'iconsax-react'
import './BulkActionBar.css'

interface BulkActionBarProps {
  count: number
  onClear: () => void
  /** Action buttons — use the .bulk-bar-btn (--primary / --danger / --outlined) classes. */
  children: ReactNode
  /** Word after the count, e.g. "selected". */
  label?: string
}

/**
 * Floating bulk-action pill shown when rows are selected in a table.
 * The surface uses --tooltip-background (Neutral-800 light / Neutral-900 dark),
 * the same dark chip as the tooltip, so light text reads in both modes.
 * Anchored bottom-centre, offset for the 240px side panel.
 */
function BulkActionBar({ count, onClear, children, label = 'selected' }: BulkActionBarProps) {
  return (
    <div className="bulk-bar-layer">
      <div className="bulk-bar" role="region" aria-label="Bulk actions">
        <button className="bulk-bar-close" aria-label="Clear selection" onClick={onClear}>
          <Add size={18} color="currentColor" style={{ transform: 'rotate(45deg)' }} />
        </button>
        <span className="bulk-bar-count">{count} {label}</span>
        <div className="bulk-bar-divider" />
        <div className="bulk-bar-actions">{children}</div>
      </div>
    </div>
  )
}

export default BulkActionBar
