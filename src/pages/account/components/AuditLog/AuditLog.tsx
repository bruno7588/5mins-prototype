import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDown2, ArrowLeft2, ArrowRight2, ClipboardText, DocumentDownload } from 'iconsax-react'
import Dropdown from '@/components/Dropdown/Dropdown'
import Chip from '@/components/Chip/Chip'
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

interface AuditLogProps {
  /** When set (via the Settings-history deep link), the Course filter starts applied. */
  initialCourseId?: string
}

/** The five live filters. Each is single-select; combinable across categories. */
interface Filters {
  setting: string | null
  dateRange: string // DATE_RANGE_OPTIONS value; 'all' = unapplied
  actor: string | null
  course: string | null
  surface: string | null
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
    setting: null,
    dateRange: 'all',
    actor: null,
    course: initialCourseId ?? null,
    surface: null,
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
      if (filters.setting && !op.changes.some((c) => c.settingKey === filters.setting)) return false
      if (filters.actor && op.actor !== filters.actor) return false
      if (filters.course && op.courseId !== filters.course) return false
      if (filters.surface && op.surfaceKey !== filters.surface) return false
      if (cutoff != null && new Date(op.timestamp).getTime() < cutoff) return false
      return true
    })
  }, [filters])

  const total = filtered.length
  const pageStart = page * PAGE_SIZE
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  // Applied filters → dismissible chips. `dateRange: 'all'` is not "applied".
  const activeChips = useMemo(() => {
    const chips: { key: keyof Filters; label: string }[] = []
    if (filters.setting) {
      const label = SETTING_OPTIONS.find((o) => o.value === filters.setting)?.label ?? filters.setting
      chips.push({ key: 'setting', label })
    }
    if (filters.dateRange !== 'all') {
      const label = DATE_RANGE_OPTIONS.find((o) => o.value === filters.dateRange)?.label ?? filters.dateRange
      chips.push({ key: 'dateRange', label })
    }
    if (filters.actor) chips.push({ key: 'actor', label: filters.actor })
    if (filters.course) {
      const label = COURSE_OPTIONS.find((o) => o.value === filters.course)?.label ?? filters.course
      chips.push({ key: 'course', label })
    }
    if (filters.surface) chips.push({ key: 'surface', label: SURFACES[filters.surface as keyof typeof SURFACES] })
    return chips
  }, [filters])

  const anyApplied = activeChips.length > 0

  const clearOne = (key: keyof Filters) => patch({ [key]: key === 'dateRange' ? 'all' : null } as Partial<Filters>)
  const clearAll = () =>
    patch({ setting: null, dateRange: 'all', actor: null, course: null, surface: null })

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
            placeholder="Setting"
            options={SETTING_OPTIONS}
            onChange={(v) => patch({ setting: v })}
          />
          <Dropdown
            size="sm"
            className="audit-filter"
            placeholder="Date range"
            options={DATE_RANGE_OPTIONS.map(({ value, label }) => ({ value, label }))}
            onChange={(v) => patch({ dateRange: v })}
          />
          <Dropdown
            size="sm"
            className="audit-filter"
            placeholder="Actor"
            options={ACTOR_OPTIONS}
            onChange={(v) => patch({ actor: v })}
          />
          <Dropdown
            size="sm"
            className="audit-filter"
            placeholder="Course"
            options={COURSE_OPTIONS}
            onChange={(v) => patch({ course: v })}
          />
          <Dropdown
            size="sm"
            className="audit-filter"
            placeholder="Surface"
            options={SURFACE_OPTIONS}
            onChange={(v) => patch({ surface: v })}
          />
        </div>

        <button type="button" className="audit-export" onClick={exportCsv} disabled={total === 0}>
          Export CSV
          <DocumentDownload size={16} color="currentColor" variant="Linear" />
        </button>
      </div>

      {/* ── Applied filters as dismissible chips + Clear all ── */}
      {anyApplied && (
        <div className="audit-active-filters">
          {activeChips.map((chip) => (
            <Chip
              key={chip.key}
              label={chip.label}
              iconRight
              onDismiss={() => clearOne(chip.key)}
            />
          ))}
          <button type="button" className="audit-clear-all" onClick={clearAll}>
            Clear all
          </button>
        </div>
      )}

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
          <ul className="audit-list">
            {pageRows.map((op) => {
              const { date, time } = formatTimestamp(op.timestamp)
              const isOpen = expanded.has(op.id)
              const course = courseForOp(op)
              return (
                <li key={op.id} className={`audit-row-card${isOpen ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="audit-row"
                    aria-expanded={isOpen}
                    onClick={() => toggleRow(op.id)}
                  >
                    <span className="audit-row-main">
                      <span className="audit-op">{operationLabel(op)}</span>
                      <span className="audit-op-meta">
                        {op.actor} · {op.role} · {SURFACES[op.surfaceKey]}
                      </span>
                    </span>
                    <span className="audit-row-time">
                      <span className="audit-row-date">{date}</span>
                      <span className="audit-row-clock">{time}</span>
                    </span>
                    <span className="audit-row-chevron" aria-hidden="true">
                      <ArrowDown2 size={20} color="var(--text-tertiary)" variant="Linear" />
                    </span>
                  </button>

                  <Collapse open={isOpen}>
                    <div className="audit-detail">
                      <div className="audit-detail-course">
                        <span className="audit-detail-label">Course</span>
                        <button
                          type="button"
                          className="audit-course-link"
                          onClick={openCourse}
                        >
                          {course.name}
                          <ArrowRight2 size={16} color="currentColor" variant="Linear" />
                        </button>
                      </div>
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
                  </Collapse>
                </li>
              )
            })}
          </ul>

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
