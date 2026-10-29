/* Chart lab mock data: a lesson quiz and a situational test (several questions
   each), and one sample question for every single-question type. Each is a page
   of its own in the product (View Answers). Scoring is all or nothing: a learner's
   answer is correct or incorrect, never partly right. */

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

export const isScored = (q: ChartQuestion): q is Extract<ChartQuestion, { score: number }> => 'score' in q

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

export const questionScore = (q: QuizQuestion) =>
  q.rows.filter((r) => r.tone === 'correct').reduce((sum, r) => sum + r.pct, 0)

/** Four options, the first one correct. */
const options = (correct: [string, number], ...wrong: [string, number][]): OptionRow[] => [
  { label: correct[0], pct: correct[1], tone: 'correct' },
  ...wrong.map(([label, pct]) => ({ label, pct, tone: 'wrong' as const })),
]

const lessonQuiz: MultiAssessment = {
  id: 'lesson-quiz',
  type: 'Lesson quiz',
  title: 'Handling guest data',
  responses: 412,
  questions: [
    {
      id: 'lq1',
      title: 'A guest asks you to hold their passport overnight. What should you do?',
      rows: options(
        ['Politely decline and offer the in-room safe', 78],
        ['Keep it at the front desk until check-out', 14],
        ['Ask a manager to lock it in the back office', 6],
        ['Agree, as long as they sign a release form', 2],
      ),
    },
    {
      id: 'lq2',
      title: "Where should a guest's booking form go after check-in?",
      rows: options(['In the locked office drawer', 64], ['In the tray on the front desk', 22], ['In the bin', 8], ['In the staff room', 6]),
    },
    {
      id: 'lq3',
      title: 'Which of these is personal data?',
      rows: options(["The guest's email address", 85], ["The hotel's VAT number", 9], ['The room rate', 4], ['The Wi-Fi password', 2]),
    },
    {
      id: 'lq4',
      title: "Someone asks for another guest's room number. What do you do?",
      rows: options(
        ['Decline, and offer to call the room for them', 52],
        ["Give it if they say they're family", 38],
        ['Write it on a note for them', 7],
        ['Ask a manager first', 3],
      ),
    },
  ],
}

const situationalTest: MultiAssessment = {
  id: 'situational-test',
  type: 'Situational test',
  title: 'A data breach at the front desk',
  responses: 398,
  questions: [
    {
      id: 'st1',
      title: "A colleague shares a customer's card details in team chat. What's your first step?",
      rows: options(
        ['Report it to your data protection lead', 34],
        ['Delete the message and move on', 52],
        ['Reply asking them not to do it again', 10],
        ['Screenshot it as evidence', 4],
      ),
    },
    {
      id: 'st2',
      title: 'Your manager is off shift. Who do you report it to?',
      rows: options(['The data protection lead', 71], ['The night manager', 18], ['The IT helpdesk', 8], ['Nobody until tomorrow', 3]),
    },
    {
      id: 'st3',
      title: 'The colleague asks you not to report it. What do you say?',
      rows: options(['Explain that you have to report it', 66], ['Agree, just this once', 21], ['Say nothing', 9], ['Tell the guest instead', 4]),
    },
    {
      id: 'st4',
      title: 'The card owner calls about their booking. Do you mention the incident?',
      rows: options(
        ['No, the data protection lead will contact them', 58],
        ['Yes, tell them straight away', 30],
        ['Only if they ask', 10],
        ['End the call', 2],
      ),
    },
    {
      id: 'st5',
      title: 'Should you delete the message from the chat?',
      rows: options(
        ['No, keep it until the data protection lead says otherwise', 41],
        ['Yes, delete it now', 49],
        ['Edit it to hide the card number', 8],
        ['Forward it to your manager', 2],
      ),
    },
    {
      id: 'st6',
      title: 'How soon must you report a data breach?',
      rows: options(['Straight away', 74], ['By the end of your shift', 19], ['Within a week', 5], ['Only if harm is likely', 2]),
    },
    {
      id: 'st7',
      title: 'What helps stop this happening again?',
      rows: options(['Taking payments through the secure link', 82], ['Writing card numbers on paper', 9], ['Reading them out by phone', 6], ['Using a personal phone', 3]),
    },
    {
      id: 'st8',
      title: 'A guest overhears and asks what happened. What do you say?',
      rows: options(
        ["That you can't discuss it, and offer help with their stay", 69],
        ['Say it was nothing', 15],
        ['Tell them the details', 14],
        ['Ignore them', 2],
      ),
    },
  ],
}

const q1: ChartQuestion = {
  id: 'q1',
  kind: 'poll',
  type: 'Poll',
  title: 'How confident do you feel handling a guest complaint on your own?',
  responses: 412,
  rows: [
    { label: 'Fairly confident', pct: 46, tone: 'plain' },
    { label: 'Very confident', pct: 29, tone: 'plain' },
    { label: 'Not very confident', pct: 18, tone: 'plain' },
    { label: "I'd always get a manager", pct: 7, tone: 'plain' },
  ],
}

