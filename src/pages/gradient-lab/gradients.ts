import { useCallback, useEffect, useState } from 'react'
import { refreshCompanyDefaults } from '@/data/companyDefaults'
import { GL_API, glJson, glUrl } from './api'
import type { ShaderPreset } from './types'

/* The saved gradients, shared through the Gradient Studio API. Each numbered
   slot keeps a full shader preset (motion included) and a 512 px still; together
   they are the app's default company images, so a save or clear shows in the
   app for everyone straight away. Slots are open-ended. */

/** The app's default company images are square JPEGs at this size. */
export const APP_IMAGE_SIZE = 512

export interface SavedGradient {
  slot: number
  name: string
  /** URL of the 512 px still (the app's company image for this slot). */
  image: string
  savedAt: string
  preset: ShaderPreset
}

const withUrl = (g: SavedGradient): SavedGradient => ({ ...g, image: glUrl(g.image) })

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("The image couldn't be read."))
    reader.readAsDataURL(blob)
  })
}

export async function saveGradient(slot: number, preset: ShaderPreset, image: Blob): Promise<SavedGradient> {
  const res = await fetch(`${GL_API}?r=gradients`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slot, name: preset.name, preset, dataUrl: await toDataUrl(image) }),
  })
  const saved = withUrl(await glJson<SavedGradient>(res))
  refreshCompanyDefaults()
  return saved
}

/** Clears a slot; every later slot moves down one to close the gap. */
export async function clearGradient(slot: number): Promise<void> {
  await glJson<void>(await fetch(`${GL_API}?r=gradients&slot=${slot}`, { method: 'DELETE' }))
  refreshCompanyDefaults()
}

/** Saves a new order: every saved slot once. They come back renumbered 1..n. */
export async function reorderGradients(slots: number[]): Promise<SavedGradient[]> {
  const res = await fetch(`${GL_API}?r=order`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slots }),
  })
  const list = (await glJson<SavedGradient[]>(res)).map(withUrl)
  refreshCompanyDefaults()
  return list
}

/** True when the saved slots skip a number (left by clears before slots closed up). */
const hasGaps = (list: SavedGradient[]) => list.some((g, i) => g.slot !== i + 1)

export function useSavedGradients() {
  const [gradients, setGradients] = useState<SavedGradient[]>([])
  const [error, setError] = useState<string | null>(null)

  /** Resolves with the fresh list (empty if the request failed). */
  const reload = useCallback(
    () =>
      fetch(`${GL_API}?r=gradients`)
        .then((r) => glJson<SavedGradient[]>(r))
        // Older clears left empty slots between gradients; close them up once.
        .then((list) => (hasGaps(list) ? reorderGradients(list.map((g) => g.slot)).catch(() => list) : list))
        .then((list) => {
          const out = list.map(withUrl)
          setGradients(out)
          setError(null)
          return out
        })
        .catch((e: Error) => {
          setError(e.message)
          return [] as SavedGradient[]
        }),
    [],
  )

  useEffect(() => {
    void reload()
  }, [reload])
  return { gradients, error, reload }
}
