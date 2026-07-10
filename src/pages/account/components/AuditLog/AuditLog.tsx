import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardText } from 'iconsax-react'
import Table, { type Column } from '@/components/Table/Table'
import Dropdown from '@/components/Dropdown/Dropdown'
import Search from '@/components/Search/Search'
import Badge from '@/components/Badge/Badge'
import { auditEntries, CATEGORY_FILTER_OPTIONS, type AuditEntry } from '../../data/mockAudit'
import './AuditLog.css'

const PAGE_SIZE = 10

function formatTimestamp(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

function AuditLog() {
  const navigate = useNavigate()
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return auditEntries.filter((e) => {
      if (category !== 'all' && e.categoryKey !== category) return false
      if (!q) return true
      return [e.action, e.target, e.value, e.actor, e.actorEmail, e.category, e.role].some((f) =>
        f.toLowerCase().includes(q),
      )
    })
  }, [category, query])

  const total = filtered.length
  const pageStart = page * PAGE_SIZE
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  const columns: Column<AuditEntry>[] = [
    {
      key: 'action',
      header: 'Action',
      width: '1 1 200px',
      render: (r) => <span className="audit-action">{r.action}</span>,
    },
    { key: 'target', header: 'Target', width: '0 0 180px', render: (r) => r.target },
    {
      key: 'value',
      header: 'Value',
      width: '0 0 170px',
      render: (r) => <span className="audit-new">{r.value}</span>,
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
      key: 'category',
      header: 'Category',
      width: '0 0 165px',
      render: (r) => <Badge type="informative" label={r.category} />,
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
      {/* Filter bar — Search across all fields + Category filter */}
      <div className="audit-filters">
        <Search
          size="M"
          className="audit-search"
          value={query}
          placeholder="Search actions, targets or actors"
          ariaLabel="Search audit log"
          onChange={(v) => {
            setQuery(v)
            setPage(0)
          }}
        />
        <Dropdown
          size="sm"
          className="audit-setting-filter"
          options={CATEGORY_FILTER_OPTIONS}
          value={category}
          onChange={(v) => {
            setCategory(v)
            setPage(0)
          }}
        />
      </div>

      {total === 0 ? (
        <div className="audit-empty">
          <span className="audit-empty-icon">
            <ClipboardText size={32} color="var(--text-tertiary)" variant="Bold" />
          </span>
          <div className="audit-empty-info">
            <p className="audit-empty-title">No activity recorded</p>
            <p className="audit-empty-desc">
              {category === 'all' && !query.trim()
                ? "When someone changes a setting, passcode, enrolment or course, it'll appear here — showing who did what, and when."
                : 'No activity matches your filters. Try a different category or search.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="audit-table-wrap">
          <Table
            columns={columns}
            rows={pageRows}
            getRowKey={(r) => r.id}
            onRowClick={(r) => {
              if (r.targetKind === 'course') navigate('/your-courses/course')
            }}
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
