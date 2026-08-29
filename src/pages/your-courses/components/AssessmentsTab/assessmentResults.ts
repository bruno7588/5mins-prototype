/**
 * Assessment results for the admin Assessments tab (DES-331).
 *
 * The union below is the load-bearing part. Short-text and exercise responses carry
 * no correctness field at all, so "mark this answer correct" is unrepresentable rather
 * than merely unbuilt — V1 does not grade free text, and the type system enforces it.
 * V2 adds the field to those two members; nothing else has to move.
 */

import type { GeneratableType } from '@/data/aiAssessmentGeneration'
import { ORG_USERS } from '@/data/orgUsers'

/** The six formats that carry a right answer. Poll, short text and exercise do not. */
export type GradedType = Exclude<GeneratableType, 'poll' | 'short-text' | 'exercise'>

export interface ResponseLearner {
  id: string
  name: string
  role: string
  initials: string
  avatar?: string
}

/** Auto-graded: which option they picked, and whether it was right. */
export interface ChoiceResponse {
  learner: ResponseLearner
  submittedAt: string
  optionIndex: number
  correct: boolean
}

/** A poll vote. Same shape as a choice minus the verdict — a poll has no right answer. */
export interface VoteResponse {
  learner: ResponseLearner
  submittedAt: string
  optionIndex: number
}

/** Free text. No correctness field: see the note at the top of this file. */
export interface TextResponse {
  learner: ResponseLearner
  submittedAt: string
  text: string
}

/** An uploaded file. No correctness field either. */
export interface FileResponse {
  learner: ResponseLearner
  submittedAt: string
  fileName: string
  fileKind: string
  fileSize: string
}

interface AssessmentBase {
  id: string
  title: string
  prompt: string
  /** Everyone enrolled on the course — the denominator a response count is read against. */
  enrolled: number
}

export interface GradedAssessment extends AssessmentBase {
  kind: 'graded'
  type: GradedType
  options: string[]
  correctIndex: number
  responses: ChoiceResponse[]
}

export interface PollAssessment extends AssessmentBase {
  kind: 'poll'
  type: 'poll'
  options: string[]
  responses: VoteResponse[]
}

export interface TextAssessment extends AssessmentBase {
  kind: 'text'
  type: 'short-text'
  responses: TextResponse[]
}

export interface FileAssessment extends AssessmentBase {
  kind: 'file'
  type: 'exercise'
  responses: FileResponse[]
}

export type AssessmentResult = GradedAssessment | PollAssessment | TextAssessment | FileAssessment

/* ── Derived values ───────────────────────────────────────────────────────── */

export function responseCount(a: AssessmentResult): number {
  return a.responses.length
}

/**
 * Percent answered correctly, or null when the format has no right answer.
 * Null is the signal to render something else entirely — never an em dash.
 */
export function correctPct(a: AssessmentResult): number | null {
  if (a.kind !== 'graded') return null
  if (a.responses.length === 0) return null
  const right = a.responses.filter((r) => r.correct).length
  return Math.round((right / a.responses.length) * 100)
}

/** Votes per option, in option order. */
export function optionTally(a: GradedAssessment | PollAssessment): number[] {
  const tally = a.options.map(() => 0)
  for (const r of a.responses) tally[r.optionIndex] += 1
  return tally
}

/* ── Insight model (built in Phase 4; shaped here so the data is ready) ────── */

export type LearnerSignal = 'on-track' | 'needs-attention' | 'struggling' | 'not-started'

export interface CourseInsight {
  /** Null until an admin generates it — the un-generated state is the default. */
  generatedAt: string | null
  struggled: string
  mastered: string
}

/* ── Mock data ────────────────────────────────────────────────────────────── */

const ENROLLED = 128

/** The responder pool, drawn from the org directory so avatars and roles are real. */
const pool: ResponseLearner[] = ORG_USERS.map((u, i) => ({
  id: `L${i + 1}`,
  name: u.name,
  role: u.role ?? 'Team member',
  initials: u.initials,
  avatar: u.avatar,
}))

