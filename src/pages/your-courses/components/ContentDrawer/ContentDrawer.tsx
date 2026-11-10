import { useRef, useState } from 'react'
import SideDrawer from '@/components/SideDrawer/SideDrawer'
import { DrawerSlotsContext } from './DrawerSlots'
import { LibraryDrawerContent, type LibraryLesson } from '../LibraryDrawer/LibraryDrawer'
import { ScormDrawerContent } from '../ScormDrawer/ScormDrawer'
import type { ScormFile } from '../ScormDrawer/ScormDrawer'
import AssessmentModal, { type AssessmentData } from '../AssessmentModal/AssessmentModal'
import SituationalTestDrawerContent, {
  type SituationalQuestion,
  type SituationalTestData,
} from '../SituationalTestDrawer/SituationalTestDrawer'
import InteractiveDrawer from '../InteractiveDrawer/InteractiveDrawer'
import GenerateAssessmentsDrawer, { type GenerationFailure } from '../GenerateAssessmentsDrawer/GenerateAssessmentsDrawer'
import { ResourcesDrawerContent } from '../ResourcesDrawer/ResourcesDrawer'
import type { CourseResource } from '@/components/ResourceCard/resources'
import type {
  CoverageReport,
  GeneratableType,
  GeneratedAssessment,
  GenerationScope,
} from '@/data/aiAssessmentGeneration'
import {
  TYPE_CONFIG,
  type InteractiveQuestion,
  type InteractiveQuestionType,
} from '@/data/interactiveQuestions'
import type { AssessmentType } from '../AddContentSidebar/AddContentSidebar'
import '../LibraryDrawer/LibraryDrawer.css'
import '../ScormDrawer/ScormDrawer.css'
import './ContentDrawer.css'

/* One member for all four interactive formats — which one is carried in a prop,
   so adding a fifth format doesn't widen this union or the two switches on it. */
export type ActiveDrawer =
  | 'library'
  | 'scorm'
  | 'assessment'
  | 'situational-test'
  | 'interactive'
  | 'ai-generate'
  | 'resources'
  | null

interface Props {
  activeDrawer: ActiveDrawer
  onClose: () => void
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
  /** Step 1 of a new test creates its card before questions are written. */
  onSituationalTestCreate: (title: string, brief: string) => void
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
  onGenerate: (types: GeneratableType[]) => void
  onAddLessons: () => void
  generating: {
    steps: string[]
    activeStep: number
    /** How long each step is held — the reveal paces itself against it. */
    stepMs: number
    /** The draft being written, revealed as the steps run. */
    draft: GeneratedAssessment | null
    /** The set being written, revealed the same way. Empty on a situational run. */
    drafts: GeneratedAssessment[]
    /** What the running step is on right now. */
    detail?: string
  } | null
  generationReview: {
    draft: SituationalTestData
    onSave: (title: string, brief: string, questions: SituationalQuestion[]) => void
    onGenerateAgain: () => void
  } | null
  /** A generated set of assessments waiting to be approved. The situational equivalent
   *  is one artefact; this is N cards, so it carries per-card actions too. */
  generationAssessmentReview: {
    drafts: GeneratedAssessment[]
    onSaveOne: (index: number) => void
    onDiscard: (index: number) => void
    onEdit: (index: number, patch: Partial<SituationalQuestion>) => void
  } | null
  /** The last AI run failed; the drawer shows why above the form or the review. */
  generationFailure: GenerationFailure | null
  /* Resources — non-null when a card's Edit reopened one. */
  resourceInitial: CourseResource | null
  onResourceSave: (resource: Omit<CourseResource, 'id'>) => void
}

/* One SideDrawer hosts every course builder content type. It stays mounted across
   swaps (library to SCORM) so the panel doesn't slide out and back in; SideDrawer only
   animates in on first open and out when activeDrawer goes to null. */
function ContentDrawer({
  activeDrawer,
  onClose,
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
  onSituationalTestCreate,
  interactiveType,
  interactiveInitial,
  interactiveInitialId,
  onInteractiveSave,
  onInteractiveDirtyChange,
  generationScope,
  generationCoverage,
  onGenerate,
  onAddLessons,
  generating,
  generationReview,
  generationAssessmentReview,
  generationFailure,
  resourceInitial,
  onResourceSave,
}: Props) {
  /* What content to render. Keeps the last type while activeDrawer goes to null, so
     the body stays on screen through SideDrawer's exit slide. */
  const last = useRef<ActiveDrawer>(activeDrawer)
  if (activeDrawer !== null) last.current = activeDrawer
  const rendered = last.current

  /* The empty elements SideDrawer draws in its header and footer; the bodies portal
     their title and buttons into them (DrawerSlots). */
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null)
  const [footerSlot, setFooterSlot] = useState<HTMLElement | null>(null)

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
    : rendered === 'resources' ? (resourceInitial ? 'Edit resource' : 'Add resource')
    : rendered === 'ai-generate' ? (generationScope === 'situational' ? 'Generate situational tests with AI' : 'Generate assessments with AI')
    : situationalTest ? 'Edit Situational Test'
    : 'Add Situational Test'

  /* Only bodies with pinned buttons get a footer, so the others draw no divider. The AI
     form keeps Generate under its last field; its wait and reviews pin theirs. Resources
     and the assessment form still lay out their footers inside the body, as ResourceForm
     and AssessmentModal are shared components. */
  const hasFooter =
    rendered === 'situational-test' ||
    rendered === 'interactive' ||
    (rendered === 'ai-generate' && !!(generating || generationReview || generationAssessmentReview))

  const shellClass =
    rendered === 'library' ? 'library-drawer'
    : rendered === 'scorm' ? 'scorm-drawer-shell'
    : rendered === 'situational-test' ? 'situational-test-drawer-shell'
    : rendered === 'interactive' ? 'interactive-drawer-shell'
    : rendered === 'resources' ? 'resources-drawer-shell'
    : rendered === 'ai-generate' ? `generate-drawer-shell${generationReview ? ' situational-test-drawer-shell' : ''}`
    : 'assessment-drawer-shell'

  return (
    <SideDrawer
      open={activeDrawer !== null}
      onClose={onClose}
      belowPageHeader
      ariaLabel={label}
      className={`content-drawer ${shellClass}`}
      bodyClassName="content-drawer__body"
      header={<div ref={setHeaderSlot} className="content-drawer__header-slot" />}
      footer={hasFooter ? <div ref={setFooterSlot} className="content-drawer__footer-slot" /> : undefined}
    >
      <DrawerSlotsContext.Provider value={{ header: headerSlot, footer: hasFooter ? footerSlot : null }}>
        {rendered === 'library' && (
          <LibraryDrawerContent
            addedIds={libraryAddedIds}
            onAdd={onLibraryAdd}
            onRemove={onLibraryRemove}
          />
        )}
        {rendered === 'scorm' && (
          <ScormDrawerContent
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
            onSave={onSituationalTestSave}
            onCreate={onSituationalTestCreate}
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
            onGenerate={onGenerate}
            onAddLessons={onAddLessons}
            generating={generating}
            review={generationReview}
            assessmentReview={generationAssessmentReview}
            failure={generationFailure}
          />
        )}
        {rendered === 'resources' && (
          /* Keyed so Edit on another card remounts the form with that resource. */
          <ResourcesDrawerContent
            key={resourceInitial?.id ?? 'new'}
            initial={resourceInitial}
            onSave={onResourceSave}
          />
        )}
      </DrawerSlotsContext.Provider>
    </SideDrawer>
  )
}

export default ContentDrawer
