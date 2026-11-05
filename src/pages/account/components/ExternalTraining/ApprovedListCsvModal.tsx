import { useEffect, useMemo, useState } from 'react'
import { DocumentDownload, ImportCurve } from 'iconsax-react'
import Button from '@/components/Button/Button'
import Chip from '@/components/Chip/Chip'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import FileUploader from '@/components/FileUploader/FileUploader'
import Table, { type Column } from '@/components/Table/Table'
import {
  addCourses,
  duplicateProvider,
  durationLabel,
  newId,
  retrainingLabel,
  useExternalTraining,
  type DurationUnit,
  type ExternalCourse,
  type ExternalProvider,
} from '@/data/externalTraining'

/* Approved list CSV (PRD 1.7). The prototype doesn't parse the file: any CSV
   previews the same demo rows, checked against the current list, so uploading it
   a second time finds everything already there. */

interface CsvRow {
  line: number
  name: string
  providers: string[]
  duration: number | null
  unit: DurationUnit
  retraining: number | null
}

const DEMO_ROWS: CsvRow[] = [
  { line: 2, name: 'First Aid at Work', providers: ['St John Ambulance'], duration: 3, unit: 'days', retraining: 36 },
  { line: 3, name: 'Manual Handling', providers: ['SafeWork Training'], duration: 3, unit: 'hours', retraining: 36 },
  { line: 4, name: 'Working at Height', providers: ['Height Safety Ltd'], duration: 1, unit: 'days', retraining: 24 },
  { line: 5, name: 'Food Hygiene Level 3', providers: ['Highfield Qualifications'], duration: 2, unit: 'days', retraining: 36 },
  { line: 6, name: 'COSHH Awareness', providers: ['Highfield Qualifications', 'SafeWork Training'], duration: 2, unit: 'hours', retraining: 12 },
  { line: 7, name: 'Fire Marshal', providers: ['SafeWork Training'], duration: 4, unit: 'hours', retraining: 12 },
  { line: 8, name: 'Legionella Awareness', providers: [], duration: 2, unit: 'hours', retraining: 24 },
  { line: 9, name: 'Asbestos Awareness', providers: ['SafeWork Training'], duration: null, unit: 'hours', retraining: 12 },
]

type Status = 'ready' | 'exists' | 'error'
type Filter = Status
interface Checked extends CsvRow {
  status: Status
  reason: string
}

const TEMPLATE = 'Course name,Providers,Duration,Duration unit,Retraining every (months)\nFirst Aid at Work,St John Ambulance;Red Cross Training,3,days,36\n'

