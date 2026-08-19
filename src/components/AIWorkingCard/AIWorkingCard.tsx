import { TickCircle } from 'iconsax-react'
import { motion, useReducedMotion } from 'framer-motion'
import SparkleIcon from '@/components/icons/SparkleIcon'
import { ARRIVE, arriveTransition } from './arrive'
import './AIWorkingCard.css'

interface AIWorkingCardProps {
  /** Ordered step labels; the last one is the terminal state. */
  steps: string[]
  /** Index of the running step. Earlier steps render complete, later ones greyed. */
  activeStep: number
  /** What the running step is on right now — the lesson being read, say. Optional: a
   *  step that has nothing specific to report simply doesn't. */
  detail?: string
  className?: string
}

/**
 * The "AI is working" card — the passes that have happened, ticked, and the one running
 * now, with the sparkle pulsing beside it. Nothing about what comes next: the card says
 * where the work has got to, not what it intends.
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
function AIWorkingCard({ steps, activeStep, detail, className = '' }: AIWorkingCardProps) {
  const reduce = useReducedMotion()
  return (
    <div className={`ai-working-card ${className}`.trim()}>
      {/* Announced as a whole so a screen reader hears the current step, not every tick. */}
      <div className="ai-working-steps" role="status" aria-live="polite">
        {/* Only what has happened and what is happening. A list of passes still to come
            is a promise about work not started, and it filled the card with lines the
            admin can do nothing with. */}
        {steps.slice(0, activeStep + 1).map((label, i) => {
          const isLast = i === steps.length - 1
          /* The terminal step ticks the moment it's reached — there's nothing after it to
             be "in progress" for. */
          const done = i < activeStep || (i === activeStep && isLast)
          const active = i === activeStep && !isLast
          return (
            /* Layout is what makes the card grow rather than jump: a new pass pushes the
               rows under it — and everything under the card — instead of teleporting them
               into their new places. Position only: the row gets taller when its detail
               line appears, and animating that size means scaling the row, which stretches
               the words inside it. */
            <motion.div
              className="ai-working-step"
              key={label}
              layout="position"
              {...ARRIVE(reduce)}
              transition={arriveTransition(reduce)}
            >
              <span
                className={`ai-working-step__icon${active ? ' ai-working-step__icon--active' : ''}`}
              >
                {done && (
                  <TickCircle
                    className="ai-working-step__tick"
                    size={20}
                    color="var(--success-500)"
                    variant="Bold"
                  />
                )}
                {active && <SparkleIcon size={32} gradient />}
              </span>
              <span
                className={`ai-working-step__text${active ? ' ai-working-step__text--active' : ''}`}
              >
                {label}
                {active && detail && (
                  /* Keyed on the text so a new one mounts rather than swapping in place:
                     the same node changing its words is the jump cut. */
                  <motion.span
                    className="ai-working-step__detail"
                    key={detail}
                    layout="position"
                    {...ARRIVE(reduce)}
                    transition={arriveTransition(reduce)}
                  >
                    {detail}
                  </motion.span>
                )}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default AIWorkingCard
