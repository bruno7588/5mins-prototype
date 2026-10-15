import { useCallback, useEffect, useRef } from 'react'
import { extractPalette } from '../palette'
import type { Flower, LabState, PalettePoint } from '../types'

/* Palette extraction for the chosen flower. A palette is re-extracted only
   when its inputs (flower, colour count, saturation boost, background, seed)
   change; a palette that already matches them (extracted, hand-edited in the
   panel or loaded from a preset) is kept. */

/** The extraction inputs a palette was made from (or edited / loaded under). */
export const paletteKeys = new WeakMap<PalettePoint[], string>()
/** Palettes the DialKit panel itself wrote, so they are never echoed back into it. */
export const dialPalettes = new WeakSet<PalettePoint[]>()

export function extractKey(lab: Pick<LabState, 'flowerId' | 'paletteSize' | 'saturationBoost' | 'ignoreBackground' | 'gradient'>): string {
  return [lab.flowerId, lab.paletteSize, lab.saturationBoost, lab.ignoreBackground, lab.gradient.seed].join('|')
}

const imageCache = new Map<string, Promise<HTMLImageElement>>()

function loadImage(src: string): Promise<HTMLImageElement> {
  let pending = imageCache.get(src)
  if (!pending) {
    pending = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Couldn't load ${src}`))
      img.src = src
    })
    pending.catch(() => imageCache.delete(src))
    imageCache.set(src, pending)
  }
  return pending
}

/** Keeps lab.palette in step with the chosen flower. Returns a forced re-extract. */
export function usePaletteExtraction(
  lab: LabState,
  update: (patch: Partial<LabState>) => void,
  flowers: Flower[],
): () => void {
  const latest = useRef({ lab, update, flowers })
  latest.current = { lab, update, flowers }

  const requestRef = useRef(0)
  const extract = useCallback((src: string) => {
    const id = ++requestRef.current
    loadImage(src)
      .then((img) => {
        if (id !== requestRef.current) return
        const { lab: now, update: push } = latest.current
        const palette = extractPalette(img, {
          size: now.paletteSize,
          seed: now.gradient.seed,
          saturationBoost: now.saturationBoost,
          ignoreBackground: now.ignoreBackground,
        })
        if (palette.length === 0) return // keep the current palette
        paletteKeys.set(palette, extractKey(now))
        push({ palette })
      })
      .catch(() => {})
  }, [])

  const flowerSrc = flowers.find((f) => f.id === lab.flowerId)?.src
  const key = extractKey(lab)
  useEffect(() => {
    if (!flowerSrc) return
    if (paletteKeys.get(latest.current.lab.palette) === key) return
    extract(flowerSrc)
  }, [key, flowerSrc, extract])

  return useCallback(() => {
    const { lab: now, flowers: list } = latest.current
    const src = list.find((f) => f.id === now.flowerId)?.src
    if (src) extract(src)
  }, [extract])
}
