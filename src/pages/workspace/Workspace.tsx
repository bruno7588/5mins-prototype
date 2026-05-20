import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Add,
  FlashCircle,
  Mobile,
  Setting2,
  ShieldSecurity,
} from 'iconsax-react'
import { Logo, learnerSideItems } from '../my-team/MyTeam'
import '../my-team/MyTeam.css'
import './Workspace.css'

import { upcomingItems, type CalendarItem } from '../calendar/mockItems'
import CalendarView, { EventCard, type CalendarTab } from '../calendar/CalendarView'
import WorkspaceCourseCard from '../../components/WorkspaceCourseCard/WorkspaceCourseCard'
import CategoryCard from '../../components/CategoryCard/CategoryCard'
import Carousel from '../../components/Carousel/Carousel'
import EventDetailsDrawer from './EventDetailsDrawer'
import { workspaceCourses, workspaceCategories } from './mockItems'

type WorkspaceTab = 'learn' | 'calendar'

function Workspace() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState<WorkspaceTab>('learn')
  const [calendarFilter, setCalendarFilter] = useState<CalendarTab>('upcoming')
  const [selectedEvent, setSelectedEvent] = useState<CalendarItem | null>(null)

  const upcomingEvents = upcomingItems
    .filter((item) => item.type === 'event')
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())

  return (
    <div className="mt-app">
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

          <div className="mt-side__profile">
            <div className="mt-side__profile-info">
              <p className="mt-side__profile-name">Anthonny Wallace</p>
              <p className="mt-side__profile-email">anthonny@email.com</p>
            </div>
            <Setting2 size={16} color="var(--text-secondary)" variant="Linear" />
          </div>

          <div className="mt-side__powered">
            <span>Powered by</span>
            <Logo size={12} />
          </div>
        </aside>

        <section className="mt-body ws-body">
          <header className="mt-pageheader">
            <div className="mt-pageheader__row">
              <div className="mt-pageheader__headline">
                <h1 className="mt-pageheader__title">Your Workspace</h1>
                <p className="mt-pageheader__subtitle">Everything you're learning, scheduled and on your plate</p>
              </div>
            </div>

            <div className="mt-pageheader__divider" />

            <div className="ws-tabrow">
              <nav className="mt-tabs" role="tablist" aria-label="Workspace view">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'learn'}
                  className={`mt-tab${tab === 'learn' ? ' mt-tab--active' : ''}`}
                  onClick={() => setTab('learn')}
                >
                  <span>Learn</span>
                  {tab === 'learn' && <span className="mt-tab__indicator" aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'calendar'}
                  className={`mt-tab${tab === 'calendar' ? ' mt-tab--active' : ''}`}
                  onClick={() => setTab('calendar')}
                >
                  <span>Calendar</span>
                  {tab === 'calendar' && <span className="mt-tab__indicator" aria-hidden="true" />}
                </button>
              </nav>
              {tab === 'calendar' ? (
                <div className="mt-cp__switcher" role="tablist" aria-label="Calendar filter">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={calendarFilter === 'upcoming'}
                    className={`mt-cp__switcher-item${calendarFilter === 'upcoming' ? ' mt-cp__switcher-item--active' : ''}`}
                    onClick={() => setCalendarFilter('upcoming')}
                  >
                    Upcoming
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={calendarFilter === 'past'}
                    className={`mt-cp__switcher-item${calendarFilter === 'past' ? ' mt-cp__switcher-item--active' : ''}`}
                    onClick={() => setCalendarFilter('past')}
                  >
                    Previous
                  </button>
                </div>
              ) : null}
            </div>
          </header>

          {tab === 'learn' ? (
            <div className="ws-sections">
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
          ) : (
            <CalendarView filter={calendarFilter} />
          )}
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
