import { useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Add,
  ArrowDown2,
  ArrowLeft2,
  ArrowRight2,
  Calendar as CalendarIcon,
  Clock,
  CloseCircle,
  FlashCircle,
  Location,
  Mobile,
  PlayCircle,
  Setting2,
  ShieldSecurity,
  TickCircle,
  VideoSquare,
} from 'iconsax-react'
import Badge from '../../components/Badge/Badge'

function CourseTypeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 4.5C3 4.69891 3.07902 4.88968 3.21967 5.03033C3.36032 5.17098 3.55109 5.25 3.75 5.25H20.25C20.4489 5.25 20.6397 5.17098 20.7803 5.03033C20.921 4.88968 21 4.69891 21 4.5C21 4.30109 20.921 4.11032 20.7803 3.96967C20.6397 3.82902 20.4489 3.75 20.25 3.75H3.75C3.55109 3.75 3.36032 3.82902 3.21967 3.96967C3.07902 4.11032 3 4.30109 3 4.5ZM6 1.5C6 1.69891 6.07902 1.88968 6.21967 2.03033C6.36032 2.17098 6.55109 2.25 6.75 2.25H17.25C17.4489 2.25 17.6397 2.17098 17.7803 2.03033C17.921 1.88968 18 1.69891 18 1.5C18 1.30109 17.921 1.11032 17.7803 0.96967C17.6397 0.829018 17.4489 0.75 17.25 0.75H6.75C6.55109 0.75 6.36032 0.829018 6.21967 0.96967C6.07902 1.11032 6 1.30109 6 1.5ZM10.1475 9.864C10.034 9.79305 9.90352 9.75377 9.76969 9.75026C9.63585 9.74674 9.50352 9.77912 9.38642 9.84402C9.26933 9.90892 9.17174 10.004 9.10379 10.1193C9.03584 10.2347 9 10.3661 9 10.5V18C9 18.1339 9.03584 18.2653 9.10379 18.3807C9.17174 18.496 9.26933 18.5911 9.38642 18.656C9.50352 18.7209 9.63585 18.7533 9.76969 18.7497C9.90352 18.7462 10.034 18.707 10.1475 18.636L16.1475 14.886C16.2554 14.8186 16.3443 14.7248 16.406 14.6136C16.4676 14.5023 16.5 14.3772 16.5 14.25C16.5 14.1228 16.4676 13.9977 16.406 13.8864C16.3443 13.7752 16.2554 13.6814 16.1475 13.614L10.1475 9.864Z" fill="currentColor"/>
      <path d="M2.25 21.75C1.65326 21.75 1.08097 21.5129 0.65901 21.091C0.237053 20.669 0 20.0967 0 19.5L0 9C0 8.40326 0.237053 7.83097 0.65901 7.40901C1.08097 6.98705 1.65326 6.75 2.25 6.75H21.75C22.3467 6.75 22.919 6.98705 23.341 7.40901C23.7629 7.83097 24 8.40326 24 9V19.5C24 20.0967 23.7629 20.669 23.341 21.091C22.919 21.5129 22.3467 21.75 21.75 21.75H2.25ZM21.75 20.25C21.9489 20.25 22.1397 20.171 22.2803 20.0303C22.421 19.8897 22.5 19.6989 22.5 19.5V9C22.5 8.80109 22.421 8.61032 22.2803 8.46967C22.1397 8.32902 21.9489 8.25 21.75 8.25H2.25C2.05109 8.25 1.86032 8.32902 1.71967 8.46967C1.57902 8.61032 1.5 8.80109 1.5 9V19.5C1.5 19.6989 1.57902 19.8897 1.71967 20.0303C1.86032 20.171 2.05109 20.25 2.25 20.25H21.75Z" fill="currentColor"/>
    </svg>
  )
}
import { Logo, learnerSideItems } from '../my-team/MyTeam'
import { pastItems, upcomingItems, type CalendarItem } from './mockItems'
import '../my-team/MyTeam.css'
import './Calendar.css'

const TODAY = new Date('2026-05-19T00:00:00')

type Tab = 'upcoming' | 'past'

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function isSameDay(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b)
}

function formatMonthShort(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short' })
}

function formatWeekdayLong(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long' })
}

function formatTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function dateSectionLabel(date: Date): { primary: string; weekday: string } {
  const today = new Date(TODAY)
  const tomorrow = new Date(TODAY)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (isSameDay(date, today)) {
    return { primary: 'Today', weekday: formatWeekdayLong(date) }
  }
  if (isSameDay(date, tomorrow)) {
    return { primary: 'Tomorrow', weekday: formatWeekdayLong(date) }
  }
  return { primary: `${formatMonthShort(date)} ${date.getDate()}`, weekday: formatWeekdayLong(date) }
}

function formatWeekdayShort(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

function formatItemDate(item: CalendarItem): string {
  const start = new Date(item.startsAt)
  const end = new Date(item.endsAt)
  if (!isSameDay(start, end)) {
    return `${formatMonthShort(start)} ${start.getDate()} – ${formatMonthShort(end)} ${end.getDate()}`
  }
  return `${formatWeekdayShort(start)}, ${start.getDate()} ${formatMonthShort(start)}`
}

function formatItemTime(item: CalendarItem): string {
  const start = new Date(item.startsAt)
  const end = new Date(item.endsAt)
  return `${formatTime(start)} – ${formatTime(end)} ${item.timezone}`
}

interface DateGroup {
  date: Date
  items: CalendarItem[]
}

function groupByDate(items: CalendarItem[], direction: 'asc' | 'desc'): DateGroup[] {
  const map = new Map<string, DateGroup>()
  for (const item of items) {
    const start = new Date(item.startsAt)
    const startOfDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const key = dateKey(startOfDay)
    let group = map.get(key)
    if (!group) {
      group = { date: startOfDay, items: [] }
      map.set(key, group)
    }
    group.items.push(item)
  }
  const groups = Array.from(map.values())
  groups.sort((a, b) => (direction === 'asc' ? a.date.getTime() - b.date.getTime() : b.date.getTime() - a.date.getTime()))
  for (const g of groups) {
    g.items.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
  }
  return groups
}

function AttendeeStack({ attendees, overflow }: { attendees: CalendarItem['attendees']; overflow?: number }) {
  return (
    <div className="cal-card__avatars" aria-label={`${attendees.length}${overflow ? '+' : ''} attendees`}>
      {attendees.slice(0, 4).map((a, i) => (
        <span key={`${a.initials}-${i}`} className="cal-card__avatar" style={{ background: a.background }}>
          {a.initials}
        </span>
      ))}
      {overflow ? <span className="cal-card__avatar cal-card__avatar--overflow">+{overflow}</span> : null}
    </div>
  )
}

function ActionButton({ tab, state }: { tab: Tab; state: CalendarItem['attendance'] }) {
  if (tab === 'upcoming') {
    return (
      <button type="button" className="btn-primary cal-card__action--split">
        <span>Register</span>
      </button>
    )
  }
  if (state === 'attended') {
    return (
      <button type="button" className="btn-success">
        <TickCircle size={20} color="var(--neutral-25)" variant="Linear" />
        <span>Attended</span>
      </button>
    )
  }
  if (state === 'missed') {
    return (
      <button type="button" className="btn-danger">
        <CloseCircle size={20} color="var(--neutral-25)" variant="Bold" />
        <span>Didn’t Attend</span>
      </button>
    )
  }
  return (
    <button type="button" className="btn-primary cal-card__action--split">
      <span>Mark Attendance</span>
      <ArrowDown2 size={20} color="var(--neutral-25)" />
    </button>
  )
}

function CourseCard({ item, tab }: { item: CalendarItem; tab: Tab }) {
  const isOverdue = tab === 'past' && (item.progress ?? 0) < 100
  return (
    <article className="cal-card cal-card--course">
      <div className="cal-card__media" style={{ background: item.thumbnailGradient }}>
        <span className="cal-card__typetag" aria-label={item.type === 'course' ? 'Course' : 'Event'}>
          {item.type === 'course' ? (
            <CourseTypeIcon size={24} />
          ) : (
            <CalendarIcon size={24} color="var(--text-tertiary)" variant="Linear" />
          )}
        </span>
      </div>
      <div className="cal-card__body">
        <h3 className="cal-card__title">{item.title}</h3>
        <div className="cal-card__metablock">
          <div className="cal-card__metarow">
            {item.durationMinutes ? (
              <span className="cal-card__meta">
                <Clock size={20} color="var(--text-secondary)" variant="Linear" />
                <span>{item.durationMinutes} min</span>
              </span>
            ) : null}
            {item.lessonCount ? (
              <span className="cal-card__meta">
                <PlayCircle size={20} color="var(--text-secondary)" variant="Linear" />
                <span>{item.lessonCount} lessons</span>
              </span>
            ) : null}
          </div>
          <span className="cal-card__meta">
            <CalendarIcon size={20} color="var(--text-secondary)" variant="Linear" />
            <span>Due {formatItemDate(item)}</span>
          </span>
        </div>
        {isOverdue ? <Badge type="error" icon label="Overdue" className="cal-card__overdue" /> : null}
      </div>
    </article>
  )
}

function EventCard({ item, tab }: { item: CalendarItem; tab: Tab }) {
  const LocationIcon = item.locationKind === 'virtual' ? VideoSquare : Location
  return (
    <article className="cal-card">
      <div className="cal-card__media" style={{ background: item.thumbnailGradient }}>
        <span className="cal-card__typetag" aria-label={item.type === 'course' ? 'Course' : 'Event'}>
          {item.type === 'course' ? (
            <CourseTypeIcon size={24} />
          ) : (
            <CalendarIcon size={24} color="var(--text-tertiary)" variant="Linear" />
          )}
        </span>
      </div>
      <div className="cal-card__body">
        <h3 className="cal-card__title">{item.title}</h3>
        <div className="cal-card__metablock">
          <div className="cal-card__metarow">
            <span className="cal-card__meta">
              <CalendarIcon size={20} color="var(--text-secondary)" variant="Linear" />
              <span>{formatItemDate(item)}</span>
            </span>
            <span className="cal-card__meta">
              <Clock size={20} color="var(--text-secondary)" variant="Linear" />
              <span>{formatItemTime(item)}</span>
            </span>
          </div>
          {item.location ? (
            <span className="cal-card__meta">
              <LocationIcon size={20} color="var(--text-secondary)" variant="Linear" />
              <span>{item.location}</span>
            </span>
          ) : null}
        </div>
        <AttendeeStack attendees={item.attendees} overflow={item.overflowCount} />
      </div>
      <div className="cal-card__actionwrap">
        <ActionButton tab={tab} state={item.attendance} />
      </div>
    </article>
  )
}

function ItemCard({ item, tab }: { item: CalendarItem; tab: Tab }) {
  if (item.type === 'course') return <CourseCard item={item} tab={tab} />
  return <EventCard item={item} tab={tab} />
}

function buildDayMap(items: CalendarItem[]): Map<string, CalendarItem[]> {
  const map = new Map<string, CalendarItem[]>()
  for (const item of items) {
    const start = new Date(item.startsAt)
    const key = dateKey(new Date(start.getFullYear(), start.getMonth(), start.getDate()))
    const bucket = map.get(key)
    if (bucket) bucket.push(item)
    else map.set(key, [item])
  }
  for (const bucket of map.values()) {
    bucket.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
  }
  return map
}

function MiniCalendar({ activeMonth, dayMap }: { activeMonth: Date; dayMap: Map<string, CalendarItem[]> }) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const monthLabel = activeMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstOfMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), 1)
  const daysInMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 0).getDate()
  // Monday-first week: getDay() 0=Sun..6=Sat → shift so Mon=0..Sun=6
  const startWeekday = (firstOfMonth.getDay() + 6) % 7
  const totalCells = 42
  const cells: { date: Date; outside: boolean }[] = []
  for (let i = 0; i < totalCells; i++) {
    const dayOffset = i - startWeekday
    const cellDate = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), 1 + dayOffset)
    cells.push({ date: cellDate, outside: dayOffset < 0 || dayOffset >= daysInMonth })
  }
  const todayKey = dateKey(TODAY)
  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const handleDayClick = (key: string) => {
    const target = document.getElementById(`cal-day-${key}`)
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="cal-mini">
      <header className="cal-mini__header">
        <span className="cal-mini__month">{monthLabel}</span>
        <div className="cal-mini__nav">
          <button type="button" aria-label="Previous month" className="cal-mini__navbtn">
            <ArrowLeft2 size={20} color="var(--text-primary)" variant="Linear" />
          </button>
          <button type="button" aria-label="Next month" className="cal-mini__navbtn">
            <ArrowRight2 size={20} color="var(--text-primary)" variant="Linear" />
          </button>
        </div>
      </header>
      <div className="cal-mini__weekrow">
        {weekdayLabels.map((d, i) => (
          <span key={i} className="cal-mini__weekday">{d}</span>
        ))}
      </div>
      <div className="cal-mini__grid">
        {cells.map(({ date, outside }, i) => {
          const key = dateKey(date)
          const items = outside ? undefined : dayMap.get(key)
          const hasItems = !!items && items.length > 0
          const isToday = key === todayKey
          const isHovered = hoveredKey === key
          return (
            <span
              key={i}
              className={`cal-mini__day${outside ? ' cal-mini__day--outside' : ''}${isToday ? ' cal-mini__day--today' : ''}${hasItems ? ' cal-mini__day--hasitems' : ''}`}
              onClick={hasItems ? () => handleDayClick(key) : undefined}
              onMouseEnter={hasItems ? () => setHoveredKey(key) : undefined}
              onMouseLeave={hasItems ? () => setHoveredKey(null) : undefined}
            >
              {hasItems && !isToday ? (
                <span
                  className="cal-mini__day-fill"
                  aria-hidden="true"
                  style={{ background: items![0].thumbnailGradient }}
                />
              ) : null}
              <span className="cal-mini__day-num">{date.getDate()}</span>
              {hasItems && isHovered ? (
                <span className="cal-mini__tooltip" role="tooltip">
                  <span className="cal-mini__tooltip-eyebrow">
                    {items![0].type === 'course' ? 'Course' : 'Event'}
                  </span>
                  <span className="cal-mini__tooltip-title">{items![0].title}</span>
                  {items!.length > 1 ? (
                    <span className="cal-mini__tooltip-count">+{items!.length - 1} more</span>
                  ) : null}
                </span>
              ) : null}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function Calendar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState<Tab>('upcoming')

  const groups = useMemo(() => {
    if (tab === 'upcoming') return groupByDate(upcomingItems, 'asc')
    return groupByDate(pastItems, 'desc')
  }, [tab])

  const dayMap = useMemo(() => {
    return buildDayMap(tab === 'upcoming' ? upcomingItems : pastItems)
  }, [tab])

  return (
    <div className="mt-app">
      <header className="mt-topnav">
        <button type="button" className="mt-topnav__logo" aria-label="Home" onClick={() => navigate('/my-team')}>
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

        <section className="mt-body cal-body">
          <header className="mt-pageheader">
            <div className="mt-pageheader__row">
              <div className="mt-pageheader__headline">
                <h1 className="mt-pageheader__title">Calendar</h1>
                <p className="mt-pageheader__subtitle">Your courses and events, all in one place</p>
              </div>
            </div>

            <div className="mt-pageheader__divider" />

            <nav className="mt-tabs" role="tablist" aria-label="Calendar view">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'upcoming'}
                className={`mt-tab${tab === 'upcoming' ? ' mt-tab--active' : ''}`}
                onClick={() => setTab('upcoming')}
              >
                <span>Upcoming</span>
                {tab === 'upcoming' && <span className="mt-tab__indicator" aria-hidden="true" />}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'past'}
                className={`mt-tab${tab === 'past' ? ' mt-tab--active' : ''}`}
                onClick={() => setTab('past')}
              >
                <span>Previous</span>
                {tab === 'past' && <span className="mt-tab__indicator" aria-hidden="true" />}
              </button>
            </nav>
          </header>

          <div className="cal-shell">
            <div className="cal-center">
              {groups.length === 0 ? (
                <div className="cal-empty">
                  <p>Nothing here yet.</p>
                </div>
              ) : (
                groups.map((group) => {
                  const label = dateSectionLabel(group.date)
                  const key = dateKey(group.date)
                  return (
                    <div key={key} id={`cal-day-${key}`} className="cal-row">
                      <header className="cal-row__header">
                        <span className="cal-row__dot" aria-hidden="true" />
                        <span className="cal-row__date">{label.primary}</span>
                        <span className="cal-row__weekday">{label.weekday}</span>
                      </header>
                      <div className="cal-row__cards">
                        {group.items.map((item) => (
                          <ItemCard key={item.id} item={item} tab={tab} />
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <aside className="cal-rightrail">
              <MiniCalendar activeMonth={TODAY} dayMap={dayMap} />
            </aside>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Calendar
