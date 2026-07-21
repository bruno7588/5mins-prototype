/**
 * Quiz Lab — shared question data model (DES-321).
 *
 * One discriminated union covers every format, prototyping the reusable
 * question-renderer contract (PRD FR7): each format component takes its own
 * question variant, renders the interaction, grades locally, and reports a
 * result. Content is compliance-flavoured to match the 5Mins personas
 * (hospitality / finance / healthcare frontline).
 */

export type FormatKey =
  | 'match-pairs'
  | 'fill-blank'
  | 'categorization'
  | 'sequencing'

export interface MatchPair {
  left: string
  right: string
}

export interface MatchPairsQuestion {
  type: 'match-pairs'
  /** Short instruction shown above the interaction. */
  prompt: string
  pairs: MatchPair[]
  explanation: string
}

/** A sentence segment: a literal string, or a gap carrying its correct answer. */
export type FillBlankSegment = string | { blank: string }

export interface FillBlankQuestion {
  type: 'fill-blank'
  prompt: string
  segments: FillBlankSegment[]
  /** Word-bank chips — correct answers plus distractors, order-independent. */
  bank: string[]
  explanation: string
}

export interface Category {
  id: string
  label: string
}

export interface CategorizationItem {
  label: string
  categoryId: string
}

export interface CategorizationQuestion {
  type: 'categorization'
  prompt: string
  categories: Category[]
  items: CategorizationItem[]
  explanation: string
}

export interface SequencingQuestion {
  type: 'sequencing'
  prompt: string
  /** Steps in their correct order — the renderer shuffles a copy for the bank. */
  steps: string[]
  explanation: string
}

export type QuizQuestion =
  | MatchPairsQuestion
  | FillBlankQuestion
  | CategorizationQuestion
  | SequencingQuestion

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
}

export const FORMAT_ORDER: { key: FormatKey; label: string }[] = [
  { key: 'match-pairs', label: 'Match Pairs' },
  { key: 'fill-blank', label: 'Fill Blank' },
  { key: 'categorization', label: 'Categorize' },
  { key: 'sequencing', label: 'Sequence' },
]
