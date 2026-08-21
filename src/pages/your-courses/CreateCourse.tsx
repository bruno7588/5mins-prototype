import { useEffect, useLayoutEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Danger } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import PageHeader from './components/PageHeader/PageHeader'
import ContentList from './components/ContentList/ContentList'
import CourseDetailsTab, {
  DEFAULT_COURSE_THUMBNAIL,
} from './components/CourseDetailsTab/CourseDetailsTab'
import type { CourseDetailsDraft } from './components/CourseDetailsTab/CourseDetailsTab'
import { saveCourse, type StoredCourse } from './courseStore'
import type { ContentItem } from './components/ContentList/ContentList'
import { QUESTION_BEAT_MS } from './components/GenerateAssessmentsDrawer/GenerateAssessmentsDrawer'
import AddContentIconStrip from './components/AddContentIconStrip/AddContentIconStrip'
import type { AssessmentType } from './components/AddContentSidebar/AddContentSidebar'
import type { ScormFile } from './components/ScormDrawer/ScormDrawer'
import ContentDrawer from './components/ContentDrawer/ContentDrawer'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
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
  TYPES_BY_SCOPE,
  generateOne,
  generateSet,
  generateSituationalTest,
  transcriptCoverage,
  type GeneratableType,
  type GenerationPrompt,
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
/* Long enough to read what each pass produces: the brief writes itself out over the
   first, the questions land one at a time over the second. A wait that shows its work
   is paced by the work, not by how soon it can be over. */
const SITUATIONAL_STEP_MS = 4200
/* How long the last step stays ticked before the drawer moves on. It is the one that
   says the work is done, so it has to be readable — without it the panel would swap to
   the review in the same frame it announced itself. */
const GENERATION_TAIL_MS = 1400

/* Every pass gets the base beat, except the one that writes the assessments: that one
   is as long as the cards it has to show, or the last few would land in a lump when the
   pass ended rather than one at a time. */
const stepDurations = (situational: boolean, count: number, cards: number, lessons: number) => {
  const base = situational ? SITUATIONAL_STEP_MS : GENERATION_STEP_MS
  /* Which pass writes the cards: the third of a situational run, the last of an
     assessments run. */
  const writing = situational ? CREATING_PASS : ASSESSMENT_CREATING_PASS
  return Array.from({ length: count }, (_, i) => {
    if (i === writing) return Math.max(base, cards * QUESTION_BEAT_MS + 400)
    /* The read names each lesson in turn under it, so it lasts as long as there are
       lessons to name — a single beat would leave most of them unread. */
    if (!situational && i === 0) return base * Math.max(1, lessons)
    return base
  })
}

/* Which pass writes the assessments — the reveal indexes the same list. A situational
   run writes a title and brief first, so its cards land on the third pass; an
   assessments run has neither, so they land on its second. */
const CREATING_PASS = 2
export const ASSESSMENT_CREATING_PASS = 1

/* The passes, in the order the work happens: the course is read, then the scenario is
   written from it, then the questions that run through the scenario, then the two are
   assembled. Each one names what is happening rather than counting to a number it
   cannot know (FR-11). */
/* The same shape as the situational passes below, minus the brief it has no equivalent
   of: the course is read, the assessments are written from it, and the last pass says
   the work is done. The lesson being read is the line under the first pass rather than a
   pass of its own, so the list is the length of the work rather than of the course. */
const ASSESSMENT_STEPS = [
  'Reading the source transcripts',
  'Creating assessments',
  'All done — your assessments are ready',
]

