import type { GradientRecipe } from '@/pages/gradient-lab/recipe'

/* The soft finish, run on every copied frame before the pixel finish: the
   recipe's blur, then a faint fixed grain that breaks up the 8-bit steps
   (banding) in smooth gradients. Blur is a % of the frame, so a 512 px still
   and a small card look the same. */

const GRAIN_PX = 128
/** How far the grain moves each pixel either side of mid grey under soft-light; small enough not to read as texture. */
const GRAIN_SPREAD = 6

let scratch: HTMLCanvasElement | null = null
const grains = new Map<number, CanvasPattern>()

/** A repeating grey noise tile, mid grey +/- `spread` levels; cached per spread. */
function grainPattern(ctx: CanvasRenderingContext2D, spread: number): CanvasPattern | null {
  const cached = grains.get(spread)
  if (cached) return cached
  const tile = document.createElement('canvas')
  tile.width = tile.height = GRAIN_PX
  const t = tile.getContext('2d')
  if (!t) return null
  const image = t.createImageData(GRAIN_PX, GRAIN_PX)
  for (let i = 0; i < image.data.length; i += 4) {
    const v = 128 + Math.round((Math.random() * 2 - 1) * spread)
    image.data[i] = image.data[i + 1] = image.data[i + 2] = v
    image.data[i + 3] = 255
  }
  t.putImageData(image, 0, 0)
  const pattern = ctx.createPattern(tile, 'repeat')
  if (pattern) grains.set(spread, pattern)
  return pattern
}

/** Soft-light noise over the whole canvas, `spread` levels either side of mid grey. */
export function paintNoise(ctx: CanvasRenderingContext2D, spread: number) {
  const pattern = grainPattern(ctx, spread)
  if (!pattern) return
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalCompositeOperation = 'soft-light'
  ctx.fillStyle = pattern
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.restore()
}

/** Blurs (when the recipe asks) and de-bands, in place, a canvas that already holds the frame. */
export function applySoftFinish(ctx: CanvasRenderingContext2D, recipe: GradientRecipe) {
  const { width: w, height: h } = ctx.canvas
  if (!w || !h) return
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  const px = (recipe.blur * Math.max(w, h)) / 100
  if (px > 0) {
    scratch ??= document.createElement('canvas')
    if (scratch.width !== w || scratch.height !== h) {
      scratch.width = w
      scratch.height = h
    }
    const s = scratch.getContext('2d')
    if (s) {
      s.clearRect(0, 0, w, h)
      s.drawImage(ctx.canvas, 0, 0)
      // Drawn a little larger, so the blur never pulls transparent edges in.
      const m = px * 2
      ctx.filter = `blur(${px}px)`
      ctx.drawImage(scratch, -m, -m, w + m * 2, h + m * 2)
      ctx.filter = 'none'
    }
  }
  const pattern = grainPattern(ctx, GRAIN_SPREAD)
  if (pattern) {
    ctx.globalCompositeOperation = 'soft-light'
    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, w, h)
  }
  ctx.restore()
}
