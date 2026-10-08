import { useState } from 'react'
import Button from '@/components/Button/Button'
import Checkbox from '@/components/Checkbox/Checkbox'
import InfoIcon from '@/components/icons/InfoIcon'
import AffectedPeopleDrawer from './AffectedPeopleDrawer'
import type { ExistingChoice, ReviewCounts } from './ReviewStep'
import { plural } from './schedule'

/* One callout for everyone who already has the course(s), shared by the Assign courses
   and Enrol people Review steps. Built from Alert's own classes (alerts-toast.md)
   because it holds checkboxes, which the Alert component has no slot for. Nothing here
   blocks launch. Renders nothing when nobody already has a course. */

interface Props {
  counts: Pick<ReviewCounts, 'current' | 'overdue' | 'completed' | 'affected'>
  choice: ExistingChoice
  onChoiceChange: (choice: ExistingChoice) => void
  /** Defaults to the plural "these courses" wording. */
  title?: string
}

function ExistingEnrolmentsCallout({
  counts,
  choice,
  onChoiceChange,
  title = 'Some people already have these courses and will be skipped',
}: Props) {
  const [viewing, setViewing] = useState(false)
  if (counts.current === 0 && counts.completed === 0) return null

  return (
    <>
      <div className="alert alert--callout alert--with-body acw-existing">
        <InfoIcon size={20} color="currentColor" className="alert__icon" />
        <div className="alert__body">
          <p className="alert__title">{title}</p>
          <div className="acw-existing__options">
            {counts.current > 0 && (
              <label className="acw-existing__option">
                <Checkbox checked={choice.restart} onChange={() => onChoiceChange({ ...choice, restart: !choice.restart })} />
                <span className="acw-existing__text">
                  <span>
                    Restart for {plural(counts.current, 'person', 'people')} currently enrolled
                    {counts.overdue > 0 && <span className="acw-existing__helper"> · {counts.overdue} overdue</span>}
                  </span>
                </span>
              </label>
            )}
            {counts.completed > 0 && (
              <label className="acw-existing__option">
                <Checkbox checked={choice.again} onChange={() => onChoiceChange({ ...choice, again: !choice.again })} />
                <span className="acw-existing__text">
                  <span>Re-enrol {plural(counts.completed, 'person', 'people')} who’ve completed</span>
                </span>
              </label>
            )}
          </div>
          <Button variant="text" size="md" className="acw-existing__view" onClick={() => setViewing(true)}>
            View People
          </Button>
        </div>
      </div>
      <AffectedPeopleDrawer open={viewing} rows={counts.affected} onClose={() => setViewing(false)} />
    </>
  )
}

export default ExistingEnrolmentsCallout
