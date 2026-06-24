import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Add, Edit2, GalleryAdd, PlayCircle, Refresh2, Sms, Trash } from 'iconsax-react'
import PageHeader from '../your-courses/components/PageHeader/PageHeader'
import Checkbox from '../../components/Checkbox/Checkbox'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import {
  loadDraftForBuilder,
  makeId,
  saveProgram,
  type CourseStep,
  type ProgramDraft,
  type ProgramStep,
  type ReleaseRule,
  type StepType,
} from './programStore'
import { getCatalogCourse, type CatalogCourse } from './coursesCatalog'
import StepConfigDrawer from './components/StepConfigDrawer/StepConfigDrawer'
import CoursePickerDrawer from './components/CoursePickerDrawer/CoursePickerDrawer'
import defaultBanner from '../../assets/programs/program-banner-default.png'
import emptyCoursesPlus from '../../assets/programs/empty-courses-plus.svg'
import './ProgramBuilder.css'

const STEP_META: Record<StepType, { label: string; icon: typeof PlayCircle }> = {
  course: { label: 'Course', icon: PlayCircle },
  email: { label: 'Email', icon: Sms },
  review: { label: 'Review', icon: Refresh2 },
}

const TABS = [{ label: 'Details' }, { label: 'Courses' }, { label: 'Settings' }]

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  } catch {
    return iso
  }
}

/** One-line human summary of a step's release rule, for the row. */
function releaseSummary(rule: ReleaseRule, steps: ProgramStep[]): string {
  switch (rule.kind) {
    case 'on-start':
      return 'On program start'
    case 'after-days':
      return `${rule.days} day${rule.days !== 1 ? 's' : ''} after previous`
    case 'on-date':
      return rule.date ? `On ${formatDate(rule.date)}` : 'On date'
    case 'after-step': {
      const ref = steps.find((s) => s.id === rule.stepId)
      const base = ref ? `After "${ref.title}"` : 'After step'
      return rule.days ? `${base} + ${rule.days}d` : base
    }
  }
}

