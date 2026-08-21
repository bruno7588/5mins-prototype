/**
 * Quiz Lab — question samples and the lab's own format list (DES-321).
 *
 * The four authorable formats now live in `@/data/interactiveQuestions`, shared
 * with the course builder's authoring drawer so a question the admin writes is
 * literally the object these renderers eat. They are re-exported here so the
 * format components keep importing from one place.
 */

export type {
  MatchPair,
  MatchPairsQuestion,
  FillBlankSegment,
  FillBlankQuestion,
  Category,
  CategorizationItem,
  CategorizationQuestion,
  SequencingQuestion,
} from '@/data/interactiveQuestions'

import type { InteractiveQuestion } from '@/data/interactiveQuestions'

/** The lab's tabs. Select-all is learner-only — it has no authoring UI yet. */
export type FormatKey =
  | 'match-pairs'
  | 'fill-blank'
  | 'categorization'
  | 'sequencing'
  | 'select-all'
  | 'single-choice'
  | 'free-text'

export interface SelectAllQuestion {
  type: 'select-all'
  /** Names the criterion and the count — the stem does all the instructing. */
  prompt: string
  /** The words that meet the criterion. */
  answers: string[]
  /** Words that do not — shuffled into the same pool. */
  distractors: string[]
  explanation: string
}

/** One answer of several. A poll is the same screen with `correctIndex: -1` — it asks
 *  rather than marks, so there is nothing to check and nothing to reveal. */
export interface SingleChoiceQuestion {
  type: 'single-choice'
  prompt: string
  options: string[]
  correctIndex: number
  /** Why the marked option is right, shown under the result once graded. Optional:
   *  a question without one grades the same, it just says less afterwards. */
  explanation?: string
}

/** Short text and exercise: answered in the learner's own words, marked by a human. */
export interface FreeTextQuestion {
  type: 'free-text'
  prompt: string
  placeholder?: string
}

export type QuizQuestion =
  | InteractiveQuestion
  | SelectAllQuestion
  | SingleChoiceQuestion
  | FreeTextQuestion

/** Fisher–Yates shuffle returning a new array (used for banks / column order). */
export function shuffle<T>(input: readonly T[]): T[] {
  const out = input.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export const QUIZ_SAMPLES: Record<FormatKey, QuizQuestion> = {
  'single-choice': {
    type: 'single-choice',
    prompt: 'An email asks you to confirm your password on a link. What do you do first?',
    options: [
      'Follow the link and check the address bar',
      'Report it and delete the email',
      'Reply asking who sent it',
      'Forward it to your team to warn them',
    ],
    correctIndex: 1,
  },
  'free-text': {
    type: 'free-text',
    prompt: 'In a sentence, how would you explain the risk to a colleague?',
  },
  'match-pairs': {
    type: 'match-pairs',
    prompt: 'Match each security term to its definition',
    pairs: [
      { left: 'Phishing', right: 'A fraudulent attempt to obtain sensitive information' },
      { left: 'Encryption', right: 'Encoding data so only authorised parties can read it' },
      { left: 'Firewall', right: 'A barrier that filters incoming network traffic' },
      { left: 'Malware', right: 'Software designed to damage or gain unauthorised access' },
    ],
  },
  'fill-blank': {
    type: 'fill-blank',
    prompt: 'Complete the clean-desk policy',
    segments: [
      'Always ',
      { blank: 'lock' },
      ' your screen when you leave your desk, and never ',
      { blank: 'share' },
      ' your password with a colleague.',
    ],
    bank: ['lock', 'share', 'ignore', 'email'],
  },
  categorization: {
    type: 'categorization',
    prompt: 'Sort each item under the correct data category',
    categories: [
      { id: 'personal', label: 'Personal data' },
      { id: 'special', label: 'Special-category data' },
    ],
    items: [
      { label: 'Email address', categoryId: 'personal' },
      { label: 'Health records', categoryId: 'special' },
      { label: 'Home address', categoryId: 'personal' },
      { label: 'Biometric data', categoryId: 'special' },
      { label: 'Religious beliefs', categoryId: 'special' },
      { label: 'Phone number', categoryId: 'personal' },
    ],
  },
  sequencing: {
    type: 'sequencing',
    prompt: 'Put the fire-evacuation steps in the right order',
    steps: [
      'Raise the alarm',
      'Stop what you are doing',
      'Leave by the nearest safe exit',
      'Go to the assembly point',
      'Wait for the roll call',
    ],
  },
  'select-all': {
    type: 'select-all',
    prompt: 'Which four of these need extra protection under GDPR?',
    answers: ['Health records', 'Biometric data', 'Religious beliefs', 'Trade union membership'],
    distractors: ['Email address', 'Home address', 'Phone number', 'Job title'],
    explanation:
      'Health, biometrics, beliefs and union membership are special-category data — GDPR needs an extra lawful basis before you process them.',
  },
}

export const FORMAT_ORDER: { key: FormatKey; label: string }[] = [
  { key: 'single-choice', label: 'Multiple choice' },
  { key: 'match-pairs', label: 'Match the pairs' },
  { key: 'fill-blank', label: 'Fill in the blank' },
  { key: 'categorization', label: 'Categorize' },
  { key: 'sequencing', label: 'Sequence' },
  { key: 'select-all', label: 'Select all that apply' },
  { key: 'free-text', label: 'Short text' },
]
