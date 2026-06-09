/**
 * Learning Records — saved filter presets (localStorage).
 * Mirrors the read/try-catch/setItem convention in ./addedLessons.ts.
 */

export interface FilterEntry {
  /** Filter id, matching keys in FILTER_BY_ID on the Learning Records page. */
  id: string
  /** Selected dropdown value, or null if the filter was added without a value. */
  value: string | null
}

export interface FilterPreset {
  id: string
  name: string
  description?: string
  filters: FilterEntry[]
  createdAt: string
  /** Suggested defaults are read-only (apply-only, cannot be deleted). */
  isDefault?: boolean
  /** Pinned presets surface as one-click chips in the filters bar. */
  pinned?: boolean
}

const PRESETS_KEY = '5mins.lr-filter-presets'

/**
 * Pre-seeded suggestions for common admin workflows. Not persisted — surfaced
 * alongside the user's saved presets. Values must exist in the page's
 * FILTER_VALUE_OPTIONS so they apply cleanly.
 */
export const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'default-overdue',
    name: 'Overdue learners',
    filters: [{ id: 'status', value: 'overdue' }],
    createdAt: '',
    isDefault: true,
  },
  {
    id: 'default-completed',
    name: 'Completed',
    filters: [{ id: 'status', value: 'completed' }],
    createdAt: '',
    isDefault: true,
  },
  {
    id: 'default-compliance',
    name: 'Compliance courses',
    filters: [{ id: 'category', value: 'compliance' }],
    createdAt: '',
    isDefault: true,
  },
]

export function readPresets(): FilterPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as FilterPreset[]) : []
  } catch {
    return []
  }
}

/** Upsert a preset by id. Returns the updated list. */
export function savePreset(preset: FilterPreset): FilterPreset[] {
  const existing = readPresets().filter((p) => p.id !== preset.id)
  const next = [preset, ...existing]
  localStorage.setItem(PRESETS_KEY, JSON.stringify(next))
  return next
}

export function removePreset(id: string): FilterPreset[] {
  const next = readPresets().filter((p) => p.id !== id)
  localStorage.setItem(PRESETS_KEY, JSON.stringify(next))
  return next
}

/** Flip the pinned flag on a user preset. Returns the updated list. */
export function togglePresetPinned(id: string): FilterPreset[] {
  const next = readPresets().map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p))
  localStorage.setItem(PRESETS_KEY, JSON.stringify(next))
  return next
}

/* ─────────────────────────── Saved reports (Phase 2) ─────────────────────────── */

/**
 * A saved report = a snapshot of a filter combination + automated email delivery.
 * Multiple reports can be saved per page (e.g. "Weekly overdue", "Monthly compliance").
 */
export interface SavedReport {
  id: string
  name: string
  filters: FilterEntry[] // snapshot of the active filters at creation time
  recipients: string[] // email addresses
  frequency: string // one of REPORT_FREQUENCIES value keys
  automate: boolean // ON/OFF for scheduled email delivery
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

const REPORTS_KEY = '5mins.lr-saved-reports'

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
