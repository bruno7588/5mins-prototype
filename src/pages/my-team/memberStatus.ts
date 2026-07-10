/* ── Manager-friendly rollup status ──
   Shared by the Course Tracker table and the Send Reminder drawer.
   Completed: nothing outstanding · Not Started: 0% overall ·
   Low Progress: under 40% overall · On Track: the rest. */

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
  'not-started': 'Not Started',
  'low-progress': 'Low Progress',
  'on-track': 'On track',
  completed: 'Completed',
}

// Only the attention states carry a flag icon (per Figma My Team badges)
export const STATUS_HAS_FLAG: Record<MemberStatus, boolean> = {
  'not-started': true,
  'low-progress': true,
  'on-track': false,
  completed: false,
}

// Sort rank — worst first when ascending
export const STATUS_RANK: Record<MemberStatus, number> = {
  'not-started': 0,
  'low-progress': 1,
  'on-track': 2,
  completed: 3,
}

export const coursesTotal = (m: Omit<MemberProgress, 'overallProgress'>) =>
  m.overdue + m.atRisk + m.inProgress + m.completed
