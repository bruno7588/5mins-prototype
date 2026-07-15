import { useEffect, useRef, useState } from 'react'
import { ArrowDown2, ArrowLeft2, ArrowRight2 } from 'iconsax-react'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const pad = (n: number) => String(n).padStart(2, '0')
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parseISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}
const fmtShort = (iso: string) =>
  parseISO(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

export interface DatePreset {
  value: string
  label: string
  days: number | null
}

export interface DateFilterValue {
  /** Preset key ('all' | '7d' | … ) or 'custom' when a range is picked. */
  dateRange: string
  /** ISO yyyy-mm-dd bounds, set only when dateRange === 'custom'. */
  customFrom: string | null
  customTo: string | null
}

interface Props {
  presets: DatePreset[]
  value: DateFilterValue
  onChange: (next: DateFilterValue) => void
}

/**
 * Date filter for the audit log: preset list ("All time", "Last 7 days", …) plus a
 * "Custom range" month grid (calendar.md, Mon-first) for bounded incident windows.
 * Empty custom bounds = falls back to a preset; 'custom' with both bounds filters
 * the inclusive [from, to] day range.
 */
function AuditDateFilter({ presets, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [showRange, setShowRange] = useState(value.dateRange === 'custom')
  // Draft range while the calendar is open; committed only on Apply.
  const [from, setFrom] = useState<string | null>(value.customFrom)
  const [to, setTo] = useState<string | null>(value.customTo)
  const ref = useRef<HTMLDivElement>(null)

  const anchor = value.customFrom ?? toISO(new Date())
  const [view, setView] = useState(() => {
    const d = parseISO(anchor)
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Reset the draft to the committed range each time the popover opens.
  useEffect(() => {
    if (open) {
      setFrom(value.customFrom)
      setTo(value.customTo)
      setShowRange(value.dateRange === 'custom')
    }
  }, [open, value.customFrom, value.customTo, value.dateRange])

  const triggerLabel =
    value.dateRange === 'custom' && value.customFrom && value.customTo
      ? `${fmtShort(value.customFrom)} – ${fmtShort(value.customTo)}`
      : (presets.find((p) => p.value === value.dateRange)?.label ?? 'All time')

  const choosePreset = (v: string) => {
    onChange({ dateRange: v, customFrom: null, customTo: null })
    setOpen(false)
  }

  // Two-click range: first click sets a fresh start, second sets the end (ordered).
  const pickDay = (iso: string) => {
    if (!from || (from && to)) {
      setFrom(iso)
      setTo(null)
    } else if (iso < from) {
      setTo(from)
      setFrom(iso)
    } else {
      setTo(iso)
    }
  }

  const applyRange = () => {
    if (from && to) {
      onChange({ dateRange: 'custom', customFrom: from, customTo: to })
      setOpen(false)
    }
  }

  // Build 6 weeks (42 cells) spanning prev/this/next month, Monday-first.
  const year = view.getFullYear()
  const month = view.getMonth()
  const leading = (new Date(year, month, 1).getDay() + 6) % 7
  const cells: { date: Date; inMonth: boolean }[] = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(year, month, i - leading + 1)
    cells.push({ date, inMonth: date.getMonth() === month })
  }
  const trimmed =
    cells.slice(35).every((c) => !c.inMonth) ? cells.slice(0, 35) : cells
  const monthLabel = view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const todayISO = toISO(new Date())

  return (
    <div ref={ref} className="dropdown-field dropdown-sm audit-filter">
      <button
        type="button"
        className={`dropdown-trigger${open ? ' is-active' : ''}${
          value.dateRange !== 'all' ? ' is-applied' : ''
        }`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
        }}
      >
        <span className="dropdown-trigger-text">{triggerLabel}</span>
        <ArrowDown2 size={16} color="currentColor" variant="Linear" className="dropdown-chevron" />
      </button>

      {open && (
        <div className="audit-date-pop" role="dialog" aria-label="Filter by date">
          <ul className="audit-date-presets">
            {presets.map((p) => (
              <li key={p.value}>
                <button
                  type="button"
                  className={`audit-date-preset${
                    value.dateRange === p.value && !showRange ? ' is-selected' : ''
                  }`}
                  onClick={() => choosePreset(p.value)}
                >
                  {p.label}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className={`audit-date-preset${showRange ? ' is-selected' : ''}`}
                onClick={() => setShowRange(true)}
              >
                Custom range
              </button>
            </li>
          </ul>

          {showRange && (
            <div className="audit-date-cal">
              <div className="audit-cal-head">
                <span className="audit-cal-title">{monthLabel}</span>
                <div className="audit-cal-nav">
                  <button
                    type="button"
                    className="audit-cal-nav-btn"
                    aria-label="Previous month"
                    onClick={() => setView(new Date(year, month - 1, 1))}
                  >
                    <ArrowLeft2 size={18} color="currentColor" variant="Linear" />
                  </button>
                  <button
                    type="button"
                    className="audit-cal-nav-btn"
                    aria-label="Next month"
                    onClick={() => setView(new Date(year, month + 1, 1))}
                  >
                    <ArrowRight2 size={18} color="currentColor" variant="Linear" />
                  </button>
                </div>
              </div>

              <div className="audit-cal-grid audit-cal-grid--head">
                {WEEKDAYS.map((w) => (
                  <span key={w} className="audit-cal-weekday">
                    {w}
                  </span>
                ))}
              </div>

              <div className="audit-cal-grid">
                {trimmed.map(({ date, inMonth }, i) => {
                  const iso = toISO(date)
                  const isEnd = iso === from || iso === to
                  const inBand = from && to && iso > from && iso < to
                  const cls =
                    `audit-cal-day${inMonth ? '' : ' audit-cal-day--muted'}` +
                    `${isEnd ? ' audit-cal-day--selected' : ''}` +
                    `${inBand ? ' audit-cal-day--band' : ''}` +
                    `${iso === todayISO ? ' audit-cal-day--today' : ''}`
                  return (
                    <button
                      key={i}
                      type="button"
                      className={cls}
                      onClick={() => pickDay(iso)}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>

              <div className="audit-cal-foot">
                <span className="audit-cal-range">
                  {from ? fmtShort(from) : 'Start'} – {to ? fmtShort(to) : 'End'}
                </span>
                <button
                  type="button"
                  className="audit-cal-apply"
                  disabled={!from || !to}
                  onClick={applyRange}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AuditDateFilter
