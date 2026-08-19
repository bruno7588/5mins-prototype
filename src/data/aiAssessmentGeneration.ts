import type { AssessmentType } from '@/pages/your-courses/components/AddContentSidebar/AddContentSidebar'
import { TYPE_CONFIG, type InteractiveQuestionType } from '@/data/interactiveQuestions'

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
  'single-choice': 'Single Choice',
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
  text: string
  options: string[]
  correctIndex: number
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

/* Scenario openers, and the decision each question turns on. A situational test is
   one continuous scenario, so the questions step through it rather than each one
   restating it. */
const SITUATION_BEATS: [string, string[]][] = [
  ['A colleague asks you to bend the process "just this once". What do you do first?',
    ['Agree — it saves everyone time', 'Ask what they are trying to achieve', 'Escalate immediately', 'Say nothing and carry on']],
  ['The shortcut would work, but nobody has recorded it. What matters most here?',
    ['Speed', 'That the decision is written down', 'Keeping your colleague happy', 'Waiting for someone else to decide']],
  ['You spot something that looks wrong an hour later. What is the right next step?',
    ['Fix it quietly', 'Raise it with your manager', 'Wait to see if anyone notices', 'Log it and move on']],
  ['Your manager is unavailable and the deadline is today. What do you do?',
    ['Make the call and document your reasoning', 'Miss the deadline to be safe', 'Ask a peer to approve it', 'Guess what your manager would want']],
  ['A customer asks you to confirm something you are not sure about. How do you answer?',
    ['Confirm it to keep them happy', 'Say you will check and come back', 'Redirect them elsewhere', 'Give your best guess']],
  ['The same issue comes up a third time this month. What does that tell you?',
    ['It is bad luck', 'The process needs changing', 'Someone is not following it', 'It is not your problem']],
  ['You are asked to explain the decision afterwards. What is most useful?',
    ['What you decided', 'What you decided and why', 'Who else agreed', 'How long it took']],
  ['What would you do differently next time?',
    ['Nothing — it worked out', 'Check earlier, before committing', 'Escalate sooner', 'Ask for the rule in writing']],
]

const TEST_TITLES = [
  'Putting it into practice',
  'A week on the floor',
  'The call you have to make',
]

/**
 * One situational test for the whole course, not one per lesson — it is a single
 * scenario the learner is dropped into, and every transcribed lesson feeds it.
 * Comes out shaped exactly like a hand-authored one: a title, a brief, and 6–8
 * questions.
 */
/** The course's own framing, which the brief is written against alongside the
 *  lesson transcripts. Both fields are optional in practice — a course can be
 *  outlined before it's titled. */
export interface CourseContext {
  title: string
  description: string
}

const firstSentence = (text: string) => text.split(/(?<=[.!?])\s/)[0].replace(/[.!?]$/, '')
const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1)

export function generateSituationalTest(
  lessons: TranscriptSource[],
  course?: CourseContext,
): GeneratedAssessment {
  const count = between(6, 8)
  const questions = SITUATION_BEATS.slice(0, count).map(([text, options]) => ({
    text,
    options,
    correctIndex: 1,
  }))

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
  if (types.includes('situational-test')) return [generateSituationalTest(lessons, course)]

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
