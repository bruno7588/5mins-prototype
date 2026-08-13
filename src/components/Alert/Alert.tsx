import { type ReactNode } from 'react'
import InfoIcon from '../icons/InfoIcon'
import './Alert.css'

export type AlertType = 'Callout' | 'Alert'

interface AlertProps {
  type?: AlertType
  icon?: boolean
  customIcon?: ReactNode
  illustration?: boolean
  title?: string
  message?: string
  bullets?: string[]
  button?: boolean
  buttonLabel?: string
  onButtonClick?: () => void
  onClose?: () => void
  className?: string
}

function Alert({
  type = 'Callout',
  icon = false,
  customIcon,
  illustration = false,
  title,
  message,
  bullets,
  button = false,
  buttonLabel,
  onButtonClick,
  onClose,
  className = '',
}: AlertProps) {
  const isAlert = type === 'Alert'
  const hasBullets = !isAlert && bullets && bullets.length > 0
  const hasTitleAndMessage = !!title && !!message
  const hasBody = hasTitleAndMessage || (!isAlert && (!!title || hasBullets))
  const showIcon = icon || !!customIcon

  return (
    <div
      className={`alert alert--${type.toLowerCase()}${
        hasBody ? ' alert--with-body' : ''
      } ${className}`.trim()}
    >
      {/* Default glyph is the platform's own info icon (Tooltip, PoolHeader, the
          situational drawer's guidance callout) rather than Iconsax's. */}
      {showIcon && (
        customIcon ?? (
          <InfoIcon size={isAlert ? 24 : 20} color="currentColor" className="alert__icon" />
        )
      )}
      {!icon && illustration && isAlert && (
        <span className="alert__bell" aria-hidden="true">
          🔔
        </span>
      )}

      {hasBody ? (
        <div className="alert__body">
          {title && <p className="alert__title">{title}</p>}
          {hasTitleAndMessage && <p className="alert__message">{message}</p>}
          {hasBullets && (
            <ul className="alert__bullets">
              {bullets!.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
          {button && !isAlert && (
            <button
              type="button"
              className="alert__btn alert__btn--outlined"
              onClick={onButtonClick}
            >
              {buttonLabel}
            </button>
          )}
        </div>
      ) : (
        message && <p className="alert__message">{message}</p>
      )}

      {button && (!hasBody || isAlert) && (
        <button
          type="button"
          className={`alert__btn ${
            isAlert ? 'alert__btn--inline' : 'alert__btn--outlined'
          }`}
          onClick={onButtonClick}
        >
          {buttonLabel}
        </button>
      )}

      {onClose && (
        <button
          type="button"
          className="alert__close"
          onClick={onClose}
          aria-label="Dismiss"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default Alert
