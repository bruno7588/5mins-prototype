import { useCallback, useEffect, useState } from 'react'
import { GL_API, glJson, glUrl } from './api'
import { extractPalette } from './palette'
import type { Flower } from './types'

/* Uploaded photos, shared by everyone through the Gradient Studio API
   (api/gradient-lab.ts): uploads are cropped and saved there, and every
   visitor sees the same list. */

/** Saved photos are square JPEGs at this size. */
const SIZE = 1024
/** Shortest side below this would look soft once cropped and blurred. */
const MIN_SIDE = 512

const withUrl = (f: Flower): Flower => ({ ...f, src: glUrl(f.src) })

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('This file could not be read as an image.'))
    img.src = src
  })
}

/** Hue (0-359) of the most prominent colour, or -1 when it is mostly neutral. */
function mainHue(img: HTMLImageElement): number {
  const [top] = extractPalette(img, { size: 4, seed: 1, saturationBoost: 0, ignoreBackground: true })
  if (!top) return -1
  const n = parseInt(top.color.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255)
  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)
  if (d < 0.08) return -1
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return Math.round(((h * 60) + 360) % 360)
}

/** Centre-crops the file to a 1024 x 1024 JPEG and saves it to the shared library. */
export async function uploadFlower(file: File): Promise<Flower> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error(`${file.name}: use a JPEG, PNG or WebP image.`)
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const side = Math.min(img.naturalWidth, img.naturalHeight)
    if (side < MIN_SIDE) throw new Error(`${file.name} is ${img.naturalWidth} x ${img.naturalHeight} px. Use one at least ${MIN_SIDE} px on its shortest side.`)
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is not available.')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, SIZE, SIZE)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    const res = await fetch(`${GL_API}?r=flowers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: file.name, hue: mainHue(img), dataUrl }),
    })
    return withUrl(await glJson<Flower>(res))
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function removeFlower(id: string): Promise<void> {
  return fetch(`${GL_API}?r=flowers&id=${encodeURIComponent(id)}`, { method: 'DELETE' }).then((r) => glJson<void>(r))
}

/** Rainbow order: red to violet, then neutrals last. */
export const byHue = (a: Flower, b: Flower) => (a.hue < 0 ? 999 : a.hue) - (b.hue < 0 ? 999 : b.hue)

/** The shared photos, in rainbow order. */
export function useFlowers() {
  const [flowers, setFlowers] = useState<Flower[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    fetch(`${GL_API}?r=flowers`)
      .then((r) => glJson<Flower[]>(r))
      .then((list) => {
        setFlowers(list.map(withUrl).sort(byHue))
        setError(null)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(reload, [reload])
  return { flowers, loading, error, reload }
}
