import { useSyncExternalStore } from 'react'
import { getCompanyDefaults, useCompanyDefaults } from './companyDefaults'

/* The tenant's company image: shown as the company avatar and as the fallback on
   lesson cards without a thumbnail. Always set (an upload or a default), never
   removed, only changed. Same store pattern as useTheme: saving updates every
   mounted view without a refresh. */

export type CompanyImage = { kind: 'default'; id: string } | { kind: 'upload'; src: string }

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
/** Replaces any upload. */
export const setCompanyDefault = (id: string) => save({ kind: 'default', id })

export function companyImageSrc(image: CompanyImage, defaults = getCompanyDefaults()) {
  if (image.kind === 'upload') return image.src
  return (defaults.find((d) => d.id === image.id) ?? defaults[0]).src
}

export function useCompanyImage() {
  const image = useSyncExternalStore(subscribe, () => current)
  const defaults = useCompanyDefaults()
  return { image, src: companyImageSrc(image, defaults) }
}

export const COMPANY_IMAGE_SIZE = 512
const MAX_BYTES = 9 * 1024 * 1024

/** Upload rules: JPEG, under 9 MB, at least 512 x 512 so it stays crisp at every size. */
export async function validateCompanyImage(file: File): Promise<string | null> {
  if (file.type !== 'image/jpeg') return 'Only JPEG images are supported. Upload a .jpg or .jpeg file.'
  if (file.size >= MAX_BYTES) return 'This image is 9 MB or larger. Upload a JPEG smaller than 9 MB.'
  try {
    const bitmap = await createImageBitmap(file)
    const { width, height } = bitmap
    bitmap.close()
    if (width < COMPANY_IMAGE_SIZE || height < COMPANY_IMAGE_SIZE) {
      return `This image is ${width} x ${height} px. Upload one at least 512 x 512 px.`
    }
  } catch {
    return 'This image could not be read. Upload a different JPEG.'
  }
  return null
}
