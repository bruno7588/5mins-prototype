import { Edit2, Trash } from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import RowActionsMenu from '@/components/RowActionsMenu/RowActionsMenu'
import Table, { type Column } from '@/components/Table/Table'
import {
  dueState,
  formatDay,
  personById,
  recordDurationLabel,
  recordProviderName,
  recordTrainingName,
  supersededBy,
  type ExternalRecord,
} from '@/data/externalTraining'

/* One records table for every place external training is listed: Learning Records
   (admin), the person profile tab (admin, manager, learner) and My Team (manager).
   The viewer decides the columns and whether rows have actions. */

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
  if (!record.retrainingDueDate) return <span className="lret-dash">–</span>
  const renewed = supersededBy(record, all)
  const state = dueState(record, all)
  return (
    <span className="tbl-stack">
      <span className="primary lret-due">
        {formatDay(record.retrainingDueDate)}
        {state === 'overdue' && <Badge type="error" label="Overdue" />}
        {state === 'due-soon' && <Badge type="warning" label="Due soon" />}
      </span>
      {renewed && <span className="supporting">Renewed {formatDay(renewed.completionDate)}</span>}
    </span>
  )
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
}

function ExternalRecordsTable({ rows, all, showLearner = true, showDuration = true, onEdit, onDelete }: Props) {
  const columns: Column<ExternalRecord>[] = [
    ...(showLearner
      ? [
          {
            key: 'learner',
            header: 'Learner',
            width: '1 0 200px',
            render: (r: ExternalRecord) => {
              const p = personById(r.personId)
              return (
                <span className="tbl-stack">
                  <span className="primary">{p?.name ?? 'Unknown'}</span>
                  <span className="supporting">{p?.invited ? 'Invited' : p?.email}</span>
                </span>
              )
            },
          },
        ]
      : []),
    {
      key: 'course',
      header: 'Course',
      width: '1 0 200px',
      render: (r) => (
        <span className="lret-course">
          <span>{recordTrainingName(r)}</span>
          {!r.courseId && <Badge type="informative" icon={false} label="One-off" />}
        </span>
      ),
    },
    { key: 'provider', header: 'Provider', width: '1 0 160px', render: (r) => recordProviderName(r) || <span className="lret-dash">–</span> },
    { key: 'completion', header: 'Completion date', width: '0 0 136px', render: (r) => formatDay(r.completionDate) },
    { key: 'due', header: 'Retraining due', width: '0 0 200px', render: (r) => <RetrainingDueCell record={r} all={all} /> },
    ...(showDuration
      ? [{ key: 'duration', header: 'Duration', width: '0 0 96px', render: (r: ExternalRecord) => recordDurationLabel(r) || <span className="lret-dash">–</span> }]
      : []),
    {
      key: 'result',
      header: 'Result',
      width: '0 0 120px',
      render: (r) => (
        <span className="tbl-stack">
          <span className="primary">
            <Badge type={r.result === 'Passed' ? 'success' : 'error'} icon={false} label={r.result} />
          </span>
          {r.score != null && <span className="supporting">Score {r.score}%</span>}
        </span>
      ),
    },
    {
      key: 'certificate',
      header: 'Certificate',
      width: '0 0 128px',
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
