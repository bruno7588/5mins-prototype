import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDialKitController, type DialConfig } from 'dialkit'
import { DEFAULT_THEME, type ThemeSet } from '@/data/brandTheme'
import {
  DITHER_SHAPES,
  DITHER_TYPES,
  FINISHES,
  GRAIN_SHAPES,
  isCanvasPattern,
  MAX_FRAME,
  type CanvasPattern,
  type DitherShape,
  type DitherType,
  type Finish,
  type GradientRecipe,
  type GrainShape,
  type ShaderKind,
} from '../recipe'

/* The DialKit panel for each tab of the controls column, rendered inline:
   "Gradient" (shader type and shape, and the theme colours to preview it in) or
   "Shader" (motion, grain and the pixel finish). The controls follow the shader type: the mesh
   gradient has distortion, swirl and two grain sliders; the grain gradient has
   a shape, softness, intensity and noise; dithering has a shape, a pattern and
   a pixel size; each canvas pattern has a slider for every value that shapes
   it (PATTERN_DIALS). Only the open tab's panel is mounted, seeded from lab
   state on mount, so switching tabs never loses a value. Two-way sync without
   echo loops:
   - DialKit -> lab: when the panel's values change, the recipe and preview are
     rebuilt from the panel and pushed only where they differ.
   - lab -> DialKit: values changed outside the panel (focal pad, Randomise
     Framing, wheel zoom, a loaded slot) are pushed in with setValues.
   The page's focal pad owns the offset, so the panel has no offset control. */

export type DialsKind = 'gradient' | 'shader'

/** What the Studio edits: the recipe, and the theme colours it is previewed in (not saved). */
export interface LabState {
  recipe: GradientRecipe
  preview: ThemeSet
  playing: boolean
}

/** DialKit keys double as labels (first letter capitalised), so they are sentence case. */
interface PanelValues {
  Gradient: {
    type: ShaderKind
    shape?: GrainShape | DitherShape
    pattern?: DitherType
    'pixel size'?: number
    /** Absent for dithering, which always uses two colours. */
    colours?: number
    distortion?: number
    swirl?: number
    softness?: number
    intensity?: number
    scale: number
    rotation: number
    frame: number
    /** A canvas pattern's own sliders, keyed by their label (PATTERN_DIALS). */
    [dial: string]: unknown
  }
  'Preview colours': { 'header bar': string; 'navigation items': string; 'selected item': string }
  Motion: { playing: boolean; speed: number }
  /** Absent for dithering. */
  Grain?: { mixer?: number; overlay?: number; noise?: number }
  /** The pixel finish, for every type. */
  Finish: { pattern: Finish; 'pixel size': number }
}

type Folder = keyof PanelValues

const SHADER_OPTIONS: { value: ShaderKind; label: string }[] = [
  { value: 'mesh', label: 'Mesh gradient' },
  { value: 'grain', label: 'Grain gradient' },
  { value: 'dither', label: 'Dithering' },
  { value: 'sine', label: 'Sine stack' },
  { value: 'sweep', label: 'Dot sweep' },
  { value: 'rain', label: 'Pixel rain' },
  { value: 'halftone', label: 'Halftone wave' },
  { value: 'cubes', label: 'Isometric cubes' },
  { value: 'kaleido', label: 'Kaleidoscope' },
  { value: 'truchet', label: 'Truchet flow' },
  { value: 'tunnel', label: 'Dot tunnel' },
  { value: 'contours', label: 'Contours' },
  { value: 'bloom', label: 'Halftone bloom' },
  { value: 'confetti', label: 'Confetti' },
  { value: 'scan', label: 'Scan bars' },
  { value: 'ripple', label: 'Dot ripple' },
]

type NumberField = { [K in keyof GradientRecipe]: GradientRecipe[K] extends number ? K : never }[keyof GradientRecipe]

