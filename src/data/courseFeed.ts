import type {
  SituationalQuestion,
  SituationalTestData,
} from '@/pages/your-courses/components/SituationalTestDrawer/SituationalTestDrawer'
import { getCourseDetail } from '@/pages/courses/mockCourse'
import type { ScenarioMediaData } from './scenarioMedia'
import scenarioVideo from '@/assets/gemini_generated_video_e0ecc952.mp4'
import { feedLessons } from '@/pages/for-you/feedItems'

/**
 * Course feed mock data: what a learner plays inside a course, beyond its lessons.
 *
 * First slice: one situational test, shared by every course the way `mockCourse.ts`
 * shares one outline. It is the same shape the course builder saves
 * (`SituationalTestData`), so anything the builder adds to a test reaches the feed
 * without a second model.
 */
/* Placeholder scenario media: a generated scenario clip (src/assets), plus an audio and
   an image stand-in (public/scenario-media). The feed shows the video; add
   ?media=audio, ?media=image or ?media=none to the URL to see the other cases. */
const scenarioMedia: Record<string, ScenarioMediaData> = {
  video: { kind: 'video', src: scenarioVideo, name: 'Scenario video' },
  audio: { kind: 'audio', src: '/scenario-media/scenario-placeholder.m4a', name: 'Scenario audio' },
  image: { kind: 'image', src: '/scenario-media/scenario-placeholder.png', name: 'Scenario image' },
}

const situationalTest: SituationalTestData = {
  id: 1,
  title: 'A guest reports an allergic reaction',
  brief:
    'You are the duty manager on a busy Friday evening. A guest at table 12 tells a server that their lips are tingling after the starter. They told the team about a nut allergy when they ordered. The kitchen is at full stretch and the server who took the order has gone on a break. Decide what you do, in what order, and what you record afterwards.',
  questions: [
    {
      id: 'cf-st-1',
      text: 'The guest says their lips are tingling. What do you do first?',
      options: [
        'Ask the kitchen to check the ticket before doing anything else',
        'Stay with the guest, ask about their symptoms and whether they carry medication',
        'Offer to replace the starter with a nut-free dish',
        'Find the server who took the order',
      ],
      correctIndex: 1,
      explanation: 'The guest comes first. Symptoms can worsen in minutes, so stay with them and find out what help they need.',
    },
    {
      id: 'cf-st-2',
      text: 'The guest starts to struggle with their breathing. What is the right call?',
      options: [
        'Call 999 and say "anaphylaxis", then help them use their auto-injector if they have one',
        'Give them water and wait five minutes to see if it passes',
        'Ask another guest whether anyone is a doctor',
        'Walk them outside for fresh air',
      ],
      correctIndex: 0,
      explanation: 'Breathing difficulty after eating an allergen is an emergency. Call 999 straight away and say "anaphylaxis".',
    },
    {
      id: 'cf-st-3',
      text: 'While you wait for the ambulance, what should the kitchen do with the dish?',
      options: [
        'Throw it away so no one else is served it',
        'Remake it to check whether nuts were used',
        'Keep the dish and its ingredients aside, labelled, for the investigation',
        'Carry on with service and deal with it at close',
      ],
      correctIndex: 2,
      explanation: 'The dish and its ingredients are evidence. Keep them aside and labelled so the cause can be traced.',
    },
    {
      id: 'cf-st-4',
      text: 'The guest has left with the paramedics. What do you record?',
      options: [
        'Nothing until the guest makes a complaint',
        'A note in the shift handover for the next manager',
        'Only the cost of the meal, so it can be refunded',
        'An incident report with the time, what was ordered, what was said about the allergy and what the team did',
      ],
      correctIndex: 3,
      explanation: 'A full incident report, written while it is fresh, protects the guest and the team and is what an investigation will ask for.',
    },
  ],
}

/* Two more tests, one per kind of scenario media, so the feed shows each player:
   an audio call and a still image (Bruno, 2026-11-24). */
