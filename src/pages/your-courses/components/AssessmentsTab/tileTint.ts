import { typeLabel } from '@/data/aiAssessmentGeneration'
import { assessmentTypeFromLabel } from '@/assets/assessment-illustrations'
import { PASS_SCORE, correctPct, type AssessmentResult } from './assessmentResults'

/** How many of the lowest scores carry the red glow. */
const LOW_COUNT = 3

/** The format's illustration, which also gives a graded tile its tint colours. */
export const artOf = (a: AssessmentResult) =>
  a.lesson ? 'lesson-quiz' : assessmentTypeFromLabel(typeLabel(a.type))

/** The three weakest scores below the pass mark, so the eye lands on them first. */
export function weakestIds(rows: AssessmentResult[]): Set<string> {
  const ranked = rows
    .map((a) => ({ id: a.id, pct: correctPct(a) }))
    .filter((x): x is { id: string; pct: number } => x.pct !== null && x.pct < PASS_SCORE)
    .sort((x, y) => x.pct - y.pct)
  return new Set(ranked.slice(0, LOW_COUNT).map((x) => x.id))
}

/* One tint per assessment: the lowest scores first, then lesson quizzes, then every other
   format (open ones included) in its own illustration's colours; an open format with no
   illustration falls back to the shared open tint. Shared by the Answers grid tiles and the
   answers page card, so both glow alike. */
export function tintClass(a: AssessmentResult, weakest: Set<string>): string {
  if (weakest.has(a.id)) return ' asg-tile--low'
  if (a.lesson) return ' asg-tile--quiz'
  const art = artOf(a)
  if (art) return ` asg-tile--art asg-tile--${art}`
  return correctPct(a) === null ? ' asg-tile--open' : ''
}
