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
      'You\'ll manage your energy across the day instead of hunting for more hours',
    keyConcepts: [
      {
        heading: 'Energy, not time',
        points: [
          'Match the hard work to your peak hours',
          'Protect the recovery between blocks',
          'Notice what actually drains you',
        ],
      },
      {
        heading: 'Design the week',
        points: [
          'Batch the shallow work',
          'Defend one deep block a day',
        ],
      },
    ],
  },
  {
    instructor: 'Noor Haddad',
    instructorAvatar: avatar3,
    title: 'What Counts as a Conflict of Interest',
    media: heroGif,
    progress: 0.2,
    duration: '2:15',
    skillName: 'Workplace Compliance',
    skillLevel: 3,
    quizPoints: 4,
    episodes: [
      { label: 'Episode 1', title: 'What Counts as a Conflict of Interest', progress: 0.2, duration: '2:15' },
    ],
    resources: [
      { id: 'f6r1', type: 'pdf', title: 'Conflict of interest policy', size: 612352 },
      { id: 'f6r2', type: 'word', title: 'Declaration form', size: 48128 },
      { id: 'f6r3', type: 'link', title: 'Who to ask if you are unsure', url: 'https://www.gov.uk/' },
    ],
    learningGoal:
      'You\'ll recognise a conflict of interest early and know what to do about it',
    keyConcepts: [
      {
        heading: 'What triggers one',
        points: [
          'Money, gifts and outside work',
          'Hiring or managing someone close to you',
          'Anything you would rather not disclose',
        ],
      },
      {
        heading: 'What to do',
        points: [
          'Declare it before it becomes a decision',
          'Step out of the call, not just the vote',
        ],
      },
    ],
  },
  {
    instructor: 'Liam Walsh',
    instructorAvatar: avatar1,
    title: "The Manager's Guide to Delegation",
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
]
