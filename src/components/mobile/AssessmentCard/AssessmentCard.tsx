import type { KeyboardEvent, ReactNode } from 'react'
import { Lock, TickCircle } from 'iconsax-react'
import { getAssessmentIllustration, type AssessmentType } from '@/assets/assessment-illustrations'
import './AssessmentCard.css'

export interface MobileAssessmentCardProps {
  title: string
  /** Metadata after the type label, e.g. "Type of assessment" */
  assessmentType: string
  typeLabel?: string
  completed?: boolean
  disabled?: boolean
  /** Picks the official 56px illustration; defaults to multiple choice */
  illustrationType?: AssessmentType
  /** Full override of the illustration slot */
  illustration?: ReactNode
  onClick?: () => void
  onReviewClick?: () => void
}

function MobileAssessmentCard({
  title,
  assessmentType,
  typeLabel = 'Assessment',
  completed = false,
  disabled = false,
  illustrationType = 'multiple-choice',
  illustration,
  onClick,
  onReviewClick,
}: MobileAssessmentCardProps) {
  const interactive = Boolean(onClick) && !disabled

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
    }
  }

  const meta = `${typeLabel} · ${assessmentType}`

  return (
    <article
      className={`m-assessment-card${disabled ? ' m-assessment-card--disabled' : ''}${completed ? ' m-assessment-card--completed' : ''}`}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
    >
      <div className="m-assessment-card__illustration">
        {illustration ?? (
          <img src={getAssessmentIllustration(illustrationType, 'mobile')} alt="" width={56} height={56} />
        )}
      </div>
      <div className="m-assessment-card__info">
        <div className="m-assessment-card__header">
          <h3 className="m-assessment-card__title">{title}</h3>
          <p className="m-assessment-card__meta">
            {meta}
            {completed ? <TickCircle size={16} color="var(--success-500)" variant="Bold" /> : null}
          </p>
        </div>
        {completed && !disabled ? (
          <button type="button" className="m-assessment-card__review" onClick={onReviewClick}>
            Review
          </button>
        ) : null}
      </div>
      {disabled ? <Lock size={20} color="var(--text-disabled)" variant="Bold" /> : null}
    </article>
  )
}

export default MobileAssessmentCard
