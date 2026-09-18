// Learnings panel subhead illustrations — Figma Your Content `6574:54636`
// (Learning goals) and `6574:54649` (Key concepts), downloaded 2026-09-18.
// Full-colour artwork, so render as <img> at 20×20 rather than tinting.

import learningGoals from './learning-goals.svg'
import keyConcepts from './key-concepts.svg'

export type LearningsIllustration = 'learning-goals' | 'key-concepts'

export const learningsIllustrations: Record<LearningsIllustration, string> = {
  'learning-goals': learningGoals,
  'key-concepts': keyConcepts,
}

export function getLearningsIllustration(type: LearningsIllustration): string {
  return learningsIllustrations[type]
}
