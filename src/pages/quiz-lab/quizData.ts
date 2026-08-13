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

export type QuizQuestion = InteractiveQuestion | SelectAllQuestion

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
  'match-pairs': {
    type: 'match-pairs',
    prompt: 'Match each security term to its definition',
    pairs: [
      { left: 'Phishing', right: 'A fraudulent attempt to obtain sensitive information' },
      { left: 'Encryption', right: 'Encoding data so only authorised parties can read it' },
      { left: 'Firewall', right: 'A barrier that filters incoming network traffic' },
      { left: 'Malware', right: 'Software designed to damage or gain unauthorised access' },
    ],
    explanation:
      'Recognising these four terms is the baseline for spotting and reporting security threats at work.',
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
    explanation:
      'Locking your screen and keeping passwords private are two of the simplest ways to prevent unauthorised access.',
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
    explanation:
      'Special-category data (health, biometrics, beliefs) needs extra protection under GDPR than ordinary personal data.',
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
    explanation:
      'Raising the alarm first warns everyone; the roll call at the end confirms that no one is left behind.',
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
  { key: 'match-pairs', label: 'Match the pairs' },
  { key: 'fill-blank', label: 'Fill in the blank' },
  { key: 'categorization', label: 'Categorize' },
  { key: 'sequencing', label: 'Sequence' },
  { key: 'select-all', label: 'Select all that apply' },
]
