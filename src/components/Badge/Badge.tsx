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
}

function Badge({ type = 'success', icon = false, customIcon, label, className = '' }: BadgeProps) {
  const showIcon = (icon || customIcon) && type !== 'new'

  return (
    <span className={`badge badge--${type} ${className}`.trim()} role="status">
      {showIcon && <span className="badge__icon">{customIcon ?? ICON_MAP[type]}</span>}
      {label ?? DEFAULT_LABELS[type]}
    </span>
  )
}

export default Badge
