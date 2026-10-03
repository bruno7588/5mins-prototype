import { useState } from 'react'
import { Calendar, User, UserAdd } from 'iconsax-react'
import Button from '@/components/Button/Button'
import { COURSE_DETAILS_ID } from '@/data/enrolments'
import WizardShell from '../WizardShell/WizardShell'
import PeoplePicker from '../PeoplePicker/PeoplePicker'

/* Enrol people to a course: full-screen, step rail on the left. Only the
   "Enrol people" step is built; "Set a date" and "Name a sponsor" are shown
   for context but inert (out of scope). */

/** "Oct 2 to Oct 16, 2026": the default window shown on the (unbuilt) date step. */
function defaultDateRange() {
  const start = new Date()
  const end = new Date(start)
  end.setDate(end.getDate() + 14)
  const md = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${md(start)} to ${md(end)}, ${end.getFullYear()}`
}

interface Props {
  open: boolean
  onClose: () => void
  /** Called on Review & Launch with the number of people enrolled. */
  onEnrol: (count: number) => void
  courseTitle?: string
}

function EnrolCourseModal({ open, onClose, onEnrol, courseTitle = 'This course' }: Props) {
  // Table picks are a draft; only Select People commits them to the enrolment.
  const [committed, setCommitted] = useState<string[]>([])

  return (
    <WizardShell
      open={open}
      title="Enrol people to your course"
      closeLabel="Close enrolment"
      onClose={onClose}
      action={
        <Button size="lg" disabled={committed.length === 0} onClick={() => onEnrol(committed.length)}>
          Review &amp; Launch
        </Button>
      }
      steps={[
        { id: 'people', title: 'Enrol people', sub: `${committed.length} selected`, Icon: UserAdd, state: 'current' },
        { id: 'date', title: 'Set a date', sub: defaultDateRange(), Icon: Calendar, state: 'inert' },
        { id: 'sponsor', title: 'Name a sponsor', sub: 'Name a sponsor', Icon: User, state: 'inert' },
      ]}
    >
      <h3 className="wzs-section-title">Select people to enrol</h3>
      <PeoplePicker
        courseIds={[COURSE_DETAILS_ID]}
        courseNames={{ [COURSE_DETAILS_ID]: courseTitle }}
        modes={['all', 'people', 'cohorts']}
        // Production opens with "Enrolment is Not enrolled" already applied.
        initialFilters={{ enrolment: 'not-enrolled' }}
        committedIds={committed}
        onCommit={(ids) => setCommitted(ids)}
      />
    </WizardShell>
  )
}

export default EnrolCourseModal
