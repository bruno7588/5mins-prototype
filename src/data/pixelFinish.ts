import { isCanvasPattern, type GradientRecipe } from '@/pages/gradient-lab/recipe'

/* The pixel finish: ordered dithering over any rendered background, so soft
   shading turns into a grid of hard square pixels in the tenant's three theme
   colours. The frame is shrunk to one cell per finished pixel, each cell's
   lightness is dithered to three tone bands with a Bayer matrix, and the grid is
   drawn back up with smoothing off.
   Lightness is measured against the theme colours themselves (darkest = 0,
   middle = 1, lightest = 2), so an area already in a theme colour stays that
   colour and only the blends between them dither. Pixel size is a % of the
   frame, so a 512 px still and a small card show the same grain. */

/** Bayer threshold matrices, flattened row by row. */
export const BAYER: Record<'2x2' | '4x4' | '8x8', number[]> = {
  '2x2': [0, 2, 3, 1],
  '4x4': [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5],
  '8x8': [
    0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11,
    43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
  ],
}

type Rgb = [number, number, number]

const luma = ([r, g, b]: Rgb) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** The theme colours darkest first, with their lightness. Cached per colour set. */
let tonesKey = ''
let tones: { rgb: Rgb; l: number }[] = []
function sortedTones(colours: string[]) {
  const key = colours.join()
  if (key !== tonesKey) {
    tonesKey = key
    tones = colours
      .slice(0, 3)
      .map((c) => ({ rgb: hexToRgb(c), l: 0 }))
      .map((t) => ({ ...t, l: luma(t.rgb) }))
      .sort((a, b) => a.l - b.l)
  }
  return tones
}

/** One low-resolution canvas, reused for every frame. */
let grid: HTMLCanvasElement | null = null

/**
 * Applies the recipe's pixel finish in place to a canvas that already holds the
 * frame. Does nothing when the finish is off or there are no theme colours.
 */
export function applyPixelFinish(ctx: CanvasRenderingContext2D, recipe: GradientRecipe, themeColours: string[] | undefined) {
  if (recipe.finish === 'off' || !themeColours || themeColours.length < 3) return
  // A pattern with colour flow is finished as it is drawn (drawPattern), so its marks keep the flow's colours.
  if (isCanvasPattern(recipe.shader) && recipe.flow > 0) return
  const { width: w, height: h } = ctx.canvas
  if (!w || !h) return
  const cell = Math.max(1, (Math.max(w, h) * recipe.finishPixel) / 100)
  const gw = Math.ceil(w / cell)
  const gh = Math.ceil(h / cell)
  grid ??= document.createElement('canvas')
  if (grid.width !== gw || grid.height !== gh) {
    grid.width = gw
    grid.height = gh
  }
  const g = grid.getContext('2d', { willReadFrequently: true })
  if (!g) return
  g.imageSmoothingEnabled = true
  g.imageSmoothingQuality = 'high'
  g.drawImage(ctx.canvas, 0, 0, w, h, 0, 0, gw, gh)
  const image = g.getImageData(0, 0, gw, gh)
  const px = image.data
  const [dark, mid, light] = sortedTones(themeColours)
  const matrix = BAYER[recipe.finish]
  const n = Math.sqrt(matrix.length)
  const steps = n * n
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const i = (y * gw + x) * 4
      const l = luma([px[i], px[i + 1], px[i + 2]])
      // 0 at the darkest theme colour, 1 at the middle one, 2 at the lightest.
      const v =
        l <= mid.l
          ? Math.max(0, (l - dark.l) / Math.max(1e-3, mid.l - dark.l))
          : 1 + Math.min(1, (l - mid.l) / Math.max(1e-3, light.l - mid.l))
      const threshold = (matrix[(y % n) * n + (x % n)] + 0.5) / steps
      const base = Math.floor(v)
      const level = Math.min(2, base + (v - base > threshold ? 1 : 0))
      const rgb = (level === 0 ? dark : level === 1 ? mid : light).rgb
      px[i] = rgb[0]
      px[i + 1] = rgb[1]
      px[i + 2] = rgb[2]
      px[i + 3] = 255
    }
  }
  g.putImageData(image, 0, 0)
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(grid, 0, 0, gw, gh, 0, 0, gw * cell, gh * cell)
  ctx.restore()
}
