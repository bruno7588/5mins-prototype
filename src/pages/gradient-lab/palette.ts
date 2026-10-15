import type { PalettePoint } from './types'

/* Palette extraction: chroma-weighted k-means in CIELAB. Lab keeps clusters
   perceptually even, and weighting by chroma lets a small saturated petal win
   a cluster over a large dull background. Everything is seeded, so the same
   pixels and seed always give the same palette. */

export interface PaletteOptions {
  /** Number of colours, 3-8. */
  size: number
  seed: number
  /** 0-1 extra saturation applied to the result. */
  saturationBoost: number
  /** Skip the dominant low-saturation cluster (sky, wall, studio backdrop). */
  ignoreBackground: boolean
}

const ITERATIONS = 12
/* A cluster below this Lab chroma counts as "background" (greys, whites, beiges). */
const BACKGROUND_CHROMA = 14
/* ...and it must cover at least this share of the photo to be dropped. */
const BACKGROUND_SHARE = 0.15

/** Small seeded PRNG (returns floats in [0, 1)). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* sRGB <-> CIELAB (D65) */

function toLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function toSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

const XN = 0.95047
const ZN = 1.08883

function labF(t: number): number {
  return t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116
}

function labFInv(t: number): number {
  return t * t * t > 216 / 24389 ? t * t * t : (116 * t - 16) / (24389 / 27)
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const lr = toLinear(r / 255)
  const lg = toLinear(g / 255)
  const lb = toLinear(b / 255)
  const x = (0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb) / XN
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.072175 * lb
  const z = (0.0193339 * lr + 0.119192 * lg + 0.9503041 * lb) / ZN
  const fx = labF(x)
  const fy = labF(y)
  const fz = labF(z)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

/** Lab to sRGB 0-1, unclamped (so callers can test gamut). */
function labToRgb(l: number, a: number, b: number): [number, number, number] {
  const fy = (l + 16) / 116
  const x = labFInv(fy + a / 500) * XN
  const y = labFInv(fy)
  const z = labFInv(fy - b / 200) * ZN
  const lr = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z
  const lg = -0.969266 * x + 1.8760108 * y + 0.041556 * z
  const lb = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z
  return [toSrgb(lr), toSrgb(lg), toSrgb(lb)]
}

function inGamut([r, g, b]: [number, number, number]): boolean {
  const e = 1e-4
  return r >= -e && r <= 1 + e && g >= -e && g <= 1 + e && b >= -e && b <= 1 + e
}

function hex(rgb: [number, number, number]): string {
  return (
    '#' +
    rgb
      .map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, '0'))
      .join('')
  )
}

/* Boosts chroma in LCh. When the boost pushes out of sRGB, bisect back to the
   most saturated in-gamut chroma instead of clipping channels (clipping shifts hue). */
function boostedHex(l: number, a: number, b: number, boost: number): string {
  const c = Math.hypot(a, b)
  const h = Math.atan2(b, a)
  const at = (chroma: number) => labToRgb(l, chroma * Math.cos(h), chroma * Math.sin(h))
  const target = c * (1 + boost)
  let rgb = at(target)
  if (!inGamut(rgb) && inGamut(at(c))) {
    let lo = c
    let hi = target
    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2
      if (inGamut(at(mid))) lo = mid
      else hi = mid
    }
    rgb = at(lo)
  }
  return hex(rgb)
}

interface Samples {
  lab: Float64Array // 3 per sample
  weight: Float64Array // chroma weight
  pos: Float64Array // 2 per sample, 0-1
  count: number
}

function kmeans(s: Samples, k: number, rand: () => number): { centroids: Float64Array; assign: Int32Array } {
  const { lab, weight, count } = s
  const centroids = new Float64Array(k * 3)
  const assign = new Int32Array(count)
  const dist = new Float64Array(count).fill(Infinity)

  /* Weighted pick: index whose cumulative score passes a random threshold. */
  const pick = (score: (i: number) => number): number => {
    let total = 0
    for (let i = 0; i < count; i++) total += score(i)
    if (total <= 0) return -1
    let r = rand() * total
    for (let i = 0; i < count; i++) {
      r -= score(i)
      if (r <= 0) return i
    }
    return count - 1
  }

  /* k-means++ seeding: spread the first centroids by squared distance x chroma weight. */
  for (let c = 0; c < k; c++) {
    let idx = c === 0 ? -1 : pick((i) => weight[i] * dist[i])
    if (idx < 0) idx = pick((i) => weight[i])
    if (idx < 0) idx = 0
    centroids[c * 3] = lab[idx * 3]
    centroids[c * 3 + 1] = lab[idx * 3 + 1]
    centroids[c * 3 + 2] = lab[idx * 3 + 2]
    for (let i = 0; i < count; i++) {
      const dl = lab[i * 3] - centroids[c * 3]
      const da = lab[i * 3 + 1] - centroids[c * 3 + 1]
      const db = lab[i * 3 + 2] - centroids[c * 3 + 2]
      dist[i] = Math.min(dist[i], dl * dl + da * da + db * db)
    }
  }

  const sums = new Float64Array(k * 4)
  for (let iter = 0; iter < ITERATIONS; iter++) {
    for (let i = 0; i < count; i++) {
      let best = 0
      let bestD = Infinity
      for (let c = 0; c < k; c++) {
        const dl = lab[i * 3] - centroids[c * 3]
        const da = lab[i * 3 + 1] - centroids[c * 3 + 1]
        const db = lab[i * 3 + 2] - centroids[c * 3 + 2]
        const d = dl * dl + da * da + db * db
        if (d < bestD) {
          bestD = d
          best = c
        }
      }
      assign[i] = best
    }
    sums.fill(0)
    for (let i = 0; i < count; i++) {
      const c = assign[i]
      const w = weight[i]
      sums[c * 4] += lab[i * 3] * w
      sums[c * 4 + 1] += lab[i * 3 + 1] * w
      sums[c * 4 + 2] += lab[i * 3 + 2] * w
      sums[c * 4 + 3] += w
    }
    /* An empty cluster keeps its old centroid. */
    for (let c = 0; c < k; c++) {
      const w = sums[c * 4 + 3]
      if (w > 0) {
        centroids[c * 3] = sums[c * 4] / w
        centroids[c * 3 + 1] = sums[c * 4 + 1] / w
        centroids[c * 3 + 2] = sums[c * 4 + 2] / w
      }
    }
  }
  return { centroids, assign }
}

