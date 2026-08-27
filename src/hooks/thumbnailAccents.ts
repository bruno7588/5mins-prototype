import { useEffect, useState } from 'react'

export type Rgb = [number, number, number]

export interface ThumbnailAccents {
  /** Dominant colour — the thumbnail's hairline and the first gradient stop. */
  primary: Rgb
  /** Next most present colour far enough from the first to read as a second stop. */
  secondary: Rgb
}

/** Down-sample the image to this square before counting; plenty for two colours. */
const SAMPLE = 32
/** 4 bits per channel — colours within a bucket are the same colour to the eye. */
const BUCKET_BITS = 4
/** How far apart, in RGB space, the second colour has to sit from the first. */
const MIN_DISTANCE = 60

/**
 * The two colours a banner takes from its thumbnail: the dominant one for the
 * hairline and the leading gradient stop, the runner-up for the trailing stop.
 *
 * Pixels are binned into a coarse colour cube and each bin scored by how much
 * of the image it covers, weighted towards saturation so a photo's subject
 * beats its grey background.
 */
export function thumbnailAccents(image: HTMLImageElement): ThumbnailAccents | null {
  const canvas = document.createElement('canvas')
  canvas.width = SAMPLE
  canvas.height = SAMPLE
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(image, 0, 0, SAMPLE, SAMPLE)

  const bins = new Map<number, { r: number; g: number; b: number; n: number; score: number }>()
  const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE)

  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]]
    if (a < 128) continue
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    // Near-black and near-white carry no hue to build a wash from.
    if (max < 32 || min > 224) continue

    const shift = 8 - BUCKET_BITS
    const key = ((r >> shift) << (BUCKET_BITS * 2)) | ((g >> shift) << BUCKET_BITS) | (b >> shift)
    const bin = bins.get(key) ?? { r: 0, g: 0, b: 0, n: 0, score: 0 }
    bin.r += r
    bin.g += g
    bin.b += b
    bin.n += 1
    bin.score += 0.5 + (max - min) / max
    bins.set(key, bin)
  }

  const ranked = [...bins.values()]
    .sort((a, b) => b.score - a.score)
    .map((bin): Rgb => [Math.round(bin.r / bin.n), Math.round(bin.g / bin.n), Math.round(bin.b / bin.n)])

  const primary = ranked[0]
  if (!primary) return null
  const secondary = ranked.find((c) => distance(c, primary) > MIN_DISTANCE) ?? primary
  return { primary, secondary }
}

function distance(a: Rgb, b: Rgb): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

/** Reads the accents off `src` once it has decoded; null until then. */
export function useThumbnailAccents(src?: string): ThumbnailAccents | null {
  const [accents, setAccents] = useState<ThumbnailAccents | null>(null)

  useEffect(() => {
    setAccents(null)
    if (!src) return
    let live = true
    const image = new Image()
    image.src = src
    image
      .decode()
      .then(() => {
        if (live) setAccents(thumbnailAccents(image))
      })
      .catch(() => {
        /* Undecodable image — the banner keeps its neutral fallback wash. */
      })
    return () => {
      live = false
    }
  }, [src])

  return accents
}

export function rgba([r, g, b]: Rgb, alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
