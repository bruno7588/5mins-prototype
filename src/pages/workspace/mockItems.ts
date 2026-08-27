import programBanner from '../../assets/programs/unsplash_GP5EziJ_Cdo.jpg'
import programBanner2 from '../../assets/programs/banner.jpg'
import courseThumb1 from '../../assets/programs/course-1.png'
import courseThumb2 from '../../assets/programs/course-2.png'
import courseThumb3 from '../../assets/programs/course-3.png'
import courseThumb4 from '../../assets/programs/course-4.png'
import courseThumb5 from '../../assets/programs/course-5.png'
import courseThumb6 from '../../assets/programs/course-6.png'
import enrolledThumb1 from '../../assets/workspace/course-1.png'
import enrolledThumb2 from '../../assets/workspace/course-2.png'
import enrolledThumb3 from '../../assets/workspace/course-3.png'
import enrolledThumb4 from '../../assets/workspace/course-4.png'

export interface WorkspaceCourse {
  id: string
  title: string
  thumbnailGradient: string
  /** Thumbnail photo; falls back to the gradient when absent */
  image?: string
  /** 0..100 — used to fill the segmented progress bar */
  progress: number
  lessonCount: number
  durationMinutes: number
  /** e.g. "Due on Aug 20" — when present, renders the floating warning pill */
  dueLabel?: string
  /** Overhang "New" badge on top-left of the card */
  isNew?: boolean
}

export const workspaceCourses: WorkspaceCourse[] = [
  {
    id: 'c1',
    title: 'Leadership that Drives Innovation',
    thumbnailGradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    image: enrolledThumb1,
    progress: 100,
    lessonCount: 11,
    durationMinutes: 29,
  },
  {
    id: 'c2',
    title: 'My first playlist as a Manager',
    thumbnailGradient: 'linear-gradient(135deg, #0f172a, #1e293b)',
    image: enrolledThumb2,
    progress: 40,
    lessonCount: 2,
    durationMinutes: 5,
    dueLabel: 'Due on Aug 20',
    isNew: true,
  },
  {
    id: 'c3',
    title: 'GDPR Essentials (Global)',
    thumbnailGradient: 'linear-gradient(135deg, #38bdf8, #6366f1)',
    image: enrolledThumb3,
    progress: 25,
    lessonCount: 7,
    durationMinutes: 17,
    dueLabel: 'Due on Aug 20',
  },
  {
    id: 'c4',
    title: 'Personality-Driven Leadership: Leveraging Individual Strengths for Team Success',
    thumbnailGradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    image: enrolledThumb4,
    progress: 0,
    lessonCount: 8,
    durationMinutes: 33,
  },
  {
    id: 'c5',
    title: 'Customer Conversations: Building Stronger Relationships',
    thumbnailGradient: 'linear-gradient(135deg, #14b8a6, #06b6d4)',
    image: enrolledThumb1,
    progress: 60,
    lessonCount: 9,
    durationMinutes: 38,
  },
]

/**
 * Per-course action state in a program outline:
 * - `completed`  → green "Completed" badge, outline "Review" button
 * - `continue`   → inline progress bar, filled "Continue" button
 * - `jump-here`  → next course to resume, outline-primary "Start" button
 * - `locked`     → upcoming course, no button
 */
/** Button action shown on a course row (independent of the status badge).
 * - `retake` → the learner failed (score < pass score); error "Retake" button */
export type ProgramCourseState = 'review' | 'continue' | 'jump-here' | 'locked' | 'retake'

/**
 * Status badge shown below the course metadata. Maps to DS Badge variants:
 * - `completed` → success    - `overdue` → error    - `failed` → error
 * - `scheduled` → informative - `due`     → warning
 */
export type CourseStatus = 'completed' | 'overdue' | 'scheduled' | 'due' | 'failed'

