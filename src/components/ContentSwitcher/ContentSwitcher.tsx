import { useId, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Tooltip from '@/components/Tooltip/Tooltip'
import './ContentSwitcher.css'

export interface SwitcherItem {
  key: string
  label: string
  disabled?: boolean
  /** Leading icon, a 20px currentColor glyph (Library "Leading icon"). */
  icon?: ReactNode
  /** Hides the label and shows only the icon (Library "Show label" off). The label stays
      the segment's accessible name and its hover tooltip. */
  iconOnly?: boolean
}

interface ContentSwitcherProps {
  items: SwitcherItem[]
  activeKey: string
  onChange: (key: string) => void
  className?: string
  /** Labels the tablist for screen readers, e.g. "Course filter". */
  ariaLabel?: string
}

/** Segmented control (DS: chips-switcher-tabs.md → Content Switcher). The amber
 *  selection pill slides between segments via Framer Motion shared layout
 *  (`layoutId`), so switching feels continuous rather than abrupt. */
function ContentSwitcher({ items, activeKey, onChange, className = '', ariaLabel }: ContentSwitcherProps) {
  const reduce = useReducedMotion()
  const pillId = useId()
  return (
    <div className={`switcher${className ? ` ${className}` : ''}`} role="tablist" aria-orientation="horizontal" aria-label={ariaLabel}>
      {items.map((item) => {
        const selected = item.key === activeKey
        const iconOnly = !!item.icon && !!item.iconOnly
        const button = (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={iconOnly ? item.label : undefined}
            disabled={item.disabled}
            className={`switcher__item${selected ? ' is-selected' : ''}`}
            onClick={() => onChange(item.key)}
          >
            {selected && (
              <motion.span
                layoutId={`switcher-pill-${pillId}`}
                className="switcher__pill"
                aria-hidden="true"
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 480, damping: 38 }}
              />
            )}
            {item.icon && <span className="switcher__icon" aria-hidden="true">{item.icon}</span>}
            {!iconOnly && <span className="switcher__label">{item.label}</span>}
          </button>
        )
        return iconOnly ? (
          <Tooltip key={item.key} text={item.label} icon={false}>
            {button}
          </Tooltip>
        ) : (
          button
        )
      })}
    </div>
  )
}

export default ContentSwitcher
