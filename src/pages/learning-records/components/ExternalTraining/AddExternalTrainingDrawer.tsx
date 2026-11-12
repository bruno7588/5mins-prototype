import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Danger, DocumentText, GalleryAdd, Trash } from 'iconsax-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import AIWorkingCard from '@/components/AIWorkingCard/AIWorkingCard'
import { arriveTransition } from '@/components/AIWorkingCard/arrive'
import Alert from '@/components/Alert/Alert'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import Checkbox from '@/components/Checkbox/Checkbox'
import CloseButton from '@/components/CloseButton/CloseButton'
import DatePickerField from '@/components/DatePickerField/DatePickerField'
import Dropdown from '@/components/Dropdown/Dropdown'
import EmptyState from '@/components/EmptyState/EmptyState'
import InputInteger from '@/components/InputInteger/InputInteger'
import Radio from '@/components/Radio/Radio'
import SideDrawer from '@/components/SideDrawer/SideDrawer'
import Tooltip from '@/components/Tooltip/Tooltip'
import emptyBox from '@/assets/empty-state-illustrations/empty-box.svg'
import '@/pages/account/components/ExternalTraining/ExternalTraining.css'
import {
  courseThumb,
  TRAINING_PEOPLE,
  dueState,
  formatDay,
  isFullAdmin,
  newId,
  personById,
  retrainingDueDate,
  todayIso,
  useExternalTraining,
  type ExternalRecord,
  type ExternalResult,
  samePerson,
} from '@/data/externalTraining'
import './AddExternalTrainingDrawer.css'

/* Add / Edit external training (DES-336 Phase 2, PRD 2.1-2.8).

   Certificate first: dropping a file "reads" it and fills learner, course and
   completion date for the admin to check. The form is always visible, so the admin
   can type the details instead (D14),
   and the certificate is optional (D17).

   The prototype has no AI service (production decides the model, Blocker 1). The
   read is simulated and the demo file's name picks the outcome, so every branch in
   PRD 2.4 can be shown:
     ...unreadable...  → "We couldn't read this certificate"
     ...mismatch...    → names someone else (Paul Whitaker)
     ...nomatch...     → a course that isn't on the approved list
     ...duplicate...   → the learner already has this course on this date
     ...several...     → "S. Rivers": two learners fit, the admin picks one
     ...nodate...      → no completion date on the certificate
     ...toolarge...    → treated as over 10MB (a real file over 10MB, or not PDF/JPG/PNG, is refused too)
     anything else     → First Aid at Work, St John Ambulance, 28 Oct 2026
   Prefix: aetd- */

/** What the read found. `matches`: the learners whose name fits (more than one = ask).
    `noDate`: the certificate shows no completion date. `unlisted`: its course isn't on the
    approved list, so Course stays empty (records only ever point at approved courses). */
type Read = { learner: string | null; courseText: string | null; unreadable?: boolean; matches?: string[]; noDate?: boolean; unlisted?: boolean }

/* Files the drawer takes: PDF, JPG or PNG, up to 10MB. */
const MAX_FILE_BYTES = 10 * 1024 * 1024
type Problem = { title: string; message: React.ReactNode }
const fileProblem = (file: File): Problem | null =>
  !/\.(pdf|jpe?g|png)$/i.test(file.name)
    ? { title: 'This file type isn’t supported', message: 'Upload the certificate as a PDF, JPG or PNG.' }
    : file.size > MAX_FILE_BYTES || /toolarge/i.test(file.name)
      ? { title: 'This file is too large', message: 'Upload a file under 10MB.' }
      : null

const RESULT_OPTIONS = [
  { value: 'Passed', label: 'Passed' },
  { value: 'Not Passed', label: 'Not Passed' },
]

const UNIT_OPTIONS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
]

