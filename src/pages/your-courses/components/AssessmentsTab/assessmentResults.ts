/**
 * Assessment results for the admin Assessments tab (DES-331).
 *
 * The union below is the load-bearing part. Short-text and exercise responses carry
 * no correctness field at all, so "mark this answer correct" is unrepresentable rather
 * than merely unbuilt — V1 does not grade free text, and the type system enforces it.
 * V2 adds the field to those two members; nothing else has to move.
 */

import { typeLabel, type GeneratableType } from '@/data/aiAssessmentGeneration'
import { ORG_USERS } from '@/data/orgUsers'
import { QUIZ_SAMPLES, type ImageChoiceQuestion } from '@/pages/quiz-lab/quizData'
import type { CorrectAnswer } from '@/pages/chart-lab/chartLabData'

/** The Quiz Lab's image question, so the results describe the question learners see there. */
const IMAGE_SAMPLE = QUIZ_SAMPLES['image-choice'] as ImageChoiceQuestion

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
  /** Image options (DES-345): every image picked, since several can be right.
      `optionIndex` then holds the first of them. */
  picks?: number[]
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
  /** What the learner was asked. For every format but one this is the whole of it:
   *  aiAssessmentGeneration writes a single string and uses it as the title, the
   *  question text and the interactive prompt alike. */
  title: string
  /** Only a situational test has something else to say — a scenario the questions run
   *  on, which is not a paraphrase of its title but the setup for it. */
  prompt?: string
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
  /** Multiple choice with image options (DES-345): the images, in the admin's order,
      and every right one. `options` then holds each image's label, empty when it has none. */
  optionImages?: string[]
  correctIndices?: number[]
  /** Match the pairs, sequence and categorise: the right arrangement, shown under the
      correct / incorrect split. Scoring is all or nothing, so this is the whole answer. */
  answer?: CorrectAnswer
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
  /** A lesson quiz with a question bank: each attempt shows this many of `questions`,
      randomly chosen, so learners answer different sets. Absent, everyone gets them all.
      A question a learner was not given holds NOT_DRAWN in their `picks`. */
  drawCount?: number
  responses: MultiResponse[]
}

/** In a learner's `picks`: a bank question their attempt did not include. */
export const NOT_DRAWN = -1

/** How many questions one attempt shows: the bank's draw, or every question. */
export function perAttempt(a: MultiAssessment): number {
  return a.drawCount ?? a.questions.length
}

