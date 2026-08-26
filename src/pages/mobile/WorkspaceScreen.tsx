import type { ReactNode } from 'react'
import MobileProgramBanner from '@/components/mobile/ProgramBanner/ProgramBanner'
import MobileCourseCard from '@/components/mobile/CourseCard/CourseCard'
import MobileCategoryCard from '@/components/mobile/CategoryCard/CategoryCard'
import { workspaceCourses, workspaceCategories } from '@/pages/workspace/mockItems'
import { getAllPrograms } from '@/pages/programs/programStore'
import { featuredPrograms } from '@/pages/programs/featuredPrograms'
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

/**
 * "Your Workspace" home screen for the mobile prototype (Figma 3716:82886):
 * the featured program banners, then enrolled courses, then the 5Mins
 * categories — each row swiped horizontally.
 */
function WorkspaceScreen({ onOpenProgram }: { onOpenProgram?: (id: string) => void }) {
  const programs = featuredPrograms(getAllPrograms())
  const inProgress = workspaceCourses.filter((c) => c.progress > 0 && c.progress < 100).length
  const completed = workspaceCourses.filter((c) => c.progress >= 100).length

  return (
    <div className="m-ws">
      <MobileProgramBanner programs={programs} onOpen={(p) => onOpenProgram?.(p.id)} />

      <section className="m-ws-section">
        <SectionHeader
          title="Courses you're enrolled in"
          subtitle={`${workspaceCourses.length} courses · ${inProgress} in progress · ${completed} completed`}
        />
        <CardRow label="Enrolled courses">
          {workspaceCourses.map((course) => (
            <MobileCourseCard
              key={course.id}
              title={course.title}
              lessonCount={course.lessonCount}
              durationMinutes={course.durationMinutes}
              image={course.image}
              thumbnailGradient={course.thumbnailGradient}
              progress={course.progress}
              isNew={course.isNew}
              dueLabel={course.dueLabel}
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
