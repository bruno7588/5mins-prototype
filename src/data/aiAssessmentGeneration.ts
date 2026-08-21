import type { AssessmentType } from '@/pages/your-courses/components/AddContentSidebar/AddContentSidebar'
import {
  TYPE_CONFIG,
  type InteractiveQuestion,
  type InteractiveQuestionType,
} from '@/data/interactiveQuestions'

/**
 * Mock backend for the AI assessment generator (DES-279).
 *
 * Everything here stands in for work the real feature does server-side: deciding
 * which lessons have a transcript to read, and turning those transcripts into
 * draft assessments. The shapes are the ones the outline already uses, so a real
 * backend can replace this file without the UI changing.
 */

/** The nine types the generator can produce — the four classic assessments, the
 *  four interactive formats, and situational tests. */
export type GeneratableType = AssessmentType | InteractiveQuestionType | 'situational-test'

/**
 * Which half of the rail the generator was opened from. Situational tests are their
 * own content type in the builder — their own rail entry, their own drawer, their own
 * outline card — so generating them is its own action rather than a ninth chip inside
 * the assessments picker.
 */
export type GenerationScope = 'assessments' | 'situational'

/* The eight assessment formats, ordered as the rail orders them: most-reached-for
   first, then by how much writing each one asks for. */
export const ASSESSMENT_TYPES: GeneratableType[] = [
  'single-choice',
  'match-pairs',
  'sequencing',
  'categorization',
  'fill-blank',
  'short-text',
  'exercise',
  'poll',
]

export const TYPES_BY_SCOPE: Record<GenerationScope, GeneratableType[]> = {
  assessments: ASSESSMENT_TYPES,
  situational: ['situational-test'],
}

/** The outline card type each scope produces — also how a generated row is
 *  attributed back to a scope, since the two never share a card type. */
export const CARD_TYPE_BY_SCOPE: Record<GenerationScope, 'Assessment' | 'SituationalTest'> = {
  assessments: 'Assessment',
  situational: 'SituationalTest',
}

export const GENERATABLE_TYPES: GeneratableType[] = [
  ...ASSESSMENT_TYPES,
  'situational-test',
]

const CLASSIC_LABELS: Record<AssessmentType, string> = {
  'single-choice': 'Multiple Choice',
  'short-text': 'Short Text',
  exercise: 'Exercise',
  poll: 'Poll',
}

export function typeLabel(type: GeneratableType): string {
  if (type === 'situational-test') return 'Situational Test'
  if (type in CLASSIC_LABELS) return CLASSIC_LABELS[type as AssessmentType]
  return TYPE_CONFIG[type as InteractiveQuestionType].label
}

/* --- Transcript coverage ---------------------------------------------------
   Only lessons carry transcripts. SCORM packages are opaque to us — we hold the
   file, not its script — so they never count towards coverage, and neither do
   assessments already on the outline. Within the 5Mins library, these three are
   the mock's untranscribed lessons, so partial coverage (FR-04) is reachable
   without having to construct it. */
const LESSONS_WITHOUT_TRANSCRIPT = new Set([5008, 5009, 5010])

export interface TranscriptSource {
  id: number
  title: string
}

/**
 * What the admin told the generator beyond the course itself (situational scope).
 * Both are free text and both are optional: with neither, the generator works from
 * the course content alone.
 */
export interface GenerationPrompt {
  /** Who is taking the test — shapes who the scenarios are written for. */
  audience?: string
  /** Tone, constraints, things to avoid. */
  instructions?: string
}

export interface CoverageReport {
  withTranscript: TranscriptSource[]
  withoutTranscript: TranscriptSource[]
}

interface OutlineItemLike {
  id: number
  type: string
  title: string
}

/** Splits the outline's lessons into what the generator can read and what it can't. */
export function transcriptCoverage(items: OutlineItemLike[]): CoverageReport {
  const withTranscript: TranscriptSource[] = []
  const withoutTranscript: TranscriptSource[] = []
  for (const item of items) {
    if (item.type !== 'Lesson' && item.type !== 'LibraryLesson') continue
    const source = { id: item.id, title: item.title }
    if (LESSONS_WITHOUT_TRANSCRIPT.has(item.id)) withoutTranscript.push(source)
    else withTranscript.push(source)
  }
  return { withTranscript, withoutTranscript }
}

