/* A gradient recipe: everything about a default company image except its
   colours, which come from each tenant's theme (src/data/brandPalette.ts).
   Rendered with one of three Paper Shaders: MeshGradient (soft flowing colour),
   GrainGradient (grainy shapes: wave, dots, ripple and so on) or Dithering (a
   two-colour pixel pattern); the fields map onto their props.
   Saved in a Gradient Studio slot. Slots saved before recipes held photo
   presets (version 1); parseRecipe converts those on read. */

/** Paper GrainGradient shapes. */
export const GRAIN_SHAPES = ['wave', 'dots', 'truchet', 'corners', 'ripple', 'blob', 'sphere'] as const
export type GrainShape = (typeof GRAIN_SHAPES)[number]
/** Paper Dithering shapes and patterns. */
export const DITHER_SHAPES = ['simplex', 'warp', 'dots', 'wave', 'ripple', 'swirl', 'sphere'] as const
export type DitherShape = (typeof DITHER_SHAPES)[number]
export const DITHER_TYPES = ['random', '2x2', '4x4', '8x8'] as const
export type DitherType = (typeof DITHER_TYPES)[number]
export type ShaderKind = 'mesh' | 'grain' | 'dither'

export interface GradientRecipe {
  version: 2
  name: string
  /** Which Paper shader draws it. */
  shader: ShaderKind
  /** How many theme-derived colours the gradient uses, 3-5. */
  colours: number
  /** Organic noise distortion, 0-1 */
  distortion: number
  /** Vortex distortion, 0-1 */
  swirl: number
  /** Grain distortion on shape edges, 0-1 */
  grainMixer: number
  /** Black and white grain overlay, 0-1 */
  grainOverlay: number
  /** Grain gradient only: the shape, colour edge softness, distortion between bands and grain amount (0-1 each). */
  shape: GrainShape
  softness: number
  intensity: number
  noise: number
  /** Dithering only: the shape, the dither pattern and the pixel size (1-20). */
  ditherShape: DitherShape
  ditherType: DitherType
  pxSize: number
  /** Animation speed; 0 holds still. 0-3 */
  speed: number
  /** Starting time in ms: picks the composition, and is the still. */
  frame: number
  /** Zoom, 0.25-4 */
  scale: number
  /** Degrees, 0-360 */
  rotation: number
  /** -1 to 1 */
  offsetX: number
  offsetY: number
}

export const DEFAULT_RECIPE: GradientRecipe = {
  version: 2,
  name: 'Gradient',
  shader: 'mesh',
  colours: 4,
  distortion: 0.8,
  swirl: 0.1,
  grainMixer: 0,
  grainOverlay: 0,
  shape: 'corners',
  softness: 0.5,
  intensity: 0.5,
  noise: 0.25,
  ditherShape: 'warp',
  ditherType: '4x4',
  pxSize: 2,
  speed: 0.6,
  frame: 0,
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
}

/** Frames are ms of animation time; this keeps every composition reachable from Shuffle. */
export const MAX_FRAME = 100_000

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)

/** A finite number from `o[key]`, clamped, or the fallback. */
function num(o: Obj | undefined, key: string, fallback: number, min: number, max: number): number {
  const v = o?.[key]
  return typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback
}

/** A stable 0-1 number from a string, for spreading converted presets apart. */
function unit(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return (h >>> 0) / 4294967296
}

/** Version 1 photo preset to a recipe: the shape carries over, the photo and its palette don't.
    Those presets mostly shared one shape and differed only by photo, so the photo's
    palette picks each one's composition and turn, keeping them distinct. */
function fromLegacy(o: Obj): GradientRecipe {
  const g = isObj(o.gradient) ? o.gradient : undefined
  const noise = isObj(o.noise) ? o.noise : undefined
  const motion = isObj(o.motion) ? o.motion : undefined
  const source = isObj(o.source) ? o.source : undefined
  const paletteSize = Array.isArray(source?.palette) ? source.palette.length : DEFAULT_RECIPE.colours
  const playing = motion?.playing !== false
  const spread = unit(JSON.stringify(source?.palette ?? o.name ?? ''))
  return {
    ...DEFAULT_RECIPE,
    name: typeof o.name === 'string' ? o.name : DEFAULT_RECIPE.name,
    colours: Math.min(5, Math.max(3, paletteSize)),
    // The old shader's distortion was gentler at the same value.
    distortion: Math.min(1, num(g, 'distortion', 0.25, 0, 1) * 2 + 0.3),
    swirl: num(g, 'swirl', DEFAULT_RECIPE.swirl, 0, 1),
    grainMixer: num(noise, 'distortion', 0, 0, 1),
    grainOverlay: num(noise, 'intensity', 0, 0, 1) * 0.5,
    speed: playing ? num(motion, 'speed', 1, 0, 3) * 0.6 : 0,
    frame: Math.round((spread * MAX_FRAME) / 100) * 100,
    scale: num(g, 'scale', 1, 0.25, 4),
    rotation: Math.round((num(g, 'rotation', 0, 0, 360) + unit(String(spread)) * 360) % 360),
    offsetX: num(g, 'offsetX', 0, -1, 1),
    offsetY: num(g, 'offsetY', 0, -1, 1),
  }
}

