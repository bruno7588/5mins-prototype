import { useMemo, useRef, useState } from 'react'
import { DocumentDownload, ImportCurve } from 'iconsax-react'
import Button from '@/components/Button/Button'
import Chip from '@/components/Chip/Chip'
import CloseButton from '@/components/CloseButton/CloseButton'
import Collapse from '@/components/Collapse/Collapse'
import FileUploader from '@/components/FileUploader/FileUploader'
import Table, { type Column } from '@/components/Table/Table'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
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

/* Bulk upload courses (PRD 1.7), on the same three-step side drawer as Bulk upload
   of trainings. The prototype doesn't parse the file: any CSV previews the same demo
   rows, checked against the current list, so a second upload finds everything there. */

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

/** The template's example rows, shown under Preview and written into the download. */
const TEMPLATE_ROWS: CsvRow[] = [
  { line: 2, name: 'First Aid at Work', providers: ['St John Ambulance', 'Red Cross Training'], duration: 3, unit: 'days', retraining: 36 },
  { line: 3, name: 'NEBOSH General Certificate', providers: ['NEBOSH'], duration: 10, unit: 'days', retraining: null },
]
const TEMPLATE =
  'Course name,Providers,Duration,Duration unit,Retraining every (months)\n' +
  TEMPLATE_ROWS.map((r) => `${r.name},${r.providers.join(';')},${r.duration},${r.unit},${r.retraining ?? ''}`).join('\n') +
  '\n'

type Status = 'ready' | 'exists' | 'error'
interface Checked extends CsvRow {
  status: Status
  reason: string
}

