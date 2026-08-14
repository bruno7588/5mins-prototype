/**
 * Maps the course builder's draft onto the learner course-details model, so
 * Preview can hand the real learner page (`/courses/:id`) the course being
 * built instead of the seeded mock.
 */

import { assessmentTypeFromLabel, getAssessmentIllustration } from '@/assets/assessment-illustrations'
import type { InteractiveQuestion } from '@/data/interactiveQuestions'
import type { CourseDetail, CourseLesson } from '@/pages/courses/mockCourse'
import defaultThumbnail from '@/assets/programs/course-thumbs/course-thumb-1.jpg'
import type { OutlineSection } from './components/ContentList/ContentList'
import type { ContentItem } from './components/ContentList/ContentList'
import type { CourseDetailsDraft } from './components/CourseDetailsTab/CourseDetailsTab'

/** What the builder hands to the learner page through router state. */
export interface CoursePreviewPayload {
  course: CourseDetail
  /** Authored interactive questions, keyed by outline-card id — playable in preview. */
  questions: Record<number, InteractiveQuestion>
}

const isLesson = (item: ContentItem) =>
  item.type === 'Lesson' || item.type === 'LibraryLesson' || item.type === 'SCORM'

function thumbnailFor(item: ContentItem): string {
  if (isLesson(item)) return item.thumbnail || defaultThumbnail
  /* Only the classic types have artwork; the interactive formats fall back to
     the multiple-choice tile rather than borrowing a label they don't carry. */
  const label =
    item.type === 'SituationalTest' ? 'situational-test' : assessmentTypeFromLabel(item.metadata)
  return getAssessmentIllustration(label ?? 'multiple-choice', 'desktop')
}

const count = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`

export function buildPreviewCourse(
  draft: CourseDetailsDraft,
  outline: OutlineSection[],
  questions: Record<number, InteractiveQuestion>,
): CoursePreviewPayload {
  const items = outline.flatMap((s) => s.items)
  const lessonCount = items.filter(isLesson).length

  const sections = outline
    .filter((section) => section.items.length > 0)
    .map((section) => {
      const lessons = section.items.filter(isLesson).length
      return {
        id: section.id,
        name: section.name,
        summary: `${count(lessons, 'lesson')} · ${count(section.items.length - lessons, 'assessment')}`,
        lessons: section.items.map<CourseLesson>((item) => ({
          id: `${item.type}-${item.id}`,
          title: item.title,
          meta: item.metadata,
          thumbnail: thumbnailFor(item),
          /* Nothing is gated in a preview — the admin is checking their own
             course, not working through it. */
          state: 'active',
          progress: 0,
          questionId: questions[item.id] ? item.id : undefined,
        })),
      }
    })

  return {
    course: {
      id: 'preview',
      title: draft.title.trim() || 'Untitled course',
      lessonCount,
      durationLabel: `${lessonCount * 5} min`,
      statusLabel: 'Preview',
      jewels: 100,
      passScore: 80,
      progress: 0,
      thumbnail: draft.thumbnail || defaultThumbnail,
      sections,
    },
    questions,
  }
}
