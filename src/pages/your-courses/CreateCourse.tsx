import { useLayoutEffect, useState } from 'react'
import { Danger, Eye } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import PageHeader from './components/PageHeader/PageHeader'
import ContentList from './components/ContentList/ContentList'
import type { ContentItem } from './components/ContentList/ContentList'
import AddContentIconStrip from './components/AddContentIconStrip/AddContentIconStrip'
import type { AssessmentType } from './components/AddContentSidebar/AddContentSidebar'
import type { ScormFile } from './components/ScormDrawer/ScormDrawer'
import ContentDrawer from './components/ContentDrawer/ContentDrawer'
import type { AssessmentData } from './components/AssessmentModal/AssessmentModal'
import type { LibraryLesson } from './components/LibraryDrawer/LibraryDrawer'
import type {
  SituationalQuestion,
  SituationalTestData,
} from './components/SituationalTestDrawer/SituationalTestDrawer'
import {
  TYPE_CONFIG,
  draftSummary,
  toDraft,
  type InteractiveQuestion,
  type InteractiveQuestionType,
} from '@/data/interactiveQuestions'

const assessmentLabels: Record<AssessmentType, string> = {
  'multiple-choice': 'Multiple Choice',
  'short-text': 'Short Text',
  exercise: 'Exercise',
  poll: 'Poll',
}

let nextAssessmentId = 100
let nextSituationalTestId = 200
/* Interactive questions ride `type: 'Assessment'` outline cards, so they share the
   `Assessment-<id>` key namespace with classic assessments — 1000 keeps the two
   counters clear of each other. */
let nextInteractiveId = 1000

type ActiveDrawer = 'library' | 'scorm' | 'assessment' | 'situational-test' | 'interactive' | null