/** How many learners were given question `qi`. With no bank, everyone who responded. */
export function answeredCount(a: MultiAssessment, qi: number): number {
  return a.responses.filter((r) => r.picks[qi] !== NOT_DRAWN).length
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
    return Math.round((right / (a.responses.length * perAttempt(a))) * 100)
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
/**
 * How many learners chose each option of one question, in option order. The whole
 * distribution rather than only the right answer: a quiz question is a multiple
 * choice underneath, and where the wrong answers went is the finding.
 */
export function questionOptionTally(a: MultiAssessment, qi: number): number[] {
  return a.questions[qi].options.map(
    (_, oi) => a.responses.filter((r) => r.picks[qi] === oi).length,
  )
}

export function questionTally(a: MultiAssessment): number[] {
  return a.questions.map(
    (q, i) => a.responses.filter((r) => r.picks[i] === q.correctIndex).length,
  )
}

/** Votes per option, in option order. */
export function optionTally(a: GradedAssessment | PollAssessment): number[] {
  const tally = a.options.map(() => 0)
  for (const r of a.responses) {
    /* An image question counts every image picked, so its shares need not sum to 100. */
    if ('picks' in r && r.picks) for (const p of r.picks) tally[p] += 1
    else tally[r.optionIndex] += 1
  }
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

/* The org directory has thirteen people in it, which is the right size for the pages that
   read it and far too small here: a course with 128 enrolments whose every assessment
   shows twelve rows cannot demonstrate a search field, a filter or a page control. So the
   thirteen lead the pool — real names, real roles, real avatars — and the rest of the
   cohort is generated behind them. Generated here rather than in ORG_USERS, which People,
   My Team and the user profile all read and would all grow with it. */
const FIRST_NAMES = [
  'Aisha', 'Andrei', 'Beatriz', 'Callum', 'Chiara', 'Daniel', 'Elena', 'Emeka',
  'Farida', 'Felix', 'Grace', 'Hugo', 'Ines', 'Ivan', 'Jasmin', 'Joao',
  'Katya', 'Liam', 'Lucia', 'Malik', 'Marta', 'Mateo', 'Nadia', 'Niall',
  'Olga', 'Omar', 'Petra', 'Rafael', 'Rania', 'Ruben', 'Sofia', 'Tomas',
  'Ursula', 'Viktor', 'Yara', 'Zoe',
]

const LAST_NAMES = [
  'Almeida', 'Bakker', 'Costa', 'Duarte', 'Egan', 'Fischer', 'Gallagher', 'Haddad',
  'Ibrahim', 'Jensen', 'Kowalski', 'Lindqvist', 'Moreau', 'Novak', 'Oyelaran', 'Petrov',
  'Quintana', 'Reyes', 'Silva', 'Tanaka', 'Ustinov', 'Varga', 'Whelan', 'Zielinski',
]

/* Spread across the org so the pool reads as a company rather than a department. */
const ROLES = [
  'Customer Support Specialist', 'Operations Manager', 'Software Engineer', 'Marketing Lead',
  'Data Analyst', 'UX Designer', 'Sales Representative', 'People Operations',
  'Compliance Officer', 'Finance Manager', 'Product Manager', 'L&D Coordinator',
  'Account Executive', 'Recruiter', 'Site Supervisor', 'Quality Lead',
]

/** How many of the 128 enrolled have answered anything at all. */
const RESPONDERS = 118

/** The responder pool: the org directory first, then the rest of the cohort. */
const pool: ResponseLearner[] = [
  ...ORG_USERS.map((u, i) => ({
    id: `L${i + 1}`,
    name: u.name,
    role: u.role ?? 'Team member',
    initials: u.initials,
    avatar: u.avatar,
  })),
  /* No avatar, so these fall to the initials chip every avatar site here already draws.
     Deterministic: the same name lands in the same place on every reload, which is what
     lets the counts below be written down rather than discovered. */
  ...Array.from({ length: RESPONDERS - ORG_USERS.length }, (_, n) => {
    const first = FIRST_NAMES[(n * 7) % FIRST_NAMES.length]
    const last = LAST_NAMES[(n * 5 + Math.floor(n / LAST_NAMES.length)) % LAST_NAMES.length]
    return {
      id: `L${ORG_USERS.length + n + 1}`,
      name: `${first} ${last}`,
      role: ROLES[n % ROLES.length],
      initials: `${first[0]}${last[0]}`,
    }
  }),
]

const DATES = [
  'Aug 12, 2026', 'Aug 13, 2026', 'Aug 14, 2026', 'Aug 15, 2026',
  'Aug 18, 2026', 'Aug 19, 2026', 'Aug 20, 2026', 'Aug 21, 2026',
]

/** Deterministic pseudo-random so the mock is stable across reloads. */
const seed = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0)

/** Whether response `i` of `count` is one of the `rightCount` right ones. Spreads them
    evenly through the list, so every page (the first above all) mixes right and wrong
    while the total stays exactly `rightCount`. */
const isRight = (i: number, count: number, rightCount: number) =>
  Math.floor(((i + 1) * rightCount) / count) > Math.floor((i * rightCount) / count)

/** `count` responses to a graded question, with `rightCount` of them correct. */
function choices(id: string, count: number, rightCount: number, options: number, correctIndex: number): ChoiceResponse[] {
  return pool.slice(0, count).map((learner, i) => {
    const correct = isRight(i, count, rightCount)
    const wrongPick = (correctIndex + 1 + ((seed(id + learner.id) + i) % (options - 1))) % options
    return {
      learner,
      submittedAt: DATES[(seed(learner.id) + i) % DATES.length],
      optionIndex: correct ? correctIndex : wrongPick,
      correct,
    }
  })
}

/** `count` responses to a question with several right options (images or select all
    that apply), `rightCount` of them the exact correct set. The rest missed one right
    option, added a wrong one, or swapped a right one for a wrong one. */
function imagePicks(id: string, count: number, rightCount: number, images: number, correct: number[]): ChoiceResponse[] {
  const wrong = Array.from({ length: images }, (_, i) => i).filter((i) => !correct.includes(i))
  /* Counts the wrong answers so far, so consecutive ones take turns through the three
     kinds and through which option was missed or added. */
  let w = 0
  return pool.slice(0, count).map((learner, i) => {
    const right = isRight(i, count, rightCount)
    const missed = correct.filter((_, k) => k !== w % correct.length)
    const extra = wrong[(w + seed(id)) % wrong.length]
    const picks = right
      ? correct
      : [missed, [...correct, extra], [...missed, extra]][w++ % 3].sort((x, y) => x - y)
    return {
      learner,
      submittedAt: DATES[(seed(learner.id) + i) % DATES.length],
      optionIndex: picks[0],
      correct: right,
      picks,
    }
  })
}

/* One run through a scenario per learner.
 *
 * `easiness[q]` is roughly how many of the pool get question q right, and a learner's
 * rank (their position shuffled, so strong and weak share every page) is roughly how
 * well they do — but both are wobbled per question,
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
      /* 37 is prime and no count here is a multiple of it, so this visits every rank once. */
      const rank = (i * 37) % count
      const grip = rank + ((seed(id + learner.id) + qi * 3) % 7) - 3
      if (grip < easiness[qi]) return q.correctIndex
      const n = q.options.length
      return (q.correctIndex + 1 + ((seed(id + learner.id) + qi) % (n - 1))) % n
    }),
  }))
}

