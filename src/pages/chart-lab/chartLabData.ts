/* Chart Lab mock data — one sample question per assessment type, all from the
   same food-and-hospitality assessment so the overview and the cards agree. */

export type Band = 'success' | 'warning' | 'error'

/** Score bands: 75%+ is on track, 50–74% needs a look, under 50% is a problem. */
export function band(pct: number): Band {
  if (pct >= 75) return 'success'
  if (pct >= 50) return 'warning'
  return 'error'
}

/** How a bar is drawn. Colour only ever means right, flagged or leading. */
export type Tone = 'correct' | 'wrong' | 'flag' | 'lead' | 'plain'

export interface OptionRow {
  label: string
  pct: number
  tone: Tone
  /** Option letter or step number; correct rows show a tick instead. */
  marker?: string
  /** Match the pairs / categorise: the item the label is matched to. */
  from?: string
  tag?: string
}

export interface Insight {
  icon: 'swap' | 'info'
  lead: string
  text: string
}

interface Base {
  id: string
  number: number
  /** The type badge, e.g. "Multiple choice". */
  type: string
  /** Short type name for the overview column. */
  short: string
  title: string
  responses: number
  insight?: Insight
}

/** Scored types carry a % correct; the caption says what "correct" means. */
interface Scored {
  score: number
  scoreLabel: string
}

export type ChartQuestion =
  | (Base & Scored & { kind: 'options'; rows: OptionRow[] })
  | (Base & { kind: 'poll'; rows: OptionRow[] })
  | (Base &
      Scored & {
        kind: 'images'
        tiles: { label: string; pct: number; correct: boolean; icon: 'wet-floor' | 'exit' | 'no-parking' | 'notice' }[]
      })
  | (Base & Scored & { kind: 'blanks'; parts: (string | { answer: string; pct: number })[] })
  | (Base & {
      kind: 'open'
      enrolled: number
      themes: { label: string; pct: number }[]
      answers: { text: string; name: string }[]
    })

export const ASSESSMENT = {
  title: 'Food Safety Level 2 · Final quiz',
  learners: 412,
  passed: 71,
}

export interface ChartSection {
  title: string
  covers: string
  questions: ChartQuestion[]
}

const q1: ChartQuestion = {
  id: 'q1',
  kind: 'poll',
  number: 1,
  type: 'Poll',
  short: 'Poll',
  title: 'How confident do you feel handling a guest complaint on your own?',
  responses: 412,
  rows: [
    { marker: 'A', label: 'Fairly confident', pct: 46, tone: 'lead' },
    { marker: 'B', label: 'Very confident', pct: 29, tone: 'plain' },
    { marker: 'C', label: 'Not very confident', pct: 18, tone: 'plain' },
    { marker: 'D', label: "I'd always get a manager", pct: 7, tone: 'plain' },
  ],
}

const q2: ChartQuestion = {
  id: 'q2',
  kind: 'open',
  number: 2,
  type: 'Short text',
  short: 'Short text',
  title: 'In one sentence, how would you calm down an upset guest?',
  responses: 388,
  enrolled: 412,
  themes: [
    { label: 'Listen first', pct: 62 },
    { label: 'Apologise', pct: 48 },
    { label: 'Offer a fix', pct: 35 },
    { label: 'Get a manager', pct: 17 },
  ],
  answers: [
    {
      text: 'Let them finish, repeat back what went wrong, then tell them exactly what I\'ll do next.',
      name: 'Priya S.',
    },
    { text: 'Apologise straight away and offer a drink while I sort it out.', name: 'Tom R.' },
  ],
}

const q3: ChartQuestion = {
  id: 'q3',
  kind: 'options',
  number: 3,
  type: 'Multiple choice',
  short: 'Choice',
  title: 'A guest asks you to hold their passport overnight. What should you do?',
  responses: 412,
  score: 78,
  scoreLabel: 'correct',
  rows: [
    { label: 'Politely decline and offer the in-room safe', pct: 78, tone: 'correct' },
    { marker: 'B', label: 'Keep it at the front desk until check-out', pct: 14, tone: 'wrong' },
    { marker: 'C', label: 'Ask a manager to lock it in the back office', pct: 6, tone: 'wrong' },
    { marker: 'D', label: 'Agree, as long as they sign a release form', pct: 2, tone: 'wrong' },
  ],
}

const q3b: ChartQuestion = {
  id: 'q3b',
  kind: 'options',
  number: 2,
  type: 'Select all that apply',
  short: 'Select all',
  title: "Which of these count as a guest's personal data?",
  responses: 405,
  score: 56,
  scoreLabel: 'fully correct',
  rows: [
    { label: 'Email address', pct: 88, tone: 'correct' },
    { marker: 'B', label: "The hotel's VAT number", pct: 23, tone: 'wrong' },
    { label: 'Booking reference', pct: 61, tone: 'correct' },
    { label: 'IP address used to book', pct: 47, tone: 'correct' },
  ],
}

const q4: ChartQuestion = {
  id: 'q4',
  kind: 'images',
  number: 4,
  type: 'Image choice',
  short: 'Image',
  title: 'Which sign should you place after mopping the lobby?',
  responses: 377,
  score: 81,
  scoreLabel: 'correct',
  tiles: [
    { label: 'Wet floor', pct: 81, correct: true, icon: 'wet-floor' },
    { label: 'Fire exit', pct: 11, correct: false, icon: 'exit' },
    { label: 'No parking', pct: 5, correct: false, icon: 'no-parking' },
    { label: 'Notice', pct: 3, correct: false, icon: 'notice' },
  ],
}

