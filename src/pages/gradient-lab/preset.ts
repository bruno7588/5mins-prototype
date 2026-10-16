import {
  ASPECT_VALUES,
  DEFAULT_FRAMING,
  type AspectRatio,
  type BlendMode,
  type FramingSettings,
  type GradientSettings,
  type LabState,
  type MotionSettings,
  type NoiseSettings,
  type NoiseType,
  type PalettePoint,
  type RenderSize,
  type ShaderPreset,
  type SourceMode,
  type TextureRotation,
} from './types'

/* Shader preset (the Config Save / Load file): JSON in and out. parsePreset is strict about
   shape and types (throws a readable Error) and clamps numbers to the ranges
   documented in types.ts. */

const SOURCE_MODES: SourceMode[] = ['palette', 'photo', 'mix']
const NOISE_TYPES: NoiseType[] = ['white', 'blue', 'value', 'simplex', 'fbm', 'worley', 'paper', 'dither', 'halftone']
const BLEND_MODES: BlendMode[] = ['soft-light', 'overlay', 'add', 'multiply']
const MAX_PALETTE = 8
const ASPECTS = Object.keys(ASPECT_VALUES) as AspectRatio[]
const RENDER_SIZES: RenderSize[] = [512, 1024, 2048]
const ROTATIONS: TextureRotation[] = [0, 90, 180, 270]

/** The current lab as a self-contained preset (palette baked in). */
export function toPreset(lab: LabState, name: string): ShaderPreset {
  return {
    version: 1,
    name,
    source: { flowerId: lab.flowerId, palette: lab.palette.map((p) => ({ ...p })) },
    gradient: { ...lab.gradient },
    noise: { ...lab.noise },
    motion: { ...lab.motion },
    framing: { ...lab.framing },
  }
}

type Obj = Record<string, unknown>

function isObj(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function obj(v: unknown, path: string): Obj {
  if (!isObj(v)) throw new Error(`${path} must be an object.`)
  return v
}

function num(o: Obj, key: string, path: string, min: number, max: number, integer = false): number {
  const v = o[key]
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`${path}.${key} must be a number.`)
  const n = integer ? Math.round(v) : v
  return Math.min(max, Math.max(min, n))
}

function bool(o: Obj, key: string, path: string): boolean {
  const v = o[key]
  if (typeof v !== 'boolean') throw new Error(`${path}.${key} must be true or false.`)
  return v
}

function oneOf<T extends string>(o: Obj, key: string, path: string, options: readonly T[]): T {
  const v = o[key]
  if (typeof v !== 'string' || !options.includes(v as T)) {
    throw new Error(`${path}.${key} must be one of: ${options.join(', ')}.`)
  }
  return v as T
}

function parsePalette(v: unknown): PalettePoint[] {
  if (!Array.isArray(v) || v.length === 0 || v.length > MAX_PALETTE) {
    throw new Error(`source.palette must be a list of 1 to ${MAX_PALETTE} colours.`)
  }
  return v.map((raw, i) => {
    const path = `source.palette[${i}]`
    const p = obj(raw, path)
    if (typeof p.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(p.color)) {
      throw new Error(`${path}.color must be a #rrggbb colour.`)
    }
    return {
      color: p.color.toLowerCase(),
      x: num(p, 'x', path, 0, 1),
      y: num(p, 'y', path, 0, 1),
      weight: num(p, 'weight', path, 0, 1),
    }
  })
}

function parseGradient(v: unknown): GradientSettings {
  const p = 'gradient'
  const g = obj(v, p)
  return {
    // Optional: presets saved before it existed are the full gradient.
    abstraction: g.abstraction === undefined ? 1 : num(g, 'abstraction', p, 0, 1),
    sourceMode: oneOf(g, 'sourceMode', p, SOURCE_MODES),
    mix: num(g, 'mix', p, 0, 1),
    blur: num(g, 'blur', p, 0, 1),
    softness: num(g, 'softness', p, 1, 8),
    scale: num(g, 'scale', p, 0.25, 4),
    rotation: num(g, 'rotation', p, 0, 360),
    offsetX: num(g, 'offsetX', p, -1, 1),
    offsetY: num(g, 'offsetY', p, -1, 1),
    distortion: num(g, 'distortion', p, 0, 1),
    swirl: num(g, 'swirl', p, 0, 1),
    seed: num(g, 'seed', p, 1, 999, true),
  }
}

