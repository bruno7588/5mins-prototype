import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Add, GalleryAdd } from 'iconsax-react'
import PageHeader from '../your-courses/components/PageHeader/PageHeader'
import Checkbox from '../../components/Checkbox/Checkbox'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import {
  loadDraftForBuilder,
  makeId,
  saveProgram,
  type ProgramDraft,
  type ProgramStep,
} from './programStore'
import { type CatalogCourse } from './coursesCatalog'
import CourseOutline from './components/CourseOutline/CourseOutline'
import CoursePickerDrawer from './components/CoursePickerDrawer/CoursePickerDrawer'
import AddImageModal from '../add-content/components/AddImageModal/AddImageModal'
import Tooltip from '../../components/Tooltip/Tooltip'
import defaultBanner from '../../assets/programs/program-banner-default.png'
import emptyCoursesPlus from '../../assets/programs/empty-courses-plus.svg'
import './ProgramBuilder.css'

const TABS = [{ label: 'Details' }, { label: 'Courses' }, { label: 'Settings' }]

function ProgramBuilder() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toasts, show } = useToast()

  const [draft, setDraft] = useState<ProgramDraft>(() => loadDraftForBuilder(id))
  const [activeTab, setActiveTab] = useState('Details')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const descInputRef = useRef<HTMLTextAreaElement>(null)

  // Keep the inline description textarea sized to its content (it has no border/scroll).
  useEffect(() => {
    const el = descInputRef.current
    if (!el || activeTab !== 'Details') return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [draft.description, activeTab])

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

  const handleSave = () => {
    if (!draft.title.trim()) {
      setActiveTab('Details')
      show('error', 'Add a program name before saving.')
      return
    }
    const toSave = { ...draft, status: 'published' as const }
    saveProgram(toSave)
    setDraft(toSave)
    show('success', id ? 'Changes saved' : 'Program created')
  }

  return (
    <>
      <PageHeader
        title={id ? 'Edit program' : 'Create program'}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hideSecondary
        primaryLabel={id ? 'Update Program' : 'Create Program'}
        primaryIcon={id ? undefined : <Add size={20} color="currentColor" variant="Linear" />}
        onPrimary={() => handleSave()}
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
                <div className="pb-banner__overlay" aria-hidden="true" />
                <Tooltip
                  text="Add or generate image"
                  position="Top"
                  alignment="End"
                  icon={false}
                  className="pb-banner__tooltip"
                >
                  <button
                    type="button"
                    className="pb-banner__btn"
                    aria-label={draft.image ? 'Change cover image' : 'Add cover image'}
                    onClick={() => setImageModalOpen(true)}
                  >
                    <GalleryAdd size={20} color="var(--neutral-0)" variant="Linear" />
                  </button>
                </Tooltip>
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
                  <CourseOutline
                    steps={draft.steps}
                    onReorder={reorder}
                    onRemove={removeStep}
                    onPatch={patchStep}
                    onAddCourse={() => setPickerOpen(true)}
                  />
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

      {pickerOpen && (
        <CoursePickerDrawer
          existingCourseIds={existingCourseIds}
          onAdd={addCourseFromCatalog}
          onRemove={removeCourseFromProgram}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <AddImageModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelect={(url) => {
          setDraft((d) => ({ ...d, image: url }))
          setImageModalOpen(false)
        }}
        showSuggest={false}
      />

      <ToastContainer toasts={toasts} />
    </>
  )
}

export default ProgramBuilder
