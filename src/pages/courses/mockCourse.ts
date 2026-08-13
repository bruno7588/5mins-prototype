import { workspacePrograms, type ProgramCourse } from '../workspace/mockItems'
import thumb1 from '../../assets/programs/course-1.png'
import thumb2 from '../../assets/programs/course-2.png'
import thumb3 from '../../assets/programs/course-3.png'
import thumb4 from '../../assets/programs/course-4.png'
import thumb5 from '../../assets/programs/course-5.png'
import thumb6 from '../../assets/programs/course-6.png'

export interface CourseLesson {
  id: string
  title: string
  /** e.g. "Lesson · Dr. Amara Okafor · 6 min" */
  meta: string
  thumbnail: string
  state: 'active' | 'locked'
  /** 0..100 — inline progress shown for the active lesson */
  progress?: number
  /** Builder preview only: an authored interactive question this row opens. */
  questionId?: number
}

export interface CourseSection {
  id: string
  name: string
  /** e.g. "7 lessons · 2 assessments" */
  summary: string
  lessons: CourseLesson[]
}

export interface CourseDetail {
  id: string
  title: string
  lessonCount: number
  durationLabel: string
  statusLabel: string
  jewels: number
  passScore: number
  /** 0..100 — overall course completion */
  progress: number
  thumbnail: string
  sections: CourseSection[]
}

/** Find a course across every program's outline by id. */
export function findProgramCourse(id: string | undefined): ProgramCourse | undefined {
  if (!id) return undefined
  for (const program of workspacePrograms) {
    const course = program.outline.find((c) => c.id === id)
    if (course) return course
  }
  return undefined
}

/** Find the program a course belongs to (for the "part of a program" breadcrumb).
 *  Returns just the id + title; undefined for standalone courses. */
export function findProgramForCourse(
  id: string | undefined,
): { id: string; title: string } | undefined {
  if (!id) return undefined
  for (const program of workspacePrograms) {
    if (program.outline.some((c) => c.id === id)) {
      return { id: program.id, title: program.title }
    }
  }
  return undefined
}

/** Shared outline used for any course in the prototype. */
const sections: CourseSection[] = [
  {
    id: 's1',
    name: 'Foundations of Innovative Leadership',
    summary: '3 lessons · 1 assessment',
    lessons: [
      {
        id: 'l1',
        title: 'Why Innovation Starts with Leadership',
        meta: 'Lesson · Dr. Amara Okafor · 6 min',
        thumbnail: thumb1,
        state: 'active',
        progress: 60,
      },
      {
        id: 'l2',
        title: 'The Mindset of Innovative Leaders',
        meta: 'Lesson · Dr. Amara Okafor · 8 min',
        thumbnail: thumb2,
        state: 'locked',
      },
    ],
  },
  {
    id: 's2',
    name: 'Building Teams That Innovate',
    summary: '4 lessons · 1 assessment',
    lessons: [
      {
        id: 'l3',
        title: 'Creating Psychological Safety',
        meta: 'Lesson · James Whitfield · 5 min',
        thumbnail: thumb3,
        state: 'locked',
      },
      {
        id: 'l4',
        title: 'Assessment: Team Dynamics',
        meta: 'Assessment · 10 questions',
        thumbnail: thumb4,
        state: 'locked',
      },
    ],
  },
  {
    id: 's3',
    name: 'Driving Change Across the Organisation',
    summary: '3 lessons · 2 assessments',
    lessons: [
      {
        id: 'l5',
        title: 'Leading Through Uncertainty',
        meta: 'Lesson · Priya Nair · 7 min',
        thumbnail: thumb5,
        state: 'locked',
      },
      {
        id: 'l6',
        title: 'Measuring Innovation Impact',
        meta: 'Lesson · Priya Nair · 9 min',
        thumbnail: thumb6,
        state: 'locked',
      },
    ],
  },
]

/** Build a course-detail view model from a program course (falls back gracefully). */
export function getCourseDetail(id: string | undefined): CourseDetail {
  const course = findProgramCourse(id)
  const progress = course?.progress ?? 0
  // The active (current) lesson reflects the course's overall progress, so a
  // not-started course shows an empty 0% lesson bar.
  const courseSections = sections.map((section) => ({
    ...section,
    lessons: section.lessons.map((lesson) =>
      lesson.state === 'active' ? { ...lesson, progress } : lesson,
    ),
  }))
  return {
    id: course?.id ?? 'unknown',
    title: course?.title ?? 'Leadership That Drives Innovation',
    lessonCount: course?.lessonCount ?? 17,
    durationLabel: course ? `${course.durationMinutes} min` : '20 min',
    statusLabel: course?.statusLabel ?? 'Due on 15 Jun',
    jewels: 100,
    passScore: 80,
    progress,
    thumbnail: course?.thumbnail ?? thumb3,
    sections: courseSections,
  }
}