interface Props {
  /** Set false to close; the drawer plays its exit, so keep it mounted. */
  open: boolean
  /** Recording from a person's profile: the learner is fixed. */
  lockedPersonId?: string
  /** Edit an existing record. */
  record?: ExternalRecord | null
  /** A learner recording their own training (Profile): the empty state asks them to go to their admin. */
  learnerView?: boolean
  onClose: () => void
  onSaved: (record: ExternalRecord, isNew: boolean) => void
}

/* The preview shows at most this many pages of a PDF, then says how many there are. */
const MAX_PREVIEW_PAGES = 10

/* A PDF certificate's pages as PNG data URLs (up to MAX_PREVIEW_PAGES), plus its page count.
   pdf.js loads only when a PDF is picked. */
async function pdfPages(file: File): Promise<{ pages: string[]; total: number }> {
  const pdfjs = await import('pdfjs-dist')
  const { default: workerSrc } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  const pages: string[] = []
  for (let n = 1; n <= Math.min(doc.numPages, MAX_PREVIEW_PAGES); n++) {
    const page = await doc.getPage(n)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvas, viewport }).promise
    pages.push(canvas.toDataURL('image/png'))
  }
  return { pages, total: doc.numPages }
}

function AddExternalTrainingDrawer({ open, lockedPersonId, record: initialRecord = null, learnerView = false, onClose, onSaved }: Props) {
  const navigate = useNavigate()
  const { courses, providers, records } = useExternalTraining()
  const [record] = useState<ExternalRecord | null>(initialRecord)
  const editing = !!record
  const reduce = useReducedMotion()
  /* Only full admins manage the approved list (D21); everyone else asks one. */
  const canAdd = !learnerView && isFullAdmin()
  const listEmpty = courses.every((c) => c.archived)

  /* ── Form state ── */
  const [certificate, setCertificate] = useState<string | null>(initialRecord?.certificate ?? null)
  /* The picked file itself, so the drop zone can show the certificate (a saved record
     only has its file name, so it falls back to the name). */
  // url: page 1, for the box. pages: what the preview stacks. total: the file's page count.
  const [certificateFile, setCertificateFile] = useState<{ url: string; pages: string[]; total: number } | null>(null)
  useEffect(() => () => { if (certificateFile) URL.revokeObjectURL(certificateFile.url) }, [certificateFile])
  const [reading, setReading] = useState(false)
  const [read, setRead] = useState<Read | null>(null)
  /* A file the drawer can't take (type or size): it isn't kept or read. */
  const [fileError, setFileError] = useState<Problem | null>(null)
  const [personId, setPersonId] = useState(initialRecord?.personId ?? lockedPersonId ?? '')
  const [courseId, setCourseId] = useState(initialRecord?.courseId ?? '')
  const [providerId, setProviderId] = useState(initialRecord?.providerId ?? '')
  const [completionDate, setCompletionDate] = useState(initialRecord?.completionDate ?? '')
  const [result, setResult] = useState<ExternalResult>(initialRecord?.result ?? 'Passed')
  const [score, setScore] = useState(initialRecord?.score ?? 0)
  /* Expiry: a rule per record, the same control as Add course (No expiry, or Expires
     after N months), pre-set from the course and open to change (2026-11-12). A saved
     record starts from its stored date (D9) until the admin changes the rule, course,
     date or result. */
  const storedMonths = (() => {
    const r = initialRecord
    if (!r?.retrainingDueDate) return null
    const [a, b] = [new Date(r.completionDate), new Date(r.retrainingDueDate)]
    return Math.max(1, (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth())
  })()
  const recordCourse = initialRecord ? courses.find((c) => c.id === initialRecord.courseId) : undefined
  const [retrains, setRetrains] = useState(
    initialRecord ? storedMonths != null || (initialRecord.result === 'Not Passed' && recordCourse?.retrainingMonths != null) : false,
  )
  const [months, setMonths] = useState(storedMonths ?? recordCourse?.retrainingMonths ?? 12)
  const [expiryTouched, setExpiryTouched] = useState(false)
  const touchExpiry = (on: boolean, n = months) => {
    setRetrains(on)
    setMonths(n)
    setExpiryTouched(true)
  }
  const [submitted, setSubmitted] = useState(false)
  /* The confirm box under Learner: the admin confirms the certificate is this learner's
     (married name, nickname, a misread). Tied to the pair, so changing either asks again. */
  const [keptFor, setKeptFor] = useState<string | null>(null)
  const confirmRef = useRef<HTMLLabelElement>(null)

  const activeCourses = courses.filter((c) => !c.archived || c.id === courseId)
  const course = courses.find((c) => c.id === courseId)
  const courseProviders = course
    ? providers.filter((p) => course.providerIds.includes(p.id) && (!p.archived || p.id === providerId))
    : []

  // A course with one provider fills it in; several → the admin picks one (D2).
  // A newly picked course also resets the expiry rule to its own.
  const seededCourse = useRef(initialRecord?.courseId ?? null)
  useEffect(() => {
    if (!course) return
    if (course.id === seededCourse.current) seededCourse.current = null
    else {
      setRetrains(course.retrainingMonths != null)
      setMonths(course.retrainingMonths ?? 12)
    }
    if (courseProviders.length === 1) setProviderId(courseProviders[0].id)
    else if (!courseProviders.some((p) => p.id === providerId)) setProviderId('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  /* ── Simulated certificate read ──
     The form is always there. While the certificate is read, each field it fills wears
     the shared AI shimmer (.is-writing, as in Assessments > Create With AI) and gets its
     value one after another: learner, then course and provider, then completion date. */
  type WritingField = 'learner' | 'course' | 'date'
  const [writing, setWriting] = useState<Set<WritingField>>(new Set())
  const readTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const clearReadTimers = () => {
    readTimers.current.forEach(clearTimeout)
    readTimers.current = []
  }
  useEffect(() => clearReadTimers, [])
  const done = (field: WritingField) =>
    setWriting((prev) => {
      const next = new Set(prev)
      next.delete(field)
      return next
    })
  const at = (ms: number, fn: () => void) => readTimers.current.push(setTimeout(fn, ms))
  const [readSteps, setReadSteps] = useState<string[]>([])
  const [readStep, setReadStep] = useState(0)

  const certInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  // The preview is a closable full-screen view: Esc closes it (the drawer itself ignores Esc).
  useEffect(() => {
    if (!previewOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPreviewOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [previewOpen])

  /* Trash beside Change File: drops the file and anything read from it; typed fields stay. */
  const removeCertificate = () => {
    setFileError(null)
    clearReadTimers()
    setWriting(new Set())
    setCertificate(null)
    setCertificateFile(null)
    setReading(false)
    setRead(null)
    setKeptFor(null)
  }

  const onCertificate = (file: File) => {
    const problem = fileProblem(file)
    setFileError(problem)
    if (problem) return
    setKeptFor(null) // a new file asks about a name mismatch again
    setCertificate(file.name)
    // A PDF shows as its first page drawn to an image, so no browser PDF viewer (toolbar,
    // page list, grey surround) appears in the box or the preview.
    if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
      setCertificateFile(null)
      pdfPages(file)
        .then(({ pages, total }) => setCertificateFile({ url: pages[0], pages, total }))
        .catch(() => setCertificateFile(null))
    } else {
      const url = URL.createObjectURL(file)
      setCertificateFile({ url, pages: [url], total: 1 })
    }
    if (editing) return // adding a missing certificate to a record doesn't re-read it
    clearReadTimers()
    setReading(true)
    setRead(null)
    const fixed = lockedPersonId ?? (personId || undefined)
    setWriting(new Set<WritingField>(fixed ? ['course', 'date'] : ['learner', 'course', 'date']))
    /* The passes, as Create With AI names them: done ones tick, the running one pulses.
       No learner pass when the learner is already fixed. ~3s in all. */
    const steps = fixed
      ? ['Reading the certificate', 'Matching the course', 'Filling in the completion date']
      : ['Reading the certificate', 'Finding the learner', 'Matching the course', 'Filling in the completion date']
    setReadSteps(steps)
    setReadStep(0)
    const name = file.name.toLowerCase()

    if (name.includes('unreadable')) {
      at(3000, () => {
        setWriting(new Set())
        setReading(false)
        setRead({ learner: null, courseText: null, unreadable: true })
      })
      return
    }

    // What the certificate "says".
    const existing = name.includes('duplicate')
      ? records.find((r) => r.courseId && (!fixed || r.personId === fixed)) ?? records[0]
      : null
    const learner = existing
      ? personById(existing.personId)!.name
      : name.includes('mismatch')
        ? 'Paul Whitaker'
        : name.includes('several')
          ? 'S. Rivers' // Samantha Rivers and Sam Rivers both fit
          : personById(fixed ?? '2')!.name
    // Everyone the name could be ("S. Chen" fits Sarah Chen and Sam Chen).
    const matches = TRAINING_PEOPLE.filter((p) => samePerson(p.name, learner)).map((p) => p.id)
    const noDate = name.includes('nodate')
    const courseText = existing
      ? courses.find((c) => c.id === existing.courseId)?.name ?? null
      : name.includes('nomatch')
        ? 'Fire Safety Awareness'
        : 'First Aid at Work'
    const course = existing
      ? { id: existing.courseId ?? '', provider: existing.providerId ?? '' }
      : name.includes('nomatch')
        ? { id: '', provider: '' }
        : { id: 'c1', provider: 'p1' }
    const date = existing ? existing.completionDate : '2026-10-28'

    // Pass timings: read 0-900ms, then one pass per field, each landing as its pass ends.
    const learnerAt = fixed ? 900 : 1600
    const courseAt = fixed ? 2000 : 2300
    at(900, () => setReadStep(1))
    at(learnerAt, () => {
      // Fill the learner only when nobody is chosen yet and exactly one person fits the name.
      if (existing) setPersonId(existing.personId)
      else if (!fixed) setPersonId(matches.length === 1 ? matches[0] : '')
      done('learner')
      if (!fixed) setReadStep(2)
    })
    at(courseAt, () => {
      // A course that isn't on the approved list leaves Course empty; the Alert says why.
      if (course.id) {
        setCourseId(course.id)
        setProviderId(course.provider)
      }
      done('course')
      setReadStep(fixed ? 2 : 3)
    })
    at(3000, () => {
      if (!noDate) setCompletionDate(date)
      done('date')
      setReading(false)
      setRead({ learner, courseText, matches, noDate, unlisted: !course.id && !!courseText })
    })
  }

  /* ── Derived ── */
  const person = personById(personId)
  const mismatchKey = `${read?.learner}|${personId}`
  // The certificate names someone else; until the admin ticks the confirm box it blocks saving.
  const nameDiffers = !!(read?.learner && person && !samePerson(read.learner, person.name))
  const mismatch = nameDiffers && keptFor !== mismatchKey
  // More than one person fits the name and nobody is picked yet.
  const severalPeople = !!(read?.matches && read.matches.length > 1 && !person && !lockedPersonId)
  const unknownLearner = !!(read?.learner && !person && !lockedPersonId && !severalPeople)
  // The certificate's course isn't on the approved list and no approved course is picked yet.
  const unlistedCourse = !!read?.unlisted && !courseId
  const duplicate = useMemo(
    () =>
      courseId && personId && completionDate
        ? records.find(
            (r) => r.id !== record?.id && r.personId === personId && r.courseId === courseId && r.completionDate === completionDate,
          )
        : undefined,
    [records, record, courseId, personId, completionDate],
  )

  const keepStored =
    !!initialRecord &&
    !expiryTouched &&
    courseId === initialRecord.courseId &&
    completionDate === initialRecord.completionDate &&
    result === initialRecord.result
  const dueDate = keepStored
    ? initialRecord!.retrainingDueDate
    : course && completionDate
      ? retrainingDueDate(completionDate, retrains ? months : null, result)
      : null
  const preview: ExternalRecord | null = completionDate
    ? {
        id: '_preview', personId, courseId, providerId, completionDate,
        retrainingDueDate: dueDate, result, score: null, certificate: null, source: 'manual',
      }
    : null
  const due = preview ? dueState(preview, []) : null

  const errors = {
    learner: personId ? '' : 'Select a learner',
    course: courseId ? '' : 'Select a course',
    provider: providerId ? '' : 'Select a provider',
    date: completionDate ? '' : 'Add the completion date',
  }
  const hasErrors = Object.values(errors).some(Boolean)
  const err = (k: keyof typeof errors) => (submitted && errors[k] ? errors[k] : undefined)

  const save = () => {
    // An unconfirmed name mismatch: take the admin to the confirm box rather than doing nothing.
    if (mismatch) {
      confirmRef.current?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
      confirmRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
      return
    }
    setSubmitted(true)
    if (hasErrors) return
    const next: ExternalRecord = {
      // A matching record (D25) is updated in place rather than added twice.
      id: record?.id ?? duplicate?.id ?? newId('r'),
      personId,
      courseId,
      providerId,
      completionDate,
      // Editing keeps the stored due date unless the date, course or result changed (D9).
      retrainingDueDate: dueDate,
      result,
      score: score > 0 ? score : null,
      certificate,
      source: record?.source ?? (read && !read.unreadable ? 'ai' : 'manual'),
    }
    onSaved(next, !record && !duplicate)
  }

  /* 2.7: nothing on the approved list to record against. */
  const blocked = !editing && listEmpty

  /* Anything the certificate read couldn't settle, as one Alert. Order: the file, then
     the read, then the learner, the course, the date, and last an existing record (D25). */
  const certName = read?.learner ?? ''
  const problem: Problem | null = fileError
    ? fileError
    : read?.unreadable
      ? { title: "We couldn't read this certificate", message: 'Fill in the details below, or upload a clearer copy.' }
      : unknownLearner
        ? { title: 'Learner not found', message: `The certificate names ${certName}, who isn't in 5Mins. Pick the learner or change the file.` }
        : severalPeople
          ? { title: 'More than one learner matches', message: `${read!.matches!.length} people match ${certName}. Pick the right one.` }
          : mismatch
            ? { title: "The name doesn't match", message: `The certificate names ${certName}, not ${person?.name}. Confirm it's the same person, or change the file.` }
            : unlistedCourse
              ? {
                  title: 'Course not on your approved list',
                  message: `${read!.courseText} isn't on the list. Pick an approved course, or ${canAdd ? 'add it in the Approved list first' : 'ask your admin to add it'}.`,
                }
              : read?.noDate && !completionDate
                ? { title: "We couldn't find the completion date", message: 'Add the date the training was completed.' }
                : duplicate
                  ? {
                      title: 'This record already exists',
                      message: (
                        <>
                          {person?.name} already has <span className="aetd-strong">{course?.name}</span> completed on{' '}
                          {formatDay(duplicate.completionDate)}. Update Training replaces it with these details.
                        </>
                      ),
                    }
                  : null

  const personOptions = TRAINING_PEOPLE.map((p) => ({
    value: p.id,
    label: p.name,
    description: p.invited ? 'Invited' : p.email,
  }))

  return (
    <>
      <SideDrawer
        open={open}
        onClose={onClose}
        title={editing ? 'Edit external training' : 'Add external training'}
        subtitle="Record training done outside 5Mins against an approved course."
        footer={
          !blocked && (
            <Button onClick={save} disabled={reading || hasErrors}>
              {editing || duplicate ? 'Update Training' : 'Add Training'}
            </Button>
          )
        }
      >
        {blocked ? (
          <EmptyState
            illustration={<img src={emptyBox} alt="" width={72} height={72} />}
            title="No approved courses yet"
            description={
              learnerView
                ? 'Ask your admin to add courses to the approved list before recording training.'
                : 'Add courses to the approved list in External Training before recording training.'
            }
            primaryAction={
              learnerView
                ? undefined
                : { label: 'Go to Approved List', onClick: () => navigate('/learning-records/external?tab=approved-list') }
            }
          />
        ) : (
          <div className="aet-form">
            {/* Certificate first (D6, D14, D17) */}
            <div className="aet-field aetd-full">
              <span className="aet-label">
                Certificate <span className="aetd-label-hint">(PDF, JPG, PNG • max. 10MB)</span>
              </span>
              {/* Same row as Create Course > Course thumbnail (CourseDetailsTab): a small
                  box on the left (dashed while empty, the certificate once picked), the
                  copy and the button on the right. The box takes a dropped file too. */}
              <div className="aetd-cert-row">
                {/* Once a file is in, the whole box opens the preview. */}
                <div
                  className={`aetd-cert-box${certificate ? ' aetd-cert-box--filled' : ' aetd-cert-box--empty'}${certificateFile ? ' aetd-cert-box--previewable' : ''}${dragging ? ' aetd-cert-box--dragging' : ''}`}
                  {...(certificateFile
                    ? {
                        role: 'button',
                        tabIndex: 0,
                        'aria-label': 'Preview certificate',
                        onClick: () => setPreviewOpen(true),
                        onKeyDown: (e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setPreviewOpen(true)
                          }
                        },
                      }
                    : !certificate
                      ? {
                          /* Empty: the box is a drop zone that also opens the file picker,
                             as Upload Certificate does (file-uploader.md). */
                          role: 'button',
                          tabIndex: 0,
                          'aria-label': 'Upload certificate',
                          onClick: () => certInputRef.current?.click(),
                          onKeyDown: (e: React.KeyboardEvent) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              certInputRef.current?.click()
                            }
                          },
                        }
                      : {})}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragging(false)
                    const file = e.dataTransfer.files?.[0]
                    if (file) onCertificate(file)
                  }}
                >
                  {certificateFile ? (
                    <img className="aetd-cert-preview" src={certificateFile.url} alt="Certificate preview" />
                  ) : certificate ? (
                    <DocumentText size={32} color="var(--text-secondary)" variant="Bold" />
                  ) : (
                    <GalleryAdd size={32} color="var(--text-secondary)" variant="Linear" />
                  )}
                  {/* Preview badge, as the lesson thumbnail (LessonEditorModal): a cue only, the box is the button. */}
                </div>
                <div className="aetd-cert-info">
                  {/* Same copy once a file is in: the box shows the certificate, its file name adds nothing. */}
                  <p className="aetd-cert-copy">
                    {editing
                      ? 'Upload the certificate or drop it on the box.'
                      : "Upload the certificate or drop it on the box, and we'll fill in the details from it."}
                  </p>
                  <div className="aetd-cert-actions">
                    <Button
                      variant="outlined-2"
                      onClick={() => certInputRef.current?.click()}
                    >
                      {certificate ? 'Change File' : 'Upload Certificate'}
                    </Button>
                    {certificate && (
                      <Tooltip text="Remove" position="Top" icon={false}>
                        <button
                          type="button"
                          className="aetd-cert-remove"
                          aria-label="Remove"
                          onClick={removeCertificate}
                        >
                          <Trash size={20} color="currentColor" variant="Linear" />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                  <input
                    ref={certInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    aria-label="Upload certificate"
                    className="aetd-cert-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onCertificate(file)
                      e.target.value = ''
                    }}
                  />
                </div>
              </div>
            </div>

            {/* As Create With AI: the step list arrives with a short rise, ticks each pass
                as its field fills, and fades out when the read is done. */}
            <AnimatePresence initial={false}>
              {reading && (
                /* The card's height opens and closes too, so the form below slides down
                   and back up instead of jumping. The negative margin cancels the form's
                   24px gap (--space-l) while the card is closed, so nothing snaps at the
                   ends either. */
                <motion.div
                  key="reading"
                  style={{ overflow: 'hidden' }}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, height: 0, marginBottom: -24 }}
                  animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0, marginBottom: -24 }}
                  transition={arriveTransition(reduce)}
                >
                  <AIWorkingCard steps={readSteps} activeStep={readStep} lastStepDone={false} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* One Alert at a time, for the first problem the admin should fix (see `problem`). */}
            {problem && !reading && (
              <Alert
                type="Alert"
                customIcon={<Danger size={24} color="currentColor" variant="Bold" />}
                title={problem.title}
                message={problem.message}
              />
            )}

            <div>
              <div className="aet-form">
                {/* Learner. A certificate naming someone else is settled here, at the field:
                    the name it shows, and a box to confirm it is this learner (D8). */}
                <div className={`aet-field aetd-full${writing.has('learner') ? ' aetd-writing is-writing' : ''}`}>
                  <Dropdown
                    label="Learner"
                    placeholder="Select a learner"
                    searchable
                    searchPlaceholder="Search people"
                    readOnly={!!lockedPersonId}
                    className={lockedPersonId ? 'aetd-locked' : undefined}
                    options={personOptions}
                    value={personId}
                    onChange={setPersonId}
                    /* The certificate names someone who isn't in 5Mins: an error, since the
                       record can't go ahead until the right learner is picked or the file changed. */
                    /* The Alert explains; the field gets the error border and a short hint. */
                    error={
                      unknownLearner || severalPeople
                        ? 'Pick a learner'
                        : mismatch
                          ? `Certificate name: ${read!.learner}`
                          : err('learner')
                    }
                  />
                  {nameDiffers && (
                    /* Announced as it appears; Add Training sends focus here while unticked. */
                    <label ref={confirmRef} className="aetd-confirm" aria-live="polite">
                      <Checkbox
                        checked={!mismatch}
                        onChange={() => setKeptFor(mismatch ? mismatchKey : null)}
                      />
                      <span className="aetd-confirm__text">{person!.name} is the person named on this certificate</span>
                    </label>
                  )}
                </div>

                <div className={`aet-field aetd-full${writing.has('course') ? ' aetd-writing is-writing' : ''}`}>
                  <Dropdown
                    label="Course"
                    placeholder="Select a course"
                    searchable
                    searchPlaceholder="Search approved courses"
                    options={activeCourses.map((c) => ({
                      value: c.id,
                      label: c.name,
                      description: providers.filter((p) => c.providerIds.includes(p.id)).map((p) => p.name).join(', '),
                      thumbnail: courseThumb(c.id),
                    }))}
                    value={courseId}
                    onChange={setCourseId}
                    error={unlistedCourse ? `Certificate course: ${read!.courseText}` : err('course')}
                    emptyText={(q) => `No approved courses match “${q}”`}
                  />
                </div>

                {/* Provider: always a dropdown of the approved providers, so a record without a
                    certificate can be filled by hand (2026-11-12). The course's single provider
                    is pre-filled; with several, the admin picks. A plain alphabetical list. */}
                <div className="aet-field aetd-full">
                  <Dropdown
                    label="Provider"
                    placeholder="Select a provider"
                    searchable
                    searchPlaceholder="Search approved providers"
                    options={[...providers]
                      .filter((p) => !p.archived || p.id === providerId)
                      .sort((x, y) => x.name.localeCompare(y.name))
                      .map((p) => ({ value: p.id, label: p.name }))}
                    value={providerId}
                    onChange={setProviderId}
                    error={err('provider')}
                    emptyText={(q) => `No approved providers match “${q}”`}
                  />
                </div>

                {/* Duration, completion date and expiry on one row: the dates that make the
                    record, read together. Result and score follow on their own row. */}
                <div className="aet-row aetd-dates-row">
                  {/* Duration belongs to the approved course (edited in Settings), so it
                      shows read-only. */}
                  {course && (
                    <div className="aet-field">
                      <span className="aet-label">Duration</span>
                      <div className="aet-row aetd-readonly-row">
                        <InputInteger ariaLabel="Duration" value={course.duration.value} onChange={() => {}} disabled className="aetd-readonly" />
                        <Dropdown options={UNIT_OPTIONS} value={course.duration.unit} readOnly className="aet-unit aetd-readonly" />
                      </div>
                    </div>
                  )}
                  <div className={`aet-field aetd-date${writing.has('date') ? ' aetd-writing is-writing' : ''}`}>
                    <span className="aet-label">Completion date</span>
                    <DatePickerField
                      value={completionDate}
                      onChange={setCompletionDate}
                      maxDate={todayIso()}
                      ariaLabel="Completion date"
                      error={read?.noDate && !completionDate ? 'Add the date' : err('date')}
                    />
                  </div>
                </div>

                <div className="aet-row">
                  <Dropdown
                    label="Result"
                    options={RESULT_OPTIONS}
                    value={result}
                    onChange={(v) => setResult(v as ExternalResult)}
                    className="aetd-result"
                  />
                  <div className="aet-field">
                    <span className="aet-label">Score <span className="aetd-optional">(optional)</span></span>
                    <InputInteger value={score} onChange={setScore} min={0} max={100} suffix="%" ariaLabel="Score" />
                  </div>
                </div>

                {/* Expiry: pre-set from the course rule, the admin can change it for this record. */}
                {course &&
                  (result === 'Not Passed' ? (
                    <div className="aet-field">
                      <span className="aet-label">Expiry</span>
                      <span className="aetd-value">No expiry date for a training that wasn't passed.</span>
                    </div>
                  ) : (
                    <div className="aet-field" role="radiogroup" aria-labelledby="aetd-expiry-label">
                      <span id="aetd-expiry-label" className="aet-label">Expiry</span>
                      <Radio name="aetd-expiry" label="No expiry" checked={!retrains} onChange={() => touchExpiry(false)} />
                      <div className="aet-row aet-row--center">
                        <Radio name="aetd-expiry" label="Expires after" checked={retrains} onChange={() => touchExpiry(true)} />
                        <InputInteger
                          ariaLabel="Expires after, in months"
                          value={months}
                          onChange={(v) => touchExpiry(true, v)}
                          min={1}
                          max={240}
                          suffix="months"
                          disabled={!retrains}
                        />
                      </div>
                      {dueDate && (
                        <div className="aetd-due" role="status">
                          <span className="aetd-value">Expires {formatDay(dueDate)}</span>
                          {due === 'overdue' && <Badge type="error" label="Overdue" />}
                          {due === 'due-soon' && <Badge type="warning" label="Due soon" />}
                        </div>
                      )}
                    </div>
                  ))}

              </div>
            </div>
          </div>
        )}

        {/* Certificate preview: the file alone, centred over the scrim. The backdrop or Esc
            closes it. Inside the drawer panel so its focus trap keeps it reachable. */}
        {previewOpen && certificateFile && (
          <div className="aetd-cert-full" role="dialog" aria-modal="true" aria-label="Certificate" onClick={() => setPreviewOpen(false)}>
            <CloseButton variant="fullscreen" className="aetd-cert-full__close" onClick={() => setPreviewOpen(false)} />
            {/* Every page, one under the other; the overlay scrolls when they don't fit. */}
            {certificateFile.pages.map((src, i) => (
              <img
                key={i}
                className="aetd-cert-full__file"
                src={src}
                alt={certificateFile.pages.length > 1 ? `Certificate, page ${i + 1}` : 'Certificate'}
                onClick={(e) => e.stopPropagation()}
              />
            ))}
            {certificateFile.total > certificateFile.pages.length && (
              <p className="aetd-cert-full__more">
                Showing the first {certificateFile.pages.length} of {certificateFile.total} pages
              </p>
            )}
          </div>
        )}
      </SideDrawer>
    </>
  )
}

export default AddExternalTrainingDrawer
