/* Types for the assessment answer charts (Course details > Assessments, View Answers).
   Scoring is all or nothing: a learner's answer is correct or incorrect, never partly right. */

/** How a bar is drawn. Only the correct answer has a colour (Success-500). */
export type Tone = 'correct' | 'wrong' | 'plain'

export interface OptionRow {
  label: string
  pct: number
  tone: Tone
}

interface Base {
  id: string
  /** The type, as the page header shows it. */
  type: string
  title: string
  responses: number
}

/** Scored types carry a % correct; the label says what "correct" means. */
interface Scored {
  score: number
  scoreLabel: string
}

export type ChartQuestion =
  | (Base & Scored & { kind: 'options'; rows: OptionRow[] })
  | (Base & { kind: 'poll'; rows: OptionRow[] })
  | (Base & Scored & { kind: 'images'; tiles: { label: string; pct: number; correct: boolean; src?: string }[] })
  /** Match the pairs, categorise, sequence: only correct or incorrect, so the
      chart shows that split and the correct answer once. */
  | (Base & Scored & { kind: 'outcome'; answer: CorrectAnswer })
  /** Fill in the blanks: the sentence, each blank with the share who filled it in. */
  | (Base & Scored & { kind: 'blanks'; parts: (string | { answer: string; pct: number })[] })
  | (Base & {
      kind: 'open'
      enrolled: number
    })

/** The correct answer to a question with no options to tally. */
export type CorrectAnswer =
  /** Match the pairs: shown as the learner sees a matched pair. */
  | { kind: 'matches'; pairs: [string, string][] }
  /** Categorise: each category with its items, as the learner sees them placed. */
  | { kind: 'groups'; groups: { label: string; items: string[] }[] }
  | { kind: 'steps'; steps: string[] }

/** One question of a lesson quiz or situational test: single answer, so its
    % correct is the share who picked the correct option. */
export interface QuizQuestion {
  id: string
  title: string
  rows: OptionRow[]
  /** Set when learners get different questions (a question bank): how many answered this one. */
  answered?: number
}

/** A lesson quiz (3 to 4 questions) or situational test (up to 8): one page. */
export interface MultiAssessment {
  id: string
  type: 'Lesson quiz' | 'Situational test'
  title: string
  responses: number
  questions: QuizQuestion[]
}
