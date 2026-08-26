import type { KeyboardEvent } from 'react'
import { Lock, PlayCircle } from 'iconsax-react'
import CollectionPlayIcon from '../icons/CollectionPlayIcon'
import './CategoryCard.css'

export interface CategoryCardProps {
  name: string
  courseCount: number
  lessonCount: number
  image?: string
  /** CSS background fallback when there is no image. */
  thumbnailGradient?: string
  isNew?: boolean
  disabled?: boolean
  onClick?: () => void
}

/** Desktop Category card (cards.md "Category card", Figma 10574:3913 / 10176:1806).
 *  Glow-stack thumbnail (no surface fill), New / Hover / Disabled states. */
function CategoryCard({
  name,
  courseCount,
  lessonCount,
  image,
  thumbnailGradient,
  isNew = false,
  disabled = false,
  onClick,
}: CategoryCardProps) {
  const interactive = Boolean(onClick) && !disabled
  const fill = image
    ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: thumbnailGradient }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
    }
  }

  const metaColor = disabled ? 'var(--text-disabled)' : 'var(--text-secondary)'

  return (
    <article
      className={`ws-cat-card${disabled ? ' ws-cat-card--disabled' : ''}`}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
    >
      <div className="ws-cat-card__thumb">
        <div className="ws-cat-card__blur" style={fill} aria-hidden="true" />
        <div className="ws-cat-card__inner">
          <div className="ws-cat-card__image" style={fill} aria-hidden="true" />
          {disabled ? <Lock size={40} color="var(--neutral-25)" variant="Bold" /> : null}
        </div>
      </div>
      {isNew ? <span className="ws-cat-card__newbadge">New Courses</span> : null}
      <div className="ws-cat-card__info">
        <h3 className="ws-cat-card__title">{name}</h3>
        <div className="ws-cat-card__meta">
          <span className="ws-cat-card__metaitem">
            <CollectionPlayIcon color={metaColor} />
            <span>{courseCount} courses</span>
          </span>
          <span className="ws-cat-card__metaitem">
            <PlayCircle size={16} color={metaColor} variant="Linear" />
            <span>{lessonCount} lessons</span>
          </span>
        </div>
      </div>
    </article>
  )
}

export default CategoryCard
