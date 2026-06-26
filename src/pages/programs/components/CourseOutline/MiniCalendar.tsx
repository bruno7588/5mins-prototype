import { useState } from 'react'
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react'
import './MiniCalendar.css'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const pad = (n: number) => String(n).padStart(2, '0')
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parseISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

interface Props {
  value: string // ISO yyyy-mm-dd
  onSelect: (iso: string) => void
}

/** Month-grid date picker (Figma 2420:44116 calendar). Mon-first week. */
function MiniCalendar({ value, onSelect }: Props) {
  const selected = parseISO(value)
  const [view, setView] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1))

  const year = view.getFullYear()
  const month = view.getMonth()
  const monthStart = new Date(year, month, 1)
  // Monday = 0 … Sunday = 6
  const leading = (monthStart.getDay() + 6) % 7

  // Build 6 weeks (42 cells) spanning prev/this/next month.
  const cells: { date: Date; inMonth: boolean }[] = []
  for (let i = 0; i < 42; i++) {
    const dayNum = i - leading + 1
    const date = new Date(year, month, dayNum)
    cells.push({ date, inMonth: date.getMonth() === month })
  }
  // Drop a trailing empty week if it's entirely next-month.
  const weeks = cells.length / 7
  const trimmed = weeks > 5 && cells.slice(35).every((c) => !c.inMonth) ? cells.slice(0, 35) : cells

  const selISO = toISO(selected)
  const monthLabel = view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const shift = (delta: number) => setView(new Date(year, month + delta, 1))

  return (
    <div className="mc" role="dialog" aria-label="Choose a date">
      <div className="mc__head">
        <span className="mc__title">{monthLabel}</span>
        <div className="mc__nav">
          <button type="button" className="mc__nav-btn" aria-label="Previous month" onClick={() => shift(-1)}>
            <ArrowLeft2 size={18} color="currentColor" variant="Linear" />
          </button>
          <button type="button" className="mc__nav-btn" aria-label="Next month" onClick={() => shift(1)}>
            <ArrowRight2 size={18} color="currentColor" variant="Linear" />
          </button>
        </div>
      </div>

      <div className="mc__grid mc__grid--head">
        {WEEKDAYS.map((w) => (
          <span key={w} className="mc__weekday">{w}</span>
        ))}
      </div>

      <div className="mc__grid">
        {trimmed.map(({ date, inMonth }, i) => {
          const iso = toISO(date)
          return (
            <button
              key={i}
              type="button"
              className={`mc__day${inMonth ? '' : ' mc__day--muted'}${iso === selISO ? ' mc__day--selected' : ''}`}
              onClick={() => onSelect(iso)}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MiniCalendar
