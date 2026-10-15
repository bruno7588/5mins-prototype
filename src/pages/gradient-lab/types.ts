/* Gradient Lab shared contracts. Every part of the lab (flowers plugin, WebGL
   renderer, step UIs, preset export) codes against these types. */

/** An uploaded flower photo (src/assets/gradient-lab/flowers/manifest.json). */
export interface Flower {
  /** File name without .jpg, e.g. `peony-pink-lq3x9a` */
  id: string
  /** The uploaded file's name, for display. */
  name: string
  /** URL of the 1024 x 1024 JPEG in the shared library. */
  src: string
  /** Hue of the photo's main colour in degrees (0-359), or -1 when it is mostly neutral. Sorts the tray as a rainbow. */
  hue: number
  savedAt: string
}

export type SourceMode = 'palette' | 'photo' | 'mix'
export type NoiseType = 'white' | 'blue' | 'value' | 'simplex' | 'fbm' | 'worley' | 'paper' | 'dither' | 'halftone'
export type BlendMode = 'soft-light' | 'overlay' | 'add' | 'multiply'

/** One colour point of the gradient: a palette colour placed where it sits in the photo. */
export interface PalettePoint {
  /** #rrggbb */
  color: string
  /** 0-1, left to right */
  x: number
  /** 0-1, top to bottom */
  y: number
  /** Share of the photo this colour covers, 0-1 (all points sum to 1). */
  weight: number
}

export interface GradientSettings {
  /** 0 = the photo as it is (no gradient, grain or motion), 1 = the full abstract gradient. */
  abstraction: number
  sourceMode: SourceMode
  /** 0 = palette only, 1 = blurred photo only (used when sourceMode is 'mix'). */
  mix: number
  /** Blur of the photo source, 0-1. */
  blur: number
  /** Inverse-distance power: low = soft blends, high = distinct blobs. 1-8 */
  softness: number
  /** Zoom, 0.25-4 */
  scale: number
  /** Degrees, 0-360 */
  rotation: number
  /** -1 to 1 */
  offsetX: number
  offsetY: number
  /** UV distortion, 0-1 */
  distortion: number
  /** Swirl, 0-1 */
  swirl: number
  /** Seed for every random choice (point jitter, noise offsets). */
  seed: number
}

export interface NoiseSettings {
  type: NoiseType
  /** Grain size in output pixels, 0.5-8 */
  size: number
  /** 0-1 */
  intensity: number
  blend: BlendMode
  /** 0 = monochrome grain, 1 = full colour grain */
  colour: number
  /** 0 = even grain, 1 = grain mostly in midtones */
  luma: number
  /** 0-1: grain roughens the edges between colours (Paper Shaders' grain mixer) */
  distortion: number
}

