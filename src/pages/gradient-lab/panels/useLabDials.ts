import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDialKitController, type DialConfig } from 'dialkit'
import {
  type BlendMode,
  type GradientSettings,
  type LabState,
  type MotionSettings,
  type NoiseSettings,
  type NoiseType,
  type SourceMode,
} from '../types'
import { dialPalettes, extractKey, paletteKeys } from './usePaletteExtraction'

/* The DialKit panel for each tab of the controls column: "Gradient" (source,
   gradient, noise, palette) or "Shader" (motion, timeline), rendered inline.
   Only the open tab's panel is mounted, and it is seeded from lab state on
   mount, so switching tabs never loses a value. Two-way sync with lab state, without echo loops:
   - DialKit -> lab: when the panel's values change, each section is rebuilt
     from the panel in full and pushed only where it differs from lab.
   - lab -> DialKit: when lab changes from outside the panel (focal pad,
     Randomize Framing, wheel zoom, a loaded preset, an extracted palette),
     the differing values are pushed into the panel with setValues.
   Each direction is a no-op once both sides agree. The page pad owns the
   gradient offset, so the panel has no offset control. */

const SOURCE_OPTIONS: { value: SourceMode; label: string }[] = [
  { value: 'palette', label: 'Palette' },
  { value: 'photo', label: 'Photo' },
  { value: 'mix', label: 'Mix' },
]
const NOISE_OPTIONS: { value: NoiseType; label: string }[] = [
  { value: 'white', label: 'White' },
  { value: 'blue', label: 'Blue' },
  { value: 'value', label: 'Value' },
  { value: 'simplex', label: 'Simplex' },
  { value: 'fbm', label: 'Fbm' },
  { value: 'worley', label: 'Worley' },
]
const BLEND_OPTIONS: { value: BlendMode; label: string }[] = [
  { value: 'soft-light', label: 'Soft light' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'add', label: 'Add' },
  { value: 'multiply', label: 'Multiply' },
]

export type DialsKind = 'gradient' | 'shader'

const FOLDERS: Record<DialsKind, (keyof LabDials)[]> = {
  gradient: ['Source', 'Gradient', 'Noise'],
  shader: ['Motion'],
}

/** DialKit keys double as labels (first letter capitalised), so they are sentence case. */
interface LabDials {
  Source: {
    mode: SourceMode
    mix: number
    blur: number
    colours: number
    'saturation boost': number
    'ignore background': boolean
  }
  Gradient: {
    softness: number
    scale: number
    rotation: number
    distortion: number
    swirl: number
    seed: number
  }
  Noise: NoiseSettings
  Motion: {
    playing: boolean
    speed: number
    randomness: number
    'flow angle': number
    'flow strength': number
    warp: number
    'warp octaves': number
    'swirl motion': number
    'seamless loop': boolean
    'loop seconds': number
    'animated grain': boolean
    'grain fps': string
  }
}

interface PanelValues extends LabDials {
  Palette: Record<string, string>
  Timeline: { scrub: number }
}

const colourKey = (i: number) => `colour ${i + 1}`

/** The lab values the panel mirrors (everything except the palette and the scrub). */
function labToDials(lab: LabState): LabDials {
  const { gradient: g, motion: m } = lab
  return {
    Source: {
      mode: g.sourceMode,
      mix: g.mix,
      blur: g.blur,
      colours: lab.paletteSize,
      'saturation boost': lab.saturationBoost,
      'ignore background': lab.ignoreBackground,
    },
    Gradient: {
      softness: g.softness,
      scale: g.scale,
      rotation: g.rotation,
      distortion: g.distortion,
      swirl: g.swirl,
      seed: g.seed,
    },
    Noise: { ...lab.noise },
    Motion: {
      playing: m.playing,
      speed: m.speed,
      randomness: m.randomness,
      'flow angle': m.flowAngle,
      'flow strength': m.flowStrength,
      warp: m.warp,
      'warp octaves': m.warpOctaves,
      'swirl motion': m.swirlMotion,
      'seamless loop': m.loop,
      'loop seconds': m.loopSeconds,
      'animated grain': m.grainAnimated,
      'grain fps': String(m.grainFps),
    },
  }
}

