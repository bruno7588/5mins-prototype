import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Danger } from 'iconsax-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import AIWorkingCard from '@/components/AIWorkingCard/AIWorkingCard'
import { arriveTransition } from '@/components/AIWorkingCard/arrive'
import Alert from '@/components/Alert/Alert'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import DatePickerField from '@/components/DatePickerField/DatePickerField'
import Dropdown from '@/components/Dropdown/Dropdown'
import EmptyState from '@/components/EmptyState/EmptyState'
import FileUploader from '@/components/FileUploader/FileUploader'
import InputField from '@/components/InputField/InputField'
import InputInteger from '@/components/InputInteger/InputInteger'
import Radio from '@/components/Radio/Radio'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import emptyBox from '@/assets/empty-state-illustrations/empty-box.svg'
import '@/pages/account/components/ExternalTraining/ExternalTraining.css'
import {
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
     anything else     → First Aid at Work, St John Ambulance, 28 Oct 2026
   Prefix: aetd- */

/** 'not-listed': the course isn't on the approved list; the admin adds it to the list
    or records a one-off, in place (Revolut-style "not listed" link in the menu). */
type Mode = 'course' | 'not-listed'
type NotListedAs = 'list' | 'one-off'
type Read = { learner: string | null; courseText: string | null; unreadable?: boolean }

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

/** Same person if the surname matches and the first names share an initial ("S. Chen" ≈ "Sarah Chen"). */
const samePerson = (a: string, b: string) => {
  const parts = (n: string) => n.toLowerCase().replace(/\./g, '').trim().split(/\s+/)
  const [pa, pb] = [parts(a), parts(b)]
  return pa[pa.length - 1] === pb[pb.length - 1] && pa[0][0] === pb[0][0]
}

interface Props {
  /** Recording from a person's profile: the learner is fixed. */
  lockedPersonId?: string
  /** Edit an existing record. */
  record?: ExternalRecord | null
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

function AddExternalTrainingDrawer({ lockedPersonId, record: initialRecord = null, onClose, onSaved }: Props) {
  const navigate = useNavigate()
  const { courses, providers, records, allowOneOffs } = useExternalTraining()
  const [record, setRecord] = useState<ExternalRecord | null>(initialRecord)
  const editing = !!record
  const reduce = useReducedMotion()
  /* Set by the "Not on the approved list" click, so Course name takes focus when it arrives. */
  const [focusName, setFocusName] = useState(false)

  const panelRef = useRef<HTMLElement>(null)
  useOverlayA11y(panelRef, true)

  /* Ways out when the course isn't listed: full admins can add it to the list (D21),
     anyone can record a one-off while the tenant allows them. */
  const canAdd = isFullAdmin()
  const canOneOff = allowOneOffs || !!(initialRecord && !initialRecord.courseId)
  const listEmpty = courses.every((c) => c.archived)

  /* ── Form state ── */
  const initialDuration = parseDuration(initialRecord?.oneOff?.duration)
  const [certificate, setCertificate] = useState<string | null>(initialRecord?.certificate ?? null)
  /* The picked file itself, so the drop zone can show the certificate (a saved record
     only has its file name, so it falls back to the name). */
  const [certificateFile, setCertificateFile] = useState<{ url: string; pdf: boolean } | null>(null)
  useEffect(() => () => { if (certificateFile) URL.revokeObjectURL(certificateFile.url) }, [certificateFile])
  const [reading, setReading] = useState(false)
  const [read, setRead] = useState<Read | null>(null)
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
  const [retrains, setRetrains] = useState(true)
  const [months, setMonths] = useState(12)
  const [oneOffDue, setOneOffDue] = useState(initialRecord && !initialRecord.courseId ? initialRecord.retrainingDueDate ?? '' : '')
  const [submitted, setSubmitted] = useState(false)

  const openNotListed = (name: string) => {
    setMode('not-listed')
    setCourseId('')
    if (name) setNewName(name)
  }

  const loadRecord = (r: ExternalRecord) => {
    const d = parseDuration(r.oneOff?.duration)
    setRecord(r)
    setCertificate(r.certificate)
    setRead(null)
    setPersonId(r.personId)
    setMode(r.courseId ? 'course' : 'not-listed')
    if (!r.courseId) setNotListedAs('one-off')
    setCourseId(r.courseId ?? '')
    setProviderId(r.providerId ?? '')
    setCompletionDate(r.completionDate)
    setResult(r.result)
    setScore(r.score ?? 0)
    setNewName(r.oneOff?.name ?? '')
    setNewProvider(r.oneOff?.provider ?? '')
    setNewDuration(d.value)
    setNewUnit(d.unit)
    setOneOffDue(r.courseId ? '' : r.retrainingDueDate ?? '')
    setSubmitted(false)
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

  const onCertificate = (file: File) => {
    setCertificate(file.name)
    setCertificateFile({ url: URL.createObjectURL(file), pdf: file.type === 'application/pdf' || /\.pdf$/i.test(file.name) })
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
        : personById(fixed ?? '2')!.name
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
      // Fill the learner only when nobody is chosen yet and the name is someone we know.
      if (existing) setPersonId(existing.personId)
      else if (!fixed) setPersonId(TRAINING_PEOPLE.find((p) => samePerson(p.name, learner))?.id ?? '')
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
      setCompletionDate(date)
      done('date')
      setReading(false)
      setRead({ learner, courseText })
    })
  }

  const clearCertificate = () => {
    clearReadTimers()
    setWriting(new Set())
    setCertificate(null)
    setCertificateFile(null)
    setReading(false)
    setRead(null)
  }

  /* ── Derived ── */
  const person = personById(personId)
  const mismatch = !!(read?.learner && person && !samePerson(read.learner, person.name))
  const unknownLearner = !!(read?.learner && !person && !lockedPersonId)
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
      id: record?.id ?? newId('r'),
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
    onSaved(next, !record)
  }

  /* 2.7: nothing to record against, one-offs are off and the admin can't add to the list. */
  const blocked = !editing && listEmpty && !allowOneOffs && !canAdd
  const bothWays = canAdd && canOneOff

  const personOptions = TRAINING_PEOPLE.map((p) => ({
    value: p.id,
    label: p.name,
    description: p.invited ? 'Invited' : p.email,
  }))

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        tabIndex={-1}
        className="side-drawer aet-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aetd-title"
      >
        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <div className="aet-drawer__heading">
              <h2 id="aetd-title" className="aet-drawer__title">{editing ? 'Edit external training' : 'Add external training'}</h2>
              <p className="aet-text">Record training done outside 5Mins against an approved course.</p>
            </div>
            <CloseButton onClick={onClose} />
          </div>
          <div className="modal__divider" />
        </div>

        <div className="side-drawer__content">
          {blocked ? (
            <EmptyState
              illustration={<img src={emptyBox} alt="" width={72} height={72} />}
              title="No approved courses yet"
              description="Add courses to the approved list in Account and Settings before recording training."
              primaryAction={{ label: 'Go to Settings', onClick: () => navigate('/account?tab=external-training') }}
            />
          ) : (
            <div className="aet-form">
              {/* Certificate first (D6, D14, D17) */}
              <div className="aet-field aetd-full">
                <span className="aet-label">Certificate (PDF, JPG, PNG • max. 10MB)</span>
                <FileUploader
                  size="L"
                  className="aetd-uploader"
                  accept=".pdf,.jpg,.jpeg,.png"
                  state={certificate ? 'Filled' : 'Enabled'}
                  fileName={certificate ?? undefined}
                  helpText={editing ? 'Drag and drop the certificate here or click to upload' : "Drag & drop or upload the certificate, and we'll fill in the details from it."}
                  onFileSelect={onCertificate}
                  onChangeFile={clearCertificate}
                  /* The certificate itself, so the admin can check it against the
                     filled fields (a DS exception: filledPreview is otherwise for crops). */
                  filledPreview={
                    certificateFile ? (
                      certificateFile.pdf ? (
                        <iframe className="aetd-cert-preview" src={`${certificateFile.url}#toolbar=0&navpanes=0`} title="Certificate preview" />
                      ) : (
                        <img className="aetd-cert-preview" src={certificateFile.url} alt="Certificate preview" />
                      )
                    ) : undefined
                  }
                />
                {certificateFile && certificate && (
                  <div className="aetd-cert-meta">
                    <span className="aetd-cert-name" title={certificate}>{certificate}</span>
                    <Button variant="text" onClick={clearCertificate}>
                      Change File
                    </Button>
                  </div>
                )}
              </div>

              {/* As Create With AI: the step list arrives with a short rise, ticks each pass
                  as its field fills, and fades out when the read is done. */}
              <AnimatePresence initial={false}>
                {reading && (
                  <motion.div
                    key="reading"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={arriveTransition(reduce)}
                  >
                    <AIWorkingCard steps={readSteps} activeStep={readStep} lastStepDone={false} />
                  </motion.div>
                )}
              </AnimatePresence>

              {read?.unreadable && <Alert type="Callout" message="We couldn't read this certificate. Fill in the details below." />}

              <div>
                <div className="aet-form">
                  {/* Learner */}
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
                      error={err('learner')}
                      helperText={unknownLearner ? `The certificate names ${read!.learner}. Pick the learner.` : undefined}
                    />
                    {mismatch && (
                      <Alert
                        type="Alert"
                        customIcon={<Danger size={24} color="currentColor" variant="Bold" />}
                        message={`This certificate names ${read!.learner}, not ${person!.name}. Check you've uploaded the right file.`}
                        button
                        buttonLabel="Change File"
                        onButtonClick={clearCertificate}
                      />
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
                        options={activeCourses.map((c) => ({ value: c.id, label: c.name }))}
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
                    <div className="aet-field">
                      <span className="aet-label">Provider</span>
                      <span className="aetd-value">{courseProviders[0].name}</span>
                    </div>
                  )}

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

                  {/* Completion date, result and score (optional) on one row */}
                  <div className="aet-row">
                    <div className={`aet-field aetd-date${writing.has('date') ? ' aetd-writing is-writing' : ''}`}>
                      <span className="aet-label">Completion date</span>
                      <DatePickerField
                        value={completionDate}
                        onChange={setCompletionDate}
                        maxDate={todayIso()}
                        ariaLabel="Completion date"
                        error={err('date')}
                      />
                    </div>
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

                  {mode === 'not-listed' && notListedAs === 'one-off' && result === 'Passed' && (
                    <div className="aet-field">
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

                  {duplicate && (
                    <Alert
                      type="Callout"
                      message={`${person?.name} already has ${course?.name} completed on ${formatDay(duplicate.completionDate)}.`}
                      button
                      buttonLabel="Edit Existing Record"
                      onButtonClick={() => loadRecord(duplicate)}
                    />
                  )}

                </div>
              </div>
            </div>
          )}
        </div>

        {!blocked && (
          <div className="side-drawer__footer">
            <div className="side-drawer__footer-divider" />
            <div className="side-drawer__buttons">
              <Button onClick={save} disabled={reading || hasErrors}>
                {editing ? 'Save Changes' : 'Add Training'}
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

export default AddExternalTrainingDrawer
