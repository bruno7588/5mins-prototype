/* Course-level resources: files and links learners open from the course's Resources
   section. Production takes PDF, Word and Excel; PowerPoint, images and external links are new. */

import type { ResourceType } from '@/components/ResourceCard/ResourceCard'

export type { ResourceType }

export interface CourseResource {
  id: number
  type: ResourceType
  name: string
  /** File resources only. `file` lives for the session so Download hands back the real file. */
  fileName?: string
  size?: number
  file?: File
  /** Link resources only. */
  url?: string
}

/* `accept` is the machine list the file dialog and matchesType() use; `acceptLabel`
   is what an admin is shown, for types where the two differ. */
export const RESOURCE_TYPES: Record<ResourceType, { label: string; accept?: string; acceptLabel?: string }> = {
  pdf: { label: 'PDF', accept: '.pdf' },
  word: { label: 'Word', accept: '.doc,.docx' },
  excel: { label: 'Excel', accept: '.xls,.xlsx' },
  powerpoint: { label: 'PowerPoint', accept: '.ppt,.pptx' },
  // .jpeg uploads fine; showing both spellings of one format only adds noise.
  image: { label: 'Image', accept: '.jpg,.jpeg,.png', acceptLabel: '.jpg,.png' },
  link: { label: 'External Link' },
}

export const MAX_FILE_BYTES = 50 * 1024 * 1024

export function matchesType(fileName: string, type: ResourceType): boolean {
  const accept = RESOURCE_TYPES[type].accept
  const name = fileName.toLowerCase()
  return !!accept && accept.split(',').some((ext) => name.endsWith(ext))
}

/** A full http(s) address; bare words and other schemes are refused. */
export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value.trim())
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.hostname.includes('.')
  } catch {
    return false
  }
}
