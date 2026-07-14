import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDown2, ArrowLeft2, ArrowRight2, ClipboardText, DocumentDownload } from 'iconsax-react'
import Dropdown from '@/components/Dropdown/Dropdown'
import Collapse from '@/components/Collapse/Collapse'
import {
  auditOperations,
  operationLabel,
  courseForOp,
  SETTING_OPTIONS,
  ACTOR_OPTIONS,
  COURSE_OPTIONS,
  SURFACE_OPTIONS,
  DATE_RANGE_OPTIONS,
  SURFACES,
  type AuditValue,
} from '../../data/mockAudit'
import './AuditLog.css'

const PAGE_SIZE = 10

// Each filter defaults to an "All …" option that doubles as the clear action;
// the current selection lives in the dropdown trigger (no applied-filter chips).
const ALL = 'all'
const SETTING_FILTER_OPTIONS = [{ value: ALL, label: 'All settings' }, ...SETTING_OPTIONS]
const ACTOR_FILTER_OPTIONS = [{ value: ALL, label: 'All actors' }, ...ACTOR_OPTIONS]
const COURSE_FILTER_OPTIONS = [{ value: ALL, label: 'All courses' }, ...COURSE_OPTIONS]
const SURFACE_FILTER_OPTIONS = [{ value: ALL, label: 'All surfaces' }, ...SURFACE_OPTIONS]

interface AuditLogProps {
  /** When set (via the Settings-history deep link), the Course filter starts applied. */
  initialCourseId?: string
}

/** The five live filters. Each is single-select; 'all' = unfiltered. Combinable. */
interface Filters {
  setting: string
  dateRange: string
  actor: string
  course: string
  surface: string
}

