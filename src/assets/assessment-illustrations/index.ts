// 5Mins assessment-type illustrations — Figma "Illustrations/ Assessments" (frame 9120:8850;
// the six classic types downloaded 2026-07-13, the four interactive ones 2026-08-17). Ten
// assessment types, each as distinct Mobile (56px) and Desktop (80px) artwork. Used in
// Assessment cards (56px mobile list card, 80px web app row; scale the desktop one down for
// the 48px admin row).

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
import fillBlankMobile from './fill-blank-mobile.svg'
import fillBlankDesktop from './fill-blank-desktop.svg'
import sequenceMobile from './sequence-mobile.svg'
import sequenceDesktop from './sequence-desktop.svg'
import categorizeMobile from './categorize-mobile.svg'
import categorizeDesktop from './categorize-desktop.svg'
import matchPairsMobile from './match-pairs-mobile.svg'
import matchPairsDesktop from './match-pairs-desktop.svg'

export type AssessmentType =
  | 'multiple-choice'
  | 'short-text'
  | 'exercise'
  | 'situational-test'
  | 'fast-track'
  | 'poll'
  | 'fill-blank'
  | 'sequence'
  | 'categorize'
  | 'match-pairs'

export type AssessmentIllustrationDevice = 'mobile' | 'desktop'

const illustrations: Record<AssessmentType, Record<AssessmentIllustrationDevice, string>> = {
  'multiple-choice': { mobile: multipleChoiceMobile, desktop: multipleChoiceDesktop },
  'short-text': { mobile: shortTextMobile, desktop: shortTextDesktop },
  exercise: { mobile: exerciseMobile, desktop: exerciseDesktop },
  'situational-test': { mobile: situationalTestMobile, desktop: situationalTestDesktop },
  'fast-track': { mobile: fastTrackMobile, desktop: fastTrackDesktop },
  poll: { mobile: pollMobile, desktop: pollDesktop },
  'fill-blank': { mobile: fillBlankMobile, desktop: fillBlankDesktop },
  sequence: { mobile: sequenceMobile, desktop: sequenceDesktop },
  categorize: { mobile: categorizeMobile, desktop: categorizeDesktop },
  'match-pairs': { mobile: matchPairsMobile, desktop: matchPairsDesktop },
}

export function getAssessmentIllustration(
  type: AssessmentType,
  device: AssessmentIllustrationDevice = 'mobile',
): string {
  return illustrations[type][device]
}

/* Outline cards carry the format as a display label rather than a key, so this
   is the bridge. Label and artwork filename agree again since the type went back
   to Multiple Choice. */
const byLabel: Record<string, AssessmentType> = {
  'Multiple Choice': 'multiple-choice',
  'Short Text': 'short-text',
  Exercise: 'exercise',
  Poll: 'poll',
  'Fill in the Blanks': 'fill-blank',
  'Match the Pairs': 'match-pairs',
  Categorise: 'categorize',
  Sequence: 'sequence',
}

/**
 * The illustration behind an outline card's format label, or null when the
 * label names no format we have artwork for.
 *
 * Labels can carry a summary after a middot ("Fill in the Blanks · 2 blanks"),
 * so only the part before it names the format.
 */
export function assessmentTypeFromLabel(label: string): AssessmentType | null {
  return byLabel[label.split(' · ')[0]] ?? null
}
