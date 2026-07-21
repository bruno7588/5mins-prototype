import type { ReactNode } from 'react'
import { TickCircle, CloseCircle } from 'iconsax-react'
import Button from '@/components/Button/Button'

export type FeedbackStatus = 'idle' | 'correct' | 'incorrect'

interface FeedbackFooterProps {
  status: FeedbackStatus
  /** Show the Check button in the idle state (false for instant formats). */
  showCheck?: boolean
  checkLabel?: string
  checkDisabled?: boolean
  onCheck?: () => void
  onContinue: () => void
  continueLabel?: string
  /** Heading shown in the correct/incorrect panel. */
  title?: string
  /** Correct answer + one-line "why" (PRD FR5.2). */
  detail?: ReactNode
}

/**
 * Shared quiz footer (PRD FR5): a Check button while answering, swapped for a
 * colour-coded feedback panel that reveals the correct answer + explanation and
 * a Continue action. Kept format-agnostic so every renderer feels consistent.
 */
function FeedbackFooter({
  status,
  showCheck = true,
  checkLabel = 'Check',
  checkDisabled = false,
  onCheck,
  onContinue,
  continueLabel = 'Continue',
  title,
  detail,
}: FeedbackFooterProps) {
  if (status === 'idle') {
    if (!showCheck) return null
    return (
      <div className="ql-footer">
        <Button semantic="primary" size="lg" disabled={checkDisabled} onClick={onCheck}>
          {checkLabel}
        </Button>
      </div>
    )
  }

  const correct = status === 'correct'
  return (
    <div className={`ql-feedback ql-feedback--${status}`} role="status">
      <div className="ql-feedback__head">
        <span className="ql-feedback__icon" aria-hidden="true">
          {correct ? (
            <TickCircle size={24} color="var(--success-500)" variant="Bold" />
          ) : (
            <CloseCircle size={24} color="var(--danger-500)" variant="Bold" />
          )}
        </span>
        <span className="ql-feedback__title">{title ?? (correct ? 'Correct!' : 'Not quite')}</span>
      </div>
      {detail && <div className="ql-feedback__detail">{detail}</div>}
      <Button semantic={correct ? 'success' : 'danger'} size="lg" onClick={onContinue}>
        {continueLabel}
      </Button>
    </div>
  )
}

export default FeedbackFooter
