import { TickCircle } from 'iconsax-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
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
  /** Whether the terminal step is finished. Default true, for a card whose last line is
   *  a conclusion ("All done — …") and is therefore true the moment it is reached. Pass
   *  false while a card whose last line is the work itself is still doing it: the step
   *  keeps the sparkle until this turns true, then trades it for the tick. */
  lastStepDone?: boolean
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
function AIWorkingCard({
  steps,
  activeStep,
  detail,
  lastStepDone = true,
  className = '',
}: AIWorkingCardProps) {
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
             be "in progress" for — unless the caller says it is still working, in which
             case it runs like any other pass until it reports back. */
          const settled = isLast && lastStepDone
          const done = i < activeStep || (i === activeStep && settled)
          const active = i === activeStep && !settled
          /* Ticked *and* behind the work. The terminal step is `done` too, but it is the
             line the card has arrived at rather than a pass the work has left, so it
             keeps its colour instead of receding with the others. */
          const past = i < activeStep
          const sparkle = active ? (
            <motion.span
              key="sparkle"
              className="ai-working-step__sparkle"
              layoutId="ai-working-sparkle"
              exit={{ opacity: 0 }}
              transition={arriveTransition(reduce)}
            >
              <SparkleIcon size={20} gradient />
            </motion.span>
          ) : null

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
                {/* One sparkle for the whole card, not one per pass: sharing a layoutId
                    means Framer moves it from the pass it was on to the pass it is on
                    now. It used to vanish here and reappear there, which read as two
                    sparkles rather than the same one following the work.

                    Only the last step gets an exit, and only it can afford one: every
                    other sparkle leaves because it is travelling to the next pass, and
                    holding it here to fade would put a second one on the card. The
                    terminal sparkle has nowhere to travel to, so it fades out as the
                    tick fades in over it. */}
                {isLast ? <AnimatePresence>{sparkle}</AnimatePresence> : sparkle}
              </span>
              <span
                className={`ai-working-step__text${active ? ' ai-working-step__text--active' : ''}${past ? ' ai-working-step__text--done' : ''}`}
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
