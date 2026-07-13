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
