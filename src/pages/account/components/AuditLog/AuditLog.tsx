import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDown2, ClipboardText } from 'iconsax-react'
import Table, { type Column } from '@/components/Table/Table'
import Dropdown from '@/components/Dropdown/Dropdown'
import Badge from '@/components/Badge/Badge'
import Tooltip from '@/components/Tooltip/Tooltip'
import { auditEntries, SETTING_FILTER_OPTIONS, type AuditEntry, type AuditSurface } from '../../data/mockAudit'
import './AuditLog.css'

const PAGE_SIZE = 10

/** Filters that ship disabled at launch — same shape/position as their future enabled state. */
const DISABLED_FILTERS = ['Date range', 'Actor', 'Course', 'Surface']

const SURFACE_BADGE: Record<AuditSurface, 'informative' | 'warning' | 'in-progress'> = {
  'Settings tab': 'informative',
  'Compliance configuration': 'warning',
  System: 'in-progress',
}

function formatTimestamp(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

function DisabledFilter({ label }: { label: string }) {
  return (
    <Tooltip text="Coming soon" icon={false} position="Top">
      <div className="audit-filter audit-filter--disabled" aria-disabled="true">
        <span className="audit-filter-label">{label}</span>
        <ArrowDown2 size={16} color="var(--text-disabled)" variant="Linear" />
      </div>
    </Tooltip>
  )
}

function AuditLog() {
  const navigate = useNavigate()
  const [setting, setSetting] = useState('all')
  const [page, setPage] = useState(0)

  const filtered = useMemo(
    () => (setting === 'all' ? auditEntries : auditEntries.filter((e) => e.settingKey === setting)),
    [setting],
  )

  const total = filtered.length
  const pageStart = page * PAGE_SIZE
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  const columns: Column<AuditEntry>[] = [
    {
      key: 'course',
      header: 'Course',
      width: '1 1 170px',
      render: (r) => <span className="audit-course">{r.course}</span>,
    },
    { key: 'setting', header: 'Setting', width: '0 0 175px', render: (r) => r.setting },
    {
      key: 'previous',
      header: 'Previous value',
      width: '0 0 130px',
      render: (r) => <span className="audit-prev">{r.previousValue}</span>,
    },
    {
      key: 'new',
      header: 'New value',
      width: '0 0 130px',
      render: (r) => <span className="audit-new">{r.newValue}</span>,
    },
    {
      key: 'actor',
      header: 'Actor',
      width: '0 0 190px',
      render: (r) => (
        <span className="audit-actor">
          <span className="audit-actor-name">{r.actor}</span>
          <span className="audit-actor-meta">{r.actorEmail} · {r.role}</span>
        </span>
      ),
    },
    {
      key: 'surface',
      header: 'Surface',
      width: '0 0 175px',
      render: (r) => <Badge type={SURFACE_BADGE[r.surface]} label={r.surface} />,
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      width: '0 0 130px',
      render: (r) => {
        const { date, time } = formatTimestamp(r.timestamp)
        return (
          <span className="audit-time">
            <span className="audit-time-date">{date}</span>
            <span className="audit-time-clock">{time}</span>
          </span>
        )
      },
    },
  ]

  return (
    <div className="audit">
      {/* Filter bar — only Setting is interactive at launch */}
      <div className="audit-filters">
        <Dropdown
          size="sm"
          className="audit-setting-filter"
          options={SETTING_FILTER_OPTIONS}
          value={setting}
          onChange={(v) => {
            setSetting(v)
            setPage(0)
          }}
        />
        {DISABLED_FILTERS.map((label) => (
          <DisabledFilter key={label} label={label} />
        ))}
      </div>

      {total === 0 ? (
        <div className="audit-empty">
          <span className="audit-empty-icon">
            <ClipboardText size={32} color="var(--text-tertiary)" variant="Bold" />
          </span>
          <div className="audit-empty-info">
            <p className="audit-empty-title">No changes recorded</p>
            <p className="audit-empty-desc">
              {setting === 'all'
                ? "When someone changes a course setting, it'll appear here — showing who changed what, and when."
                : 'No changes have been recorded for this setting yet. Try a different setting.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="audit-table-wrap">
          <Table
            columns={columns}
            rows={pageRows}
            getRowKey={(r) => r.id}
            onRowClick={() => navigate('/your-courses/course')}
            pagination={{
              from: pageStart + 1,
              to: pageStart + pageRows.length,
              total,
              onPrev: () => setPage((p) => Math.max(0, p - 1)),
              onNext: () => setPage((p) => (pageStart + PAGE_SIZE < total ? p + 1 : p)),
            }}
          />
        </div>
      )}
    </div>
  )
}

export default AuditLog
