import { useLayoutEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Tabs from '@/components/Tabs/Tabs'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import MobileCourseCard from '@/components/mobile/CourseCard/CourseCard'
import MobileInstructorCard from '@/components/mobile/InstructorCard/InstructorCard'
import { ARRIVE, arriveTransition } from '@/components/AIWorkingCard/arrive'
import LessonGridCard, { type LessonGridCardProps } from '@/components/LessonGridCard/LessonGridCard'
import { bookmarkedCourses, bookmarkedLessons, followedInstructors, likedLessons } from '@/pages/saved/savedItems'
import './SavedScreen.css'

export type SavedTab = 'bookmarks' | 'likes' | 'following'
export type SavedView = 'lessons' | 'courses'

/* Native app "Saved" screen (DES-368): what the Saved icon on the My Learning header opens. The
   same three tabs as the web page: Bookmarks (Lessons / Courses), Likes, Following.
   The tab and view live in MobileApp, so Back from a lesson or course returns to
   the same list. Prefix: m-saved- */
function SavedScreen({
  tab,
  view,
  onTabChange,
  onViewChange,
  onOpenLesson,
  onOpenCourse,
}: {
  tab: SavedTab
  view: SavedView
  onTabChange: (tab: SavedTab) => void
  onViewChange: (view: SavedView) => void
  onOpenLesson: (index: number) => void
  onOpenCourse: (courseId: string) => void
}) {
  const reduce = useReducedMotion()
  /* The phone's content area keeps the previous screen's scroll position. Start at the top. */
  const rootRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    rootRef.current?.closest('.m-phone__content')?.scrollTo(0, 0)
  }, [])

  /* Lessons are grid cards (Library Card/Lessons, View=grid, 6121:2988), two to a row. */
  const lessonGrid = (lessons: LessonGridCardProps[]) => (
    <div className="m-saved__grid">
      {lessons.map((lesson, i) => (
        <LessonGridCard key={lesson.title} {...lesson} onOpen={() => onOpenLesson(i)} />
      ))}
    </div>
  )

  return (
    <motion.div ref={rootRef} className="m-saved" {...ARRIVE(reduce)} transition={arriveTransition(reduce)}>
      <Tabs
        className="m-saved__tabs"
        ariaLabel="Saved sections"
        items={[
          { key: 'bookmarks', label: 'Bookmarks' },
          { key: 'likes', label: 'Likes' },
          { key: 'following', label: 'Following' },
        ]}
        activeKey={tab}
        onChange={(key) => onTabChange(key as SavedTab)}
      />

      {tab === 'bookmarks' ? (
        <div className="m-saved__body">
          <ContentSwitcher
            className="m-saved__switcher"
            ariaLabel="Bookmark type"
            items={[
              { key: 'lessons', label: 'Lessons' },
              { key: 'courses', label: 'Courses' },
            ]}
            activeKey={view}
            onChange={(key) => onViewChange(key as SavedView)}
          />
          {view === 'lessons' ? (
            lessonGrid(bookmarkedLessons)
          ) : (
            <div className="m-saved__list m-saved__list--courses">
              {bookmarkedCourses.map((course) => (
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
                  onClick={() => onOpenCourse(course.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {tab === 'likes' ? <div className="m-saved__body">{lessonGrid(likedLessons)}</div> : null}

      {tab === 'following' ? (
        <div className="m-saved__body">
          <div className="m-saved__list">
            {followedInstructors.map((instructor) => (
              <MobileInstructorCard key={instructor.name} {...instructor} />
            ))}
          </div>
        </div>
      ) : null}
    </motion.div>
  )
}

export default SavedScreen