function dialsMotion(d: LabDials['Motion']): MotionSettings {
  return {
    playing: d.playing,
    speed: d.speed,
    randomness: d.randomness,
    flowAngle: d['flow angle'],
    flowStrength: d['flow strength'],
    warp: d.warp,
    warpOctaves: d['warp octaves'],
    swirlMotion: d['swirl motion'],
    loop: d['seamless loop'],
    loopSeconds: d['loop seconds'],
    grainAnimated: d['animated grain'],
    grainFps: d['grain fps'] === '24' ? 24 : 12,
  }
}

function buildConfig(lab: LabState, kind: DialsKind, scrub: number): DialConfig {
  const v = labToDials(lab)
  const palette: DialConfig = { _collapsed: true }
  lab.palette.forEach((p, i) => {
    palette[colourKey(i)] = { type: 'color', default: p.color }
  })
  palette.reextract = { type: 'action', label: 'Re-extract' }
  const m = v.Motion
  if (kind === 'shader') {
    return {
      Motion: {
        playing: m.playing,
        speed: [m.speed, 0, 3, 0.01],
        randomness: [m.randomness, 0, 1, 0.01],
        'flow angle': [m['flow angle'], 0, 360, 1],
        'flow strength': [m['flow strength'], 0, 1, 0.01],
        warp: [m.warp, 0, 1, 0.01],
        'warp octaves': [m['warp octaves'], 1, 5, 1],
        'swirl motion': [m['swirl motion'], 0, 1, 0.01],
        'seamless loop': m['seamless loop'],
        'loop seconds': [m['loop seconds'], 2, 30, 1],
        'animated grain': m['animated grain'],
        'grain fps': {
          type: 'select',
          options: [
            { value: '12', label: '12' },
            { value: '24', label: '24' },
          ],
          default: m['grain fps'],
        },
      },
      Timeline: {
        scrub: [scrub, 0, 1, 0.001],
      },
    }
  }
  return {
    Source: {
      mode: { type: 'select', options: SOURCE_OPTIONS, default: v.Source.mode },
      mix: [v.Source.mix, 0, 1, 0.01],
      blur: [v.Source.blur, 0, 1, 0.01],
      colours: [v.Source.colours, 3, 8, 1],
      'saturation boost': [v.Source['saturation boost'], 0, 1, 0.01],
      'ignore background': v.Source['ignore background'],
    },
    Gradient: {
      softness: [v.Gradient.softness, 1, 8, 0.1],
      scale: [v.Gradient.scale, 0.25, 4, 0.01],
      rotation: [v.Gradient.rotation, 0, 360, 1],
      distortion: [v.Gradient.distortion, 0, 1, 0.01],
      swirl: [v.Gradient.swirl, 0, 1, 0.01],
      seed: [v.Gradient.seed, 1, 999, 1],
      shuffle: { type: 'action', label: 'Shuffle Seed' },
    },
    Noise: {
      _collapsed: true,
      type: { type: 'select', options: NOISE_OPTIONS, default: v.Noise.type },
      size: [v.Noise.size, 0.5, 8, 0.1],
      intensity: [v.Noise.intensity, 0, 1, 0.01],
      blend: { type: 'select', options: BLEND_OPTIONS, default: v.Noise.blend },
      colour: [v.Noise.colour, 0, 1, 0.01],
      luma: [v.Noise.luma, 0, 1, 0.01],
    },
    Palette: palette,
  }
}

const sameKeys = <T extends object>(a: T, b: T) =>
  (Object.keys(a) as (keyof T)[]).every((k) => a[k] === b[k])

