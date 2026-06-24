import {
  workspacePrograms,
  type WorkspaceProgram,
  type ProgramCourse,
  type ProgramCourseState,
  type CourseStatus,
} from '../workspace/mockItems'
import { fiveMinsCourses } from './coursesCatalog'
import courseThumb1 from '../../assets/programs/course-1.png'
import courseThumb2 from '../../assets/programs/course-2.png'
import courseThumb3 from '../../assets/programs/course-3.png'
import courseThumb4 from '../../assets/programs/course-4.png'

/** Mock course library used by the course-step picker in the builder. */
export interface LibraryCourse {
  courseId: string
  title: string
  lessonCount: number
  durationMinutes: number
  thumbnail: string
}

export const MOCK_LIBRARY: LibraryCourse[] = [
  { courseId: 'lib-1', title: 'Master Coaching Strategies for Optimal Performance', lessonCount: 12, durationMinutes: 34, thumbnail: courseThumb1 },
  { courseId: 'lib-2', title: 'Mastering Feedback — Practical Models and Techniques', lessonCount: 9, durationMinutes: 21, thumbnail: courseThumb2 },
  { courseId: 'lib-3', title: 'Leadership That Drives Innovation', lessonCount: 17, durationMinutes: 48, thumbnail: courseThumb3 },
  { courseId: 'lib-4', title: 'Listen to Lead: The Power of Listening', lessonCount: 6, durationMinutes: 15, thumbnail: courseThumb4 },
]

/**
 * Authoring model for the admin Program Builder. Richer than the learner-facing
 * `WorkspaceProgram`: a program is a flat, ordered list of polymorphic steps
 * (course / email / spaced-repetition review), each with a release rule + due
 * date, plus a certificate config. Sections are deferred to v2.
 *
 * Drafts are persisted to localStorage and mapped to `WorkspaceProgram` via
 * `toWorkspaceProgram` so the existing learner pages render them unchanged.
 */

export type StepType = 'course' | 'email' | 'review'

export type ReleaseRule =
  | { kind: 'on-start' } // available as soon as the program starts
  | { kind: 'after-days'; days: number } // N days after the previous step
  | { kind: 'on-date'; date: string } // fixed calendar date (ISO yyyy-mm-dd)
  | { kind: 'after-step'; stepId: string; days?: number } // after step X completes (+ optional delay)

interface StepBase {
  id: string
  type: StepType
  title: string
  release: ReleaseRule
  /** Due N days after release (relative) … */
  dueDays?: number
  /** … or a fixed due date (ISO yyyy-mm-dd). */
  dueDate?: string
}

export interface CourseStep extends StepBase {
  type: 'course'
  courseId: string
  lessonCount: number
  durationMinutes: number
  thumbnail: string
}

export interface EmailStep extends StepBase {
  type: 'email'
  subject: string
  body: string
}

export interface ReviewStep extends StepBase {
  type: 'review'
  /** Spaced-repetition delay, in days after completion (default 14). */
  delayDays: number
  /** Which course steps this reviews; defaults to all prior courses. */
  sourceStepIds?: string[]
}

export type ProgramStep = CourseStep | EmailStep | ReviewStep

export interface ProgramCertificate {
  enabled: boolean
  template?: 'classic' | 'minimal'
  /** Months until the certificate expires; omit for no expiry. */
  expiryMonths?: number
}

export interface ProgramDraft {
  id: string
  title: string
  description: string
  thumbnailGradient: string
  image?: string
  steps: ProgramStep[]
  certificate: ProgramCertificate
  status: 'draft' | 'published'
  lastModified: string
}

const STORAGE_KEY = '5mins-programs'
const HIDDEN_KEY = '5mins-programs-hidden'

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #6368db, #8158ec)'

/** Display "last updated" date for the seed/mock programs (no real timestamp). */
const MOCK_UPDATED: Record<string, string> = {
  p1: '2026-06-18T00:00:00.000Z',
  p2: '2026-05-30T00:00:00.000Z',
  p3: '2026-06-10T00:00:00.000Z',
}

/** Mirror of the `loadUserFields` pattern in BulkUploadModal — fail soft on bad JSON. */
export function loadPrograms(): ProgramDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ProgramDraft[]) : []
  } catch {
    return []
  }
}

export function saveProgram(program: ProgramDraft): void {
  const all = loadPrograms()
  const idx = all.findIndex((p) => p.id === program.id)
  const next = { ...program, lastModified: new Date().toISOString() }
  if (idx >= 0) all[idx] = next
  else all.push(next)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    /* storage full / unavailable — non-fatal for the prototype */
  }
}

