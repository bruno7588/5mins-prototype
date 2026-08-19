import { useEffect, useRef, useState } from 'react'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import { LibraryDrawerContent, type LibraryLesson } from '../LibraryDrawer/LibraryDrawer'
import { ScormDrawerContent } from '../ScormDrawer/ScormDrawer'
import type { ScormFile } from '../ScormDrawer/ScormDrawer'
import AssessmentModal, { type AssessmentData } from '../AssessmentModal/AssessmentModal'
import SituationalTestDrawerContent, {
  type SituationalQuestion,
  type SituationalTestData,
} from '../SituationalTestDrawer/SituationalTestDrawer'
import InteractiveDrawer from '../InteractiveDrawer/InteractiveDrawer'
import GenerateAssessmentsDrawer from '../GenerateAssessmentsDrawer/GenerateAssessmentsDrawer'
import type { CoverageReport, GeneratableType, GenerationScope } from '@/data/aiAssessmentGeneration'
import {
  TYPE_CONFIG,
  type InteractiveQuestion,
  type InteractiveQuestionType,
} from '@/data/interactiveQuestions'
import type { AssessmentType } from '../AddContentSidebar/AddContentSidebar'
import '../../../my-team/CoursesDrawer.css'
import '../LibraryDrawer/LibraryDrawer.css'
import '../ScormDrawer/ScormDrawer.css'

/* One member for all four interactive formats — which one is carried in a prop,
   so adding a fifth format doesn't widen this union or the two switches on it. */
export type ActiveDrawer =
  | 'library'
  | 'scorm'
  | 'assessment'
  | 'situational-test'
  | 'interactive'
  | 'ai-generate'
  | null

interface Props {
  activeDrawer: ActiveDrawer
  onClose: () => void
  /* The Add Content rail can be expanded over an open drawer; the panel then needs
     240px of clearance on the right instead of the rail's 60px. */
  sidebarExpanded: boolean
  /* Library */
  libraryAddedIds: Set<number>
  onLibraryAdd: (lesson: LibraryLesson) => void
  onLibraryRemove: (id: number) => void
  /* SCORM */
  scormAddedIds: Set<number>
  onScormAdd: (file: ScormFile) => void
  onScormRemove: (id: number) => void
  /* Assessment */
  assessmentType: AssessmentType
  /** Prefilled when an assessment row was reopened from the outline. */
  assessmentInitial: AssessmentData | null
  /** Which row is open, so the form can be remounted per assessment (see the key below). */
  assessmentInitialId: number | null
  onAssessmentAdd: (data: AssessmentData) => void
  /* Situational test — non-null when reopened from the outline for editing. */
  situationalTest: SituationalTestData | null
  onSituationalTestSave: (
    title: string,
    brief: string,
    questions: SituationalQuestion[],
  ) => void
  onSituationalTestDirtyChange: (dirty: boolean) => void
  /* Interactive question (fill in the blanks / match the pairs / categorise / sequence) */
  interactiveType: InteractiveQuestionType
  /** Prefilled when an interactive row was reopened from the outline. */
  interactiveInitial: InteractiveQuestion | null
  /** Which row is open, so the form can be remounted per question (see the key below). */
  interactiveInitialId: number | null
  onInteractiveSave: (question: InteractiveQuestion) => void
  onInteractiveDirtyChange: (dirty: boolean) => void
  /* AI generation (DES-279) */
  generationScope: GenerationScope
  generationCoverage: CoverageReport
  generatedCount: number
  onGenerate: (types: GeneratableType[]) => void
  onAddLessons: () => void
  generating: { steps: string[]; activeStep: number } | null
  generationReview: {
    draft: SituationalTestData
    onSave: (title: string, brief: string, questions: SituationalQuestion[]) => void
    onGenerateAgain: () => void
  } | null
}

/* Single drawer shell that hosts library or SCORM content. Stays mounted across
   swaps (library → scorm) so the panel doesn't slide out and back in. Only animates
   in on first open and out when activeDrawer goes to null. */
