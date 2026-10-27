import { iconUrl, type GradientRecipe, type IconColour } from '@/pages/gradient-lab/recipe'
import { shade } from './brandPalette'
import { BAYER } from './pixelFinish'

/* The recipe's icon, finished: drawn at one sample per pixel cell (or per pixel
   with dithering off), each cell's coverage faded across the icon (iconFade,
   towards iconFadeAngle), then kept or dropped against a Bayer matrix mixed with
   random speckle (iconNoise), so the icon dissolves into square dots. It takes
   one colour (iconColour: its own, white or a theme colour), then a gradient
   between two colours (the icon's own, white or a theme colour) can be laid over
   its colour (iconGradient), scattered per pixel (iconGradientNoise). Cells are a % of the frame, as the pixel finish, so
   the 512 px still and the Studio preview show the same grain. */

type Rgb = [number, number, number]

/** OKLCH lightness between a theme colour and its lighter or darker shade. */
const SHADE = 0.18

const hexToRgb = (hex: string): Rgb => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** A stable 0-1 value per cell, so the speckle holds still between frames. */
const speckle = (x: number, y: number) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/** 0 at the start of the direction, 1 at its end, for a point in a unit square. */
const along = (x: number, y: number, degrees: number) => {
  const a = (degrees * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  // The square's extent along the direction, so both corners reach 0 and 1.
  const reach = (Math.abs(c) + Math.abs(s)) / 2
  return Math.min(1, Math.max(0, ((x - 0.5) * c + (y - 0.5) * s) / (2 * reach) + 0.5))
}

const decoded = new Map<string, Promise<HTMLImageElement>>()
function iconImage(svg: string) {
  let p = decoded.get(svg)
  if (!p) {
    const img = new Image()
    img.src = iconUrl(svg)
    p = img.decode().then(() => img)
    decoded.set(svg, p)
  }
  return p
}

/** The finished icon for a frame this many device pixels wide, in the three theme colours (header bar, navigation items, selected item). */
export async function finishedIcon(recipe: GradientRecipe, framePx: number, themeColours: string[] = []): Promise<HTMLCanvasElement> {
  const img = await iconImage(recipe.icon)
  const size = Math.max(1, Math.round(framePx * recipe.iconSize))
  const dither = recipe.iconDither === 'off' ? null : recipe.iconDither
  const cell = dither ? Math.max(1, Math.round((framePx * recipe.iconPixel) / 100)) : 1
  const cells = Math.ceil(size / cell)

  const [header = '#FFFFFF', nav = '#FFFFFF', selected = '#FFFFFF'] = themeColours
  const shades = (key: string, hex: string) => ({
    [key]: hexToRgb(hex),
    [`${key}-light`]: hexToRgb(shade(hex, SHADE)),
    [`${key}-dark`]: hexToRgb(shade(hex, -SHADE)),
  })
  const named = { white: [255, 255, 255], ...shades('header', header), ...shades('nav', nav), ...shades('selected', selected) } as Record<Exclude<IconColour, 'own'>, Rgb>
  const end = (c: IconColour, own: Rgb): Rgb => (c === 'own' ? own : named[c])

  const grid = document.createElement('canvas')
  grid.width = grid.height = cells
  const g = grid.getContext('2d')!
  g.drawImage(img, 0, 0, cells, cells)
  const data = g.getImageData(0, 0, cells, cells)
  const px = data.data
  const bayer = dither ? BAYER[dither] : null
  const side = dither ? Math.sqrt(bayer!.length) : 1
  const last = Math.max(1, cells - 1)
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const i = (y * cells + x) * 4
      if (px[i + 3] === 0) continue
      const u = x / last
      const v = y / last
      const coverage = (px[i + 3] / 255) * (1 - recipe.iconFade * along(u, v, recipe.iconFadeAngle))
      const noise = speckle(x, y)
      let alpha: number
      if (bayer) {
        const ordered = (bayer[(y % side) * side + (x % side)] + 0.5) / bayer.length
        alpha = coverage > ordered + (noise - ordered) * recipe.iconNoise ? 1 : 0
      } else {
        alpha = coverage * (1 - recipe.iconNoise * noise)
      }
      px[i + 3] = Math.round(alpha * recipe.iconOpacity * 255)
      if (recipe.iconColour !== 'own') [px[i], px[i + 1], px[i + 2]] = named[recipe.iconColour]
      if (recipe.iconGradient > 0) {
        const own: Rgb = [px[i], px[i + 1], px[i + 2]]
        // The scatter moves each pixel up or down the gradient, so it reads grainy rather than smooth.
        const scatter = (speckle(x + 7919, y + 104729) - 0.5) * recipe.iconGradientNoise
        const t = Math.min(1, Math.max(0, along(u, v, recipe.iconGradientAngle) + scatter))
        const from = end(recipe.iconGradientFrom, own)
        const to = end(recipe.iconGradientTo, own)
        for (let k = 0; k < 3; k++) px[i + k] = Math.round(own[k] + (from[k] + (to[k] - from[k]) * t - own[k]) * recipe.iconGradient)
      }
    }
  }
  g.putImageData(data, 0, 0)
  if (!dither) return grid

  const out = document.createElement('canvas')
  out.width = out.height = size
  const o = out.getContext('2d')!
  o.imageSmoothingEnabled = false
  o.drawImage(grid, 0, 0, cells * cell, cells * cell)
  return out
}

/** Where the icon's top-left corner sits in a frame this many pixels wide. */
export const iconOrigin = (recipe: GradientRecipe, framePx: number) => ({
  x: Math.round(framePx * (0.5 - recipe.iconSize / 2 + recipe.iconX / 2)),
  y: Math.round(framePx * (0.5 - recipe.iconSize / 2 + recipe.iconY / 2)),
})
