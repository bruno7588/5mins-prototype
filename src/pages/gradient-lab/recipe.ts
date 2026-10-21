/* A gradient recipe: everything about a default company image except its
   colours, which come from each tenant's theme (src/data/brandPalette.ts).
   Rendered with one of three Paper Shaders: MeshGradient (soft flowing colour),
   GrainGradient (grainy shapes: wave, dots, ripple and so on) or Dithering (a
   two-colour pixel pattern); the fields map onto their props. Or with one of
   seven canvas patterns (src/data/canvasPatterns.ts): the sine stack, the dot
   sweep, pixel rain, the halftone wave, isometric cubes, the kaleidoscope or Truchet flow.
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
/** The shader kinds drawn in 2D canvas rather than by Paper Shaders. */
export const CANVAS_PATTERNS = ['sine', 'sweep', 'rain', 'halftone', 'cubes', 'kaleido', 'truchet'] as const
export type CanvasPattern = (typeof CANVAS_PATTERNS)[number]
export type ShaderKind = 'mesh' | 'grain' | 'dither' | CanvasPattern
export const isCanvasPattern = (kind: ShaderKind): kind is CanvasPattern => (CANVAS_PATTERNS as readonly string[]).includes(kind)

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
  /** Sine stack only. Gap between lines and wavelength, as % of the frame (2-20, 20-200). */
  sineSpacing: number
  sineWavelength: number
  /** Phase shift between neighbouring lines, radians (0.05-1.5). */
  sinePhase: number
  /** Wave height as a share of the most the lines can take without crossing (0-1). */
  sineAmplitude: number
  /** How far the slow swell raises and lowers the waves (0-0.38). */
  sineEnvelope: number
  /** Line width, % of the frame (0.2-3). */
  sineLineWidth: number
  /** Where the line in the second colour sits, top to bottom (0-1). */
  sineHighlight: number
  /** Dot sweep only. Grid gap and the smallest and largest dot radius, as % of the frame. */
  sweepSpacing: number
  sweepDotMin: number
  sweepDotMax: number
  /** Seconds per turn of the arm (1-12). */
  sweepTurn: number
  /** How much each turn surges and settles (0-0.9). */
  sweepSurge: number
  /** How long the dots stay large behind the arm, radians (0.2-4). */
  sweepTrail: number
  /** Width of the arm's band of dots in the second colour, in grid steps (0-4). */
  sweepArm: number
  /** Pixel rain only. Cell size, % of the frame (2-15), and the square's share of it (0.2-1). */
  rainCell: number
  rainSquare: number
  /** Share of columns that stay dry (0-0.9). */
  rainDry: number
  /** Trail length in cells: the shortest, and how much longer a column's can be (1-20, 0-30). */
  rainTrailMin: number
  rainTrailRange: number
  /** Multiplies each column's fall time (2, 3, 4 or 6 s) (0.25-4). */
  rainFall: number
  /** Picks a different scatter of columns (0-99). */
  rainSeed: number
  /** Halftone wave only. Dot spacing, % of the frame (2-15), and the largest dot's radius as a share of it (0.1-0.7). */
  halftoneSpacing: number
  halftoneDot: number
  /** The two travelling waves of tone: angle (degrees), wavelength (% of the frame) and seconds per wave. */
  halftoneAngle: number
  halftoneWavelength: number
  halftoneTime: number
  halftoneAngle2: number
  halftoneWavelength2: number
  halftoneTime2: number
  /** How much the first wave leads the second (0-1). */
  halftoneMix: number
  /** Where the tone starts and ends: dots appear above the start and merge by the end (0-1). */
  halftoneStart: number
  halftoneEnd: number
  /** Isometric cubes only. Half a cube's width, % of the frame (3-25), and how high a cube lifts (0-3 quarter-heights). */
  cubeSize: number
  cubeLift: number
  /** Seconds per lift wave (1-24), and how far the wave turns across and down the frame (-10 to 10). */
  cubeTime: number
  cubeWaveX: number
  cubeWaveY: number
  /** Edge line width, % of the frame (0-1). */
  cubeEdge: number
  /** Kaleidoscope only. Mirror triangle side, % of the frame (10-80); the large and small disc radius as shares of it (0.05-0.6, 0-0.4). */
  kaleidoSize: number
  kaleidoDisc: number
  kaleidoDot: number
  /** Seconds per leg of the discs' route through the triangle (0.5-6), and how far the small disc runs behind, in seconds (0-12). */
  kaleidoLeg: number
  kaleidoLag: number
  /** Truchet flow only. Tiles across the frame (2-20) and line width as a share of a tile (0.05-0.5). */
  truchetTiles: number
  truchetLine: number
  /** Seconds a quarter turn takes (0.2-2), seconds a wave takes to cross the frame (0.5-3), and the turn's overshoot (0-3). */
  truchetTurn: number
  truchetCross: number
  truchetOvershoot: number
  /** Seconds for the four waves to play through and loop (4-30). */
  truchetCycle: number
  /** Picks a different arrangement of tiles (0-99). */
  truchetSeed: number
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
  sineSpacing: 6.2,
  sineWavelength: 78,
  sinePhase: 0.42,
  sineAmplitude: 1,
  sineEnvelope: 0.3,
  sineLineWidth: 0.95,
  sineHighlight: 0.62,
  sweepSpacing: 6.4,
  sweepDotMin: 0.55,
  sweepDotMax: 2.7,
  sweepTurn: 3,
  sweepSurge: 0.5,
  sweepTrail: 1.25,
  sweepArm: 1.15,
  rainCell: 5.2,
  rainSquare: 0.8,
  rainDry: 0.3,
  rainTrailMin: 5,
  rainTrailRange: 12,
  rainFall: 1,
  rainSeed: 0,
  halftoneSpacing: 6.4,
  halftoneDot: 0.43,
  halftoneAngle: -35.5,
  halftoneWavelength: 120,
  halftoneTime: 4,
  halftoneAngle2: 51.6,
  halftoneWavelength2: 210,
  halftoneTime2: 6,
  halftoneMix: 0.72,
  halftoneStart: 0.12,
  halftoneEnd: 0.98,
  cubeSize: 9,
  cubeLift: 1.5,
  cubeTime: 4,
  cubeWaveX: 5,
  cubeWaveY: 3,
  cubeEdge: 0.16,
  kaleidoSize: 34,
  kaleidoDisc: 0.34,
  kaleidoDot: 0.12,
  kaleidoLeg: 2,
  kaleidoLag: 7,
  truchetTiles: 5,
  truchetLine: 0.2,
  truchetTurn: 0.65,
  truchetCross: 2.2,
  truchetOvershoot: 1.1,
  truchetCycle: 12,
  truchetSeed: 0,
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
    shader: (['grain', 'dither', ...CANVAS_PATTERNS] as readonly string[]).includes(json.shader as string) ? (json.shader as ShaderKind) : 'mesh',
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
    sineSpacing: num(json, 'sineSpacing', d.sineSpacing, 2, 20),
    sineWavelength: num(json, 'sineWavelength', d.sineWavelength, 20, 200),
    sinePhase: num(json, 'sinePhase', d.sinePhase, 0.05, 1.5),
    sineAmplitude: num(json, 'sineAmplitude', d.sineAmplitude, 0, 1),
    sineEnvelope: num(json, 'sineEnvelope', d.sineEnvelope, 0, 0.38),
    sineLineWidth: num(json, 'sineLineWidth', d.sineLineWidth, 0.2, 3),
    sineHighlight: num(json, 'sineHighlight', d.sineHighlight, 0, 1),
    sweepSpacing: num(json, 'sweepSpacing', d.sweepSpacing, 3, 15),
    sweepDotMin: num(json, 'sweepDotMin', d.sweepDotMin, 0, 3),
    sweepDotMax: num(json, 'sweepDotMax', d.sweepDotMax, 0.5, 6),
    sweepTurn: num(json, 'sweepTurn', d.sweepTurn, 1, 12),
    sweepSurge: num(json, 'sweepSurge', d.sweepSurge, 0, 0.9),
    sweepTrail: num(json, 'sweepTrail', d.sweepTrail, 0.2, 4),
    sweepArm: num(json, 'sweepArm', d.sweepArm, 0, 4),
    rainCell: num(json, 'rainCell', d.rainCell, 2, 15),
    rainSquare: num(json, 'rainSquare', d.rainSquare, 0.2, 1),
    rainDry: num(json, 'rainDry', d.rainDry, 0, 0.9),
    rainTrailMin: Math.round(num(json, 'rainTrailMin', d.rainTrailMin, 1, 20)),
    rainTrailRange: Math.round(num(json, 'rainTrailRange', d.rainTrailRange, 0, 30)),
    rainFall: num(json, 'rainFall', d.rainFall, 0.25, 4),
    rainSeed: Math.round(num(json, 'rainSeed', d.rainSeed, 0, 99)),
    halftoneSpacing: num(json, 'halftoneSpacing', d.halftoneSpacing, 2, 15),
    halftoneDot: num(json, 'halftoneDot', d.halftoneDot, 0.1, 0.7),
    halftoneAngle: num(json, 'halftoneAngle', d.halftoneAngle, -180, 180),
    halftoneWavelength: num(json, 'halftoneWavelength', d.halftoneWavelength, 20, 400),
    halftoneTime: num(json, 'halftoneTime', d.halftoneTime, 1, 24),
    halftoneAngle2: num(json, 'halftoneAngle2', d.halftoneAngle2, -180, 180),
    halftoneWavelength2: num(json, 'halftoneWavelength2', d.halftoneWavelength2, 20, 400),
    halftoneTime2: num(json, 'halftoneTime2', d.halftoneTime2, 1, 24),
    halftoneMix: num(json, 'halftoneMix', d.halftoneMix, 0, 1),
    halftoneStart: num(json, 'halftoneStart', d.halftoneStart, 0, 1),
    halftoneEnd: num(json, 'halftoneEnd', d.halftoneEnd, 0, 1),
    cubeSize: num(json, 'cubeSize', d.cubeSize, 3, 25),
    cubeLift: num(json, 'cubeLift', d.cubeLift, 0, 3),
    cubeTime: num(json, 'cubeTime', d.cubeTime, 1, 24),
    cubeWaveX: num(json, 'cubeWaveX', d.cubeWaveX, -10, 10),
    cubeWaveY: num(json, 'cubeWaveY', d.cubeWaveY, -10, 10),
    cubeEdge: num(json, 'cubeEdge', d.cubeEdge, 0, 1),
    kaleidoSize: num(json, 'kaleidoSize', d.kaleidoSize, 10, 80),
    kaleidoDisc: num(json, 'kaleidoDisc', d.kaleidoDisc, 0.05, 0.6),
    kaleidoDot: num(json, 'kaleidoDot', d.kaleidoDot, 0, 0.4),
    kaleidoLeg: num(json, 'kaleidoLeg', d.kaleidoLeg, 0.5, 6),
    kaleidoLag: num(json, 'kaleidoLag', d.kaleidoLag, 0, 12),
    truchetTiles: Math.round(num(json, 'truchetTiles', d.truchetTiles, 2, 20)),
    truchetLine: num(json, 'truchetLine', d.truchetLine, 0.05, 0.5),
    truchetTurn: num(json, 'truchetTurn', d.truchetTurn, 0.2, 2),
    truchetCross: num(json, 'truchetCross', d.truchetCross, 0.5, 3),
    truchetOvershoot: num(json, 'truchetOvershoot', d.truchetOvershoot, 0, 3),
    truchetCycle: num(json, 'truchetCycle', d.truchetCycle, 4, 30),
    truchetSeed: Math.round(num(json, 'truchetSeed', d.truchetSeed, 0, 99)),
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

