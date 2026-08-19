import type { Transition } from 'framer-motion'

/**
 * How anything in the AI wait arrives: a short rise, fading as it goes.
 *
 * The curve is a long tail-off rather than the interface's standard cubic — the wait is
 * the one place where motion is the point rather than a side effect of a control moving,
 * and the standard curve reads as stiff when nothing was clicked to cause it.
 *
 * Framer rather than CSS keyframes so the same transition covers `layout`: when a pass is
 * added the card grows, and everything under it has to travel to its new place instead of
 * cutting there.
 */
export const ARRIVE_EASE = [0.22, 1, 0.36, 1] as const
export const ARRIVE_MS = 420

export const ARRIVE = (reduce: boolean | null) => ({
  initial: reduce ? { opacity: 0 } : { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
})

export const arriveTransition = (reduce: boolean | null): Transition =>
  reduce
    ? { duration: 0 }
    : { duration: ARRIVE_MS / 1000, ease: [...ARRIVE_EASE] }
