import { useSyncExternalStore } from 'react'

/* The tenant's theme colours, set in Account > Layout > Edit Theme: one set per
   mode, three colours each. null means the 5Mins theme. The default company
   images are generated from the set for each mode (gradientSet; the 5Mins theme
   uses its dark set in both). Same store pattern
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

/** The 5Mins colours the gradients use: its dark set, in both modes, with the grey
    navigation colour swapped for --primary-600 (the canvas needs the hex itself). */
export const DEFAULT_GRADIENT_SET: ThemeSet = { ...DEFAULT_THEME.dark, nav: '#00AFC4' }

/** The colours a gradient is drawn in for a mode: a custom theme's own set for that
    mode, or the 5Mins dark set whatever the mode. */
export const gradientSet = (mode: 'light' | 'dark', theme: BrandTheme | null = current) => (theme ? theme[mode] : DEFAULT_GRADIENT_SET)

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

/* The theme on screen: a custom theme paints the header bar, the navigation menu
   items and the selected item through --brand-header, --brand-nav and
   --brand-selected on <html>, in the set for the mode showing. The stylesheets read
   them with the 5Mins tokens as the fallback, so the 5Mins theme sets nothing. */
const BRAND_VARS: [keyof ThemeSet, string][] = [
  ['header', '--brand-header'],
  ['nav', '--brand-nav'],
  ['selected', '--brand-selected'],
]

function paintBrandVars() {
  const root = document.documentElement
  const set = current?.[root.dataset.theme === 'dark' ? 'dark' : 'light']
  for (const [key, name] of BRAND_VARS) {
    if (set) root.style.setProperty(name, set[key])
    else root.style.removeProperty(name)
  }
}

if (typeof window !== 'undefined') {
  paintBrandVars()
  subscribeBrandTheme(paintBrandVars)
  // Light/dark is the <html data-theme> attribute (useTheme): repaint when it flips.
  new MutationObserver(paintBrandVars).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
}

const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => lin(c / 255))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** The mode a header bar's contents should take so they read on its colour: a dark bar
    gets the dark tokens (light text), a light bar the light ones. Undefined when no
    custom theme is set or the bar already suits the app's mode, so headers leave it unset. */
export function useHeaderTheme(): 'light' | 'dark' | undefined {
  const theme = useBrandTheme()
  const mode = useSyncExternalStore(subscribeMode, readMode)
  if (!theme) return undefined
  // The bar is dark when white text out-contrasts near-black on it.
  const want = luminance(theme[mode].header) < 0.18 ? 'dark' : 'light'
  return want === mode ? undefined : want
}

const readMode = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
function subscribeMode(listener: () => void) {
  const observer = new MutationObserver(listener)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}
