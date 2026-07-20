import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDown2, ArrowLeft2, ArrowRight2, DocumentDownload } from 'iconsax-react'
import Collapse from '@/components/Collapse/Collapse'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import AuditMultiSelect from './AuditMultiSelect'
import AuditDateFilter from './AuditDateFilter'
import noActivityIllustration from '@/assets/empty-state-illustrations/no-activity.svg'
import noResultsIllustration from '@/assets/empty-state-illustrations/no-results.svg'
import {
  auditOperations,
  operationLabel,
  targetLabelForOp,
  targetKeyForOp,
  EVENT_TYPES,
  ACTOR_OPTIONS,
  EVENT_TYPE_OPTIONS,
  TARGET_OPTIONS,
  DATE_RANGE_OPTIONS,
  SURFACES,
  type AuditValue,
} from '../../data/mockAudit'
import './AuditLog.css'

const PAGE_SIZE = 10

// Date range is a single-select preset; 'all' = unfiltered.
const ALL = 'all'

interface AuditLogProps {
  /**
   * Course id from the Settings-history deep link (`/account?tab=audit-log&course=<id>`).
   * Pre-selects Target = that course + Events = Course settings, so the table opens on
   * exactly the rows the entry point's count badge promised. Both are ordinary applied
   * filters — visible and clearable — not a hidden scope.
   */
  initialCourseId?: string
}

/**
 * The four live filters — the classic audit axes: when (Date), who (Actor),
 * what (Events), and what-was-acted-on (Target). Actor / Events / Target are
 * multi-select (empty array = unfiltered); Date range is a single preset.
 * Setting / Surface are row columns, not filters. All combinable.
 */
interface Filters {
  dateRange: string
  /** ISO yyyy-mm-dd bounds, set only when dateRange === 'custom'. */
  customFrom: string | null
  customTo: string | null
  actor: string[]
  eventType: string[]
  /** Keys from `targetKeyForOp` — course ids for course events, labels otherwise. */
  target: string[]
}

function formatTimestamp(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

/**
 * Timezone label for the expanded detail — the viewer's zone city + GMT offset
 * (e.g. "London (GMT +01:00)"). The collapsed row shows the wall-clock date/time;
 * the expanded row states the zone so that timestamp is unambiguous.
 */
function formatTimezone(iso: string): string {
  const d = new Date(iso)
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const city = zone.split('/').pop()?.replace(/_/g, ' ') ?? zone
  const offMin = -d.getTimezoneOffset()
  const sign = offMin >= 0 ? '+' : '-'
  const pad = (n: number) => String(n).padStart(2, '0')
  const offset = `${pad(Math.floor(Math.abs(offMin) / 60))}:${pad(Math.abs(offMin) % 60)}`
  return `${city} (GMT ${sign}${offset})`
}

/**
 * ISO 8601 with the viewer's local offset (e.g. 2026-07-15T15:32:00+01:00) so the
 * CSV timestamp matches the wall-clock time shown on screen, not UTC. Keeps the
 * exported file and the table from disagreeing by a timezone offset.
 */
function toLocalIso(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  const offMin = -d.getTimezoneOffset() // minutes east of UTC
  const sign = offMin >= 0 ? '+' : '-'
  const offHH = pad(Math.floor(Math.abs(offMin) / 60))
  const offMM = pad(Math.abs(offMin) % 60)
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${offHH}:${offMM}`
  )
}

/** Flatten a value to a single plain string (used for CSV export). */
function valueToPlain(v: AuditValue): string {
  if (v.kind === 'text') return v.text
  if (v.kind === 'list') return v.items.join('; ')
  return v.sub ? `${v.label} (${v.sub})` : v.label
}

/** Render a value in the expanded detail, handling its shape. */
function AuditValueView({ value }: { value: AuditValue }) {
  if (value.kind === 'list') {
    return (
      <span className="audit-value audit-value--list">
        {value.items.map((item) => (
          <span key={item} className="audit-value-pill">
            {item}
          </span>
        ))}
      </span>
    )
  }
  if (value.kind === 'object') {
    return (
      <span className="audit-value audit-value--object">
        <span className="audit-value-label">{value.label}</span>
        {value.sub && <span className="audit-value-sub">{value.sub}</span>}
      </span>
    )
  }
  return <span className="audit-value">{value.text}</span>
}

function csvCell(s: string): string {
  return `"${s.replace(/"/g, '""')}"`
}

