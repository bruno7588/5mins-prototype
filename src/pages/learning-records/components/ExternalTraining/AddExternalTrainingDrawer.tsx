import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Danger, DocumentText, Eye, GalleryAdd, Trash } from 'iconsax-react'
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
import InputField from '@/components/InputField/InputField'
import InputInteger from '@/components/InputInteger/InputInteger'
import Radio from '@/components/Radio/Radio'
import SideDrawer from '@/components/SideDrawer/SideDrawer'
import Tooltip from '@/components/Tooltip/Tooltip'
import emptyBox from '@/assets/empty-state-illustrations/empty-box.svg'
import '@/pages/account/components/ExternalTraining/ExternalTraining.css'
import {
  courseThumb,
  TRAINING_PEOPLE,
  addCourses,
  dueState,
  duplicateProvider,
  durationLabel,
  formatDay,
  isFullAdmin,
  newId,
  personById,
  retrainingDueDate,
  todayIso,
  useExternalTraining,
  type DurationUnit,
  type ExternalCourse,
  type ExternalProvider,
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

/** 'not-listed': the course isn't on the approved list; the admin adds it to the list
    or records a one-off, in place (Revolut-style "not listed" link in the menu). */
type Mode = 'course' | 'not-listed'
type NotListedAs = 'list' | 'one-off'
/** What the read found. `matches`: the learners whose name fits (more than one = ask).
    `noDate`: the certificate shows no completion date. */
type Read = { learner: string | null; courseText: string | null; unreadable?: boolean; matches?: string[]; noDate?: boolean }

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

/** A one-off's stored duration ("2 days") back into the stepper and unit. */
const parseDuration = (text: string | undefined): { value: number; unit: DurationUnit } => {
  const m = text?.match(/^(\d+)\s*(minute|hour|day)/i)
  return m ? { value: Number(m[1]), unit: `${m[2].toLowerCase()}s` as DurationUnit } : { value: 0, unit: 'hours' }
}

interface Props {
  /** Set false to close; the drawer plays its exit, so keep it mounted. */
  open: boolean
  /** Recording from a person's profile: the learner is fixed. */
  lockedPersonId?: string
  /** Edit an existing record. */
  record?: ExternalRecord | null
  /** A learner recording their own training (Profile): can't add to the approved list. */
  learnerView?: boolean
  onClose: () => void
  onSaved: (record: ExternalRecord, isNew: boolean) => void
}

/* Course field ↔ not-listed block: one screen replacing another inside the drawer
   (motion.md: AnimatePresence mode="wait", arrive in, rise out; opacity only when reduced). */
const SWAP = (reduce: boolean | null) => ({
  initial: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: reduce ? { opacity: 0 } : { opacity: 0, y: -16 },
  transition: arriveTransition(reduce),
})

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
  const { courses, providers, records, allowOneOffs } = useExternalTraining()
  const [record] = useState<ExternalRecord | null>(initialRecord)
  const editing = !!record
  const reduce = useReducedMotion()
  /* Set by the "Not on the approved list" click, so Course name takes focus when it arrives. */
  const [focusName, setFocusName] = useState(false)


  /* Ways out when the course isn't listed: full admins can add it to the list (D21),
     anyone can record a one-off while the tenant allows them. */
  const canAdd = !learnerView && isFullAdmin()
  const canOneOff = allowOneOffs || !!(initialRecord && !initialRecord.courseId)
  const listEmpty = courses.every((c) => c.archived)

  /* ── Form state ── */
  const initialDuration = parseDuration(initialRecord?.oneOff?.duration)
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
  const [mode, setMode] = useState<Mode>(
    (initialRecord && !initialRecord.courseId) || (!initialRecord && listEmpty) ? 'not-listed' : 'course',
  )
  const [notListedAs, setNotListedAs] = useState<NotListedAs>(
    initialRecord && !initialRecord.courseId ? 'one-off' : canAdd ? 'list' : 'one-off',
  )
  const [courseId, setCourseId] = useState(initialRecord?.courseId ?? '')
  const [providerId, setProviderId] = useState(initialRecord?.providerId ?? '')
  const [completionDate, setCompletionDate] = useState(initialRecord?.completionDate ?? '')
  const [result, setResult] = useState<ExternalResult>(initialRecord?.result ?? 'Passed')
  const [score, setScore] = useState(initialRecord?.score ?? 0)
  const [newName, setNewName] = useState(initialRecord?.oneOff?.name ?? '')
  const [newProvider, setNewProvider] = useState(initialRecord?.oneOff?.provider ?? '')
  const [newDuration, setNewDuration] = useState(initialDuration.value)
  const [newUnit, setNewUnit] = useState<DurationUnit>(initialDuration.unit)
  const [retrains, setRetrains] = useState(false) // No expiry until the admin picks a rule
  const [months, setMonths] = useState(12)
  const [oneOffDue, setOneOffDue] = useState(initialRecord && !initialRecord.courseId ? initialRecord.retrainingDueDate ?? '' : '')
  const [submitted, setSubmitted] = useState(false)
  /* The confirm box under Learner: the admin confirms the certificate is this learner's
     (married name, nickname, a misread). Tied to the pair, so changing either asks again. */
  const [keptFor, setKeptFor] = useState<string | null>(null)
  const confirmRef = useRef<HTMLLabelElement>(null)

  const openNotListed = (name: string) => {
    setMode('not-listed')
    setCourseId('')
    if (name) setNewName(name)
  }

  const activeCourses = courses.filter((c) => !c.archived || c.id === courseId)
  const course = courses.find((c) => c.id === courseId)
  const courseProviders = course
    ? providers.filter((p) => course.providerIds.includes(p.id) && (!p.archived || p.id === providerId))
    : []

  // A course with one provider fills it in; several → the admin picks one (D2).
  useEffect(() => {
    if (!course) return
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
      // A course that isn't listed opens the not-listed block with its name filled in.
      if (course.id) {
        setMode('course')
        setCourseId(course.id)
        setProviderId(course.provider)
      } else if (courseText && (canAdd || canOneOff)) {
        openNotListed(courseText)
      }
      done('course')
      setReadStep(fixed ? 2 : 3)
    })
    at(3000, () => {
      if (!noDate) setCompletionDate(date)
      done('date')
      setReading(false)
      setRead({ learner, courseText, matches, noDate })
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
  const fromCertificate = mode === 'not-listed' && !!read?.courseText && newName === read.courseText
  const addingToList = mode === 'not-listed' && notListedAs === 'list'
  const listed = newName.trim()
    ? courses.find((c) => !c.archived && c.name.trim().toLowerCase() === newName.trim().toLowerCase())
    : undefined
  const duplicate = useMemo(
    () =>
      mode === 'course' && courseId && personId && completionDate
        ? records.find(
            (r) => r.id !== record?.id && r.personId === personId && r.courseId === courseId && r.completionDate === completionDate,
          )
        : undefined,
    [records, record, mode, courseId, personId, completionDate],
  )

  const dueDate =
    mode === 'course'
      ? course && completionDate
        ? retrainingDueDate(completionDate, course.retrainingMonths, result)
        : null
      : addingToList
        ? completionDate
          ? retrainingDueDate(completionDate, retrains ? months : null, result)
          : null
        : result === 'Passed'
          ? oneOffDue || null
          : null
  const preview: ExternalRecord | null = completionDate
    ? {
        id: '_preview', personId, courseId: courseId || null, providerId: providerId || null, completionDate,
        retrainingDueDate: dueDate, result, score: null, certificate: null, source: 'manual',
      }
    : null
  const due = preview ? dueState(preview, []) : null

  const errors = {
    learner: personId ? '' : 'Select a learner',
    course: mode === 'course' && !courseId ? 'Select a course' : '',
    provider: mode === 'course' && courseId && !providerId ? 'Select a provider' : '',
    newName:
      mode !== 'not-listed'
        ? ''
        : !newName.trim()
          ? 'Add the course name'
          : listed
            ? 'Already on the approved list. Choose it from the list.'
            : '',
    newProvider: mode === 'not-listed' && !newProvider.trim() ? 'Add the provider name' : '',
    newDuration: addingToList && newDuration <= 0 ? 'Add a duration' : '',
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
    /* Add to the approved list: the course (and its provider, if new) goes on the list
       first, then the record points at it, like any other listed course. */
    let savedCourseId = mode === 'course' ? courseId : null
    let savedProviderId = mode === 'course' ? providerId : null
    if (addingToList) {
      const existing = duplicateProvider(newProvider)
      const provider: ExternalProvider = existing ?? { id: newId('p'), name: newProvider.trim(), archived: false }
      const added: ExternalCourse = {
        id: newId('c'),
        name: newName.trim(),
        providerIds: [provider.id],
        duration: { value: newDuration, unit: newUnit },
        retrainingMonths: retrains ? months : null,
        otherNames: [],
        archived: false,
      }
      addCourses([added], existing ? [] : [provider])
      savedCourseId = added.id
      savedProviderId = provider.id
    }
    const next: ExternalRecord = {
      // A matching record (D25) is updated in place rather than added twice.
      id: record?.id ?? duplicate?.id ?? newId('r'),
      personId,
      courseId: savedCourseId,
      providerId: savedProviderId,
      oneOff:
        mode === 'not-listed' && notListedAs === 'one-off'
          ? {
              name: newName.trim(),
              provider: newProvider.trim(),
              duration: newDuration > 0 ? durationLabel({ value: newDuration, unit: newUnit }) : '',
            }
          : undefined,
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

  /* 2.7: nothing to record against, one-offs are off and the admin can't add to the list. */
  const blocked = !editing && listEmpty && !allowOneOffs && !canAdd
  const bothWays = canAdd && canOneOff

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
            : fromCertificate
              ? {
                  title: 'Course not on your approved list',
                  message: `${read!.courseText} isn't on the list. ${bothWays ? 'Add it to the list, or record it as a one-off.' : canAdd ? 'Add it to the list to record it.' : 'Record it as a one-off.'}`,
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
                  {certificateFile && (
                    <span className="aetd-cert-preview-btn" aria-hidden="true">
                      <Eye size={16} color="currentColor" variant="Linear" />
                    </span>
                  )}
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

                {/* Course, or the not-listed block: a swap, so it animates (motion.md) */}
                <AnimatePresence mode="wait" initial={false}>
                {mode === 'course' ? (
                  <motion.div
                    key="course"
                    {...SWAP(reduce)}
                    className={`aet-field aetd-full${writing.has('course') ? ' aetd-writing is-writing' : ''}`}
                  >
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
                      error={err('course')}
                      emptyText={(q) => `No approved courses match “${q}”`}
                      /* One way out, pinned at the bottom of the menu (Revolut-style). */
                      footerLink={
                        canAdd || canOneOff
                          ? {
                              label: 'Not on the approved list',
                              onClick: (q) => {
                                // Only an admin's click moves focus; a certificate read doesn't.
                                setFocusName(true)
                                openNotListed(q)
                              },
                            }
                          : undefined
                      }
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="not-listed"
                    {...SWAP(reduce)}
                    className="aet-field aetd-full"
                  >
                    <div className="aetd-oneoff-head">
                      <span className="aet-label">Not on the approved list</span>
                      {!listEmpty && (
                        <Button variant="text" onClick={() => setMode('course')}>
                          Select From Approved List
                        </Button>
                      )}
                    </div>
                    {/* The heading and the way back sit outside the card, as its label. */}
                    <div className={`aetd-not-listed${writing.has('course') ? ' aetd-writing is-writing' : ''}`}>
                    {/* The choice first: it decides which fields follow. Then the same order as Settings → Add course. */}
                    {bothWays && (
                      <div className="aetd-choices" role="radiogroup" aria-label="How to record it">
                        {(
                          [
                            ['list', 'Add to the approved list', 'Future records and uploads match it'],
                            ['one-off', 'Record as a one-off', 'This record only'],
                          ] as const
                        ).map(([value, title, desc]) => (
                          <label key={value} className="aetd-choice">
                            <Radio
                              name="aetd-not-listed"
                              checked={notListedAs === value}
                              onChange={() => setNotListedAs(value)}
                              aria-describedby={`aetd-choice-${value}`}
                            />
                            <span className="aetd-choice__text">
                              <span className="aetd-choice__title">{title}</span>
                              <span id={`aetd-choice-${value}`} className="aetd-choice__desc">
                                {desc}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                    <InputField
                      label="Course name"
                      autoFocus={focusName}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      validation={err('newName') ? 'error' : 'none'}
                      helperText={err('newName') ?? (fromCertificate ? 'From the certificate.' : undefined)}
                    />
                    <InputField
                      label="Provider name"
                      placeholder="For example, St John Ambulance"
                      value={newProvider}
                      onChange={(e) => setNewProvider(e.target.value)}
                      validation={err('newProvider') ? 'error' : 'none'}
                      helperText={err('newProvider')}
                    />
                    <div className="aet-field">
                      <span className="aet-label">
                        Duration {!addingToList && <span className="aetd-optional">(optional)</span>}
                      </span>
                      <div className="aet-row">
                        <InputInteger
                          ariaLabel="Duration"
                          value={newDuration}
                          onChange={setNewDuration}
                          min={0}
                          validation={err('newDuration') ? 'error' : 'none'}
                          helperText={err('newDuration')}
                        />
                        <Dropdown
                          options={UNIT_OPTIONS}
                          value={newUnit}
                          onChange={(v) => setNewUnit(v as DurationUnit)}
                          className="aet-unit"
                        />
                      </div>
                    </div>
                    {addingToList && (
                      <div className="aet-field" role="radiogroup" aria-labelledby="aetd-expiry-label">
                        <span id="aetd-expiry-label" className="aet-label">Expiry</span>
                        <Radio name="aetd-expiry" label="No expiry" checked={!retrains} onChange={() => setRetrains(false)} />
                        <div className="aet-row aet-row--center">
                          <Radio name="aetd-expiry" label="Expires after" checked={retrains} onChange={() => setRetrains(true)} />
                          <InputInteger
                            ariaLabel="Expires after, in months"
                            value={months}
                            onChange={(v) => {
                              setMonths(v)
                              setRetrains(true)
                            }}
                            min={1}
                            max={240}
                            suffix="months"
                            disabled={!retrains}
                          />
                        </div>
                      </div>
                    )}
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>

                {/* Provider, when the course has several (D2) */}
                {mode === 'course' && course && courseProviders.length > 1 && (
                  <div className="aet-field" role="radiogroup" aria-labelledby="aetd-provider-label">
                    <span id="aetd-provider-label" className="aet-label">Provider</span>
                    {courseProviders.map((p) => (
                      <Radio key={p.id} name="aetd-provider" label={p.name} checked={providerId === p.id} onChange={() => setProviderId(p.id)} />
                    ))}
                    {err('provider') && <span className="aetd-error">{err('provider')}</span>}
                  </div>
                )}
                {mode === 'course' && course && courseProviders.length === 1 && (
                  /* A course's only provider can't be changed: the same filled, read-only
                     field as the locked Learner and the read-only Duration. */
                  <div className="aet-field aetd-full">
                    <Dropdown
                      label="Provider"
                      options={[{ value: courseProviders[0].id, label: courseProviders[0].name }]}
                      value={courseProviders[0].id}
                      readOnly
                      className="aetd-locked"
                    />
                  </div>
                )}

                {/* Duration, completion date and expiry on one row: the dates that make the
                    record, read together. Result and score follow on their own row. */}
                <div className="aet-row aetd-dates-row">
                  {/* Duration belongs to the approved course (edited in Settings), so it
                      shows read-only, in the same stepper as the not-listed block. */}
                  {mode === 'course' && course && (
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
                  {mode === 'not-listed' && notListedAs === 'one-off' && result === 'Passed' && (
                    <div className="aet-field aetd-date">
                      <span className="aet-label">Expiry date <span className="aetd-optional">(optional)</span></span>
                      <DatePickerField value={oneOffDue} onChange={setOneOffDue} minDate={completionDate || undefined} ariaLabel="Expiry date" />
                    </div>
                  )}
                  {((mode === 'course' && course) || addingToList) && completionDate && (
                    /* Worked out from the course, so a read-only field like Duration. */
                    <div className="aet-field">
                      <span className="aet-label">Expiry</span>
                      <div className="aetd-due" role="status">
                        {result === 'Not Passed' ? (
                          <span className="aetd-value">No expiry date for a training that wasn't passed.</span>
                        ) : dueDate ? (
                          <>
                            <span className="aetd-value">{formatDay(dueDate)}</span>
                            {due === 'overdue' && <Badge type="error" label="Overdue" />}
                            {due === 'due-soon' && <Badge type="warning" label="Due soon" />}
                          </>
                        ) : (
                          <span className="aetd-value">No expiry</span>
                        )}
                      </div>
                    </div>
                  )}
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
