import { Link } from 'react-router-dom'
import { Edit2, Trash } from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import RowActionsMenu from '@/components/RowActionsMenu/RowActionsMenu'
import Table, { type Column } from '@/components/Table/Table'
import {
  formatDay,
  personById,
  recordDurationLabel,
  recordProviderName,
  recordTrainingName,
  type ExternalRecord,
} from '@/data/externalTraining'

/* One records table for every place external training is listed: Learning Records
   (admin), the person profile tab (admin, manager, learner) and My Team (manager).
   The viewer decides the columns and whether rows have actions. */

/* DS table date (table.md): "Sep 12," over the year in tertiary, as on the profile's Course Progress. */
export function DateCell({ iso }: { iso: string }) {
  const d = new Date(iso + 'T00:00:00')
  return (
    <span className="tbl-date">
      <span className="day">{d.toLocaleString('en-US', { month: 'short' })} {d.getDate()},</span>
      <span className="year">{d.getFullYear()}</span>
    </span>
  )
}

/** Prototype download: the certificate file isn't stored, so this saves a small stand-in. */
export function downloadCertificate(r: ExternalRecord) {
  const body = `Certificate for ${recordTrainingName(r)}\nLearner: ${personById(r.personId)?.name ?? ''}\nCompleted: ${formatDay(r.completionDate)}\n`
  const url = URL.createObjectURL(new Blob([body], { type: 'text/plain' }))
  const a = document.createElement('a')
  a.href = url
  a.download = r.certificate ?? 'certificate.txt'
  a.click()
  URL.revokeObjectURL(url)
}

export function RetrainingDueCell({ record, all }: { record: ExternalRecord; all: ExternalRecord[] }) {
  /* Plain date, no Overdue / Due badge (Divjot, 2026-11-12): a status on every row
     reads wrong once a record has been renewed. `all` stays for callers. */
  void all
  if (!record.retrainingDueDate) return <span className="lret-dash">–</span>
  return <DateCell iso={record.retrainingDueDate} />
}

interface Props {
  rows: ExternalRecord[]
  /** Every record, so supersede and due states see the whole history. */
  all: ExternalRecord[]
  showLearner?: boolean
  showDuration?: boolean
  /** Omit for a read-only table (managers, learners). */
  onEdit?: (r: ExternalRecord) => void
  onDelete?: (r: ExternalRecord) => void
  /** Link each learner to their profile (External Training tab); null for no link. */
  learnerHref?: (personId: string) => string | null
}

function ExternalRecordsTable({ rows, all, showLearner = true, showDuration = true, onEdit, onDelete, learnerHref }: Props) {
  const columns: Column<ExternalRecord>[] = [
    /* Widths add up to about 1200px (the pinned learner column is 240px at least) with Duration hidden, so the admin list fits a 1536px screen; below
       that the table scrolls, with the learner pinned and a visible scrollbar. Long
       text truncates with the full value on hover. */
    ...(showLearner
      ? [
          {
            key: 'learner',
            header: 'Learner',
            width: '0 0 240px',
            cellClassName: learnerHref ? 'is-link lret-learner-cell' : undefined,
            render: (r: ExternalRecord) => {
              const p = personById(r.personId)
              const href = learnerHref?.(r.personId) ?? null
              const name = <span className="primary" title={p?.name}>{p?.name ?? 'Unknown'}</span>
              return (
                <span className="tbl-stack">
                  {href ? (
                    // Opens the person's profile on the External Training tab.
                    <Link to={href} className="lret-learner-link">
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                  <span className="supporting" title={p?.email}>{p?.invited ? 'Invited' : p?.email}</span>
                </span>
              )
            },
          },
        ]
      : []),
    {
      key: 'course',
      header: 'Course',
      width: '1 0 152px',
      cellClassName: 'lret-contain',
      render: (r) => <span className="lret-ellipsis" title={recordTrainingName(r)}>{recordTrainingName(r)}</span>,
    },
    {
      key: 'provider',
      header: 'Provider',
      width: '1 0 124px',
      cellClassName: 'lret-contain',
      render: (r) =>
        recordProviderName(r) ? (
          <span className="lret-ellipsis" title={recordProviderName(r)}>{recordProviderName(r)}</span>
        ) : (
          <span className="lret-dash">–</span>
        ),
    },
    { key: 'completion', header: 'Completion date', width: '0 0 136px', render: (r) => <DateCell iso={r.completionDate} /> },
    { key: 'due', header: 'Expiry', width: '0 0 136px', render: (r) => <RetrainingDueCell record={r} all={all} /> },
    ...(showDuration
      ? [{ key: 'duration', header: 'Duration', width: '0 0 88px', render: (r: ExternalRecord) => recordDurationLabel(r) || <span className="lret-dash">–</span> }]
      : []),
    {
      key: 'score',
      header: 'Score',
      width: '0 0 64px',
      align: 'center',
      render: (r) => (r.score != null ? `${r.score}%` : <span className="lret-dash">–</span>),
    },
    {
      key: 'result',
      header: 'Result',
      width: '0 0 128px',
      render: (r) => <Badge type={r.result === 'Passed' ? 'success' : 'error'} icon={false} label={r.result} />,
    },
    {
      key: 'certificate',
      header: 'Certificate',
      width: '0 0 120px',
      render: (r) =>
        r.certificate ? (
          <Button size="sm" variant="outlined" onClick={() => downloadCertificate(r)}>
            Download
          </Button>
        ) : (
          <span className="lret-dash">–</span>
        ),
    },
    ...(onEdit || onDelete
      ? [
          {
            key: 'actions',
            header: '',
            width: '0 0 56px',
            align: 'center' as const,
            cellClassName: 'is-overflow',
            render: (r: ExternalRecord) => (
              <RowActionsMenu
                ariaLabel={`Actions for ${recordTrainingName(r)}`}
                items={[
                  { key: 'edit', label: 'Edit', icon: <Edit2 size={20} color="var(--text-primary)" variant="Linear" /> },
                  { key: 'delete', label: 'Delete', icon: <Trash size={20} color="currentColor" variant="Linear" />, danger: true },
                ]}
                onSelect={(key) => (key === 'edit' ? onEdit?.(r) : onDelete?.(r))}
              />
            ),
          },
        ]
      : []),
  ]

  return <Table columns={columns} rows={rows} getRowKey={(r) => r.id} />
}

export default ExternalRecordsTable