function AuditLog({ initialCourseId }: AuditLogProps) {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({
    dateRange: ALL,
    customFrom: null,
    customTo: null,
    actor: [],
    // Arriving from a course's Settings history → that course's settings changes.
    eventType: initialCourseId ? ['course-settings'] : [],
    target: initialCourseId ? [initialCourseId] : [],
  })
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)
  const { toasts, show } = useToast()

  // Any filter change resets to the first page so results stay in view.
  const patch = (next: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...next }))
    setPage(0)
  }

  const filtered = useMemo(() => {
    const rangeOpt = DATE_RANGE_OPTIONS.find((o) => o.value === filters.dateRange)
    const cutoff = rangeOpt?.days != null ? Date.now() - rangeOpt.days * 86_400_000 : null
    // Custom range is inclusive: from 00:00 on the start day to 23:59:59.999 on the end day.
    const custom =
      filters.dateRange === 'custom' && filters.customFrom && filters.customTo
        ? {
            from: new Date(`${filters.customFrom}T00:00:00`).getTime(),
            to: new Date(`${filters.customTo}T23:59:59.999`).getTime(),
          }
        : null

    return auditOperations.filter((op) => {
      if (filters.eventType.length && !filters.eventType.includes(op.eventType)) return false
      if (filters.actor.length && !filters.actor.includes(op.actor)) return false
      if (filters.target.length && !filters.target.includes(targetKeyForOp(op))) return false
      const t = new Date(op.timestamp).getTime()
      if (cutoff != null && t < cutoff) return false
      if (custom && (t < custom.from || t > custom.to)) return false
      return true
    })
  }, [filters])

  const anyApplied =
    filters.dateRange !== ALL ||
    filters.actor.length > 0 ||
    filters.eventType.length > 0 ||
    filters.target.length > 0

  const clearFilters = () =>
    patch({ dateRange: ALL, customFrom: null, customTo: null, actor: [], eventType: [], target: [] })

  const total = filtered.length
  const pageStart = page * PAGE_SIZE
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  const toggleRow = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // In the prototype a single course details page renders; deep-link its Settings tab.
  const openCourse = () => navigate('/your-courses/course', { state: { tab: 'settings' } })

  // CSV flattens to the EXPANDED detail level: one line per changed setting.
  // Column order mirrors the on-screen table (Date · Actor · Setting · Course ·
  // Surface), with the detail-only columns (New value, Operation) grouped in.
  const exportCsv = () => {
    const header = [
      'Timestamp',
      'User',
      'User email',
      'Role at the time',
      'Action type',
      'Change',
      'New value',
      'Target',
      'Surface',
      'Operation',
    ]
    const lines = [header.map(csvCell).join(',')]
    filtered.forEach((op) => {
      const label = operationLabel(op)
      const target = targetLabelForOp(op)
      op.changes.forEach((c) => {
        lines.push(
          [
            toLocalIso(op.timestamp),
            op.actor,
            op.actorEmail,
            op.role,
            EVENT_TYPES[op.eventType].label,
            c.setting,
            valueToPlain(c.value),
            target,
            SURFACES[op.surfaceKey],
            label,
          ]
            .map(csvCell)
            .join(','),
        )
      })
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'audit-log.csv'
    a.click()
    URL.revokeObjectURL(url)

    show(
      'success',
      `Exported ${total} ${total === 1 ? 'change' : 'changes'}${anyApplied ? ' (filters applied)' : ''}`,
    )
  }

  return (
    <div className="audit">
      {/* ── Toolbar: five live filters (left) + CSV export (right) ── */}
      <div className="audit-toolbar">
        <div className="audit-filters">
          <AuditDateFilter
            presets={DATE_RANGE_OPTIONS}
            value={{ dateRange: filters.dateRange, customFrom: filters.customFrom, customTo: filters.customTo }}
            onChange={(v) => patch(v)}
          />
          <AuditMultiSelect
            allLabel="All users"
            noun="users"
            options={ACTOR_OPTIONS}
            selected={filters.actor}
            onChange={(v) => patch({ actor: v })}
          />
          <AuditMultiSelect
            allLabel="All actions"
            noun="actions"
            options={EVENT_TYPE_OPTIONS}
            selected={filters.eventType}
            onChange={(v) => patch({ eventType: v })}
          />
          <AuditMultiSelect
            allLabel="All targets"
            noun="targets"
            options={TARGET_OPTIONS}
            selected={filters.target}
            onChange={(v) => patch({ target: v })}
          />
          {anyApplied && (
            <button type="button" className="audit-clear" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>

        <button type="button" className="audit-export" onClick={exportCsv} disabled={total === 0}>
          Export CSV
          <DocumentDownload size={16} color="currentColor" variant="Linear" />
        </button>
      </div>

      {total === 0 ? (
        <div className="audit-empty" role="status">
          <img
            className="audit-empty-illustration"
            src={anyApplied ? noResultsIllustration : noActivityIllustration}
            alt=""
            width={72}
            height={72}
          />
          <div className="audit-empty-info">
            <p className="audit-empty-title">{anyApplied ? 'No results' : 'No changes recorded'}</p>
            <p className="audit-empty-desc">
              {anyApplied
                ? 'No activity matches your filters.'
                : "When an admin changes a setting, enrolment, user, or role, it'll appear here — showing what changed, who did it, and when."}
            </p>
            {anyApplied && (
              <button type="button" className="audit-empty-cta" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="audit-table">
            {/* Borderless header — short noun labels describing the data (table.md) */}
            <div className="audit-thead" role="row">
              <span className="audit-th audit-col-date">Date</span>
              <span className="audit-th audit-col-actor">User</span>
              <span className="audit-th audit-col-setting">Action</span>
              <span className="audit-th audit-col-course">Target</span>
              <span className="audit-th audit-col-surface">Surface</span>
              <span className="audit-th audit-col-expand" aria-hidden="true" />
            </div>

            <ul className="audit-list">
              {pageRows.map((op) => {
                const { date, time } = formatTimestamp(op.timestamp)
                const isOpen = expanded.has(op.id)
                const target = targetLabelForOp(op)
                // Name the first changed field; overflow collapses to a "+N more"
                // pill (the full list lives in the expanded detail).
                const settingNames = op.changes.map((c) => c.setting)
                const extraSettings = settingNames.length - 1
                return (
                  <li key={op.id} className={`audit-row-card${isOpen ? ' is-open' : ''}`}>
                    <button
                      type="button"
                      className="audit-row"
                      aria-expanded={isOpen}
                      onClick={() => toggleRow(op.id)}
                    >
                      <span className="audit-cell audit-col-date">
                        <span className="audit-row-date">{date}</span>
                        <span className="audit-row-clock">{time}</span>
                      </span>
                      <span className="audit-cell audit-col-actor">
                        <span className="audit-actor-name">{op.actor}</span>
                        <span className="audit-actor-meta">{op.role}</span>
                      </span>
                      <span className="audit-cell audit-col-setting">
                        <span className="audit-op">{settingNames[0]}</span>
                        {extraSettings > 0 && (
                          <span className="audit-op-more">+{extraSettings}</span>
                        )}
                      </span>
                      <span className="audit-cell audit-col-course">{target}</span>
                      <span className="audit-cell audit-col-surface">{SURFACES[op.surfaceKey]}</span>
                      <span className="audit-cell audit-col-expand audit-row-chevron" aria-hidden="true">
                        <ArrowDown2 size={20} color="var(--text-tertiary)" variant="Linear" />
                      </span>
                    </button>

                    <Collapse open={isOpen}>
                      {/* Column-aligned detail: Timezone under Date, Email under
                          Actor, the changed values under Event, target link under
                          Target. Source/Target text dropped — on the collapsed row. */}
                      <div className="audit-detail">
                        <div className="audit-col-date audit-detail-field">
                          <span className="audit-detail-label">Timezone</span>
                          <span className="audit-detail-value">{formatTimezone(op.timestamp)}</span>
                        </div>
                        <div className="audit-col-actor audit-detail-field">
                          <span className="audit-detail-label">Email</span>
                          <span className="audit-detail-value">{op.actorEmail}</span>
                        </div>
                        <div className="audit-col-setting audit-detail-changes">
                          <dl className="audit-changes">
                            {op.changes.map((c) => (
                              <div className="audit-change" key={c.settingKey}>
                                <dt className="audit-change-setting">{c.setting}</dt>
                                <dd className="audit-change-value">
                                  <AuditValueView value={c.value} />
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                        <div className="audit-col-course audit-detail-actions">
                          {/* Spacer aligns the link with the value row (matches the
                              12px label above every other column). */}
                          <span className="audit-detail-label" aria-hidden="true">&nbsp;</span>
                          {op.courseId && (
                            <button type="button" className="audit-course-link" onClick={openCourse}>
                              View course settings
                            </button>
                          )}
                        </div>
                        <span className="audit-col-surface" aria-hidden="true" />
                        <span className="audit-col-expand" aria-hidden="true" />
                      </div>
                    </Collapse>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="audit-pagination">
            <span className="audit-pagination-count">
              {pageStart + 1}-{pageStart + pageRows.length} of {total}
            </span>
            <button
              type="button"
              className="audit-pagination-nav"
              aria-label="Previous page"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ArrowLeft2 size={16} color="currentColor" variant="Linear" />
            </button>
            <button
              type="button"
              className="audit-pagination-nav"
              aria-label="Next page"
              disabled={pageStart + PAGE_SIZE >= total}
              onClick={() => setPage((p) => (pageStart + PAGE_SIZE < total ? p + 1 : p))}
            >
              <ArrowRight2 size={16} color="currentColor" variant="Linear" />
            </button>
          </div>
        </>
      )}

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default AuditLog
