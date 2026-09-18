import type { MouseEvent, ReactNode } from 'react'
import Button from '@/components/Button/Button'
import DashedBorder from '@/components/DashedBorder/DashedBorder'
import './EmptyState.css'

export interface EmptyStateAction {
  label: string
  /** Gets the event, so a CTA can anchor a popover to the button it came from. */
  onClick: (e: MouseEvent<HTMLButtonElement>) => void
  /** Leading icon — an Iconsax icon at 20px with color="currentColor". */
  icon?: ReactNode
}

interface Props {
  /** 72×72 graphic from the Figma "Illustrations Empty state" set. */
  illustration?: ReactNode
  title: string
  description?: string
  /** Filled button — the action that fills the empty area. */
  primaryAction?: EmptyStateAction
  /** Outlined button; renders BEFORE the primary. */
  secondaryAction?: EmptyStateAction
  /** Figma variant `Device` (5452:37233 desktop / 5452:37381 mobile). */
  device?: 'desktop' | 'mobile'
  /**
   * Code-only extra, not a Figma variant: `dropzone` puts the empty state on the
   * filled surface inside a dashed outline, for an area the admin fills by
   * dropping or adding content (course builder tabs). `plain` is the Figma component.
   */
  surface?: 'plain' | 'dropzone'
  className?: string
}

/**
 * Empty State — implements docs/design-system/empty-state.md
 * (Figma Library `11921:5779` light / `5452:37234` dark).
 *
 * Centred illustration + title + supporting copy + optional CTA pair, shown when
 * a content area has nothing to display. One component, two device variants —
 * mobile tightens the padding and gap and drops the title to Bold 16.
 */
function EmptyState({
  illustration,
  title,
  description,
  primaryAction,
  secondaryAction,
  device = 'desktop',
  surface = 'plain',
  className,
}: Props) {
  const classes = [
    'empty-state',
    device === 'mobile' && 'empty-state--mobile',
    surface === 'dropzone' && 'empty-state--dropzone',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} role="status">
      {surface === 'dropzone' && <DashedBorder radius={20} dash={8} gap={8} thickness={2} />}
      {illustration && <div className="empty-state__illustration">{illustration}</div>}
      <div className="empty-state__info">
        <h3 className="empty-state__title">{title}</h3>
        {description && <p className="empty-state__description">{description}</p>}
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="empty-state__cta">
          {secondaryAction && (
            <Button variant="outlined" icon={secondaryAction.icon} onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button icon={primaryAction.icon} onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState
