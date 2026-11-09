import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Danger } from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import Chip from '@/components/Chip/Chip'
import CloseButton from '@/components/CloseButton/CloseButton'
import Dropdown from '@/components/Dropdown/Dropdown'
import Table, { type Column } from '@/components/Table/Table'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import { CellError } from '@/pages/people/components/BulkUploadModal/BulkUploadModal'
import '@/pages/people/components/BulkUploadModal/BulkUploadModal.css'
import '@/pages/account/components/ExternalTraining/ExternalTraining.css'
import '@/components/AIWorkingCard/AIWorkingCard.css'
import {
  TRAINING_PEOPLE,
  addOtherName,
  addRecords,
  courseThumb,
  matchCourse,
  newId,
  retrainingDueDate,
  samePerson,
  useExternalTraining,
  type ExternalRecord,
  type ExternalResult,
} from '@/data/externalTraining'
import CourseMappingCard from './CourseMappingCard'
import { DateCell } from './ExternalRecordsTable'
import './ExternalTraining.css'

/* Upload ZIP file (PRD 2.10 and D11, updated 2026-11-09): a zip of certificates, or several
   certificate files, with no CSV. Each certificate is read (as the single Add
   Training drawer reads one) and matched to a learner by the name on it. What was
   read is a proposal, never a record: nothing is added until the admin presses Add.

   - One learner with that name: matched.
   - Nobody, or several people: Needs review, and the admin picks the learner. Picking
     is the confirmation; a learner is never created from a certificate.
   - A course name that isn't on the approved list is matched once in the card above
     the table and remembered (D15), as in the CSV review.
   - Same learner, course and completion date as a record in 5Mins: skipped.
   - A file that can't be read: an error, with Remove.
   Errors look as they do in the CSV review (error bar, Errors tab with a chip per
   type, red cells with the fix on hover); the difference is that they're fixed
   here, not by re-uploading. The ready ones can be added while the rest wait (as
   Remote and Ramp do).

   The prototype has no AI service: whatever is picked, the demo certificates below are
   "read", one every READ_MS. Prefix: lret- */

interface Certificate {
  file: string
  /** What the certificate says; null when it couldn't be read. */
  read: { name: string; course: string; provider: string; date: string; result: ExternalResult } | null
}

const DEMO: Certificate[] = [
  { file: 'thompson-first-aid.pdf', read: { name: 'Michael Thompson', course: 'First Aid at Work', provider: 'St John Ambulance', date: '2026-09-12', result: 'Passed' } },
  { file: 'hart-fire-marshal.jpg', read: { name: 'Jessica Hart', course: 'Fire Marshal', provider: 'SafeWork Training', date: '2026-08-01', result: 'Passed' } },
  { file: 'johnson-forklift.jpg', read: { name: 'D. Johnson', course: 'Forklift CB 3 day', provider: 'RTITB', date: '2026-07-20', result: 'Passed' } },
  { file: 'williams-forklift.pdf', read: { name: 'Noah Williams', course: 'Forklift CB 3 day', provider: 'RTITB', date: '2026-07-21', result: 'Passed' } },
  { file: 'tanaka-food-hygiene.png', read: { name: 'Mei Tanaka', course: 'Food Hygiene Level 2', provider: 'Highfield Qualifications', date: '2026-06-02', result: 'Passed' } },
  { file: 'wallace-first-aid.pdf', read: { name: 'Anthonny Wallace', course: 'First Aid at Work', provider: 'Red Cross Training', date: '2026-10-14', result: 'Passed' } },
  { file: 'whitaker-fire-marshal.pdf', read: { name: 'Paul Whitaker', course: 'Fire Marshal', provider: 'SafeWork Training', date: '2026-08-03', result: 'Passed' } },
  { file: 'carter-allergen.jpg', read: { name: 'J. Carter', course: 'Allergen Awareness', provider: 'Allergen Aware Ltd', date: '2026-05-10', result: 'Passed' } },
  { file: 'scan-0042.jpg', read: null },
]
const READ_MS = 350

type ErrorCategory = 'person-not-found' | 'several-people' | 'course-not-listed' | 'unreadable'
type ErrorColumn = 'file' | 'learner' | 'course'
const ERROR_META: Record<ErrorCategory, { column: ErrorColumn; label: string; solution: string }> = {
  'person-not-found': { column: 'learner', label: 'Person not found', solution: 'Pick the learner this certificate belongs to.' },
  'several-people': { column: 'learner', label: 'More than one match', solution: 'Pick which learner this certificate belongs to.' },
  'course-not-listed': { column: 'course', label: 'Course not on your list', solution: 'Match it to an approved course above.' },
  unreadable: { column: 'file', label: "Couldn't read the certificate", solution: 'Try a sharper scan, or remove it.' },
}
const ERROR_ORDER: ErrorCategory[] = ['person-not-found', 'several-people', 'course-not-listed', 'unreadable']

type Status = 'reading' | 'error' | 'ready' | 'exists' | 'skipped'
type Tab = 'all' | 'error' | 'ready' | 'exists'
interface Row extends Certificate {
  status: Status
  errors: Partial<Record<ErrorColumn, ErrorCategory>>
  /** People whose name matches the one on the certificate. */
  matches: string[]
  personId: string | null
  courseId: string | null
  oneOff: boolean
}

const CERTIFICATE_ACCEPT = '.zip,.pdf,.jpg,.jpeg,.png'

interface Props {
  onClose: () => void
  /** `remaining`: certificates still waiting (needs review or couldn't read). */
  onAdded: (count: number, remaining: number) => void
}

function CertificatesReview({ onClose, onAdded }: Props) {
  const { courses, records, allowOneOffs, providers } = useExternalTraining()
  const panelRef = useRef<HTMLDivElement>(null)
  useOverlayA11y(panelRef as RefObject<HTMLElement>, true)
  const pickerRef = useRef<HTMLInputElement>(null)
  const [readCount, setReadCount] = useState(0)
  const [picked, setPicked] = useState<Record<string, string>>({})
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [gone, setGone] = useState<Set<string>>(new Set()) // added or removed
  const [tab, setTab] = useState<Tab | null>(null)
  const [errorCategory, setErrorCategory] = useState<'all' | ErrorCategory>('all')

  const reading = readCount < DEMO.length
  useEffect(() => {
    if (!reading) return
    const t = setTimeout(() => setReadCount((n) => n + 1), READ_MS)
    return () => clearTimeout(t)
  }, [reading, readCount])

  const certs = DEMO.filter((c) => !gone.has(c.file))

  /* Course names on the certificates that don't match an approved course. */
  const unmatched = useMemo(() => {
    const counts = new Map<string, number>()
    DEMO.slice(0, readCount).forEach((c) => {
      if (c.read && !gone.has(c.file) && !matchCourse(c.read.course)) counts.set(c.read.course, (counts.get(c.read.course) ?? 0) + 1)
    })
    return [...counts.entries()]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, readCount, gone])

  const rows: Row[] = useMemo(
    () =>
      certs.map((c): Row => {
        const i = DEMO.indexOf(c)
        const base = { ...c, errors: {}, matches: [] as string[], personId: null, courseId: null, oneOff: false }
        if (i >= readCount) return { ...base, status: 'reading' }
        if (!c.read) return { ...base, errors: { file: 'unreadable' }, status: 'error' }
        const matches = TRAINING_PEOPLE.filter((p) => samePerson(p.name, c.read!.name)).map((p) => p.id)
        const personId = picked[c.file] ?? (matches.length === 1 ? matches[0] : null)
        const mapping = matchCourse(c.read.course)?.id ?? mappings[c.read.course]
        if (mapping === 'skip') return { ...base, matches, personId, status: 'skipped' }
        const oneOff = mapping === 'one-off'
        const courseId = mapping && !oneOff ? mapping : null
        const errors: Row['errors'] = {}
        if (!personId) errors.learner = matches.length ? 'several-people' : 'person-not-found'
        if (!courseId && !oneOff) errors.course = 'course-not-listed'
        const row = { ...base, errors, matches, personId, courseId, oneOff }
        if (Object.keys(errors).length) return { ...row, status: 'error' }
        const exists = records.some((x) => x.personId === personId && x.courseId === courseId && x.completionDate === c.read!.date)
        return { ...row, status: exists ? 'exists' : 'ready' }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [readCount, picked, mappings, records, gone, courses],
  )
  const of = (s: Status) => rows.filter((r) => r.status === s)
  const ready = of('ready')
  const errorRows = of('error')
  const hasErrors = errorRows.length > 0
  const waiting = errorRows.length
  const rowHas = (r: Row, c: ErrorCategory) => r.errors[ERROR_META[c].column] === c
  const errorChips = [
    { key: 'all' as const, label: 'All Errors', count: errorRows.length },
    ...ERROR_ORDER.map((c) => ({ key: c, label: ERROR_META[c].label, count: errorRows.filter((r) => rowHas(r, c)).length })),
  ].filter((c) => c.key === 'all' || c.count > 0)

  /* Tabs as the CSV review: Errors while there are any, otherwise All Records. */
  const notSkipped = rows.filter((r) => r.status !== 'skipped')
  const tabs: { key: Tab; label: string; count: number; color: string }[] = [
    hasErrors
      ? { key: 'error', label: 'Errors', count: errorRows.length, color: 'error' }
      : { key: 'all', label: 'All Records', count: notSkipped.length, color: 'neutral' },
    { key: 'ready', label: 'Ready to Add', count: of('ready').length, color: 'success' },
    { key: 'exists', label: 'Already in 5Mins', count: of('exists').length, color: 'neutral' },
  ]
  const shown = tab === 'error' && !hasErrors ? 'all' : tab === 'all' && hasErrors ? 'error' : tab
  const activeTab: Tab = shown ?? (hasErrors ? 'error' : 'all')
  const visible = reading
    ? notSkipped
    : activeTab === 'all'
      ? notSkipped
      : activeTab === 'error'
        ? errorCategory === 'all' || !errorRows.some((r) => rowHas(r, errorCategory))
          ? errorRows
          : errorRows.filter((r) => rowHas(r, errorCategory))
        : of(activeTab)

  const restart = () => {
    setReadCount(0)
    setPicked({})
    setGone(new Set())
    setTab(null)
    setErrorCategory('all')
  }

  const commit = () => {
    for (const [name] of unmatched) {
      const m = mappings[name]
      if (m && m !== 'skip' && m !== 'one-off') addOtherName(m, name)
    }
    const added: ExternalRecord[] = ready.map((r) => {
      const read = r.read!
      const course = courses.find((c) => c.id === r.courseId)
      const provider = providers.find((p) => p.name.toLowerCase() === read.provider.toLowerCase() && course?.providerIds.includes(p.id))
      return {
        id: newId('r'),
        personId: r.personId!,
        courseId: r.oneOff ? null : r.courseId,
        oneOff: r.oneOff ? { name: read.course, provider: read.provider, duration: '' } : undefined,
        providerId: r.oneOff ? null : provider?.id ?? course?.providerIds[0] ?? null,
        completionDate: read.date,
        retrainingDueDate: r.oneOff ? null : retrainingDueDate(read.date, course?.retrainingMonths ?? null, read.result),
        result: read.result,
        score: null,
        certificate: r.file,
        source: 'ai',
      }
    })
    addRecords(added)
    // Added and already-in-5Mins certificates leave the list; the rest wait here.
    setGone((g) => new Set([...g, ...ready.map((r) => r.file), ...of('exists').map((r) => r.file)]))
    setTab(null)
    onAdded(added.length, waiting)
  }

  const learnerOptions = TRAINING_PEOPLE.map((p) => ({ value: p.id, label: p.name, description: p.email }))
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
    { value: 'skip', label: 'Skip these certificates' },
  ]

  /* A cell still being read wears the shared AI shimmer (.is-writing). */
  const shimmer = <span className="lret-reading is-writing" aria-hidden="true" />
  const whileRead = (r: Row, cell: () => ReactNode) => (r.status === 'reading' ? shimmer : cell())

  const errorFor = (c: ErrorCategory) => ({ label: ERROR_META[c].label, solution: ERROR_META[c].solution })
  const tint = (col: ErrorColumn) => (r: Row) => (r.errors[col] ? 'bulk-preview-col--error' : undefined)
  /** The learner is shown as a picker when the certificate's name didn't match one person. */
  const needsPick = (r: Row) => !!r.read && r.status !== 'reading' && !(r.matches.length === 1 && !picked[r.file])

  const learnerCell = (r: Row) => {
    if (!r.read) return '–'
    if (!needsPick(r)) {
      const p = TRAINING_PEOPLE.find((x) => x.id === r.personId)!
      return (
        <span className="tbl-stack">
          <span className="primary">{p.name}</span>
          <span className="supporting">{r.status === 'exists' ? 'Already in 5Mins. Skipped.' : p.email}</span>
        </span>
      )
    }
    const picker = (
      <Dropdown
        size="sm"
        placeholder="Pick learner"
        searchable
        searchPlaceholder="Search people"
        options={learnerOptions}
        value={r.personId ?? ''}
        onChange={(v) => setPicked((m) => ({ ...m, [r.file]: v }))}
      />
    )
    // An error shows the name on the certificate, as the CSV review shows the value in the file.
    return r.errors.learner ? (
      <span className="lret-pick">
        <CellError value={r.read.name} error={errorFor(r.errors.learner)} />
        {picker}
      </span>
    ) : (
      picker
    )
  }

  const columns: Column<Row>[] = [
    {
      key: 'file',
      header: 'Certificate',
      width: '1 0 180px',
      cellClassName: tint('file'),
      render: (r) =>
        r.errors.file ? <CellError value={r.file} error={errorFor(r.errors.file)} /> : <span className="lret-file">{r.file}</span>,
    },
    {
      key: 'learner',
      header: 'Learner',
      width: '1 0 220px',
      // The picker (and the name above it) is taller than a row, so that cell grows.
      cellClassName: (r) => [tint('learner')(r), needsPick(r) && 'lret-cell-grow'].filter(Boolean).join(' ') || undefined,
      render: (r) => whileRead(r, () => learnerCell(r)),
    },
    {
      key: 'course',
      header: 'Course',
      width: '1 0 180px',
      cellClassName: tint('course'),
      render: (r) =>
        whileRead(r, () =>
          !r.read ? (
            '–'
          ) : r.errors.course ? (
            <CellError value={r.read.course} error={errorFor(r.errors.course)} />
          ) : (
            <span className="lret-course">
              <span>{courses.find((c) => c.id === r.courseId)?.name ?? r.read.course}</span>
              {r.oneOff && <Badge type="informative" icon={false} label="One-off" />}
            </span>
          ),
        ),
    },
    { key: 'provider', header: 'Provider', width: '1 0 160px', render: (r) => whileRead(r, () => r.read?.provider ?? '–') },
    { key: 'date', header: 'Completion date', width: '0 0 140px', render: (r) => whileRead(r, () => (r.read ? <DateCell iso={r.read.date} /> : '–')) },
    {
      key: 'expiry',
      header: 'Expiry',
      width: '0 0 120px',
      render: (r) =>
        whileRead(r, () => {
          const months = courses.find((c) => c.id === r.courseId)?.retrainingMonths ?? null
          const due = r.read && r.courseId ? retrainingDueDate(r.read.date, months, r.read.result) : null
          return due ? <DateCell iso={due} /> : '–'
        }),
    },
    {
      key: 'actions',
      header: '',
      width: '0 0 112px',
      align: 'right',
      render: (r) =>
        r.errors.file ? (
          <Button variant="text" onClick={() => setGone((g) => new Set([...g, r.file]))}>
            Remove
          </Button>
        ) : null,
    },
  ]

  const blockedReason = reading
    ? 'Wait until every certificate is read.'
    : ready.length === 0
      ? 'Fix the errors to add these certificates.'
      : null

  return (
    <div ref={panelRef} tabIndex={-1} className="bulk-upload-modal lret-review" role="dialog" aria-modal="true" aria-labelledby="lret-certs-title">
      <div className="bulk-upload-content bulk-upload-content--preview">
        <div className="bulk-upload-form bulk-upload-form--preview">
          <div className="bulk-upload-header">
            <div className="aet-drawer__heading">
              <h2 id="lret-certs-title" className="bulk-upload-title">
                Review certificates
              </h2>
              <p className="aet-text" aria-live="polite">
                {reading
                  ? `Reading ${readCount} of ${DEMO.length} certificates…`
                  : 'We matched each certificate to a learner by the name on it. Check them, then add the ones that are ready.'}
              </p>
            </div>
            <CloseButton variant="fullscreen" onClick={onClose} />
          </div>
          <div className="bulk-preview">
            {!reading && hasErrors && (
              <div className="bulk-preview-error-bar">
                <div className="bulk-preview-error-banner">
                  <Danger size={20} color="var(--text-error)" variant="Bold" />
                  <span>
                    {errorRows.length} certificate{errorRows.length === 1 ? ' has' : 's have'} errors. Fix them below, or add the
                    ready ones now.
                  </span>
                </div>
              </div>
            )}

            {!reading && unmatched.length > 0 && (
              <CourseMappingCard
                unmatched={unmatched}
                mappings={mappings}
                options={mappingOptions}
                nameHeader="Name on the certificate"
                onChange={(name, v) => setMappings((m) => ({ ...m, [name]: v }))}
              />
            )}

            {!reading && (
              <div className="bulk-preview-tabs" role="tablist" aria-label="Filter certificates">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === t.key}
                    className={`bulk-preview-tab${activeTab === t.key ? ' bulk-preview-tab--active' : ''}`}
                    onClick={() => {
                      setTab(t.key)
                      setErrorCategory('all')
                    }}
                  >
                    {t.label}
                    <span className={`bulk-preview-tab-counter bulk-preview-tab-counter--${t.color}`}>{t.count}</span>
                  </button>
                ))}
              </div>
            )}

            {!reading && activeTab === 'error' && (
              <div className="bulk-preview-error-chips">
                {errorChips.map((c) => (
                  <Chip
                    key={c.key}
                    label={`${c.label} (${c.count})`}
                    selected={errorCategory === c.key}
                    onClick={() => setErrorCategory(c.key)}
                    className="bulk-error-chip"
                  />
                ))}
              </div>
            )}

            <Table columns={columns} rows={visible} getRowKey={(r) => r.file} />

            <div className="bulk-preview-actions">
              <Button variant="outlined" onClick={() => pickerRef.current?.click()}>
                Change Files
              </Button>
              <input
                ref={pickerRef}
                type="file"
                accept={CERTIFICATE_ACCEPT}
                multiple
                hidden
                onChange={(e) => {
                  const n = e.target.files?.length ?? 0
                  e.target.value = ''
                  if (n) restart()
                }}
              />
              <div className="bulk-preview-btn-wrapper">
                <Button disabled={!!blockedReason} onClick={commit}>
                  {ready.length === 1 ? 'Add 1 Record' : ready.length ? `Add ${ready.length} Records` : 'Add Records'}
                </Button>
                {blockedReason && <div className="bulk-preview-tooltip">{blockedReason}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificatesReview
