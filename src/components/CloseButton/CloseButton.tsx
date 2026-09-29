import type { MouseEventHandler } from 'react'
import './CloseButton.css'

interface CloseButtonProps {
  onClick?: () => void
  onMouseDown?: MouseEventHandler<HTMLButtonElement>
  size?: number
  className?: string
  ariaLabel?: string
  /** `fullscreen` is the close for a full-screen modal (Figma Programs 4221:63780):
      a 44px `--input-background` disc around a 36px IoCloseOutline in
      `--text-secondary`. `size` is ignored for it. */
  variant?: 'default' | 'fullscreen'
}

function CloseButton({ onClick, onMouseDown, size = 24, className = '', ariaLabel = 'Close', variant = 'default' }: CloseButtonProps) {
  const fullscreen = variant === 'fullscreen'
  return (
    <button
      className={`close-btn${fullscreen ? ' close-btn--fullscreen' : ''} ${className}`.trim()}
      onClick={onClick}
      onMouseDown={onMouseDown}
      aria-label={ariaLabel}
      type="button"
    >
      {fullscreen ? (
        /* IoCloseOutline: two 15.75px strokes at 1.5px in a 36px box. */
        <svg width={36} height={36} viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <path
            d="M25.875 25.875L10.125 10.125M25.875 10.125L10.125 25.875"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}

export default CloseButton
