import { TickCircle } from 'iconsax-react'
import SparkleIcon from '@/components/icons/SparkleIcon'
import './AIWorkingCard.css'

interface AIWorkingCardProps {
  /** Ordered step labels; the last one is the terminal state. */
  steps: string[]
  /** Index of the running step. Earlier steps render complete, later ones greyed. */
  activeStep: number
  className?: string
}

/**
 * The "AI is working" card — the steps of the generation, ticked as they finish, with
 * the sparkle twinkling on whichever one is running.
 *
 * No bar and no clock: neither could say how far along the work is, so both were
 * measuring the wait rather than describing it. The named steps do the describing, and
 * the sparkle's motion is what says it is still going.
 *
 * Inline content, not an overlay, so it drops into whatever body is waiting for the
 * result. Render it where the output will land: the card doubles as a placeholder for
 * the thing being generated.
 *
 * Ported from the roles panel's `.roles-ai-working-card`, which still carries its own
 * copy of this markup — the two will drift until RolePanel is moved over.
 */
function AIWorkingCard({ steps, activeStep, className = '' }: AIWorkingCardProps) {
  return (
    <div className={`ai-working-card ${className}`.trim()}>
      {/* Announced as a whole so a screen reader hears the current step, not every tick. */}
      <div className="ai-working-steps" role="status" aria-live="polite">
        {steps.map((label, i) => {
          const isLast = i === steps.length - 1
          /* The terminal step ticks the moment it's reached — there's nothing after it to
             be "in progress" for. */
          const done = i < activeStep || (i === activeStep && isLast)
          const active = i === activeStep && !isLast
          return (
            <div className="ai-working-step" key={label}>
              <span
                className={`ai-working-step__icon${active ? ' ai-working-step__icon--active' : ''}`}
              >
                {done && <TickCircle size={24} color="var(--success-500)" variant="Bold" />}
                {active && <SparkleIcon size={24} gradient />}
              </span>
              <span
                className={`ai-working-step__text${done || active ? '' : ' ai-working-step__text--pending'}`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AIWorkingCard
