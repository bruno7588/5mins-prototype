import { useEffect, useState, useSyncExternalStore } from 'react'
import type { GradientRecipe } from '@/pages/gradient-lab/recipe'
import { brandPalette } from './brandPalette'
import { effectiveTheme, getBrandTheme, subscribeBrandTheme } from './brandTheme'
import { getCompanyDefaults, subscribeCompanyDefaults, useCompanyDefaults, type CompanyDefault } from './companyDefaults'
import { renderStill } from './renderRecipe'

/* The tenant's company image: shown as the company avatar and as the fallback on
   lesson cards without a thumbnail. Always set (an upload or a default), never
   removed, only changed. Same store pattern as useTheme: saving updates every
   mounted view without a refresh.
   A default is one of the Studio's recipes rendered in this tenant's theme
   colours (the light set) as a 512 x 512 JPEG. `key` records what it was
   rendered from; when the theme or the recipe changes, it renders again. */

export type CompanyImage =
  | { kind: 'default'; id: string; src?: string; key?: string }
  | { kind: 'upload'; src: string }

/** What a default's still depends on: its recipe and the tenant's light colours. */
export const stillKey = (recipe: GradientRecipe) => JSON.stringify([recipe, effectiveTheme().light])

/** The recipe's shader colours for this tenant. */
export const tenantColours = (recipe: GradientRecipe) => brandPalette(effectiveTheme().light, recipe.colours)

const stills = new Map<string, Promise<string>>()

/** A default rendered in the tenant's colours (cached per recipe and theme). */
export function tenantStill(d: CompanyDefault): Promise<{ src: string; key: string }> {
  const key = stillKey(d.recipe)
  if (!stills.has(key)) {
    const job = renderStill(d.recipe, tenantColours(d.recipe))
    job.catch(() => stills.delete(key))
    stills.set(key, job)
  }
  return stills.get(key)!.then((src) => ({ src, key }))
}

const STORAGE_KEY = '5mins-company-image'
/* The first default. Any default- id is kept even if the list hasn't loaded it yet. */
const FALLBACK: CompanyImage = { kind: 'default', id: 'default-01' }
const listeners = new Set<() => void>()

function load(): CompanyImage {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as CompanyImage | null
    if (stored?.kind === 'upload' && stored.src) return stored
    if (stored?.kind === 'default' && /^default-\d+$/.test(stored.id)) return stored
  } catch {
    /* storage unavailable or corrupt: use the pre-selected default */
  }
  return FALLBACK
}

let current = load()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function save(next: CompanyImage) {
  current = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* storage full or unavailable: the image still applies for the session */
  }
  listeners.forEach((l) => l())
}

export const setCompanyUpload = (src: string) => save({ kind: 'upload', src })
/** Replaces any upload. Pass the still when the picker already rendered it. */
export function setCompanyDefault(id: string, still?: { src: string; key: string }) {
  save({ kind: 'default', id, ...still })
  void regenerate()
}

/** The default an image points at; the first one if that slot no longer exists. */
const defaultFor = (id: string, defaults: CompanyDefault[]) => defaults.find((d) => d.id === id) ?? defaults[0]

/* Renders the current default again when its theme or recipe has moved on.
   Uploads are never touched. */
async function regenerate() {
  const image = current
  if (image.kind !== 'default') return
  const d = defaultFor(image.id, getCompanyDefaults())
  if (!d || (image.src && image.key === stillKey(d.recipe))) return
  try {
    const still = await tenantStill(d)
    // Only if nothing else was picked meanwhile.
    if (current === image) save({ kind: 'default', id: d.id, ...still })
  } catch {
    /* no WebGL: keep the last still */
  }
}

if (typeof window !== 'undefined') {
  subscribeBrandTheme(() => void regenerate())
  subscribeCompanyDefaults(() => void regenerate())
  void regenerate()
}

export function companyImageSrc(image: CompanyImage, defaults = getCompanyDefaults()) {
  if (image.kind === 'upload' || image.src) return image.src!
  // Until the tenant's version renders: the Studio still.
  return defaultFor(image.id, defaults)?.src ?? ''
}

export function useCompanyImage() {
  const image = useSyncExternalStore(subscribe, () => current)
  const defaults = useCompanyDefaults()
  return { image, src: companyImageSrc(image, defaults) }
}

export const COMPANY_IMAGE_SIZE = 512
const MAX_BYTES = 9 * 1024 * 1024

/** Upload rules: PNG or JPEG, under 9 MB, at least 512 x 512 so it stays crisp at every size. */
export async function validateCompanyImage(file: File): Promise<string | null> {
  if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
    return 'Only PNG or JPEG images are supported. Upload a .png, .jpg or .jpeg file.'
  }
  if (file.size >= MAX_BYTES) return 'This image is 9 MB or larger. Upload an image smaller than 9 MB.'
  try {
    const bitmap = await createImageBitmap(file)
    const { width, height } = bitmap
    bitmap.close()
    if (width < COMPANY_IMAGE_SIZE || height < COMPANY_IMAGE_SIZE) {
      return `This image is ${width} x ${height} px. Upload one at least 512 x 512 px.`
    }
  } catch {
    return 'This image could not be read. Upload a different image.'
  }
  return null
}

type Still = { src: string; key: string }

/** Every default rendered in the tenant's colours while `active` (the picker is open), filled in as each finishes. */
export function useTenantStills(active: boolean): (d: CompanyDefault) => Still | null {
  const defaults = useCompanyDefaults()
  const theme = useSyncExternalStore(subscribeBrandTheme, getBrandTheme)
  const [stills, setStills] = useState<Record<string, Still>>({})
  useEffect(() => {
    if (!active) return
    let live = true
    for (const d of defaults) {
      tenantStill(d)
        .then((s) => live && setStills((prev) => ({ ...prev, [d.id]: s })))
        .catch(() => {})
    }
    return () => {
      live = false
    }
  }, [active, defaults, theme])
  // A still from before a theme or recipe change doesn't count.
  return (d) => (stills[d.id]?.key === stillKey(d.recipe) ? stills[d.id] : null)
}
