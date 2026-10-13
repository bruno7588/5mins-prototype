import type { ReactNode } from 'react'
import MobileWorkspaceBanner from '@/components/mobile/WorkspaceBanner/WorkspaceBanner'
import MobileCourseCard from '@/components/mobile/CourseCard/CourseCard'
import MobileCategoryCard from '@/components/mobile/CategoryCard/CategoryCard'
import { workspaceCourses, workspaceCategories, type WorkspaceCourse } from '@/pages/workspace/mockItems'
import { useSignOff } from '@/data/trainerSignOff'
import { getAllPrograms } from '@/pages/programs/programStore'
import './WorkspaceScreen.css'

/** Section heading with an optional count line and a "View All" text button. */
function SectionHeader({
  title,
  subtitle,
  onViewAll,
}: {
  title: string
  subtitle?: string
  onViewAll?: () => void
}) {
  return (
    <header className="m-ws-section__header">
      <div className="m-ws-section__headline">
        <h2 className="m-ws-section__title">{title}</h2>
        {subtitle ? <p className="m-ws-section__subtitle">{subtitle}</p> : null}
      </div>
      {onViewAll ? (
        <button type="button" className="m-ws-section__viewall" onClick={onViewAll}>
          View All
        </button>
      ) : null}
    </header>
  )
}

/** Horizontally swiped row of cards — the mobile stand-in for the desktop carousel. */
function CardRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="m-ws-row" role="region" aria-label={label}>
      {children}
    </div>
  )
}

/* A sign-off course (DES-335) completes when the licence holder signs: 100% and no due pill. */
function EnrolledCourseCard({ course, onOpen }: { course: WorkspaceCourse; onOpen?: () => void }) {
  const signed = useSignOff(course.id)
  const shown = course.requiresSignOff && signed ? { ...course, progress: 100, dueLabel: undefined } : course
  return (
    <MobileCourseCard
      title={shown.title}
      lessonCount={shown.lessonCount}
      durationMinutes={shown.durationMinutes}
      image={shown.image}
      thumbnailGradient={shown.thumbnailGradient}
      progress={shown.progress}
      isNew={shown.isNew}
      dueLabel={shown.dueLabel}
      onClick={onOpen}
    />
  )
}

/**
 * "Your Workspace" home screen for the mobile prototype (Figma 3716:82886):
 * the featured program banners, then enrolled courses, then the 5Mins
 * categories — each row swiped horizontally.
 */
function WorkspaceScreen({
  onOpenProgram,
  onOpenCourse,
}: {
  onOpenProgram?: (id: string) => void
  onOpenCourse?: (id: string) => void
}) {
  const inProgress = workspaceCourses.filter((c) => c.progress > 0 && c.progress < 100).length
  const completed = workspaceCourses.filter((c) => c.progress >= 100).length

  return (
    <div className="m-ws">
      <MobileWorkspaceBanner
        /* Sign-off courses stay out of the banner, as on web: "min left" means nothing when only the sign-off remains. */
        courses={workspaceCourses.filter((c) => !c.requiresSignOff)}
        programs={getAllPrograms()}
        onOpenProgram={(program) => onOpenProgram?.(program.id)}
      />

      <section className="m-ws-section" id="m-ws-enrolled">
        <SectionHeader
          title="Courses you're enrolled in"
          subtitle={`${workspaceCourses.length} courses · ${inProgress} in progress · ${completed} completed`}
        />
        <CardRow label="Enrolled courses">
          {workspaceCourses.map((course) => (
            <EnrolledCourseCard
              key={course.id}
              course={course}
              onOpen={onOpenCourse ? () => onOpenCourse(course.id) : undefined}
            />
          ))}
        </CardRow>
      </section>

      <section className="m-ws-section">
        <SectionHeader
          title="Explore content from 5Mins"
          subtitle={`${workspaceCategories.length} categories`}
        />
        <CardRow label="Explore categories">
          {workspaceCategories.map((category) => (
            <MobileCategoryCard
              key={category.id}
              name={category.name}
              courseCount={category.courseCount}
              lessonCount={category.lessonCount}
              image={category.image}
              thumbnailGradient={category.thumbnailGradient}
            />
          ))}
        </CardRow>
      </section>
    </div>
  )
}

export default WorkspaceScreen