export interface ProgramCourse {
  id: string
  title: string
  lessonCount: number
  durationMinutes: number
  thumbnail: string
  state: ProgramCourseState
  /** 0..100 — only used by the `continue` state's inline progress bar */
  progress?: number
  status?: CourseStatus
  /** Label for overdue/scheduled/due badges (e.g. "Due on 15 Jun"); completed uses a fixed label */
  statusLabel?: string
}

export interface WorkspaceProgram {
  id: string
  title: string
  description: string
  thumbnailGradient: string
  /** Background photo for the banner; falls back to the gradient when absent. */
  image?: string
  courseCount: number
  durationLabel: string
  learnerCount: number
  /** 0..100 — overall program completion */
  progress: number
  outline: ProgramCourse[]
}

export const workspacePrograms: WorkspaceProgram[] = [
  {
    id: 'p1',
    title: 'Technical Product Manager Certification',
    description:
      'The Technical Product Manager Certification equips you with skills to lead product development and bridge technical teams with business goals. Gain expertise in managing product lifecycles, prioritizing features, and driving innovation.',
    thumbnailGradient: 'linear-gradient(135deg, #6368db, #8158ec)',
    image: programBanner,
    courseCount: 6,
    durationLabel: '20 min',
    learnerCount: 45,
    progress: 0,
    // Fresh (0%) enrolment: one card per admin enrolment × due-date use case.
    // Only the first course is startable; the rest are locked (never completed
    // or in progress), their badge reflecting how the admin scheduled them.
    outline: [
      // On program start · No due date → available now, startable
      {
        id: 'pc1',
        title: 'Master Coaching Strategies for Optimal Performance',
        lessonCount: 12,
        durationMinutes: 34,
        thumbnail: courseThumb1,
        state: 'jump-here',
      },
      // On program start · Due date → available now (startable) with a deadline
      {
        id: 'pc2',
        title: 'Mastering Feedback - Practical Models and Techniques',
        lessonCount: 9,
        durationMinutes: 21,
        thumbnail: courseThumb2,
        state: 'jump-here',
        status: 'due',
        statusLabel: 'Due on 15 Jul',
      },
      // On specific date → scheduled to release on a fixed date
      {
        id: 'pc3',
        title: 'Leadership That Drives Innovation',
        lessonCount: 17,
        durationMinutes: 48,
        thumbnail: courseThumb3,
        state: 'locked',
        status: 'scheduled',
        statusLabel: 'Scheduled for 23 Jul',
      },
      // After delay · No due date → drips after the previous course. Relative
      // release, so the badge states the unlock rule (no absolute date to show).
      {
        id: 'pc4',
        title: 'Listen to Lead: The Power of Listening in Effective Leadership',
        lessonCount: 6,
        durationMinutes: 15,
        thumbnail: courseThumb4,
        state: 'locked',
        status: 'scheduled',
        statusLabel: '3d after previous course',
      },
      // On specific date · Due date → scheduled release with a deadline
      {
        id: 'pc5',
        title: 'Building a Leadership Mindset',
        lessonCount: 8,
        durationMinutes: 26,
        thumbnail: courseThumb5,
        state: 'locked',
        status: 'scheduled',
        statusLabel: 'Scheduled for 30 Jul',
      },
      // After delay (longer) · Due date → drips after previous. Locked, so it
      // shows the unlock rule; the due date surfaces once it releases.
      {
        id: 'pc6',
        title: 'Personality-Driven Leadership: Leveraging Individual Strengths for Team Success',
        lessonCount: 14,
        durationMinutes: 39,
        thumbnail: courseThumb6,
        state: 'locked',
        status: 'scheduled',
        statusLabel: '7d after previous course',
      },
    ],
  },
  {
    id: 'p2',
    title: 'Leadership Essentials Program',
    description:
      'A structured path to becoming a confident people leader. Build the habits, conversations, and decision-making frameworks that high-performing managers rely on every day.',
    thumbnailGradient: 'linear-gradient(135deg, #00afc4, #6368db)',
    image: programBanner2,
    courseCount: 9,
    durationLabel: '15 min',
    learnerCount: 28,
    progress: 50,
    outline: [
      {
        id: 'p2c1',
        title: 'Foundations of People Leadership',
        lessonCount: 9,
        durationMinutes: 15,
        thumbnail: courseThumb2,
        state: 'review',
        status: 'completed',
      },
      {
        id: 'p2c2',
        // Long on purpose: the banner's "Current course:" line truncates at two.
        title:
          'Difficult Coaching Conversations: Giving Feedback that Changes Performance Without Damaging Trust',
        lessonCount: 11,
        durationMinutes: 18,
        thumbnail: courseThumb3,
        state: 'continue',
        progress: 60,
        status: 'due',
        statusLabel: 'Due on 28 Jun',
      },
      {
        id: 'p2c3',
        title: 'Leading Through Change',
        lessonCount: 7,
        durationMinutes: 12,
        thumbnail: courseThumb4,
        state: 'locked',
        status: 'scheduled',
        statusLabel: 'Scheduled for 5 Jul',
      },
    ],
  },
  {
    id: 'p3',
    title: 'Data-Driven Decision Making',
    description:
      'Learn to turn data into action. This program covers analytics fundamentals, interpreting metrics, and communicating insights that move the business forward.',
    thumbnailGradient: 'linear-gradient(135deg, #f97316, #df1642)',
    image: courseThumb3,
    courseCount: 12,
    durationLabel: '18 min',
    learnerCount: 61,
    progress: 33,
    outline: [
      {
        id: 'p3c1',
        title: 'Analytics Fundamentals',
        lessonCount: 12,
        durationMinutes: 18,
        thumbnail: courseThumb1,
        state: 'review',
        status: 'overdue',
        statusLabel: 'Overdue',
      },
      {
        id: 'p3c2',
        title: 'Interpreting Metrics that Matter',
        lessonCount: 8,
        durationMinutes: 14,
        thumbnail: courseThumb4,
        state: 'continue',
        progress: 45,
      },
      {
        id: 'p3c3',
        title: 'Communicating Insights',
        lessonCount: 10,
        durationMinutes: 16,
        thumbnail: courseThumb3,
        state: 'locked',
        status: 'scheduled',
        statusLabel: 'Scheduled for 19 Jul',
      },
    ],
  },
  // End-of-program demo — all courses PASSED → certificate UNLOCKED.
  {
    id: 'p4',
    title: 'Food Hygiene & Safety Level 3',
    description:
      'A compliance pathway covering food handling, contamination control, and safe kitchen practice for hospitality teams. Pass every course to earn your certificate.',
    thumbnailGradient: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
    image: programBanner,
    courseCount: 4,
    durationLabel: '17 min',
    learnerCount: 32,
    progress: 100,
    outline: [
      {
        id: 'p4c1',
        title: 'Food Safety Foundations',
        lessonCount: 8,
        durationMinutes: 16,
        thumbnail: courseThumb1,
        state: 'review',
        status: 'completed',
      },
      {
        id: 'p4c2',
        title: 'Preventing Cross-Contamination',
        lessonCount: 6,
        durationMinutes: 12,
        thumbnail: courseThumb2,
        state: 'review',
        status: 'completed',
      },
      {
        id: 'p4c3',
        title: 'Temperature Control & Storage',
        lessonCount: 9,
        durationMinutes: 18,
        thumbnail: courseThumb3,
        state: 'review',
        status: 'completed',
      },
      {
        id: 'p4c4',
        title: 'Allergen Management in Practice',
        lessonCount: 7,
        durationMinutes: 14,
        thumbnail: courseThumb4,
        state: 'review',
        status: 'completed',
      },
    ],
  },
  // End-of-program demo — one course FAILED → certificate stays LOCKED.
  // Retake is course-level: the failed card shows a "Retake" CTA.
  {
    id: 'p5',
    // Long on purpose: the banner title truncates at three lines.
    title:
      'Fire Safety, Emergency Evacuation and Incident Response Certification for Hospitality Operations and Front-of-House Teams',
    description:
      'Everything hospitality staff need to prevent, detect, and respond to fire. The certificate unlocks only once every course is passed.',
    thumbnailGradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    image: programBanner2,
    courseCount: 3,
    durationLabel: '14 min',
    learnerCount: 41,
    progress: 67,
    outline: [
      {
        id: 'p5c1',
        title: 'Fire Prevention Fundamentals',
        lessonCount: 7,
        durationMinutes: 14,
        thumbnail: courseThumb1,
        state: 'review',
        status: 'completed',
      },
      {
        id: 'p5c2',
        title: 'Using Fire Extinguishers Safely',
        lessonCount: 5,
        durationMinutes: 10,
        thumbnail: courseThumb6,
        state: 'retake',
        status: 'failed',
      },
      {
        id: 'p5c3',
        title: 'Evacuation & Assembly Procedures',
        lessonCount: 6,
        durationMinutes: 12,
        thumbnail: courseThumb3,
        state: 'review',
        status: 'completed',
      },
    ],
  },
  {
    id: 'p6',
    title: 'Allergen Awareness & Compliance',
    description:
      'Everything front-of-house and kitchen teams need to handle allergens safely: the 14 regulated allergens, how to take and record an allergy order, and what the law expects of you when a guest asks.',
    thumbnailGradient: 'linear-gradient(135deg, #18a957, #00afc4)',
    image: courseThumb5,
    courseCount: 3,
    durationLabel: '16 min',
    learnerCount: 37,
    // Enrolled but not open yet: every course is scheduled to release later, so
    // there is nothing to start. The banner reads "Scheduled for …" off the
    // earliest release date.
    progress: 0,
    outline: [
      {
        id: 'p6c1',
        title: 'The 14 Regulated Allergens',
        lessonCount: 6,
        durationMinutes: 14,
        thumbnail: courseThumb5,
        state: 'locked',
        status: 'scheduled',
        statusLabel: 'Scheduled for 23 Jul',
      },
      {
        id: 'p6c2',
        title: 'Taking and Recording an Allergy Order',
        lessonCount: 5,
        durationMinutes: 11,
        thumbnail: courseThumb6,
        state: 'locked',
        status: 'scheduled',
        statusLabel: 'Scheduled for 30 Jul',
      },
      {
        id: 'p6c3',
        title: 'When a Guest Reacts: Your Legal Duties',
        lessonCount: 4,
        durationMinutes: 9,
        thumbnail: courseThumb1,
        state: 'locked',
        status: 'scheduled',
        statusLabel: '7d after previous course',
      },
    ],
  },
]

export interface WorkspaceCategory {
  id: string
  name: string
  thumbnailGradient: string
  image?: string
  courseCount: number
  lessonCount: number
}

export const workspaceCategories: WorkspaceCategory[] = [
  {
    id: 'cat1',
    name: 'Leadership Training',
    thumbnailGradient: 'linear-gradient(135deg, #a855f7, #6366f1)',
    image: enrolledThumb1,
    courseCount: 12,
    lessonCount: 84,
  },
  {
    id: 'cat2',
    name: 'New Joiner Collection',
    thumbnailGradient: 'linear-gradient(135deg, #f97316, #fbbf24)',
    image: enrolledThumb2,
    courseCount: 8,
    lessonCount: 41,
  },
  {
    id: 'cat3',
    name: 'Compliance & Security',
    thumbnailGradient: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
    image: enrolledThumb3,
    courseCount: 15,
    lessonCount: 67,
  },
  {
    id: 'cat4',
    name: 'Product Updates',
    thumbnailGradient: 'linear-gradient(135deg, #0f172a, #334155)',
    image: enrolledThumb4,
    courseCount: 6,
    lessonCount: 22,
  },
]