/** Registers this tab's panel and keeps it in sync with lab. The scrub (0-1) lives on the page so it survives tab switches. */
export function useLabDials(
  kind: DialsKind,
  lab: LabState,
  update: (patch: Partial<LabState>) => void,
  onReextract: () => void,
  scrub: number,
  onScrub: (scrub: number) => void,
): void {
  const latest = useRef({ lab, update, onReextract, scrub, onScrub })
  latest.current = { lab, update, onReextract, scrub, onScrub }

  // Rebuilt only when the structure changes (palette count); DialKit owns the
  // live values, the config just seeds them.
  const count = lab.palette.length
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const config = useMemo(() => buildConfig(latest.current.lab, kind, latest.current.scrub), [count, kind])

  const dialRef = useRef<ReturnType<typeof useDialKitController> | null>(null)
  const onAction = useCallback((action: string) => {
    if (action === 'Gradient.shuffle') {
      dialRef.current?.setValue('Gradient.seed', 1 + Math.floor(Math.random() * 999))
    } else if (action === 'Palette.reextract') {
      latest.current.onReextract()
    }
  }, [])
  const dial = useDialKitController(kind === 'gradient' ? 'Gradient' : 'Shader', config, { onAction })
  dialRef.current = dial

  // lab -> DialKit: a new palette (extracted or loaded) fills the colour controls.
  // Runs before the DialKit -> lab sync so old colours never overwrite it.
  // The controller object changes with every panel edit, so these lab -> DialKit
  // effects read it through dialRef and depend on lab only; otherwise an edit
  // would re-run them before it reached lab and be written straight back.
  useEffect(() => {
    const dial = dialRef.current
    if (!dial || kind !== 'gradient' || dialPalettes.has(lab.palette)) return
    const v = dial.getValues() as unknown as PanelValues
    const next: Record<string, string> = {}
    lab.palette.forEach((p, i) => {
      if (v.Palette[colourKey(i)]?.toLowerCase() !== p.color.toLowerCase()) next[colourKey(i)] = p.color
    })
    if (Object.keys(next).length) dial.setValues({ Palette: next } as never)
  }, [lab.palette, kind])

  // lab -> DialKit: values changed outside the panel (pad, randomize, zoom, preset).
  useEffect(() => {
    const dial = dialRef.current
    if (!dial) return
    const target = labToDials(latest.current.lab)
    const v = dial.getValues() as unknown as PanelValues
    const next: Record<string, Record<string, unknown>> = {}
    for (const folder of FOLDERS[kind]) {
      const want = target[folder] as unknown as Record<string, unknown>
      const have = v[folder] as unknown as Record<string, unknown>
      for (const k of Object.keys(want)) {
        if (have[k] !== want[k]) (next[folder] ??= {})[k] = want[k]
      }
    }
    if (Object.keys(next).length) dial.setValues(next as never)
  }, [lab.gradient, lab.noise, lab.motion, lab.paletteSize, lab.saturationBoost, lab.ignoreBackground, kind])

  // DialKit -> lab. Each section is rebuilt from the panel in full, so a stale
  // lab snapshot can never drop an edit.
  useEffect(() => {
    const v = dial.getValues() as unknown as PanelValues
    const { lab: now, update: push, scrub: lastScrub, onScrub: pushScrub } = latest.current
    const patch: Partial<LabState> = {}

    if (kind === 'shader') {
      const motion = dialsMotion(v.Motion)
      if (!sameKeys(motion, now.motion)) push({ motion })
      if (v.Timeline.scrub !== lastScrub) pushScrub(v.Timeline.scrub)
      return
    }

    const gradient: GradientSettings = {
      sourceMode: v.Source.mode,
      mix: v.Source.mix,
      blur: v.Source.blur,
      softness: v.Gradient.softness,
      scale: v.Gradient.scale,
      rotation: v.Gradient.rotation,
      offsetX: now.gradient.offsetX,
      offsetY: now.gradient.offsetY,
      distortion: v.Gradient.distortion,
      swirl: v.Gradient.swirl,
      seed: v.Gradient.seed,
    }
    if (!sameKeys(gradient, now.gradient)) patch.gradient = gradient

    const noise: NoiseSettings = {
      type: v.Noise.type,
      size: v.Noise.size,
      intensity: v.Noise.intensity,
      blend: v.Noise.blend,
      colour: v.Noise.colour,
      luma: v.Noise.luma,
    }
    if (!sameKeys(noise, now.noise)) patch.noise = noise

    if (v.Source.colours !== now.paletteSize) patch.paletteSize = v.Source.colours
    if (v.Source['saturation boost'] !== now.saturationBoost) patch.saturationBoost = v.Source['saturation boost']
    if (v.Source['ignore background'] !== now.ignoreBackground) patch.ignoreBackground = v.Source['ignore background']

    // Hand-edited colours (only while the panel holds one control per point).
    const colours = now.palette.map((_, i) => v.Palette[colourKey(i)])
    const inSync = colours.every((c) => typeof c === 'string') && v.Palette[colourKey(now.palette.length)] === undefined
    if (inSync && colours.some((c, i) => c.toLowerCase() !== now.palette[i].color.toLowerCase())) {
      const palette = now.palette.map((p, i) => ({ ...p, color: colours[i].toLowerCase() }))
      dialPalettes.add(palette)
      paletteKeys.set(palette, extractKey({ ...now, ...patch, gradient: patch.gradient ?? now.gradient }))
      patch.palette = palette
    }

    if (Object.keys(patch).length) push(patch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dial.values])
}