/** A recipe from saved JSON (either version). Missing or out-of-range values fall back or clamp. */
export function parseRecipe(json: unknown): GradientRecipe {
  if (!isObj(json)) throw new Error('A recipe must be an object.')
  if (json.version !== 2) return fromLegacy(json)
  const d = DEFAULT_RECIPE
  return {
    version: 2,
    name: typeof json.name === 'string' ? json.name : d.name,
    shader: json.shader === 'grain' || json.shader === 'dither' ? json.shader : 'mesh',
    colours: Math.round(num(json, 'colours', d.colours, 3, 5)),
    distortion: num(json, 'distortion', d.distortion, 0, 1),
    swirl: num(json, 'swirl', d.swirl, 0, 1),
    grainMixer: num(json, 'grainMixer', d.grainMixer, 0, 1),
    grainOverlay: num(json, 'grainOverlay', d.grainOverlay, 0, 1),
    shape: GRAIN_SHAPES.includes(json.shape as GrainShape) ? (json.shape as GrainShape) : d.shape,
    softness: num(json, 'softness', d.softness, 0, 1),
    intensity: num(json, 'intensity', d.intensity, 0, 1),
    noise: num(json, 'noise', d.noise, 0, 1),
    ditherShape: DITHER_SHAPES.includes(json.ditherShape as DitherShape) ? (json.ditherShape as DitherShape) : d.ditherShape,
    ditherType: DITHER_TYPES.includes(json.ditherType as DitherType) ? (json.ditherType as DitherType) : d.ditherType,
    pxSize: num(json, 'pxSize', d.pxSize, 1, 20),
    speed: num(json, 'speed', d.speed, 0, 3),
    frame: Math.round(num(json, 'frame', d.frame, 0, MAX_FRAME)),
    scale: num(json, 'scale', d.scale, 0.25, 4),
    rotation: num(json, 'rotation', d.rotation, 0, 360),
    offsetX: num(json, 'offsetX', d.offsetX, -1, 1),
    offsetY: num(json, 'offsetY', d.offsetY, -1, 1),
  }
}

/** parseRecipe, or null for anything unreadable. */
export function readRecipe(json: unknown): GradientRecipe | null {
  try {
    return parseRecipe(json)
  } catch {
    return null
  }
}

/** Paper Shaders MeshGradient props for a recipe and its colours. */
export function meshProps(recipe: GradientRecipe, colors: string[]) {
  const { distortion, swirl, grainMixer, grainOverlay, speed, frame, scale, rotation, offsetX, offsetY } = recipe
  return { colors, distortion, swirl, grainMixer, grainOverlay, speed, frame, scale, rotation, offsetX, offsetY }
}

/** Paper Shaders GrainGradient props: the darkest colour is the background, the rest the bands. */
export function grainProps(recipe: GradientRecipe, colours: string[]) {
  const { shape, softness, intensity, noise, speed, frame, scale, rotation, offsetX, offsetY } = recipe
  const [back, colors] = grainColours(colours)
  return { colorBack: back, colors, shape, softness, intensity, noise, speed, frame, scale, rotation, offsetX, offsetY }
}

/** The palette's darker accent (third colour) as the grain gradient's background, the others as its bands. */
export function grainColours(colours: string[]): [string, string[]] {
  const back = colours[2] ?? colours[colours.length - 1]
  return [back, colours.filter((_, i) => i !== 2)]
}

/** Dithering's two colours: the darker accent dithered over the lighter tint. */
export function ditherColours(colours: string[]): [back: string, front: string] {
  return [colours[1] ?? colours[0], colours[2] ?? colours[0]]
}

/** Paper Shaders Dithering props. */
export function ditherProps(recipe: GradientRecipe, colours: string[]) {
  const { ditherShape, ditherType, pxSize, speed, frame, scale, rotation, offsetX, offsetY } = recipe
  const [colorBack, colorFront] = ditherColours(colours)
  return { colorBack, colorFront, shape: ditherShape, type: ditherType, size: pxSize, speed, frame, scale, rotation, offsetX, offsetY }
}
