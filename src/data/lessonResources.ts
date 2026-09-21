/**
 * Resources attached to one lesson (DES-334). The content library's lesson editor is
 * the only place they are authored; learners meet them on the course page and in the
 * feed.
 *
 * Module state, not localStorage like `courseStore.ts`: a picked `File` only exists for
 * the session, which is why the course builder keeps its resources in React state too.
 * They survive the editor closing, not a reload.
 *
 * Keyed by `library-<id>`: admin lesson ids are numbers (`ContentRow`) while the
 * learner's mock lessons carry their own resources in `mockCourse.ts`.
 */

import type { CourseResource } from '@/components/ResourceCard/resources'

/** Lessons, SCORM files and question-bank rows share an id space, so each scope
    keys its own resources. */
export const lessonKey = (scope: 'library' | 'scorm' | 'questions', id: number) => `${scope}-${id}`

const sampleFile = (name: string) => new File([`Sample resource: ${name}`], name)

const store: Record<string, CourseResource[]> = {
  // Two library lessons open with resources, so the editor isn't empty on first look.
  [lessonKey('library', 2)]: [
    { id: 1, type: 'pdf', name: 'SDLC phases cheat sheet', fileName: 'SDLC phases cheat sheet.pdf', size: 1153434, file: sampleFile('SDLC phases cheat sheet.pdf') },
    { id: 2, type: 'link', name: 'Agile Manifesto', url: 'https://agilemanifesto.org/' },
  ],
  [lessonKey('library', 4)]: [
    { id: 3, type: 'powerpoint', name: 'Release planning slides', fileName: 'Release planning slides.pptx', size: 8493465, file: sampleFile('Release planning slides.pptx') },
    { id: 4, type: 'image', name: 'Release train diagram', fileName: 'Release train diagram.png', size: 432128, file: sampleFile('Release train diagram.png') },
  ],
}

let nextId = 5

export function getLessonResources(key: string): CourseResource[] {
  return store[key] ?? []
}

export function setLessonResources(key: string, next: CourseResource[]): void {
  store[key] = next
}

/** Id for a resource being added to a lesson; unique across every lesson. */
export function nextLessonResourceId(): number {
  return nextId++
}
