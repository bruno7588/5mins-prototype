import {
  workspacePrograms,
  type WorkspaceProgram,
  type ProgramCourse,
  type ProgramCourseState,
  type CourseStatus,
} from '../workspace/mockItems'
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

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #6368db, #8158ec)'

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

export function deleteProgram(id: string): void {
  const all = loadPrograms().filter((p) => p.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
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

/** Mock programs + published drafts, for the learner Workspace + ProgramDetails. */
export function getAllPrograms(): WorkspaceProgram[] {
  const published = loadPrograms()
    .filter((p) => p.status === 'published')
    .map(toWorkspaceProgram)
  return [...published, ...workspacePrograms]
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
  /** Editable drafts open in the builder; mock programs open the learner view. */
  isDraft: boolean
}

/** All programs for the admin list: stored drafts (any status) + mock programs. */
export function getAdminProgramRows(): AdminProgramRow[] {
  const drafts: AdminProgramRow[] = loadPrograms().map((d) => ({
    id: d.id,
    title: d.title || 'Untitled program',
    image: d.image,
    thumbnailGradient: d.thumbnailGradient,
    courseCount: d.steps.filter((s) => s.type === 'course').length,
    learnerCount: 0,
    status: d.status,
    isDraft: true,
  }))
  const mock: AdminProgramRow[] = workspacePrograms.map((p) => ({
    id: p.id,
    title: p.title,
    image: p.image,
    thumbnailGradient: p.thumbnailGradient,
    courseCount: p.courseCount,
    learnerCount: p.learnerCount,
    status: 'published',
    isDraft: false,
  }))
  return [...drafts, ...mock]
}
