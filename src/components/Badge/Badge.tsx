import { type ReactNode } from 'react'
import { TickCircle, InfoCircle, Danger, TaskSquare } from 'iconsax-react'
import './Badge.css'

type BadgeType =
  | 'success'
  | 'warning'
  | 'error'
  | 'in-progress'
  | 'informative'
  | 'scheduled'
  | 'quiz'
  | 'new'

const DEFAULT_LABELS: Record<BadgeType, string> = {
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
  'in-progress': 'In Progress',
  informative: 'Information',
  scheduled: 'Scheduled',
  quiz: 'Quiz Required',
  new: 'New',
}

const ICON_MAP: Partial<Record<BadgeType, ReactNode>> = {
  success: <TickCircle size={16} variant="Linear" color="currentColor" />,
  warning: <InfoCircle size={16} variant="Linear" color="currentColor" />,
  error: <Danger size={16} variant="Linear" color="currentColor" />,
  'in-progress': <TaskSquare size={16} variant="Linear" color="currentColor" />,
  informative: <InfoCircle size={16} variant="Linear" color="currentColor" />,
}

interface BadgeProps {
  type?: BadgeType
  icon?: boolean
  customIcon?: ReactNode
  label?: string
  className?: string
  /** Figma iconRight: a trailing 16px close icon. The handler is what renders it,
      because a dismiss the badge cannot act on is a decoy. */
  onDismiss?: () => void
  dismissLabel?: string
}

function Badge({
  type = 'success',
  icon = false,
  customIcon,
  label,
  className = '',
  onDismiss,
  dismissLabel,
}: BadgeProps) {
  const showIcon = (icon || customIcon) && type !== 'new'
  const text = label ?? DEFAULT_LABELS[type]

  const classes = [
    'badge',
    `badge--${type}`,
    /* Figma draws the dismissible badge at the S gap, so the ✕ is not read as
       part of the word next to it. */
    onDismiss && 'badge--dismissible',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} role="status">
      {showIcon && <span className="badge__icon">{customIcon ?? ICON_MAP[type]}</span>}
      {text}
      {onDismiss && (
        <button
          type="button"
          className="badge__dismiss"
          onClick={onDismiss}
          aria-label={dismissLabel ?? `Remove ${text}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </span>
  )
}

export default Badge
