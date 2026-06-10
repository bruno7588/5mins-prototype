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
}

export const REPORT_FREQUENCIES: { value: string; label: string; days: number }[] = [
  { value: 'weekly', label: 'Every week', days: 7 },
  { value: 'biweekly', label: 'Every 2 weeks', days: 14 },
  { value: 'monthly', label: 'Every month', days: 30 },
  { value: 'quarterly', label: 'Every 3 months', days: 90 },
]

export function frequencyLabel(value: string): string {
  return REPORT_FREQUENCIES.find((f) => f.value === value)?.label ?? value
}

/** Human-readable "next report" date based on cadence (prototype: now + interval). */
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
