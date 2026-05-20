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
import '../workspace/Workspace.css'
import './Events.css'

import { EventCard } from '../calendar/CalendarView'
import { upcomingItems, pastItems, type CalendarItem } from '../calendar/mockItems'
import EventDetailsDrawer from '../workspace/EventDetailsDrawer'

function Events() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedEvent, setSelectedEvent] = useState<CalendarItem | null>(null)

  const upcomingEvents = upcomingItems
    .filter((item) => item.type === 'event')
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())

  const previousEvents = pastItems
    .filter((item) => item.type === 'event')
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())

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
          <div className="ws-sections ev-page">
            <section className="ws-section">
              <header className="ws-section__header">
                <div className="ws-section__headline">
                  <h2 className="ws-section__title">Upcoming events</h2>
                </div>
              </header>
              <div className="ev-list">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    item={event}
                    tab="upcoming"
                    showCountdown
                    onClick={setSelectedEvent}
                  />
                ))}
              </div>
            </section>

            <section className="ws-section">
              <header className="ws-section__header">
                <div className="ws-section__headline">
                  <h2 className="ws-section__title">Previous events</h2>
                </div>
              </header>
              <div className="ev-list">
                {previousEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    item={event}
                    tab="past"
                    onClick={setSelectedEvent}
                  />
                ))}
              </div>
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

export default Events
