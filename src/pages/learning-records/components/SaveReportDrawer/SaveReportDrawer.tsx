import { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from 'react'
import gsap from 'gsap'
import BellIllustration from '../../../../components/icons/BellIllustration'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import Collapse from '../../../../components/Collapse/Collapse'
import InputField from '../../../../components/InputField/InputField'
import Dropdown from '../../../../components/Dropdown/Dropdown'
import Toggle from '../../../../components/Toggle/Toggle'
import RecipientsField from './RecipientsField'
import CsvIcon from '../../../../components/icons/CsvIcon'
import { FILTER_BY_ID, filterOptions } from '../FilterListbox/FilterListbox'
import {
  REPORT_FREQUENCIES,
  WEEKDAYS,
  MONTHLY_MODES,
  QUARTERLY_MODES,
  DELIVERY_TIMES,
  TIMEZONES,
  defaultTimezone,
  nextReportPreview,
  type FilterEntry,
  type SavedReport,
} from '../../../../utils/lrSavedFilters'
import './SaveReportDrawer.css'

interface SaveReportDrawerProps {
  open: boolean
  onClose: () => void
  onSave: (report: SavedReport) => void
  /** Existing report when editing; null/undefined when creating. */
  initial?: SavedReport | null
  /** Snapshot of the page's active filters, used to seed a new report. */
  currentFilters: FilterEntry[]
  /** Download the report being edited as CSV. */
  onDownload?: (report: SavedReport) => void
  /** Seed from `initial` but present as a brand-new report (Duplicate flow). */
  isDuplicate?: boolean
}

const FREQ_OPTIONS = REPORT_FREQUENCIES.map((f) => ({ value: f.value, label: f.label }))
const WEEKDAY_OPTIONS = WEEKDAYS.map((d) => ({ value: d.value, label: d.label }))
const MONTHLY_OPTIONS = MONTHLY_MODES.map((m) => ({ value: m.value, label: m.label, description: m.description }))
const QUARTERLY_OPTIONS = QUARTERLY_MODES.map((m) => ({ value: m.value, label: m.label, description: m.description }))
const TIME_OPTIONS = DELIVERY_TIMES.map((t) => ({ value: t.value, label: t.label }))
const TZ_OPTIONS = TIMEZONES.map((t) => ({ value: t.value, label: t.label }))

type IconType = ComponentType<{ size?: number; color?: string; variant?: 'Linear' | 'Bold' | 'Outline' }>
interface ChipData {
  id: string
  label: string
  Icon?: IconType
}

/**
 * Read-only filter snapshot kept to a single row. Fits as many chips as the
 * width allows and collapses the rest into a "+N" chip that, when clicked,
 * expands the row to reveal every filter. Widths are measured from a hidden
 * full-width copy so the count stays correct on resize.
 */
function FilterChipsRow({ chips }: { chips: ChipData[] }) {
  const rowRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLButtonElement>(null)
  // Height captured the instant before a user toggle, so GSAP can tween from it.
  const fromHeight = useRef<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(chips.length)
  const [expanded, setExpanded] = useState(false)

  // Toggle helper — snapshot the current height first so the next layout effect
  // can animate the row between its single-row and wrapped heights.
  const toggleExpanded = (next: boolean) => {
    fromHeight.current = rowRef.current?.offsetHeight ?? null
    setExpanded(next)
  }

  // Animate the row's height with GSAP whenever the user expands/collapses it.
  useLayoutEffect(() => {
    const el = rowRef.current
    if (!el || fromHeight.current === null) return
    const from = fromHeight.current
    fromHeight.current = null
    gsap.killTweensOf(el)
    gsap.fromTo(
      el,
      { height: from, overflow: 'hidden' },
      {
        height: el.scrollHeight,
        duration: 0.3,
        ease: 'power2.inOut',
        // Drop the inline height/overflow so the row stays responsive afterwards.
        onComplete: () => {
          el.style.height = ''
          el.style.overflow = ''
        },
      },
    )
  }, [expanded])

  useLayoutEffect(() => {
    setExpanded(false)
    const row = rowRef.current
    const measure = measureRef.current
    if (!row || !measure) return
    const GAP = 8
    const recompute = () => {
      const total = row.clientWidth
      if (!total) return
      const widths = (Array.from(measure.children) as HTMLElement[]).map((el) => el.offsetWidth)
      let sumAll = 0
      widths.forEach((w, i) => (sumAll += w + (i ? GAP : 0)))
      if (sumAll <= total) {
        setVisibleCount(chips.length)
        return
      }
      const moreW = moreRef.current?.offsetWidth ?? 44
      let used = 0
      let count = 0
      for (let i = 0; i < widths.length; i++) {
        const next = used + (count ? GAP : 0) + widths[i]
        if (next + GAP + moreW <= total) {
          used = next
          count++
        } else break
      }
      setVisibleCount(Math.max(1, count))
    }
    recompute()
    const ro = new ResizeObserver(recompute)
    ro.observe(row)
    return () => ro.disconnect()
  }, [chips])

  const shown = expanded ? chips : chips.slice(0, visibleCount)
  const hidden = chips.length - shown.length

  const renderChip = (c: ChipData) => (
    <span className="rd-chip" key={c.id}>
      {c.Icon && <c.Icon size={16} color="var(--text-secondary)" variant="Linear" />}
      <span className="rd-chip-label">{c.label}</span>
    </span>
  )

  return (
    <div className={`rd-chips${expanded ? ' rd-chips--expanded' : ''}`} ref={rowRef}>
      {shown.map(renderChip)}
      {hidden > 0 && (
        <button
          type="button"
          className="rd-chip rd-chip--more"
          ref={moreRef}
          title={chips.slice(visibleCount).map((c) => c.label).join(', ')}
          onClick={() => toggleExpanded(true)}
        >
          +{hidden}
        </button>
      )}
      {expanded && chips.length > visibleCount && (
        <button
          type="button"
          className="rd-chip rd-chip--more"
          onClick={() => toggleExpanded(false)}
        >
          Show less
        </button>
      )}
      {/* Hidden full-width copy used only to measure each chip's natural width. */}
      <div className="rd-chips-measure" aria-hidden="true" ref={measureRef}>
        {chips.map(renderChip)}
      </div>
    </div>
  )
}

/** Today as yyyy-mm-dd, for seeding the biweekly start date. */
function todayISO(): string {
  const d = new Date()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function SaveReportDrawer({ open, onClose, onSave, initial, currentFilters, onDownload, isDuplicate }: SaveReportDrawerProps) {
  // A duplicate is seeded from an existing report but saved as a new one, so it
  // is framed as "Save a new report", not an edit.
  const isEditing = !!initial && !isDuplicate
  const [closing, setClosing] = useState(false)

  const [name, setName] = useState('')
  const [scheduled, setScheduled] = useState(false)
  // Retained on the model for backwards compatibility; no separate pause UI in
  // the one-page layout (the "Schedule this report" toggle is the on/off).
  const [enabled] = useState(true)
  const [frequency, setFrequency] = useState('monthly')
  const [recipients, setRecipients] = useState<string[]>([])
  // A valid email typed into the recipients field but not yet committed to a chip.
  const [pendingRecipient, setPendingRecipient] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterEntry[]>([])
  // Cadence detail
  const [weekday, setWeekday] = useState('mon')
  const [startDate, setStartDate] = useState('')
  const [monthlyMode, setMonthlyMode] = useState('first-working-day')
  const [deliverTime, setDeliverTime] = useState('09:00')
  const [timezone, setTimezone] = useState('UTC')
  // Stable id/createdAt across edits so a re-save updates the same report.
  const [reportId, setReportId] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [triedSave, setTriedSave] = useState(false)

  // Identity of the current open session: the report being edited, or a new
  // report. Seeding happens synchronously during render (below) when this
  // changes, so the first committed render already reflects the report — a late
  // effect-driven update would make the schedule section animate open on
  // mount instead of showing its rest (already-open) state.
  const sessionKey = open ? (initial ? `edit:${initial.id}` : 'new') : null
  const [seededKey, setSeededKey] = useState<string | null>(null)
  if (sessionKey !== seededKey) {
    setSeededKey(sessionKey)
    if (open) {
      setTriedSave(false)
      setPendingRecipient(null)
      if (initial) {
        setName(initial.name)
        setScheduled(initial.scheduled)
        setFrequency(initial.frequency || 'monthly')
        setRecipients(initial.recipients ?? [])
        setFilters(initial.filters)
        setWeekday(initial.weekday || 'mon')
        setStartDate(initial.startDate || todayISO())
        setMonthlyMode(initial.monthlyMode || 'first-working-day')
        setDeliverTime(initial.deliverTime || '09:00')
        setTimezone(initial.timezone || defaultTimezone())
        setReportId(initial.id)
        setCreatedAt(initial.createdAt)
      } else {
        setName('')
        setScheduled(false)
        setFrequency('monthly')
        setRecipients([])
        setFilters(currentFilters)
        setWeekday('mon')
        setStartDate(todayISO())
        setMonthlyMode('first-working-day')
        setDeliverTime('09:00')
        setTimezone(defaultTimezone())
        setReportId(`report-${Date.now()}`)
        setCreatedAt(new Date().toISOString())
      }
    }
  }

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

  if (!open) return null

  const nameMissing = name.trim().length === 0
  // A pending valid email counts — it gets committed on save.
  const recipientsMissing = recipients.length === 0 && !pendingRecipient

  function buildReport(extra: Partial<SavedReport>): SavedReport {
    return {
      id: reportId,
      name: name.trim(),
      filters,
      scheduled: false,
      recipients: [],
      frequency,
      weekday,
      startDate,
      monthlyMode,
      deliverTime,
      timezone,
      enabled,
      createdAt,
      ...extra,
    }
  }

  // One-page save. Name is always required; recipients are required only when
  // the report is scheduled. Everything is persisted in a single step.
  function handleSave() {
    if (nameMissing || (scheduled && recipientsMissing)) {
      setTriedSave(true)
      return
    }
    if (!scheduled) {
      onSave(buildReport({ scheduled: false, recipients: [] }))
      handleClose()
      return
    }
    // Fold a typed-but-uncommitted email into the recipient list.
    const finalRecipients =
      pendingRecipient && !recipients.some((r) => r.toLowerCase() === pendingRecipient)
        ? [...recipients, pendingRecipient]
        : recipients
    onSave(buildReport({ scheduled: true, recipients: finalRecipients }))
    handleClose()
  }

  return (
    <>
      <div
        className={`overlay-backdrop${closing ? ' overlay-backdrop--closing' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <aside
        className={`side-drawer${closing ? ' side-drawer--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-report-drawer-title"
      >
        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <div className="rd-header-text">
              <h2 id="save-report-drawer-title" className="rd-title">
                {isEditing ? 'Edit report' : 'Save a new report'}
              </h2>
            </div>
            <CloseButton onClick={handleClose} />
          </div>
          <div className="modal__divider" />
        </div>

        <div className="side-drawer__content">
          <div className="rd-form">
            {/* Name + Filters — one tight section (16px gap); 24px separates it
                from the schedule toggle below. Matches Figma 11637:124991. */}
            <div className="rd-section">
              {/* Name */}
              <InputField
                label="Name"
                placeholder="e.g. Weekly overdue learners"
                value={name}
                onChange={(e) => setName(e.target.value)}
                validation={triedSave && nameMissing ? 'error' : 'none'}
                helperText={triedSave && nameMissing ? 'Give the report a name.' : undefined}
              />

              {/* Filters — read-only snapshot of the report's filter view. */}
              <div className="rd-field">
                <label className="rd-label">Filters</label>
                {filters.length === 0 ? (
                  <p className="rd-hint">No filters — this report covers all learning records.</p>
                ) : (
                  <FilterChipsRow
                    chips={filters.flatMap((f) => {
                      const meta = FILTER_BY_ID[f.id]
                      if (!meta) return []
                      const opt = filterOptions(f.id).find((o) => o.value === f.value)
                      const label = opt ? `${meta.title}: ${opt.label}` : meta.title
                      return [{ id: f.id, label, Icon: meta.Icon }]
                    })}
                  />
                )}
              </div>
            </div>

            {/* Schedule toggle — whole card toggles; the scheduling fields below
                reveal/collapse (GSAP) when it's switched on. */}
            <div
              className="rd-toggle-row"
              role="button"
              tabIndex={0}
              onClick={() => setScheduled((s) => !s)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setScheduled((s) => !s)
                }
              }}
            >
              <div className="rd-toggle-text">
                <span className="rd-toggle-title">Schedule this report</span>
                {/* Description shows when off; collapses away once scheduling is on. */}
                <Collapse open={!scheduled}>
                  <span className="rd-hint rd-toggle-hint">Email this report to people on a recurring schedule.</span>
                </Collapse>
              </div>
              <span className="rd-toggle-control" onClick={(e) => e.stopPropagation()}>
                <Toggle checked={scheduled} onChange={(e) => setScheduled(e.target.checked)} />
              </span>
            </div>

            {/* Scheduling fields — revealed inline when the toggle is on. */}
            <Collapse open={scheduled}>
              <div className="rd-section rd-schedule">
                {/* Schedule grid — Frequency / cadence detail on row 1, Time / Timezone on row 2 */}
                <div className="rd-grid">
                  {/* Frequency */}
                  <Dropdown
                    label="Frequency"
                    options={FREQ_OPTIONS}
                    value={frequency}
                    onChange={setFrequency}
                  />

                  {/* Cadence detail — depends on the frequency */}
                  {frequency === 'weekly' && (
                    <Dropdown
                      label="On which day?"
                      options={WEEKDAY_OPTIONS}
                      value={weekday}
                      onChange={setWeekday}
                    />
                  )}

                  {frequency === 'monthly' && (
                    <Dropdown
                      label="When in the month?"
                      options={MONTHLY_OPTIONS}
                      value={monthlyMode}
                      onChange={setMonthlyMode}
                    />
                  )}

                  {frequency === 'quarterly' && (
                    <Dropdown
                      label="When in the quarter?"
                      options={QUARTERLY_OPTIONS}
                      value={monthlyMode}
                      onChange={setMonthlyMode}
                    />
                  )}

                  {/* Time */}
                  <Dropdown
                    label="Time"
                    options={TIME_OPTIONS}
                    value={deliverTime}
                    onChange={setDeliverTime}
                  />

                  {/* Timezone */}
                  <Dropdown
                    label="Timezone"
                    options={TZ_OPTIONS}
                    value={timezone}
                    onChange={setTimezone}
                  />
                </div>

                {/* Recipients — autocompletes from registered users */}
                <div className="rd-field">
                  <label className="rd-label">Send reports to</label>
                  <RecipientsField
                    recipients={recipients}
                    onChange={setRecipients}
                    onPendingEmailChange={setPendingRecipient}
                    error={triedSave && recipientsMissing ? 'Add at least one recipient.' : undefined}
                  />
                </div>

                {/* Next report — when it first sends */}
                <div className="rd-alert">
                  <span className="rd-alert-icon">
                    <BellIllustration size={20} />
                  </span>
                  <span className="rd-alert-text">
                    Scheduled to {nextReportPreview({ frequency, weekday, startDate, monthlyMode, deliverTime, timezone })}
                  </span>
                </div>
              </div>
            </Collapse>
          </div>
        </div>

        <div className="side-drawer__footer">
          <div className="side-drawer__footer-divider" />
          <div className="side-drawer__buttons rd-footer-buttons">
            <button
              type="button"
              className="side-drawer__btn-primary"
              disabled={nameMissing || (scheduled && recipientsMissing)}
              onClick={handleSave}
            >
              {isEditing ? 'Update Report' : scheduled ? 'Save & Schedule Report' : 'Save New Report'}
            </button>
            {isEditing && onDownload && (
              <button
                type="button"
                className="rd-btn-download"
                onClick={() =>
                  onDownload(buildReport({ scheduled, recipients: scheduled ? recipients : [] }))
                }
              >
                Download Report
                <CsvIcon size={20} color="currentColor" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default SaveReportDrawer