function collectSamples(pixels: Uint8ClampedArray, width: number, height: number): Samples {
  const total = width * height
  const lab = new Float64Array(total * 3)
  const weight = new Float64Array(total)
  const pos = new Float64Array(total * 2)
  let count = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4
      if (pixels[p + 3] < 128) continue // transparent cut-outs are not part of the photo
      const [l, a, b] = rgbToLab(pixels[p], pixels[p + 1], pixels[p + 2])
      lab[count * 3] = l
      lab[count * 3 + 1] = a
      lab[count * 3 + 2] = b
      /* Greys still count a little so a mostly grey photo still clusters. */
      weight[count] = 0.1 + Math.hypot(a, b) / 30
      pos[count * 2] = (x + 0.5) / width
      pos[count * 2 + 1] = (y + 0.5) / height
      count++
    }
  }
  return { lab, weight, pos, count }
}

function filterSamples(s: Samples, keep: (i: number) => boolean): Samples {
  const lab = new Float64Array(s.count * 3)
  const weight = new Float64Array(s.count)
  const pos = new Float64Array(s.count * 2)
  let count = 0
  for (let i = 0; i < s.count; i++) {
    if (!keep(i)) continue
    lab.set(s.lab.subarray(i * 3, i * 3 + 3), count * 3)
    weight[count] = s.weight[i]
    pos.set(s.pos.subarray(i * 2, i * 2 + 2), count * 2)
    count++
  }
  return { lab, weight, pos, count }
}

/** Pure k-means on RGBA pixels (testable without a canvas). */
export function paletteFromPixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  options: PaletteOptions,
): PalettePoint[] {
  const k = Math.min(8, Math.max(3, Math.round(options.size)))
  let samples = collectSamples(pixels, width, height)
  if (samples.count === 0) return []

  let result = kmeans(samples, k, mulberry32(options.seed))

  if (options.ignoreBackground) {
    /* Find the biggest low-chroma cluster; if it is big enough to be a backdrop,
       drop its pixels and recluster what is left. */
    const counts = new Int32Array(k)
    for (let i = 0; i < samples.count; i++) counts[result.assign[i]]++
    let bg = -1
    for (let c = 0; c < k; c++) {
      const chroma = Math.hypot(result.centroids[c * 3 + 1], result.centroids[c * 3 + 2])
      if (chroma < BACKGROUND_CHROMA && counts[c] / samples.count >= BACKGROUND_SHARE && (bg < 0 || counts[c] > counts[bg])) {
        bg = c
      }
    }
    if (bg >= 0 && samples.count - counts[bg] > 0) {
      const assign = result.assign
      samples = filterSamples(samples, (i) => assign[i] !== bg)
      result = kmeans(samples, k, mulberry32(options.seed))
    }
  }

  const { centroids, assign } = result
  const counts = new Float64Array(k)
  const sx = new Float64Array(k)
  const sy = new Float64Array(k)
  for (let i = 0; i < samples.count; i++) {
    const c = assign[i]
    counts[c]++
    sx[c] += samples.pos[i * 2]
    sy[c] += samples.pos[i * 2 + 1]
  }

  const points: PalettePoint[] = []
  for (let c = 0; c < k; c++) {
    const n = counts[c]
    points.push({
      color: boostedHex(centroids[c * 3], centroids[c * 3 + 1], centroids[c * 3 + 2], options.saturationBoost),
      x: n > 0 ? sx[c] / n : 0.5,
      y: n > 0 ? sy[c] / n : 0.5,
      weight: n / samples.count,
    })
  }
  /* Array.prototype.sort is stable, so ties keep cluster order (deterministic). */
  return points.sort((a, b) => b.weight - a.weight)
}

/** Downscales a loaded image to 64 x 64 and runs paletteFromPixels. */
export function extractPalette(image: HTMLImageElement, options: PaletteOptions): PalettePoint[] {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return []
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)
  return paletteFromPixels(data, size, size, options)
}
