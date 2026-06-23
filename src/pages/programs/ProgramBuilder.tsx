import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Add,
  Edit2,
  PlayCircle,
  Refresh2,
  Routing,
  Sms,
  Trash,
} from 'iconsax-react'
import CloseButton from '../../components/CloseButton/CloseButton'
import InputField from '../../components/InputField/InputField'
import Toggle from '../../components/Toggle/Toggle'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import {
  emptyDraft,
  getStoredProgramById,
  makeId,
  MOCK_LIBRARY,
  saveProgram,
  type CourseStep,
  type ProgramDraft,
  type ProgramStep,
  type ReleaseRule,
  type StepType,
} from './programStore'
import StepConfigDrawer from './components/StepConfigDrawer/StepConfigDrawer'
import './ProgramBuilder.css'

const STEP_META: Record<StepType, { label: string; icon: typeof PlayCircle }> = {
  course: { label: 'Course', icon: PlayCircle },
  email: { label: 'Email', icon: Sms },
  review: { label: 'Review', icon: Refresh2 },
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  } catch {
    return iso
  }
}

/** One-line human summary of a step's release rule, for the row badge. */
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

function newStep(type: StepType, steps: ProgramStep[]): ProgramStep {
  const id = makeId('step')
  if (type === 'email') {
    return { id, type: 'email', title: 'New email', subject: '', body: '', release: { kind: 'after-days', days: 1 } }
  }
  if (type === 'review') {
    const lastCourse = [...steps].reverse().find((s) => s.type === 'course')
    return {
      id,
      type: 'review',
      title: 'Spaced repetition review',
      delayDays: 14,
      release: lastCourse ? { kind: 'after-step', stepId: lastCourse.id } : { kind: 'on-start' },
    }
  }
  return { id, type: 'course', title: 'Select a course', courseId: '', lessonCount: 0, durationMinutes: 0, thumbnail: '', release: { kind: 'on-start' } }
}

function ProgramBuilder() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toasts, show } = useToast()

  const [draft, setDraft] = useState<ProgramDraft>(() => (id ? getStoredProgramById(id) ?? emptyDraft() : emptyDraft()))
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const addMenuRef = useRef<HTMLDivElement>(null)

  // Drag-to-reorder (flat list)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!addMenuOpen) return
    const onDown = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setAddMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [addMenuOpen])

  const editingStep = draft.steps.find((s) => s.id === editingStepId) ?? null

  const patchStep = (stepId: string, patch: Partial<ProgramStep>) =>
    setDraft((d) => ({ ...d, steps: d.steps.map((s) => (s.id === stepId ? ({ ...s, ...patch } as ProgramStep) : s)) }))

  const addStep = (type: StepType) => {
    const step = newStep(type, draft.steps)
    setDraft((d) => ({ ...d, steps: [...d.steps, step] }))
    setAddMenuOpen(false)
    setEditingStepId(step.id)
  }

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
      show('error', 'Add a program title before saving.')
      return
    }
    const toSave = { ...draft, status }
    saveProgram(toSave)
    setDraft(toSave)
    show('success', status === 'published' ? 'Program published' : 'Draft saved')
  }

  return (
    <div className="pb">
      {/* Top bar */}
      <header className="pb-topbar">
        <div className="pb-topbar__left">
          <CloseButton onClick={() => navigate('/programs')} />
          <input
            className="pb-title-input"
            value={draft.title}
            placeholder="Untitled program"
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
        </div>
        <div className="pb-topbar__actions">
          <button className="pb-btn pb-btn--outline" onClick={() => handleSave('draft')}>
            Save Draft
          </button>
          <button className="pb-btn pb-btn--primary" onClick={() => handleSave('published')}>
            Publish
          </button>
        </div>
      </header>

      <div className="pb-canvas">
        <div className="pb-sheet">
          {/* Meta */}
          <section className="pb-section">
            <span className="pb-label">
              <Routing size={16} color="var(--text-tertiary)" variant="Bold" />
              Program
            </span>
            <InputField
              label="Description"
              placeholder="What is this program about?"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
          </section>

          {/* Steps */}
          <section className="pb-section">
            <h2 className="pb-section__title">Program outline</h2>

            {draft.steps.length === 0 ? (
              <div className="pb-steps-empty">
                <p>No steps yet. Add a course, email, or review to start the journey.</p>
              </div>
            ) : (
              <div className="pb-steps">
                <div className="pb-steps__head">
                  <span className="pb-col pb-col--step">Step</span>
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

            {/* Add step */}
            <div className="pb-addstep" ref={addMenuRef}>
              <button className="pb-addstep__btn" onClick={() => setAddMenuOpen((o) => !o)}>
                <Add size={20} color="var(--primary-600)" variant="Linear" />
                Add step
              </button>
              {addMenuOpen && (
                <div className="pb-addmenu" role="menu">
                  {(['course', 'email', 'review'] as StepType[]).map((t) => {
                    const Icon = STEP_META[t].icon
                    return (
                      <button key={t} className="pb-addmenu__item" role="menuitem" onClick={() => addStep(t)}>
                        <Icon size={18} color="var(--text-secondary)" variant="Linear" />
                        <span>
                          <span className="pb-addmenu__label">{STEP_META[t].label}</span>
                          <span className="pb-addmenu__desc">
                            {t === 'course' ? 'A 5Mins course from your library' : t === 'email' ? 'A drip email to learners' : 'Auto spaced-repetition review'}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Certificate */}
          <section className="pb-section">
            <h2 className="pb-section__title">Certification</h2>
            <div className="pb-cert">
              <Toggle
                label="Award a certificate on completion"
                checked={draft.certificate.enabled}
                onChange={() =>
                  setDraft((d) => ({ ...d, certificate: { ...d.certificate, enabled: !d.certificate.enabled } }))
                }
              />
            </div>
          </section>
        </div>
      </div>

      {editingStep && (
        <StepConfigDrawer
          step={editingStep}
          allSteps={draft.steps}
          onPatch={(patch) => patchStep(editingStep.id, patch)}
          onPickCourse={(courseId) => {
            const lib = MOCK_LIBRARY.find((c) => c.courseId === courseId)
            if (lib) {
              patchStep(editingStep.id, {
                courseId: lib.courseId,
                title: lib.title,
                lessonCount: lib.lessonCount,
                durationMinutes: lib.durationMinutes,
                thumbnail: lib.thumbnail,
              } as Partial<CourseStep>)
            }
          }}
          onClose={() => setEditingStepId(null)}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default ProgramBuilder