/* --- Draft generation ------------------------------------------------------ */

/* Two stems per type, so regenerating a question visibly returns something else
   rather than the same sentence back. */
const STEMS: Record<Exclude<GeneratableType, 'situational-test'>, [string, string]> = {
  'single-choice': [
    'Which of these best describes the main point of "%s"?',
    'According to "%s", which action should you take first?',
  ],
  'short-text': [
    'In your own words, what is the key takeaway from "%s"?',
    'Describe one thing from "%s" you would do differently tomorrow.',
  ],
  exercise: [
    'Apply what "%s" covers to a situation from your own week.',
    'Write a short plan putting "%s" into practice on your next shift.',
  ],
  poll: [
    'How confident do you feel applying "%s" at work?',
    'How often does the situation in "%s" come up in your role?',
  ],
  'fill-blank': [
    'Complete the key definition from "%s".',
    'Fill in the missing steps from "%s".',
  ],
  'match-pairs': [
    'Match each term from "%s" with its definition.',
    'Pair each situation in "%s" with the right response.',
  ],
  categorization: [
    'Sort these examples from "%s" into the right category.',
    'Place each behaviour from "%s" under the standard it meets.',
  ],
  sequencing: [
    'Put the steps from "%s" back in the right order.',
    'Order the process described in "%s" from first to last.',
  ],
}

export interface GeneratedQuestion {
  /** Which format this question is — what the admin picked, carried through to the
   *  review card and the learner preview so the pick is visible in the output. */
  format: GeneratableType
  text: string
  /** Empty for formats a flat list can't express; `interactive` carries those. */
  options: string[]
  /** -1 where the format has no right answer (poll, and the open-answer formats). */
  correctIndex: number
  interactive?: InteractiveQuestion
}

export interface GeneratedAssessment {
  type: GeneratableType
  title: string
  /** The card's metadata line — the format, and nothing else. */
  metadata: string
  /** FR-12: the lesson this was drafted from. A situational test reads every
   *  transcribed lesson, so it records the first and lists the rest in its brief. */
  sourceLessonId: number
  sourceLessonTitle: string
  /** Situational tests only — the scenario the learner is dropped into. */
  brief?: string
  questions?: GeneratedQuestion[]
}

const pick = <T,>(options: readonly T[]) => options[Math.floor(Math.random() * options.length)]
const between = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))

/** One draft assessment of `type`, written from `lesson`'s transcript. Situational
 *  tests are course-wide, so they go through generateSituationalTest instead. */
export function generateOne(
  type: Exclude<GeneratableType, 'situational-test'>,
  lesson: TranscriptSource,
): GeneratedAssessment {
  return {
    type,
    title: pick(STEMS[type]).replace('%s', lesson.title),
    /* The format, and nothing after it. A count of pairs or blanks is a detail of
       the question rather than something to scan a row for — the line names what
       the card is, and the card is opened to see how big it is. */
    metadata: typeLabel(type),
    sourceLessonId: lesson.id,
    sourceLessonTitle: lesson.title,
  }
}

/* Scenario beats, grouped by the question format each one is written for. A situational
   test is one continuous scenario, so the beats step through the same week rather than
   each restating it — and the admin's picked formats decide which of them get used.

   Formats whose learner UI is a list of options are fully described by `options`. The
   four interactive formats cannot be: a pairing, an order, a sorting or a sentence with
   gaps is a structure, not a list, so those beats carry the real payload the learner
   renderers eat (`@/data/interactiveQuestions`). Short text and exercise carry neither —
   the learner answers in their own words. */
type Beat = {
  text: string
  /** Empty for the interactive formats and for the two open-answer ones. */
  options: string[]
  /** -1 where the format has no right answer — a poll asks, it doesn't mark. */
  correctIndex: number
  interactive?: InteractiveQuestion
}

