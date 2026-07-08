import { useState, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import InfoIcon from '../icons/InfoIcon'
import './Tooltip.css'

type TooltipPosition = 'Top' | 'Bottom' | 'Left' | 'Right'
type TooltipAlignment = 'Center' | 'Start' | 'End'

interface TooltipProps {
  text: ReactNode
  position?: TooltipPosition
  alignment?: TooltipAlignment
  icon?: boolean
  iconColor?: string
  disabled?: boolean
  children?: ReactNode
  className?: string
}

function Tooltip({
  text,
  position = 'Top',
  alignment = 'Center',
  icon = true,
  iconColor,
  disabled = false,
  children,
  className = '',
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const triggerRef = useRef<HTMLElement | null>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    if (disabled) setVisible(false)
  }, [disabled])

  // Portal the body to <body> so it can't be clipped or covered by an
  // ancestor's overflow / stacking context. Anchor it to the trigger's rect
  // and keep it glued on scroll/resize while visible.
  useLayoutEffect(() => {
    if (!visible || disabled) return
    const measure = () => {
      const el = triggerRef.current
      if (el) setRect(el.getBoundingClientRect())
    }
    measure()
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [visible, disabled])

  const posClass = `tooltip__body--${position.toLowerCase()}-${alignment.toLowerCase()}`
  const caretBefore = position === 'Bottom' || position === 'Right'
  const caretAfter = position === 'Top' || position === 'Left'
  const isHorizontal = position === 'Left' || position === 'Right'

  const caretAlignClass = isHorizontal
    ? 'tooltip__caret--center'
    : alignment === 'Start'
    ? 'tooltip__caret--start'
    : alignment === 'End'
    ? 'tooltip__caret--end'
    : 'tooltip__caret--center'

  const caret = (
    <div className={`tooltip__caret ${caretAlignClass}${caretBefore ? ' tooltip__caret--flip' : ''}`}>
      <svg width="12" height="6" viewBox="0 0 12 6" fill="none">
        <path d="M6 6L0 0H12L6 6Z" fill="var(--tooltip-background, #0f1014)" />
      </svg>
    </div>
  )

  const trigger = icon ? (
    <button
      ref={(el) => { triggerRef.current = el }}
      type="button"
      className="tooltip__trigger"
      aria-label="More information"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <InfoIcon size={20} color={iconColor} />
    </button>
  ) : (
    <div
      ref={(el) => { triggerRef.current = el }}
      className="tooltip__trigger"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
    </div>
  )

  return (
    <div className={`tooltip-wrapper ${className}`.trim()}>
      {trigger}
      {visible && !disabled && rect &&
        createPortal(
          <div
            className="tooltip__anchor"
            style={{
              position: 'fixed',
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              pointerEvents: 'none',
              zIndex: 2000,
            }}
          >
            <div role="tooltip" className={`tooltip__body ${posClass}`}>
              {caretBefore && caret}
              <div className="tooltip__content">{text}</div>
              {caretAfter && caret}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

export default Tooltip
