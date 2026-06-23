import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Add,
  FlashCircle,
  Mobile,
  ShieldSecurity,
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
import ProgramBanner from '../../components/ProgramBanner/ProgramBanner'
import EventDetailsDrawer from './EventDetailsDrawer'
import { workspaceCourses, workspaceCategories } from './mockItems'
import { getAllPrograms } from '../programs/programStore'

function Workspace() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedEvent, setSelectedEvent] = useState<CalendarItem | null>(null)
  // Fade in when arriving straight from the onboarding loading screen.
  const fromOnboarding = (location.state as { fromOnboarding?: boolean } | null)?.fromOnboarding

  const upcomingEvents = upcomingItems
    .filter((item) => item.type === 'event')
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())

  return (
    <div className={`mt-app${fromOnboarding ? ' mt-app--fade-in' : ''}`}>
      <header className="mt-topnav">
        <button type="button" className="mt-topnav__logo" aria-label="Home" onClick={() => navigate('/workspace')}>
          <Logo size={22} />
        </button>
        <div className="mt-topnav__right">
          <button type="button" className="mt-topnav__textbtn">
            <span>Get App</span>
            <Mobile size={20} color="var(--text-secondary)" variant="Linear" />
          </button>
          <button type="button" className="mt-topnav__outlinebtn">
            <span>Create</span>
            <Add size={20} color="var(--text-primary)" variant="Linear" />
          </button>
          <div className="mt-topnav__icons">
            <button type="button" className="mt-topnav__iconbtn" aria-label="Notifications">
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
                  <Icon size={24} color={isActive ? 'var(--secondary-500)' : 'var(--text-secondary)'} variant="Bold" />
                  <span>{label}</span>
                </button>
              )
            })}
            <button
              type="button"
              className="mt-side__item"
              onClick={() => navigate('/content-library')}
            >
              <ShieldSecurity size={24} color="var(--text-secondary)" variant="Bold" />
              <span>Admin</span>
            </button>
          </nav>

          <ProfileMenu />

          <div className="mt-side__powered">
            <span>Powered by</span>
            <Logo size={12} />
          </div>
        </aside>

        <section className="mt-body ws-body">
          <div className="ws-sections">
              <ProgramBanner
                programs={getAllPrograms()}
                onStart={(program) => navigate(`/programs/${program.id}`)}
              />

              <section className="ws-section">
                <header className="ws-section__header">
                  <div className="ws-section__headline">
                    <h2 className="ws-section__title">Courses you're enrolled in</h2>
                    <p className="ws-section__subtitle">
                      {workspaceCourses.length} courses · {workspaceCourses.filter((c) => c.progress > 0 && c.progress < 100).length} in progress · {workspaceCourses.filter((c) => c.progress >= 100).length} completed
                    </p>
                  </div>
                  <button type="button" className="ws-section__cta">View All</button>
                </header>
                <Carousel trackClassName="ws-cards-track" ariaLabel="Enrolled courses">
                  {workspaceCourses.map((course) => (
                    <WorkspaceCourseCard key={course.id} course={course} />
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
                      Browse past events
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
                  <button type="button" className="ws-section__cta">View All</button>
                </header>
                <Carousel trackClassName="ws-cards-track" ariaLabel="Explore categories">
                  {workspaceCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
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
