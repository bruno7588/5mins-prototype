import type { ReactNode } from 'react'
import Button from '../../Button/Button'
import './EmptyState.css'

export interface MobileEmptyStateAction {
  label: string
  onClick: () => void
}

export interface MobileEmptyStateProps {
  /** 72×72 illustration from the Figma "Illustrations Empty state" set */
  illustration?: ReactNode
  title: string
  description?: string
  primaryAction?: MobileEmptyStateAction
  /** Outlined, renders before the primary */
  secondaryAction?: MobileEmptyStateAction
}

function MobileEmptyState({ illustration, title, description, primaryAction, secondaryAction }: MobileEmptyStateProps) {
  return (
    <div className="m-empty-state" role="status">
      {illustration ? <div className="m-empty-state__illustration">{illustration}</div> : null}
      <div className="m-empty-state__info">
        <h3 className="m-empty-state__title">{title}</h3>
        {description ? <p className="m-empty-state__description">{description}</p> : null}
      </div>
      {primaryAction || secondaryAction ? (
        <div className="m-empty-state__cta">
          {secondaryAction ? (
            <Button variant="outlined" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          ) : null}
          {primaryAction ? (
            <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default MobileEmptyState
