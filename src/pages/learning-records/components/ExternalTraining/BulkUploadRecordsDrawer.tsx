import { useMemo, useRef, useState } from 'react'
import { DocumentDownload, ImportCurve } from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import Chip from '@/components/Chip/Chip'
import CloseButton from '@/components/CloseButton/CloseButton'
import Collapse from '@/components/Collapse/Collapse'
import Dropdown from '@/components/Dropdown/Dropdown'
import FileUploader from '@/components/FileUploader/FileUploader'
import ZipIcon from '@/components/icons/ZipIcon'
import Table, { type Column } from '@/components/Table/Table'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import '@/pages/account/components/ExternalTraining/ExternalTraining.css'
import {
  TRAINING_PEOPLE,
  addOtherName,
  addRecords,
  formatDay,
  matchCourse,
  newId,
  retrainingDueDate,
  useExternalTraining,
  type ExternalRecord,
  type ExternalResult,
} from '@/data/externalTraining'
import './ExternalTraining.css'

/* Bulk upload of trainings (PRD 2.10 and 2.11), on the three-step drawer Bruno
   shared. The prototype doesn't parse files: any CSV previews the demo rows below,
   and a zip "contains" the certificate file names the rows mention; loose PDF or
   image files match a row by their own name.

   Names that aren't on the approved list are matched once inside the upload (D15);
   the choice is remembered on the course, so the same file matches on its own next
   time. Rows already in 5Mins (same person, course and completion date) are skipped. */

interface CsvRow {
  line: number
  email: string
  course: string
  provider: string
  date: string
  result: ExternalResult
  score: number | null
  certificate: string | null
}

const DEMO_ROWS: CsvRow[] = [
  { line: 2, email: 'michael.thompson@email.com', course: 'First Aid at Work', provider: 'St John Ambulance', date: '2026-09-12', result: 'Passed', score: 90, certificate: 'thompson-first-aid.pdf' },
  { line: 3, email: 'jessica.hart@email.com', course: 'Fire Marshal', provider: 'SafeWork Training', date: '2026-08-01', result: 'Passed', score: null, certificate: 'hart-fire-marshal.pdf' },
  { line: 4, email: 'david.johnson@email.com', course: 'Forklift CB 3 day', provider: 'RTITB', date: '2026-07-20', result: 'Passed', score: 85, certificate: 'johnson-forklift.jpg' },
  { line: 5, email: 'noah.williams@email.com', course: 'Forklift CB 3 day', provider: 'RTITB', date: '2026-07-21', result: 'Passed', score: 92, certificate: null },
  { line: 6, email: 'mei.tanaka@email.com', course: 'Food Hyg L2', provider: 'Highfield Qualifications', date: '2026-06-02', result: 'Passed', score: null, certificate: null },
  { line: 7, email: 'anthonny@example.com', course: 'First Aid at Work', provider: 'Red Cross Training', date: '2026-10-14', result: 'Passed', score: 92, certificate: 'first-aid-renewal-wallace.pdf' },
  { line: 8, email: 'unknown.person@email.com', course: 'Fire Marshal', provider: 'SafeWork Training', date: '2026-08-03', result: 'Passed', score: null, certificate: null },
  { line: 9, email: 'brenda@email.com', course: '', provider: 'Highfield Qualifications', date: '2026-05-10', result: 'Passed', score: null, certificate: null },
]

const TEMPLATE =
  'Email,Course name,Provider,Completion date,Result,Score,Certificate file\n' +
  'sarah.chen@email.com,First Aid at Work,St John Ambulance,2026-10-14,Passed,92,chen-first-aid.pdf\n'

/** A mapping for a name that isn't on the list: a course id, 'one-off' or 'skip'. */
type Mapping = string

type Status = 'ready' | 'exists' | 'error' | 'skipped'
interface Checked extends CsvRow {
  status: Status
  reason: string
  personId: string | null
  courseId: string | null
  oneOff: boolean
}

