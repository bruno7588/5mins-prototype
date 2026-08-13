/**
 * Courses created in the builder, persisted so they survive a reload — same
 * localStorage + fail-soft-on-bad-JSON shape as `programStore.ts`.
 *
 * Seed rows stay hardcoded in the list page; this store holds only what the
 * admin authored, and the list concatenates the two (newest first).
 */

export interface StoredCourse {
  id: number
  title: string
  description: string
  /** Data URL or bundled asset path — whatever the thumbnail picker returned. */
  thumbnail: string
  status: 'published' | 'draft'
  /** Outline size, used for the list's "lessons" column and the success card. */
  lessons: number
  createdAt: string
}

const STORAGE_KEY = '5mins-courses'

export function loadCourses(): StoredCourse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredCourse[]) : []
  } catch {
    return []
  }
}

export function saveCourse(course: StoredCourse): void {
  const all = loadCourses()
  const idx = all.findIndex((c) => c.id === course.id)
  if (idx >= 0) all[idx] = course
  else all.push(course)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    /* storage full / unavailable — non-fatal for the prototype */
  }
}

export function getCourseById(id: number): StoredCourse | undefined {
  return loadCourses().find((c) => c.id === id)
}

/** "Jul 19, 2025" — matches the format the seed rows are written in. */
export const formatCourseDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
