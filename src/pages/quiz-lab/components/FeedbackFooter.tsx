import { createContext, useContext } from 'react'
import Button from '@/components/Button/Button'

export type FeedbackStatus = 'idle' | 'correct' | 'incorrect'

/**
 * How the footer action sizes itself. The quiz normally runs at phone width, so
 * the default is a full-bleed large button. Hosts that show it wider — the course
 * builder's preview modal — set 'hug', where a button stretched across 720px
 * would read as a banner rather than a control.
 *
 * A context rather than a prop: the four format components between the host and
 * this footer have no stake in the decision and shouldn't have to forward it.
 */
export const QuizFooterLayoutContext = createContext<'fill' | 'hug'>('fill')

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
  const layout = useContext(QuizFooterLayoutContext)
  const footerClass = `ql-footer${layout === 'hug' ? ' ql-footer--hug' : ''}`
  const size = layout === 'hug' ? 'md' : 'lg'

  if (status === 'idle') {
    if (!showCheck) return null
    return (
      <div className={footerClass}>
        <Button semantic="primary" size={size} disabled={checkDisabled} onClick={onCheck}>
          {checkLabel}
        </Button>
      </div>
    )
  }

  const correct = status === 'correct'
  return (
    <div className={footerClass}>
      <Button semantic={correct ? 'success' : 'danger'} size={size} onClick={onContinue}>
        {continueLabel}
      </Button>
    </div>
  )
}

export default FeedbackFooter