function formatTimestamp(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
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
    setting: ALL,
    dateRange: ALL,
    actor: ALL,
    course: initialCourseId ?? ALL,
    surface: ALL,
  })
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)

  // Any filter change resets to the first page so results stay in view.
  const patch = (next: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...next }))
    setPage(0)
  }

  const filtered = useMemo(() => {
    const rangeOpt = DATE_RANGE_OPTIONS.find((o) => o.value === filters.dateRange)
    const cutoff = rangeOpt?.days != null ? Date.now() - rangeOpt.days * 86_400_000 : null

    return auditOperations.filter((op) => {
      if (filters.setting !== ALL && !op.changes.some((c) => c.settingKey === filters.setting)) return false
      if (filters.actor !== ALL && op.actor !== filters.actor) return false
      if (filters.course !== ALL && op.courseId !== filters.course) return false
      if (filters.surface !== ALL && op.surfaceKey !== filters.surface) return false
      if (cutoff != null && new Date(op.timestamp).getTime() < cutoff) return false
      return true
    })
  }, [filters])

  const anyApplied =
    filters.setting !== ALL ||
    filters.dateRange !== ALL ||
    filters.actor !== ALL ||
    filters.course !== ALL ||
    filters.surface !== ALL

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
  const exportCsv = () => {
    const header = ['Timestamp', 'Operation', 'Actor', 'Role at the time', 'Surface', 'Course', 'Setting', 'New value']
    const lines = [header.map(csvCell).join(',')]
    filtered.forEach((op) => {
      const label = operationLabel(op)
      const course = courseForOp(op).name
      op.changes.forEach((c) => {
        lines.push(
          [
            new Date(op.timestamp).toISOString(),
            label,
            op.actor,
            op.role,
            SURFACES[op.surfaceKey],
            course,
            c.setting,
            valueToPlain(c.value),
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
  }

  return (
    <div className="audit">
      {/* ── Toolbar: five live filters (left) + CSV export (right) ── */}
      <div className="audit-toolbar">
        <div className="audit-filters">
          <Dropdown
            size="sm"
            className="audit-filter"
            options={SETTING_FILTER_OPTIONS}
            value={filters.setting}
            onChange={(v) => patch({ setting: v })}
          />
          <Dropdown
            size="sm"
            className="audit-filter"
            options={DATE_RANGE_OPTIONS.map(({ value, label }) => ({ value, label }))}
            value={filters.dateRange}
            onChange={(v) => patch({ dateRange: v })}
          />
          <Dropdown
            size="sm"
            className="audit-filter"
            options={ACTOR_FILTER_OPTIONS}
            value={filters.actor}
            onChange={(v) => patch({ actor: v })}
          />
          <Dropdown
            size="sm"
            className="audit-filter"
            options={COURSE_FILTER_OPTIONS}
            value={filters.course}
            onChange={(v) => patch({ course: v })}
          />
          <Dropdown
            size="sm"
            className="audit-filter"
            options={SURFACE_FILTER_OPTIONS}
            value={filters.surface}
            onChange={(v) => patch({ surface: v })}
          />
        </div>

        <button type="button" className="audit-export" onClick={exportCsv} disabled={total === 0}>
          Export CSV
          <DocumentDownload size={16} color="currentColor" variant="Linear" />
        </button>
      </div>

      {total === 0 ? (
        <div className="audit-empty">
          <span className="audit-empty-icon">
            <ClipboardText size={32} color="var(--text-tertiary)" variant="Bold" />
          </span>
          <div className="audit-empty-info">
            <p className="audit-empty-title">No changes recorded</p>
            <p className="audit-empty-desc">
              {anyApplied
                ? 'No activity matches your filters. Try clearing a filter to widen the results.'
                : "When someone changes a course's settings, it'll appear here — showing what changed, who did it, and when."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="audit-table">
            {/* Borderless header, column labels mirror the five filters (table.md) */}
            <div className="audit-thead" role="row">
              <span className="audit-th audit-col-setting">Setting</span>
              <span className="audit-th audit-col-date">Date range</span>
              <span className="audit-th audit-col-actor">Actor</span>
              <span className="audit-th audit-col-course">Course</span>
              <span className="audit-th audit-col-surface">Surface</span>
              <span className="audit-th audit-col-expand" aria-hidden="true" />
            </div>

            <ul className="audit-list">
              {pageRows.map((op) => {
                const { date, time } = formatTimestamp(op.timestamp)
                const isOpen = expanded.has(op.id)
                const course = courseForOp(op)
                const settingSummary =
                  op.changes.length === 1 ? op.changes[0].setting : `${op.changes.length} settings`
                return (
                  <li key={op.id} className={`audit-row-card${isOpen ? ' is-open' : ''}`}>
                    <button
                      type="button"
                      className="audit-row"
                      aria-expanded={isOpen}
                      onClick={() => toggleRow(op.id)}
                    >
                      <span className="audit-cell audit-col-setting">
                        <span className="audit-op">{settingSummary}</span>
                      </span>
                      <span className="audit-cell audit-col-date">
                        <span className="audit-row-date">{date}</span>
                        <span className="audit-row-clock">{time}</span>
                      </span>
                      <span className="audit-cell audit-col-actor">
                        <span className="audit-actor-name">{op.actor}</span>
                        <span className="audit-actor-meta">{op.role}</span>
                      </span>
                      <span className="audit-cell audit-col-course">{course.name}</span>
                      <span className="audit-cell audit-col-surface">{SURFACES[op.surfaceKey]}</span>
                      <span className="audit-cell audit-col-expand audit-row-chevron" aria-hidden="true">
                        <ArrowDown2 size={20} color="var(--text-tertiary)" variant="Linear" />
                      </span>
                    </button>

                    <Collapse open={isOpen}>
                      <div className="audit-detail">
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
                        <button type="button" className="audit-course-link" onClick={openCourse}>
                          View course settings
                          <ArrowRight2 size={16} color="currentColor" variant="Linear" />
                        </button>
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
    </div>
  )
}

export default AuditLog