function CreateCourse() {
  const [scormItems, setScormItems] = useState<ContentItem[]>([])
  const [addedScormIds, setAddedScormIds] = useState<Set<number>>(new Set())
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('multiple-choice')
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawer>(null)
  /* The builder opens with the Add Content panel already expanded — it's the first
     thing an admin needs on an empty course. */
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [addedLibraryIds, setAddedLibraryIds] = useState<Set<number>>(new Set())
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null)
  /* Authored situational tests, keyed by the id their outline card carries — the drawer
     reads from here when reopened for editing (FR-4). */
  const [situationalTests, setSituationalTests] = useState<Record<number, SituationalTestData>>({})
  const [editingSituationalId, setEditingSituationalId] = useState<number | null>(null)
  /* Same store for assessments. Without it the card was built from the answers and the
     answers thrown away, so the row could only ever be deleted and re-authored. */
  const [assessments, setAssessments] = useState<Record<number, AssessmentData>>({})
  const [editingAssessmentId, setEditingAssessmentId] = useState<number | null>(null)
  /* Same store again for the four interactive formats. */
  const [interactiveType, setInteractiveType] = useState<InteractiveQuestionType>('fill-blank')
  const [interactive, setInteractive] = useState<Record<number, InteractiveQuestion>>({})
  const [editingInteractiveId, setEditingInteractiveId] = useState<number | null>(null)
  /* Unsaved work in a drawer that authors something — every close route checks it first. */
  const [situationalDirty, setSituationalDirty] = useState(false)
  const [interactiveDirty, setInteractiveDirty] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  /* The Add Content drawer snaps to the bottom edge of the PageHeader's divider —
     so the panel butts directly against the divider line and the tabs row sits
     beside the drawer. Measured via the divider's viewport-relative bottom. */
  useLayoutEffect(() => {
    const update = () => {
      const divider = document.querySelector<HTMLElement>('.page-header-divider')
      if (!divider) return
      const offset = divider.getBoundingClientRect().bottom
      document.documentElement.style.setProperty('--page-header-offset', `${offset}px`)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  /* Every "Add Content" CTA opens the sidebar's first source, the 5Mins Library, so
     the admin lands on content rather than an empty panel. The section it was fired
     from is remembered so the pick lands in the right place. */
  const openAddContent = (sectionId: string) => {
    setTargetSectionId(sectionId)
    openDrawer('library')
  }

  /* Opening a drawer leaves the sidebar however the admin left it. It used to force the
     rail closed, which meant clicking Add Content collapsed the very menu the admin was
     reading — and picking a second source then meant re-expanding it. The drawer shifts
     left by the panel's width instead (.side-drawer--sidebar-expanded), so both fit.
     Collapsing is the rail's own toggle, not a side effect of opening something. */
  const openDrawer = (drawer: ActiveDrawer) => {
    setActiveDrawer(drawer)
  }

  const openAssessment = (type: AssessmentType) => {
    setAssessmentType(type)
    setEditingAssessmentId(null)
    openDrawer('assessment')
  }

  /* Reopening keeps the assessment's own type rather than whatever the rail last had
     selected, or a poll would reopen as a multiple choice. */
  const openAssessmentEdit = (id: number) => {
    const data = assessments[id]
    if (!data) return
    setAssessmentType(data.type)
    setEditingAssessmentId(id)
    openDrawer('assessment')
  }

  const openSituationalTest = (id: number | null) => {
    setEditingSituationalId(id)
    openDrawer('situational-test')
  }

  const openInteractive = (type: InteractiveQuestionType) => {
    setInteractiveType(type)
    setEditingInteractiveId(null)
    openDrawer('interactive')
  }

  /* Reopening keeps the question's own format rather than whatever the rail last
     had selected — the same reason openAssessmentEdit restores its type. */
  const openInteractiveEdit = (id: number) => {
    const question = interactive[id]
    if (!question) return
    setInteractiveType(question.type)
    setEditingInteractiveId(id)
    openDrawer('interactive')
  }

  const closeDrawer = () => {
    setActiveDrawer(null)
    setTargetSectionId(null)
    setEditingSituationalId(null)
    setEditingAssessmentId(null)
    setEditingInteractiveId(null)
    setSituationalDirty(false)
    setInteractiveDirty(false)
  }

  /* Every way out of a drawer — the header close button, Escape and the scrim — routes
     through here, so half-written work can't be thrown away by accident. */
  const requestCloseDrawer = () => {
    const dirty =
      (activeDrawer === 'situational-test' && situationalDirty) ||
      (activeDrawer === 'interactive' && interactiveDirty)
    if (dirty) {
      setConfirmDiscard(true)
      return
    }
    closeDrawer()
  }

  const handleAddScorm = (file: ScormFile) => {
    const newItem: ContentItem = {
      id: file.id,
      type: 'SCORM',
      title: file.fileName,
      metadata: 'Lesson · Instructor name · 4min',
      thumbnail: '',
      thumbColor: file.thumbColor,
    }
    setScormItems(prev => [...prev, newItem])
    setAddedScormIds(prev => new Set(prev).add(file.id))
  }

  const handleRemoveScorm = (id: number) => {
    setScormItems(prev => prev.filter(item => item.id !== id))
    setAddedScormIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setAddedLibraryIds(prev => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  /* Handles both authoring and re-saving: an id already in hand means the drawer was
     reopened from the outline, so the existing row is replaced in place rather than a
     second card appended. Mirrors handleSaveSituationalTest. */
  const handleAddAssessment = (data: AssessmentData) => {
    const id = editingAssessmentId ?? nextAssessmentId++
    setAssessments(prev => ({ ...prev, [id]: data }))

    const newItem: ContentItem = {
      id,
      type: 'Assessment',
      title: data.question || 'Untitled Assessment',
      /* Question type only — the card's badge already reads "Assessment". */
      metadata: assessmentLabels[data.type],
      thumbnail: '',
    }
    setScormItems(prev =>
      editingAssessmentId === null
        ? [...prev, newItem]
        : prev.map(item => (item.type === 'Assessment' && item.id === id ? newItem : item)),
    )
    setActiveDrawer(null)
    setEditingAssessmentId(null)
    setTargetSectionId(null)
  }

  /* The outline deletes by id; the payload maps are the only thing that knows which
     ids belong to situational tests and interactive questions. */
  const handleDeleteExtra = (id: number) => {
    if (situationalTests[id]) {
      handleRemoveSituationalTest(id)
      return
    }
    if (interactive[id]) {
      handleRemoveInteractive(id)
      return
    }
    handleRemoveScorm(id)
  }

  const handleSaveInteractive = (question: InteractiveQuestion) => {
    const id = editingInteractiveId ?? nextInteractiveId++
    setInteractive((prev) => ({ ...prev, [id]: question }))

    const card: ContentItem = {
      id,
      type: 'Assessment',
      title: question.prompt || 'Untitled question',
      /* The badge already reads "Assessment", so the line names the format and
         its size — the one thing the card can't otherwise show. */
      metadata: `${TYPE_CONFIG[question.type].label} · ${draftSummary(toDraft(question))}`,
      thumbnail: '',
    }
    setScormItems((prev) =>
      editingInteractiveId === null
        ? [...prev, card]
        : prev.map((item) => (item.type === 'Assessment' && item.id === id ? card : item)),
    )
    closeDrawer()
  }

  const handleRemoveInteractive = (id: number) => {
    setScormItems((prev) => prev.filter((item) => !(item.type === 'Assessment' && item.id === id)))
    setInteractive((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  /* Question count only — the card's own badge already names the type, so repeating it
     here spends the one line the row has on something already on screen. */
  const situationalMetadata = (questions: SituationalQuestion[]) =>
    `${questions.length} question${questions.length === 1 ? '' : 's'}`

  const handleSaveSituationalTest = (
    title: string,
    brief: string,
    questions: SituationalQuestion[],
  ) => {
    const id = editingSituationalId ?? nextSituationalTestId++
    setSituationalTests((prev) => ({ ...prev, [id]: { id, title, brief, questions } }))

    const card: ContentItem = {
      id,
      type: 'SituationalTest',
      title,
      metadata: situationalMetadata(questions),
      thumbnail: '',
    }
    setScormItems((prev) =>
      editingSituationalId === null
        ? [...prev, card]
        : prev.map((item) =>
            item.type === 'SituationalTest' && item.id === id ? card : item,
          ),
    )
    closeDrawer()
  }

  const handleRemoveSituationalTest = (id: number) => {
    setScormItems((prev) =>
      prev.filter((item) => !(item.type === 'SituationalTest' && item.id === id)),
    )
    setSituationalTests((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const handleAddLibraryLesson = (lesson: LibraryLesson) => {
    const newItem: ContentItem = {
      id: lesson.id,
      type: 'LibraryLesson',
      title: lesson.title,
      metadata: `Lesson · ${lesson.instructor} · ${lesson.durationLabel}`,
      thumbnail: '',
      thumbColor: lesson.thumbColor,
    }
    setScormItems(prev => [...prev, newItem])
    setAddedLibraryIds(prev => new Set(prev).add(lesson.id))
  }

  const handleRemoveLibraryLesson = (id: number) => {
    setScormItems(prev => prev.filter(item => item.id !== id))
    setAddedLibraryIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  return (
    <>
      <PageHeader
        leadingAction={
          <Button variant="outlined-2" icon={<Eye size={20} color="currentColor" variant="Linear" />}>
            Preview
          </Button>
        }
      />
      <div
        className={[
          'app-content-area',
          'acd-content-area',
          sidebarExpanded && 'acd-content-area--sidebar-expanded',
        ].filter(Boolean).join(' ')}
      >
        <main className="main-content">
          <ContentList
            extraItems={scormItems}
            onDeleteExtra={handleDeleteExtra}
            /* One edit entry point for the outline. Interactive questions report
               `type: 'Assessment'` like classic ones, so the store is checked
               first — the row type alone can't tell the two apart. Written as an
               explicit chain rather than a ternary with a trailing else, so a
               future type can't fall through to the situational drawer. */
            onEditExtra={(item) => {
              if (interactive[item.id]) openInteractiveEdit(item.id)
              else if (item.type === 'Assessment') openAssessmentEdit(item.id)
              else openSituationalTest(item.id)
            }}
            onAddContent={openAddContent}
            targetSectionId={targetSectionId}
            drawerOpen={activeDrawer !== null}
          />
        </main>
      </div>
      <AddContentIconStrip
        active={activeDrawer}
        activeAssessment={assessmentType}
        expanded={sidebarExpanded}
        onToggleExpanded={() => setSidebarExpanded((v) => !v)}
        onLibraryClick={() => openDrawer('library')}
        onScormClick={() => openDrawer('scorm')}
        onAssessmentClick={openAssessment}
        onSituationalTestClick={() => openSituationalTest(null)}
        activeInteractive={interactiveType}
        onInteractiveClick={openInteractive}
      />
      <ContentDrawer
        activeDrawer={activeDrawer}
        onClose={requestCloseDrawer}
        sidebarExpanded={sidebarExpanded}
        libraryAddedIds={addedLibraryIds}
        onLibraryAdd={handleAddLibraryLesson}
        onLibraryRemove={handleRemoveLibraryLesson}
        scormAddedIds={addedScormIds}
        onScormAdd={handleAddScorm}
        onScormRemove={handleRemoveScorm}
        assessmentType={assessmentType}
        assessmentInitial={editingAssessmentId === null ? null : assessments[editingAssessmentId] ?? null}
        assessmentInitialId={editingAssessmentId}
        onAssessmentAdd={handleAddAssessment}
        situationalTest={editingSituationalId === null ? null : situationalTests[editingSituationalId] ?? null}
        onSituationalTestSave={handleSaveSituationalTest}
        onSituationalTestDirtyChange={setSituationalDirty}
        interactiveType={interactiveType}
        interactiveInitial={editingInteractiveId === null ? null : interactive[editingInteractiveId] ?? null}
        interactiveInitialId={editingInteractiveId}
        onInteractiveSave={handleSaveInteractive}
        onInteractiveDirtyChange={setInteractiveDirty}
      />
      {/* One modal for both authoring drawers — only the nouns change, so a second
          copy of the scrim, icon and actions would be four lines of difference. */}
      <ConfirmModal
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        ariaLabel={activeDrawer === 'interactive' ? 'Discard question' : 'Discard situational test'}
      >
        <div className="confirm-modal-header confirm-modal-header--center">
          <div className="confirm-modal-icon">
            <Danger size={56} color="var(--danger-500)" variant="Linear" />
          </div>
          <h2 className="confirm-modal-title">
            {activeDrawer === 'interactive'
              ? 'Discard this question?'
              : 'Discard this situational test?'}
          </h2>
          <p className="confirm-modal-body">
            {activeDrawer === 'interactive'
              ? "Your question hasn't been saved, and can't be recovered."
              : "Your scenario brief and questions haven't been saved, and can't be recovered."}
          </p>
        </div>
        <div className="confirm-modal-actions">
          <Button variant="outlined-2" onClick={() => setConfirmDiscard(false)}>
            Keep Editing
          </Button>
          <Button
            semantic="danger"
            onClick={() => {
              setConfirmDiscard(false)
              closeDrawer()
            }}
          >
            Discard
          </Button>
        </div>
      </ConfirmModal>
    </>
  )
}

export default CreateCourse
