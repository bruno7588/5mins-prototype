import { useState } from 'react'
import { useHeaderTheme } from '@/data/brandTheme'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Add,
  FlashCircle,
  Mobile,
} from 'iconsax-react'
import { Logo, learnerSideItems } from '../my-team/MyTeam'
import ProfileMenu from '../../components/ProfileMenu/ProfileMenu'
import '../my-team/MyTeam.css'
import './Workspace.css'

import { upcomingItems, type CalendarItem } from '../calendar/mockItems'
import { EventCard } from '../calendar/CalendarView'
import WorkspaceCourseCard from '../../components/WorkspaceCourseCard/WorkspaceCourseCard'
import CategoryCard from '../../components/CategoryCard/CategoryCard'
import Carousel from '../../components/Carousel/Carousel'
import WorkspaceBanner from '@/components/WorkspaceBanner/WorkspaceBanner'
import EventDetailsDrawer from './EventDetailsDrawer'
import { workspaceCourses, workspaceCategories, type WorkspaceCourse } from './mockItems'
import { useSignOff } from '@/data/trainerSignOff'
import { getAllPrograms } from '../programs/programStore'
import AdminMenuItem from '@/components/AdminMenuItem/AdminMenuItem'

/* A sign-off course (DES-335) completes when the licence holder signs: 100% and no due pill. */
function EnrolledCourseCard({ course, onOpen }: { course: WorkspaceCourse; onOpen: () => void }) {
  const signed = useSignOff(course.id)
  const shown = course.requiresSignOff && signed ? { ...course, progress: 100, dueLabel: undefined } : course
  return <WorkspaceCourseCard course={shown} onOpen={onOpen} />
}

function Workspace() {
  const navigate = useNavigate()
  // A custom header colour: its contents switch mode so they read on it.
  const headerTheme = useHeaderTheme()
  const location = useLocation()
  const [selectedEvent, setSelectedEvent] = useState<CalendarItem | null>(null)
  // Fade in when arriving straight from the onboarding loading screen.
  const fromOnboarding = (location.state as { fromOnboarding?: boolean } | null)?.fromOnboarding

  const upcomingEvents = upcomingItems
    .filter((item) => item.type === 'event')
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())

  return (
    <div className={`mt-app${fromOnboarding ? ' mt-app--fade-in' : ''}`}>
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

        <section className="mt-body ws-body">
          <div className="ws-sections">
              <WorkspaceBanner
                /* Sign-off courses stay out: "min left" means nothing when only the sign-off remains. */
                courses={workspaceCourses.filter((c) => !c.requiresSignOff)}
                programs={getAllPrograms()}
                onOpenCourse={(course) => navigate(`/courses/${course.id}`)}
                onViewCourses={() =>
                  document.getElementById('ws-enrolled')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                onOpenProgram={(program) => navigate(`/programs/${program.id}`)}
              />

              <section className="ws-section" id="ws-enrolled">
                <header className="ws-section__header">
                  <div className="ws-section__headline">
                    <h2 className="ws-section__title">Courses you're enrolled in</h2>
                    <p className="ws-section__subtitle">
                      {workspaceCourses.length} courses · {workspaceCourses.filter((c) => c.progress > 0 && c.progress < 100).length} in progress · {workspaceCourses.filter((c) => c.progress >= 100).length} completed
                    </p>
                  </div>
                  <button type="button" className="ws-section__cta ui-disabled" disabled>View My Courses</button>
                </header>
                <Carousel trackClassName="ws-cards-track" ariaLabel="Enrolled courses">
                  {workspaceCourses.map((course) => (
                    <EnrolledCourseCard
                      key={course.id}
                      course={course}
                      onOpen={() => navigate(`/courses/${course.id}`)}
                    />
                  ))}
                </Carousel>
              </section>

              <section className="ws-section">
                <header className="ws-section__header">
                  <div className="ws-section__headline">
                    <h2 className="ws-section__title">Events</h2>
                  </div>
                  <button type="button" className="ws-section__cta" onClick={() => navigate('/events')}>
                    View All
                  </button>
                </header>
                {upcomingEvents.length > 0 ? (
                  <Carousel trackClassName="ws-events-track" ariaLabel="Upcoming events">
                    {upcomingEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        item={event}
                        tab="upcoming"
                        showCountdown
                        onClick={setSelectedEvent}
                      />
                    ))}
                  </Carousel>
                ) : (
                  <div className="ws-events-empty">
                    <p className="ws-events-empty__text">No upcoming events.</p>
                    <button
                      type="button"
                      className="ws-events-empty__link"
                      onClick={() => navigate('/events')}
                    >
                      Browse Past Events
                    </button>
                  </div>
                )}
              </section>

              <section className="ws-section">
                <header className="ws-section__header">
                  <div className="ws-section__headline">
                    <h2 className="ws-section__title">Explore content from 5Mins</h2>
                    <p className="ws-section__subtitle">
                      {workspaceCategories.length} categories
                    </p>
                  </div>
                  <button type="button" className="ws-section__cta ui-disabled" disabled>View All</button>
                </header>
                <Carousel trackClassName="ws-cards-track" ariaLabel="Explore categories">
                  {workspaceCategories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      name={category.name}
                      courseCount={category.courseCount}
                      lessonCount={category.lessonCount}
                      image={category.image}
                      thumbnailGradient={category.thumbnailGradient}
                    />
                  ))}
                </Carousel>
              </section>
          </div>
        </section>
      </div>

      <EventDetailsDrawer
        open={selectedEvent !== null}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  )
}

export default Workspace
