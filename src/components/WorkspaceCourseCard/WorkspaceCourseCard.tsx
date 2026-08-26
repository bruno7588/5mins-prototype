import { Clock, PlayCircle } from 'iconsax-react'
import type { WorkspaceCourse } from '../../pages/workspace/mockItems'
import './WorkspaceCourseCard.css'

const SEGMENTS = 8

function WorkspaceCourseCard({ course, onOpen }: { course: WorkspaceCourse; onOpen?: () => void }) {
  const filledSegments = Math.max(0, Math.min(SEGMENTS, Math.round((course.progress / 100) * SEGMENTS)))
  const isComplete = course.progress >= 100
  const interactive = !!onOpen
  return (
    <article
      className={`ws-course-card${interactive ? ' ws-course-card--interactive' : ''}`}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Open course: ${course.title}` : undefined}
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
      <div className="ws-course-card__media">
        <div
          className="ws-course-card__image"
          style={course.image ? { backgroundImage: `url(${course.image})` } : { background: course.thumbnailGradient }}
        />
        {course.isNew ? <span className="ws-course-card__newbadge">New</span> : null}
        {course.dueLabel ? <span className="ws-course-card__duepill">{course.dueLabel}</span> : null}
        <div className="ws-course-card__progress" role="progressbar" aria-valuenow={course.progress} aria-valuemin={0} aria-valuemax={100}>
          {Array.from({ length: SEGMENTS }).map((_, i) => {
            const filled = i < filledSegments
            const cls = filled
              ? isComplete
                ? 'ws-course-card__segment ws-course-card__segment--complete'
                : 'ws-course-card__segment ws-course-card__segment--filled'
              : 'ws-course-card__segment'
            return <span key={i} className={cls} />
          })}
        </div>
      </div>
      <div className="ws-course-card__body">
        <h3 className="ws-course-card__title">{course.title}</h3>
        <div className="ws-course-card__meta">
          <span className="ws-course-card__metaitem">
            <PlayCircle size={16} color="var(--text-secondary)" variant="Linear" />
            <span>{course.lessonCount} lessons</span>
          </span>
          <span className="ws-course-card__metaitem">
            <Clock size={16} color="var(--text-secondary)" variant="Linear" />
            <span>{course.durationMinutes} min</span>
          </span>
        </div>
      </div>
    </article>
  )
}

export default WorkspaceCourseCard
