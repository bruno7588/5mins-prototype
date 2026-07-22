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
}

/**
 * Pinned bottom action for the quiz (DS-aligned). Idle → Check; once graded →
 * Continue (success/danger). The result message itself lives below the options
 * (see ResultBanner) rather than in a coloured panel.
 */
function FeedbackFooter({
  status,
  showCheck = true,
  checkLabel = 'Check',
  checkDisabled = false,
  onCheck,
  onContinue,
  continueLabel = 'Continue',
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
    <div className="ql-footer">
      <Button semantic={correct ? 'success' : 'danger'} size="lg" onClick={onContinue}>
        {continueLabel}
      </Button>
    </div>
  )
}

export default FeedbackFooter