const SITUATIONAL_STEPS = [
  'Reading the source transcripts',
  'Writing the title and brief',
  'Creating assessments',
  'All done — your situational test is ready',
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
    /** How long each pass is held. Per pass, not one number: writing the assessments
     *  takes as long as there are assessments to write. */
    stepDurations: number[]
    lessons: TranscriptSource[]
    types: GeneratableType[]
    /** Written before the wait starts, so the wait can show it arriving rather than
     *  standing in for it. Situational only: assessments are a set, not one artefact. */
    draft: GeneratedAssessment | null
    /** The set, for the same reason: an assessments run reveals its cards as they are
     *  written, so they have to exist before the wait does. Empty on a situational run. */
    drafts: GeneratedAssessment[]
  } | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  /* Which lesson the first pass is naming. */
  const [reading, setReading] = useState(0)
  /* What the picker last asked for, kept past the run so a single-card redraft can be
     written to the same brief. */
  const [pickedFormats, setPickedFormats] = useState<GeneratableType[]>([])
  /* And what the admin told the generator alongside it. Kept for the same reason:
     Generate Again is the same ask made twice, not a fresh one. */
  const [pickedPrompt, setPickedPrompt] = useState<GenerationPrompt>({})
  /* Confirms an edit landed. Authoring needs no toast — a new card arrives on the
     outline, which is the confirmation — but re-saving changes a row in place, behind
     a drawer that is closing, and that is easy to miss. */
  const { toasts, show: showToast, dismiss: dismissToast } = useToast()
  /* A finished situational test waiting for the admin to approve it. It is not course
     content until they save — closing the drawer discards it, which is the point of
     asking. */
  const [pendingTest, setPendingTest] = useState<SituationalTestData | null>(null)
  /* And the same for a generated set of assessments. They used to land on the outline
     the moment the run ended, which asked the admin to undo rather than to approve —
     eight cards they had not read yet, mixed in with the ones they wrote themselves. */
  const [pendingAssessments, setPendingAssessments] = useState<GeneratedAssessment[] | null>(null)

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
    setPendingAssessments(null)
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
    if (editingAssessmentId !== null) showToast('success', 'Assessment updated')
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
    /* Interactive questions ride Assessment cards, so the confirmation names what the
       outline calls it rather than the format. */
    if (editingInteractiveId !== null) showToast('success', 'Assessment updated')
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
    if (editingSituationalId !== null) showToast('success', 'Situational test updated')
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
    /* A generated assessment is stored like an authored one too, in whichever of the two
       stores its format belongs to — so the row the admin approved opens in the drawer
       they would have written it in, holding what they just read. */
    const authored: Record<number, AssessmentData> = {}
    const interactives: Record<number, InteractiveQuestion> = {}
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
      if (draft.type === 'situational-test' && draft.questions) {
        const payload: SituationalTestData = {
          id,
          title: draft.title,
          brief: draft.brief ?? '',
          questions: draft.questions.map((q, i) => ({ ...q, id: `stq-gen-${id}-${i}` })),
        }
        tests[id] = payload
        sources[id].payload = payload
      } else {
        const question = draft.questions?.[0]
        if (question?.interactive) interactives[id] = question.interactive
        else if (question) {
          authored[id] = {
            type: draft.type as AssessmentType,
            question: question.text,
            options: question.options,
            correctIndex: question.correctIndex,
          }
        }
      }
    }
    setGeneratedSources((prev) => ({ ...prev, ...sources }))
    if (Object.keys(tests).length) setSituationalTests((prev) => ({ ...prev, ...tests }))
    if (Object.keys(authored).length) setAssessments((prev) => ({ ...prev, ...authored }))
    if (Object.keys(interactives).length) {
      setInteractive((prev) => ({ ...prev, ...interactives }))
    }
    return items
  }

  const startRun = (types: GeneratableType[], prompt: GenerationPrompt = {}) => {
    setPickedFormats(types)
    setPickedPrompt(prompt)
    /* The working card lives in the drawer, so both routes in — the first generation
       and a confirmed replace, which closed the drawer to show the outline — need it
       open again by the time the run starts. */
    setActiveDrawer('ai-generate')
    const situational = generationScope === 'situational'
    /* Written before the wait starts, so the wait can show it arriving rather than
       standing in for it — and so the passes can be sized against it. */
    const draft = situational
      ? generateSituationalTest(coverage.withTranscript, details, types)
      : null
    const drafts = situational ? [] : generateSet(types, coverage.withTranscript, details)
    const steps = situational ? SITUATIONAL_STEPS : ASSESSMENT_STEPS
    setRun({
      /* Assessments are written a lesson at a time, so the wait names the lesson
         being read; a situational test is one artefact built in three passes, so it
         names the passes. Either way the step says what is happening rather than
         counting to a number it can't know (FR-11). */
      steps,
      stepDurations: stepDurations(
        situational,
        steps.length,
        situational ? (draft?.questions?.length ?? 0) : drafts.length,
        coverage.withTranscript.length,
      ),
      lessons: coverage.withTranscript,
      /* The chips are question formats. Assessments generate those formats directly;
         a situational test is always one test, so its formats travel alongside the
         'situational-test' marker that tells generateSet which shape to build. */
      types: situational ? [...TYPES_BY_SCOPE.situational, ...types] : types,
      draft,
      drafts,
    })
  }

  /* Create With AI creates: a second run is a second situational test, not a redraft of
     the first. Replacing is what Generate Again does, inside a review, to the draft that
     review is holding. */
  const handleGenerate = (types: GeneratableType[], prompt?: GenerationPrompt) => startRun(types, prompt)

  const openGenerate = (scope: GenerationScope) => {
    setGenerationScope(scope)
    openDrawer('ai-generate')
  }

  /* The line under the pass name: the lesson being read, then who the brief is being
     written for. Naming the audience back is what tells the admin the field was read —
     a steer that disappears into a spinner reads as a steer that was ignored. The third
     pass names the format it is writing, which the drawer composes itself. Written as a
     chain rather than nested ternaries, so a third case can't fall through. */
  const runDetail = () => {
    if (!run) return undefined
    if (activeStep === 0 && run.lessons.length) {
      return `Reading "${run.lessons[reading % run.lessons.length].title}"`
    }
    if (activeStep === 1 && pickedPrompt.audience) return `Writing for ${pickedPrompt.audience}`
    return undefined
  }

  useEffect(() => {
    if (!run) return
    setActiveStep(0)
    setReading(0)
    /* The first pass reads the course, so it names what it is reading — one lesson at a
       time, so the wait is about this course rather than about waiting. */
    const reader = window.setInterval(
      () => setReading((i) => i + 1),
      Math.max(700, run.stepDurations[0] / Math.max(1, run.lessons.length)),
    )
    let at = 0
    const offsets = run.stepDurations.map((ms) => {
      const start = at
      at += ms
      return start
    })
    const steps = offsets.map((start, i) => window.setTimeout(() => setActiveStep(i), start))
    /* The last step is the card's terminal one — it ticks the moment it's reached
       rather than spinning — so the run ends a beat after it, not a full step. */
    const finish = window.setTimeout(() => {
      /* Both scopes wrote their drafts up front so the wait could show them arriving —
         so what the admin watched being written is what they are handed. */
      const drafts = run.draft ? [run.draft] : run.drafts
      setRun(null)

      /* A situational test is one artefact an admin publishes under their own name, so
         it is handed to them to approve rather than dropped onto the outline. The drawer
         stays open and swaps to the review. */
      const test = drafts.find((d) => d.type === 'situational-test')
      if (test) {
        setPendingTest({
          id: -1, // assigned on save, when it becomes a real outline row
          title: test.title,
          brief: test.brief ?? '',
          questions: (test.questions ?? []).map((q, i) => ({ ...q, id: `stq-gen-${i}` })),
        })
        return
      }

      /* A set is approved the same way the test is: the drawer holds it, and nothing
         reaches the outline until the admin says so. */
      setPendingAssessments(drafts)
    }, offsets[offsets.length - 1] + GENERATION_TAIL_MS)

    return () => {
      window.clearInterval(reader)
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
        : generateOne(source.type, source.lesson, item.title)

    setScormItems((prev) =>
      prev.map((existing) =>
        existing.id === item.id
          ? { ...existing, title: draft.title, metadata: draft.metadata }
          : existing,
      ),
    )
    /* The stored payload has to follow the card, or the row would show the new title
       over the old brief and questions. */
    if (draft.type === 'situational-test' && draft.questions) {
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

  /* Approved. The draft becomes an outline row here and nowhere earlier, carrying
     whatever edits the admin made in the review. */
  const handleSaveGeneratedTest = (
    title: string,
    brief: string,
    questions: SituationalQuestion[],
  ) => {
    const id = nextGeneratedId++
    const payload: SituationalTestData = { id, title, brief, questions }
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
      ...prev,
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

  /* The set is approved. placeDrafts is what records where each card came from, which is
     what the outline's own Delete & Regenerate reads later — so approval goes through it
     rather than appending the cards directly. */
  const handleSaveGeneratedAssessments = () => {
    if (!pendingAssessments) return
    setScormItems((prev) => [...prev, ...placeDrafts(pendingAssessments)])
    setPendingAssessments(null)
    closeDrawer()
  }

  /* One card the admin does not want. It is dropped from the set rather than generated
     over — a set of six they chose beats seven they have to keep explaining away. */
  const handleRemovePendingAssessment = (index: number) => {
    setPendingAssessments((prev) => (prev ? prev.filter((_, i) => i !== index) : prev))
  }

  /* Undo on the delete toast. The outline position is restored by ContentList,
     which is the only thing that knows it; this puts the item back in the list. */
  const handleRestoreExtra = (item: ContentItem) => {
    setScormItems((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]))
    const payload = generatedSources[item.id]?.payload
    if (payload) setSituationalTests((prev) => ({ ...prev, [item.id]: payload }))
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
        /* No Preview action while the course is being created: there is nothing to
           preview until it exists. Preview belongs on the course once created. */
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
            onRestoreExtra={handleRestoreExtra}
            onRegenerateExtra={handleRegenerateOne}
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
        generating={
          run
            ? {
                steps: run.steps,
                activeStep,
                stepMs: run.stepDurations[activeStep] ?? SITUATIONAL_STEP_MS,
                draft: run.draft,
                drafts: run.drafts,
                detail: runDetail(),
              }
            : null
        }
        generationReview={
          pendingTest
            ? {
                draft: pendingTest,
                onSave: handleSaveGeneratedTest,
                onGenerateAgain: () => {
                  /* Clearing the draft first drops the review, so the drawer goes back
                     to the working card and the wait is shown again from the top. */
                  setPendingTest(null)
                  startRun(pickedFormats, pickedPrompt)
                },
              }
            : null
        }
        generationAssessmentReview={
          pendingAssessments
            ? {
                drafts: pendingAssessments,
                onSave: handleSaveGeneratedAssessments,
                onRemove: handleRemovePendingAssessment,
                onGenerateAgain: () => {
                  setPendingAssessments(null)
                  startRun(pickedFormats, pickedPrompt)
                },
              }
            : null
        }
        generationCoverage={coverage}
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

      {/* Sits above the drawers (z-index 1100) so the confirmation is readable while a
          panel is still sliding out. */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}

export default CreateCourse
