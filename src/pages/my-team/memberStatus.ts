/* ── Manager-friendly rollup status ──
   Shared by the Course Tracker table and the Send Reminder drawer.
   Completed: nothing outstanding · Not started: 0% overall ·
   Low progress: under 40% overall · On track: the rest. */

export type MemberStatus = 'not-started' | 'low-progress' | 'on-track' | 'completed'

export interface MemberProgress {
  overdue: number
  atRisk: number
  inProgress: number
  completed: number
  overallProgress: number
}

export function statusFor(m: MemberProgress): MemberStatus {
  if (m.overdue + m.atRisk + m.inProgress === 0 && m.completed > 0) return 'completed'
  if (m.overallProgress === 0) return 'not-started'
  if (m.overallProgress < 40) return 'low-progress'
  return 'on-track'
}

export const STATUS_LABEL: Record<MemberStatus, string> = {
  'not-started': 'Not started',
  'low-progress': 'Low progress',
  'on-track': 'On track',
  completed: 'Completed',
}

/* ── Per-course status (Courses drawer only) ──
   A single course carries two states the member rollup can't: past its due
   date, and assessment failed. Both are date/outcome facts rather than the
   progress thresholds the four rollup states are derived from. */
export type CourseStatus = MemberStatus | 'overdue' | 'failed'

export const COURSE_STATUS_LABEL: Record<CourseStatus, string> = {
  overdue: 'Overdue',
  failed: 'Failed',
  ...STATUS_LABEL,
}

// Worst first — the order the drawer lists courses in
export const COURSE_STATUS_ORDER: CourseStatus[] = [
  'overdue',
  'failed',
  'not-started',
  'low-progress',
  'on-track',
  'completed',
]

// Sort rank — worst first when ascending
export const STATUS_RANK: Record<MemberStatus, number> = {
  'not-started': 0,
  'low-progress': 1,
  'on-track': 2,
  completed: 3,
}

export const coursesTotal = (m: Omit<MemberProgress, 'overallProgress'>) =>
  m.overdue + m.atRisk + m.inProgress + m.completed
