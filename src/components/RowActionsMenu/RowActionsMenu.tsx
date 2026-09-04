import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import MoreIcon from '@/components/icons/MoreIcon'
import './RowActionsMenu.css'

export interface RowMenuItem {
  key: string
  label: string
  /** Optional: a list of plain choices carries no icons, and an empty slot in
      front of every row would indent them for nothing. */
  icon?: ReactNode
  /** Second line under the label. Use where the label alone doesn't separate
      one action from its neighbours (listbox.md supporting text). */
  description?: string
  danger?: boolean
  /** Render a divider above this item (section break). */
  dividerBefore?: boolean
  /** Not valid for this row — shown greyed, never hidden, so the action stays
      discoverable and the menu keeps a stable shape. */
  disabled?: boolean
  /** Native tooltip — says why a greyed item is unavailable. */
  title?: string
}

interface RowActionsMenuProps {
  items: RowMenuItem[]
  onSelect: (key: string) => void
  ariaLabel?: string
  /** 'bottom' opens below the trigger (default, kebab); 'top' opens above (toolbar). */
  placement?: 'bottom' | 'top'
  /** Override the trigger button's class + contents (default: kebab icon). */
  triggerClassName?: string
  triggerContent?: ReactNode
  /** Show the caret pointing at the trigger (default true; off for attached dropdowns). */
  caret?: boolean
}

/**
 * Row kebab → action menu. Implements the DS listbox (docs/design-system/listbox.md):
 * cards-background surface, 1px border, 12px radius, 8px padding, Shadow L, caret
 * pointing up at the top-right. Portaled to <body> so it escapes the Table cell's
 * `overflow: hidden`, and anchored to the trigger's rect (kept glued on scroll/resize).
 */
function RowActionsMenu({
  items,
  onSelect,
  ariaLabel = 'Row actions',
  placement = 'bottom',
  triggerClassName = 'ram-trigger',
  triggerContent,
  caret = true,
}: RowActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  /* A tall menu on a low row would run past the bottom of the window, so it
     flips above the trigger when there is more room there. */
  const [flipped, setFlipped] = useState(false)

  useLayoutEffect(() => {
    if (!open) return
    const measure = () => {
      if (btnRef.current) setRect(btnRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [open])

  useLayoutEffect(() => {
    if (!open || !rect) return
    const menuH = menuRef.current?.getBoundingClientRect().height ?? 0
    const roomBelow = window.innerHeight - rect.bottom
    setFlipped(menuH + 16 > roomBelow && rect.top > roomBelow)
  }, [open, rect, items])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleSelect = (key: string) => {
    setOpen(false)
    onSelect(key)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={triggerClassName}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {triggerContent ?? <MoreIcon size={20} color="var(--text-primary)" />}
      </button>

      {open && rect &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="ram-menu"
            style={{
              position: 'fixed',
              right: Math.max(8, window.innerWidth - rect.right),
              zIndex: 2000,
              ...(placement === 'top' || flipped
                ? { bottom: window.innerHeight - rect.top + 8 }
                : { top: rect.bottom + 8 }),
            }}
          >
            {caret && <span className={`ram-caret ram-caret--${placement === 'top' || flipped ? 'bottom' : 'top'}`} aria-hidden="true" />}
            {items.map((item) => (
              <Fragment key={item.key}>
                {item.dividerBefore && <div className="ram-divider" role="separator" />}
                <button
                  type="button"
                  role="menuitem"
                  className={`ram-item${item.description ? ' ram-item--stacked' : ''}${item.danger ? ' ram-item--danger' : ''}${item.disabled ? ' ram-item--disabled' : ''}`}
                  disabled={item.disabled}
                  aria-disabled={item.disabled || undefined}
                  title={item.title}
                  onClick={() => handleSelect(item.key)}
                >
                  {item.icon && <span className="ram-item-icon">{item.icon}</span>}
                  {item.description ? (
                    <span className="ram-item-body">
                      <span className="ram-item-label">{item.label}</span>
                      <span className="ram-item-description">{item.description}</span>
                    </span>
                  ) : (
                    <span className="ram-item-label">{item.label}</span>
                  )}
                </button>
              </Fragment>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}

export default RowActionsMenu
