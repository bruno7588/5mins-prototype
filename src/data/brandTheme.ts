import { useSyncExternalStore } from 'react'

/* The tenant's theme colours, set in Account > Layout > Edit Theme: one set per
   mode, three colours each. null means the 5Mins theme. The default company
   images are generated from the light set (brandPalette.ts). Same store pattern
   as companyImage.ts: saving updates every mounted view without a refresh. */

export interface ThemeSet {
  /** Header bar, #rrggbb */
  header: string
  /** Navigation menu items */
  nav: string
  /** Selected menu item: the accent the gradients lead with. */
  selected: string
}

export interface BrandTheme {
  light: ThemeSet
  dark: ThemeSet
}

export const DEFAULT_THEME: BrandTheme = {
  light: { header: '#F9F9FA', nav: '#454C5E', selected: '#EDA30D' },
  dark: { header: '#20222A', nav: '#BFC2CC', selected: '#FFBB38' },
}

const STORAGE_KEY = '5mins-brand-theme'
const HEX = /^#[0-9a-f]{6}$/i
const listeners = new Set<() => void>()

const isSet = (v: unknown): v is ThemeSet =>
  typeof v === 'object' && v !== null && ['header', 'nav', 'selected'].every((k) => HEX.test(String((v as Record<string, unknown>)[k])))

function load(): BrandTheme | null {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<BrandTheme> | null
    if (stored && isSet(stored.light) && isSet(stored.dark)) return { light: stored.light, dark: stored.dark }
  } catch {
    /* storage unavailable or corrupt: the 5Mins theme */
  }
  return null
}

let current = load()

export function subscribeBrandTheme(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** The tenant's theme, or null for the 5Mins theme. */
export const getBrandTheme = () => current

/** The theme in effect: the tenant's, or the 5Mins one. */
export const effectiveTheme = (theme: BrandTheme | null = current) => theme ?? DEFAULT_THEME

/** null resets to the 5Mins theme. */
export function setBrandTheme(next: BrandTheme | null) {
  current = next
  try {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage full or unavailable: the theme still applies for the session */
  }
  listeners.forEach((l) => l())
}

export function useBrandTheme() {
  return useSyncExternalStore(subscribeBrandTheme, getBrandTheme)
}
