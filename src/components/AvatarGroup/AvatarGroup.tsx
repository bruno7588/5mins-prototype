import { Children, type ReactNode } from 'react'
import './AvatarGroup.css'

export type AvatarGroupSize = 24 | 32 | 40

interface AvatarGroupProps {
  /** Must match the `size` of the Avatars passed as children. */
  size?: AvatarGroupSize
  /** At most 3 Avatars (avatars.md). A child may be wrapped, e.g. in a Tooltip. */
  children: ReactNode
  /** The true number of people not shown; renders the "+N" bubble when above 0. */
  remaining?: number
  /** Names the whole group, e.g. "12 learners enrolled". Without it the group is
      decorative and hidden from assistive tech, for when the count is written beside it. */
  ariaLabel?: string
  className?: string
}

/* Avatar group - avatars.md. Overlapping stack with a 1px --page-background ring
   on every avatar; earlier avatars sit on top, as in the Library. */
function AvatarGroup({ size = 24, children, remaining = 0, ariaLabel, className }: AvatarGroupProps) {
  const items = Children.toArray(children)
  const count = items.length + (remaining > 0 ? 1 : 0)
  const classes = ['ds-avatar-group', `ds-avatar-group--${size}`, className].filter(Boolean).join(' ')

  return (
    <span
      className={classes}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {items.map((child, i) => (
        <span key={i} className="ds-avatar-group__item" style={{ zIndex: count - i }}>
          {child}
        </span>
      ))}
      {remaining > 0 && (
        <span className="ds-avatar-group__item ds-avatar-group__count" style={{ zIndex: 1 }}>
          +{remaining}
        </span>
      )}
    </span>
  )
}

export default AvatarGroup