/** How many palette colours a recipe takes: dithering always takes all 5, for both brand support colours;
    the canvas patterns always 3. */
export const paletteCount = (recipe: GradientRecipe) => (recipe.shader === 'dither' ? 5 : isCanvasPattern(recipe.shader) ? 3 : recipe.colours)

/** A canvas pattern's colours: the accent behind, the darker accent for the main marks, the pale support for the highlight. */
export const patternColours = (colours: string[]) => ({ bg: colours[0], fg: colours[2] ?? colours[0], fg2: colours[1] ?? colours[0] })

/** Dithering's dots: the darker accent, drawn on a see-through background. */
export const ditherFront = (colours: string[]) => colours[2] ?? colours[0]
export const DITHER_BACK = 'rgba(0, 0, 0, 0)'

/** Behind the dots: a soft gradient between the two brand support colours (header and nav). */
export function ditherBackdrop(colours: string[]): [from: string, to: string] {
  const from = colours[1] ?? colours[0]
  return [from, colours[4] ?? colours[3] ?? from]
}
export const ditherBackdropCss = (colours: string[]) => `linear-gradient(135deg, ${ditherBackdrop(colours).join(', ')})`

/** Paper Shaders Dithering props. The backdrop is painted behind them by the caller. */
export function ditherProps(recipe: GradientRecipe, colours: string[]) {
  const { ditherShape, ditherType, pxSize, speed, frame, scale, rotation, offsetX, offsetY } = recipe
  return { colorBack: DITHER_BACK, colorFront: ditherFront(colours), shape: ditherShape, type: ditherType, size: pxSize, speed, frame, scale, rotation, offsetX, offsetY }
}
