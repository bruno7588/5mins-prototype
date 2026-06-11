/**
 * Learning Records — saved reports (localStorage).
 * Mirrors the read/try-catch/setItem convention in ./addedLessons.ts.
 */

export interface FilterEntry {
  /** Filter id, matching keys in FILTER_BY_ID on the Learning Records page. */
  id: string
  /** Selected dropdown value, or null if the filter was added without a value. */
  value: string | null
}

/**
 * A saved report = a named snapshot of a filter combination. Applying a report
 * loads its filters into the table. It can optionally be "scheduled" — emailed
 * to recipients on a recurring cadence.
 */
export interface SavedReport {
  id: string
  name: string
  filters: FilterEntry[] // snapshot of the active filters at creation time
  /** Emailed to recipients on the chosen cadence. */
  scheduled: boolean
  recipients: string[] // email addresses (only meaningful when scheduled)
  frequency: string // one of REPORT_FREQUENCIES value keys (when scheduled)
  createdAt: string
  // ── Schedule detail (only meaningful when scheduled) ───────────────────────
  /** Weekly cadence: which day of the week to send. One of WEEKDAYS value keys. */
  weekday?: string
  /** Biweekly cadence: ISO date (yyyy-mm-dd) the 2-week cycle counts from. */
  startDate?: string
  /** Monthly/quarterly cadence: which day in the period. One of MONTHLY_MODES keys. */
  monthlyMode?: string
  /** Delivery time of day, "HH:mm" (24h). */
  deliverTime?: string
  /** IANA timezone id the delivery time is interpreted in. */
  timezone?: string
}

export const REPORT_FREQUENCIES: { value: string; label: string; days: number }[] = [
  { value: 'weekly', label: 'Weekly', days: 7 },
  { value: 'monthly', label: 'Monthly', days: 30 },
  { value: 'quarterly', label: 'Quarterly', days: 90 },
]

export function frequencyLabel(value: string): string {
  return REPORT_FREQUENCIES.find((f) => f.value === value)?.label ?? value
}

/** Days of the week for the weekly cadence (Mon-first, business convention). */
export const WEEKDAYS: { value: string; label: string; index: number }[] = [
  { value: 'mon', label: 'Monday', index: 1 },
  { value: 'tue', label: 'Tuesday', index: 2 },
  { value: 'wed', label: 'Wednesday', index: 3 },
  { value: 'thu', label: 'Thursday', index: 4 },
  { value: 'fri', label: 'Friday', index: 5 },
  { value: 'sat', label: 'Saturday', index: 6 },
  { value: 'sun', label: 'Sunday', index: 0 },
]

export function weekdayLabel(value: string): string {
  return WEEKDAYS.find((d) => d.value === value)?.label ?? value
}

/**
 * Where in the month a monthly/quarterly report lands. Default is the first
 * *working* day: the 1st can fall on a weekend/holiday, so we skip forward to
 * the next business day rather than sending on a day nobody's working.
 */
export const MONTHLY_MODES: { value: string; label: string; description?: string }[] = [
  { value: 'first-working-day', label: 'First working day', description: 'Skips weekends and holidays' },
  { value: 'first-day', label: 'First day of the month' },
  { value: 'last-working-day', label: 'Last working day', description: 'Skips weekends and holidays' },
  { value: 'last-day', label: 'Last day of the month' },
]

export function monthlyModeLabel(value: string): string {
  return MONTHLY_MODES.find((m) => m.value === value)?.label ?? value
}

/**
 * Same mode values as MONTHLY_MODES, but framed for quarterly cadence: "first"
 * modes land at quarter start (Jan/Apr/Jul/Oct), "last" modes at quarter close
 * (Mar/Jun/Sep/Dec). Kept separate so the dropdown copy matches the cadence.
 */
export const QUARTERLY_MODES: { value: string; label: string; description?: string }[] = [
  { value: 'first-working-day', label: 'First working day of the quarter', description: 'Skips weekends and holidays' },
  { value: 'first-day', label: 'First day of the quarter' },
  { value: 'last-working-day', label: 'Last working day of the quarter', description: 'Skips weekends and holidays' },
  { value: 'last-day', label: 'Last day of the quarter' },
]

/** Delivery times offered for scheduled reports (on the hour, common windows). */
export const DELIVERY_TIMES: { value: string; label: string }[] = [
  { value: '06:00', label: '6:00 AM' },
  { value: '07:00', label: '7:00 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
]

export function deliveryTimeLabel(value: string): string {
  return DELIVERY_TIMES.find((t) => t.value === value)?.label ?? value
}

/** Curated timezone list (prototype) — friendly labels over IANA ids. */
export const TIMEZONES: { value: string; label: string }[] = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
  { value: 'America/New_York', label: 'Eastern Time (New York)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Lisbon', label: 'Lisbon' },
  { value: 'Europe/Paris', label: 'Central European (Paris)' },
  { value: 'Asia/Dubai', label: 'Gulf (Dubai)' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Kolkata', label: 'India (Kolkata)' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' },
]

