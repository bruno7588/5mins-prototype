import { TickCircle } from 'iconsax-react'
import SparkleIcon from '@/components/icons/SparkleIcon'
import './AIWorkingCard.css'

interface AIWorkingCardProps {
  /** Ordered step labels; the last one is the terminal state. */
  steps: string[]
  /** Index of the running step. Earlier steps render complete, later ones greyed. */
  activeStep: number
  /** 0–100. Omit when the duration isn't knowable — pass `elapsedSeconds` instead. */
  progress?: number
  /**
   * Seconds since the work started, counting up. Use this instead of `progress`
   * whenever the wait's length can't be known in advance: a percentage would have
   * to be invented, and an invented one stalls at 90% and reads as stuck. Counting
   * up says the same thing honestly — it's still moving.
   */
  elapsedSeconds?: number
  className?: string
}

const mmss = (total: number) =>
  `${Math.floor(total / 60)}:${String(Math.floor(total % 60)).padStart(2, '0')}`

/**
 * The "AI is working" card — a checklist of generation steps over a gradient
 * progress bar, inside a gradient hairline border.
 *
 * Inline content, not an overlay, so it drops into whatever body is waiting for
 * the result. Render it where the output will land: the card doubles as a
 * placeholder for the thing being generated.
 *
 * Ported from the roles panel's `.roles-ai-working-card`, which still carries its
 * own copy of this markup — the two will drift until RolePanel is moved over.
 */
function AIWorkingCard({ steps, activeStep, progress, elapsedSeconds, className = '' }: AIWorkingCardProps) {
  const indeterminate = progress === undefined
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
              <span className="ai-working-step__icon">
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

      <div className="ai-working-progress">
        <div className="ai-working-progress__bar">
          {indeterminate ? (
            <div className="ai-working-progress__fill ai-working-progress__fill--indeterminate" />
          ) : (
            <div className="ai-working-progress__fill" style={{ width: `${progress}%` }} />
          )}
        </div>
        {indeterminate ? (
          elapsedSeconds !== undefined && (
            <span className="ai-working-progress__text ai-working-progress__text--elapsed">
              {mmss(elapsedSeconds)}
            </span>
          )
        ) : (
          <span className="ai-working-progress__text">{progress}%</span>
        )}
      </div>
    </div>
  )
}

export default AIWorkingCard
