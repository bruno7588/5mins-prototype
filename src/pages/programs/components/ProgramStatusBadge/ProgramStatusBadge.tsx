import { TickCircle, Calendar } from 'iconsax-react'
import type { ProgramLifecycle } from '../../programStore'
import './ProgramStatusBadge.css'

const LABELS: Record<ProgramLifecycle, string> = {
  ready: 'Ready to Launch',
  scheduled: 'Scheduled',
  live: 'Live',
}

/** Leading marker per state: tick for Ready to Launch, calendar for Scheduled,
 *  a status dot for Live. */
function StatusMarker({ status }: { status: ProgramLifecycle }) {
  if (status === 'ready') return <TickCircle size={16} color="currentColor" variant="Linear" />
  if (status === 'scheduled') return <Calendar size={16} color="currentColor" variant="Linear" />
  return <span className="psb__dot" aria-hidden="true" />
}

/** Pill showing a program's lifecycle (Ready to Launch / Scheduled / Live). Shared
 *  by the admin Programs list and the program detail header so they stay in sync. */
export default function ProgramStatusBadge({ status }: { status: ProgramLifecycle }) {
  return (
    <span className={`psb psb--${status}`}>
      <StatusMarker status={status} />
      {LABELS[status]}
    </span>
  )
}