export function timezoneLabel(value: string): string {
  return TIMEZONES.find((t) => t.value === value)?.label ?? value
}

/** Browser timezone if it's one we offer, else UTC — a sensible default. */
export function defaultTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return TIMEZONES.some((t) => t.value === tz) ? tz : 'UTC'
  } catch {
    return 'UTC'
  }
}

const WEEKEND = (d: Date) => d.getDay() === 0 || d.getDay() === 6

function firstWorkingDay(year: number, month: number): Date {
  const d = new Date(year, month, 1)
  while (WEEKEND(d)) d.setDate(d.getDate() + 1)
  return d
}

function lastWorkingDay(year: number, month: number): Date {
  const d = new Date(year, month + 1, 0)
  while (WEEKEND(d)) d.setDate(d.getDate() - 1)
  return d
}

/** The day-in-month a monthly mode resolves to, for the given month. */
function monthlyDate(year: number, month: number, mode: string): Date {
  switch (mode) {
    case 'first-day':
      return new Date(year, month, 1)
    case 'last-day':
      return new Date(year, month + 1, 0)
    case 'last-working-day':
      return lastWorkingDay(year, month)
    case 'first-working-day':
    default:
      return firstWorkingDay(year, month)
  }
}

/**
 * Compute the next send date for a report, honouring its cadence detail.
 * Prototype-grade: holiday calendars aren't wired up, so "working day" only
 * skips weekends. Returns a Date in local time at the start of the chosen day.
 */
export function nextReportDate(report: Partial<SavedReport>, from: Date = new Date()): Date {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const freq = report.frequency ?? 'monthly'

  if (freq === 'weekly') {
    const target = WEEKDAYS.find((d) => d.value === report.weekday)?.index ?? 1
    const d = new Date(today)
    let delta = (target - d.getDay() + 7) % 7
    if (delta === 0) delta = 7 // always the next occurrence, not today
    d.setDate(d.getDate() + delta)
    return d
  }

  const mode = report.monthlyMode ?? 'first-working-day'

  if (freq === 'quarterly') {
    // Anchor to calendar quarters so the cadence is predictable regardless of
    // when the report was created. "first" modes land at quarter start
    // (Jan/Apr/Jul/Oct); "last" modes at quarter close (Mar/Jun/Sep/Dec).
    const quarterStart = Math.floor(today.getMonth() / 3) * 3
    const anchorMonth = mode.startsWith('last') ? quarterStart + 2 : quarterStart
    let d = monthlyDate(today.getFullYear(), anchorMonth, mode)
    let guard = 0
    while (d <= today && guard < 8) {
      d = monthlyDate(today.getFullYear(), anchorMonth + 3 * (guard + 1), mode)
      guard++
    }
    return d
  }

  // monthly
  let d = monthlyDate(today.getFullYear(), today.getMonth(), mode)
  let guard = 0
  while (d <= today && guard < 24) {
    d = monthlyDate(today.getFullYear(), today.getMonth() + (guard + 1), mode)
    guard++
  }
  return d
}

/** Human-readable "next report" line, e.g. "Monday, January 5, 2026, at 9:00 AM, London GMT/BST". */
export function nextReportPreview(report: Partial<SavedReport>): string {
  const d = nextReportDate(report)
  const date = d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const time = deliveryTimeLabel(report.deliverTime ?? '09:00')
  const tz = report.timezone ?? 'UTC'
  return `${date}, at ${time}, ${tz === 'UTC' ? 'UTC' : timezoneLabel(tz)}`
}

/** Human-readable "next report" date based on cadence (legacy, frequency-only). */
export function nextReportLabel(frequency: string): string {
  const days = REPORT_FREQUENCIES.find((f) => f.value === frequency)?.days ?? 30
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const REPORTS_KEY = '5mins.lr-reports-v2'

export function readReports(): SavedReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SavedReport[]) : []
  } catch {
    return []
  }
}

/** Upsert a report by id. Returns the updated list. */
export function saveReport(report: SavedReport): SavedReport[] {
  const existing = readReports().filter((r) => r.id !== report.id)
  const next = [report, ...existing]
  localStorage.setItem(REPORTS_KEY, JSON.stringify(next))
  return next
}

export function removeReport(id: string): SavedReport[] {
  const next = readReports().filter((r) => r.id !== id)
  localStorage.setItem(REPORTS_KEY, JSON.stringify(next))
  return next
}
