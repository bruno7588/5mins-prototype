import type { CourseResourceItem } from '../courses/mockCourse'
import heroGif from '../../assets/for-you/v3-Hugo-FullCorrect-Anim.gif'
import avatar1 from '../../assets/programs/avatar-1.png'
import avatar2 from '../../assets/programs/avatar-2.png'
import avatar3 from '../../assets/programs/avatar-3.png'

export interface FeedEpisode {
  label: string
  title: string
  /** Watched fraction 0–1 (drives the mini segment bar). */
  progress: number
  duration: string
  /** Dimmed (not yet started) episode. */
  upcoming?: boolean
}

export interface FeedLesson {
  instructor: string
  instructorAvatar: string
  title: string
  /** Playing-video media (the GIF stands in for the lesson video). */
  media: string
  /** Watched fraction of the current lesson, 0–1. */
  progress: number
  duration: string
  skillName: string
  skillLevel: 1 | 2 | 3 | 4 | 5 | 'advanced' | 'expert' | 'master'
  quizPoints: number
  episodes: FeedEpisode[]
  /** Files and links attached to this lesson (DES-334). */
  resources?: CourseResourceItem[]
  /** Learnings tab (Figma 6574:54443): what the learner walks away with. */
  learningGoal?: string
  keyConcepts?: FeedConcept[]
}

/** One "Key concepts" card: a heading over its bullets. */
export interface FeedConcept {
  heading: string
  points: string[]
}

// One entry per "Jump back in" / hero card — the feed navigates this list.
export const feedLessons: FeedLesson[] = [
  {
    instructor: 'Michaela Scott',
    instructorAvatar: avatar1,
    title: "Tearing Down Zendesk's Pricing. What is behind our Unconscious Bias? (Episode 1/4)",
    media: heroGif,
    progress: 0.37,
    duration: '1:42',
    skillName: 'Critical & Analytical Thinking',
    skillLevel: 2,
    quizPoints: 4,
    episodes: [
      { label: 'Episode 1', title: 'How to Disagree with Your Boss - Disagreeing Is Not Bad With The Best Practices (Episode 1)', progress: 1, duration: '1:42' },
      { label: 'Episode 2', title: 'Timeline, Data and Goals', progress: 0, duration: '1:42', upcoming: true },
    ],
    resources: [
      { id: 'f1r1', type: 'pdf', title: 'Pricing teardown worksheet', size: 842752 },
      { id: 'f1r2', type: 'link', title: 'Zendesk pricing page', url: 'https://www.zendesk.co.uk/pricing/' },
    ],
    learningGoal:
      'You\'ll understand effective product positioning and how to avoid common mistakes',
    keyConcepts: [
      {
        heading: 'Reading a pricing page',
        points: [
          'Market segmentation strategies',
          'Common positioning pitfalls',
          'Clear value proposition importance',
        ],
      },
      {
        heading: 'Spotting your own bias',
        points: [
          'Where anchoring creeps in',
          'Testing a price against a segment',
        ],
      },
    ],
  },
  {
    instructor: 'Daniel Okoro',
    instructorAvatar: avatar2,
    title: 'Leading Remote Teams Without Losing Momentum (Episode 1/3)',
    media: heroGif,
    progress: 0.12,
    duration: '4:12',
    skillName: 'Leadership',
    skillLevel: 3,
    quizPoints: 4,
    episodes: [
      { label: 'Episode 1', title: 'Setting the Cadence: Standups, Async and Trust', progress: 0.5, duration: '4:12' },
      { label: 'Episode 2', title: 'When to Jump on a Call vs. Write it Down', progress: 0, duration: '3:05', upcoming: true },
    ],
    resources: [
      { id: 'f2r1', type: 'word', title: 'Remote team charter template', size: 819200 },
    ],
    learningGoal:
      'You\'ll run a remote team without losing the momentum a room gives you',
    keyConcepts: [
      {
        heading: 'Rhythm over presence',
        points: [
          'Written updates beat status meetings',
          'Make the default asynchronous',
          'Protect one shared hour',
        ],
      },
      {
        heading: 'Trust at a distance',
        points: [
          'Show the work, not the hours',
          'Disagree in writing, decide on a call',
        ],
      },
    ],
  },
  {
    instructor: 'Sofia Marin',
    instructorAvatar: avatar3,
    title: 'Turning Conflict Into Collaboration (Episode 2/2)',
    media: heroGif,
    progress: 0.68,
    duration: '5:03',
    skillName: 'Communication',
    skillLevel: 4,
    quizPoints: 6,
    episodes: [
      { label: 'Episode 1', title: 'Naming the Tension Without Escalating', progress: 1, duration: '2:40' },
      { label: 'Episode 2', title: 'Finding the Shared Goal', progress: 0.68, duration: '5:03' },
    ],
    learningGoal:
      'You\'ll give feedback people can act on instead of just absorb',
    keyConcepts: [
      {
        heading: 'Separate the act from the person',
        points: [
          'Describe what you saw',
          'Name the effect it had',
          'Ask before advising',
        ],
      },
      {
        heading: 'Make it usable',
        points: [
          'One thing, not five',
          'Agree the next step together',
        ],
      },
    ],
  },
  {
    instructor: 'Liam Walsh',
    instructorAvatar: avatar1,
    title: "The Manager's Guide to Delegation (Episode 1/1)",
    media: heroGif,
    progress: 1,
    duration: '2:58',
    skillName: 'Productivity',
    skillLevel: 5,
    quizPoints: 4,
    episodes: [
      { label: 'Episode 1', title: 'Delegate the Outcome, Not the Task', progress: 1, duration: '2:58' },
    ],
    learningGoal:
      'You\'ll delegate work without either abandoning it or taking it back',
    keyConcepts: [
      {
        heading: 'Hand over the outcome',
        points: [
          'Say what done looks like',
          'Agree the check-in, not the method',
          'Let the first attempt be imperfect',
        ],
      },
      {
        heading: 'Stay useful, not involved',
        points: [
          'Answer questions, don\'t pre-empt them',
          'Review once, properly',
        ],
      },
    ],
  },
  {
    instructor: 'Priya Nair',
    instructorAvatar: avatar2,
    title: 'How Top Performers Manage Their Energy (Episode 1/3)',
    media: heroGif,
    progress: 0.05,
    duration: '3:30',
    skillName: 'Data Analysis',
    skillLevel: 2,
    quizPoints: 4,
    episodes: [
      { label: 'Episode 1', title: 'The Myth of Time Management', progress: 0.1, duration: '3:30' },
      { label: 'Episode 2', title: 'Designing Your Peak Window', progress: 0, duration: '4:01', upcoming: true },
    ],
    learningGoal:
      'You\'ll tell a story people remember instead of a report they skim',
    keyConcepts: [
      {
        heading: 'Find the turn',
        points: [
          'Start where something changed',
          'Cut the setup to one line',
          'Keep one idea per beat',
        ],
      },
      {
        heading: 'Make it theirs',
        points: [
          'Use their vocabulary',
          'End on the decision you want',
        ],
      },
    ],
  },
]
