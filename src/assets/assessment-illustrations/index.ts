// 5Mins assessment-type illustrations — Figma "Illustrations/ Assessments" (frame 9120:8850,
// downloaded 2026-07-13). Six assessment types, each as distinct Mobile (56px) and
// Desktop (80px) artwork. Used in Assessment cards (56px mobile list card, 80px web app
// row; scale the desktop one down for the 48px admin row).

import multipleChoiceMobile from './multiple-choice-mobile.svg'
import multipleChoiceDesktop from './multiple-choice-desktop.svg'
import shortTextMobile from './short-text-mobile.svg'
import shortTextDesktop from './short-text-desktop.svg'
import exerciseMobile from './exercise-mobile.svg'
import exerciseDesktop from './exercise-desktop.svg'
import situationalTestMobile from './situational-test-mobile.svg'
import situationalTestDesktop from './situational-test-desktop.svg'
import fastTrackMobile from './fast-track-mobile.svg'
import fastTrackDesktop from './fast-track-desktop.svg'
import pollMobile from './poll-mobile.svg'
import pollDesktop from './poll-desktop.svg'

export type AssessmentType =
  | 'multiple-choice'
  | 'short-text'
  | 'exercise'
  | 'situational-test'
  | 'fast-track'
  | 'poll'

export type AssessmentIllustrationDevice = 'mobile' | 'desktop'

const illustrations: Record<AssessmentType, Record<AssessmentIllustrationDevice, string>> = {
  'multiple-choice': { mobile: multipleChoiceMobile, desktop: multipleChoiceDesktop },
  'short-text': { mobile: shortTextMobile, desktop: shortTextDesktop },
  exercise: { mobile: exerciseMobile, desktop: exerciseDesktop },
  'situational-test': { mobile: situationalTestMobile, desktop: situationalTestDesktop },
  'fast-track': { mobile: fastTrackMobile, desktop: fastTrackDesktop },
  poll: { mobile: pollMobile, desktop: pollDesktop },
}

export function getAssessmentIllustration(
  type: AssessmentType,
  device: AssessmentIllustrationDevice = 'mobile',
): string {
  return illustrations[type][device]
}

/* Outline cards carry the format as a display label rather than a key, so this
   is the bridge. The artwork predates the Multiple Choice → Single Choice
   rename and still files that type under the old name. */
const byLabel: Record<string, AssessmentType> = {
  'Single Choice': 'multiple-choice',
  'Short Text': 'short-text',
  Exercise: 'exercise',
  Poll: 'poll',
}

/**
 * The illustration behind an outline card's format label, or null for the
 * interactive formats, which have no artwork of their own.
 *
 * Labels can carry a summary after a middot ("Fill in the Blanks · 2 blanks"),
 * so only the part before it names the format.
 */
export function assessmentTypeFromLabel(label: string): AssessmentType | null {
  return byLabel[label.split(' · ')[0]] ?? null
}
