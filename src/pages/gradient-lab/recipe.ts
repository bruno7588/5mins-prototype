/* A gradient recipe: everything about a default company image except its
   colours, which come from each tenant's theme (src/data/brandPalette.ts).
   Rendered with one of three Paper Shaders: MeshGradient (soft flowing colour),
   GrainGradient (grainy shapes: wave, dots, ripple and so on) or Dithering (a
   two-colour pixel pattern); the fields map onto their props. Or with one of
   thirteen canvas patterns (src/data/canvasPatterns.ts): the sine stack, the dot
   sweep, pixel rain, the halftone wave, isometric cubes, the kaleidoscope,
   Truchet flow, the dot tunnel, contours, the halftone bloom, confetti, scan bars
   or the dot ripple. Or the light form (src/data/glowShader.ts): one soft shape lit
   from a side, its colour ramp built from the three theme colours.
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
export const CANVAS_PATTERNS = ['sine', 'sweep', 'rain', 'halftone', 'cubes', 'kaleido', 'truchet', 'tunnel', 'contours', 'bloom', 'confetti', 'scan', 'ripple'] as const
export type CanvasPattern = (typeof CANVAS_PATTERNS)[number]
/** Light form shapes (src/data/glowShader.ts). */
export const GLOW_FORMS = ['arch', 'comet', 'orb', 'dome', 'crossing', 'wave', 'prism'] as const
export type GlowForm = (typeof GLOW_FORMS)[number]
export type ShaderKind = 'mesh' | 'grain' | 'dither' | 'glow' | CanvasPattern
/** The pixel finish: off, or ordered dithering with a Bayer matrix of this size (src/data/pixelFinish.ts). */
export const FINISHES = ['off', '2x2', '4x4', '8x8'] as const
export type Finish = (typeof FINISHES)[number]
export const isCanvasPattern = (kind: ShaderKind): kind is CanvasPattern => (CANVAS_PATTERNS as readonly string[]).includes(kind)
/** Drawn in the tenant's three theme colours as they are, rather than a blended palette: the canvas patterns and dithering. */
export const usesThemeColours = (kind: ShaderKind) => kind === 'dither' || kind === 'glow' || isCanvasPattern(kind)

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
  /** Dot tunnel only. Dots per ring (6-80), ring radius (0.5-4), depth between rings (0.15-1.5) and how far each ring twists with depth (-2 to 2). */
  tunnelDots: number
  tunnelRadius: number
  tunnelGap: number
  tunnelTwist: number
  /** Dot steps the tunnel turns every 12 s (-20 to 20), and dot size (0.01-0.2). */
  tunnelSpin: number
  tunnelDot: number
  /** Seconds for a ring to move up to the next (0.25-4), and how far back the tunnel fades out (4-30). */
  tunnelRingTime: number
  tunnelDepth: number
  /** Every this many rings is in the second colour; 0 for none (0-12). */
  tunnelHighlight: number
  /** Contours only. Height between lines (0.03-0.3), every this many lines an index line (0 for none, 0-10), and the two line widths, % of the frame (0.05-2). */
  contourStep: number
  contourIndex: number
  contourMinor: number
  contourMajor: number
  /** Seconds for the terrain to morph through and back (4-60), and how many lines rise out of the peaks in that time (-10 to 10). */
  contourMorph: number
  contourDrift: number
  /** Halftone bloom only. Dot spacing, % of the frame (2-15), and the largest dot's radius as a share of it (0.1-0.7). */
  bloomSpacing: number
  bloomDot: number
  /** The centre glow's size and how much it flares as a ring leaves, % of the frame (4-60, 0-20). */
  bloomGlow: number
  bloomFlare: number
  /** Seconds for a ring to reach the edge (1-20), rings in flight at once (1-6), and their strength (0-1.5). */
  bloomPeriod: number
  bloomRings: number
  bloomStrength: number
  /** Ring width as it leaves the centre and as it reaches the edge, % of the frame (1-40). */
  bloomRingStart: number
  bloomRingEnd: number
  /** Confetti only. Pieces across the frame (4-60), their size (0.3-3, 1 as drawn), the share in the near, faster layer (0-1), the share drawn as rectangles rather than discs (0-1) and in the second colour (0-1). */
  confettiCount: number
  confettiSize: number
  confettiNear: number
  confettiRects: number
  confettiMix: number
  /** Seconds for the far layer to fall through the frame; the near one falls twice as fast (3-40). How far the pieces sway, % of the frame (0-10). */
  confettiFall: number
  confettiSway: number
  /** Picks a different scatter of pieces (0-99). */
  confettiSeed: number
  /** Scan bars only. Bars down the frame (3-24) and their thickness as a share of the pitch (0.1-0.95). */
  scanBars: number
  scanThickness: number
  /** Seconds for one sweep across (0.5-12), and the share of it spent moving rather than resting (0.2-1). */
  scanPass: number
  scanSweep: number
  /** The cut's width at rest and at full speed, % of the frame (0-20). */
  scanGapMin: number
  scanGapMax: number
  /** How far the outer bars lag the middle ones, in sweeps, so the cut is a chevron (0-1.5). */
  scanChevron: number
  /** Dot ripple only. Dot spacing and resting dot radius, % of the frame (3-15, 0.2-3). */
  rippleSpacing: number
  rippleDot: number
  /** Seconds between drops; eight drops play through, then it loops (0.5-6). */
  rippleInterval: number
  /** How fast a ripple spreads, % of the frame per second (5-60), its wavelength and width (% of the frame, 4-60 and 2-40), and how long it takes to fade, seconds (0.5-8). */
  rippleSpeed: number
  rippleWavelength: number
  rippleWidth: number
  rippleFade: number
  /** How far a ripple pushes the dots aside (0-15) and how much it swells them (0-5). */
  ripplePush: number
  rippleSwell: number
  /** Picks a different scatter of drops (0-99). */
  rippleSeed: number
  /** Light form only. The shape, and how much it grows (0.5 as drawn), all 0-1 bar the light. */
  glowForm: GlowForm
  glowThickness: number
  /** How far the hot rim reaches into the form. */
  glowRim: number
  /** How hot the rim burns. */
  glowStrength: number
  /** How far in the body colour holds before the centre goes dark. */
  glowDepth: number
  /** The cool band just outside the lit rim. */
  glowFringe: number
  /** How much the background lifts on the lit side. */
  glowHaze: number
  /** Where the light comes from, degrees (0 from the right, 90 from the top). */
  glowLight: number
  /** Canvas patterns only. How far the marks move from flat navigation items and selected
      item colours into a slowly drifting blend of the two (0-1); the header bar stays flat. */
  flow: number
  /** The pixel finish over any type, and its pixel size as % of the frame (0.3-4). */
  finish: Finish
  finishPixel: number
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
  tunnelDots: 30,
  tunnelRadius: 1.6,
  tunnelGap: 0.45,
  tunnelTwist: 0.32,
  tunnelSpin: 4,
  tunnelDot: 0.05,
  tunnelRingTime: 1,
  tunnelDepth: 16,
  tunnelHighlight: 4,
  contourStep: 0.085,
  contourIndex: 4,
  contourMinor: 0.3,
  contourMajor: 0.6,
  contourMorph: 12,
  contourDrift: 4,
  bloomSpacing: 5.6,
  bloomDot: 0.47,
  bloomGlow: 24,
  bloomFlare: 5,
  bloomPeriod: 6,
  bloomRings: 3,
  bloomStrength: 0.85,
  bloomRingStart: 5,
  bloomRingEnd: 16,
  confettiCount: 19,
  confettiSize: 1,
  confettiNear: 0.45,
  confettiRects: 0.72,
  confettiMix: 0.5,
  confettiFall: 12,
  confettiSway: 2.5,
  confettiSeed: 0,
  scanBars: 8,
  scanThickness: 0.58,
  scanPass: 3,
  scanSweep: 0.6,
  scanGapMin: 1.4,
  scanGapMax: 7.5,
  scanChevron: 0.5,
  rippleSpacing: 6,
  rippleDot: 0.95,
  rippleInterval: 1.5,
  rippleSpeed: 20,
  rippleWavelength: 17,
  rippleWidth: 10,
  rippleFade: 2.2,
  ripplePush: 5,
  rippleSwell: 2.1,
  rippleSeed: 0,
  glowForm: 'arch',
  glowThickness: 0.5,
  glowRim: 0.45,
  glowStrength: 0.6,
  glowDepth: 0.5,
  glowFringe: 0.5,
  glowHaze: 0.4,
  glowLight: -40,
  flow: 1,
  finish: 'off',
  finishPixel: 0.8,
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
    shader: (['grain', 'dither', 'glow', ...CANVAS_PATTERNS] as readonly string[]).includes(json.shader as string) ? (json.shader as ShaderKind) : 'mesh',
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
    tunnelDots: Math.round(num(json, 'tunnelDots', d.tunnelDots, 6, 80)),
    tunnelRadius: num(json, 'tunnelRadius', d.tunnelRadius, 0.5, 4),
    tunnelGap: num(json, 'tunnelGap', d.tunnelGap, 0.15, 1.5),
    tunnelTwist: num(json, 'tunnelTwist', d.tunnelTwist, -2, 2),
    tunnelSpin: num(json, 'tunnelSpin', d.tunnelSpin, -20, 20),
    tunnelDot: num(json, 'tunnelDot', d.tunnelDot, 0.01, 0.2),
    tunnelRingTime: num(json, 'tunnelRingTime', d.tunnelRingTime, 0.25, 4),
    tunnelDepth: num(json, 'tunnelDepth', d.tunnelDepth, 4, 30),
    tunnelHighlight: Math.round(num(json, 'tunnelHighlight', d.tunnelHighlight, 0, 12)),
    contourStep: num(json, 'contourStep', d.contourStep, 0.03, 0.3),
    contourIndex: Math.round(num(json, 'contourIndex', d.contourIndex, 0, 10)),
    contourMinor: num(json, 'contourMinor', d.contourMinor, 0.05, 2),
    contourMajor: num(json, 'contourMajor', d.contourMajor, 0.05, 2),
    contourMorph: num(json, 'contourMorph', d.contourMorph, 4, 60),
    contourDrift: num(json, 'contourDrift', d.contourDrift, -10, 10),
    bloomSpacing: num(json, 'bloomSpacing', d.bloomSpacing, 2, 15),
    bloomDot: num(json, 'bloomDot', d.bloomDot, 0.1, 0.7),
    bloomGlow: num(json, 'bloomGlow', d.bloomGlow, 4, 60),
    bloomFlare: num(json, 'bloomFlare', d.bloomFlare, 0, 20),
    bloomPeriod: num(json, 'bloomPeriod', d.bloomPeriod, 1, 20),
    bloomRings: Math.round(num(json, 'bloomRings', d.bloomRings, 1, 6)),
    bloomStrength: num(json, 'bloomStrength', d.bloomStrength, 0, 1.5),
    bloomRingStart: num(json, 'bloomRingStart', d.bloomRingStart, 1, 40),
    bloomRingEnd: num(json, 'bloomRingEnd', d.bloomRingEnd, 1, 40),
    confettiCount: Math.round(num(json, 'confettiCount', d.confettiCount, 4, 60)),
    confettiSize: num(json, 'confettiSize', d.confettiSize, 0.3, 3),
    confettiNear: num(json, 'confettiNear', d.confettiNear, 0, 1),
    confettiRects: num(json, 'confettiRects', d.confettiRects, 0, 1),
    confettiMix: num(json, 'confettiMix', d.confettiMix, 0, 1),
    confettiFall: num(json, 'confettiFall', d.confettiFall, 3, 40),
    confettiSway: num(json, 'confettiSway', d.confettiSway, 0, 10),
    confettiSeed: Math.round(num(json, 'confettiSeed', d.confettiSeed, 0, 99)),
    scanBars: Math.round(num(json, 'scanBars', d.scanBars, 3, 24)),
    scanThickness: num(json, 'scanThickness', d.scanThickness, 0.1, 0.95),
    scanPass: num(json, 'scanPass', d.scanPass, 0.5, 12),
    scanSweep: num(json, 'scanSweep', d.scanSweep, 0.2, 1),
    scanGapMin: num(json, 'scanGapMin', d.scanGapMin, 0, 20),
    scanGapMax: num(json, 'scanGapMax', d.scanGapMax, 0, 20),
    scanChevron: num(json, 'scanChevron', d.scanChevron, 0, 1.5),
    rippleSpacing: num(json, 'rippleSpacing', d.rippleSpacing, 3, 15),
    rippleDot: num(json, 'rippleDot', d.rippleDot, 0.2, 3),
    rippleInterval: num(json, 'rippleInterval', d.rippleInterval, 0.5, 6),
    rippleSpeed: num(json, 'rippleSpeed', d.rippleSpeed, 5, 60),
    rippleWavelength: num(json, 'rippleWavelength', d.rippleWavelength, 4, 60),
    rippleWidth: num(json, 'rippleWidth', d.rippleWidth, 2, 40),
    rippleFade: num(json, 'rippleFade', d.rippleFade, 0.5, 8),
    ripplePush: num(json, 'ripplePush', d.ripplePush, 0, 15),
    rippleSwell: num(json, 'rippleSwell', d.rippleSwell, 0, 5),
    rippleSeed: Math.round(num(json, 'rippleSeed', d.rippleSeed, 0, 99)),
    glowForm: GLOW_FORMS.includes(json.glowForm as GlowForm) ? (json.glowForm as GlowForm) : d.glowForm,
    glowThickness: num(json, 'glowThickness', d.glowThickness, 0, 1),
    glowRim: num(json, 'glowRim', d.glowRim, 0, 1),
    glowStrength: num(json, 'glowStrength', d.glowStrength, 0, 1),
    glowDepth: num(json, 'glowDepth', d.glowDepth, 0, 1),
    glowFringe: num(json, 'glowFringe', d.glowFringe, 0, 1),
    glowHaze: num(json, 'glowHaze', d.glowHaze, 0, 1),
    glowLight: num(json, 'glowLight', d.glowLight, -180, 180),
    flow: num(json, 'flow', d.flow, 0, 1),
    finish: FINISHES.includes(json.finish as Finish) ? (json.finish as Finish) : d.finish,
    finishPixel: num(json, 'finishPixel', d.finishPixel, 0.3, 4),
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

