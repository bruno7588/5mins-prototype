/**
 * Scenario media (DES-371): the one image, audio clip or video a situational test can
 * carry on its brief. The same shape the builder saves and the course feed plays.
 */
export type ScenarioMediaKind = 'image' | 'audio' | 'video'

export interface ScenarioMediaData {
  kind: ScenarioMediaKind
  src: string
  /** The file's name, shown to the admin and used to name the media for assistive tech. */
  name: string
  /** Bytes, when known. */
  size?: number
}

const MB = 1024 * 1024

/** Common limits (Bruno, 2026-11-24): image 10MB, audio 50MB, video 500MB. Formats widened
 *  (Bruno, 2026-11-25); production converts MOV, M4V and HEIC on upload so every browser can
 *  play or show them. */
export const SCENARIO_MEDIA_RULES: Record<ScenarioMediaKind, { extensions: string[]; maxBytes: number; label: string }> = {
  image: { extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic'], maxBytes: 10 * MB, label: '10MB' },
  audio: { extensions: ['mp3', 'm4a', 'wav', 'aac', 'ogg'], maxBytes: 50 * MB, label: '50MB' },
  video: { extensions: ['mp4', 'mov', 'webm', 'm4v'], maxBytes: 500 * MB, label: '500MB' },
}

export const SCENARIO_MEDIA_ACCEPT = Object.values(SCENARIO_MEDIA_RULES)
  .flatMap((rule) => rule.extensions.map((ext) => `.${ext}`))
  .join(',')

/** The kind a file is, by its extension; null when it is not one we take. */
export function scenarioMediaKind(fileName: string): ScenarioMediaKind | null {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  const kinds = Object.keys(SCENARIO_MEDIA_RULES) as ScenarioMediaKind[]
  return kinds.find((kind) => SCENARIO_MEDIA_RULES[kind].extensions.includes(ext)) ?? null
}

const TYPE_LIST: Record<ScenarioMediaKind, string> = {
  image: 'JPG, PNG, WebP, GIF or HEIC',
  audio: 'MP3, M4A, WAV, AAC or OGG',
  video: 'MP4, MOV, WebM or M4V',
}

/**
 * Why a file can't be used, in the field's own words; null when it can. Pass `expected`
 * when the admin has already chosen the kind (Add video, Add image, Add audio).
 */
export function scenarioMediaError(file: { name: string; size: number }, expected?: ScenarioMediaKind): string | null {
  const kind = scenarioMediaKind(file.name)
  if (expected && kind !== expected) return `This file type isn't supported. Use ${TYPE_LIST[expected]}.`
  if (!kind) return "This file type isn't supported. Use an image, audio or video file."
  const rule = SCENARIO_MEDIA_RULES[kind]
  if (file.size > rule.maxBytes) {
    const noun = kind === 'image' ? 'image' : kind === 'audio' ? 'audio file' : 'video'
    return `This ${noun} is over ${rule.label}. Choose a smaller file.`
  }
  return null
}