function download(name: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

const templateColumns: Column<CsvRow>[] = [
  { key: 'name', header: 'Course name', width: '1 0 160px', render: (r) => r.name },
  { key: 'providers', header: 'Providers', width: '1 0 160px', render: (r) => r.providers.join(';') },
  { key: 'duration', header: 'Duration', width: '0 0 88px', render: (r) => r.duration },
  { key: 'unit', header: 'Duration unit', width: '0 0 120px', render: (r) => r.unit },
  { key: 'retraining', header: 'Retraining every', width: '0 0 136px', render: (r) => r.retraining ?? '' },
]

interface Props {
  onClose: () => void
  onAdded: (count: number) => void
}

function BulkUploadCoursesDrawer({ onClose, onAdded }: Props) {
  const { courses } = useExternalTraining()
  const panelRef = useRef<HTMLElement>(null)
  useOverlayA11y(panelRef, true)
  const [fileName, setFileName] = useState<string | null>(null)
  const [filter, setFilter] = useState<Status>('ready')
  const [preview, setPreview] = useState(false)

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

  const commit = () => {
    const newNames = [...new Set(ready.flatMap((r) => r.providers))].filter((n) => !duplicateProvider(n))
    const created: ExternalProvider[] = newNames.map((name) => ({ id: newId('p'), name, archived: false }))
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
      width: '1 0 160px',
      render: (r) =>
        r.reason ? (
          <span className="tbl-stack">
            <span className="primary">{r.name}</span>
            <span className={`supporting${r.status === 'error' ? ' aet-error-text' : ''}`}>
              {r.status === 'error' ? `Row ${r.line}: ${r.reason}` : r.reason}
            </span>
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
        r.providers.length ? (
          <span className="tbl-stack">
            {r.providers.map((p) => (
              <span key={p} className="primary">
                {duplicateProvider(p) ? p : `${p} (new)`}
              </span>
            ))}
          </span>
        ) : (
          '–'
        ),
    },
    { key: 'duration', header: 'Duration', width: '0 0 88px', render: (r) => (r.duration ? durationLabel({ value: r.duration, unit: r.unit }) : '–') },
    { key: 'retraining', header: 'Retraining', width: '0 0 136px', render: (r) => retrainingLabel(r.retraining) },
  ]

  const ctaLabel = !fileName ? 'Add Courses' : ready.length === 1 ? 'Add 1 Course' : `Add ${ready.length} Courses`

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        tabIndex={-1}
        className="side-drawer aet-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aet-bulk-title"
      >
        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <div className="aet-drawer__heading">
              <h2 id="aet-bulk-title" className="aet-drawer__title">Bulk upload courses</h2>
              <p className="aet-text">Add your approved external courses in one go, with their providers and retraining rules.</p>
            </div>
            <CloseButton onClick={onClose} />
          </div>
          <div className="modal__divider" />
        </div>

        <div className="side-drawer__content">
          <ol className="aet-steps">
            <li className="aet-step">
              <span className="aet-step__num" aria-hidden="true">1</span>
              <div className="aet-step__body">
                <h3 className="aet-step__title">Use our template</h3>
                <p className="aet-text">
                  Download our CSV file and fill it in following the template.{' '}
                  <Button variant="link" onClick={() => setPreview((p) => !p)} aria-expanded={preview}>
                    {preview ? 'Hide Preview' : 'Preview'}
                  </Button>
                </p>
                <Collapse open={preview}>
                  <div className="aet-step__preview">
                    <Table columns={templateColumns} rows={TEMPLATE_ROWS} getRowKey={(r) => String(r.line)} />
                  </div>
                </Collapse>
                <div>
                  <Button
                    variant="text"
                    trailingIcon={<ImportCurve size={20} color="currentColor" variant="Linear" />}
                    onClick={() => download('approved-courses-template.csv', TEMPLATE)}
                  >
                    Download CSV Template
                  </Button>
                </div>
              </div>
            </li>

            <li className="aet-step">
              <span className="aet-step__num" aria-hidden="true">2</span>
              <div className="aet-step__body">
                <h3 className="aet-step__title">Fill in the information</h3>
                <p className="aet-text">
                  Use one row for each course and put each detail in its own cell. Separate several providers with
                  ";". Leave Retraining every blank for courses with no retraining.
                </p>
              </div>
            </li>

            <li className="aet-step">
              <span className="aet-step__num" aria-hidden="true">3</span>
              <div className="aet-step__body">
                <h3 className="aet-step__title">Upload CSV file</h3>
                <FileUploader
                  size="L"
                  accept=".csv"
                  state={fileName ? 'Filled' : undefined}
                  fileName={fileName ?? undefined}
                  helpText="Drag and drop CSV file here or click to upload"
                  onFileSelect={(f) => {
                    setFileName(f.name)
                    // Open on the first chip with rows, so a re-upload lands on "Already in your list".
                    setFilter((['ready', 'exists', 'error'] as Status[]).find((s) => count(s) > 0) ?? 'ready')
                  }}
                  onChangeFile={() => setFileName(null)}
                />
              </div>
            </li>
          </ol>

          <Collapse open={!!fileName}>
            <div className="aet-review">
              <div className="aet-step__body">
                <h3 className="aet-step__title">Review</h3>
                <p className="aet-text">
                  Courses already in your list are skipped and never overwritten. New providers in the file are added
                  too.
                </p>
              </div>
              <div className="aet-chips" role="group" aria-label="Filter rows">
                <Chip label={`Ready to add (${count('ready')})`} selected={filter === 'ready'} onClick={() => setFilter('ready')} />
                <Chip label={`Already in your list (${count('exists')})`} selected={filter === 'exists'} onClick={() => setFilter('exists')} />
                <Chip label={`Errors (${count('error')})`} variant="warning" selected={filter === 'error'} onClick={() => setFilter('error')} />
              </div>
              {filter === 'error' && count('error') > 0 && (
                <div>
                  <Button
                    variant="text"
                    icon={<DocumentDownload size={20} color="currentColor" variant="Linear" />}
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
              <Table columns={columns} rows={rows.filter((r) => r.status === filter)} getRowKey={(r) => String(r.line)} />
            </div>
          </Collapse>
        </div>

        <div className="side-drawer__footer">
          <div className="side-drawer__footer-divider" />
          <div className="side-drawer__buttons">
            <Button disabled={!fileName || ready.length === 0} onClick={commit}>
              {ctaLabel}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default BulkUploadCoursesDrawer
