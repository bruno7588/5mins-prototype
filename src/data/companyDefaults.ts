import { useSyncExternalStore } from 'react'
import { DEFAULT_COMPANY_IMAGES } from '@/assets/company-images'
import { GL_API, glJson, glUrl } from '@/pages/gradient-lab/api'
import { readRecipe, type GradientRecipe } from '@/pages/gradient-lab/recipe'

/* The default company images: the gradients saved in Gradient Studio, loaded
   from its shared API (so a save there shows here for everyone). Until that
   answers, the last list this browser saw is used, then the images bundled in
   the code. `default-NN` ids match Studio slot NN. Each is a recipe: the shape
   of the gradient, rendered per tenant in its theme colours (companyImage.ts).
   Defaults without a readable recipe are left out. */

export interface CompanyDefault {
  id: string
  /** The Studio still, in the 5Mins colours. Shown only until the tenant's version renders. */
  src: string
  recipe: GradientRecipe
}

// v2: entries carry recipes, not photo presets.
const CACHE_KEY = '5mins-company-defaults-v2'

const BUNDLED_PRESETS = import.meta.glob('/src/assets/gradient-lab/gradients/gradient-*.json', {
  eager: true,
  import: 'default',
})

const slotId = (slot: number) => `default-${String(slot).padStart(2, '0')}`

/** Keeps the defaults that have a readable recipe. */
const withRecipes = (list: { id: string; src: string; recipe: unknown }[]): CompanyDefault[] =>
  list.flatMap((d) => {
    const recipe = readRecipe(d.recipe)
    return recipe ? [{ id: d.id, src: d.src, recipe }] : []
  })

function bundled(): CompanyDefault[] {
  return withRecipes(DEFAULT_COMPANY_IMAGES.map((d) => ({ ...d, recipe: BUNDLED_PRESETS[`/src/assets/gradient-lab/gradients/${d.id.replace('default-', 'gradient-')}.json`] })))
}

function cached(): CompanyDefault[] | null {
  try {
    const list = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as CompanyDefault[] | null
    return Array.isArray(list) && list.length > 0 ? withRecipes(list) : null
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
      current = withRecipes(list.map((g) => ({ id: slotId(g.slot), src: glUrl(g.image), recipe: g.preset })))
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

/* A Studio save in another tab: fetch again when this one comes back into view, so an
   open page picks up the new defaults (and companyImage.ts re-renders the current one). */
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && requested) refreshCompanyDefaults()
  })
}

export const getCompanyDefaults = () => current
export const subscribeCompanyDefaults = subscribe

export function useCompanyDefaults(): CompanyDefault[] {
  return useSyncExternalStore(subscribe, getCompanyDefaults)
}
