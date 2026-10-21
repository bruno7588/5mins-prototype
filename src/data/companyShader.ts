import type { GradientRecipe } from '@/pages/gradient-lab/recipe'
import { applyPixelFinish } from './pixelFinish'
import { hiddenMount, paintBackdrop, type HiddenMount } from './renderRecipe'

/* The live version of a default company image: its recipe playing in the
   tenant's colours (Paper Shaders' mesh gradient). One hidden Paper mount per
   distinct shader (usually one: the company image) animates; every mounted
   surface (lesson cards, avatars, the preview) copies its frame into its own 2D
   canvas, so a page full of cards stays one GPU context. */

export interface ShaderInput {
  recipe: GradientRecipe
  colours: string[]
  /** The three theme colours, for the recipe's pixel finish. */
  finish?: string[]
}

/** Css size of the hidden mount: big enough for the largest card. */
const MOUNT_CSS = 320

interface Surface {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  key: string
  input: ShaderInput
  visible: boolean
}

const surfaces = new Set<Surface>()
const mounts = new Map<string, HiddenMount>()
/** Mounts still being created (the grain gradient waits for its texture). */
const pending = new Set<string>()
let raf = 0

const keyOf = (input: ShaderInput) => JSON.stringify(input)

function tick() {
  const shown = [...surfaces].filter((s) => s.visible)
  if (shown.length === 0) {
    raf = 0
    return
  }
  const dpr = window.devicePixelRatio || 1
  for (const s of shown) {
    const m = mounts.get(s.key)
    const source = m?.canvas
    if (!m || !source || source.width === 0) continue
    const w = Math.max(1, Math.round(s.canvas.clientWidth * dpr))
    const h = Math.max(1, Math.round(s.canvas.clientHeight * dpr))
    if (s.canvas.width !== w || s.canvas.height !== h) {
      s.canvas.width = w
      s.canvas.height = h
    }
    // Cover, like the still's background-size: cover: crop the square frame to the surface's shape.
    const crop = source.width / Math.max(w, h)
    const sw = w * crop
    const sh = h * crop
    // See-through dots draw over last frame's, so repaint the backdrop each frame.
    if (m.backdrop) paintBackdrop(s.ctx, m.backdrop, w, h)
    s.ctx.drawImage(source, (source.width - sw) / 2, (source.height - sh) / 2, sw, sh, 0, 0, w, h)
    applyPixelFinish(s.ctx, s.input.recipe, s.input.finish)
    s.canvas.dataset.ready = ''
  }
  raf = requestAnimationFrame(tick)
}

function wake() {
  if (raf || ![...surfaces].some((s) => s.visible)) return
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
  const key = keyOf(input)
  if (!mounts.has(key) && !pending.has(key)) {
    pending.add(key)
    hiddenMount(input.recipe, input.colours, MOUNT_CSS, input.recipe.speed)
      .then((m) => {
        // Kept only if something still shows this shader.
        if ([...surfaces].some((s) => s.key === key)) mounts.set(key, m)
        else m.dispose()
      })
      .catch(() => {}) // no WebGL: the still stays
      .finally(() => pending.delete(key))
  }
  const surface: Surface = { canvas, ctx, key, input, visible: !observer }
  surfaces.add(surface)
  observer?.observe(canvas)
  wake()
  return () => {
    observer?.unobserve(canvas)
    surfaces.delete(surface)
    // Free the GPU context once nothing shows this shader.
    if (![...surfaces].some((s) => s.key === key)) {
      mounts.get(key)?.dispose()
      mounts.delete(key)
    }
  }
}
