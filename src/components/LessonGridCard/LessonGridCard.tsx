import { PlayCircle } from 'iconsax-react'
import CompanyImageMotion from '@/components/CompanyImageMotion/CompanyImageMotion'
import { useCompanyImage } from '@/data/companyImage'
import './LessonGridCard.css'

const SEGMENTS = 8

export interface LessonGridCardProps {
  title: string
  instructor: string
  /** Optional: without one the card shows the company image. */
  thumbnail?: string
  /** e.g. "3m 45s" */
  durationLabel: string
  /** Filled segments, 0–8. */
  filled: number
  completed?: boolean
  /** When provided, the card becomes clickable (opens the lesson). */
  onOpen?: () => void
}

function LessonGridCard({ title, instructor, thumbnail, durationLabel, filled, completed = false, onOpen }: LessonGridCardProps) {
  const companyImage = useCompanyImage()
  const interactive = !!onOpen
  return (
    <article
      className={`lesson-grid-card${completed ? ' lesson-grid-card--complete' : ''}${interactive ? ' lesson-grid-card--interactive' : ''}`}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Open lesson: ${title}` : undefined}
      onClick={onOpen}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen?.()
              }
            }
          : undefined
      }
    >
      <div className="lesson-grid-card__thumb">
        <span
          className="lesson-grid-card__picture"
          style={{ backgroundImage: `url(${thumbnail || companyImage.src})` }}
        >
          {!thumbnail && <CompanyImageMotion />}
        </span>
        <span className="lesson-grid-card__tag">
          <PlayCircle size={20} color="var(--text-secondary)" variant="Bold" />
        </span>
        <span className="lesson-grid-card__duration">{durationLabel}</span>
        <div
          className="lesson-grid-card__progress"
          role="progressbar"
          aria-valuenow={completed ? 100 : Math.round((filled / SEGMENTS) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <span
              key={i}
              className={`lesson-grid-card__seg${i < filled ? ' lesson-grid-card__seg--filled' : ''}`}
            />
          ))}
        </div>
      </div>
      <div className="lesson-grid-card__info">
        <h3 className="lesson-grid-card__title">{title}</h3>
        <p className="lesson-grid-card__meta">{instructor}</p>
      </div>
    </article>
  )
}

export default LessonGridCard
