import type { ReactNode } from 'react'
import Table, { type Column } from '@/components/Table/Table'
import Badge from '@/components/Badge/Badge'
import Search from '@/components/Search/Search'
import type { ProtoLearner } from './data'

/* The Enrolments tab toolbar + table around the piece being judged, so each
   variant is seen at full size in its real surroundings. */
const columns: Column<ProtoLearner>[] = [
  {
    key: 'name',
    header: 'Name',
    width: '1 1 280px',
    render: (row) => (
      <span className="tbl-stack">
        <span className="cd-learner-name-row">
          <span className="cd-learner-name">{row.name}</span>
          {row.deactivated && <Badge type="error" label="Deactivated" />}
        </span>
        <span className="cd-learner-email">{row.email}</span>
      </span>
    ),
  },
  { key: 'status', header: 'Status', width: '0 0 150px', render: (row) => row.status },
  { key: 'completionDate', header: 'Completion date', width: '0 0 166px', render: (row) => row.completionDate ?? '—' },
]

export default function EnrolmentsFrame({ actions, rows }: { actions: ReactNode; rows: ProtoLearner[] }) {
  return (
    <section className="cd-enrolments">
      <div className="cd-actions">
        <div className="cd-select-info">
          <span className="cd-select-count">0/128 selected</span>
        </div>
        <Search size="M" value="" onChange={() => {}} placeholder="Search for learners" ariaLabel="Search for learners" className="cd-search" />
        {actions}
      </div>
      <Table columns={columns} rows={rows} getRowKey={(row) => String(row.id)} pagination={{ from: 1, to: rows.length, total: 128 }} />
    </section>
  )
}
