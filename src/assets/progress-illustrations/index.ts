// 5Mins "My progress" illustrations — Figma "Illustrations/ Progress" (frame 10157:9081,
// downloaded 2026-07-13). Seven 40×40 stat icons for the learner progress surfaces:
// streak, points, jewels, certificates, plus the quiz-outcome trio.

import streak from './streak.svg'
import points from './points.svg'
import jewels from './jewels.svg'
import certificates from './certificates.svg'
import passed from './passed.svg'
import nearlyThere from './nearly-there.svg'
import notPassed from './not-passed.svg'

export type ProgressIllustrationType =
  | 'streak'
  | 'points'
  | 'jewels'
  | 'certificates'
  | 'passed'
  | 'nearly-there'
  | 'not-passed'

export const progressIllustrations: Record<ProgressIllustrationType, string> = {
  streak,
  points,
  jewels,
  certificates,
  passed,
  'nearly-there': nearlyThere,
  'not-passed': notPassed,
}

/** All artwork is 40×40 — render at native size. */
export function getProgressIllustration(type: ProgressIllustrationType): string {
  return progressIllustrations[type]
}
