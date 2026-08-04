import type { KeyboardEvent } from 'react'
import { PlayCircle, Lock, Danger } from 'iconsax-react'
import './LessonCard.css'

const SEGMENTS = 8

export type MobileLessonQuizState = 'none' | 'pending' | 'completed'

export interface MobileLessonCardProps {
  title: string
  instructor: string
  durationLabel: string
  typeLabel?: string
  image?: string
  /** 0–100 */
  progress?: number
  completed?: boolean
  disabled?: boolean
  quiz?: MobileLessonQuizState
  onClick?: () => void
  onQuizClick?: () => void
}

function MobileLessonCard({
  title,
  instructor,
  durationLabel,
  typeLabel = 'Lesson',
  image,
  progress = 0,
  completed = false,
  disabled = false,
  quiz = 'none',
  onClick,
  onQuizClick,
}: MobileLessonCardProps) {
  const filledSegments = completed
    ? SEGMENTS
    : Math.max(0, Math.min(SEGMENTS, Math.round((progress / 100) * SEGMENTS)))
  const interactive = Boolean(onClick) && !disabled

  const quizButton = (() => {
    if (disabled) return null
    if (quiz === 'pending' && !completed) {
      return (
        <button type="button" className="m-lesson-card__quiz m-lesson-card__quiz--take" onClick={onQuizClick}>
          <Danger size={16} color="var(--button-warning-background)" variant="Linear" />
          Take Quiz
        </button>
      )
    }
    if (completed && quiz === 'pending') {
      return (
        <button type="button" className="m-lesson-card__quiz m-lesson-card__quiz--retake" onClick={onQuizClick}>
          Retake Quiz
        </button>
      )
    }
    if (completed && quiz === 'completed') {
      return (
        <button type="button" className="m-lesson-card__quiz m-lesson-card__quiz--passed" onClick={onQuizClick}>
          Retake Quiz
        </button>
      )
    }
    return null
  })()

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
    }
  }

  return (
    <article
      className={`m-lesson-card${disabled ? ' m-lesson-card--disabled' : ''}`}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
    >
      <div className="m-lesson-card__row">
        <div className="m-lesson-card__thumb" style={image ? { backgroundImage: `url(${image})` } : undefined}>
          <span className="m-lesson-card__tag">
            <PlayCircle size={14} color="var(--text-secondary)" variant="Bold" />
          </span>
        </div>
        <div className="m-lesson-card__info">
          <div className="m-lesson-card__header">
            <h3 className="m-lesson-card__title">{title}</h3>
            <p className="m-lesson-card__meta">{`${typeLabel} · ${instructor} · ${durationLabel}`}</p>
          </div>
          {quizButton}
        </div>
        {disabled ? <Lock size={20} color="var(--text-disabled)" variant="Bold" /> : null}
      </div>
      {!disabled ? (
        <div
          className="m-lesson-card__progress"
          role="progressbar"
          aria-valuenow={completed ? 100 : progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {Array.from({ length: SEGMENTS }).map((_, i) => {
            const cls = i < filledSegments
              ? completed
                ? 'm-lesson-card__segment m-lesson-card__segment--complete'
                : 'm-lesson-card__segment m-lesson-card__segment--filled'
              : 'm-lesson-card__segment'
            return <span key={i} className={cls} />
          })}
        </div>
      ) : null}
    </article>
  )
}

export default MobileLessonCard