const DATES = [
  'Aug 12, 2026', 'Aug 13, 2026', 'Aug 14, 2026', 'Aug 15, 2026',
  'Aug 18, 2026', 'Aug 19, 2026', 'Aug 20, 2026', 'Aug 21, 2026',
]

/** Deterministic pseudo-random so the mock is stable across reloads. */
const seed = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0)

/** `count` responses to a graded question, with `rightCount` of them correct. */
function choices(id: string, count: number, rightCount: number, options: number, correctIndex: number): ChoiceResponse[] {
  return pool.slice(0, count).map((learner, i) => {
    const correct = i < rightCount
    const wrongPick = (correctIndex + 1 + ((seed(id + learner.id) + i) % (options - 1))) % options
    return {
      learner,
      submittedAt: DATES[(seed(learner.id) + i) % DATES.length],
      optionIndex: correct ? correctIndex : wrongPick,
      correct,
    }
  })
}

function votes(id: string, count: number, options: number): VoteResponse[] {
  return pool.slice(0, count).map((learner, i) => ({
    learner,
    submittedAt: DATES[(seed(learner.id) + i) % DATES.length],
    optionIndex: (seed(id + learner.id) + i) % options,
  }))
}

function texts(answers: string[]): TextResponse[] {
  return answers.map((text, i) => ({
    learner: pool[i],
    submittedAt: DATES[(seed(pool[i].id) + i) % DATES.length],
    text,
  }))
}