/** Each canvas pattern's sliders: label, recipe field, min, max, step. Ranges match parseRecipe. */
const PATTERN_DIALS: Record<CanvasPattern, [string, NumberField, number, number, number][]> = {
  sine: [
    ['spacing', 'sineSpacing', 2, 20, 0.1],
    ['wavelength', 'sineWavelength', 20, 200, 1],
    ['phase shift', 'sinePhase', 0.05, 1.5, 0.01],
    ['amplitude', 'sineAmplitude', 0, 1, 0.01],
    ['swell', 'sineEnvelope', 0, 0.38, 0.01],
    ['line width', 'sineLineWidth', 0.2, 3, 0.05],
    ['highlight line', 'sineHighlight', 0, 1, 0.01],
  ],
  sweep: [
    ['spacing', 'sweepSpacing', 3, 15, 0.1],
    ['smallest dot', 'sweepDotMin', 0, 3, 0.05],
    ['largest dot', 'sweepDotMax', 0.5, 6, 0.05],
    ['turn time', 'sweepTurn', 1, 12, 0.5],
    ['surge', 'sweepSurge', 0, 0.9, 0.01],
    ['trail', 'sweepTrail', 0.2, 4, 0.05],
    ['arm width', 'sweepArm', 0, 4, 0.05],
  ],
  rain: [
    ['cell size', 'rainCell', 2, 15, 0.1],
    ['square size', 'rainSquare', 0.2, 1, 0.01],
    ['dry columns', 'rainDry', 0, 0.9, 0.01],
    ['shortest trail', 'rainTrailMin', 1, 20, 1],
    ['trail range', 'rainTrailRange', 0, 30, 1],
    ['fall time', 'rainFall', 0.25, 4, 0.05],
    ['seed', 'rainSeed', 0, 99, 1],
  ],
  halftone: [
    ['spacing', 'halftoneSpacing', 2, 15, 0.1],
    ['dot size', 'halftoneDot', 0.1, 0.7, 0.01],
    ['wave angle', 'halftoneAngle', -180, 180, 0.5],
    ['wavelength', 'halftoneWavelength', 20, 400, 1],
    ['wave time', 'halftoneTime', 1, 24, 0.5],
    ['second wave angle', 'halftoneAngle2', -180, 180, 0.5],
    ['second wavelength', 'halftoneWavelength2', 20, 400, 1],
    ['second wave time', 'halftoneTime2', 1, 24, 0.5],
    ['wave mix', 'halftoneMix', 0, 1, 0.01],
    ['tone start', 'halftoneStart', 0, 1, 0.01],
    ['tone end', 'halftoneEnd', 0, 1, 0.01],
  ],
  cubes: [
    ['cube size', 'cubeSize', 3, 25, 0.1],
    ['lift', 'cubeLift', 0, 3, 0.05],
    ['wave time', 'cubeTime', 1, 24, 0.5],
    ['wave across', 'cubeWaveX', -10, 10, 0.1],
    ['wave down', 'cubeWaveY', -10, 10, 0.1],
    ['edge width', 'cubeEdge', 0, 1, 0.01],
  ],
  kaleido: [
    ['mirror size', 'kaleidoSize', 10, 80, 0.5],
    ['large disc', 'kaleidoDisc', 0.05, 0.6, 0.01],
    ['small disc', 'kaleidoDot', 0, 0.4, 0.01],
    ['leg time', 'kaleidoLeg', 0.5, 6, 0.1],
    ['small disc lag', 'kaleidoLag', 0, 12, 0.1],
  ],
  truchet: [
    ['tiles across', 'truchetTiles', 2, 20, 1],
    ['line width', 'truchetLine', 0.05, 0.5, 0.01],
    ['turn time', 'truchetTurn', 0.2, 2, 0.05],
    ['wave crossing', 'truchetCross', 0.5, 3, 0.05],
    ['overshoot', 'truchetOvershoot', 0, 3, 0.05],
    ['cycle time', 'truchetCycle', 4, 30, 0.5],
    ['seed', 'truchetSeed', 0, 99, 1],
  ],
  tunnel: [
    ['dots per ring', 'tunnelDots', 6, 80, 1],
    ['ring radius', 'tunnelRadius', 0.5, 4, 0.05],
    ['ring gap', 'tunnelGap', 0.15, 1.5, 0.01],
    ['twist', 'tunnelTwist', -2, 2, 0.01],
    ['spin', 'tunnelSpin', -20, 20, 0.5],
    ['dot size', 'tunnelDot', 0.01, 0.2, 0.005],
    ['ring time', 'tunnelRingTime', 0.25, 4, 0.05],
    ['depth', 'tunnelDepth', 4, 30, 0.5],
    ['highlight every', 'tunnelHighlight', 0, 12, 1],
  ],
  contours: [
    ['line gap', 'contourStep', 0.03, 0.3, 0.005],
    ['index every', 'contourIndex', 0, 10, 1],
    ['line width', 'contourMinor', 0.05, 2, 0.05],
    ['index line width', 'contourMajor', 0.05, 2, 0.05],
    ['morph time', 'contourMorph', 4, 60, 0.5],
    ['rise', 'contourDrift', -10, 10, 1],
  ],
  bloom: [
    ['spacing', 'bloomSpacing', 2, 15, 0.1],
    ['dot size', 'bloomDot', 0.1, 0.7, 0.01],
    ['glow size', 'bloomGlow', 4, 60, 0.5],
    ['flare', 'bloomFlare', 0, 20, 0.5],
    ['ring time', 'bloomPeriod', 1, 20, 0.5],
    ['rings', 'bloomRings', 1, 6, 1],
    ['ring strength', 'bloomStrength', 0, 1.5, 0.01],
    ['ring width start', 'bloomRingStart', 1, 40, 0.5],
    ['ring width end', 'bloomRingEnd', 1, 40, 0.5],
  ],
  confetti: [
    ['pieces', 'confettiCount', 4, 60, 1],
    ['piece size', 'confettiSize', 0.3, 3, 0.05],
    ['near layer', 'confettiNear', 0, 1, 0.01],
    ['rectangles', 'confettiRects', 0, 1, 0.01],
    ['second colour', 'confettiMix', 0, 1, 0.01],
    ['fall time', 'confettiFall', 3, 40, 0.5],
    ['sway', 'confettiSway', 0, 10, 0.1],
    ['seed', 'confettiSeed', 0, 99, 1],
  ],
  scan: [
    ['bars', 'scanBars', 3, 24, 1],
    ['bar thickness', 'scanThickness', 0.1, 0.95, 0.01],
    ['sweep time', 'scanPass', 0.5, 12, 0.1],
    ['moving share', 'scanSweep', 0.2, 1, 0.01],
    ['cut at rest', 'scanGapMin', 0, 20, 0.1],
    ['cut at speed', 'scanGapMax', 0, 20, 0.1],
    ['chevron', 'scanChevron', 0, 1.5, 0.01],
  ],
  ripple: [
    ['spacing', 'rippleSpacing', 3, 15, 0.1],
    ['dot size', 'rippleDot', 0.2, 3, 0.05],
    ['drop interval', 'rippleInterval', 0.5, 6, 0.1],
    ['ripple speed', 'rippleSpeed', 5, 60, 0.5],
    ['wavelength', 'rippleWavelength', 4, 60, 0.5],
    ['ripple width', 'rippleWidth', 2, 40, 0.5],
    ['fade time', 'rippleFade', 0.5, 8, 0.1],
    ['push', 'ripplePush', 0, 15, 0.1],
    ['swell', 'rippleSwell', 0, 5, 0.05],
    ['seed', 'rippleSeed', 0, 99, 1],
  ],
}

