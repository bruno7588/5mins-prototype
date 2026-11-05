import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Add, Danger } from 'iconsax-react'
import AIWorkingCard from '@/components/AIWorkingCard/AIWorkingCard'
import Alert from '@/components/Alert/Alert'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import Collapse from '@/components/Collapse/Collapse'
import DatePickerField from '@/components/DatePickerField/DatePickerField'
import Dropdown from '@/components/Dropdown/Dropdown'
import EmptyState from '@/components/EmptyState/EmptyState'
import FileUploader from '@/components/FileUploader/FileUploader'
import InputField from '@/components/InputField/InputField'
import InputInteger from '@/components/InputInteger/InputInteger'
import Radio from '@/components/Radio/Radio'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import emptyBox from '@/assets/empty-state-illustrations/empty-box.svg'
import CourseDrawer from '@/pages/account/components/ExternalTraining/CourseDrawer'
import '@/pages/account/components/ExternalTraining/ExternalTraining.css'
import {
  TRAINING_PEOPLE,
  dueState,
  durationLabel,
  formatDay,
  isFullAdmin,
  newId,
  personById,
  retrainingDueDate,
  todayIso,
  useExternalTraining,
  type ExternalRecord,
  type ExternalResult,
} from '@/data/externalTraining'
import './AddExternalTrainingDrawer.css'

