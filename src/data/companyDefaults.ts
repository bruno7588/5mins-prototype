import { useSyncExternalStore } from 'react'
import { DEFAULT_COMPANY_IMAGES } from '@/assets/company-images'
import { GL_API, glJson, glUrl } from '@/pages/gradient-lab/api'

/* The default company images: the gradients saved in Gradient Studio, loaded
   from its shared API (so a save there shows here for everyone). Until that
   answers, the last list this browser saw is used, then the images bundled in
   the code. `default-NN` ids match Studio slot NN. */

export interface CompanyDefault {
  id: string
  /** The still image. */
  src: string
  /** The Gradient Studio preset behind it, or null for a plain image. */
  preset: unknown
}

const CACHE_KEY = '5mins-company-defaults'

const BUNDLED_PRESETS = import.meta.glob('/src/assets/gradient-lab/gradients/gradient-*.json', {
  eager: true,
  import: 'default',
})

const slotId = (slot: number) => `default-${String(slot).padStart(2, '0')}`

function bundled(): CompanyDefault[] {
  return DEFAULT_COMPANY_IMAGES.map((d) => ({
    ...d,
    preset: BUNDLED_PRESETS[`/src/assets/gradient-lab/gradients/${d.id.replace('default-', 'gradient-')}.json`] ?? null,
  }))
}

function cached(): CompanyDefault[] | null {
  try {
    const list = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as CompanyDefault[] | null
    return Array.isArray(list) && list.length > 0 ? list : null
  } catch {
    return null
  }
}

let current: CompanyDefault[] = cached() ?? bundled()
let requested = false
const listeners = new Set<() => void>()

/** Fetches the saved gradients again (Gradient Studio calls this after a save or clear). */
export function refreshCompanyDefaults() {
  requested = true
  fetch(`${GL_API}?r=gradients`)
    .then((r) => glJson<{ slot: number; image: string; preset: unknown }[]>(r))
    .then((list) => {
      if (list.length === 0) return
      current = list.map((g) => ({ id: slotId(g.slot), src: glUrl(g.image), preset: g.preset }))
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(current))
      } catch {
        /* storage full or unavailable: the list still applies for this visit */
      }
      listeners.forEach((l) => l())
    })
    .catch(() => {
      /* offline or not deployed yet: keep what is shown */
    })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!requested) refreshCompanyDefaults()
  return () => listeners.delete(listener)
}

export const getCompanyDefaults = () => current

export function useCompanyDefaults(): CompanyDefault[] {
  return useSyncExternalStore(subscribe, getCompanyDefaults)
}
