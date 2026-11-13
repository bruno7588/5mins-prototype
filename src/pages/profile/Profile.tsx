import { useState } from 'react'
import LearnerMobileNav from '@/components/LearnerMobileNav/LearnerMobileNav'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Add, FlashCircle, Mobile } from 'iconsax-react'
import { useHeaderTheme } from '@/data/brandTheme'
import Avatar from '@/components/Avatar/Avatar'
import Tabs from '@/components/Tabs/Tabs'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import LessonGridCard from '@/components/LessonGridCard/LessonGridCard'
import WorkspaceCourseCard from '@/components/WorkspaceCourseCard/WorkspaceCourseCard'
import InstructorCard from '@/components/InstructorCard/InstructorCard'
import ProfileMenu from '@/components/ProfileMenu/ProfileMenu'
import AdminMenuItem from '@/components/AdminMenuItem/AdminMenuItem'
import { Logo, learnerSideItems } from '@/pages/my-team/MyTeam'
import { bookmarkedCourses, bookmarkedLessons, followedInstructors, likedLessons } from './profileItems'
import avatarAnthonny from '@/assets/avatars/avatar-1.jpg'
import '@/pages/my-team/MyTeam.css'
import '@/pages/user-profile/UserProfile.css'
import './Profile.css'

/* The signed-in learner (the same person ProfileMenu shows). */
const ME = { name: 'Anthonny Wallace', role: 'Customer Support Specialist', email: 'anthonny@example.com' }

const TABS = [
  { key: 'bookmarks', label: 'Bookmarks' },
  { key: 'likes', label: 'Likes' },
  { key: 'following', label: 'Following' },
] as const
type Tab = (typeof TABS)[number]['key']

/* Learner Profile: what the learner saved (Bookmarks, Likes), and who they follow. */
function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const headerTheme = useHeaderTheme()
  // ?tab=<key> opens that tab straight away.
  const [searchParams] = useSearchParams()
  const initialTab = TABS.find((t) => t.key === searchParams.get('tab'))?.key ?? 'bookmarks'
  const [tab, setTab] = useState<Tab>(initialTab)
  const [bookmarkView, setBookmarkView] = useState<'lessons' | 'courses'>('lessons')

  return (
    <div className="mt-app">
      <header className="mt-topnav" data-theme={headerTheme}>
        <button type="button" className="mt-topnav__logo" aria-label="Home" onClick={() => navigate('/workspace')}>
          <Logo size={22} />
        </button>
        <div className="mt-topnav__right">
          <button type="button" className="mt-topnav__textbtn ui-disabled" disabled>
            <Mobile size={20} color="var(--text-secondary)" variant="Linear" />
            <span>Get App</span>
          </button>
          <button type="button" className="mt-topnav__outlinebtn ui-disabled" disabled>
            <Add size={20} color="var(--text-primary)" variant="Linear" />
            <span>Create</span>
          </button>
          <div className="mt-topnav__icons">
            <button type="button" className="mt-topnav__iconbtn ui-disabled" aria-label="Notifications (coming soon)" disabled>
              <FlashCircle size={24} color="var(--text-primary)" variant="Linear" />
            </button>
          </div>
        </div>
      </header>

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
          <div className="up-page up-page--in-shell lp-page">
            {/* Profile header: the divider sits between the headline and the tabs (headers.md). */}
            <header className="up-header">
              <div className="up-headline">
                <Avatar name={ME.name} size={56} src={avatarAnthonny} />
                <div className="up-title-group">
                  <h2 className="up-name">{ME.name}</h2>
                  <p className="up-meta">{ME.role} · {ME.email}</p>
                </div>
              </div>
              <div className="up-divider" />
              <Tabs
                items={TABS.map((t) => ({ key: t.key, label: t.label }))}
                activeKey={tab}
                onChange={(key) => setTab(key as Tab)}
                ariaLabel="Profile sections"
              />
            </header>

            {tab === 'bookmarks' && (
              <div className="lp-section">
                <ContentSwitcher
                  className="lp-switcher"
                  ariaLabel="Bookmark type"
                  items={[
                    { key: 'lessons', label: 'Lessons' },
                    { key: 'courses', label: 'Courses' },
                  ]}
                  activeKey={bookmarkView}
                  onChange={(key) => setBookmarkView(key as 'lessons' | 'courses')}
                />
                {bookmarkView === 'lessons' ? (
                  <div className="lp-lesson-grid">
                    {bookmarkedLessons.map((lesson) => <LessonGridCard key={lesson.title} {...lesson} />)}
                  </div>
                ) : (
                  <div className="lp-course-grid">
                    {bookmarkedCourses.map((course) => <WorkspaceCourseCard key={course.id} course={course} />)}
                  </div>
                )}
              </div>
            )}

            {tab === 'likes' && (
              <div className="lp-lesson-grid">
                {likedLessons.map((lesson) => <LessonGridCard key={lesson.title} {...lesson} />)}
              </div>
            )}

            {tab === 'following' && (
              <div className="lp-instructor-grid">
                {followedInstructors.map((instructor) => <InstructorCard key={instructor.name} {...instructor} />)}
              </div>
            )}
          </div>
        </section>
      </div>
      <LearnerMobileNav />
    </div>
  )
}

export default Profile