/** A pattern's slider values from the recipe, keyed by label. */
const patternValues = (r: GradientRecipe, kind: CanvasPattern) => Object.fromEntries(PATTERN_DIALS[kind].map(([label, field]) => [label, r[field]]))
const options = <T extends string>(values: readonly T[]) => values.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))
const SHAPE_OPTIONS = options(GRAIN_SHAPES)
const DITHER_SHAPE_OPTIONS = options(DITHER_SHAPES)
const PATTERN_OPTIONS = options(DITHER_TYPES)
const FINISH_OPTIONS = options(FINISHES)

const FOLDERS: Record<DialsKind, Folder[]> = {
  gradient: ['Gradient', 'Preview colours'],
  shader: ['Motion', 'Grain', 'Finish'],
}

function labToDials({ recipe: r, preview: p, playing }: LabState): PanelValues {
  const shape = { scale: r.scale, rotation: r.rotation, frame: r.frame }
  const own: Partial<Record<ShaderKind, Partial<PanelValues['Gradient']>>> = {
    mesh: { distortion: r.distortion, swirl: r.swirl },
    grain: { shape: r.shape, softness: r.softness, intensity: r.intensity },
    dither: { shape: r.ditherShape, pattern: r.ditherType, 'pixel size': r.pxSize },
  }
  const mine = isCanvasPattern(r.shader) ? patternValues(r, r.shader) : own[r.shader]
  // Dithering and the canvas patterns take a fixed number of colours.
  const fixed = r.shader === 'dither' || isCanvasPattern(r.shader)
  return {
    Gradient: { type: r.shader, ...(fixed ? {} : { colours: r.colours }), ...mine, ...shape },
    'Preview colours': { 'header bar': p.header, 'navigation items': p.nav, 'selected item': p.selected },
    Motion: { playing, speed: r.speed },
    Grain: r.shader === 'grain' ? { noise: r.noise } : r.shader === 'mesh' ? { mixer: r.grainMixer, overlay: r.grainOverlay } : undefined,
    Finish: { pattern: r.finish, 'pixel size': r.finishPixel },
  }
}