function ContentDrawer({
  activeDrawer,
  onClose,
  sidebarExpanded,
  libraryAddedIds,
  onLibraryAdd,
  onLibraryRemove,
  scormAddedIds,
  onScormAdd,
  onScormRemove,
  assessmentType,
  assessmentInitial,
  assessmentInitialId,
  onAssessmentAdd,
  situationalTest,
  onSituationalTestSave,
  onSituationalTestDirtyChange,
  interactiveType,
  interactiveInitial,
  interactiveInitialId,
  onInteractiveSave,
  onInteractiveDirtyChange,
  generationScope,
  generationCoverage,
  generatedCount,
  onGenerate,
  onAddLessons,
  generating,
  generationReview,
}: Props) {
  // What content to actually render. Lags activeDrawer when closing so the
  // close animation can complete before unmounting.
  const [rendered, setRendered] = useState<ActiveDrawer>(activeDrawer)
  const [closing, setClosing] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const panelRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (activeDrawer !== null) {
      // Open or swap — keep the shell mounted, just switch content.
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      setRendered(activeDrawer)
      setClosing(false)
      return
    }
    // activeDrawer === null — animate the close, then unmount.
    if (rendered === null) return
    setClosing(true)
    closeTimerRef.current = window.setTimeout(() => {
      setRendered(null)
      setClosing(false)
      closeTimerRef.current = null
    }, 300)
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
    }
  }, [activeDrawer])

  /* The DS overlay behaviour (overlays.md): focus moves into the panel on open, Tab is
     trapped inside it, and focus returns to the trigger on close. This used to be a bare
     Escape listener, so `aria-modal` was claiming a trap that did not exist and Tab
     walked straight out into the page header. */
  useOverlayA11y(panelRef, rendered !== null, { onEscape: onClose })

  if (rendered === null) return null

  /* The shell hosts four different forms, so it names itself — it previously pointed
     aria-labelledby at an id that only the Library drawer renders, leaving the other
     three unnamed to a screen reader. */
  const label =
    rendered === 'library' ? 'Add from the 5Mins Library'
    : rendered === 'scorm' ? 'Add SCORM files'
    : rendered === 'assessment' ? (assessmentInitial ? 'Edit assessment' : 'Add assessment')
    : rendered === 'interactive'
      ? `${interactiveInitial ? 'Edit' : 'Add'} assessment - ${TYPE_CONFIG[interactiveType].label}`
    : rendered === 'ai-generate' ? (generationScope === 'situational' ? 'Generate situational tests with AI' : 'Generate assessments with AI')
    : situationalTest ? 'Edit Situational Test'
    : 'Add Situational Test'

  return (
    <>
      <div
        className={`overlay-backdrop overlay-backdrop--with-sidebar${sidebarExpanded ? ' overlay-backdrop--sidebar-expanded' : ''}${closing ? ' overlay-backdrop--closing' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`side-drawer side-drawer--with-sidebar${sidebarExpanded ? ' side-drawer--sidebar-expanded' : ''}${closing ? ' side-drawer--closing' : ''} ${rendered === 'library' ? 'library-drawer' : rendered === 'scorm' ? 'scorm-drawer-shell' : rendered === 'situational-test' ? 'situational-test-drawer-shell' : rendered === 'interactive' ? 'interactive-drawer-shell' : rendered === 'ai-generate' ? `generate-drawer-shell${generationReview ? ' situational-test-drawer-shell' : ''}` : 'assessment-drawer-shell'}`}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
      >
        {rendered === 'library' && (
          <LibraryDrawerContent
            onClose={onClose}
            addedIds={libraryAddedIds}
            onAdd={onLibraryAdd}
            onRemove={onLibraryRemove}
          />
        )}
        {rendered === 'scorm' && (
          <ScormDrawerContent
            onClose={onClose}
            addedIds={scormAddedIds}
            onAdd={onScormAdd}
            onRemove={onScormRemove}
          />
        )}
        {rendered === 'assessment' && (
          /* Keyed for the same reason as the situational form below: the shell stays
             mounted across swaps, and this form seeds its fields from `initial` at mount
             only, so without a key a second assessment would open showing the first
             one's answers. */
          <AssessmentModal
            key={assessmentInitialId ?? 'new'}
            variant="drawer"
            type={assessmentType}
            initial={assessmentInitial}
            onClose={onClose}
            onAdd={onAssessmentAdd}
          />
        )}
        {rendered === 'situational-test' && (
          /* Keyed so reopening for a different test remounts the form with its own
             step, brief and questions rather than reusing the previous one's state. */
          <SituationalTestDrawerContent
            key={situationalTest?.id ?? 'new'}
            initial={situationalTest}
            onClose={onClose}
            onSave={onSituationalTestSave}
            onDirtyChange={onSituationalTestDirtyChange}
          />
        )}
        {rendered === 'interactive' && (
          /* Keyed for the same reason as the two forms above — the shell stays
             mounted across swaps and this form seeds its draft from `initial` at
             mount only, so a second question would otherwise open showing the
             first one's answers. The type is in the key too: switching format
             from the rail keeps the same id, and the draft shape has to change
             with it. */
          <InteractiveDrawer
            key={`${interactiveType}-${interactiveInitialId ?? 'new'}`}
            type={interactiveType}
            initial={interactiveInitial}
            onClose={onClose}
            onSave={onInteractiveSave}
            onDirtyChange={onInteractiveDirtyChange}
          />
        )}
        {rendered === 'ai-generate' && (
          /* Keyed on the coverage so reopening after adding a lesson starts from a
             fresh type selection rather than the one left behind last time. */
          <GenerateAssessmentsDrawer
            key={`${generationScope}-${generationCoverage.withTranscript.length}`}
            scope={generationScope}
            coverage={generationCoverage}
            generatedCount={generatedCount}
            onClose={onClose}
            onGenerate={onGenerate}
            onAddLessons={onAddLessons}
            generating={generating}
            review={generationReview}
          />
        )}
      </aside>
    </>
  )
}

export default ContentDrawer