function ProgramBuilder() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toasts, show } = useToast()

  const [draft, setDraft] = useState<ProgramDraft>(() => loadDraftForBuilder(id))
  const [activeTab, setActiveTab] = useState('Details')
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const descInputRef = useRef<HTMLTextAreaElement>(null)

  // Drag-to-reorder (flat list)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  // Keep the inline description textarea sized to its content (it has no border/scroll).
  useEffect(() => {
    const el = descInputRef.current
    if (!el || activeTab !== 'Details') return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [draft.description, activeTab])

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setDraft((d) => ({ ...d, image: url }))
    e.target.value = ''
  }

  const editingStep = draft.steps.find((s) => s.id === editingStepId) ?? null

  const patchStep = (stepId: string, patch: Partial<ProgramStep>) =>
    setDraft((d) => ({ ...d, steps: d.steps.map((s) => (s.id === stepId ? ({ ...s, ...patch } as ProgramStep) : s)) }))

  // Course ids already in the program — the picker shows these as "Remove".
  const existingCourseIds = draft.steps.filter((s) => s.type === 'course').map((s) => s.courseId)

  // V1: programs bundle courses only. The picker adds/removes courses live.
  const addCourseFromCatalog = (c: CatalogCourse) =>
    setDraft((d) => ({
      ...d,
      steps: [
        ...d.steps,
        {
          id: makeId('step'),
          type: 'course' as const,
          title: c.title,
          courseId: c.courseId,
          lessonCount: c.lessonCount,
          durationMinutes: c.durationMinutes,
          thumbnail: c.thumb,
          release: { kind: 'on-start' as const },
        },
      ],
    }))

  const removeCourseFromProgram = (courseId: string) =>
    setDraft((d) => ({ ...d, steps: d.steps.filter((s) => !(s.type === 'course' && s.courseId === courseId)) }))

  const removeStep = (stepId: string) =>
    setDraft((d) => ({ ...d, steps: d.steps.filter((s) => s.id !== stepId) }))

  const reorder = (from: number, to: number) =>
    setDraft((d) => {
      if (from === to) return d
      const steps = [...d.steps]
      const [moved] = steps.splice(from, 1)
      steps.splice(to, 0, moved)
      return { ...d, steps }
    })

  const handleSave = (status: 'draft' | 'published') => {
    if (!draft.title.trim()) {
      setActiveTab('Details')
      show('error', 'Add a program name before saving.')
      return
    }
    const toSave = { ...draft, status }
    saveProgram(toSave)
    setDraft(toSave)
    show('success', status === 'published' ? 'Program published' : 'Draft saved')
  }

  return (
    <>
      <PageHeader
        title={id ? 'Edit program' : 'Create program'}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        secondaryLabel="Save Draft"
        onSecondary={() => handleSave('draft')}
        secondaryDisabled={!draft.title.trim()}
        primaryLabel={id ? 'Save Changes' : 'Create Program'}
        primaryIcon={id ? undefined : <Add size={20} color="var(--neutral-0)" variant="Linear" />}
        onPrimary={() => handleSave('published')}
        primaryDisabled={!draft.title.trim()}
        onClose={() => navigate('/programs')}
      />

      <div className={`app-content-area${pickerOpen ? ' app-content-area--with-picker' : ''}`}>
        <main className="main-content">
          {/* ── Details ── */}
          {activeTab === 'Details' && (
            <div className="pb-details">
              <div
                className="pb-banner"
                style={{ backgroundImage: `url(${draft.image || defaultBanner})` }}
              >
                <button
                  type="button"
                  className="pb-banner__btn"
                  aria-label={draft.image ? 'Change cover image' : 'Add cover image'}
                  onClick={() => coverInputRef.current?.click()}
                >
                  <GalleryAdd size={20} color="var(--neutral-0)" variant="Linear" />
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="pb-banner__file"
                  onChange={handleCoverChange}
                />
              </div>

              <div className="pb-headline">
                <input
                  className="pb-headline__title"
                  placeholder="Add program title"
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  aria-label="Program title"
                />
                <textarea
                  ref={descInputRef}
                  className="pb-headline__desc"
                  rows={1}
                  placeholder="Add a description to your program"
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  aria-label="Program description"
                />
              </div>

              <div className="pb-details__footer">
                <button type="button" className="pb-next-btn" onClick={() => setActiveTab('Courses')}>
                  Next
                </button>
              </div>
            </div>
          )}

          {/* ── Courses ── */}
          {activeTab === 'Courses' && (
            <div className={`pb-panel ${draft.steps.length === 0 ? 'pb-panel--full' : 'pb-panel--courses'}`}>
              <div className="pb-section">
                {draft.steps.length === 0 ? (
                  <div className="pb-empty">
                    <img className="pb-empty__art" src={emptyCoursesPlus} alt="" aria-hidden="true" />
                    <p className="pb-empty__title">Add courses to your program</p>
                    <button className="pb-empty__cta" onClick={() => setPickerOpen(true)}>
                      Add Courses
                      <Add size={20} color="var(--neutral-0)" variant="Linear" />
                    </button>
                  </div>
                ) : (
                  <div className="pb-steps">
                    <div className="pb-steps__head">
                      <span className="pb-col pb-col--step">Course</span>
                      <span className="pb-col pb-col--release">Release</span>
                      <span className="pb-col pb-col--due">Due date</span>
                      <span className="pb-col pb-col--actions" aria-hidden="true" />
                    </div>
                    {draft.steps.map((step, i) => {
                      const Meta = STEP_META[step.type]
                      const Icon = Meta.icon
                      const sub =
                        step.type === 'course' && step.lessonCount > 0
                          ? `${Meta.label} · ${step.lessonCount} lessons · ${step.durationMinutes} min`
                          : step.type === 'review'
                            ? `${Meta.label} · ${step.delayDays}d after completion`
                            : Meta.label
                      return (
                        <article
                          key={step.id}
                          className={`pb-step${overIndex === i && dragIndex !== null && dragIndex !== i ? ' pb-step--drop' : ''}${dragIndex === i ? ' pb-step--dragging' : ''}`}
                          draggable
                          onDragStart={() => setDragIndex(i)}
                          onDragOver={(e) => {
                            e.preventDefault()
                            setOverIndex(i)
                          }}
                          onDrop={() => {
                            if (dragIndex !== null) reorder(dragIndex, i)
                            setDragIndex(null)
                            setOverIndex(null)
                          }}
                          onDragEnd={() => {
                            setDragIndex(null)
                            setOverIndex(null)
                          }}
                        >
                          <span className="pb-col pb-col--step">
                            <span className="pb-step__grip" aria-hidden="true">⋮⋮</span>
                            <span className={`pb-step__icon pb-step__icon--${step.type}`}>
                              <Icon size={20} color="var(--primary-600)" variant="Bold" />
                            </span>
                            <span className="pb-step__titlewrap">
                              <span className="pb-step__title">{step.title}</span>
                              <span className="pb-step__sub">{sub}</span>
                            </span>
                          </span>
                          <span className="pb-col pb-col--release">{releaseSummary(step.release, draft.steps)}</span>
                          <span className="pb-col pb-col--due">{step.dueDate ? formatDate(step.dueDate) : '—'}</span>
                          <span className="pb-col pb-col--actions">
                            <button className="pb-icon-btn" aria-label="Edit step" onClick={() => setEditingStepId(step.id)}>
                              <Edit2 size={18} color="var(--text-secondary)" variant="Linear" />
                            </button>
                            <button className="pb-icon-btn" aria-label="Remove step" onClick={() => removeStep(step.id)}>
                              <Trash size={18} color="var(--text-secondary)" variant="Linear" />
                            </button>
                          </span>
                        </article>
                      )
                    })}
                  </div>
                )}

                {/* Add course (the empty state has its own CTA) */}
                {draft.steps.length > 0 && (
                  <div className="pb-addstep">
                    <button className="pb-addstep__btn" onClick={() => setPickerOpen(true)}>
                      <Add size={20} color="var(--primary-600)" variant="Linear" />
                      Add Course
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Settings ── */}
          {activeTab === 'Settings' && (
            <div className="pb-panel">
              <div className="pb-settings">
                <h2 className="pb-settings__title">Course completion</h2>
                <div className="pb-setting-card">
                  <Checkbox
                    checked={draft.certificate.enabled}
                    onChange={() =>
                      setDraft((d) => ({ ...d, certificate: { ...d.certificate, enabled: !d.certificate.enabled } }))
                    }
                  />
                  <div className="pb-setting-body">
                    <p className="pb-setting-name">Certificate</p>
                    <p className="pb-setting-desc">
                      Add a certificate for completion.{' '}
                      <a className="pb-setting-link" href="#" onClick={(e) => e.preventDefault()}>
                        Read
                      </a>{' '}
                      how certification works.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {editingStep && (
        <StepConfigDrawer
          step={editingStep}
          allSteps={draft.steps}
          onPatch={(patch) => patchStep(editingStep.id, patch)}
          onPickCourse={(courseId) => {
            const lib = getCatalogCourse(courseId)
            if (lib) {
              patchStep(editingStep.id, {
                courseId: lib.courseId,
                title: lib.title,
                lessonCount: lib.lessonCount,
                durationMinutes: lib.durationMinutes,
                thumbnail: lib.thumb,
              } as Partial<CourseStep>)
            }
          }}
          onClose={() => setEditingStepId(null)}
        />
      )}

      {pickerOpen && (
        <CoursePickerDrawer
          existingCourseIds={existingCourseIds}
          onAdd={addCourseFromCatalog}
          onRemove={removeCourseFromProgram}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <ToastContainer toasts={toasts} />
    </>
  )
}

export default ProgramBuilder