function buildConfig(lab: LabState, kind: DialsKind): DialConfig {
  const v = labToDials(lab)
  const g = v.Gradient
  if (kind === 'shader') {
    const motion: DialConfig = {
      Motion: { playing: v.Motion.playing, speed: [v.Motion.speed, 0, 3, 0.01] },
      Finish: {
        pattern: { type: 'select', options: FINISH_OPTIONS, default: v.Finish.pattern },
        'pixel size': [v.Finish['pixel size'], 0.3, 4, 0.05],
      },
    }
    // Dithering has no grain of its own: its pattern is the texture.
    if (g.type === 'grain') return { ...motion, Grain: { noise: [v.Grain!.noise!, 0, 1, 0.01] } }
    if (g.type === 'mesh') return { ...motion, Grain: { mixer: [v.Grain!.mixer!, 0, 1, 0.01], overlay: [v.Grain!.overlay!, 0, 1, 0.01] } }
    return motion
  }
  const own: Partial<Record<ShaderKind, DialConfig>> = {
    mesh: { distortion: [g.distortion!, 0, 1, 0.01], swirl: [g.swirl!, 0, 1, 0.01] },
    grain: { softness: [g.softness!, 0, 1, 0.01], intensity: [g.intensity!, 0, 1, 0.01] },
    dither: {
      pattern: { type: 'select', options: PATTERN_OPTIONS, default: g.pattern! },
      'pixel size': [g['pixel size']!, 1, 20, 0.5],
    },
  }
  const p = v['Preview colours']
  const pattern = isCanvasPattern(g.type)
  const mine: DialConfig = isCanvasPattern(g.type)
    ? Object.fromEntries(PATTERN_DIALS[g.type].map(([label, , min, max, step]) => [label, [g[label] as number, min, max, step]]))
    : own[g.type]!
  return {
    Gradient: {
      type: { type: 'select', options: SHADER_OPTIONS, default: g.type },
      ...(g.type === 'grain' || g.type === 'dither'
        ? { shape: { type: 'select', options: g.type === 'grain' ? SHAPE_OPTIONS : DITHER_SHAPE_OPTIONS, default: g.shape! } }
        : {}),
      ...(g.type === 'dither' || pattern ? {} : { colours: [g.colours!, 3, 5, 1] }),
      ...mine,
      scale: [g.scale, 0.25, 4, 0.01],
      rotation: [g.rotation, 0, 360, 1],
      frame: [g.frame, 0, MAX_FRAME, 100],
      shuffle: { type: 'action', label: 'Shuffle' },
    },
    'Preview colours': {
      'header bar': { type: 'color', default: p['header bar'] },
      'navigation items': { type: 'color', default: p['navigation items'] },
      'selected item': { type: 'color', default: p['selected item'] },
      reset: { type: 'action', label: '5Mins Theme' },
    },
  }
}

