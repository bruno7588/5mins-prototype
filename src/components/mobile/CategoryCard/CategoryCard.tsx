import type { KeyboardEvent } from 'react'
import { Lock, PlayCircle } from 'iconsax-react'
import CollectionPlayIcon from '../../icons/CollectionPlayIcon'
import './CategoryCard.css'

export interface MobileCategoryCardProps {
  name: string
  courseCount: number
  lessonCount: number
  image?: string
  /** CSS background fallback when there is no image */
  thumbnailGradient?: string
  isNew?: boolean
  disabled?: boolean
  onClick?: () => void
}

function MobileCategoryCard({
  name,
  courseCount,
  lessonCount,
  image,
  thumbnailGradient,
  isNew = false,
  disabled = false,
  onClick,
}: MobileCategoryCardProps) {
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
      className={`m-cat-card${disabled ? ' m-cat-card--disabled' : ''}`}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
    >
      <div className="m-cat-card__thumb">
        <div className="m-cat-card__glow" style={fill} aria-hidden="true" />
        <div className="m-cat-card__image" style={fill}>
          {disabled ? <Lock size={40} color="var(--neutral-25)" variant="Bold" /> : null}
        </div>
      </div>
      {isNew ? <span className="m-cat-card__newbadge">New Courses</span> : null}
      <div className="m-cat-card__info">
        <h3 className="m-cat-card__title">{name}</h3>
        <div className="m-cat-card__meta">
          <span className="m-cat-card__metaitem">
            <CollectionPlayIcon color={metaColor} />
            <span>{courseCount} courses</span>
          </span>
          <span className="m-cat-card__metaitem">
            <PlayCircle size={16} color={metaColor} variant="Linear" />
            <span>{lessonCount} lessons</span>
          </span>
        </div>
      </div>
    </article>
  )
}

export default MobileCategoryCard