export interface MotionSettings {
  playing: boolean
  /** 0-3, 1 = default pace */
  speed: number
  /** How far points wander from their start, 0-1 */
  randomness: number
  /** Constant drift direction in degrees, 0-360 */
  flowAngle: number
  /** Drift amount, 0-1 */
  flowStrength: number
  /** Domain-warp amount, 0-1 */
  warp: number
  /** Domain-warp octaves, 1-5 */
  warpOctaves: number
  /** Animated swirl, 0-1 */
  swirlMotion: number
  /** Seamless loop: every motion repeats exactly every loopSeconds. */
  loop: boolean
  /** 2-30 */
  loopSeconds: number
  /** Grain changes over time (at grainFps) instead of staying fixed. */
  grainAnimated: boolean
  /** Grain frames per second: 2 to 24, in steps of 2. */
  grainFps: number
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
export type RenderSize = 512 | 1024 | 2048
/** Quarter turns of the base texture (the flower photo and its palette points). */
export type TextureRotation = 0 | 90 | 180 | 270

/** Output framing. The focal point is gradient.offsetX/Y and zoom is gradient.scale. */
export interface FramingSettings {
  aspect: AspectRatio
  /** Long edge of the exported image, in px. */
  renderSize: RenderSize
  rotate: TextureRotation
}

export const ASPECT_VALUES: Record<AspectRatio, number> = {
  '1:1': 1,
  '16:9': 16 / 9,
  '9:16': 9 / 16,
  '4:3': 4 / 3,
  '3:4': 3 / 4,
}

/** Export size in px for a framing: the long edge is renderSize. */
export function outputSize(f: FramingSettings): { width: number; height: number } {
  const ratio = ASPECT_VALUES[f.aspect]
  return ratio >= 1
    ? { width: f.renderSize, height: Math.round(f.renderSize / ratio) }
    : { width: Math.round(f.renderSize * ratio), height: f.renderSize }
}

export const DEFAULT_FRAMING: FramingSettings = { aspect: '1:1', renderSize: 1024, rotate: 0 }

/** Everything needed to render one frame. */
export interface RenderInput {
  palette: PalettePoint[]
  /** The flower photo, for the 'photo' and 'mix' source modes. */
  photo: HTMLImageElement | null
  gradient: GradientSettings
  noise: NoiseSettings
  motion: MotionSettings
  /** Quarter turns of the base texture. The output aspect comes from the canvas size. */
  rotate: TextureRotation
  /** Seconds since start. With motion.loop the renderer wraps it to loopSeconds. */
  time: number
}

/** The exported shader (step 3 output). Self-contained: the palette is baked in. */
export interface ShaderPreset {
  version: 1
  name: string
  source: { flowerId: string | null; palette: PalettePoint[] }
  gradient: GradientSettings
  noise: NoiseSettings
  motion: MotionSettings
  /** Optional in files saved before framing existed. */
  framing?: FramingSettings
}

export const DEFAULT_GRADIENT: GradientSettings = {
  abstraction: 0,
  sourceMode: 'palette',
  mix: 0.35,
  blur: 0.8,
  softness: 3.5,
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  distortion: 0.25,
  swirl: 0.15,
  seed: 1,
}

export const DEFAULT_NOISE: NoiseSettings = {
  type: 'white',
  size: 1.5,
  intensity: 0.12,
  blend: 'soft-light',
  colour: 0.15,
  luma: 0.5,
  distortion: 0,
}

export const DEFAULT_MOTION: MotionSettings = {
  playing: true,
  speed: 1,
  randomness: 0.4,
  flowAngle: 45,
  flowStrength: 0.1,
  warp: 0.2,
  warpOctaves: 2,
  swirlMotion: 0.2,
  loop: true,
  loopSeconds: 10,
  grainAnimated: false,
  grainFps: 12,
}

/** Shown until a flower is picked: a neutral rainbow so the canvas is never empty. */
export const FALLBACK_PALETTE: PalettePoint[] = [
  { color: '#ff7aa2', x: 0.2, y: 0.25, weight: 0.25 },
  { color: '#ffc96b', x: 0.8, y: 0.2, weight: 0.25 },
  { color: '#7fd6c2', x: 0.25, y: 0.8, weight: 0.25 },
  { color: '#8f9bff', x: 0.75, y: 0.75, weight: 0.25 },
]


/** The lab's shared state, owned by GradientLab and passed to every step. */
export interface LabState {
  flowerId: string | null
  /** Extracted (or hand-edited) colour points. */
  palette: PalettePoint[]
  /** Palette extraction: number of colours, 3-8. */
  paletteSize: number
  /** Palette extraction: 0-1 extra saturation. */
  saturationBoost: number
  /** Palette extraction: skip the photo's dominant low-saturation background. */
  ignoreBackground: boolean
  gradient: GradientSettings
  noise: NoiseSettings
  motion: MotionSettings
  framing: FramingSettings
}

export const DEFAULT_LAB_STATE: LabState = {
  flowerId: null,
  palette: FALLBACK_PALETTE,
  paletteSize: 5,
  saturationBoost: 0.2,
  ignoreBackground: true,
  gradient: DEFAULT_GRADIENT,
  noise: DEFAULT_NOISE,
  motion: DEFAULT_MOTION,
  framing: DEFAULT_FRAMING,
}