function download(name: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

interface Props {
  onClose: () => void
  onAdded: (count: number) => void
}

function BulkUploadRecordsDrawer({ onClose, onAdded }: Props) {
  const { courses, records, allowOneOffs, providers } = useExternalTraining()
  const panelRef = useRef<HTMLElement>(null)
  useOverlayA11y(panelRef, true)
  const [csv, setCsv] = useState<string | null>(null)
  /* Certificates: one zip, or the PDF and image files themselves (several at once). */
  const [certs, setCerts] = useState<string[]>([])
  const [filter, setFilter] = useState<'ready' | 'exists' | 'error'>('ready')
  const [mappings, setMappings] = useState<Record<string, Mapping>>({})

  const personFor = (email: string) => TRAINING_PEOPLE.find((p) => p.email.toLowerCase() === email.toLowerCase())

  /* Names that don't match an approved course (or one it remembers), with row counts. */
  const unmatched = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of DEMO_ROWS) {
      if (r.course && personFor(r.email) && !matchCourse(r.course)) counts.set(r.course, (counts.get(r.course) ?? 0) + 1)
    }
    return [...counts.entries()]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses])

  const rows: Checked[] = useMemo(
    () =>
      DEMO_ROWS.map((r): Checked => {
        const base = { ...r, personId: null, courseId: null, oneOff: false }
        const person = personFor(r.email)
        if (!person) return { ...base, status: 'error', reason: 'No one in 5Mins has this email' }
        if (!r.course) return { ...base, personId: person.id, status: 'error', reason: 'Add the course name' }
        const matched = matchCourse(r.course)
        const mapping = matched ? matched.id : mappings[r.course]
        if (!mapping) return { ...base, personId: person.id, status: 'skipped', reason: 'Match this name to a course first' }
        if (mapping === 'skip') return { ...base, personId: person.id, status: 'skipped', reason: 'Skipped' }
        if (mapping === 'one-off') return { ...base, personId: person.id, status: 'ready', reason: 'One-off', oneOff: true }
        const exists = records.some((x) => x.personId === person.id && x.courseId === mapping && x.completionDate === r.date)
        return exists
          ? { ...base, personId: person.id, courseId: mapping, status: 'exists', reason: 'Already in 5Mins. Skipped.' }
          : { ...base, personId: person.id, courseId: mapping, status: 'ready', reason: '' }
      }),
    [records, mappings],
  )
  const count = (s: Status) => rows.filter((r) => r.status === s).length
  const ready = rows.filter((r) => r.status === 'ready')
  const needsMatching = unmatched.some(([name]) => !mappings[name])
  const hasZip = certs.some((n) => n.toLowerCase().endsWith('.zip'))
  // A zip "holds" every file the rows name; loose files match a row by their own name.
  const certFor = (r: CsvRow) =>
    r.certificate && (hasZip || certs.some((n) => n.toLowerCase() === r.certificate!.toLowerCase()))
      ? r.certificate
      : null

  const commit = () => {
    // Remember each mapped spelling on its course, so the next upload matches on its own (D15).
    for (const [name] of unmatched) {
      const m = mappings[name]
      if (m && m !== 'skip' && m !== 'one-off') addOtherName(m, name)
    }
    const added: ExternalRecord[] = ready.map((r) => {
      const course = courses.find((c) => c.id === r.courseId)
      const provider = providers.find((p) => p.name.toLowerCase() === r.provider.toLowerCase() && course?.providerIds.includes(p.id))
      return {
        id: newId('r'),
        personId: r.personId!,
        courseId: r.oneOff ? null : r.courseId,
        oneOff: r.oneOff ? { name: r.course, provider: r.provider, duration: '' } : undefined,
        providerId: r.oneOff ? null : provider?.id ?? course?.providerIds[0] ?? null,
        completionDate: r.date,
        retrainingDueDate: r.oneOff ? null : retrainingDueDate(r.date, course?.retrainingMonths ?? null, r.result),
        result: r.result,
        score: r.score,
        certificate: certFor(r),
        source: 'csv',
      }
    })
    addRecords(added)
    onAdded(added.length)
  }

  const courseOptions = courses.filter((c) => !c.archived).map((c) => ({ value: c.id, label: c.name }))
  const mappingOptions = [
    ...courseOptions,
    ...(allowOneOffs ? [{ value: 'one-off', label: 'Record as one-off' }] : []),
    { value: 'skip', label: 'Skip these rows' },
  ]

  const columns: Column<Checked>[] = [
    {
      key: 'learner',
      header: 'Learner',
      width: '1 0 180px',
      render: (r) => (
        <span className="tbl-stack">
          <span className="primary">{TRAINING_PEOPLE.find((p) => p.id === r.personId)?.name ?? r.email}</span>
          <span className={`supporting${r.status === 'error' ? ' aet-error-text' : ''}`}>
            {r.status === 'error' ? `Row ${r.line}: ${r.reason}` : r.reason === 'One-off' ? r.email : r.reason || r.email}
          </span>
        </span>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      width: '1 0 160px',
      render: (r) => (
        <span className="lret-course">
          <span>{r.courseId ? courses.find((c) => c.id === r.courseId)?.name : r.course || '–'}</span>
          {r.oneOff && <Badge type="informative" icon={false} label="One-off" />}
        </span>
      ),
    },
    { key: 'date', header: 'Completed', width: '0 0 120px', render: (r) => formatDay(r.date) },
    { key: 'cert', header: 'Certificate', width: '0 0 112px', render: (r) => (certFor(r) ? 'Matched' : '–') },
  ]

  const ctaLabel = !csv ? 'Add Training' : ready.length === 1 ? 'Add 1 Record' : `Add ${ready.length} Records`

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} aria-hidden="true" />
      <aside ref={panelRef} tabIndex={-1} className="side-drawer aet-drawer" role="dialog" aria-modal="true" aria-labelledby="lret-bulk-title">
        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <div className="aet-drawer__heading">
              <h2 id="lret-bulk-title" className="aet-drawer__title">Bulk upload of trainings</h2>
              <p className="aet-text">Add training records from other platforms to keep all your learning in one place.</p>
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
                <p className="aet-text">Download our CSV file and fill it in following the template.</p>
                <div className="aet-step__action">
                  <Button
                    variant="text"
                    icon={<ImportCurve size={20} color="currentColor" variant="Linear" />}
                    onClick={() => download('external-training-template.csv', TEMPLATE)}
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
                  Use one row for each training and put each detail in its own cell. Use the course names from your
                  approved list. To add certificates, write each file's name in the Certificate file column,
                  then upload the files, or a zip of them, with the CSV.
                </p>
              </div>
            </li>
            <li className="aet-step">
              <span className="aet-step__num" aria-hidden="true">3</span>
              <div className="aet-step__body">
                <h3 className="aet-step__title">Upload files</h3>
                <div className="lret-uploaders">
                  <div className="aet-field">
                    <span className="aet-label">CSV file</span>
                    <FileUploader
                      size="L"
                      accept=".csv"
                      state={csv ? 'Filled' : 'Enabled'}
                      fileName={csv ?? undefined}
                      helpText="One row per record. Our template has a Certificate file column."
                      onFileSelect={(f) => setCsv(f.name)}
                      onChangeFile={() => setCsv(null)}
                    />
                  </div>
                  <div className="aet-field">
                    <span className="aet-label">Certificates (optional)</span>
                    <FileUploader
                      size="L"
                      accept=".zip,.pdf,.jpg,.jpeg,.png"
                      multiple
                      icon={<ZipIcon size={40} color="var(--text-secondary)" />}
                      state={certs.length ? 'Filled' : 'Enabled'}
                      fileName={certs.length === 1 ? certs[0] : `${certs.length} certificate files`}
                      helpText="A zip of PDF or image files"
                      onFileSelect={(f) => setCerts((c) => (c.includes(f.name) ? c : [...c, f.name]))}
                      onChangeFile={() => setCerts([])}
                    />
                  </div>
                </div>
              </div>
            </li>
          </ol>

          <Collapse open={!!csv}>
            <div className="aet-review">
              {unmatched.length > 0 && (
                <div className="lret-match">
                  <div className="aet-step__body">
                    <h3 className="aet-step__title">Names that aren't on your approved list</h3>
                    <p className="aet-text">We'll remember this, so next time these rows match on their own.</p>
                  </div>
                  {unmatched.map(([name, n]) => (
                    <div key={name} className="lret-match__row">
                      <span className="lret-match__name">
                        <span className="lret-match__label">{name}</span>
                        <span className="aet-text">
                          {n} row{n === 1 ? '' : 's'}
                        </span>
                      </span>
                      <Dropdown
                        className="lret-match__control"
                        placeholder="Match to course"
                        searchable
                        searchPlaceholder="Search approved courses"
                        options={mappingOptions}
                        value={mappings[name] ?? ''}
                        onChange={(v) => setMappings((m) => ({ ...m, [name]: v }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="aet-step__body">
                <h3 className="aet-step__title">Review</h3>
                <p className="aet-text">People are matched by email and certificates by file name. Records already in 5Mins are skipped.</p>
              </div>
              <div className="aet-chips" role="group" aria-label="Filter rows">
                <Chip label={`Ready to add (${count('ready')})`} selected={filter === 'ready'} onClick={() => setFilter('ready')} />
                <Chip label={`Already in 5Mins (${count('exists')})`} selected={filter === 'exists'} onClick={() => setFilter('exists')} />
                <Chip label={`Errors (${count('error')})`} variant="warning" selected={filter === 'error'} onClick={() => setFilter('error')} />
              </div>
              {filter === 'error' && count('error') > 0 && (
                <div>
                  <Button
                    variant="text"
                    icon={<DocumentDownload size={20} color="currentColor" variant="Linear" />}
                    onClick={() =>
                      download(
                        'external-training-errors.csv',
                        'Row,Email,Error\n' + rows.filter((r) => r.status === 'error').map((r) => `${r.line},${r.email},${r.reason}`).join('\n'),
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
            <Button disabled={!csv || needsMatching || ready.length === 0} onClick={commit}>
              {ctaLabel}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default BulkUploadRecordsDrawer
