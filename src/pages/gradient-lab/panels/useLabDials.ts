import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDialKitController, type DialConfig } from 'dialkit'
import { brandPalette } from '@/data/brandPalette'
import type { ThemeSet } from '@/data/brandTheme'
import {
  DITHER_SHAPES,
  DITHER_TYPES,
  fixedColours,
  GRAIN_SHAPES,
  MAX_FRAME,
  paletteCount,
  type DitherShape,
  type DitherType,
  type GradientRecipe,
  type GrainShape,
  type ShaderKind,
} from '../recipe'

/* The DialKit panel for each tab of the controls column, rendered inline:
   "Gradient" (shader type and shape, and the slot's colours) or
   "Shader" (motion and grain). The controls follow the shader type: the mesh
   gradient has distortion, swirl and two grain sliders; the grain gradient has
   a shape, softness, intensity and noise; dithering has a shape, a pattern and
   a pixel size. Only the open tab's panel is mounted, seeded from lab
   state on mount, so switching tabs never loses a value. Two-way sync without
   echo loops:
   - DialKit -> lab: when the panel's values change, the recipe and preview are
     rebuilt from the panel and pushed only where they differ.
   - lab -> DialKit: values changed outside the panel (focal pad, Randomise
     Framing, wheel zoom, a loaded slot) are pushed in with setValues.
   The page's focal pad owns the offset, so the panel has no offset control. */

export type DialsKind = 'gradient' | 'shader'

/** What the Studio edits: the recipe, and the theme it is previewed in when it has no fixed palette (the 5Mins theme). */
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
  }
  /** The slot's own colours: its fixed palette, or the 5Mins colours it takes without one. */
  'Preview colours': { sphere: string; 'background start': string; 'background end': string }
  Motion: { playing: boolean; speed: number }
  /** Absent for dithering. */
  Grain?: { mixer?: number; overlay?: number; noise?: number }
}

type Folder = keyof PanelValues

const SHADER_OPTIONS: { value: ShaderKind; label: string }[] = [
  { value: 'mesh', label: 'Mesh gradient' },
  { value: 'grain', label: 'Grain gradient' },
  { value: 'dither', label: 'Dithering' },
]
const options = <T extends string>(values: readonly T[]) => values.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))
const SHAPE_OPTIONS = options(GRAIN_SHAPES)
const DITHER_SHAPE_OPTIONS = options(DITHER_SHAPES)
const PATTERN_OPTIONS = options(DITHER_TYPES)

const FOLDERS: Record<DialsKind, Folder[]> = {
  gradient: ['Gradient', 'Preview colours'],
  shader: ['Motion', 'Grain'],
}

/** The three colours a recipe shows in, read from the same layout fixedColours writes. */
function slotColours(r: GradientRecipe, p: ThemeSet): PanelValues['Preview colours'] {
  const c = fixedColours(r) ?? brandPalette(p, paletteCount(r))
  return { sphere: c[2], 'background start': c[1], 'background end': c[4] ?? c[3] ?? c[1] }
}

function labToDials({ recipe: r, preview: p, playing }: LabState): PanelValues {
  const shape = { scale: r.scale, rotation: r.rotation, frame: r.frame }
  const own: Record<ShaderKind, Partial<PanelValues['Gradient']>> = {
    mesh: { distortion: r.distortion, swirl: r.swirl },
    grain: { shape: r.shape, softness: r.softness, intensity: r.intensity },
    dither: { shape: r.ditherShape, pattern: r.ditherType, 'pixel size': r.pxSize },
  }
  return {
    Gradient: { type: r.shader, ...(r.shader === 'dither' ? {} : { colours: r.colours }), ...own[r.shader], ...shape },
    'Preview colours': slotColours(r, p),
    Motion: { playing, speed: r.speed },
    Grain: r.shader === 'grain' ? { noise: r.noise } : r.shader === 'mesh' ? { mixer: r.grainMixer, overlay: r.grainOverlay } : undefined,
  }
}

function buildConfig(lab: LabState, kind: DialsKind): DialConfig {
  const v = labToDials(lab)
  const g = v.Gradient
  if (kind === 'shader') {
    const motion: DialConfig = { Motion: { playing: v.Motion.playing, speed: [v.Motion.speed, 0, 3, 0.01] } }
    // Dithering has no grain of its own: its pattern is the texture.
    if (g.type === 'grain') return { ...motion, Grain: { noise: [v.Grain!.noise!, 0, 1, 0.01] } }
    if (g.type === 'mesh') return { ...motion, Grain: { mixer: [v.Grain!.mixer!, 0, 1, 0.01], overlay: [v.Grain!.overlay!, 0, 1, 0.01] } }
    return motion
  }
  const own: Record<ShaderKind, DialConfig> = {
    mesh: { distortion: [g.distortion!, 0, 1, 0.01], swirl: [g.swirl!, 0, 1, 0.01] },
    grain: { softness: [g.softness!, 0, 1, 0.01], intensity: [g.intensity!, 0, 1, 0.01] },
    dither: {
      pattern: { type: 'select', options: PATTERN_OPTIONS, default: g.pattern! },
      'pixel size': [g['pixel size']!, 1, 20, 0.5],
    },
  }
  const p = v['Preview colours']
  return {
    Gradient: {
      type: { type: 'select', options: SHADER_OPTIONS, default: g.type },
      ...(g.type !== 'mesh'
        ? { shape: { type: 'select', options: g.type === 'grain' ? SHAPE_OPTIONS : DITHER_SHAPE_OPTIONS, default: g.shape! } }
        : {}),
      ...(g.type === 'dither' ? {} : { colours: [g.colours!, 3, 5, 1] }),
      ...own[g.type],
      scale: [g.scale, 0.25, 4, 0.01],
      rotation: [g.rotation, 0, 360, 1],
      frame: [g.frame, 0, MAX_FRAME, 100],
      shuffle: { type: 'action', label: 'Shuffle' },
    },
    'Preview colours': {
      sphere: { type: 'color', default: p.sphere },
      'background start': { type: 'color', default: p['background start'] },
      'background end': { type: 'color', default: p['background end'] },
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
      const recipe = { ...r, speed: v.Motion.speed, ...defined({ grainMixer: v.Grain?.mixer, grainOverlay: v.Grain?.overlay, noise: v.Grain?.noise }) }
      const patch: Partial<LabState> = {}
      if (changed(recipe)) patch.recipe = recipe
      if (v.Motion.playing !== now.playing) patch.playing = v.Motion.playing
      if (Object.keys(patch).length) push(patch)
      return
    }
    // The panel's controls belong to the current type until it rebuilds for a newly picked one.
    const { type, shape, pattern, 'pixel size': pxSize, ...g } = v.Gradient
    const own = r.shader === 'dither' ? { ditherShape: shape, ditherType: pattern, pxSize } : { shape }
    const recipe: GradientRecipe = { ...r, shader: type, ...defined({ ...g, ...own }) }
    // An edited colour gives the slot its own fixed palette; untouched, it keeps following the theme.
    const c = v['Preview colours']
    const shown = slotColours(r, now.preview)
    const keys = ['sphere', 'background start', 'background end'] as const
    if (keys.some((k) => c[k].toLowerCase() !== shown[k].toLowerCase())) recipe.palette = keys.map((k) => c[k].toUpperCase()) as [string, string, string]
    if (changed(recipe)) push({ recipe })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dial.values])
}