const audioTest: SituationalTestData = {
  id: 2,
  title: 'A guest calls about a missed allergy note',
  brief:
    'You are the duty manager. A guest phones the morning after their dinner. They say they wrote their sesame allergy on the booking, but nobody mentioned it at the table and their dessert had a sesame crumb. They felt unwell but did not need help. Listen to the call, then decide how you respond and what you check.',
  media: { kind: 'audio', src: '/scenario-media/scenario-placeholder.m4a', name: 'Guest phone call' },
  questions: [
    {
      id: 'cf-st2-1',
      text: 'What do you say first on the call?',
      options: [
        'Explain that the kitchen is very busy on a Friday',
        'Thank them for calling, apologise, and ask how they are feeling now',
        'Ask them to put the complaint in writing',
        'Offer a free meal before they say anything else',
      ],
      correctIndex: 1,
      explanation: 'Start with the guest: acknowledge it, apologise and check they are well before anything else.',
    },
    {
      id: 'cf-st2-2',
      text: 'What do you check before calling them back?',
      options: [
        'Whether the allergy note on the booking reached the server and the kitchen ticket',
        'Which server was on shift, so they can be disciplined',
        'Whether the guest has complained before',
        'The price of the dessert',
      ],
      correctIndex: 0,
      explanation: 'Trace where the note was lost: booking, server, ticket, kitchen. That is what stops it happening again.',
    },
    {
      id: 'cf-st2-3',
      text: 'What do you record?',
      options: [
        'Nothing, as the guest did not need medical help',
        'A note in the reservations system only',
        'An incident report with the booking note, what was served, what the guest said and what you found',
        'A reminder to be careful next time',
      ],
      correctIndex: 2,
      explanation: 'A reaction is an incident even when it is mild. Record it fully so the gap in the process can be fixed.',
    },
  ],
}

const imageTest: SituationalTestData = {
  id: 3,
  title: 'Checking the allergen board before service',
  brief:
    'You are opening the restaurant for lunch. Look at the allergen information on display. The menu changed this morning: the soup now has celery and the bread is made with a new flour blend. Decide what has to happen before the first guest is seated.',
  media: { kind: 'image', src: '/scenario-media/scenario-placeholder.png', name: 'Allergen board' },
  questions: [
    {
      id: 'cf-st3-1',
      text: 'The board still shows yesterday\'s soup. What do you do?',
      options: [
        'Open on time and tell staff to mention it if asked',
        'Update the allergen information before the first guest is seated',
        'Remove the soup from the menu for the week',
        'Wait for the head chef to update it after service',
      ],
      correctIndex: 1,
      explanation: 'Allergen information must match what is served from the first cover. Update it before you open.',
    },
    {
      id: 'cf-st3-2',
      text: 'Who needs to know about the new flour blend?',
      options: [
        'Only the pastry chef',
        'Only the servers on the lunch shift',
        'The kitchen and front of house, with the allergens it contains',
        'No one, if it is gluten free',
      ],
      correctIndex: 2,
      explanation: 'Everyone who prepares or serves the bread needs the allergens of the new blend, whatever it is.',
    },
  ],
}

/** The situational test a course opens with, if it has one. */
export function getCourseSituationalTest(_courseId: string | undefined): SituationalTestData {
  const demo = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('media')
  return { ...situationalTest, media: demo === 'none' ? undefined : scenarioMedia[demo ?? 'video'] ?? scenarioMedia.video }
}

/** All the situational tests a course opens with, in order: video, audio, image. */
export function getCourseSituationalTests(courseId: string | undefined): SituationalTestData[] {
  return [getCourseSituationalTest(courseId), audioTest, imageTest]
}

/** A course assessment as the feed asks it. Only multiple choice is marked. */
export type FeedAssessment =
  | { type: 'multiple-choice'; prompt: string; options: string[]; correctIndex: number; explanation?: string }
  | { type: 'short-text'; prompt: string }
  | { type: 'exercise'; prompt: string }
  | { type: 'poll'; prompt: string; options: string[] }

export const ASSESSMENT_TYPE_LABEL: Record<FeedAssessment['type'], string> = {
  'multiple-choice': 'Multiple choice',
  'short-text': 'Short text',
  exercise: 'Exercise',
  poll: 'Poll',
}

const courseAssessments: FeedAssessment[] = [
  {
    type: 'multiple-choice',
    prompt: 'Which of these is one of the 14 allergens that must be declared on a UK menu?',
    options: ['Rice', 'Celery', 'Potato', 'Chicken'],
    correctIndex: 1,
    explanation: 'Celery is one of the 14 named allergens, along with nuts, milk, eggs, fish and others.',
  },
  { type: 'short-text', prompt: 'How would you tell a guest that a dish cannot be made safe for their allergy?' },
  { type: 'exercise', prompt: "Upload your allergen matrix for this week's menu" },
  { type: 'poll', prompt: 'Was this course useful for you?', options: ['Very useful', 'Somewhat useful', 'Not useful'] },
]

