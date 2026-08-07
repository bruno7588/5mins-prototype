import { type CourseStatus, COURSE_STATUS_LABEL } from './memberStatus'

/**
 * Course status pill — used by the Courses drawer so the six course states
 * (colors and labels) stay in one place. No icon: the label carries the state,
 * and Overdue vs Failed share the Error red but never share a word.
 */
function StatusBadge({ status }: { status: CourseStatus }) {
  return (
    <span className={`mt-cp__status-badge mt-cp__status-badge--${status}`}>
      {COURSE_STATUS_LABEL[status]}
    </span>
  )
}

export default StatusBadge