const q2: ChartQuestion = {
  id: 'q2',
  kind: 'open',
  type: 'Short text',
  title: 'In one sentence, how would you calm down an upset guest?',
  responses: 388,
  enrolled: 412,
}

const q3: ChartQuestion = {
  id: 'q3',
  kind: 'options',
  type: 'Multiple choice',
  title: 'A guest asks you to hold their passport overnight. What should you do?',
  responses: 412,
  score: 78,
  scoreLabel: 'answered correctly',
  rows: [
    { label: 'Politely decline and offer the in-room safe', pct: 78, tone: 'correct' },
    { label: 'Keep it at the front desk until check-out', pct: 14, tone: 'wrong' },
    { label: 'Ask a manager to lock it in the back office', pct: 6, tone: 'wrong' },
    { label: 'Agree, as long as they sign a release form', pct: 2, tone: 'wrong' },
  ],
}

const selectAll: ChartQuestion = {
  id: 'select-all',
  kind: 'options',
  type: 'Select all that apply',
  title: "Which of these count as a guest's personal data?",
  responses: 405,
  score: 56,
  scoreLabel: 'ticked every right answer and nothing else',
  rows: [
    { label: 'Email address', pct: 88, tone: 'correct' },
    { label: "The hotel's VAT number", pct: 23, tone: 'wrong' },
    { label: 'Booking reference', pct: 61, tone: 'correct' },
    { label: 'IP address used to book', pct: 47, tone: 'correct' },
  ],
}

const q4: ChartQuestion = {
  id: 'q4',
  kind: 'images',
  type: 'Image choice',
  title: 'Which sign should you place after mopping the lobby?',
  responses: 377,
  score: 81,
  scoreLabel: 'answered correctly',
  tiles: [
    { label: 'Wet floor', pct: 81, correct: true },
    { label: 'Fire exit', pct: 11, correct: false },
    { label: 'No parking', pct: 5, correct: false },
    { label: 'Notice', pct: 3, correct: false },
  ],
}

const q6: ChartQuestion = {
  id: 'q6',
  kind: 'outcome',
  type: 'Match the pairs',
  title: 'Match each allergen to the dish that contains it',
  responses: 361,
  score: 63,
  scoreLabel: 'answered correctly',
  answer: {
    kind: 'matches',
    pairs: [
      ['Sesame', 'Hummus'],
      ['Gluten', 'Soy sauce'],
      ['Celery', 'Waldorf salad'],
      ['Mustard', 'Honey glaze'],
    ],
  },
}

const categorise: ChartQuestion = {
  id: 'categorise',
  kind: 'outcome',
  type: 'Categorise',
  title: 'Sort each item into the right fridge',
  responses: 344,
  score: 58,
  scoreLabel: 'answered correctly',
  answer: {
    kind: 'groups',
    groups: [
      { label: 'Raw meat fridge', items: ['Raw chicken', 'Raw prawns'] },
      { label: 'Ready-to-eat fridge', items: ['Cooked ham', 'Smoked salmon'] },
    ],
  },
}

const q7: ChartQuestion = {
  id: 'q7',
  kind: 'outcome',
  type: 'Sequence',
  title: 'Put the fire alarm steps in the right order',
  responses: 352,
  score: 39,
  scoreLabel: 'answered correctly',
  answer: {
    kind: 'steps',
    steps: ['Raise the alarm', 'Call reception with your location', 'Guide guests to the nearest exit', 'Head count at the assembly point'],
  },
}

const q8: ChartQuestion = {
  id: 'q8',
  kind: 'blanks',
  type: 'Fill in the blanks',
  title: 'Complete the fridge storage rule',
  responses: 349,
  score: 47,
  scoreLabel: 'answered correctly',
  parts: [
    'Store raw meat on the',
    { answer: 'bottom', pct: 92 },
    'shelf, below',
    { answer: 'ready-to-eat', pct: 68 },
    'food, at',
    { answer: '5°C', pct: 38 },
    'or colder.',
  ],
}

/** One page per chart, as the product shows them. */
export const PAGES: { key: string; label: string; question?: ChartQuestion; assessment?: MultiAssessment }[] = [
  { key: 'lesson-quiz', label: 'Lesson quiz', assessment: lessonQuiz },
  { key: 'situational-test', label: 'Situational test', assessment: situationalTest },
  { key: 'q3', label: 'Multiple choice', question: q3 },
  { key: 'select-all', label: 'Select all', question: selectAll },
  { key: 'q4', label: 'Image choice', question: q4 },
  { key: 'q1', label: 'Poll', question: q1 },
  { key: 'q6', label: 'Match the pairs', question: q6 },
  { key: 'categorise', label: 'Categorise', question: categorise },
  { key: 'q7', label: 'Sequence', question: q7 },
  { key: 'q8', label: 'Fill in the blanks', question: q8 },
  { key: 'q2', label: 'Short text', question: q2 },
]