const q5: ChartQuestion = {
  id: 'q5',
  kind: 'options',
  number: 5,
  type: 'Situational test',
  short: 'Situational',
  title: "A colleague shares a customer's card details in team chat. What's your first step?",
  responses: 398,
  score: 34,
  scoreLabel: 'correct',
  rows: [
    { label: 'Report it to your data protection lead', pct: 34, tone: 'correct' },
    { marker: 'B', label: 'Delete the message and move on', pct: 52, tone: 'flag', tag: 'Most picked' },
    { marker: 'C', label: 'Reply asking them not to do it again', pct: 10, tone: 'wrong' },
    { marker: 'D', label: 'Screenshot it as evidence', pct: 4, tone: 'wrong' },
  ],
}

const q6: ChartQuestion = {
  id: 'q6',
  kind: 'options',
  number: 6,
  type: 'Match the pairs',
  short: 'Pairs',
  title: 'Match each allergen to the dish that contains it',
  responses: 361,
  score: 63,
  scoreLabel: 'all pairs right',
  rows: [
    { from: 'Sesame', label: 'Hummus', pct: 94, tone: 'correct' },
    { from: 'Gluten', label: 'Soy sauce', pct: 72, tone: 'correct' },
    { from: 'Celery', label: 'Waldorf salad', pct: 41, tone: 'flag', tag: 'Most missed' },
    { from: 'Mustard', label: 'Honey glaze', pct: 88, tone: 'correct' },
  ],
}

const q6b: ChartQuestion = {
  id: 'q6b',
  kind: 'options',
  number: 3,
  type: 'Categorise',
  short: 'Categorise',
  title: 'Sort each item into the right fridge',
  responses: 344,
  score: 58,
  scoreLabel: 'all items right',
  rows: [
    { from: 'Raw chicken', label: 'Raw meat fridge', pct: 91, tone: 'correct' },
    { from: 'Cooked ham', label: 'Ready-to-eat fridge', pct: 66, tone: 'correct' },
    { from: 'Smoked salmon', label: 'Ready-to-eat fridge', pct: 38, tone: 'flag', tag: 'Most missed' },
    { from: 'Raw prawns', label: 'Raw meat fridge', pct: 84, tone: 'correct' },
  ],
  insight: { icon: 'info', lead: 'Smoked salmon', text: 'went to the raw meat fridge for 55%' },
}

const q7: ChartQuestion = {
  id: 'q7',
  kind: 'options',
  number: 7,
  type: 'Sequence',
  short: 'Sequence',
  title: 'Put the fire alarm steps in the right order',
  responses: 352,
  score: 39,
  scoreLabel: 'fully in order',
  rows: [
    { marker: '1', label: 'Raise the alarm', pct: 91, tone: 'correct' },
    { marker: '2', label: 'Call reception with your location', pct: 52, tone: 'correct' },
    { marker: '3', label: 'Guide guests to the nearest exit', pct: 44, tone: 'flag', tag: 'Most missed' },
    { marker: '4', label: 'Head count at the assembly point', pct: 86, tone: 'correct' },
  ],
  insight: { icon: 'swap', lead: 'Most common mistake:', text: 'steps 2 and 3 swapped (31%)' },
}

const q8: ChartQuestion = {
  id: 'q8',
  kind: 'blanks',
  number: 8,
  type: 'Fill in the blanks',
  short: 'Blanks',
  title: 'Complete the fridge storage rule',
  responses: 349,
  score: 47,
  scoreLabel: 'all blanks right',
  parts: [
    'Store raw meat on the',
    { answer: 'bottom', pct: 92 },
    'shelf, below',
    { answer: 'ready-to-eat', pct: 68 },
    'food, at',
    { answer: '5°C', pct: 38 },
    'or colder.',
  ],
  insight: { icon: 'info', lead: 'Top wrong answer for 5°C:', text: '8°C (41%)' },
}

/** The eight questions of the sample assessment, in order, for the overview. */
export const OVERVIEW_QUESTIONS: ChartQuestion[] = [q1, q2, q3, q4, q5, q6, q7, q8]

/** Every pattern, grouped by how it reads. Select all and categorise come from
    other assessments, so they sit in the gallery but not in the overview. */
export const SECTIONS: ChartSection[] = [
  {
    title: 'Single answer',
    covers: 'Lesson quiz · Multiple choice (single) · Situational test',
    questions: [q3, q5],
  },
  {
    title: 'Select all that apply',
    covers: 'Bars show the share of learners who ticked each option',
    questions: [q3b],
  },
  { title: 'Image choice', covers: 'Select the correct image (single or multiple)', questions: [q4] },
  { title: 'Poll', covers: 'No right answer, so the leading option gets the colour', questions: [q1] },
  {
    title: 'Per-item accuracy',
    covers: 'Match the pairs · Categorise · Sequence · Fill in the blanks',
    questions: [q6, q6b, q7, q8],
  },
  {
    title: 'Open response',
    covers: 'Short text · Exercise. Nothing to mark, so show the themes and real answers',
    questions: [q2],
  },
]
