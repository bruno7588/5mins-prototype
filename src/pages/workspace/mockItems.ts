import programBanner from '../../assets/programs/banner.jpg'
import courseThumb1 from '../../assets/programs/course-1.png'
import courseThumb2 from '../../assets/programs/course-2.png'
import courseThumb3 from '../../assets/programs/course-3.png'
import courseThumb4 from '../../assets/programs/course-4.png'
import courseThumb5 from '../../assets/programs/course-5.png'
import courseThumb6 from '../../assets/programs/course-6.png'

export interface WorkspaceCourse {
  id: string
  title: string
  thumbnailGradient: string
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
    progress: 100,
    lessonCount: 11,
    durationMinutes: 29,
  },
  {
    id: 'c2',
    title: 'My first playlist as a Manager',
    thumbnailGradient: 'linear-gradient(135deg, #0f172a, #1e293b)',
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
    progress: 25,
    lessonCount: 7,
    durationMinutes: 17,
    dueLabel: 'Due on Aug 20',
  },
  {
    id: 'c4',
    title: 'Personality-Driven Leadership: Leveraging Individual Strengths for Team Success',
    thumbnailGradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    progress: 0,
    lessonCount: 8,
    durationMinutes: 33,
  },
  {
    id: 'c5',
    title: 'Customer Conversations: Building Stronger Relationships',
    thumbnailGradient: 'linear-gradient(135deg, #14b8a6, #06b6d4)',
    progress: 60,
    lessonCount: 9,
    durationMinutes: 38,
  },
]

/**
 * Per-course action state in a program outline:
 * - `completed`  → green "Completed" badge, outline "Review" button
 * - `continue`   → inline progress bar, filled "Continue" button
 * - `jump-here`  → next course to resume, outline-primary "Jump Here" button
 * - `locked`     → upcoming course, no button
 */
/** Button action shown on a course row (independent of the status badge). */
export type ProgramCourseState = 'review' | 'continue' | 'jump-here' | 'locked'

/**
 * Status badge shown below the course metadata. Maps to DS Badge variants:
 * - `completed` → success    - `overdue` → error
 * - `scheduled` → informative - `due`     → warning
 */
export type CourseStatus = 'completed' | 'overdue' | 'scheduled' | 'due'

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
    courseCount: 17,
    durationLabel: '20 min',
    learnerCount: 45,
    progress: 37,
    outline: [
      {
        id: 'pc1',
        title: 'Master Coaching Strategies for Optimal Performance',
        lessonCount: 12,
        durationMinutes: 34,
        thumbnail: courseThumb1,
        state: 'review',
        status: 'completed',
      },
      {
        id: 'pc2',
        title: 'Mastering Feedback - Practical Models and Techniques',
        lessonCount: 9,
        durationMinutes: 21,
        thumbnail: courseThumb2,
        state: 'review',
        status: 'overdue',
        statusLabel: 'Overdue',
      },
      {
        id: 'pc3',
        title: 'Leadership That Drives Innovation',
        lessonCount: 17,
        durationMinutes: 48,
        thumbnail: courseThumb3,
        state: 'continue',
        progress: 37,
        status: 'due',
        statusLabel: 'Due on 15 Jun',
      },
      {
        id: 'pc4',
        title: 'Listen to Lead: The Power of Listening in Effective Leadership',
        lessonCount: 6,
        durationMinutes: 15,
        thumbnail: courseThumb4,
        state: 'jump-here',
        status: 'due',
        statusLabel: 'Due on 15 Jun',
      },
      {
        id: 'pc5',
        title: 'Building a Leadership Mindset',
        lessonCount: 8,
        durationMinutes: 26,
        thumbnail: courseThumb5,
        state: 'locked',
        status: 'scheduled',
        statusLabel: 'Scheduled for 23 Jul',
      },
      {
        id: 'pc6',
        title: 'Personality-Driven Leadership: Leveraging Individual Strengths for Team Success',
        lessonCount: 14,
        durationMinutes: 39,
        thumbnail: courseThumb6,
        state: 'locked',
        status: 'scheduled',
        statusLabel: 'Scheduled for 30 Jul',
      },
    ],
  },
  {
    id: 'p2',
    title: 'Leadership Essentials Program',
    description:
      'A structured path to becoming a confident people leader. Build the habits, conversations, and decision-making frameworks that high-performing managers rely on every day.',
    thumbnailGradient: 'linear-gradient(135deg, #00afc4, #6368db)',
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
        title: 'Coaching & Feedback Conversations',
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
    courseCount: 12,
    durationLabel: '18 min',
    learnerCount: 61,
    progress: 0,
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
        state: 'locked',
        status: 'scheduled',
        statusLabel: 'Scheduled for 12 Jul',
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
]

export interface WorkspaceCategory {
  id: string
  name: string
  thumbnailGradient: string
  courseCount: number
  lessonCount: number
}

export const workspaceCategories: WorkspaceCategory[] = [
  {
    id: 'cat1',
    name: 'Leadership Training',
    thumbnailGradient: 'linear-gradient(135deg, #a855f7, #6366f1)',
    courseCount: 12,
    lessonCount: 84,
  },
  {
    id: 'cat2',
    name: 'New Joiner Collection',
    thumbnailGradient: 'linear-gradient(135deg, #f97316, #fbbf24)',
    courseCount: 8,
    lessonCount: 41,
  },
  {
    id: 'cat3',
    name: 'Compliance & Security',
    thumbnailGradient: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
    courseCount: 15,
    lessonCount: 67,
  },
  {
    id: 'cat4',
    name: 'Product Updates',
    thumbnailGradient: 'linear-gradient(135deg, #0f172a, #334155)',
    courseCount: 6,
    lessonCount: 22,
  },
]
