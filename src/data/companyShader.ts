import { flowerImageUrl } from '@/pages/gradient-lab/api'
import { createRenderer, type GradientRenderer } from '@/pages/gradient-lab/gl/renderer'
import { parsePreset } from '@/pages/gradient-lab/preset'
import { DEFAULT_FRAMING, type RenderInput } from '@/pages/gradient-lab/types'
import { getCompanyDefaults, type CompanyDefault } from './companyDefaults'

/* The live version of a default company image: the Gradient Studio shader it
   was saved from (its preset, from companyDefaults), playing.
   One WebGL renderer draws each shader once per frame; every mounted surface
   (lesson cards, avatars, picker tiles) copies its frame into its own 2D
   canvas, so a page full of cards stays one GPU context. Uploads and
   defaults without a preset stay still. */

/** Largest drawing buffer for the shared frame: the size the stills were saved at.
    Each frame is drawn only as large as the biggest surface showing it. */
const FRAME_PX = 512
/* Css size the stills were framed at in the Studio, so the grain matches them. */
const FRAME_CSS = 528

type ShaderInput = Omit<RenderInput, 'time' | 'photo'> & { photoSrc: string | null }

/* Keyed by the preset object, so a re-saved gradient gets a fresh input. */
const inputs = new WeakMap<object, ShaderInput | null>()

/** The shader behind a default company image, or null when it has none. */
export function companyShader(defaultId: string, defaults: CompanyDefault[] = getCompanyDefaults()): ShaderInput | null {
  const json = defaults.find((d) => d.id === defaultId)?.preset
  if (!json || typeof json !== 'object') return null
  if (inputs.has(json)) return inputs.get(json)!
  let input: ShaderInput | null = null
  try {
    const lab = parsePreset(json)
    const needsPhoto = lab.gradient!.sourceMode !== 'palette' || lab.gradient!.abstraction < 1
    const photoSrc = lab.flowerId ? flowerImageUrl(lab.flowerId) : null
    if (!needsPhoto || photoSrc) {
      input = {
        palette: lab.palette!,
        gradient: lab.gradient!,
        noise: lab.noise!,
        motion: lab.motion!,
        rotate: (lab.framing ?? DEFAULT_FRAMING).rotate,
        photoSrc: needsPhoto ? photoSrc : null,
      }
    }
  } catch {
    /* an unreadable preset leaves the still image */
  }
  inputs.set(json, input)
  return input
}

interface Surface {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  input: ShaderInput
  visible: boolean
}

const surfaces = new Set<Surface>()
const photos = new Map<string, HTMLImageElement | null>()
let renderer: GradientRenderer | null = null
let frame: HTMLCanvasElement | null = null
/** Current drawing-buffer size of the frame, in px. */
let framePx = 0
let raf = 0
let last = 0
let clock = 0

function photoFor(src: string | null): HTMLImageElement | null | undefined {
  if (!src) return null
  if (photos.has(src)) return photos.get(src)
  photos.set(src, null)
  const img = new Image()
  // The shared library is cross-origin on localhost; WebGL needs a CORS-clean image.
  img.crossOrigin = 'anonymous'
  img.onload = () => photos.set(src, img)
  img.src = src
  return undefined
}

function tick(now: number) {
  clock += Math.min(now - last, 100) / 1000
  last = now
  const shown = [...surfaces].filter((s) => s.visible)
  if (shown.length === 0) {
    raf = 0
    return
  }
  // One render per distinct shader (usually one: the company image), copied to each of its surfaces.
  const byInput = new Map<ShaderInput, Surface[]>()
  for (const s of shown) byInput.set(s.input, [...(byInput.get(s.input) ?? []), s])
  const dpr = window.devicePixelRatio || 1
  for (const [input, group] of byInput) {
    const photo = photoFor(input.photoSrc)
    if (!renderer || !frame || (!photo && input.photoSrc)) continue
    const sizes = group.map((s) => [Math.max(1, Math.round(s.canvas.clientWidth * dpr)), Math.max(1, Math.round(s.canvas.clientHeight * dpr))])
    // Same frame at fewer pixels: the css size stays fixed, so the grain keeps its look.
    const px = Math.min(FRAME_PX, Math.ceil(Math.max(...sizes.flat()) / 32) * 32)
    if (px !== framePx) {
      renderer.resize(FRAME_CSS, FRAME_CSS, px / FRAME_CSS)
      framePx = px
    }
    renderer.render({ ...input, photo: photo ?? null, time: clock })
    for (const [i, s] of group.entries()) {
      const [w, h] = sizes[i]
      if (s.canvas.width !== w || s.canvas.height !== h) {
        s.canvas.width = w
        s.canvas.height = h
      }
      // Cover, like the still's background-size: cover: crop the square frame to the surface's shape.
      const crop = framePx / Math.max(w, h)
      const sw = w * crop
      const sh = h * crop
      s.ctx.drawImage(frame, (framePx - sw) / 2, (framePx - sh) / 2, sw, sh, 0, 0, w, h)
      s.canvas.dataset.ready = ''
    }
  }
  raf = requestAnimationFrame(tick)
}

function wake() {
  if (raf || ![...surfaces].some((s) => s.visible)) return
  last = performance.now()
  raf = requestAnimationFrame(tick)
}

const observer =
  typeof IntersectionObserver === 'undefined'
    ? null
    : new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const s = [...surfaces].find((x) => x.canvas === entry.target)
          if (s) s.visible = entry.isIntersecting
        }
        wake()
      })

/** Plays the shader into `canvas` until the returned cleanup runs. */
export function attachCompanyShader(canvas: HTMLCanvasElement, input: ShaderInput): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}
  if (!renderer) {
    frame = document.createElement('canvas')
    renderer = createRenderer(frame)
    if (!renderer) return () => {}
  }
  const surface: Surface = { canvas, ctx, input, visible: !observer }
  surfaces.add(surface)
  observer?.observe(canvas)
  wake()
  return () => {
    observer?.unobserve(canvas)
    surfaces.delete(surface)
  }
}