function parseNoise(v: unknown): NoiseSettings {
  const p = 'noise'
  const n = obj(v, p)
  return {
    type: oneOf(n, 'type', p, NOISE_TYPES),
    size: num(n, 'size', p, 0.5, 8),
    intensity: num(n, 'intensity', p, 0, 1),
    blend: oneOf(n, 'blend', p, BLEND_MODES),
    colour: num(n, 'colour', p, 0, 1),
    luma: num(n, 'luma', p, 0, 1),
    // Added later, so older presets have none.
    distortion: n.distortion === undefined ? 0 : num(n, 'distortion', p, 0, 1),
  }
}

function parseMotion(v: unknown): MotionSettings {
  const p = 'motion'
  const m = obj(v, p)
  const fps = m.grainFps
  if (typeof fps !== 'number' || fps < 2 || fps > 24 || fps % 2 !== 0) throw new Error('motion.grainFps must be an even number from 2 to 24.')
  return {
    playing: bool(m, 'playing', p),
    speed: num(m, 'speed', p, 0, 3),
    randomness: num(m, 'randomness', p, 0, 1),
    flowAngle: num(m, 'flowAngle', p, 0, 360),
    flowStrength: num(m, 'flowStrength', p, 0, 1),
    warp: num(m, 'warp', p, 0, 1),
    warpOctaves: num(m, 'warpOctaves', p, 1, 5, true),
    swirlMotion: num(m, 'swirlMotion', p, 0, 1),
    // Added later, so older presets have none (and render as before).
    liquid: m.liquid === undefined ? 0 : num(m, 'liquid', p, 0, 1),
    loop: bool(m, 'loop', p),
    loopSeconds: num(m, 'loopSeconds', p, 2, 30, true),
    grainAnimated: bool(m, 'grainAnimated', p),
    grainFps: fps,
  }
}

function oneOfNumber<T extends number>(o: Obj, key: string, path: string, options: readonly T[]): T {
  const v = o[key]
  if (typeof v !== 'number' || !options.includes(v as T)) {
    throw new Error(`${path}.${key} must be one of: ${options.join(', ')}.`)
  }
  return v as T
}

/** Framing is optional: files saved before it existed get the defaults. */
function parseFraming(v: unknown): FramingSettings {
  if (v === undefined) return { ...DEFAULT_FRAMING }
  const p = 'framing'
  const f = obj(v, p)
  return {
    aspect: oneOf(f, 'aspect', p, ASPECTS),
    renderSize: oneOfNumber(f, 'renderSize', p, RENDER_SIZES),
    rotate: oneOfNumber(f, 'rotate', p, ROTATIONS),
  }
}

/** The preset's name, or '' when it has none. */
export function presetName(json: unknown): string {
  return isObj(json) && typeof json.name === 'string' ? json.name : ''
}

/** Validates a parsed preset and returns the lab state it describes. */
export function parsePreset(json: unknown): Partial<LabState> {
  const root = obj(json, 'Preset')
  if (root.version !== 1) throw new Error('This isn\'t a version 1 Gradient Lab preset.')
  if (root.name !== undefined && typeof root.name !== 'string') throw new Error('name must be text.')
  const source = obj(root.source, 'source')
  const flowerId = source.flowerId
  if (flowerId !== null && typeof flowerId !== 'string') throw new Error('source.flowerId must be text or null.')
  return {
    flowerId,
    palette: parsePalette(source.palette),
    gradient: parseGradient(root.gradient),
    noise: parseNoise(root.noise),
    motion: parseMotion(root.motion),
    framing: parseFraming(root.framing),
  }
}