export function getStoredProgramById(id: string): ProgramDraft | undefined {
  return loadPrograms().find((p) => p.id === id)
}

function loadHidden(): string[] {
  try {
    const raw = localStorage.getItem(HIDDEN_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

/**
 * Remove a program from every surface. Drafts are dropped from the store; seed
 * programs (which can't be mutated) are added to a hidden-ids list that the
 * list + learner queries filter out.
 */
export function deleteProgram(id: string): void {
  const all = loadPrograms().filter((p) => p.id !== id)
  const hidden = Array.from(new Set([...loadHidden(), id]))
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(hidden))
  } catch {
    /* non-fatal */
  }
}

/** Generates a stable-enough id for a new draft or step (no Math.random reliance in hot loops). */
export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`
}

export function emptyDraft(): ProgramDraft {
  return {
    id: makeId('prog'),
    title: '',
    description: '',
    thumbnailGradient: DEFAULT_GRADIENT,
    steps: [],
    certificate: { enabled: false },
    status: 'draft',
    lastModified: new Date().toISOString(),
  }
}

/** Seed course steps sourced from the 5Mins catalogue (real titles + thumbnails).
 *  First course enrols immediately with no due date; the rest drip on a delay
 *  with a relative due date — enough rows to exercise the table's pagination. */
const seedCourseSteps: ProgramStep[] = fiveMinsCourses()
  .slice(0, 16)
  .map((c, i) => ({
    id: `ds-${i + 1}`,
    type: 'course',
    title: c.title,
    courseId: c.courseId,
    lessonCount: c.lessonCount,
    durationMinutes: c.durationMinutes,
    thumbnail: c.thumb,
    release: i === 0 ? { kind: 'on-start' } : { kind: 'after-days', days: 3 },
    dueDays: i === 0 ? undefined : 14,
  }))

/** Built-in example draft so the admin list always shows a Draft row. */
export const SEED_DRAFTS: ProgramDraft[] = [
  {
    id: 'draft-emerging-leaders',
    title: 'Emerging Leaders Program',
    description:
      'A draft pathway for first-time managers — coaching, feedback, and leading with influence.',
    thumbnailGradient: 'linear-gradient(135deg, #00afc4, #6368db)',
    steps: seedCourseSteps,
    certificate: { enabled: true },
    status: 'draft',
    lastModified: '2026-06-21T00:00:00.000Z',
  },
]

/** A draft's source of truth: a saved draft (localStorage) wins over the seed draft. */
function getDraftSource(id: string): ProgramDraft | undefined {
  return getStoredProgramById(id) ?? SEED_DRAFTS.find((d) => d.id === id)
}

function formatDueDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  } catch {
    return iso
  }
}

/** Derive the learner-facing badge for a course step from its release/due rule. */
function deriveStatus(step: CourseStep, locked: boolean): { status?: CourseStatus; statusLabel?: string } {
  if (locked && step.release.kind === 'on-date') {
    return { status: 'scheduled', statusLabel: `Scheduled for ${formatDueDate(step.release.date)}` }
  }
  if (step.dueDate) {
    return { status: 'due', statusLabel: `Due on ${formatDueDate(step.dueDate)}` }
  }
  return {}
}

/**
 * Flatten a draft into the learner `WorkspaceProgram` shape. Only course steps
 * become outline rows (email/review steps are builder-only for now). For a fresh
 * program the first course is the next-up (`jump-here`) and the rest are locked.
 */
export function toWorkspaceProgram(draft: ProgramDraft): WorkspaceProgram {
  const courseSteps = draft.steps.filter((s): s is CourseStep => s.type === 'course')
  const totalMinutes = courseSteps.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)

  const outline: ProgramCourse[] = courseSteps.map((s, i) => {
    const state: ProgramCourseState = i === 0 ? 'jump-here' : 'locked'
    const { status, statusLabel } = deriveStatus(s, state === 'locked')
    return {
      id: s.courseId || s.id,
      title: s.title,
      lessonCount: s.lessonCount,
      durationMinutes: s.durationMinutes,
      thumbnail: s.thumbnail,
      state,
      status,
      statusLabel,
    }
  })

  return {
    id: draft.id,
    title: draft.title || 'Untitled program',
    description: draft.description,
    thumbnailGradient: draft.thumbnailGradient,
    image: draft.image,
    courseCount: courseSteps.length,
    durationLabel: `${totalMinutes} min`,
    learnerCount: 0,
    progress: 0,
    outline,
  }
}

/** Mock programs + published drafts, for the learner Workspace + ProgramDetails.
 *  Stored drafts win over a seed program with the same id; hidden ids are excluded. */
export function getAllPrograms(): WorkspaceProgram[] {
  const stored = loadPrograms()
  const hidden = new Set(loadHidden())
  const storedIds = new Set(stored.map((p) => p.id))
  const published = stored
    .filter((p) => p.status === 'published' && !hidden.has(p.id))
    .map(toWorkspaceProgram)
  const mock = workspacePrograms.filter((p) => !storedIds.has(p.id) && !hidden.has(p.id))
  return [...published, ...mock]
}

/** Build an editable draft from a seed program (for Edit / Duplicate of mock rows). */
function mockToDraft(p: WorkspaceProgram): ProgramDraft {
  const steps: ProgramStep[] = p.outline.map((c) => ({
    id: makeId('step'),
    type: 'course',
    title: c.title,
    courseId: c.id,
    lessonCount: c.lessonCount,
    durationMinutes: c.durationMinutes,
    thumbnail: c.thumbnail,
    release: { kind: 'on-start' },
  }))
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    thumbnailGradient: p.thumbnailGradient,
    image: p.image,
    steps,
    certificate: { enabled: true },
    status: 'published',
    lastModified: MOCK_UPDATED[p.id] ?? new Date().toISOString(),
  }
}

/** Draft to hydrate the builder: saved/seed draft → seed-derived from a program → empty (new). */
export function loadDraftForBuilder(id?: string): ProgramDraft {
  if (!id) return emptyDraft()
  const draft = getDraftSource(id)
  if (draft) return draft
  const mock = workspacePrograms.find((p) => p.id === id)
  return mock ? mockToDraft(mock) : emptyDraft()
}

/** Clone a program (draft or seed) into a new draft, returns the new id. */
export function duplicateProgram(id: string): string {
  const draft = getDraftSource(id)
  const mock = workspacePrograms.find((p) => p.id === id)
  const src = draft ?? (mock ? mockToDraft(mock) : undefined)
  if (!src) return ''
  const copy: ProgramDraft = {
    ...(JSON.parse(JSON.stringify(src)) as ProgramDraft),
    id: makeId('prog'),
    title: `${src.title} (Copy)`,
    status: 'draft',
    lastModified: new Date().toISOString(),
  }
  saveProgram(copy)
  return copy.id
}

/** Row shape for the admin Programs list table. */
export interface AdminProgramRow {
  id: string
  title: string
  image?: string
  thumbnailGradient: string
  courseCount: number
  learnerCount: number
  status: 'draft' | 'published'
  /** ISO timestamp of the last edit (drafts) or seed display date. */
  updatedAt: string
}

/** All programs for the admin list: stored drafts (any status) + seed programs,
 *  deduped by id (stored wins) and minus hidden/deleted ids. */
export function getAdminProgramRows(): AdminProgramRow[] {
  const stored = loadPrograms()
  const hidden = new Set(loadHidden())
  const storedIds = new Set(stored.map((p) => p.id))
  // Saved drafts + built-in seed drafts (saved wins over seed of the same id).
  const draftSources = [...stored, ...SEED_DRAFTS.filter((d) => !storedIds.has(d.id))]
  const draftRows: AdminProgramRow[] = draftSources
    .filter((d) => !hidden.has(d.id))
    .map((d) => ({
      id: d.id,
      title: d.title || 'Untitled program',
      image: d.image,
      thumbnailGradient: d.thumbnailGradient,
      courseCount: d.steps.filter((s) => s.type === 'course').length,
      learnerCount: 0,
      status: d.status,
      updatedAt: d.lastModified,
    }))
  const mockRows: AdminProgramRow[] = workspacePrograms
    .filter((p) => !storedIds.has(p.id) && !hidden.has(p.id))
    .map((p) => ({
      id: p.id,
      title: p.title,
      image: p.image,
      thumbnailGradient: p.thumbnailGradient,
      courseCount: p.courseCount,
      learnerCount: p.learnerCount,
      status: 'published',
      updatedAt: MOCK_UPDATED[p.id] ?? '2026-06-01T00:00:00.000Z',
    }))
  return [...draftRows, ...mockRows]
}