/** How many colours a recipe takes: the three theme colours for dithering, the light form and the canvas patterns. */
export const paletteCount = (recipe: GradientRecipe) => (usesThemeColours(recipe.shader) ? 3 : recipe.colours)

/** A canvas pattern's colours, straight from the theme (recipeColours): the header bar
    leads as the background, navigation items draw the main marks, the selected item the highlights. */
export const patternColours = (colours: string[]) => ({ bg: colours[0], fg: colours[1] ?? colours[0], fg2: colours[2] ?? colours[0] })

/** Dithering's dots: the navigation items colour, drawn on a see-through background. */
export const ditherFront = (colours: string[]) => colours[1] ?? colours[0]
export const DITHER_BACK = 'rgba(0, 0, 0, 0)'

/** Behind the dots: the header bar, leading for the first half, then fading into the selected item in the far corner. */
export function ditherBackdrop(colours: string[]): [from: string, to: string] {
  return [colours[0], colours[2] ?? colours[0]]
}
/** Where the header bar starts fading into the selected item, along the diagonal. */
export const DITHER_BACKDROP_HOLD = 0.5
export const ditherBackdropCss = (colours: string[]) => {
  const [from, to] = ditherBackdrop(colours)
  return `linear-gradient(135deg, ${from} ${DITHER_BACKDROP_HOLD * 100}%, ${to})`
}

/** Paper Shaders Dithering props. The backdrop is painted behind them by the caller. */
export function ditherProps(recipe: GradientRecipe, colours: string[]) {
  const { ditherShape, ditherType, pxSize, speed, frame, scale, rotation, offsetX, offsetY } = recipe
  return { colorBack: DITHER_BACK, colorFront: ditherFront(colours), shape: ditherShape, type: ditherType, size: pxSize, speed, frame, scale, rotation, offsetX, offsetY }
}
