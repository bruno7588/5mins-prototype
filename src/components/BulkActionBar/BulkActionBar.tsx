import { type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Add } from 'iconsax-react'
import './BulkActionBar.css'

interface BulkActionBarProps {
  /** Selected row count. Drives visibility: the bar slides in above 0, out at 0. */
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
 *
 * Mount it unconditionally and let `count` drive it — the bar owns its own
 * enter/exit, so a `count > 0 &&` guard at the call site would cut the exit off.
 * AnimatePresence keeps rendering the element from the last selected render, so
 * the count (and any count in a child label) holds its value on the way out
 * instead of flashing zero.
 */
function BulkActionBar({ count, onClear, children, label = 'selected' }: BulkActionBarProps) {
  const reduceMotion = useReducedMotion()
  const motionProps = reduceMotion
    ? { transition: { duration: 0 } }
    : {
        transition: { duration: 0.14, ease: 'easeOut' as const },
        // Leaves a touch quicker than it arrives, so dismissal feels responsive.
        exit: { opacity: 0, y: 16, transition: { duration: 0.1, ease: 'easeIn' as const } },
      }

  return (
    <div className="bulk-bar-layer">
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            className="bulk-bar"
            role="region"
            aria-label="Bulk actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            {...motionProps}
          >
            <button className="bulk-bar-close" aria-label="Clear selection" onClick={onClear}>
              <Add size={20} color="currentColor" style={{ transform: 'rotate(45deg)' }} />
            </button>
            <span className="bulk-bar-count">{count} {label}</span>
            <div className="bulk-bar-divider" />
            <div className="bulk-bar-actions">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BulkActionBar
