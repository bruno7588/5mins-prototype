import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDialKitController, type DialConfig } from 'dialkit'
import { DEFAULT_THEME, type ThemeSet } from '@/data/brandTheme'
import { MAX_FRAME, type GradientRecipe } from '../recipe'

/* The DialKit panel for each tab of the controls column, rendered inline:
   "Gradient" (shape, and the theme colours to preview it in) or "Shader"
   (motion and grain). Only the open tab's panel is mounted, seeded from lab
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
  Gradient: { colours: number; distortion: number; swirl: number; scale: number; rotation: number; frame: number }
  'Preview colours': { 'header bar': string; 'navigation items': string; 'selected item': string }
  Motion: { playing: boolean; speed: number }
  Grain: { mixer: number; overlay: number }
}

type Folder = keyof PanelValues

const FOLDERS: Record<DialsKind, Folder[]> = {
  gradient: ['Gradient', 'Preview colours'],
  shader: ['Motion', 'Grain'],
}

function labToDials({ recipe: r, preview: p, playing }: LabState): PanelValues {
  return {
    Gradient: { colours: r.colours, distortion: r.distortion, swirl: r.swirl, scale: r.scale, rotation: r.rotation, frame: r.frame },
    'Preview colours': { 'header bar': p.header, 'navigation items': p.nav, 'selected item': p.selected },
    Motion: { playing, speed: r.speed },
    Grain: { mixer: r.grainMixer, overlay: r.grainOverlay },
  }
}

function buildConfig(lab: LabState, kind: DialsKind): DialConfig {
  const v = labToDials(lab)
  if (kind === 'shader') {
    return {
      Motion: { playing: v.Motion.playing, speed: [v.Motion.speed, 0, 3, 0.01] },
      Grain: { mixer: [v.Grain.mixer, 0, 1, 0.01], overlay: [v.Grain.overlay, 0, 1, 0.01] },
    }
  }
  const p = v['Preview colours']
  return {
    Gradient: {
      colours: [v.Gradient.colours, 3, 5, 1],
      distortion: [v.Gradient.distortion, 0, 1, 0.01],
      swirl: [v.Gradient.swirl, 0, 1, 0.01],
      scale: [v.Gradient.scale, 0.25, 4, 0.01],
      rotation: [v.Gradient.rotation, 0, 360, 1],
      frame: [v.Gradient.frame, 0, MAX_FRAME, 100],
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

  // DialKit owns the live values; the config only seeds them.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const config = useMemo(() => buildConfig(latest.current.lab, kind), [kind])

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
      const w = want[folder] as Record<string, unknown>
      const h = have[folder] as Record<string, unknown>
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
    if (kind === 'shader') {
      const recipe = { ...r, speed: v.Motion.speed, grainMixer: v.Grain.mixer, grainOverlay: v.Grain.overlay }
      const patch: Partial<LabState> = {}
      if (recipe.speed !== r.speed || recipe.grainMixer !== r.grainMixer || recipe.grainOverlay !== r.grainOverlay) patch.recipe = recipe
      if (v.Motion.playing !== now.playing) patch.playing = v.Motion.playing
      if (Object.keys(patch).length) push(patch)
      return
    }
    const g = v.Gradient
    const recipe = { ...r, colours: g.colours, distortion: g.distortion, swirl: g.swirl, scale: g.scale, rotation: g.rotation, frame: g.frame }
    const c = v['Preview colours']
    const preview: ThemeSet = { header: c['header bar'], nav: c['navigation items'], selected: c['selected item'] }
    const patch: Partial<LabState> = {}
    if ((Object.keys(g) as (keyof typeof g)[]).some((k) => recipe[k] !== r[k])) patch.recipe = recipe
    if ((Object.keys(preview) as (keyof ThemeSet)[]).some((k) => preview[k].toLowerCase() !== now.preview[k].toLowerCase())) patch.preview = preview
    if (Object.keys(patch).length) push(patch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dial.values])
}
