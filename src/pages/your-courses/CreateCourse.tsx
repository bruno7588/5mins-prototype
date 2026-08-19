import { useEffect, useLayoutEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Danger, Eye } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import PageHeader from './components/PageHeader/PageHeader'
import ContentList from './components/ContentList/ContentList'
import CourseDetailsTab, {
  DEFAULT_COURSE_THUMBNAIL,
} from './components/CourseDetailsTab/CourseDetailsTab'
import type { CourseDetailsDraft } from './components/CourseDetailsTab/CourseDetailsTab'
import { saveCourse, type StoredCourse } from './courseStore'
import { buildPreviewCourse } from './previewCourse'
import type { ContentItem, OutlineSection } from './components/ContentList/ContentList'
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
  type InteractiveQuestion,
  type InteractiveQuestionType,
} from '@/data/interactiveQuestions'
import {
  CARD_TYPE_BY_SCOPE,
  TYPES_BY_SCOPE,
  generateOne,
  generateSet,
  generateSituationalTest,
  transcriptCoverage,
  type GeneratableType,
  type GeneratedAssessment,
  type GenerationScope,
  type TranscriptSource,
} from '@/data/aiAssessmentGeneration'

const assessmentLabels: Record<AssessmentType, string> = {
  'single-choice': 'Multiple Choice',
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
/* Generated assessments ride the same two card types, so they need their own
   stretch of the id space again (DES-279). */
let nextGeneratedId = 3000

type ActiveDrawer =
  | 'library'
  | 'scorm'
  | 'assessment'
  | 'situational-test'
  | 'interactive'
  | 'ai-generate'
  | null

/* How long the mock holds each step. The real generator's pace comes from the
   transcript, which is exactly why the card counts up instead of filling a bar.
   A situational test is three pieces of work rather than a read per lesson, so each
   of its steps carries more and is held long enough to actually be read — a step
   that flicks past says nothing about what the generator is doing. */
const GENERATION_STEP_MS = 1100
const SITUATIONAL_STEP_MS = 2600
/* How long the finished step stays ticked before the drawer closes. Without it the
   last step is marked done and the panel vanishes in the same frame. */
const GENERATION_TAIL_MS = 900

/* Three steps, in the order the work actually happens: the scenario is written
   first (from the course's own title and description as well as the lessons),
   then the questions that run through it, then the two are assembled. */
const SITUATIONAL_STEPS = [
  'Writing the title and brief from your course and lessons',
  'Writing 6–8 questions',
  'Building your situational test',
]

/* A generated draft's provenance: which format it is and which lesson it was read
   from. FR-12 wants the source recorded; regenerating one (FR-09a) needs it too,
   or the redraft would have nothing to read. */
interface GeneratedSource {
  type: GeneratableType
  lesson: TranscriptSource
  /** Situational tests only. handleRemoveSituationalTest clears the live store on
   *  delete; this copy is what undo restores from. */
  payload?: SituationalTestData
  /** The formats the admin asked for. Kept so redrafting one card writes the same
   *  kinds of question the first pass did — a regenerate that quietly reverted to
   *  every format would undo the pick. */
  formats?: GeneratableType[]
}

const toContentItem = (draft: GeneratedAssessment, id: number): ContentItem => ({
  id,
  /* Situational tests are their own card type; the other eight formats all ride
     the Assessment card, same as when they're authored by hand. */
  type: draft.type === 'situational-test' ? 'SituationalTest' : 'Assessment',
  title: draft.title,
  metadata: draft.metadata,
  thumbnail: '',
  source: 'ai',
})

function CreateCourse() {
  const navigate = useNavigate()
  /* The builder opens on Details — a course starts with its title, and the
     outline is the second step. */
  const [activeTab, setActiveTab] = useState('Details')
  const [details, setDetails] = useState<CourseDetailsDraft>({
    title: '',
    description: '',
    /* A course starts with artwork rather than an empty box. The copy always
       promised an automatic thumbnail — this is it, present from the start instead
       of appearing at Create, so what the admin sees is what ships. Removing it
       returns the picker to its empty state. */
    thumbnail: DEFAULT_COURSE_THUMBNAIL,
  })
  const [scormItems, setScormItems] = useState<ContentItem[]>([])
  /* Mirrors the outline ContentList owns, so Preview can show the real sections
     and ordering rather than a flat re-derivation of what was added. */
  const [outline, setOutline] = useState<OutlineSection[]>([])
  const [addedScormIds, setAddedScormIds] = useState<Set<number>>(new Set())
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('single-choice')
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
  /* AI generation (DES-279). `run` is non-null only while the generator is working;
     the outline shows the working card in the place the drafts will land. */
  const [generatedSources, setGeneratedSources] = useState<Record<number, GeneratedSource>>({})
  /* Which rail group the generator was opened from. It scopes everything downstream:
     what gets written, what "Regenerate All" replaces, and which rows light up in the
     confirmation. */
  const [generationScope, setGenerationScope] = useState<GenerationScope>('assessments')
  const [run, setRun] = useState<{
    steps: string[]
    /** How long each step is held — the two scopes do differently sized work. */
    stepMs: number
    lessons: TranscriptSource[]
    types: GeneratableType[]
  } | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  /* What the picker last asked for, kept past the run so a single-card redraft can be
     written to the same brief. */
  const [pickedFormats, setPickedFormats] = useState<GeneratableType[]>([])
  const [confirmRegenerateAll, setConfirmRegenerateAll] = useState(false)
  const [pendingTypes, setPendingTypes] = useState<GeneratableType[]>([])
  /* A finished situational test waiting for the admin to approve it. It is not course
     content until they save — closing the drawer discards it, which is the point of
     asking. Assessments have no equivalent: a set of eight questions is reviewed on
     the outline, where they can be deleted one at a time. */
  const [pendingTest, setPendingTest] = useState<SituationalTestData | null>(null)

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
    setPendingTest(null)
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
      /* The format, and nothing after it — the badge already reads "Assessment",
         and a count of pairs or blanks is a detail of the question rather than
         something to scan a row for. Generated cards read the same way. */
      metadata: TYPE_CONFIG[question.type].label,
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

  /* --- AI generation (DES-279) --------------------------------------------- */

  const coverage = transcriptCoverage(scormItems)

  /* Adds the drafts to the outline and records where each came from. Shared by the
     first generation, the single redraft and the full replace, since all three end
     the same way. */
  const placeDrafts = (drafts: GeneratedAssessment[]) => {
    const items: ContentItem[] = []
    const sources: Record<number, GeneratedSource> = {}
    const tests: Record<number, SituationalTestData> = {}
    for (const draft of drafts) {
      const id = nextGeneratedId++
      items.push(toContentItem(draft, id))
      sources[id] = {
        type: draft.type,
        lesson: { id: draft.sourceLessonId, title: draft.sourceLessonTitle },
        formats: pickedFormats,
      }
      /* A generated situational test is stored like an authored one — same shape,
         same store — so it deletes, restores and previews through the same paths
         rather than being a card with nothing behind it. */
      if (draft.questions) {
        const payload: SituationalTestData = {
          id,
          title: draft.title,
          brief: draft.brief ?? '',
          questions: draft.questions.map((q, i) => ({ ...q, id: `stq-gen-${id}-${i}` })),
        }
        tests[id] = payload
        sources[id].payload = payload
      }
    }
    setGeneratedSources((prev) => ({ ...prev, ...sources }))
    if (Object.keys(tests).length) setSituationalTests((prev) => ({ ...prev, ...tests }))
    return items
  }

  const startRun = (types: GeneratableType[]) => {
    setPickedFormats(types)
    /* The working card lives in the drawer, so both routes in — the first generation
       and a confirmed replace, which closed the drawer to show the outline — need it
       open again by the time the run starts. */
    setActiveDrawer('ai-generate')
    const situational = generationScope === 'situational'
    setRun({
      /* Assessments are written a lesson at a time, so the wait names the lesson
         being read; a situational test is one artefact built in three passes, so it
         names the passes. Either way the step says what is happening rather than
         counting to a number it can't know (FR-11). */
      steps: situational
        ? SITUATIONAL_STEPS
        : [
            ...coverage.withTranscript.map((l) => `Reading "${l.title}"`),
            'Writing your assessments',
          ],
      stepMs: situational ? SITUATIONAL_STEP_MS : GENERATION_STEP_MS,
      lessons: coverage.withTranscript,
      /* The chips are question formats. Assessments generate those formats directly;
         a situational test is always one test, so its formats travel alongside the
         'situational-test' marker that tells generateSet which shape to build. */
      types: situational ? [...TYPES_BY_SCOPE.situational, ...types] : types,
    })
  }

  /* With a set already on the outline, generating again would stack a second set
     on top of the first — so the same action becomes a replace, and a replace is
     where the confirmation belongs (FR-09b). The drawer closes first: the point of
     the confirmation is that the outline behind it shows what would go. */
  const handleGenerate = (types: GeneratableType[]) => {
    if (generatedCount > 0) {
      /* Closed so the confirmation can show the outline behind it — startRun reopens. */
      closeDrawer()
      setPendingTypes(types)
      setConfirmRegenerateAll(true)
      return
    }
    startRun(types)
  }

  const openGenerate = (scope: GenerationScope) => {
    setGenerationScope(scope)
    openDrawer('ai-generate')
  }

  useEffect(() => {
    if (!run) return
    setActiveStep(0)
    const steps = run.steps.map((_, i) =>
      window.setTimeout(() => setActiveStep(i), run.stepMs * i),
    )
    /* The last step is the card's terminal one — it ticks the moment it's reached
       rather than spinning — so the run ends a beat after it, not a full step. */
    const finish = window.setTimeout(() => {
      const drafts = generateSet(run.types, run.lessons, details)
      setRun(null)

      /* A situational test is one artefact an admin publishes under their own name, so
         it is handed to them to approve rather than dropped onto the outline. The drawer
         stays open and swaps to the review. */
      const test = drafts.find((d) => d.questions)
      if (test) {
        setPendingTest({
          id: -1, // assigned on save, when it becomes a real outline row
          title: test.title,
          brief: test.brief ?? '',
          questions: (test.questions ?? []).map((q, i) => ({ ...q, id: `stq-gen-${i}` })),
        })
        return
      }

      setScormItems((prev) => [...prev, ...placeDrafts(drafts)])
      setActiveDrawer(null)
    }, run.stepMs * (run.steps.length - 1) + GENERATION_TAIL_MS)

    return () => {
      steps.forEach(window.clearTimeout)
      window.clearTimeout(finish)
    }
  }, [run])

  /* FR-09a — one weak question is redrafted on its own. The card keeps its id, so
     it also keeps its place in its section: only the words change. */
  const handleRegenerateOne = (item: ContentItem) => {
    const source = generatedSources[item.id]
    if (!source) return
    /* A situational test is built from the whole course, so its redraft reads every
       transcribed lesson again — not just the one recorded against it. */
    const draft =
      source.type === 'situational-test'
        ? generateSituationalTest(coverage.withTranscript, details, source.formats ?? [])
        : generateOne(source.type, source.lesson)

    setScormItems((prev) =>
      prev.map((existing) =>
        existing.id === item.id
          ? { ...existing, title: draft.title, metadata: draft.metadata }
          : existing,
      ),
    )
    /* The stored payload has to follow the card, or the row would show the new title
       over the old brief and questions. */
    if (draft.questions) {
      const payload: SituationalTestData = {
        id: item.id,
        title: draft.title,
        brief: draft.brief ?? '',
        questions: draft.questions.map((q, i) => ({ ...q, id: `stq-gen-${item.id}-${i}` })),
      }
      setSituationalTests((prev) => ({ ...prev, [item.id]: payload }))
      setGeneratedSources((prev) => ({ ...prev, [item.id]: { ...prev[item.id], payload } }))
    }
  }

  /** Drops the generated items in the open scope. Hand-authored items are never in
   *  scope, and neither is the other group's output: regenerating assessments leaves
   *  generated situational tests where they are. That is the whole reason the
   *  confirmation lights up exactly what goes. */
  const clearGeneratedInScope = () => {
    setScormItems((prev) => prev.filter((item) => !isGeneratedInScope(item)))
    setGeneratedSources((prev) => {
      const next = { ...prev }
      for (const id of Object.keys(next)) {
        const item = scormItems.find((i) => i.id === Number(id))
        if (item && isGeneratedInScope(item)) delete next[Number(id)]
      }
      return next
    })
  }

  /* FR-09b. Assessments go straight back through the generator; a situational test is
     only cleared once its replacement has been approved, so backing out of the review
     leaves the admin with what they already had rather than nothing. */
  const handleRegenerateAll = () => {
    setConfirmRegenerateAll(false)
    if (generationScope !== 'situational') clearGeneratedInScope()
    /* Through the working card again rather than swapping the set out instantly —
       a replace takes as long as the first pass, and pretending otherwise would
       make the second set look pre-written. */
    startRun(pendingTypes)
  }

  /* Approved. The draft becomes an outline row here and nowhere earlier, carrying
     whatever edits the admin made in the review. */
  const handleSaveGeneratedTest = (
    title: string,
    brief: string,
    questions: SituationalQuestion[],
  ) => {
    const id = nextGeneratedId++
    const payload: SituationalTestData = { id, title, brief, questions }
    /* A replace only lands once the new one is approved — see handleRegenerateAll. */
    clearGeneratedInScope()
    setSituationalTests((prev) => ({ ...prev, [id]: payload }))
    setGeneratedSources((prev) => ({
      ...prev,
      [id]: {
        type: 'situational-test',
        lesson: coverage.withTranscript[0] ?? { id: 0, title: '' },
        payload,
        formats: pickedFormats,
      },
    }))
    setScormItems((prev) => [
      ...prev.filter((item) => !isGeneratedInScope(item)),
      {
        id,
        type: 'SituationalTest',
        title,
        metadata: `${questions.length} questions`,
        thumbnail: '',
        source: 'ai',
      },
    ])
    setPendingTest(null)
    closeDrawer()
  }

  /* Undo on the delete toast. The outline position is restored by ContentList,
     which is the only thing that knows it; this puts the item back in the list. */
  const handleRestoreExtra = (item: ContentItem) => {
    setScormItems((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]))
    const payload = generatedSources[item.id]?.payload
    if (payload) setSituationalTests((prev) => ({ ...prev, [item.id]: payload }))
  }

  /* The two scopes never share a card type, so the card type is the attribution —
     no lookup needed to tell one group's output from the other's. */
  const isGeneratedInScope = (item: ContentItem) =>
    item.source === 'ai' && item.type === CARD_TYPE_BY_SCOPE[generationScope]

  const generatedCount = scormItems.filter(isGeneratedInScope).length

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

  /* ContentList only mounts on the Course Content tab, so its reported outline
     goes stale the moment something is added from Details — where the Add
     Content rail is equally available. Trust the outline only while it still
     accounts for every item; otherwise show the flat list, which is always
     current. Better a preview without section headings than one missing content. */
  const outlineItemCount = outline.reduce((n, s) => n + s.items.length, 0)
  const previewOutline =
    outlineItemCount === scormItems.length && outline.length > 0
      ? outline
      : [{ id: 'preview-all', name: 'Course content', items: scormItems }]

  /* The title is the only thing a course can't be created without — the outline
     can be filled in later, and a missing thumbnail falls back to the generated
     one the Details copy promises. */
  const canCreate = details.title.trim().length > 0

  /* Both actions persist the course; only the status and where they land differ.
     Creating opens the confirmation over the Courses folder, so closing it leaves
     the admin exactly where the modal says the course now lives. */
  const commit = (status: StoredCourse['status']) => {
    const course: StoredCourse = {
      id: Date.now(),
      title: details.title.trim(),
      description: details.description.trim(),
      thumbnail: details.thumbnail || DEFAULT_COURSE_THUMBNAIL,
      status,
      lessons: scormItems.length,
      createdAt: new Date().toISOString(),
    }
    saveCourse(course)
    navigate('/your-courses/list', {
      state: status === 'published' ? { createdCourseId: course.id } : { toast: 'Draft saved' },
    })
  }

  return (
    <>
      <PageHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        secondaryDisabled={!canCreate}
        onSecondary={() => commit('draft')}
        primaryDisabled={!canCreate}
        onPrimary={() => commit('published')}
        leadingAction={
          <Button
            variant="outlined-2"
            icon={<Eye size={20} color="currentColor" variant="Linear" />}
            /* Gated on the same thing Save Draft and Create Course are: an untitled
               course has nothing to preview, and the three actions sitting side by
               side shouldn't disagree about whether it's ready. */
            disabled={!canCreate}
            onClick={() =>
              navigate('/courses/preview', {
                state: { preview: buildPreviewCourse(details, previewOutline, interactive) },
              })
            }
          >
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
          {activeTab === 'Details' && (
            <CourseDetailsTab draft={details} onChange={setDetails} />
          )}
          {activeTab === 'Course Content' && (
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
            onOutlineChange={setOutline}
            onRestoreExtra={handleRestoreExtra}
            onRegenerateExtra={handleRegenerateOne}
            highlightGenerated={confirmRegenerateAll ? CARD_TYPE_BY_SCOPE[generationScope] : null}
          />
          )}
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
        onGenerateWithAIClick={openGenerate}
        activeGenerateScope={activeDrawer === 'ai-generate' ? generationScope : null}
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
        generationScope={generationScope}
        generating={run ? { steps: run.steps, activeStep } : null}
        generationReview={
          pendingTest
            ? {
                draft: pendingTest,
                onSave: handleSaveGeneratedTest,
                onGenerateAgain: () => {
                  setPendingTest(null)
                  startRun(TYPES_BY_SCOPE.situational)
                },
              }
            : null
        }
        generationCoverage={coverage}
        generatedCount={generatedCount}
        onGenerate={handleGenerate}
        onAddLessons={() => openDrawer('library')}
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

      {/* FR-09b. The count is here, but the outline behind is where the answer
          actually is: the generated rows stay lit and the rest recedes, so what's
          about to go is read rather than counted. */}
      <ConfirmModal
        open={confirmRegenerateAll}
        onClose={() => setConfirmRegenerateAll(false)}
        ariaLabel={generationScope === 'situational' ? 'Replace generated situational tests' : 'Replace generated assessments'}
      >
        <div className="confirm-modal-header confirm-modal-header--center">
          <div className="confirm-modal-icon">
            <Danger size={56} color="var(--warning-500)" variant="Linear" />
          </div>
          <h2 className="confirm-modal-title">
            Replace {generatedCount} generated{' '}
            {generationScope === 'situational' ? 'situational test' : 'assessment'}
            {generatedCount === 1 ? '' : 's'}?
          </h2>
          <p className="confirm-modal-body">
            {generatedCount === 1 ? 'The highlighted one is' : 'The highlighted ones are'}{' '}
            replaced with a fresh draft. Anything you wrote yourself is left alone.
          </p>
        </div>
        <div className="confirm-modal-actions">
          <Button variant="outlined-2" onClick={() => setConfirmRegenerateAll(false)}>
            {generatedCount === 1 ? 'Keep It' : 'Keep Them'}
          </Button>
          <Button semantic="warning" onClick={handleRegenerateAll}>
            {generatedCount === 1 ? 'Replace' : 'Replace All'}
          </Button>
        </div>
      </ConfirmModal>
    </>
  )
}

export default CreateCourse
