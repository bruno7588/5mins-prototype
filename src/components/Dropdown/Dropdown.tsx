import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowDown2 } from 'iconsax-react'
import Checkbox from '../Checkbox/Checkbox'
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
  /** Options carry a checkbox and the menu stays open across picks. */
  multiple?: boolean
  /** Chosen values in `multiple` mode; `value`/`onChange` are ignored there. */
  values?: string[]
  onChangeValues?: (values: string[]) => void
  /** `multiple` only: a first row that stands for "no filter", drawn as a selected
      list item (no checkbox). Selected while nothing is picked; picking it clears the rest. */
  allLabel?: string
  /** `multiple` only: read the selection back in the trigger, the option's label for
      one pick and "<summaryLabel>: N" for several. Without it the trigger keeps its
      placeholder (callers that show chips beneath the field rely on that). */
  summaryLabel?: string
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
  multiple = false,
  values,
  onChangeValues,
  allLabel,
  summaryLabel,
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

  const picked = values ?? []
  const isPicked = (v: string) => picked.includes(v)
  const toggle = (v: string) =>
    onChangeValues?.(isPicked(v) ? picked.filter((x) => x !== v) : [...picked, v])

  const selected = options.find((o) => o.value === value)
  /* Multi keeps its placeholder unless `summaryLabel` asks for the selection to be
     read back: callers that show chips beneath the field would otherwise say the
     same thing twice and grow the control past the row. */
  const pickedOptions = options.filter((o) => picked.includes(o.value))
  const multiLabel =
    !summaryLabel || pickedOptions.length === 0
      ? placeholder
      : pickedOptions.length === 1
        ? pickedOptions[0].label
        : `${summaryLabel}: ${pickedOptions.length}`
  const triggerLabel = multiple ? multiLabel : (selected?.label ?? placeholder)
  const showsPlaceholder = multiple ? !summaryLabel || pickedOptions.length === 0 : !selected

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
        aria-multiselectable={multiple || undefined}
        aria-disabled={readOnly}
        disabled={readOnly}
        onClick={() => !readOnly && setIsActive((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsActive(false)
        }}
      >
        {iconLeft && <span className="dropdown-trigger-leading">{iconLeft}</span>}
        <span className={`dropdown-trigger-text${showsPlaceholder ? ' dropdown-trigger-text--placeholder' : ''}`}>{triggerLabel}</span>
        <ArrowDown2
          size={size === 'sm' ? 16 : 20}
          color="currentColor"
          variant="Linear"
          className="dropdown-chevron"
        />
      </button>

      {isActive && rect && createPortal(
        <ul ref={menuRef} className={`dropdown-menu ${menuClassName}`.trim()} role="listbox" style={menuStyle()}>
          {multiple && allLabel && (
            <li>
              <div
                role="option"
                aria-selected={picked.length === 0}
                tabIndex={0}
                className={`dropdown-option dropdown-option--all${picked.length === 0 ? ' is-selected' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onChangeValues?.([])}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onChangeValues?.([])
                  }
                }}
              >
                <span className="dropdown-option__text">
                  <span className="dropdown-option__label">{allLabel}</span>
                </span>
              </div>
            </li>
          )}
          {options.map((opt) => {
            const isSelected = multiple ? isPicked(opt.value) : opt.value === value
            const optionClass = [
              'dropdown-option',
              isSelected && 'is-selected',
              opt.disabled && 'is-disabled',
            ]
              .filter(Boolean)
              .join(' ')
            const text = (
              <span className={`dropdown-option__text${opt.description ? ' is-rich' : ''}`}>
                <span className="dropdown-option__label">{opt.label}</span>
                {opt.description && <span className="dropdown-option__desc">{opt.description}</span>}
              </span>
            )

            /* Multi rows are a div, not a button: the Checkbox is itself a
               button and cannot nest inside one. Same shape FilterMultiSelect
               uses — the row owns the click, the box just draws the state. */
            if (multiple) {
              return (
                <li key={opt.value}>
                  <div
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled || undefined}
                    tabIndex={opt.disabled ? -1 : 0}
                    className={`${optionClass} dropdown-option--check`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => !opt.disabled && toggle(opt.value)}
                    onKeyDown={(e) => {
                      if (opt.disabled) return
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggle(opt.value)
                      }
                    }}
                  >
                    <Checkbox checked={isSelected} disabled={opt.disabled} />
                    {text}
                  </div>
                </li>
              )
            }

            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  className={optionClass}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (opt.disabled) return
                    onChange?.(opt.value)
                    setIsActive(false)
                  }}
                >
                  {text}
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
