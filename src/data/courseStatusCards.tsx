import type { ReactNode } from 'react'
import { Clock, Danger, StatusUp, TickCircle } from 'iconsax-react'

/* The four course-standing cards, shared by My Team's Course Tracker and the
   user profile so the two screens can't drift on what a bucket means.
   Definitions only — each page keeps its own card markup and CSS, since one
   shows a value string and the other a computed share.

   "At risk" is Not Started plus Failed, per the Figma. It is not a deadline
   signal; Overdue is the one that reads the due date. In progress carries no
   tooltip — the label says all there is to say. */

export interface CourseStatusCard {
  key: 'completed' | 'in-progress' | 'at-risk' | 'overdue'
  label: string
  icon: ReactNode
  tooltip?: string
}

export const COURSE_STATUS_CARDS: CourseStatusCard[] = [
  {
    key: 'completed',
    label: 'Completed',
    icon: <TickCircle size={24} color="var(--success-500)" variant="Linear" />,
    tooltip: 'Finished 100% of the course and met the pass score, where one is required.',
  },
  {
    key: 'in-progress',
    label: 'In progress',
    icon: <StatusUp size={24} color="var(--primary-600)" variant="Linear" />,
  },
  {
    key: 'at-risk',
    label: 'At risk!',
    icon: <Danger size={24} color="var(--warning-600)" variant="Linear" />,
    tooltip: 'Not started yet, or failed and needing another attempt.',
  },
  {
    key: 'overdue',
    label: 'Overdue',
    icon: <Clock size={24} color="var(--danger-400)" variant="Linear" />,
    tooltip: 'Not yet finished and past the due date.',
  },
]