export const courseAssessments: AssessmentResult[] = [
  {
    id: 'a1',
    kind: 'graded',
    type: 'single-choice',
    title: 'Signals of psychological safety',
    prompt: 'Which behaviour best signals psychological safety in a team meeting?',
    enrolled: ENROLLED,
    options: [
      'Everyone agrees quickly so the meeting ends on time',
      'A junior colleague challenges a senior decision and is thanked for it',
      'The manager summarises and no one adds anything',
      'Disagreements are moved to a private channel afterwards',
    ],
    correctIndex: 1,
    responses: choices('a1', 12, 9, 4, 1),
  },
  {
    id: 'a2',
    kind: 'text',
    type: 'short-text',
    title: 'A ritual for your team',
    prompt: 'Describe one ritual your team could adopt to reinforce the values in this course.',
    enrolled: ENROLLED,
    responses: texts([
      'A five-minute round at the end of each sprint review where anyone can flag something that felt off. No fixing, just naming it.',
      'Monthly "what did we learn from a mistake" slot in the team meeting, led by a different person each time.',
      'We already do a Friday shout-out channel. I would make it required for managers rather than optional.',
      'Start every 1:1 with the same question: what is one thing I could do differently for you?',
      'Rotate who runs stand-up so it stops being the manager’s meeting.',
      'Not sure yet.',
      'A quarterly retro on the team charter itself, not just on the work. We wrote ours 18 months ago and nobody has read it since.',
      'Buddy system for new joiners for the first six weeks, with a check-in at weeks 1, 3 and 6.',
      'Honestly our team is too small for rituals, we talk constantly anyway.',
    ]),
  },
  {
    id: 'a3',
    kind: 'poll',
    type: 'poll',
    title: 'Where culture needs attention',
    prompt: 'Which part of our culture needs the most attention right now?',
    enrolled: ENROLLED,
    options: ['Giving feedback', 'Recognising good work', 'Decision transparency', 'Work-life boundaries'],
    responses: votes('a3', 11, 4),
  },
  {
    id: 'a4',
    kind: 'graded',
    type: 'situational-test',
    title: 'A new hire feels excluded',
    prompt: 'A new hire tells you they feel excluded from team decisions. What do you do first?',
    enrolled: ENROLLED,
    options: [
      'Raise it with their manager before speaking to them again',
      'Ask them for a specific recent example',
      'Add them to every recurring meeting',
      'Tell them it is normal in the first few months',
    ],
    correctIndex: 1,
    responses: choices('a4', 10, 4, 4, 1),
  },
  {
    id: 'a5',
    kind: 'file',
    type: 'exercise',
    title: 'Your team culture action plan',
    prompt: 'Upload a one-page action plan for your team, covering one behaviour to reinforce and one to change.',
    enrolled: ENROLLED,
    responses: pool.slice(0, 6).map((learner, i) => ({
      learner,
      submittedAt: DATES[(seed(learner.id) + i) % DATES.length],
      fileName: ['culture-plan-q3.pdf', 'team-actions.docx', 'ops-culture-plan.pdf', 'my-plan.pdf', 'culture_workshop_notes.pdf', 'action-plan-final.pdf'][i],
      fileKind: ['PDF', 'DOCX', 'PDF', 'PDF', 'PDF', 'PDF'][i],
      fileSize: ['248 KB', '96 KB', '1.2 MB', '310 KB', '2.4 MB', '187 KB'][i],
    })),
  },
  {
    id: 'a6',
    kind: 'graded',
    type: 'match-pairs',
    title: 'Culture levers and outcomes',
    prompt: 'Match each culture lever to the outcome it most directly drives.',
    enrolled: ENROLLED,
    options: ['All four pairs correct', 'Three of four correct', 'Two of four correct', 'One or none correct'],
    correctIndex: 0,
    responses: choices('a6', 9, 6, 4, 0),
  },
  {
    id: 'a7',
    kind: 'graded',
    type: 'sequencing',
    title: 'Rolling out a culture change',
    prompt: 'Put the steps of a culture change rollout in the right order.',
    enrolled: ENROLLED,
    options: ['Correct order', 'One step out of place', 'Two steps out of place', 'Largely out of order'],
    correctIndex: 0,
    responses: choices('a7', 8, 3, 4, 0),
  },
  {
    id: 'a8',
    kind: 'graded',
    type: 'categorization',
    title: 'Reinforce or redirect',
    prompt: 'Sort each observed behaviour into Reinforce or Redirect.',
    enrolled: ENROLLED,
    options: ['All six sorted correctly', 'Five of six', 'Four of six', 'Three or fewer'],
    correctIndex: 0,
    responses: choices('a8', 7, 5, 4, 0),
  },
  {
    id: 'a9',
    kind: 'graded',
    type: 'fill-blank',
    title: 'Defining psychological safety',
    prompt: 'Complete the definition: psychological safety is a shared belief that the team is safe for ___ risk-taking.',
    enrolled: ENROLLED,
    options: ['interpersonal', 'commercial', 'operational', 'reputational'],
    correctIndex: 0,
    responses: choices('a9', 11, 10, 4, 0),
  },
]

export const courseInsight: CourseInsight = {
  generatedAt: null,
  struggled:
    'Sequencing a culture rollout is the weakest area: only 3 of 8 put the steps in the right order, and most started with communication rather than with listening. The situational test shows the same instinct — 6 of 10 escalated to the manager or added the new hire to meetings instead of asking for a specific example first. Both point at a bias toward acting before diagnosing.',
  mastered:
    'The definition of psychological safety is secure (10 of 11 correct), and learners reliably recognise it in behaviour rather than in policy. Free-text answers are notably concrete — most proposed a ritual with a named owner and a cadence rather than a general intention, which suggests the practical framing in lessons 3 and 4 landed.',
}

/* ── The learner pivot ─────────────────────────────────────────────────────
   Same responses, read down instead of across. The headline and sentence are
   the SchoolAI borrow: a verdict in words on every row, so an admin gets the
   "so what" without us inventing a score for formats that have none. */

export interface LearnerAnswer {
  assessment: AssessmentResult
  /** Their answer as text, whatever the format records underneath. */
  answer: string
  /** Null for poll, short text and exercise — those carry no verdict at all. */
  correct: boolean | null
  submittedAt: string
}

