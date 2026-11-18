import WebAppTopNav from '@/components/WebAppTopNav/WebAppTopNav'
import { useState } from 'react'
import LearnerMobileNav from '@/components/LearnerMobileNav/LearnerMobileNav'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Tabs from '@/components/Tabs/Tabs'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import EmptyState from '@/components/EmptyState/EmptyState'
import LessonGridCard, { type LessonGridCardProps } from '@/components/LessonGridCard/LessonGridCard'
import WorkspaceCourseCard from '@/components/WorkspaceCourseCard/WorkspaceCourseCard'
import InstructorCard from '@/components/InstructorCard/InstructorCard'
import ProfileMenu from '@/components/ProfileMenu/ProfileMenu'
import AdminMenuItem from '@/components/AdminMenuItem/AdminMenuItem'
import LessonFeed from '@/pages/for-you/components/LessonFeed'
import { feedLessons } from '@/pages/for-you/feedItems'
import { Logo, learnerSideItems } from '@/pages/my-team/MyTeam'
import { bookmarkedCourses, bookmarkedLessons, followedInstructors, likedLessons } from './savedItems'
import noBookmarks from '@/assets/empty-state-illustrations/no-bookmarks.svg'
import noLikes from '@/assets/empty-state-illustrations/no-likes.svg'
import notFollowing from '@/assets/empty-state-illustrations/not-following.svg'
import noCourses from '@/assets/empty-state-illustrations/no-playlists.svg'
import '@/pages/my-team/MyTeam.css'
import './Saved.css'

const TABS = [
  { key: 'bookmarks', label: 'Bookmarks' },
  { key: 'likes', label: 'Likes' },
  { key: 'following', label: 'Following' },
] as const
type Tab = (typeof TABS)[number]['key']

const VIEWS = ['lessons', 'courses'] as const
type View = (typeof VIEWS)[number]

const illustration = (src: string) => <img src={src} alt="" width={72} height={72} />

/* Saved (DES-368): what the learner bookmarked and liked, and who they follow. Opened
   from the gear menu; it replaces the Profile page and its sidebar item. The tab and
   the Lessons / Courses view live in the URL (?tab=, ?view=), so Back from a course
   returns to the same list. */
function Saved() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = TABS.find((t) => t.key === searchParams.get('tab'))?.key ?? 'bookmarks'
  const view: View = VIEWS.find((v) => v === searchParams.get('view')) ?? 'lessons'
  /** A lesson open in the lesson feed, over the page; closing it returns to the same list. */
  const [feedIndex, setFeedIndex] = useState<number | null>(null)

  const setParam = (key: 'tab' | 'view', value: string) => {
    const next = new URLSearchParams(searchParams)
    next.set(key, value)
    setSearchParams(next, { replace: true })
  }

  const watchLessons = { label: 'Watch Lessons', onClick: () => navigate('/for-you') }

  const lessonGrid = (lessons: LessonGridCardProps[]) => (
    <div className="saved-lesson-grid">
      {lessons.map((lesson, i) => (
        <LessonGridCard key={lesson.title} {...lesson} onOpen={() => setFeedIndex(i % feedLessons.length)} />
      ))}
    </div>
  )

  return (
    <div className="mt-app">
      <WebAppTopNav />

      <div className="mt-main">
        <aside className="mt-side">
          <nav className="mt-side__menu">
            {learnerSideItems.map(({ label, icon: Icon, path }) => {
              const isActive = !!path && location.pathname === path
              return (
                <button
                  key={label}
                  type="button"
                  className={`mt-side__item${isActive ? ' mt-side__item--active' : ''}`}
                  onClick={path ? () => navigate(path) : undefined}
                >
                  <Icon size={24} color={isActive ? 'var(--brand-selected, var(--selected))' : 'var(--brand-nav, var(--text-secondary))'} variant="Bold" />
                  <span>{label}</span>
                </button>
              )
            })}
            <AdminMenuItem />
          </nav>

          <ProfileMenu />

          <div className="mt-side__powered">
            <span>Powered by</span>
            <Logo size={12} />
          </div>
        </aside>

        <section className="mt-body">
          <div className="saved-page">
            {/* Page header: title, divider, then the tabs (headers.md). */}
            <header className="mt-pageheader">
              <div className="mt-pageheader__row">
                <div className="mt-pageheader__headline">
                  <h2 className="mt-pageheader__title">Saved content</h2>
                </div>
              </div>
              <div className="mt-pageheader__divider" />
              <Tabs
                items={TABS.map((t) => ({ key: t.key, label: t.label }))}
                activeKey={tab}
                onChange={(key) => setParam('tab', key)}
                ariaLabel="Saved sections"
              />
            </header>

            {tab === 'bookmarks' && (
              <div className="saved-section">
                <ContentSwitcher
                  className="saved-switcher"
                  ariaLabel="Bookmark type"
                  items={[
                    { key: 'lessons', label: 'Lessons' },
                    { key: 'courses', label: 'Courses' },
                  ]}
                  activeKey={view}
                  onChange={(key) => setParam('view', key)}
                />
                {view === 'lessons' &&
                  (bookmarkedLessons.length > 0 ? (
                    lessonGrid(bookmarkedLessons)
                  ) : (
                    <EmptyState
                      illustration={illustration(noBookmarks)}
                      title="No lessons here!"
                      description="Spot a lesson of your interest? Bookmark it to watch anytime."
                      secondaryAction={watchLessons}
                    />
                  ))}
                {view === 'courses' &&
                  (bookmarkedCourses.length > 0 ? (
                    <div className="saved-course-grid">
                      {bookmarkedCourses.map((course) => (
                        <WorkspaceCourseCard key={course.id} course={course} onOpen={() => navigate(`/courses/${course.id}`)} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      illustration={illustration(noCourses)}
                      title="No course!"
                      description="Teams that use courses have a 60% boost in learning efficiency."
                      secondaryAction={{ label: 'Find Courses', onClick: () => navigate('/workspace') }}
                    />
                  ))}
              </div>
            )}

            {tab === 'likes' &&
              (likedLessons.length > 0 ? (
                lessonGrid(likedLessons)
              ) : (
                <EmptyState
                  illustration={illustration(noLikes)}
                  title="No likes!"
                  description="Tap Like on any lesson you enjoy, and they'll appear right here for easy access."
                  secondaryAction={watchLessons}
                />
              ))}

            {/* Instructor cards do not open anything: the prototype has no instructor page. */}
            {tab === 'following' &&
              (followedInstructors.length > 0 ? (
                <div className="saved-instructor-grid">
                  {followedInstructors.map((instructor) => <InstructorCard key={instructor.name} {...instructor} />)}
                </div>
              ) : (
                <EmptyState
                  illustration={illustration(notFollowing)}
                  title="Not following yet!"
                  description="Pick your top instructors, and Follow to stay updated with content you'll love!"
                  secondaryAction={{ label: 'Check Top Instructors', onClick: () => navigate('/for-you') }}
                />
              ))}
          </div>
        </section>
      </div>
      <LearnerMobileNav />

      {feedIndex !== null && (
        <LessonFeed lessons={feedLessons} startIndex={feedIndex} onClose={() => setFeedIndex(null)} />
      )}
    </div>
  )
}

export default Saved
