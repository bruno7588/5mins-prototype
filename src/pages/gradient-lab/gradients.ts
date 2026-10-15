import { useCallback, useEffect, useState } from 'react'
import type { ShaderPreset } from './types'

/* Client for the saved-gradient slots of the dev-only tools/gradient-lab
   plugin. Each of the 12 slots keeps a full shader preset (motion included)
   and writes the app's default company image for that slot. */

const API = '/__gradient-lab/gradients'
export const GRADIENT_SLOTS = 12
/** The app's default company images are square JPEGs at this size. */
export const APP_IMAGE_SIZE = 512

export interface SavedGradient {
  slot: number
  name: string
  /** Dev-server URL of the app image this slot writes. */
  image: string
  savedAt: string
  preset: ShaderPreset
}

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`)
  return body as T
}

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("The image couldn't be read."))
    reader.readAsDataURL(blob)
  })
}

export async function saveGradient(slot: number, preset: ShaderPreset, image: Blob): Promise<SavedGradient> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slot, name: preset.name, preset, dataUrl: await toDataUrl(image) }),
  })
  return json<SavedGradient>(res)
}

export function clearGradient(slot: number): Promise<void> {
  return fetch(`${API}/${slot}`, { method: 'DELETE' }).then((r) => json<void>(r))
}

export function useSavedGradients() {
  const [gradients, setGradients] = useState<SavedGradient[]>([])
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    // The saved slots write the app's images on localhost only.
    if (!import.meta.env.DEV) return
    fetch(API)
      .then((r) => json<SavedGradient[]>(r))
      .then((list) => {
        setGradients(list)
        setError(null)
      })
      .catch((e: Error) => setError(e.message))
  }, [])

  useEffect(reload, [reload])
  return { gradients, error, reload }
}
