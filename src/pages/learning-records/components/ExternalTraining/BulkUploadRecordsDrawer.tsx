import { Fragment, useMemo, useRef, useState, type RefObject } from 'react'
import { ArrangeHorizontal, Danger, ImportCurve } from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import Chip from '@/components/Chip/Chip'
import CloseButton from '@/components/CloseButton/CloseButton'
import Dropdown from '@/components/Dropdown/Dropdown'
import FileUploader from '@/components/FileUploader/FileUploader'
import ZipIcon from '@/components/icons/ZipIcon'
import Table, { type Column } from '@/components/Table/Table'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import { CellError } from '@/pages/people/components/BulkUploadModal/BulkUploadModal'
import '@/pages/people/components/BulkUploadModal/BulkUploadModal.css'
import '@/pages/account/components/ExternalTraining/ExternalTraining.css'
import {
  TRAINING_PEOPLE,
  addOtherName,
  addRecords,
  courseThumb,
  matchCourse,
  newId,
  retrainingDueDate,
  useExternalTraining,
  type ExternalRecord,
  type ExternalResult,
} from '@/data/externalTraining'
import type { BulkUploadKind } from './BulkUploadChoiceModal'
import { DateCell } from './ExternalRecordsTable'
import './ExternalTraining.css'

/* Bulk upload of trainings (PRD 2.10 and 2.11). Two kinds, picked in
   BulkUploadChoiceModal: a CSV (records only) or a zip holding the CSV and the
   certificate files. Step 1 is the template, instructions and uploader; step 2
   reviews the file as Bulk manage people does: an error bar with Download Error
   File, tabs with counts, error-type chips, red cells with the fix on hover, and
   no commit until a clean re-upload.

   The prototype doesn't parse files: the first upload previews the demo rows
   below with their errors, a re-upload previews them fixed. Names that aren't on
   the approved list are matched once here (D15) and remembered on the course.
   Rows already in 5Mins (same person, course and completion date) are skipped. */

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
/* In the zip demo, the first upload is missing this file. */
const MISSING_IN_ZIP = 'johnson-forklift.jpg'

const TEMPLATE = {
  csv:
    'Email,Course name,Provider,Completion date,Result,Score\n' +
    'sarah.chen@email.com,First Aid at Work,St John Ambulance,2026-10-14,Passed,92\n',
  zip:
    'Email,Course name,Provider,Completion date,Result,Score,Certificate file\n' +
    'sarah.chen@email.com,First Aid at Work,St John Ambulance,2026-10-14,Passed,92,chen-first-aid.pdf\n',
}

type ErrorCategory = 'person-not-found' | 'course-missing' | 'certificate-missing'
type ErrorColumn = 'learner' | 'course' | 'cert'
const ERROR_META: Record<ErrorCategory, { column: ErrorColumn; label: string; solution: string }> = {
  'person-not-found': { column: 'learner', label: 'Person not found', solution: 'Use the email the person has in 5Mins.' },
  'course-missing': { column: 'course', label: 'Course name missing', solution: 'Add a course name from your approved list.' },
  'certificate-missing': { column: 'cert', label: 'Certificate not in the zip', solution: 'Add the file to the zip, or clear the Certificate file cell.' },
}
const ERROR_ORDER: ErrorCategory[] = ['person-not-found', 'course-missing', 'certificate-missing']

/** A mapping for a name that isn't on the list: a course id, 'one-off' or 'skip'. */
type Mapping = string

type Status = 'ready' | 'exists' | 'error' | 'skipped'
interface Checked extends CsvRow {
  status: Status
  errors: Partial<Record<ErrorColumn, RowError>>
  personId: string | null
  courseId: string | null
  oneOff: boolean
}
type Tab = 'all' | 'error' | 'ready' | 'exists'
const ROWS_PER_PAGE = 10

function download(name: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

type RowError = { label: string; solution: string }
const makeError = (c: ErrorCategory): RowError => ({ label: ERROR_META[c].label, solution: ERROR_META[c].solution })

interface Props {
  kind: BulkUploadKind
  onClose: () => void
  onAdded: (count: number) => void
}

function BulkUploadRecordsDrawer({ kind, onClose, onAdded }: Props) {
  const { courses, records, allowOneOffs, providers } = useExternalTraining()
  const panelRef = useRef<HTMLElement>(null)
  useOverlayA11y(panelRef, true)
  const isZip = kind === 'zip'
  const [step, setStep] = useState<'upload' | 'review'>('upload')
  const [fileName, setFileName] = useState<string | null>(null)
  const [uploader, setUploader] = useState<'Enabled' | 'Uploading' | 'Filled'>('Enabled')
  const [progress, setProgress] = useState(0)
  /* First upload shows errors; a re-upload is the fixed file. */
  const [uploadCount, setUploadCount] = useState(0)
  const [tab, setTab] = useState<Tab>('error')
  const [errorCategory, setErrorCategory] = useState<'all' | ErrorCategory>('all')
  const [page, setPage] = useState(1)
  const [mappings, setMappings] = useState<Record<string, Mapping>>({})

  const fixed = uploadCount > 1
  const personFor = (email: string) => TRAINING_PEOPLE.find((p) => p.email.toLowerCase() === email.toLowerCase())
  const sourceRows = useMemo(() => DEMO_ROWS.filter((r) => !fixed || (personFor(r.email) && r.course)), [fixed])

  /* Names that don't match an approved course (or one it remembers), with row counts. */
  const unmatched = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of sourceRows) {
      if (r.course && personFor(r.email) && !matchCourse(r.course)) counts.set(r.course, (counts.get(r.course) ?? 0) + 1)
    }
    return [...counts.entries()]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, sourceRows])

  const rows: Checked[] = useMemo(
    () =>
      sourceRows.map((r): Checked => {
        const person = personFor(r.email)
        const errors: Checked['errors'] = {}
        if (!person) errors.learner = makeError('person-not-found')
        if (!r.course) errors.course = makeError('course-missing')
        if (isZip && !fixed && r.certificate === MISSING_IN_ZIP) errors.cert = makeError('certificate-missing')
        const base = { ...r, errors, personId: person?.id ?? null, courseId: null, oneOff: false }
        if (Object.keys(errors).length) return { ...base, status: 'error' }
        const matched = matchCourse(r.course)
        const mapping = matched ? matched.id : mappings[r.course]
        if (!mapping || mapping === 'skip') return { ...base, status: 'skipped' }
        if (mapping === 'one-off') return { ...base, status: 'ready', oneOff: true }
        const exists = records.some((x) => x.personId === person!.id && x.courseId === mapping && x.completionDate === r.date)
        return { ...base, courseId: mapping, status: exists ? 'exists' : 'ready' }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [records, mappings, sourceRows, isZip, fixed],
  )
  const count = (s: Status) => rows.filter((r) => r.status === s).length
  const errorRows = rows.filter((r) => r.status === 'error')
  const hasErrors = errorRows.length > 0
  const ready = rows.filter((r) => r.status === 'ready')
  const needsMatching = unmatched.some(([name]) => !mappings[name])
  const certFor = (r: CsvRow) => (isZip && r.certificate && !(r.certificate === MISSING_IN_ZIP && !fixed) ? r.certificate : null)

  const rowHas = (r: Checked, c: ErrorCategory) => !!r.errors[ERROR_META[c].column]
  const errorChips = [
    { key: 'all' as const, label: 'All Errors', count: errorRows.length },
    ...ERROR_ORDER.map((c) => ({ key: c, label: ERROR_META[c].label, count: errorRows.filter((r) => rowHas(r, c)).length })),
  ].filter((c) => c.key === 'all' || c.count > 0)

  const visible =
    tab === 'all'
      ? rows.filter((r) => r.status !== 'skipped')
      : tab === 'error'
        ? errorCategory === 'all'
          ? errorRows
          : errorRows.filter((r) => rowHas(r, errorCategory))
        : rows.filter((r) => r.status === tab)
  const from = (page - 1) * ROWS_PER_PAGE
  const pageRows = visible.slice(from, from + ROWS_PER_PAGE)

  const selectTab = (t: Tab) => {
    setTab(t)
    setErrorCategory('all')
    setPage(1)
  }

  const handleFile = async (f: File) => {
    setFileName(f.name)
    setUploader('Uploading')
    for (let i = 0; i <= 100; i += 20) {
      setProgress(i)
      await new Promise((r) => setTimeout(r, 100))
    }
    setUploader('Filled')
    const n = uploadCount + 1
    setUploadCount(n)
    // A re-upload is clean, so open on every row rather than the empty Errors tab.
    selectTab(n > 1 ? 'all' : 'error')
    setStep('review')
  }

  const backToUpload = () => {
    setStep('upload')
    setUploader('Enabled')
    setFileName(null)
    setProgress(0)
  }

  const downloadErrors = () =>
    download(
      'external-training-errors.csv',
      'Row,Email,Course name,Error,How to fix\n' +
        errorRows
          .map((r) => {
            const errs = Object.values(r.errors) as RowError[]
            return [r.line, r.email, r.course, errs.map((e) => e.label).join(' · '), errs.map((e) => e.solution).join(' ')]
              .map((v) => `"${String(v).replace(/"/g, '""')}"`)
              .join(',')
          })
          .join('\n'),
    )

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

  const courseOptions = courses
    .filter((c) => !c.archived)
    .map((c) => ({
      value: c.id,
      label: c.name,
      description: providers.filter((p) => c.providerIds.includes(p.id)).map((p) => p.name).join(', '),
      thumbnail: courseThumb(c.id),
    }))
  const mappingOptions = [
    ...courseOptions,
    ...(allowOneOffs ? [{ value: 'one-off', label: 'Record as one-off' }] : []),
    { value: 'skip', label: 'Skip these rows' },
  ]

  const errorTint = (col: ErrorColumn) => (r: Checked) => (r.errors[col] ? 'bulk-preview-col--error' : undefined)
  const columns: Column<Checked>[] = [
    {
      key: 'learner',
      header: 'Learner',
      width: '1 0 180px',
      cellClassName: errorTint('learner'),
      render: (r) =>
        r.errors.learner ? (
          <CellError value={r.email} error={r.errors.learner} />
        ) : (
          <span className="tbl-stack">
            <span className="primary">{TRAINING_PEOPLE.find((p) => p.id === r.personId)?.name ?? r.email}</span>
            <span className="supporting">{r.status === 'exists' ? 'Already in 5Mins. Skipped.' : r.email}</span>
          </span>
        ),
    },
    {
      key: 'course',
      header: 'Course',
      width: '1 0 160px',
      cellClassName: errorTint('course'),
      render: (r) =>
        r.errors.course ? (
          <CellError value={r.course} error={r.errors.course} />
        ) : (
          <span className="lret-course">
            <span>{r.courseId ? courses.find((c) => c.id === r.courseId)?.name : r.course}</span>
            {r.oneOff && <Badge type="informative" icon={false} label="One-off" />}
          </span>
        ),
    },
    { key: 'provider', header: 'Provider', width: '1 0 160px', render: (r) => r.provider || '–' },
    { key: 'date', header: 'Completion date', width: '0 0 140px', render: (r) => <DateCell iso={r.date} /> },
    { key: 'result', header: 'Result', width: '0 0 100px', render: (r) => r.result },
    { key: 'score', header: 'Score', width: '0 0 80px', render: (r) => (r.score == null ? '–' : `${r.score}%`) },
    ...(isZip
      ? [
          {
            key: 'cert',
            header: 'Certificate',
            width: '1 0 200px',
            cellClassName: errorTint('cert'),
            render: (r: Checked) =>
              r.errors.cert ? <CellError value={r.certificate ?? ''} error={r.errors.cert} /> : certFor(r) ? 'Matched' : '–',
          },
        ]
      : []),
  ]

  const tabs: { key: Tab; label: string; count: number; color: string }[] = [
    hasErrors
      ? { key: 'error', label: 'Errors', count: errorRows.length, color: 'error' }
      : { key: 'all', label: 'All Records', count: rows.filter((r) => r.status !== 'skipped').length, color: 'neutral' },
    { key: 'ready', label: 'Ready to Add', count: count('ready'), color: 'success' },
    { key: 'exists', label: 'Already in 5Mins', count: count('exists'), color: 'neutral' },
  ]

  const blocked = hasErrors || needsMatching || ready.length === 0
  const blockedReason = hasErrors
    ? `${errorRows.length} record${errorRows.length === 1 ? ' has' : 's have'} errors. Fix your file and re-upload to continue.`
    : needsMatching
      ? 'Match the names that aren’t on your approved list to continue.'
      : null

  /* Review: full screen, as Bulk manage people (BulkUploadModal's shell and styles). */
  if (step === 'review')
    return (
      <div ref={panelRef as RefObject<HTMLDivElement>} tabIndex={-1} className="bulk-upload-modal lret-review" role="dialog" aria-modal="true" aria-labelledby="lret-bulk-title">
        <div className="bulk-upload-content bulk-upload-content--preview">
          <div className="bulk-upload-form bulk-upload-form--preview">
            <div className="bulk-upload-header">
              <div className="aet-drawer__heading">
                <h2 id="lret-bulk-title" className="bulk-upload-title">{isZip ? 'Review ZIP file' : 'Review CSV file'}</h2>
                <p className="aet-text">
                  {isZip ? 'People are matched by email and certificates by file name.' : 'People are matched by email.'} Records already in 5Mins are skipped.
                </p>
              </div>
              <CloseButton variant="fullscreen" onClick={onClose} />
            </div>
            <div className="bulk-preview">
              {hasErrors && (
                <div className="bulk-preview-error-bar">
                  <div className="bulk-preview-error-banner">
                    <Danger size={20} color="var(--text-error)" variant="Bold" />
                    <span>
                      {errorRows.length} record{errorRows.length === 1 ? ' has' : 's have'} errors. Download Error File to fix
                      your file and re-upload to continue.
                    </span>
                  </div>
                  <Button
                    className="bulk-preview-download-error"
                    icon={<ImportCurve size={20} color="currentColor" variant="Linear" />}
                    onClick={downloadErrors}
                  >
                    Download Error File
                  </Button>
                </div>
              )}

              {unmatched.length > 0 && (
                <div className="lret-match">
                  <div className="aet-step__body">
                    <h3 className="aet-step__title">Names that aren't on your approved list</h3>
                    <p className="aet-text">We'll remember this, so next time these rows match on their own.</p>
                  </div>
                  {/* Two columns, as Match the pairs (MatchPairsBody): the name in the
                      file, the link glyph, then the approved course it maps to. */}
                  <div className="lret-match__grid" role="group" aria-label="Match names to courses">
                    <span className="lret-match__head">Name in your file</span>
                    <span aria-hidden="true" />
                    <span className="lret-match__head">Course in 5Mins</span>
                    {unmatched.map(([name, n]) => (
                      <Fragment key={name}>
                        <span className="lret-match__name">
                          <span className="lret-match__label">{name}</span>
                          <span className="lret-match__count">
                            {n} row{n === 1 ? '' : 's'}
                          </span>
                        </span>
                        <ArrangeHorizontal size={20} color="var(--text-tertiary)" variant="Linear" className="lret-match__link" />
                        <Dropdown
                          className="lret-match__control"
                          placeholder="Search for a course"
                          searchable
                          searchPlaceholder="Search approved courses"
                          options={mappingOptions}
                          value={mappings[name] ?? ''}
                          onChange={(v) => setMappings((m) => ({ ...m, [name]: v }))}
                        />
                      </Fragment>
                    ))}
                  </div>
                </div>
              )}

              <div className="bulk-preview-tabs" role="tablist" aria-label="Filter records">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.key}
                    className={`bulk-preview-tab${tab === t.key ? ' bulk-preview-tab--active' : ''}`}
                    onClick={() => selectTab(t.key)}
                  >
                    {t.label}
                    <span className={`bulk-preview-tab-counter bulk-preview-tab-counter--${t.color}`}>{t.count}</span>
                  </button>
                ))}
              </div>

              {tab === 'error' && hasErrors && (
                <div className="bulk-preview-error-chips">
                  {errorChips.map((c) => (
                    <Chip
                      key={c.key}
                      label={`${c.label} (${c.count})`}
                      selected={errorCategory === c.key}
                      onClick={() => {
                        setErrorCategory(c.key)
                        setPage(1)
                      }}
                      className="bulk-error-chip"
                    />
                  ))}
                </div>
              )}

              <Table
                columns={columns}
                rows={pageRows}
                getRowKey={(r) => String(r.line)}
                pagination={{
                  from: visible.length ? from + 1 : 0,
                  to: Math.min(from + ROWS_PER_PAGE, visible.length),
                  total: visible.length,
                  onPrev: () => setPage((p) => p - 1),
                  onNext: () => setPage((p) => p + 1),
                }}
              />
              <div className="bulk-preview-actions">
                <Button variant="outlined" onClick={backToUpload}>
                  Back To Upload
                </Button>
                <div className="bulk-preview-btn-wrapper">
                  <Button disabled={blocked} onClick={commit}>
                    {hasErrors ? 'Add Records' : ready.length === 1 ? 'Add 1 Record' : `Add ${ready.length} Records`}
                  </Button>
                  {blockedReason && <div className="bulk-preview-tooltip">{blockedReason}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} aria-hidden="true" />
      <aside ref={panelRef} tabIndex={-1} className="side-drawer aet-drawer" role="dialog" aria-modal="true" aria-labelledby="lret-bulk-title">
        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <div className="aet-drawer__heading">
              <h2 id="lret-bulk-title" className="aet-drawer__title">
                {isZip ? 'Upload a ZIP file' : 'Upload a CSV file'}
              </h2>
              <p className="aet-text">
                {isZip
                  ? 'Add training records and their certificates from other platforms in one zip file.'
                  : 'Add training records from other platforms to keep all your learning in one place.'}
              </p>
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
                    onClick={() => download('external-training-template.csv', TEMPLATE[kind])}
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
                  approved list.
                  {isZip &&
                    " Write each certificate's file name in the Certificate file column, then put the CSV and the certificate files (PDF or image) in one zip."}
                </p>
              </div>
            </li>
            <li className="aet-step">
              <span className="aet-step__num" aria-hidden="true">3</span>
              <div className="aet-step__body">
                <h3 className="aet-step__title">{isZip ? 'Upload your ZIP file' : 'Upload your CSV file'}</h3>
                <FileUploader
                  size="L"
                  accept={isZip ? '.zip' : '.csv'}
                  icon={isZip ? <ZipIcon size={40} color="var(--text-secondary)" /> : undefined}
                  state={uploader}
                  progress={progress}
                  fileName={fileName ?? undefined}
                  helpText={isZip ? 'One zip with the CSV and the certificate files' : 'One row per record, as in our template'}
                  onFileSelect={handleFile}
                  onChangeFile={backToUpload}
                />
              </div>
            </li>
          </ol>
        </div>

        <div className="side-drawer__footer">
          <div className="side-drawer__footer-divider" />
          <div className="side-drawer__buttons">
            <Button disabled>Add Records</Button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default BulkUploadRecordsDrawer