const BEATS_BY_FORMAT: Partial<Record<GeneratableType, Beat[]>> = {
  'single-choice': [
    {
      text: 'A colleague asks you to bend the process "just this once". What do you do first?',
      options: ['Agree — it saves everyone time', 'Ask what they are trying to achieve', 'Escalate immediately', 'Say nothing and carry on'],
      correctIndex: 1,
    },
    {
      text: 'Your manager is unavailable and the deadline is today. What do you do?',
      options: ['Make the call and document your reasoning', 'Miss the deadline to be safe', 'Ask a peer to approve it', 'Guess what your manager would want'],
      correctIndex: 0,
    },
    {
      text: 'You are asked to explain the decision afterwards. What is most useful?',
      options: ['What you decided', 'What you decided and why', 'Who else agreed', 'How long it took'],
      correctIndex: 1,
    },
    {
      text: 'A customer asks for something the policy does not cover. What is your first move?',
      options: ['Say no and close the conversation', 'Check who owns the policy and ask them', 'Make an exception quietly', 'Promise it and sort it out later'],
      correctIndex: 1,
    },
  ],
  poll: [
    {
      text: 'How confident are you handling this situation unsupervised?',
      options: ['Not at all', 'Somewhat', 'Confident', 'Very confident'],
      correctIndex: -1,
    },
    {
      text: 'How often does something like this come up in your week?',
      options: ['Never', 'Once or twice', 'Most weeks', 'Every day'],
      correctIndex: -1,
    },
  ],
  'short-text': [
    { text: 'In a sentence, how would you justify this decision to your manager?', options: [], correctIndex: -1 },
    { text: 'Write the message you would send the customer to explain the delay.', options: [], correctIndex: -1 },
  ],
  exercise: [
    {
      text: 'The same issue comes up a third time this month. Write down what you would change about the process, and who you would tell.',
      options: [],
      correctIndex: -1,
    },
    {
      text: 'Draft the three lines you would add to the handover note so the next shift is not caught out.',
      options: [],
      correctIndex: -1,
    },
  ],
  sequencing: [
    {
      text: 'Put the steps you would take next in order, starting with the first.',
      options: [],
      correctIndex: -1,
      interactive: {
        type: 'sequencing',
        prompt: 'Put the steps you would take next in order, starting with the first.',
        steps: ['Check what the rule actually says', 'Tell your manager what you are about to do', 'Act on the decision', 'Log what you did and why'],
      },
    },
    {
      text: 'Order the way you would handle the customer, from first contact to close.',
      options: [],
      correctIndex: -1,
      interactive: {
        type: 'sequencing',
        prompt: 'Order the way you would handle the customer, from first contact to close.',
        steps: ['Acknowledge them', 'Find out what actually happened', 'Agree the fix and the timing', 'Confirm it in writing'],
      },
    },
    {
      text: 'Put the response to a possible breach in order.',
      options: [],
      correctIndex: -1,
      interactive: {
        type: 'sequencing',
        prompt: 'Put the response to a possible breach in order.',
        steps: ['Spot the risk', 'Contain it', 'Report it', 'Review what let it happen'],
      },
    },
  ],
  'match-pairs': [
    {
      text: 'Match each situation to the response it calls for.',
      options: [],
      correctIndex: -1,
      interactive: {
        type: 'match-pairs',
        prompt: 'Match each situation to the response it calls for.',
        pairs: [
          { left: 'A customer alleges their data was shared', right: 'Escalate to your manager today' },
          { left: 'A rota clash next week', right: 'Sort it with the team lead' },
          { left: 'A printer that keeps jamming', right: 'Log a facilities ticket' },
          { left: 'A colleague asking to skip a check', right: 'Ask what they are trying to achieve' },
        ],
      },
    },
    {
      text: 'Match each phrase to what it does in a difficult conversation.',
      options: [],
      correctIndex: -1,
      interactive: {
        type: 'match-pairs',
        prompt: 'Match each phrase to what it does in a difficult conversation.',
        pairs: [
          { left: 'Help me understand…', right: 'Opens up the reason' },
          { left: 'What I heard was…', right: 'Checks you got it right' },
          { left: 'Here is what I can do', right: 'Sets the boundary' },
          { left: 'Let me come back to you', right: 'Buys time honestly' },
        ],
      },
    },
    {
      text: 'Match each record to the reason you keep it.',
      options: [],
      correctIndex: -1,
      interactive: {
        type: 'match-pairs',
        prompt: 'Match each record to the reason you keep it.',
        pairs: [
          { left: 'The decision you made', right: 'So it can be explained later' },
          { left: 'Who you told', right: 'So nobody is surprised' },
          { left: 'When you acted', right: 'So the timeline is clear' },
          { left: 'What you were told', right: 'So the source is traceable' },
        ],
      },
    },
  ],
  categorization: [
    {
      text: 'Sort these into what you handle yourself and what you escalate now.',
      options: [],
      correctIndex: -1,
      interactive: {
        type: 'categorization',
        prompt: 'Sort these into what you handle yourself and what you escalate now.',
        categories: [
          { id: 'self', label: 'Handle yourself' },
          { id: 'escalate', label: 'Escalate now' },
        ],
        items: [
          { label: 'A stationery order over budget', categoryId: 'self' },
          { label: 'A customer alleging their data was shared', categoryId: 'escalate' },
          { label: 'A rota clash next week', categoryId: 'self' },
          { label: 'A threat of legal action', categoryId: 'escalate' },
        ],
      },
    },
    {
      text: 'Sort what belongs in the written record from what stays out of it.',
      options: [],
      correctIndex: -1,
      interactive: {
        type: 'categorization',
        prompt: 'Sort what belongs in the written record from what stays out of it.',
        categories: [
          { id: 'record', label: 'Goes in the record' },
          { id: 'out', label: 'Stays out' },
        ],
        items: [
          { label: 'What you decided', categoryId: 'record' },
          { label: 'Why you decided it', categoryId: 'record' },
          { label: 'Your opinion of the colleague', categoryId: 'out' },
          { label: 'Who you notified', categoryId: 'record' },
        ],
      },
    },
    {
      text: 'Sort these into acceptable and not acceptable under the policy.',
      options: [],
      correctIndex: -1,
      interactive: {
        type: 'categorization',
        prompt: 'Sort these into acceptable and not acceptable under the policy.',
        categories: [
          { id: 'ok', label: 'Acceptable' },
          { id: 'no', label: 'Not acceptable' },
        ],
        items: [
          { label: 'Sharing a file through the approved system', categoryId: 'ok' },
          { label: 'Forwarding it to a personal address', categoryId: 'no' },
          { label: 'Asking a manager to approve an exception', categoryId: 'ok' },
          { label: 'Copying data to a USB stick', categoryId: 'no' },
        ],
      },
    },
  ],
  'fill-blank': [
    {
      text: 'Complete the rule you are working to.',
      options: [],
      correctIndex: -1,
      interactive: {
        type: 'fill-blank',
        prompt: 'Complete the rule you are working to.',
        segments: ['Before acting you must always record the ', { blank: 'reason' }, ', and tell your ', { blank: 'manager' }, '.'],
        bank: ['reason', 'manager', 'deadline', 'customer'],
      },
    },
    {
      text: 'Finish the escalation rule.',
      options: [],
      correctIndex: -1,
      interactive: {
        type: 'fill-blank',
        prompt: 'Finish the escalation rule.',
        segments: ['If a customer alleges a data ', { blank: 'breach' }, ', you escalate it the same ', { blank: 'day' }, '.'],
        bank: ['breach', 'day', 'delay', 'month'],
      },
    },
    {
      text: 'Complete the handover line.',
      options: [],
      correctIndex: -1,
      interactive: {
        type: 'fill-blank',
        prompt: 'Complete the handover line.',
        segments: ['The next shift needs to know what you ', { blank: 'decided' }, ' and what is still ', { blank: 'open' }, '.'],
        bank: ['decided', 'open', 'forgot', 'closed'],
      },
    },
  ],
}

