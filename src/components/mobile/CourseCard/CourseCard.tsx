import type { KeyboardEvent } from 'react'
import { Clock, PlayCircle } from 'iconsax-react'
import './CourseCard.css'

const SEGMENTS = 8

export interface MobileCourseCardProps {
  title: string
  lessonCount: number
  durationMinutes: number
  image?: string
  /** CSS background fallback when there is no image */
  thumbnailGradient?: string
  /** 0–100 */
  progress?: number
  isNew?: boolean
  dueLabel?: string
  onClick?: () => void
}

function MobileCourseCard({
  title,
  lessonCount,
  durationMinutes,
  image,
  thumbnailGradient,
  progress = 0,
  isNew = false,
  dueLabel,
  onClick,
}: MobileCourseCardProps) {
  const filledSegments = Math.max(0, Math.min(SEGMENTS, Math.round((progress / 100) * SEGMENTS)))
  const interactive = Boolean(onClick)

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
    }
  }

  return (
    <article
      className="m-course-card"
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
    >
      <div
        className="m-course-card__image"
        style={
          image
            ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: thumbnailGradient }
        }
      >
        {isNew ? <span className="m-course-card__newbadge">New</span> : null}
        {dueLabel ? <span className="m-course-card__duepill">{dueLabel}</span> : null}
        <div className="m-course-card__progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <span key={i} className={i < filledSegments ? 'm-course-card__segment m-course-card__segment--filled' : 'm-course-card__segment'} />
          ))}
        </div>
      </div>
      <div className="m-course-card__body">
        <h3 className="m-course-card__title">{title}</h3>
        <div className="m-course-card__meta">
          <span className="m-course-card__metaitem">
            <PlayCircle size={14} color="var(--text-secondary)" variant="Linear" />
            <span>{lessonCount} lessons</span>
          </span>
          <span className="m-course-card__metaitem">
            <Clock size={14} color="var(--text-secondary)" variant="Linear" />
            <span>{durationMinutes} min</span>
          </span>
        </div>
      </div>
    </article>
  )
}

export default MobileCourseCard