/** `runs` for a lesson quiz with a question bank: each learner is given `draw` of the
    questions, a different set per learner, and the rest are NOT_DRAWN. */
function bankRuns(id: string, count: number, questions: MultiQuestion[], easiness: number[], draw: number): MultiResponse[] {
  return runs(id, count, questions, easiness).map((r, i) => {
    /* Deterministic: a seeded shuffle of the bank, first `draw` taken. */
    const order = questions.map((_, qi) => qi)
    let s = seed(id + r.learner.id) * 31 + i
    for (let k = order.length - 1; k > 0; k--) {
      s = (Math.imul(s, 1103515245) + 12345) >>> 0
      const j = s % (k + 1)
      ;[order[k], order[j]] = [order[j], order[k]]
    }
    const drawn = new Set(order.slice(0, draw))
    return { ...r, picks: r.picks.map((p, qi) => (drawn.has(qi) ? p : NOT_DRAWN)) }
  })
}

function votes(id: string, count: number, options: number): VoteResponse[] {
  return pool.slice(0, count).map((learner, i) => ({
    learner,
    submittedAt: DATES[(seed(learner.id) + i) % DATES.length],
    optionIndex: (seed(id + learner.id) + i) % options,
  }))
}

const FILE_NAMES = [
  'culture-plan-q3.pdf', 'team-actions.docx', 'ops-culture-plan.pdf', 'my-plan.pdf',
  'culture_workshop_notes.pdf', 'action-plan-final.pdf', 'team-charter.docx',
  'reinforce-and-change.pdf', 'q3-culture-actions.pdf', 'one-page-plan.docx',
]

const FILE_SIZES = ['248 KB', '96 KB', '1.2 MB', '310 KB', '2.4 MB', '187 KB', '412 KB', '73 KB']

function texts(answers: string[]): TextResponse[] {
  return answers.map((text, i) => ({
    learner: pool[i],
    submittedAt: DATES[(seed(pool[i].id) + i) % DATES.length],
    text,
  }))
}

/** A learner yet to answer, on the short-text and exercise answers tables. Kept out of
    `responses`, which every count reads. */
export interface NotAnswered {
  learner: ResponseLearner
  notAnswered: true
}

/** Everyone in the pool, answered or not, spread evenly so each page mixes both. */
export function answerRows<T extends { learner: ResponseLearner }>(responses: T[]): (T | NotAnswered)[] {
  const missing = pool.slice(responses.length)
  const total = responses.length + missing.length
  let r = 0
  let m = 0
  return Array.from({ length: total }, (_, i) =>
    isRight(i, total, responses.length)
      ? responses[r++]
      : { learner: missing[m++], notAnswered: true as const },
  )
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
    prompt: 'What would tell you the culture actually changed?',
    options: [
      'The log has entries every week',
      'New joiners can say where decisions live',
      'Nobody raises it any more',
      'Meeting attendance goes up',
    ],
    correctIndex: 1,
  },
]

/* ── Lesson quiz questions ────────────────────────────────────────────────
   Hoisted because the assessment and its responses are built from the same list:
   a pick is only right or wrong against the question it answers. */
/* One sentence, three blanks. Each "question" is a blank, and its prompt is the clause
   the blank sits in rather than the whole sentence — printing the sentence three times
   would give away the other two answers. */
