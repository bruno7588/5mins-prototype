import { useEffect, useState, useSyncExternalStore } from 'react'
import type { GradientRecipe } from '@/pages/gradient-lab/recipe'
import { recipeColours, themeColours } from './brandPalette'
import { getBrandTheme, gradientSet, subscribeBrandTheme } from './brandTheme'
import { getCompanyDefaults, subscribeCompanyDefaults, useCompanyDefaults, type CompanyDefault } from './companyDefaults'
import { renderStill } from './renderRecipe'
import { useSurfaceMode, type Theme } from '@/hooks/useTheme'

/* The tenant's company image: shown as the company avatar and as the fallback on
   lesson cards without a thumbnail. Always set (an upload or a default), never
   removed, only changed. Same store pattern as useTheme: saving updates every
   mounted view without a refresh.
   A default is one of the Studio's recipes rendered in this tenant's theme
   colours as 512 x 512 JPEGs, one per mode: `src` in the light set, `dark` in
   the dark set (gradientSet: the 5Mins theme uses its dark set for both). Each `key` records what it was rendered from; when the theme or
   the recipe changes, it renders again. */

type Still = { src: string; key: string }

export type CompanyImage =
  | { kind: 'default'; id: string; src?: string; key?: string; dark?: Still }
  | { kind: 'upload'; src: string }

/** What a default's still depends on: its recipe and the tenant's colours for that mode. */
export const stillKey = (recipe: GradientRecipe, mode: Theme = 'light') => JSON.stringify([recipe, gradientSet(mode)])

/** The recipe's colours for this tenant in that mode. */
export const tenantColours = (recipe: GradientRecipe, mode: Theme = 'light') => recipeColours(recipe, gradientSet(mode))

/** The tenant's three theme colours in that mode, for a recipe's pixel finish. */
export const tenantFinishColours = (mode: Theme = 'light') => themeColours(gradientSet(mode))

const stills = new Map<string, Promise<string>>()

/** A default rendered in the tenant's colours for a mode (cached per recipe and colours). */
export function tenantStill(d: CompanyDefault, mode: Theme = 'light'): Promise<Still> {
  const key = stillKey(d.recipe, mode)
  if (!stills.has(key)) {
    const job = renderStill(d.recipe, tenantColours(d.recipe, mode), 'image/jpeg', tenantFinishColours(mode))
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
/** Replaces any upload. Pass the still (and its mode) when the picker already rendered it; the other mode renders after. */
export function setCompanyDefault(id: string, still?: Still, mode: Theme = 'light') {
  save({ kind: 'default', id, ...(mode === 'dark' ? { dark: still } : still) })
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
  if (!d) return
  const fresh = (s: Partial<Still> | undefined, mode: Theme): s is Still => Boolean(s?.src) && s!.key === stillKey(d.recipe, mode)
  const light = fresh(image, 'light') ? { src: image.src, key: image.key } : null
  const dark = fresh(image.dark, 'dark') ? image.dark : null
  if (light && dark) return
  try {
    const [l, k] = await Promise.all([light ?? tenantStill(d, 'light'), dark ?? tenantStill(d, 'dark')])
    // Only if nothing else was picked meanwhile.
    if (current === image) save({ kind: 'default', id: d.id, ...l, dark: k })
  } catch {
    /* no WebGL: keep the last still */
  }
}

if (typeof window !== 'undefined') {
  subscribeBrandTheme(() => void regenerate())
  subscribeCompanyDefaults(() => void regenerate())
  void regenerate()
}

export function companyImageSrc(image: CompanyImage, mode: Theme = 'light', defaults = getCompanyDefaults()) {
  if (image.kind === 'upload') return image.src
  // Until a mode's version renders: the other mode's, then the Studio still.
  const src = mode === 'dark' ? (image.dark?.src ?? image.src) : (image.src ?? image.dark?.src)
  return src ?? defaultFor(image.id, defaults)?.src ?? ''
}

/** The company image for the surface's mode: the app's, or dark inside the mobile PhoneFrame. */
export function useCompanyImage() {
  const image = useSyncExternalStore(subscribe, () => current)
  const defaults = useCompanyDefaults()
  return { image, src: companyImageSrc(image, useSurfaceMode(), defaults) }
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

/** Every default rendered in the tenant's colours for `mode` while `active` (the picker is open), filled in as each finishes. */
export function useTenantStills(active: boolean, mode: Theme): (d: CompanyDefault) => Still | null {
  const defaults = useCompanyDefaults()
  const theme = useSyncExternalStore(subscribeBrandTheme, getBrandTheme)
  const [stills, setStills] = useState<Record<string, Still>>({})
  useEffect(() => {
    if (!active) return
    let live = true
    for (const d of defaults) {
      tenantStill(d, mode)
        .then((s) => live && setStills((prev) => ({ ...prev, [d.id]: s })))
        .catch(() => {})
    }
    return () => {
      live = false
    }
  }, [active, defaults, theme, mode])
  // A still from before a theme, mode or recipe change doesn't count.
  return (d) => (stills[d.id]?.key === stillKey(d.recipe, mode) ? stills[d.id] : null)
}