const TEST_TITLES = [
  'Putting it into practice',
  'A week on the floor',
  'The call you have to make',
]

/** The course's own framing, which the brief is written against alongside the
 *  lesson transcripts. Both fields are optional in practice — a course can be
 *  outlined before it's titled. */
export interface CourseContext {
  title: string
  description: string
}

const firstSentence = (text: string) => text.split(/(?<=[.!?])\s/)[0].replace(/[.!?]$/, '')
const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1)

/**
 * One situational test for the whole course, not one per lesson — it is a single
 * scenario the learner is dropped into, and every transcribed lesson feeds it.
 * Comes out shaped exactly like a hand-authored one: a title, a brief, and 6–8
 * questions.
 */
export function generateSituationalTest(
  lessons: TranscriptSource[],
  course?: CourseContext,
  /** The question formats the admin picked. Empty means no preference. */
  formats: GeneratableType[] = [],
): GeneratedAssessment {
  /* Only the picked formats get written. Padding a narrow pick out with formats the
     admin didn't ask for would make the picker decoration — picking Sequence and Match
     the Pairs means a test of sequences and pairs, and nothing else. */
  const picked = formats.filter((f) => f !== 'situational-test')
  const pool = (picked.length ? picked : ASSESSMENT_TYPES).filter((f) => BEATS_BY_FORMAT[f]?.length)
  const supply = pool.map((format) => ({ format, beats: BEATS_BY_FORMAT[format] as Beat[] }))

  /* Round-robin rather than format-by-format, so every picked format appears early and
     the test alternates the way a written one would. A narrow pick runs out of beats
     before it reaches the target — a short test of what was asked for beats a long one
     padded with what wasn't. */
  const target = between(6, 8)
  const questions: GeneratedQuestion[] = []
  for (let round = 0; questions.length < target; round++) {
    const stillHasBeats = supply.filter((s) => round < s.beats.length)
    if (stillHasBeats.length === 0) break
    for (const { format, beats } of stillHasBeats) {
      questions.push(toQuestion(format, beats[round]))
      if (questions.length === target) break
    }
  }

  const named = lessons.map((l) => `"${l.title}"`)
  const sources =
    named.length === 1
      ? named[0]
      : `${named.slice(0, -1).join(', ')} and ${named[named.length - 1]}`

  /* Written from the course's title and description where they exist, and from the
     lessons either way — a course can be outlined before it's named, so the brief
     falls back to the lessons rather than quoting an empty title. */
  const courseTitle = course?.title.trim()
  const courseBlurb = course?.description.trim()
  const opening = courseTitle
    ? `You've just finished "${courseTitle}".`
    : `You're part-way through a busy week.`
  const covered = courseBlurb
    ? ` It covered ${lowerFirst(firstSentence(courseBlurb))}.`
    : ` Over the last few lessons you looked at ${sources}.`

  return {
    type: 'situational-test',
    title: pick(TEST_TITLES),
    metadata: `${questions.length} questions`,
    sourceLessonId: lessons[0].id,
    sourceLessonTitle: lessons[0].title,
    brief:
      `${opening}${covered} Over the next few decisions you'll be asked to apply it — ` +
      `there is rarely a perfect option, so pick the one you could defend afterwards.`,
    questions,
  }
}