const CULTURE_SENTENCE: MultiQuestion[] = [
  {
    prompt: 'A team’s culture is what gets ___',
    options: ['rewarded', 'written', 'announced', 'measured'],
    correctIndex: 0,
  },
  {
    prompt: '… not what gets ___',
    options: ['said', 'done', 'funded', 'repeated'],
    correctIndex: 0,
  },
  {
    prompt: '… and new joiners read it from ___',
    options: ['behaviour', 'the handbook', 'the values page', 'the all-hands'],
    correctIndex: 0,
  },
]

/* The definition of psychological safety, four blanks. A fill-in-the-blanks always
   runs to several gaps, so this is split the same way as the culture sentence: each
   blank's prompt is the clause it sits in. */
const DEFINITION_SENTENCE: MultiQuestion[] = [
  {
    prompt: 'Psychological safety is a shared belief that the team is safe for ___ risk-taking',
    options: ['interpersonal', 'commercial', 'operational', 'reputational'],
    correctIndex: 0,
  },
  {
    prompt: '… where people can ___',
    options: ['speak up', 'work remotely', 'skip meetings', 'avoid conflict'],
    correctIndex: 0,
  },
  {
    prompt: '… without fear of ___',
    options: ['punishment', 'deadlines', 'audits', 'overtime'],
    correctIndex: 0,
  },
  {
    prompt: '… and mistakes are treated as ___',
    options: ['learning', 'failures', 'exceptions', 'risks'],
    correctIndex: 0,
  },
]

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
  {
    prompt: 'A manager praises speed but promotes the person who never misses a detail. Which value will the team adopt?',
    options: [
      'Speed, because it is said most often',
      'Attention to detail, because it is rewarded',
      'Both equally',
      'Neither, until it is written down',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'What is the quickest way to change a team habit that undercuts a stated value?',
    options: [
      'Restate the value at the next all-hands',
      'Change what happens when the habit shows up',
      'Add the value to the performance review form',
      'Run a workshop on the value',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'Which signal shows a value is actually lived?',
    options: [
      'It appears in the company handbook',
      'People act on it when it costs them something',
      'Leaders mention it in every meeting',
      'It is printed on the office walls',
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

/** The format's name as the list and the page header show it. Select all that apply is
    Multiple Choice with several right options, and the admin should see which it is. */
export function formatName(a: AssessmentResult): string {
  if (a.lesson) return 'Lesson Quiz'
  if (a.kind === 'graded' && a.correctIndices && !a.optionImages) return 'Select All That Apply'
  return typeLabel(a.type)
}

export const courseAssessments: AssessmentResult[] = [
  /* A lesson quiz surfaced on the first page of the list — the check at the end of a
     lesson (no prompt of its own; the row names the lesson). This one has a question
     bank: six questions, three per attempt, so learners answer different sets. */
  {
    id: 'q1',
    kind: 'multi',
    type: 'single-choice',
    title: 'Which of these tells you most about a team’s real culture?',
    lesson: 'Culture is a system, not a slogan',
    prompt: '',
    enrolled: ENROLLED,
    questions: QUIZ_CULTURE,
    drawCount: 3,
    responses: bankRuns('q1', 109, QUIZ_CULTURE, [82, 64, 73, 58, 49, 77], 3),
  },
  {
    id: 'a1',
    kind: 'graded',
    type: 'single-choice',
    title: 'Which behaviour best signals psychological safety in a team meeting?',
    enrolled: ENROLLED,
    options: [
      'Everyone agrees quickly so the meeting ends on time',
      'A junior colleague challenges a senior decision and is thanked for it',
      'The manager summarises and no one adds anything',
      'Disagreements are moved to a private channel afterwards',
    ],
    correctIndex: 1,
    responses: choices('a1', 112, 84, 4, 1),
  },
  /* Image options (DES-345): the images are the answers, and three of six are right. */
  {
    id: 'a1i',
    kind: 'graded',
    type: 'image-choice',
    title: QUIZ_SAMPLES['image-choice'].prompt,
    enrolled: ENROLLED,
    options: IMAGE_SAMPLE.images.map((_, i) => IMAGE_SAMPLE.labels?.[i] ?? ''),
    correctIndex: IMAGE_SAMPLE.correctIndices[0],
    optionImages: IMAGE_SAMPLE.images,
    correctIndices: IMAGE_SAMPLE.correctIndices,
    responses: imagePicks('a1i', 104, 71, IMAGE_SAMPLE.images.length, IMAGE_SAMPLE.correctIndices),
  },
  /* Select all that apply: three of five are right, and only the exact set scores. */
  {
    id: 'a1m',
    kind: 'graded',
    type: 'single-choice',
    title: 'Which of these help a new joiner feel safe to speak up? Select all that apply.',
    enrolled: ENROLLED,
    options: [
      'Their manager asks for their view first in meetings',
      'Mistakes are only discussed in private',
      'Questions get a real answer, not a brush-off',
      'Someone thanks them when they flag a problem',
      'Decisions are made before the meeting',
    ],
    correctIndex: 0,
    correctIndices: [0, 2, 3],
    responses: imagePicks('a1m', 98, 54, 5, [0, 2, 3]),
  },
  {
    id: 'a2',
    kind: 'text',
    type: 'short-text',
    title: 'Describe one ritual your team could adopt to reinforce the values in this course.',
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
      'A standing "what nearly went wrong" item. Not incidents — near misses. The stuff nobody reports because it worked out in the end.',
      'Ten minutes at the end of every retro where the manager leaves the room and someone else writes up what was said. We tried this once after a project went badly and it was the only time I have seen people say what they actually thought. It should not have taken a disaster to get there, and it should not have stopped when the project ended. The write-up went to the manager afterwards with no names on it, which is what made it safe.',
      'Swap the weekly status update for a weekly "what I am stuck on" update. Same meeting, opposite question.',
      'Pair a new joiner with someone outside their function for the first month.',
      'We run a Friday demo. I would add a rule that at least one thing shown has to be unfinished.',
      'Nothing new. We have too many rituals already and half of them are theatre. I would rather we cancelled two and did the remaining ones properly. The stand-up has become a status report to the manager, the retro has become a list of things other teams should fix, and the demo has become a rehearsal. Fixing those three would do more than adding a fourth.',
      'A monthly session where someone walks through a decision they got wrong and what they would do differently.',
      'Written decision log. Every non-obvious call gets three lines: what we chose, what we rejected, why.',
      'Rotate the note-taker. It sounds trivial but whoever writes the notes decides what the meeting was about.',
      'Ask the question "who is not in this conversation who should be?" before any decision gets made.',
      'A no-agenda 30 minutes each fortnight. Half the useful things I know came out of conversations nobody scheduled, and we have engineered all of those out of the week in the name of focus time. I am not arguing against focus time. I am arguing that we removed the thing it was crowding out and never replaced it.',
      'Start the month by naming one behaviour we want more of, and end it by saying honestly whether we saw it.',
      'Onboarding buddy, but the buddy is measured on it. Otherwise it is the first thing that gets dropped.',
      'Have managers share their own feedback from their manager, redacted where they need to. Nobody believes feedback is safe until they have seen their boss receive some.',
      'A quarterly "assumptions review" — what did we believe three months ago that turned out to be wrong?',
      'Skip-level 1:1s on a fixed rota rather than on request. Requesting one is already a signal.',
      'Every new person writes down what confused them in week one, and we fix the top three before the next hire.',
      'I do not think a ritual fixes this. The behaviour follows what gets promoted, and until that changes the rest is decoration.',
      'A shared channel where anyone can post a decision they disagree with, and the decision owner has to reply.',
      'Team charter review every six months, with the new joiners leading it since they can still see it clearly.',
      'Fifteen minutes at the start of every project to write down how we will know if this goes wrong.',
      'Make praise specific in public and criticism specific in private. We currently do the reverse — vague praise in the all-hands and vague concern in the corridor.',
      'A "one thing I changed my mind about" round at the monthly team meeting.',
      'We could use the retro to look at how we made the decision, not just at what happened after it.',
      'Give everyone a standing invitation to the planning meeting and stop treating attendance as a status marker.',
      'A rotating chair for the weekly meeting, and the chair sets the agenda. Two weeks in you find out very quickly whose questions never got asked before, because the meeting looks completely different depending on who is running it.',
      'Publish the roadmap changes with reasons attached. Right now they appear and everyone reverse-engineers the reason.',
      'Ask leavers what they would have said six months earlier if they had felt able to.',
      'Nothing formal — I would just want managers to answer the questions they get asked instead of taking them away.',
      'A weekly fifteen minutes where the team reviews one piece of customer feedback together, unedited.',
    ]),
  },
  {
    id: 'a3',
    kind: 'poll',
    type: 'poll',
    title: 'Which part of our culture needs the most attention right now?',
    enrolled: ENROLLED,
    options: ['Giving feedback', 'Recognising good work', 'Decision transparency', 'Work-life boundaries'],
    responses: votes('a3', 96, 4),
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
    responses: runs('a4', 88, EXCLUDED_HIRE, [36, 62, 71, 27, 62, 71, 44, 79]),
  },
  {
    id: 'a5',
    kind: 'file',
    type: 'exercise',
    title: 'Upload a one-page action plan for your team, covering one behaviour to reinforce and one to change.',
    enrolled: ENROLLED,
    /* Fewest of any format: an upload is the most work the course asks for. */
    responses: pool.slice(0, 47).map((learner, i) => ({
      learner,
      submittedAt: DATES[(seed(learner.id) + i) % DATES.length],
      fileName: FILE_NAMES[i % FILE_NAMES.length],
      fileKind: FILE_NAMES[i % FILE_NAMES.length].endsWith('.docx') ? 'DOCX' : 'PDF',
      fileSize: FILE_SIZES[(seed(learner.id) + i) % FILE_SIZES.length],
    })),
  },
  {
    id: 'a6',
    kind: 'graded',
    type: 'match-pairs',
    title: 'Match each culture lever to the outcome it most directly drives.',
    enrolled: ENROLLED,
    options: ['4 of 4 pairs correct', '3 of 4 pairs correct', '2 of 4 pairs correct', '1 of 4 pairs correct'],
    correctIndex: 0,
    answer: {
      kind: 'matches',
      pairs: [
        ['Decision log', 'Fewer surprises for new joiners'],
        ['Regular retros', 'Problems raised early'],
        ['Recognising candour', 'More disagreement in reviews'],
        ['Clear ownership', 'Faster decisions'],
      ],
    },
    responses: choices('a6', 91, 61, 4, 0),
  },
  {
    id: 'a7',
    kind: 'graded',
    type: 'sequencing',
    title: 'Put the steps of a culture change rollout in the right order.',
    enrolled: ENROLLED,
    options: ['5 of 5 steps in order', '4 of 5 steps in order', '3 of 5 steps in order', '2 of 5 steps in order'],
    correctIndex: 0,
    answer: {
      kind: 'steps',
      steps: [
        'Listen to how the team works today',
        'Name the behaviours to change',
        'Pilot the change with one team',
        'Communicate it to everyone',
        'Review what changed after a month',
      ],
    },
    responses: choices('a7', 84, 32, 4, 0),
  },
  {
    id: 'a8',
    kind: 'graded',
    type: 'categorization',
    title: 'Sort each observed behaviour into Reinforce or Redirect.',
    enrolled: ENROLLED,
    options: ['6 of 6 sorted correctly', '5 of 6 sorted correctly', '4 of 6 sorted correctly', '3 of 6 sorted correctly'],
    correctIndex: 0,
    answer: {
      kind: 'groups',
      groups: [
        { label: 'Reinforce', items: ['Raising a risk early', 'Crediting a teammate’s idea', 'Admitting a mistake in a retro'] },
        { label: 'Redirect', items: ['Deciding in a private chat', 'Interrupting a quieter colleague', 'Blaming a person, not the process'] },
      ],
    },
    responses: choices('a8', 79, 56, 4, 0),
  },
  {
    id: 'a9',
    kind: 'multi',
    type: 'fill-blank',
    title:
      'Complete the definition: psychological safety is a shared belief that the team is safe for ___ risk-taking, where people can ___ without fear of ___, and mistakes are treated as ___.',
    enrolled: ENROLLED,
    questions: DEFINITION_SENTENCE,
    responses: runs('a9', 104, DEFINITION_SENTENCE, [95, 74, 83, 61]),
  },
  {
    id: 'a10',
    kind: 'multi',
    type: 'fill-blank',
    title:
      'Complete the sentence: a team’s culture is what gets ___, not what gets ___, and new joiners read it from ___.',
    enrolled: ENROLLED,
    questions: CULTURE_SENTENCE,
    responses: runs('a10', 97, CULTURE_SENTENCE, [78, 54, 61]),
  },

  /* ── Lesson quizzes ──────────────────────────────────────────────────────
     The check at the end of a lesson rather than an assessment the admin placed on
     the course, and two or three questions rather than one — so they take the same
     multi-question shape as the situational test, and the row names the lesson they
     close. No prompt of their own: the questions are the whole of them. */
  {
    id: 'q2',
    kind: 'multi',
    type: 'single-choice',
    title: 'Which sentence describes behaviour rather than character?',
    lesson: 'Naming what you see without blame',
    prompt: '',
    enrolled: ENROLLED,
    questions: QUIZ_BEHAVIOUR,
    responses: runs('q2', 101, QUIZ_BEHAVIOUR, [73, 55]),
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
    responses: runs('q3', 94, QUIZ_FEEDBACK, [56, 47, 66]),
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
    responses: runs('q4', 106, QUIZ_DECISIONS, [62, 44]),
  },
]

/* Every figure below is counted off the assessments the summary is about, the same rule
   attentionSummary states: prose that carries a number it did not count will eventually
   contradict the chart printed beside it. */
function tallyOf(id: string): { right: number; of: number } {
  const a = courseAssessments.find((x) => x.id === id)
  if (!a || a.kind !== 'graded') return { right: 0, of: 0 }
  return { right: a.responses.filter((r) => r.correct).length, of: a.responses.length }
}

/** How many got the opening question of a multi-question assessment wrong. */
function missedFirst(id: string): { missed: number; of: number } {
  const a = courseAssessments.find((x) => x.id === id)
  if (!a || a.kind !== 'multi') return { missed: 0, of: 0 }
  const correct = a.questions[0].correctIndex
  return {
    missed: a.responses.filter((r) => r.picks[0] !== correct).length,
    of: a.responses.length,
  }
}

/** How many got one blank (or question) of a multi-question assessment right. */
function rightOn(id: string, qi: number): { right: number; of: number } {
  const a = courseAssessments.find((x) => x.id === id)
  if (!a || a.kind !== 'multi') return { right: 0, of: 0 }
  return { right: questionTally(a)[qi], of: a.responses.length }
}

const SEQUENCE = tallyOf('a7')
/* The definition's key term — the first blank. The sentence below claims the definition
   is secure, which is a claim about the term, not about every clause around it. */
const DEFINITION = rightOn('a9', 0)
const OPENING = missedFirst('a4')

export const courseInsight: CourseInsight = {
  generatedAt: null,
  struggled:
    `Sequencing a culture rollout is the weakest area: only ${SEQUENCE.right} of ${SEQUENCE.of} put the steps in the right order, and most started with communication rather than with listening. The situational test shows the same instinct — on its opening question ${OPENING.missed} of ${OPENING.of} acted or reassured, escalating to her manager, adding her to every meeting or calling it normal, rather than asking for a specific example first. Both point at a bias toward acting before diagnosing.`,
  mastered:
    `The definition of psychological safety is secure (${DEFINITION.right} of ${DEFINITION.of} named its key term, interpersonal risk-taking), and learners reliably recognise it in behaviour rather than in policy. Free-text answers are notably concrete — most proposed a ritual with a named owner and a cadence rather than a general intention, which suggests the practical framing in lessons 3 and 4 landed.`,
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
    return `${multiScore(a, a.responses[i])} of ${perAttempt(a)} correct`
  return a.responses[i].fileName
}

function verdict(a: AssessmentResult, i: number): boolean | null {
  return a.kind === 'graded' ? a.responses[i].correct : null
}

/**
 * The course's pass score, as stated on its own header (CourseDetails.tsx). A score
 * under this is a fail — and a fail, not a score short of perfect, is the thing an
 * admin is scanning for.
 */
export const PASS_SCORE = 80

/**
 * One learner's score on one assessment, 0–100, or null where the format records no
 * score at all: a poll has no right answer, and short text and exercise are not marked.
 *
 * The banded formats state their own fraction in the band they landed in ("3 of 4 pairs
 * correct"), so the number is read from there rather than inferred from the band's
 * position in the list.
 */
export function answerScore(x: LearnerAnswer): number | null {
  if (x.partial) return Math.round((x.partial.correct / x.partial.of) * 100)
  if (x.correct === null) return null
  if (hasStatedAnswer(x.assessment)) return x.correct ? 100 : 0
  const band = /^(\d+) of (\d+)/.exec(x.answer)
  return band ? Math.round((Number(band[1]) / Number(band[2])) * 100) : x.correct ? 100 : 0
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
        ? { partial: { correct: multiScore(a, a.responses[i]), of: perAttempt(a) } }
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
          /* A bank question this learner was not given has no answer to export. */
          if (r.picks[qi] === NOT_DRAWN) return
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
