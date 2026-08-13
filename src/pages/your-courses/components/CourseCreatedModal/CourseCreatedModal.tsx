import { useRef } from 'react'
import { MotionConfig, motion } from 'framer-motion'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import WorkspaceCourseCard from '@/components/WorkspaceCourseCard/WorkspaceCourseCard'
import type { StoredCourse } from '../../courseStore'
import './CourseCreatedModal.css'

interface Props {
  open: boolean
  course: StoredCourse | null
  onClose: () => void
}

/**
 * Full-screen confirmation after a course is created (Figma 7068:75188 /
 * 7068:75191). Sits below the TopNav rather than over it, which is what the
 * Figma frame shows — the nav stays available while everything else is covered.
 *
 * Same shell as the Program Builder's LaunchSuccessModal (opaque surface, no
 * scrim, Escape + close button) minus the confetti, which this frame doesn't have.
 */
function CourseCreatedModal({ open, course, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  useOverlayA11y(panelRef, open, { onEscape: onClose })

  if (!open || !course) return null

  return (
    <div
      ref={panelRef}
      className="ccs-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Course created"
      tabIndex={-1}
    >
      <MotionConfig reducedMotion="user">
        <CloseButton onClick={onClose} className="ccs-close" />

        <motion.div
          className="ccs-content"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <h2 className="ccs-title">Whooray! 🎉 You have a new course!</h2>

          {/* The DS Course card, static — nothing to open yet, and a brand-new
              course has no progress, so every segment reads empty. */}
          <WorkspaceCourseCard
            course={{
              id: String(course.id),
              title: course.title,
              thumbnailGradient: 'linear-gradient(135deg, #6368db, #8158ec)',
              image: course.thumbnail,
              progress: 0,
              lessonCount: course.lessons,
              durationMinutes: course.lessons * 5,
            }}
          />

          <p className="ccs-sub">
            You can find this course on <strong>Your Courses</strong> page
          </p>

          {/* Enrolment isn't built yet — dimmed and inert rather than a decoy. */}
          <Button size="lg" disabled>
            Enrol People to Course
          </Button>
        </motion.div>
      </MotionConfig>
    </div>
  )
}

export default CourseCreatedModal