/* The first lesson's quiz ("Lesson Quiz (1/2)", Figma 17024:80291). */
const lessonQuiz: SituationalQuestion[] = [
  {
    id: 'cf-lq-1',
    text: 'What is the first thing a leader can do to encourage new ideas in a team?',
    options: [
      'Ask for ideas only from senior people',
      'Make it safe to speak up, including when an idea fails',
      'Reward only the ideas that work',
      'Set a target for ideas per month',
    ],
    correctIndex: 1,
    explanation: 'People share ideas when they know a failed one will not count against them.',
  },
  {
    id: 'cf-lq-2',
    text: 'A team member suggests a change you think will not work. What helps innovation most?',
    options: [
      'Explain why it will fail and move on',
      'Ignore it until they raise it again',
      'Ask what problem it solves and try a small test',
      'Pass it to another team',
    ],
    correctIndex: 2,
    explanation: 'A small test costs little and tells you more than an opinion, yours included.',
  },
]

/** One thing the learner plays in the course feed, in course order. */
export type CourseFeedItem =
  | { kind: 'situational-test'; id: string; title: string; test: SituationalTestData }
  | {
      kind: 'assessment'
      id: string
      title: string
      assessment: FeedAssessment
      /** "Question 2/4": its place among the course's assessments. */
      position: number
      count: number
    }
  | {
      kind: 'lesson'
      id: string
      title: string
      /** "Lesson · Dr. Amara Okafor · 6 min", as course details shows it. */
      meta: string
      /** Stands in for the lesson video until the player lands. */
      media: string
      duration: string
      /** Watched fraction, 0-1. */
      progress: number
      /** The lesson quiz that follows the lesson, when it has one. */
      quiz?: SituationalQuestion[]
      /** Points the quiz is worth. */
      quizPoints?: number
    }

/**
 * A course's feed: its situational tests (video, audio, image), its lessons, then its
 * assessments. Events and
 * the end-of-course steps join as their feed phases are built.
 */
export function getCourseFeed(courseId: string | undefined): CourseFeedItem[] {
  const tests = getCourseSituationalTests(courseId)
  const lessons = getCourseDetail(courseId)
    .sections.flatMap((section) => section.lessons)
    .filter((lesson) => !lesson.meta.startsWith('Assessment'))
  return [
    ...tests.map(
      (test, i): CourseFeedItem => ({
        kind: 'situational-test',
        id: i === 0 ? 'situational-test' : `situational-test-${i + 1}`,
        title: test.title,
        test,
      }),
    ),
    ...lessons.map((lesson, i): CourseFeedItem => {
      const stand = feedLessons[i % feedLessons.length]
      return {
        kind: 'lesson',
        id: lesson.id,
        title: lesson.title,
        meta: lesson.meta,
        media: stand.media,
        duration: stand.duration,
        progress: (lesson.progress ?? 0) / 100,
        ...(i === 0 ? { quiz: lessonQuiz, quizPoints: stand.quizPoints } : {}),
      }
    }),
    ...courseAssessments.map(
      (assessment, i): CourseFeedItem => ({
        kind: 'assessment',
        id: `assessment-${i}`,
        title: assessment.prompt,
        assessment,
        position: i + 1,
        count: courseAssessments.length,
      }),
    ),
  ]
}

/**
 * Whether the learner can open item `i`: anything they have reached, plus the one after
 * it once the item they are furthest on is complete. A lesson has no player yet, so it
 * counts as complete on view unless it has a quiz; a quiz, a situational test and an
 * assessment have to be answered through.
 */
export function isFeedItemUnlocked(items: CourseFeedItem[], i: number, reached: number, done: Set<string>): boolean {
  if (i <= reached) return true
  const frontier = items[reached]
  return i === reached + 1 && ((frontier.kind === 'lesson' && !frontier.quiz) || done.has(frontier.id))
}

/** Why the next item is locked, as the feed's tooltip says it (Figma 17024:82817). */
export const lockedReason = (item: CourseFeedItem) =>
  item.kind === 'lesson'
    ? 'Complete this lesson first to see next lessons'
    : item.kind === 'assessment'
      ? 'Complete this assessment first to continue'
      : 'Complete Situational Test first to see next lessons'

/** Attempts a learner gets at a test in the feed. */
export const FEED_ATTEMPTS = 3
