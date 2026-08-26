import { Clock, Lock, PlayCircle } from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import type { CourseStatus, ProgramCourse } from '@/pages/workspace/mockItems'
import './ProgramCourseCard.css'

const SEGMENTS = 8

/**
 * DS Badge variant + default label per course status. `completed` never renders
 * here — a full success-coloured track already says the course is passed
 * (Figma 3716:83289), so the badge would only repeat it.
 */
const STATUS_BADGE: Record<CourseStatus, { type: 'success' | 'warning' | 'error' | 'informative'; label: string }> = {
  completed: { type: 'success', label: 'Completed' },
  overdue: { type: 'error', label: 'Overdue' },
  scheduled: { type: 'informative', label: 'Scheduled' },
  due: { type: 'warning', label: 'Due' },
  failed: { type: 'error', label: 'Not Passed' },
}

export interface MobileProgramCourseCardProps {
  course: ProgramCourse
  /**
   * Floating "Start" marker above the card — points at where a learner who has
   * not begun the program should start (Figma 3716:83255).
   */
  startMarker?: boolean
}

/**
 * One course row in the mobile program outline (Figma 3716:83150 available,
 * 3716:83166 locked, 3716:83304 failed/retake).
 *
 * The card carries its own state: a locked course dims to disabled text and
 * shows a padlock instead of a progress track; every released course gets the
 * 2px track along its bottom edge, filled primary while in progress and success
 * green once passed.
 */
function MobileProgramCourseCard({ course, startMarker = false }: MobileProgramCourseCardProps) {
  const locked = course.state === 'locked'
  const passed = course.state === 'review' && course.status === 'completed'
  const metaColor = locked ? 'var(--text-disabled)' : 'var(--text-tertiary)'

  const filled = passed
    ? SEGMENTS
    : Math.max(0, Math.min(SEGMENTS, Math.round(((course.progress ?? 0) / 100) * SEGMENTS)))

  // The success track is the completion signal, so its badge would be noise.
  const badge = course.status && course.status !== 'completed' ? STATUS_BADGE[course.status] : undefined
  const retake = course.state === 'retake'

  return (
    /* The marker sits outside the card so the card can clip its own progress
       track to its rounded corners without also clipping the marker. */
    <div className="m-pcourse">
      {startMarker ? (
        <span className="m-pcourse__marker" aria-hidden="true">
          Start
        </span>
      ) : null}

      <article className={`m-pcourse__card${locked ? ' m-pcourse__card--locked' : ''}`}>
        <div className="m-pcourse__row">
          <span
            className="m-pcourse__thumb"
            style={{ backgroundImage: `url(${course.thumbnail})` }}
            aria-hidden="true"
          />

          <div className="m-pcourse__body">
            <div className="m-pcourse__head">
              <h3 className="m-pcourse__title">{course.title}</h3>
              <div className="m-pcourse__info">
                <span className="m-pcourse__metaitem">
                  <PlayCircle size={14} color={metaColor} variant="Linear" />
                  <span>{course.lessonCount} lessons</span>
                </span>
                <span className="m-pcourse__metaitem">
                  <Clock size={14} color={metaColor} variant="Linear" />
                  <span>{course.durationMinutes} min</span>
                </span>
              </div>
            </div>

            {badge || retake ? (
              <div className="m-pcourse__actions">
                {badge ? <Badge type={badge.type} label={course.statusLabel ?? badge.label} /> : null}
                {/* No mobile course player yet, so the CTA is shown inert rather than as a
                    decoy. `.ui-disabled` dims it and blocks the pointer; tabIndex keeps it
                    off the keyboard path without repainting it in the disabled palette. */}
                {retake ? (
                  <Button variant="outlined" size="md" className="ui-disabled" tabIndex={-1} aria-disabled>
                    Retake
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          {locked ? (
            <span className="m-pcourse__lock" aria-label="Locked">
              <Lock size={20} color="var(--text-primary)" variant="Bold" />
            </span>
          ) : null}
        </div>

        {!locked ? (
          <span
            className="m-pcourse__track"
            role="progressbar"
            aria-label={`${course.title} progress`}
            aria-valuenow={passed ? 100 : (course.progress ?? 0)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {Array.from({ length: SEGMENTS }).map((_, i) => (
              <span
                key={i}
                className={`m-pcourse__seg${
                  i < filled ? (passed ? ' m-pcourse__seg--passed' : ' m-pcourse__seg--filled') : ''
                }`}
              />
            ))}
          </span>
        ) : null}
      </article>
    </div>
  )
}

export default MobileProgramCourseCard
