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

/** One question inside a multi-question assessment. */
export interface MultiQuestion {
  prompt: string
  options: string[]
  correctIndex: number
}

/** One sitting: the option picked for each question, in order. */
export interface MultiResponse {
  learner: ResponseLearner
  submittedAt: string
  picks: number[]
}

interface AssessmentBase {
  id: string
  title: string
  prompt: string
  /** Everyone enrolled on the course — the denominator a response count is read against. */
  enrolled: number
  /**
   * The lesson this closes, for a quiz that sits at the end of one. Absent on a
   * course-level assessment — which is the difference between the two: not a flag,
   * but whether there is a lesson to name.
   */
  lesson?: string
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

/**
 * Several questions answered in one sitting — a situational test running a scenario,
 * or a lesson quiz of two or three checks. Kept out of GradedAssessment rather than
 * bolted onto it: that shape has one prompt, one option list and one verdict per
 * learner, and every reader of it assumes so. Here the questions carry the answers,
 * and `type` says which kind of sitting it was.
 */
export interface MultiAssessment extends AssessmentBase {
  kind: 'multi'
  type: 'situational-test' | GradedType
  questions: MultiQuestion[]
  responses: MultiResponse[]
}

export type AssessmentResult =
  | GradedAssessment
  | PollAssessment
  | TextAssessment
  | FileAssessment
  | MultiAssessment

/* ── Derived values ───────────────────────────────────────────────────────── */

export function responseCount(a: AssessmentResult): number {
  return a.responses.length
}

/**
 * Percent answered correctly, or null when the format has no right answer.
 * Null is the signal to render something else entirely — never an em dash.
 */
export function correctPct(a: AssessmentResult): number | null {
  if (a.kind !== 'graded' && a.kind !== 'multi') return null
  if (a.responses.length === 0) return null
  if (a.kind === 'multi') {
    /* Averaged over answers, not over learners: a test where everyone missed the
       same two questions is not the same shape as one where two learners missed
       everything, and the answer count is what both claims are read off. */
    const right = a.responses.reduce((n, r) => n + multiScore(a, r), 0)
    return Math.round((right / (a.responses.length * a.questions.length)) * 100)
  }
  const right = a.responses.filter((r) => r.correct).length
  return Math.round((right / a.responses.length) * 100)
}

/* Formats whose options are outcome bands rather than answers: what is recorded is
   how much of the arrangement they got right, not which option they chose. */
const BANDED = new Set<GradedType>(['match-pairs', 'sequencing', 'categorization'])

/**
 * Whether this assessment has a right answer worth stating. False for the banded
 * formats above, where “All four pairs correct” is the score and stating it as the
 * correct answer says nothing — the pairs themselves live in the question.
 */
export function hasStatedAnswer(a: AssessmentResult): a is GradedAssessment {
  return a.kind === 'graded' && !BANDED.has(a.type)
}

/** How many of one learner’s picks matched the right option. */
export function multiScore(a: MultiAssessment, r: MultiResponse): number {
  return r.picks.filter((pick, q) => pick === a.questions[q].correctIndex).length
}

/**
 * How many got each question right, in question order. The per-question view has no
 * other source: a learner's picks say whether they were right, and only the question
 * they answer says which column that belongs in.
 */
export function questionTally(a: MultiAssessment): number[] {
  return a.questions.map(
    (q, i) => a.responses.filter((r) => r.picks[i] === q.correctIndex).length,
  )
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

/* One run through a scenario per learner.
 *
 * `easiness[q]` is roughly how many of the pool get question q right, and a learner's
 * position in the pool is roughly how well they do — but both are wobbled per question,
 * so a strong learner still drops one and a weak one still gets the easy ones. Strictly
 * honouring the counts instead makes every learner score within one of the average,
 * which is the one thing a per-learner table is read to find out. */
function runs(
  id: string,
  count: number,
  questions: MultiQuestion[],
  easiness: number[],
): MultiResponse[] {
  return pool.slice(0, count).map((learner, i) => ({
    learner,
    submittedAt: DATES[(seed(learner.id) + i) % DATES.length],
    picks: questions.map((q, qi) => {
      const grip = i + ((seed(id + learner.id) + qi * 3) % 7) - 3
      if (grip < easiness[qi]) return q.correctIndex
      const n = q.options.length
      return (q.correctIndex + 1 + ((seed(id + learner.id) + qi) % (n - 1))) % n
    }),
  }))
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

/* The scenario the situational test runs on. Twelve questions over one incident,
   ordered as the incident unfolds — the last one deliberately returns to the first,
   so the test can show whether the lesson held. */
const EXCLUDED_HIRE: MultiQuestion[] = [
  {
    prompt: 'A new hire tells you they feel excluded from team decisions. What do you do first?',
    options: [
      'Raise it with their manager before speaking to them again',
      'Ask them for a specific recent example',
      'Add them to every recurring meeting',
      'Tell them it is normal in the first few months',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'Her example: a launch date moved in a channel she is not in. What is the most useful response?',
    options: [
      'Forward her the thread',
      'Add the channel to onboarding and check what else is missing',
      'Ask why she did not request access',
      'Explain that the channel is for leads',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'Two other recent joiners say the same thing. What does that change?',
    options: [
      'Nothing — three people is not a pattern',
      'It becomes a team process problem rather than an individual one',
      'It means the onboarding buddy failed',
      'It should go to HR before anything else',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'You want to know how widespread this is. What is the best next step?',
    options: [
      'Send an anonymous survey to the whole company',
      'Ask the last four joiners the same question in their 1:1s',
      'Watch the channels for a month',
      'Raise it at the all-hands',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'Your manager says the team is “just busy right now”. How do you respond?',
    options: [
      'Agree and revisit next quarter',
      'Show the three examples and propose one change',
      'Escalate over their head',
      'Drop it — it is not your call',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'Which change is most likely to fix the cause rather than the symptom?',
    options: [
      'A written decision log everyone can read',
      'A monthly team social',
      'Another announcements channel',
      'Longer stand-ups',
    ],
    correctIndex: 0,
  },
  {
    prompt: 'How should the decision log be introduced?',
    options: [
      'Announce it and require it from Monday',
      'Pilot it for four weeks with one owner, then review',
      'Add it quietly and see who uses it',
      'Ask everyone to vote on the format first',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'The new hire asks whether raising this hurt her standing. What do you say?',
    options: [
      'That it is fine and not to worry about it',
      'Name what changed because she raised it',
      'Ask her to keep it between the two of you',
      'Tell her you will note it in her review as initiative',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'A senior colleague calls the log “process for its own sake”. What is the strongest reply?',
    options: [
      'Point to the three handovers it would have caught',
      'Remind them it is mandatory',
      'Offer to exempt their area',
      'Ask them to give it a year',
    ],
    correctIndex: 0,
  },
  {
    prompt: 'Four weeks in, three people are using the log. What do you conclude?',
    options: [
      'The team rejected it',
      'Adoption is a design problem — find where it breaks',
      'It needs enforcing',
      'It needs a better template',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'What would tell you the culture actually changed?',
    options: [
      'The log has entries every week',
      'New joiners can say where decisions live',
      'Nobody raises it any more',
      'Meeting attendance goes up',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'Six months on, another joiner raises the same feeling. What is the right first move?',
    options: [
      'Ask them for a specific recent example',
      'Point them at the decision log',
      'Assume the log has decayed and rewrite it',
      'Take it to their manager',
    ],
    correctIndex: 0,
  },
]

/* ── Lesson quiz questions ────────────────────────────────────────────────
   Hoisted because the assessment and its responses are built from the same list:
   a pick is only right or wrong against the question it answers. */
const QUIZ_CULTURE: MultiQuestion[] = [
  {
    prompt: 'Which of these tells you most about a team’s real culture?',
    options: [
      'The values written on the wall',
      'What gets rewarded and what gets ignored',
      'How often the team socialises',
      'The tone of the last all-hands',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'A team says it values candour but nobody disagrees in reviews. What does that tell you?',
    options: [
      'The team already agrees on everything',
      'The stated value is not the practised one',
      'Reviews are the wrong place for candour',
      'The manager needs to ask more questions',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'Where does a new joiner learn what is really valued?',
    options: [
      'The handbook',
      'What their first mistake is met with',
      'The onboarding deck',
      'The values page on the intranet',
    ],
    correctIndex: 1,
  },
]

const QUIZ_BEHAVIOUR: MultiQuestion[] = [
  {
    prompt: 'Which sentence describes behaviour rather than character?',
    options: [
      'You are dismissive in reviews',
      'You cut across Ana twice in yesterday’s review',
      'You have an attitude problem',
      'You never listen to the team',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'What makes an observation checkable by the person hearing it?',
    options: [
      'It names a specific moment they can recall',
      'It is said kindly',
      'It comes from more than one person',
      'It avoids naming anyone else',
    ],
    correctIndex: 0,
  },
]

const QUIZ_FEEDBACK: MultiQuestion[] = [
  {
    prompt: 'How soon after the event does feedback do the most good?',
    options: ['Within the week', 'At the next review', 'Once the quarter closes', 'When they ask for it'],
    correctIndex: 0,
  },
  {
    prompt: 'What does feedback need to be actionable?',
    options: [
      'A judgement of how it came across',
      'A named behaviour and its effect',
      'A comparison with a colleague',
      'A rating out of five',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'They disagree with your observation. What is the useful next move?',
    options: [
      'Restate it more firmly',
      'Ask what they saw happen',
      'Bring in a second opinion',
      'Leave it for the review',
    ],
    correctIndex: 1,
  },
]

const QUIZ_DECISIONS: MultiQuestion[] = [
  {
    prompt: 'A decision was made in a call. What makes it visible to the people it affects?',
    options: [
      'Telling the people who ask',
      'Writing it down where the team already looks',
      'Mentioning it at the next all-hands',
      'Adding everyone to the call next time',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'What belongs in a decision record for it to be useful later?',
    options: [
      'Who attended',
      'What was decided and what it rules out',
      'How long the discussion took',
      'Who disagreed',
    ],
    correctIndex: 1,
  },
]

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
    kind: 'multi',
    type: 'situational-test',
    title: 'A new hire feels excluded',
    /* The setup, not a question: what every question below is answered against. */
    prompt:
      'Priya joined the team six weeks ago. In her first proper 1:1 she says she keeps hearing about decisions after they are made, and is not sure who to ask.',
    enrolled: ENROLLED,
    questions: EXCLUDED_HIRE,
    responses: runs('a4', 10, EXCLUDED_HIRE, [4, 7, 8, 6, 9, 3, 7, 8, 5, 6, 9, 7]),
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
    options: ['4 of 4 pairs correct', '3 of 4 pairs correct', '2 of 4 pairs correct', '1 of 4 pairs correct'],
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
    options: ['5 of 5 steps in order', '4 of 5 steps in order', '3 of 5 steps in order', '2 of 5 steps in order'],
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
    options: ['6 of 6 sorted correctly', '5 of 6 sorted correctly', '4 of 6 sorted correctly', '3 of 6 sorted correctly'],
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

  /* ── Lesson quizzes ──────────────────────────────────────────────────────
     The check at the end of a lesson rather than an assessment the admin placed on
     the course, and two or three questions rather than one — so they take the same
     multi-question shape as the situational test, and the row names the lesson they
     close. No prompt of their own: the questions are the whole of them. */
  {
    id: 'q1',
    kind: 'multi',
    type: 'single-choice',
    /* Titled by the question it opens with: a lesson quiz is not named separately,
       so inventing a title here would be inventing a field. */
    title: 'Which of these tells you most about a team’s real culture?',
    lesson: 'Culture is a system, not a slogan',
    prompt: '',
    enrolled: ENROLLED,
    questions: QUIZ_CULTURE,
    responses: runs('q1', 12, QUIZ_CULTURE, [9, 7, 8]),
  },
  {
    id: 'q2',
    kind: 'multi',
    type: 'single-choice',
    title: 'Which sentence describes behaviour rather than character?',
    lesson: 'Naming what you see without blame',
    prompt: '',
    enrolled: ENROLLED,
    questions: QUIZ_BEHAVIOUR,
    responses: runs('q2', 11, QUIZ_BEHAVIOUR, [8, 6]),
  },
  {
    id: 'q3',
    kind: 'multi',
    type: 'single-choice',
    title: 'How soon after the event does feedback do the most good?',
    lesson: 'Feedback that lands',
    prompt: '',
    enrolled: ENROLLED,
    questions: QUIZ_FEEDBACK,
    responses: runs('q3', 10, QUIZ_FEEDBACK, [6, 5, 7]),
  },
  {
    id: 'q4',
    kind: 'multi',
    type: 'single-choice',
    title: 'A decision was made in a call. What makes it visible to the people it affects?',
    lesson: 'Decisions people can see',
    prompt: '',
    enrolled: ENROLLED,
    questions: QUIZ_DECISIONS,
    responses: runs('q4', 12, QUIZ_DECISIONS, [7, 5]),
  },
]

export const courseInsight: CourseInsight = {
  generatedAt: null,
  struggled:
    'Sequencing a culture rollout is the weakest area: only 3 of 8 put the steps in the right order, and most started with communication rather than with listening. The situational test shows the same instinct — on its opening question 6 of 10 acted or reassured, escalating to her manager, adding her to every meeting or calling it normal, rather than asking for a specific example first. Both point at a bias toward acting before diagnosing.',
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
  /** Null for poll, short text and exercise — those carry no verdict at all. Also
   *  null for a situational test: twelve questions do not reduce to one verdict,
   *  and the tally lands in a partial count instead. */
  correct: boolean | null
  /** Situational tests only — how many of its questions they got right. */
  partial?: { correct: number; of: number }
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
  /* A whole run through a scenario, so the row states the score and the drawer
     holds the twelve answers behind it. */
  if (a.kind === 'multi')
    return `${multiScore(a, a.responses[i])} of ${a.questions.length} correct`
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
  /* A situational test is missed by the question, so its misses are counted rather
     than listed — without this a learner who dropped five of its twelve reads as
     having missed nothing. */
  const partly = answers.filter((x) => x.partial && x.partial.correct < x.partial.of)
  const missedCount =
    missed.length + partly.reduce((n, x) => n + (x.partial!.of - x.partial!.correct), 0)
  const worst = missed[0] ?? partly[0]
  const written = answers.find((x) => x.assessment.kind === 'text')
  const skipped = total - answers.length

  /* Name the thing they actually got wrong — a percentage alone tells an admin
     nothing they can act on. */
  const missedPart = missedCount
    ? `Missed ${missedCount} of ${scored}, including “${worst.assessment.title}”.`
    : `Answered all ${scored} scored questions correctly.`
  /* The length, not a verdict on it. This used to read "specific, concrete" or "very
     brief" off `answer.length < 24` — a character count laundered into a judgement the
     system never made, and one the admin could not check. A word count says the same
     thing about effort and can be checked against the answer itself. */
  const writtenPart = written
    ? ` Wrote ${written.answer.trim().split(/\s+/).length} words in free text.`
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
      ...(a.kind === 'multi'
        ? { partial: { correct: multiScore(a, a.responses[i]), of: a.questions.length } }
        : {}),
      submittedAt: a.responses[i].submittedAt,
    })
  }
  const graded = answers.filter((x) => x.correct !== null)
  /* Questions, not assessments: the situational test scores twelve of them, and
     counting it as one would hide most of what this learner was actually asked. */
  const scored = graded.length + answers.reduce((n, x) => n + (x.partial?.of ?? 0), 0)
  const correct =
    graded.filter((x) => x.correct).length +
    answers.reduce((n, x) => n + (x.partial?.correct ?? 0), 0)
  const base = {
    learner,
    answers,
    scored,
    correct,
    pct: scored ? Math.round((correct / scored) * 100) : null,
  }
  return { ...base, ...describe(base) }
})

/* ── Who needs attention ───────────────────────────────────────────────────
   The named half of the insights card. Derived from the same rows the By Learner
   pivot shows, so the summary can never claim something the list contradicts. */

/** The learners the block is about, worst first.
 *
 *  Ranked by how many they actually got wrong, not by percentage: a learner who has
 *  answered one question and missed it scores 0%, which would put them above one who
 *  has answered six and missed four — a ranking that says who has started rather than
 *  who is behind. Percentage only breaks ties. */
export const attentionRows: LearnerRow[] = learnerRows
  .filter((r) => r.signal === 'needs-attention' || r.signal === 'struggling')
  .sort(
    (x, y) => y.scored - y.correct - (x.scored - x.correct) || (x.pct ?? 0) - (y.pct ?? 0),
  )

/** How many of them get named on the card. The rest are a click away in By Learner. */
export const ATTENTION_SHOWN = 3

/* What the flagged learners actually miss, counted. The paragraph used to assert they
   "miss in the same place — the situational questions" as a string literal wrapped
   around a live count: true of today's fixture, unfalsifiable, and a sentence that would
   have kept saying itself long after the data moved under it. */
const missTally = new Map<string, number>()
for (const r of attentionRows) {
  for (const a of r.answers) {
    if (a.correct === false) {
      missTally.set(a.assessment.title, (missTally.get(a.assessment.title) ?? 0) + 1)
    }
  }
}
const [topMiss, topMissCount] = [...missTally.entries()].sort((x, y) => y[1] - x[1])[0] ?? ['', 0]

/** The lead paragraph over the named rows. Every count — and now every claim — is read
 *  off the rows underneath it, so the prose cannot drift from the list it introduces. */
export const attentionSummary = [
  `${attentionRows.length} learners are behind the cohort.`,
  /* Only worth saying when it is actually shared. One learner missing a question is not
     a pattern, and the sentence would be describing an individual as a trend. */
  topMissCount > 1 ? `${topMissCount} of them missed the same question — “${topMiss}”.` : '',
  `${attentionRows.filter((r) => r.answers.length < courseAssessments.length).length} still have assessments outstanding, so part of the gap is attendance rather than understanding.`,
  attentionRows.length > ATTENTION_SHOWN
    ? `The ${ATTENTION_SHOWN} furthest behind are below; the rest are in By Learner.`
    : '',
]
  .filter(Boolean)
  .join(' ')

/* ── CSV export ────────────────────────────────────────────────────────────
   One row per response, so a spreadsheet can pivot it either way. Formats with
   no verdict leave Result empty rather than inventing one. */

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)

export function responsesCsv(): string {
  const header = ['Assessment', 'Type', 'Learner', 'Role', 'Submitted', 'Response', 'Result']
  const rows: string[][] = []
  for (const a of courseAssessments) {
    /* One row per question, so a situational test exports as what it is rather
       than as a score with the twelve answers thrown away. */
    if (a.kind === 'multi') {
      for (const r of a.responses) {
        a.questions.forEach((q, qi) => {
          rows.push([
            a.title,
            a.type,
            r.learner.name,
            r.learner.role,
            r.submittedAt,
            `Q${qi + 1}: ${q.options[r.picks[qi]]}`,
            r.picks[qi] === q.correctIndex ? 'Correct' : 'Incorrect',
          ])
        })
      }
      continue
    }
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
