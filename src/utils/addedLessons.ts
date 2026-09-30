import type { ContentRow } from '../pages/your-courses/components/ContentTable/ContentTable'
import flashcardThumb from '@/assets/programs/course-thumbs/course-thumb-1.jpg'
import lessonThumb from '@/assets/programs/course-thumbs/course-thumb-2.jpg'
import audioThumb from '@/assets/lesson-upload/audio-thumbnail.png'

const KEY = '5mins.addedLessons'

/* Lessons saved before they carried a thumbnail (or with a session-only blob
   URL) fall back to the default thumb for their type, as publishing now sets. */
function withThumbnail(row: ContentRow): ContentRow {
  if (row.thumbnail && !row.thumbnail.startsWith('blob:')) return row
  const fallback = row.type === 'Flashcards' ? flashcardThumb : row.type === 'Audio' ? audioThumb : lessonThumb
  return { ...row, thumbnail: fallback }
}

export function readAddedLessons(): ContentRow[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ContentRow[]).map(withThumbnail) : []
  } catch {
    return []
  }
}

export function appendAddedLesson(lesson: ContentRow): void {
  const existing = readAddedLessons()
  localStorage.setItem(KEY, JSON.stringify([lesson, ...existing]))
}

export function updateAddedLesson(id: number, patch: Partial<ContentRow>): ContentRow[] {
  const existing = readAddedLessons()
  const next = existing.map(l => (l.id === id ? { ...l, ...patch } : l))
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export function removeAddedLesson(id: number): ContentRow[] {
  const existing = readAddedLessons()
  const next = existing.filter(l => l.id !== id)
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}
