import { useEffect, useState } from 'react'
import {
  CalendarAdd,
  Clock,
  Location,
  People,
  VideoSquare,
} from 'iconsax-react'
import CloseButton from '../../components/CloseButton/CloseButton'
import { AttendeeStack, formatItemTime } from '../calendar/CalendarView'
import type { CalendarItem } from '../calendar/mockItems'
import '../my-team/CoursesDrawer.css'
import './EventDetailsDrawer.css'

interface Props {
  open: boolean
  event: CalendarItem | null
  onClose: () => void
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const r = parseInt(full.substring(0, 2), 16)
  const g = parseInt(full.substring(2, 4), 16)
  const b = parseInt(full.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function extractGradientStops(gradient: string): { angle: string; colors: [string, string] } {
  const angleMatch = gradient.match(/(-?\d+(?:\.\d+)?deg)/)
  const hexes = gradient.match(/#[0-9a-fA-F]{3,8}/g) ?? []
  const angle = angleMatch?.[1] ?? '135deg'
  const c1 = hexes[0] ?? '#000000'
  const c2 = hexes[1] ?? c1
  return { angle, colors: [c1, c2] }
}

function buildTintGradient(thumbnailGradient: string, alpha: number): string {
  const { angle, colors } = extractGradientStops(thumbnailGradient)
  return `linear-gradient(${angle}, ${hexToRgba(colors[0], alpha)} 0%, ${hexToRgba(colors[1], alpha)} 100%)`
}

function EventDetailsDrawer({ open, event, onClose }: Props) {
  const [closing, setClosing] = useState(false)

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose()
    }, 300)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open || !event) return null

  const start = new Date(event.startsAt)
  const day = start.getDate()
  const month = start.toLocaleDateString('en-US', { month: 'short' })
  const LocationIcon = event.locationKind === 'virtual' ? VideoSquare : Location
  const attendeeCount = event.attendees.length + (event.overflowCount ?? 0)

  const { colors: accentColors } = extractGradientStops(event.thumbnailGradient)
  const tintGradient = buildTintGradient(event.thumbnailGradient, 0.08)
  const drawerBackground = `${tintGradient}, var(--page-background)`
  const cardBackground = `${tintGradient}, var(--cards-background)`

  return (
    <>
      <div
        className={`overlay-backdrop${closing ? ' overlay-backdrop--closing' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <aside
        className={`side-drawer event-drawer${closing ? ' side-drawer--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-drawer-title"
        style={{ background: drawerBackground }}
      >
        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <h2 id="event-drawer-title" className="event-drawer__title">{event.title}</h2>
            <CloseButton onClick={handleClose} />
          </div>
          <div className="modal__divider" />
        </div>

        <div className="side-drawer__content">
          <div className="event-drawer__card" style={{ background: cardBackground }}>
            <div
              className="event-drawer__card-header"
              style={{ borderBottomColor: hexToRgba(accentColors[0], 0.16) }}
            >
              <div className="event-drawer__card-info">
                <p className="event-drawer__session">{event.kind}</p>
                {event.instructor ? (
                  <p className="event-drawer__instructor">Instructor {event.instructor}</p>
                ) : null}
              </div>
              <div className="event-drawer__actions">
                <button type="button" className="event-drawer__btn-outline">
                  <span>Add to Calendar</span>
                  <CalendarAdd size={20} color="var(--text-secondary)" variant="Linear" />
                </button>
                <button type="button" className="event-drawer__btn-primary">
                  Register
                </button>
              </div>
            </div>
            <div className="event-drawer__card-body">
              <div className="event-drawer__date-tile" style={{ background: event.thumbnailGradient }}>
                <span className="event-drawer__date-day">{day}</span>
                <span className="event-drawer__date-month">{month}</span>
              </div>
              <div className="event-drawer__meta">
                <div className="event-drawer__meta-row">
                  <span className="event-drawer__meta-item">
                    <Clock size={20} color="var(--text-secondary)" variant="Linear" />
                    <span>{formatItemTime(event)}</span>
                  </span>
                  {event.location ? (
                    <span className="event-drawer__meta-item">
                      <LocationIcon size={20} color="var(--text-secondary)" variant="Linear" />
                      <span>Where: {event.location}</span>
                    </span>
                  ) : null}
                </div>
                <span className="event-drawer__meta-item">
                  <People size={20} color="var(--text-secondary)" variant="Linear" />
                  <span>{attendeeCount} learners</span>
                </span>
              </div>
            </div>
          </div>

          <section className="event-drawer__section">
            <h3 className="event-drawer__section-title">About the event</h3>
            <p className="event-drawer__description">
              {event.description ??
                `Join us for ${event.title}. Connect with peers, sharpen your skills, and explore what's next on your learning journey.`}
            </p>
          </section>

          {event.attendees.length > 0 ? (
            <section className="event-drawer__attending">
              <h4 className="event-drawer__attending-title">Who's attending</h4>
              <AttendeeStack attendees={event.attendees} overflow={event.overflowCount} />
            </section>
          ) : null}
        </div>
      </aside>
    </>
  )
}

export default EventDetailsDrawer