/** Registers this tab's panel and keeps it in sync with lab. */
export function useLabDials(kind: DialsKind, lab: LabState, update: (patch: Partial<LabState>) => void): void {
  const latest = useRef({ lab, update })
  latest.current = { lab, update }

  // DialKit owns the live values; the config only seeds them. Rebuilt when the
  // shader type changes, since each type has its own controls.
  const shader = lab.recipe.shader
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const config = useMemo(() => buildConfig(latest.current.lab, kind), [kind, shader])

  const dialRef = useRef<ReturnType<typeof useDialKitController> | null>(null)
  const onAction = useCallback((action: string) => {
    if (action === 'Gradient.shuffle') {
      dialRef.current?.setValue('Gradient.frame', Math.round((Math.random() * MAX_FRAME) / 100) * 100)
    } else if (action === 'Preview colours.reset') {
      const d = DEFAULT_THEME.light
      dialRef.current?.setValues({ 'Preview colours': { 'header bar': d.header, 'navigation items': d.nav, 'selected item': d.selected } } as never)
    }
  }, [])
  const dial = useDialKitController(kind === 'gradient' ? 'Gradient' : 'Shader', config, { onAction })
  dialRef.current = dial

  // lab -> DialKit. The controller changes with every panel edit, so this reads
  // it through dialRef and depends on lab only; otherwise an edit would re-run it
  // before reaching lab and be written straight back.
  useEffect(() => {
    const dial = dialRef.current
    if (!dial) return
    const want = labToDials(latest.current.lab)
    const have = dial.getValues() as unknown as PanelValues
    const next: Record<string, Record<string, unknown>> = {}
    for (const folder of FOLDERS[kind]) {
      // Dithering has no Grain folder, and a folder the old shader type didn't have
      // is empty until the panel rebuilds.
      const w = (want[folder] ?? {}) as Record<string, unknown>
      const h = (have[folder] ?? {}) as Record<string, unknown>
      for (const k of Object.keys(w)) {
        const same = typeof w[k] === 'string' ? String(h[k]).toLowerCase() === String(w[k]).toLowerCase() : h[k] === w[k]
        if (!same) (next[folder] ??= {})[k] = w[k]
      }
    }
    if (Object.keys(next).length) dial.setValues(next as never)
  }, [lab.recipe, lab.preview, lab.playing, kind])

  // DialKit -> lab, rebuilt from the panel in full so a stale snapshot never drops an edit.
  useEffect(() => {
    const v = dial.getValues() as unknown as PanelValues
    const { lab: now, update: push } = latest.current
    const r = now.recipe
    // Only the controls this panel shows (the others belong to the other shader type).
    const changed = (next: GradientRecipe) => (Object.keys(next) as (keyof GradientRecipe)[]).some((k) => next[k] !== r[k])
    const defined = <T extends object>(o: T) =>
      Object.fromEntries(Object.entries(o).filter(([k, x]) => x !== undefined && k in r)) as Partial<GradientRecipe>
    if (kind === 'shader') {
      const recipe = {
        ...r,
        speed: v.Motion.speed,
        ...defined({ grainMixer: v.Grain?.mixer, grainOverlay: v.Grain?.overlay, noise: v.Grain?.noise }),
        ...defined({ finish: v.Finish?.pattern, finishPixel: v.Finish?.['pixel size'] }),
      }
      const patch: Partial<LabState> = {}
      if (changed(recipe)) patch.recipe = recipe
      if (v.Motion.playing !== now.playing) patch.playing = v.Motion.playing
      if (Object.keys(patch).length) push(patch)
      return
    }
    // The panel's controls belong to the current type until it rebuilds for a newly picked one.
    const { type, shape, pattern, 'pixel size': pxSize, ...g } = v.Gradient
    const own = isCanvasPattern(r.shader)
      ? Object.fromEntries(PATTERN_DIALS[r.shader].map(([label, field]) => [field, g[label]]))
      : r.shader === 'dither'
        ? { ditherShape: shape, ditherType: pattern, pxSize }
        : { shape }
    const recipe = { ...r, shader: type, ...defined({ ...g, ...own }) }
    const c = v['Preview colours']
    const preview: ThemeSet = { header: c['header bar'], nav: c['navigation items'], selected: c['selected item'] }
    const patch: Partial<LabState> = {}
    if (changed(recipe)) patch.recipe = recipe
    if ((Object.keys(preview) as (keyof ThemeSet)[]).some((k) => preview[k].toLowerCase() !== now.preview[k].toLowerCase())) patch.preview = preview
    if (Object.keys(patch).length) push(patch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dial.values])
}