const toQuestion = (format: GeneratableType, beat: Beat): GeneratedQuestion => ({
  format,
  text: beat.text,
  options: beat.options,
  correctIndex: beat.correctIndex,
  ...(beat.interactive ? { interactive: beat.interactive } : {}),
})

/**
 * A full set: one or two assessments per transcribed lesson, drawn from the types
 * the admin selected. Quantity is the generator's call, not the admin's (FR-02) —
 * it follows from how much each transcript supports, mocked here as a coin flip.
 */
export function generateSet(
  types: GeneratableType[],
  lessons: TranscriptSource[],
  course?: CourseContext,
): GeneratedAssessment[] {
  if (types.length === 0 || lessons.length === 0) return []

  /* One test for the course, built from every transcribed lesson — not one per
     lesson like the question formats below. */
  if (types.includes('situational-test')) return [generateSituationalTest(lessons, course, types)]

  /* Situational tests returned above, so what's left is the per-lesson formats. */
  const perLesson = types.filter(
    (t): t is Exclude<GeneratableType, 'situational-test'> => t !== 'situational-test',
  )
  const out: GeneratedAssessment[] = []
  let cursor = 0
  for (const lesson of lessons) {
    const count = Math.random() < 0.5 ? 1 : 2
    for (let i = 0; i < count; i++) {
      /* Cycle rather than sample, so every selected type actually appears instead
         of one lucky type filling the whole set. */
      out.push(generateOne(perLesson[cursor % perLesson.length], lesson))
      cursor++
    }
  }
  return out
}