function download(name: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

interface Props {
  open: boolean
  onClose: () => void
  onAdded: (count: number) => void
}

function ApprovedListCsvModal({ open, onClose, onAdded }: Props) {
  const { courses } = useExternalTraining()
  const [fileName, setFileName] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('ready')

  useEffect(() => {
    if (open) {
      setFileName(null)
      setFilter('ready')
    }
  }, [open])

  const rows: Checked[] = useMemo(
    () =>
      DEMO_ROWS.map((r) => {
        if (!r.providers.length) return { ...r, status: 'error', reason: 'Add at least one provider' }
        if (!r.duration) return { ...r, status: 'error', reason: 'Add a duration' }
        const exists = courses.some((c) => c.name.trim().toLowerCase() === r.name.trim().toLowerCase())
        return exists
          ? { ...r, status: 'exists', reason: 'Already in your list. Skipped, not overwritten.' }
          : { ...r, status: 'ready', reason: '' }
      }),
    [courses],
  )
  const count = (s: Status) => rows.filter((r) => r.status === s).length
  const ready = rows.filter((r) => r.status === 'ready')
  const newProviderNames = [...new Set(ready.flatMap((r) => r.providers))].filter((n) => !duplicateProvider(n))

  const commit = () => {
    const created: ExternalProvider[] = newProviderNames.map((name) => ({ id: newId('p'), name, archived: false }))
    const idFor = (name: string) => duplicateProvider(name)?.id ?? created.find((p) => p.name === name)!.id
    const added: ExternalCourse[] = ready.map((r) => ({
      id: newId('c'),
      name: r.name,
      providerIds: r.providers.map(idFor),
      duration: { value: r.duration!, unit: r.unit },
      retrainingMonths: r.retraining,
      otherNames: [],
      archived: false,
    }))
    addCourses(added, created)
    onAdded(added.length)
  }

  const columns: Column<Checked>[] = [
    {
      key: 'name',
      header: 'Course',
      width: '1 0 180px',
      render: (r) =>
        r.reason ? (
          <span className="tbl-stack">
            <span className="primary">{r.name}</span>
            <span className={`supporting${r.status === 'error' ? ' aet-error-text' : ''}`}>{r.status === 'error' ? `Row ${r.line}: ${r.reason}` : r.reason}</span>
          </span>
        ) : (
          r.name
        ),
    },
    {
      key: 'providers',
      header: 'Providers',
      width: '1 0 160px',
      render: (r) =>
        r.providers.length
          ? <span className="tbl-stack">{r.providers.map((p) => <span key={p} className="primary">{duplicateProvider(p) ? p : `${p} (new)`}</span>)}</span>
          : '–',
    },
    { key: 'duration', header: 'Duration', width: '0 0 96px', render: (r) => (r.duration ? durationLabel({ value: r.duration, unit: r.unit }) : '–') },
    { key: 'retraining', header: 'Retraining', width: '0 0 140px', render: (r) => retrainingLabel(r.retraining) },
  ]

  return (
    <ConfirmModal open={open} onClose={onClose} closable className="aet-modal aet-modal--wide" ariaLabel="Upload approved courses">
      <div className="confirm-modal-header">
        <h2 className="confirm-modal-title">{fileName ? 'Review CSV file' : 'Upload approved courses'}</h2>
        <p className="aet-text">
          {fileName
            ? 'Courses already in your list are skipped and never overwritten. New providers in the file are added too.'
            : 'Columns: Course name, Providers (separated by ";"), Duration, Duration unit, Retraining every (months, blank for No retraining).'}
        </p>
      </div>

      {!fileName ? (
        <div className="aet-modal__form">
          <div>
            <Button
              variant="outlined-2"
              icon={<ImportCurve size={20} color="currentColor" variant="Linear" />}
              onClick={() => download('approved-courses-template.csv', TEMPLATE)}
            >
              Download Template
            </Button>
          </div>
          <FileUploader size="L" accept=".csv" helpText="Drag and drop your CSV here or click to upload" onFileSelect={(f) => {
            setFileName(f.name)
            // Open on the first chip with rows, so a re-upload lands on "Already in your list".
            setFilter((['ready', 'exists', 'error'] as Status[]).find((s) => count(s) > 0) ?? 'ready')
          }} />
        </div>
      ) : (
        <div className="aet-modal__form">
          <div className="aet-chips" role="group" aria-label="Filter rows">
            <Chip label={`Ready to add (${count('ready')})`} selected={filter === 'ready'} onClick={() => setFilter('ready')} />
            <Chip label={`Already in your list (${count('exists')})`} selected={filter === 'exists'} onClick={() => setFilter('exists')} />
            <Chip label={`Errors (${count('error')})`} variant="warning" selected={filter === 'error'} onClick={() => setFilter('error')} />
          </div>
          {filter === 'error' && count('error') > 0 && (
            <div>
              <Button
                variant="text"
                size="sm"
                icon={<DocumentDownload size={16} color="currentColor" variant="Linear" />}
                onClick={() =>
                  download(
                    'approved-courses-errors.csv',
                    'Row,Course name,Error\n' +
                      rows.filter((r) => r.status === 'error').map((r) => `${r.line},${r.name},${r.reason}`).join('\n'),
                  )
                }
              >
                Download Error File
              </Button>
            </div>
          )}
          <div className="aet-modal__table">
            <Table columns={columns} rows={rows.filter((r) => r.status === filter)} getRowKey={(r) => String(r.line)} />
          </div>
          <div className="aet-modal__actions">
            <Button variant="outlined-2" onClick={() => setFileName(null)}>
              Change File
            </Button>
            <Button disabled={ready.length === 0} onClick={commit}>
              {ready.length === 1 ? 'Add 1 Course' : `Add ${ready.length} Courses`}
            </Button>
          </div>
        </div>
      )}
    </ConfirmModal>
  )
}

export default ApprovedListCsvModal
