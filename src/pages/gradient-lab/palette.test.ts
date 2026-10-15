import { describe, expect, it } from 'vitest'
import { paletteFromPixels, type PaletteOptions } from './palette'

type Rgb = [number, number, number]

/* Builds a w x h RGBA image from a per-pixel colour function. */
function image(w: number, h: number, colourAt: (x: number, y: number) => Rgb): Uint8ClampedArray {
  const px = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b] = colourAt(x, y)
      px.set([r, g, b, 255], (y * w + x) * 4)
    }
  }
  return px
}

function rgbOf(hex: string): Rgb {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb
}

const opts: PaletteOptions = { size: 5, seed: 7, saturationBoost: 0, ignoreBackground: false }

/* A noisy multicolour test image: four hue quadrants with deterministic jitter. */
const busy = image(64, 64, (x, y) => {
  const j = ((x * 31 + y * 17) % 23) - 11
  if (x < 32 && y < 32) return [220 + j, 60, 80]
  if (x >= 32 && y < 32) return [240, 190 + j, 60]
  if (x < 32) return [60, 180 + j, 150]
  return [110, 120, 230 + j]
})

describe('paletteFromPixels', () => {
  it('is deterministic for the same input and seed', () => {
    expect(paletteFromPixels(busy, 64, 64, opts)).toEqual(paletteFromPixels(busy, 64, 64, opts))
  })

  it('returns exactly size points whose weights sum to 1', () => {
    for (const size of [3, 5, 8]) {
      const p = paletteFromPixels(busy, 64, 64, { ...opts, size })
      expect(p).toHaveLength(size)
      expect(p.reduce((s, q) => s + q.weight, 0)).toBeCloseTo(1, 6)
      for (const q of p) expect(q.color).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('places two colours at their x positions', () => {
    const px = image(64, 64, (x) => (x < 32 ? [230, 30, 40] : [30, 60, 230]))
    const [a, b] = paletteFromPixels(px, 64, 64, { ...opts, size: 3 })
    const red = [a, b].find((p) => rgbOf(p.color)[0] > 150)
    const blue = [a, b].find((p) => rgbOf(p.color)[2] > 150)
    expect(red?.x).toBeCloseTo(0.25, 2)
    expect(blue?.x).toBeCloseTo(0.75, 2)
    expect(red!.weight + blue!.weight).toBeCloseTo(1, 6)
  })

  it('drops a grey backdrop when ignoreBackground is on', () => {
    const px = image(64, 64, (x, y) => {
      if (y >= 24 && y < 40 && x >= 8 && x < 24) return [230, 30, 40]
      if (y >= 24 && y < 40 && x >= 40 && x < 56) return [30, 60, 230]
      return [128, 128, 128]
    })
    const isGrey = (hex: string) => {
      const [r, g, b] = rgbOf(hex)
      return Math.max(r, g, b) - Math.min(r, g, b) < 20
    }
    const withBg = paletteFromPixels(px, 64, 64, { ...opts, size: 3 })
    expect(isGrey(withBg[0].color)).toBe(true)

    const noBg = paletteFromPixels(px, 64, 64, { ...opts, size: 3, ignoreBackground: true })
    expect(noBg).toHaveLength(3)
    expect(noBg.some((p) => p.weight > 0 && isGrey(p.color))).toBe(false)
  })
})
