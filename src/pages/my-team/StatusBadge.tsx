import { Flag } from 'iconsax-react'
import { type MemberStatus, STATUS_LABEL, STATUS_HAS_FLAG } from './memberStatus'

/**
 * Shared My Team status pill — used by the Course Tracker table, the reminder
 * drawer, and the courses drawer so the four statuses (colors, labels, and the
 * flag icon on the attention states) stay identical across all three.
 */
function StatusBadge({ status }: { status: MemberStatus }) {
  return (
    <span className={`mt-cp__status-badge mt-cp__status-badge--${status}`}>
      {STATUS_HAS_FLAG[status] && <Flag size={16} color="currentColor" variant="Bold" />}
      {STATUS_LABEL[status]}
    </span>
  )
}

export default StatusBadge
