import WebAppTopNav from '@/components/WebAppTopNav/WebAppTopNav'
import { useState } from 'react'
import LearnerMobileNav from '@/components/LearnerMobileNav/LearnerMobileNav'
import { useNavigate, useLocation } from 'react-router-dom'
import { Logo, learnerSideItems } from '../my-team/MyTeam'
import ProfileMenu from '../../components/ProfileMenu/ProfileMenu'
import '../my-team/MyTeam.css'
import '../workspace/Workspace.css'
import './Events.css'

import { EventCard } from '../calendar/CalendarView'
import { upcomingItems, pastItems, type CalendarItem } from '../calendar/mockItems'
import EventDetailsDrawer from '../workspace/EventDetailsDrawer'
import AdminMenuItem from '@/components/AdminMenuItem/AdminMenuItem'

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
      <LearnerMobileNav />

      <EventDetailsDrawer
        open={selectedEvent !== null}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  )
}

export default Events
