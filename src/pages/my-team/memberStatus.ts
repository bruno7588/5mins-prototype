/* ── Course status ──
   Per-course, used by the Courses drawer. Four states come from progress alone;
   Overdue and Failed come from the due date and the assessment outcome, which
   no progress threshold can see.

   There is no member-level equivalent: the Course Tracker filters people by
   what they have outstanding (see TeamStatusFilter in MyTeam.tsx), not by a
   rollup of these. */

export type CourseStatus =
  | 'overdue'
  | 'failed'
  | 'not-started'
  | 'low-progress'
  | 'on-track'
  | 'completed'

export const COURSE_STATUS_LABEL: Record<CourseStatus, string> = {
  overdue: 'Overdue',
  failed: 'Failed',
  'not-started': 'Not started',
  'low-progress': 'Low progress',
  'on-track': 'On track',
  completed: 'Completed',
}

// Worst first — the drawer's default sort order
export const COURSE_STATUS_ORDER: CourseStatus[] = [
  'overdue',
  'failed',
  'not-started',
  'low-progress',
  'on-track',
  'completed',
]

export interface MemberProgress {
  overdue: number
  atRisk: number
  inProgress: number
  completed: number
  overallProgress: number
}

export const coursesTotal = (m: Omit<MemberProgress, 'overallProgress'>) =>
  m.overdue + m.atRisk + m.inProgress + m.completed