export interface LearnerRow {
  learner: ResponseLearner
  answers: LearnerAnswer[]
  /** How many of their answers came from a format that has a right answer. */
  scored: number
  correct: number
  pct: number | null
  signal: LearnerSignal
  headline: string
  sentence: string
}

function answerText(a: AssessmentResult, i: number): string {
  if (a.kind === 'graded' || a.kind === 'poll') return a.options[a.responses[i].optionIndex]
  if (a.kind === 'text') return a.responses[i].text
  return a.responses[i].fileName
}

function verdict(a: AssessmentResult, i: number): boolean | null {
  return a.kind === 'graded' ? a.responses[i].correct : null
}

function describe(row: Omit<LearnerRow, 'signal' | 'headline' | 'sentence'>): Pick<LearnerRow, 'signal' | 'headline' | 'sentence'> {
  const { answers, scored, pct } = row
  const total = courseAssessments.length

  if (answers.length === 0) {
    return {
      signal: 'not-started',
      headline: 'Not started',
      sentence: 'Has not answered any assessment in this course yet.',
    }
  }

  const missed = answers.filter((x) => x.correct === false)
  const written = answers.find((x) => x.assessment.kind === 'text')
  const skipped = total - answers.length

  /* Name the thing they actually got wrong — a percentage alone tells an admin
     nothing they can act on. */
  const missedPart = missed.length
    ? `Missed ${missed.length} of ${scored}, including “${missed[0].assessment.title}”.`
    : `Answered all ${scored} scored assessments correctly.`
  const writtenPart = written
    ? written.answer.length < 24
      ? ' Their written answer was very brief.'
      : ' Gave a specific, concrete written answer.'
    : ''
  const skippedPart = skipped > 0 ? ` Still has ${skipped} to complete.` : ''

  const sentence = missedPart + writtenPart + skippedPart

  if (pct === null) return { signal: 'not-started', headline: 'Unscored', sentence }
  if (pct >= 80) return { signal: 'on-track', headline: 'Confident', sentence }
  if (pct >= 60) return { signal: 'on-track', headline: 'On track', sentence }
  if (pct >= 40) return { signal: 'needs-attention', headline: 'Needs guidance', sentence }
  return { signal: 'struggling', headline: 'Struggling', sentence }
}

export const learnerRows: LearnerRow[] = pool.map((learner) => {
  const answers: LearnerAnswer[] = []
  for (const a of courseAssessments) {
    const i = a.responses.findIndex((r) => r.learner.id === learner.id)
    if (i === -1) continue
    answers.push({
      assessment: a,
      answer: answerText(a, i),
      correct: verdict(a, i),
      submittedAt: a.responses[i].submittedAt,
    })
  }
  const graded = answers.filter((x) => x.correct !== null)
  const correct = graded.filter((x) => x.correct).length
  const base = {
    learner,
    answers,
    scored: graded.length,
    correct,
    pct: graded.length ? Math.round((correct / graded.length) * 100) : null,
  }
  return { ...base, ...describe(base) }
})

/* ── CSV export ────────────────────────────────────────────────────────────
   One row per response, so a spreadsheet can pivot it either way. Formats with
   no verdict leave Result empty rather than inventing one. */

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)

export function responsesCsv(): string {
  const header = ['Assessment', 'Type', 'Learner', 'Role', 'Submitted', 'Response', 'Result']
  const rows: string[][] = []
  for (const a of courseAssessments) {
    a.responses.forEach((_, i) => {
      const correct = a.kind === 'graded' ? (a.responses[i].correct ? 'Correct' : 'Incorrect') : ''
      rows.push([
        a.title,
        a.type,
        a.responses[i].learner.name,
        a.responses[i].learner.role,
        a.responses[i].submittedAt,
        answerText(a, i),
        correct,
      ])
    })
  }
  return [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n')
}

/** Total responses across the course — what the insight summary is drawn from. */
export function totalResponses(): number {
  return courseAssessments.reduce((n, a) => n + a.responses.length, 0)
}
