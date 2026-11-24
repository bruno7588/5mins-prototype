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

/** Common limits (Bruno, 2026-11-24): image 10MB, audio 50MB, MP4 video 500MB. */
export const SCENARIO_MEDIA_RULES: Record<ScenarioMediaKind, { extensions: string[]; maxBytes: number; label: string }> = {
  image: { extensions: ['jpg', 'jpeg', 'png', 'webp'], maxBytes: 10 * MB, label: '10MB' },
  audio: { extensions: ['mp3', 'm4a', 'wav'], maxBytes: 50 * MB, label: '50MB' },
  video: { extensions: ['mp4'], maxBytes: 500 * MB, label: '500MB' },
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

/** Why a file can't be used, in the field's own words; null when it can. */
export function scenarioMediaError(file: { name: string; size: number }): string | null {
  const kind = scenarioMediaKind(file.name)
  if (!kind) return "This file type isn't supported. Use JPG, PNG, WebP, MP3, M4A, WAV or MP4."
  const rule = SCENARIO_MEDIA_RULES[kind]
  if (file.size > rule.maxBytes) {
    const noun = kind === 'image' ? 'image' : kind === 'audio' ? 'audio file' : 'video'
    return `This ${noun} is over ${rule.label}. Choose a smaller file.`
  }
  return null
}
