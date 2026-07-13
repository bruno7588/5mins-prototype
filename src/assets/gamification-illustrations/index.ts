// 5Mins gamification hero illustrations — Figma "Illustrations/Gamification"
// (frame 11196:7607, downloaded 2026-07-13). Four 96×96 feature illustrations.

import progress from './progress.svg'
import certificate from './certificate.svg'
import quiz from './quiz.svg'
import learningPath from './learning-path.svg'

export type GamificationIllustrationType = 'progress' | 'certificate' | 'quiz' | 'learning-path'

export const gamificationIllustrations: Record<GamificationIllustrationType, string> = {
  progress,
  certificate,
  quiz,
  'learning-path': learningPath,
}

/** All artwork is 96×96 — render at native size. */
export function getGamificationIllustration(type: GamificationIllustrationType): string {
  return gamificationIllustrations[type]
}
