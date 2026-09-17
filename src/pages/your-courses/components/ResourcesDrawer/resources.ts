/* Course-level resources: files and links learners open from the course's Resources
   section. Production takes PDF, Word and Excel; PowerPoint and external links are new. */

export type ResourceType = 'pdf' | 'word' | 'excel' | 'powerpoint' | 'link'

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

export const RESOURCE_TYPES: Record<ResourceType, { label: string; accept?: string }> = {
  pdf: { label: 'PDF', accept: '.pdf' },
  word: { label: 'Word', accept: '.doc,.docx' },
  excel: { label: 'Excel', accept: '.xls,.xlsx' },
  powerpoint: { label: 'PowerPoint', accept: '.ppt,.pptx' },
  link: { label: 'External Link' },
}

/** "1.1 MB", "240 KB". */
export function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/** The card's second line: "PDF • 1.1 MB", or "External link". */
export function resourceMeta(r: CourseResource): string {
  if (r.type === 'link') return 'External link'
  return `${RESOURCE_TYPES[r.type].label}${r.size !== undefined ? ` • ${formatSize(r.size)}` : ''}`
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
