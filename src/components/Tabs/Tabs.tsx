import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import './Tabs.css'

export interface TabItem {
  /** Unique key; `activeKey` and `onChange` use it. */
  key: string
  label: ReactNode
  /** Renders the counter pill beside the label when set (0 included). */
  counter?: number
  /** A tab that is not built yet: dimmed and inert (the `.ui-disabled` utility), skipped by arrow keys. */
  disabled?: boolean
}

interface TabsProps {
  items: TabItem[]
  activeKey: string
  onChange: (key: string) => void
  /** Names the tab list for assistive tech, e.g. "Course sections". */
  ariaLabel?: string
  /** Extra class on the bar, for page layout (margins, a divider below). */
  className?: string
}

/* Tabs - chips-switcher-tabs.md (Figma 8497:24855, item 1939:18281). Underlined
   bar between sibling sections of one page: selected label Bold --text-primary
   with a 2px --selected indicator, others Medium --text-secondary, 16px apart.
   Arrow keys move between tabs (WAI-ARIA tabs pattern). */
function Tabs({ items, activeKey, onChange, ariaLabel, className }: TabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const enabled = items.map((t, i) => (t.disabled ? -1 : i)).filter((i) => i >= 0)
    const pos = enabled.indexOf(index)
    let next = enabled[0]
    if (e.key === 'ArrowRight') next = enabled[(pos + 1) % enabled.length]
    if (e.key === 'ArrowLeft') next = enabled[(pos - 1 + enabled.length) % enabled.length]
    if (e.key === 'End') next = enabled[enabled.length - 1]
    refs.current[next]?.focus()
    onChange(items[next].key)
  }

  return (
    <div className={['ds-tabs', className].filter(Boolean).join(' ')} role="tablist" aria-label={ariaLabel}>
      {items.map((tab, i) => {
        const selected = tab.key === activeKey
        return (
          <button
            key={tab.key}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            disabled={tab.disabled}
            className={`ds-tab${selected ? ' ds-tab--selected' : ''}${tab.disabled ? ' ui-disabled' : ''}`}
            onClick={() => onChange(tab.key)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            <span className="ds-tab__label">
              {tab.label}
              {tab.counter !== undefined && <span className="ds-tab__counter">{tab.counter}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