/* Add / Edit external training (DES-336 Phase 2, PRD 2.1-2.8).

   Certificate first: dropping a file "reads" it and fills learner, course and
   completion date for the admin to check. Fill In Manually is always there (D14),
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

type Mode = 'course' | 'one-off'
type Read = { learner: string | null; courseText: string | null; unreadable?: boolean }

const RESULT_OPTIONS = [
  { value: 'Passed', label: 'Passed' },
  { value: 'Not Passed', label: 'Not Passed' },
]

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

function AddExternalTrainingDrawer({ lockedPersonId, record: initialRecord = null, onClose, onSaved }: Props) {
  const navigate = useNavigate()
  const { courses, providers, records, allowOneOffs } = useExternalTraining()
  const [record, setRecord] = useState<ExternalRecord | null>(initialRecord)
  const editing = !!record

  const [courseDrawer, setCourseDrawer] = useState<string | null>(null) // initial name
  const panelRef = useRef<HTMLElement>(null)
  // Paused while Add Course is open on top, so the two focus traps never fight.
  useOverlayA11y(panelRef, courseDrawer === null)

  /* ── Form state ── */
  const [certificate, setCertificate] = useState<string | null>(initialRecord?.certificate ?? null)
  const [reading, setReading] = useState(false)
  const [read, setRead] = useState<Read | null>(null)
  const [manual, setManual] = useState(editing)
  const [personId, setPersonId] = useState(initialRecord?.personId ?? lockedPersonId ?? '')
  const [mode, setMode] = useState<Mode>(initialRecord && !initialRecord.courseId ? 'one-off' : 'course')
  const [courseId, setCourseId] = useState(initialRecord?.courseId ?? '')
  const [providerId, setProviderId] = useState(initialRecord?.providerId ?? '')
  const [completionDate, setCompletionDate] = useState(initialRecord?.completionDate ?? '')
  const [result, setResult] = useState<ExternalResult>(initialRecord?.result ?? 'Passed')
  const [score, setScore] = useState(initialRecord?.score ?? 0)
  const [oneOffName, setOneOffName] = useState(initialRecord?.oneOff?.name ?? '')
  const [oneOffProvider, setOneOffProvider] = useState(initialRecord?.oneOff?.provider ?? '')
  const [oneOffDuration, setOneOffDuration] = useState(initialRecord?.oneOff?.duration ?? '')
  const [oneOffDue, setOneOffDue] = useState(initialRecord && !initialRecord.courseId ? initialRecord.retrainingDueDate ?? '' : '')
  const [submitted, setSubmitted] = useState(false)

  const loadRecord = (r: ExternalRecord) => {
    setRecord(r)
    setCertificate(r.certificate)
    setRead(null)
    setManual(true)
    setPersonId(r.personId)
    setMode(r.courseId ? 'course' : 'one-off')
    setCourseId(r.courseId ?? '')
    setProviderId(r.providerId ?? '')
    setCompletionDate(r.completionDate)
    setResult(r.result)
    setScore(r.score ?? 0)
    setOneOffName(r.oneOff?.name ?? '')
    setOneOffProvider(r.oneOff?.provider ?? '')
    setOneOffDuration(r.oneOff?.duration ?? '')
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

  /* ── Simulated certificate read ── */
  const readTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(readTimer.current), [])

  const onCertificate = (file: File) => {
    setCertificate(file.name)
    if (editing) return // adding a missing certificate to a record doesn't re-read it
    setReading(true)
    setRead(null)
    const name = file.name.toLowerCase()
    readTimer.current = setTimeout(() => {
      setReading(false)
      setManual(true)
      if (name.includes('unreadable')) {
        setRead({ learner: null, courseText: null, unreadable: true })
        return
      }
      const fixed = lockedPersonId ?? (personId || undefined)
      if (name.includes('duplicate')) {
        const existing = records.find((r) => r.courseId && (!fixed || r.personId === fixed)) ?? records[0]
        const who = personById(existing.personId)!
        setRead({ learner: who.name, courseText: courses.find((c) => c.id === existing.courseId)?.name ?? null })
        setPersonId(existing.personId)
        setMode('course')
        setCourseId(existing.courseId ?? '')
        setProviderId(existing.providerId ?? '')
        setCompletionDate(existing.completionDate)
        return
      }
      const learner = name.includes('mismatch') ? 'Paul Whitaker' : personById(fixed ?? '2')!.name
      // Fill the learner only when nobody is chosen yet and the name is someone we know.
      if (!fixed) setPersonId(TRAINING_PEOPLE.find((p) => samePerson(p.name, learner))?.id ?? '')
      if (name.includes('nomatch')) {
        setRead({ learner, courseText: 'Fire Safety Awareness' })
        setMode('course')
        setCourseId('')
        setProviderId('')
      } else {
        setRead({ learner, courseText: 'First Aid at Work' })
        setMode('course')
        setCourseId('c1')
        setProviderId('p1')
      }
      setCompletionDate('2026-10-28')
    }, 1500)
  }

  const clearCertificate = () => {
    clearTimeout(readTimer.current)
    setCertificate(null)
    setReading(false)
    setRead(null)
  }

  /* ── Derived ── */
  const person = personById(personId)
  const mismatch = !!(read?.learner && person && !samePerson(read.learner, person.name))
  const unknownLearner = !!(read?.learner && !person && !lockedPersonId)
  const noMatch = !!(read?.courseText && !read.unreadable && mode === 'course' && !courseId && !courses.some((c) => c.name === read.courseText))
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
    oneOffName: mode === 'one-off' && !oneOffName.trim() ? 'Add the training name' : '',
    oneOffProvider: mode === 'one-off' && !oneOffProvider.trim() ? 'Add the provider name' : '',
    date: completionDate ? '' : 'Add the completion date',
  }
  const hasErrors = Object.values(errors).some(Boolean)
  const err = (k: keyof typeof errors) => (submitted && errors[k] ? errors[k] : undefined)

  const save = () => {
    setSubmitted(true)
    if (hasErrors) return
    const next: ExternalRecord = {
      id: record?.id ?? newId('r'),
      personId,
      courseId: mode === 'course' ? courseId : null,
      providerId: mode === 'course' ? providerId : null,
      oneOff: mode === 'one-off' ? { name: oneOffName.trim(), provider: oneOffProvider.trim(), duration: oneOffDuration.trim() } : undefined,
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

  /* 2.7: nothing to record against and one-offs are off. */
  const blocked = !editing && courses.every((c) => c.archived) && !allowOneOffs
  const listEmpty = courses.every((c) => c.archived)
  const showFields = manual || editing

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
                  accept=".pdf,.jpg,.jpeg,.png"
                  state={certificate ? 'Filled' : undefined}
                  fileName={certificate ?? undefined}
                  helpText={editing ? 'Drag and drop the certificate here or click to upload' : "Upload the certificate and we'll fill in the details from it."}
                  onFileSelect={onCertificate}
                  onChangeFile={clearCertificate}
                />
                {!showFields && (
                  <Button variant="text-2" onClick={() => setManual(true)}>
                    Fill In Manually
                  </Button>
                )}
              </div>

              {reading && <AIWorkingCard singleLine steps={['Reading the certificate...']} activeStep={0} />}

              {read?.unreadable && <Alert type="Callout" message="We couldn't read this certificate. Fill in the details below." />}
              {read && !read.unreadable && !reading && (
                <Alert type="Callout" message="We filled in these details from the certificate. Check them before you save." />
              )}

              <Collapse open={showFields && !reading}>
                <div className="aet-form">
                  {/* Learner */}
                  <div className="aet-field aetd-full">
                    <Dropdown
                      label="Learner"
                      placeholder="Select a learner"
                      searchable
                      searchPlaceholder="Search people"
                      readOnly={!!lockedPersonId}
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

                  {/* Course (or one-off) */}
                  {mode === 'course' ? (
                    <div className="aet-field aetd-full">
                      <Dropdown
                        label="Course"
                        placeholder="Select a course"
                        searchable
                        searchPlaceholder="Search approved courses"
                        options={activeCourses.map((c) => ({ value: c.id, label: c.name }))}
                        value={courseId}
                        onChange={setCourseId}
                        error={err('course')}
                        helperText={
                          noMatch
                            ? `The certificate says “${read!.courseText}”. Pick the matching course, or add it to the approved list.`
                            : course
                              ? `Duration: ${durationLabel(course.duration)}`
                              : undefined
                        }
                      />
                      {listEmpty && allowOneOffs && (
                        <Alert type="Callout" message="Your approved list is empty. Add this course to it to keep records consistent." />
                      )}
                      <div className="aetd-links">
                        {isFullAdmin() && (
                          <Button
                            variant="text-2"
                            icon={<Add size={20} color="currentColor" variant="Linear" />}
                            onClick={() => setCourseDrawer(read?.courseText && noMatch ? read.courseText : '')}
                          >
                            Add Course to Approved List
                          </Button>
                        )}
                        {allowOneOffs && (
                          <Button variant="text-2" onClick={() => setMode('one-off')}>
                            Record as One-off
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="aet-field aetd-full">
                      <div className="aetd-oneoff-head">
                        <span className="aet-label">One-off training</span>
                        <Button variant="text-2" onClick={() => setMode('course')}>
                          Choose From Approved List
                        </Button>
                      </div>
                      <InputField
                        label="Training name"
                        value={oneOffName}
                        onChange={(e) => setOneOffName(e.target.value)}
                        validation={err('oneOffName') ? 'error' : 'none'}
                        helperText={err('oneOffName')}
                      />
                      <InputField
                        label="Provider name"
                        value={oneOffProvider}
                        onChange={(e) => setOneOffProvider(e.target.value)}
                        validation={err('oneOffProvider') ? 'error' : 'none'}
                        helperText={err('oneOffProvider')}
                      />
                      <InputField
                        label="Duration (optional)"
                        placeholder="For example, 2 days"
                        value={oneOffDuration}
                        onChange={(e) => setOneOffDuration(e.target.value)}
                      />
                    </div>
                  )}

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

                  {/* Completion date + retraining due */}
                  <div className="aet-field">
                    <span className="aet-label">Completion date</span>
                    <DatePickerField
                      value={completionDate}
                      onChange={setCompletionDate}
                      maxDate={todayIso()}
                      ariaLabel="Completion date"
                      error={err('date')}
                    />
                  </div>

                  {mode === 'one-off' && result === 'Passed' && (
                    <div className="aet-field">
                      <span className="aet-label">Retraining due date (optional)</span>
                      <DatePickerField value={oneOffDue} onChange={setOneOffDue} minDate={completionDate || undefined} ariaLabel="Retraining due date" />
                    </div>
                  )}

                  {mode === 'course' && course && completionDate && (
                    <div className="aetd-due" role="status">
                      {result === 'Not Passed' ? (
                        <span className="aet-text">No retraining due date for a training that wasn't passed.</span>
                      ) : dueDate ? (
                        <>
                          <span className="aetd-value">Retraining due {formatDay(dueDate)}</span>
                          {due === 'overdue' && <Badge type="error" label="Overdue" />}
                          {due === 'due-soon' && <Badge type="warning" label="Due soon" />}
                        </>
                      ) : (
                        <span className="aetd-value">No retraining</span>
                      )}
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

                  {/* Result and score (optional) */}
                  <div className="aet-row">
                    <Dropdown
                      label="Result"
                      options={RESULT_OPTIONS}
                      value={result}
                      onChange={(v) => setResult(v as ExternalResult)}
                      className="aetd-result"
                    />
                    <div className="aet-field">
                      <span className="aet-label">Score (optional)</span>
                      <InputInteger value={score} onChange={setScore} min={0} max={100} suffix="%" ariaLabel="Score" />
                    </div>
                  </div>
                </div>
              </Collapse>
            </div>
          )}
        </div>

        {!blocked && (
          <div className="side-drawer__footer">
            <div className="side-drawer__footer-divider" />
            <div className="side-drawer__buttons">
              <Button onClick={save} disabled={reading || !showFields}>
                {editing ? 'Save Changes' : 'Add Training'}
              </Button>
            </div>
          </div>
        )}
      </aside>

      {courseDrawer !== null && (
        <CourseDrawer
          course={null}
          initialName={courseDrawer}
          onClose={() => setCourseDrawer(null)}
          onSaved={(_name, _isNew, saved) => {
            setCourseDrawer(null)
            setMode('course')
            setCourseId(saved.id)
          }}
        />
      )}
    </>
  )
}

export default AddExternalTrainingDrawer
