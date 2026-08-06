import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowDown2 } from 'iconsax-react'
import './Dropdown.css'

export interface DropdownOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

type Size = 'sm' | 'md' | 'lg'

export interface DropdownProps {
  options: DropdownOption[]
  value?: string
  placeholder?: string
  label?: string
  labelPlacement?: 'top' | 'start'
  helperText?: string
  error?: string
  iconLeft?: ReactNode
  readOnly?: boolean
  size?: Size
  onChange?: (value: string) => void
  className?: string
  /** Class for the menu. It is portalled to <body>, so descendant selectors
      written against an ancestor of the field will not reach it. */
  menuClassName?: string
  /** Which edge the menu lines up with (default 'start' = the trigger's left). */
  menuAlign?: 'start' | 'end'
}

function Dropdown({
  options,
  value,
  placeholder = 'Select',
  label,
  labelPlacement = 'top',
  helperText,
  error,
  iconLeft,
  readOnly = false,
  size = 'md',
  onChange,
  className = '',
  menuClassName = '',
  menuAlign = 'start',
}: DropdownProps) {
  const [isActive, setIsActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [menuSize, setMenuSize] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      // The menu is portalled out of `ref`, so it needs its own containment check.
      if (ref.current && !ref.current.contains(t) && !menuRef.current?.contains(t)) setIsActive(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Anchor to the trigger's viewport rect and keep it glued while open.
  useLayoutEffect(() => {
    if (!isActive) {
      setMenuSize(null)
      return
    }
    const measure = () => {
      if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [isActive])

  useLayoutEffect(() => {
    if (!isActive || !menuRef.current) return
    const { offsetWidth: w, offsetHeight: h } = menuRef.current
    setMenuSize((prev) => (prev?.w === w && prev?.h === h ? prev : { w, h }))
  }, [isActive, rect, options.length])

  const menuStyle = (): React.CSSProperties => {
    if (!rect) return {}
    // min-width: 100% would resolve against the viewport once fixed, so the
    // trigger's width has to be passed through explicitly.
    if (!menuSize) return { minWidth: rect.width, top: rect.bottom + 4, left: rect.left, visibility: 'hidden' }
    const wantLeft = menuAlign === 'end' ? rect.right - menuSize.w : rect.left
    const flip = window.innerHeight - rect.bottom - 4 < menuSize.h && rect.top - 4 - menuSize.h > 0
    const wantTop = flip ? rect.top - 4 - menuSize.h : rect.bottom + 4
    return {
      minWidth: rect.width,
      left: Math.max(8, Math.min(wantLeft, window.innerWidth - menuSize.w - 8)),
      top: Math.max(8, Math.min(wantTop, window.innerHeight - menuSize.h - 8)),
    }
  }

  const selected = options.find((o) => o.value === value)

  return (
    <div
      ref={ref}
      className={[
        'dropdown-field',
        `dropdown-${size}`,
        labelPlacement === 'start' && 'label-start',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label && <label className="dropdown-label">{label}</label>}

      <button
        ref={triggerRef}
        type="button"
        className={['dropdown-trigger', isActive && 'is-active', error && 'has-error']
          .filter(Boolean)
          .join(' ')}
        aria-haspopup="listbox"
        aria-expanded={isActive}
        aria-disabled={readOnly}
        disabled={readOnly}
        onClick={() => !readOnly && setIsActive((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsActive(false)
        }}
      >
        {iconLeft && <span className="dropdown-trigger-leading">{iconLeft}</span>}
        <span className={`dropdown-trigger-text${!selected ? ' dropdown-trigger-text--placeholder' : ''}`}>{selected?.label ?? placeholder}</span>
        <ArrowDown2
          size={size === 'sm' ? 16 : 20}
          color="currentColor"
          variant="Linear"
          className="dropdown-chevron"
        />
      </button>

      {isActive && rect && createPortal(
        <ul ref={menuRef} className={`dropdown-menu ${menuClassName}`.trim()} role="listbox" style={menuStyle()}>
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  className={[
                    'dropdown-option',
                    isSelected && 'is-selected',
                    opt.disabled && 'is-disabled',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (opt.disabled) return
                    onChange?.(opt.value)
                    setIsActive(false)
                  }}
                >
                  <span className={`dropdown-option__text${opt.description ? ' is-rich' : ''}`}>
                    <span className="dropdown-option__label">{opt.label}</span>
                    {opt.description && <span className="dropdown-option__desc">{opt.description}</span>}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>,
        document.body,
      )}

      {(error || helperText) && (
        <span className={`dropdown-helper${error ? ' is-error' : ''}`}>{error || helperText}</span>
      )}
    </div>
  )
}

export default Dropdown
