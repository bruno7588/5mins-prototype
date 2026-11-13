import { useSyncExternalStore } from 'react'

/* The tenant's Your Workspace layout, set in Account > Layout > Home page sections
   (DEV-5185 web, DEV-5214 app): the heading, order and visibility of each section, and
   whether the home banner shows. Same store pattern as brandTheme.ts: saving updates
   every mounted view without a refresh. */

export const SECTION_KEYS = ['enrolled', 'explore', 'events', 'experts'] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

export const DEFAULT_HEADINGS: Record<SectionKey, string> = {
  enrolled: "Courses you're enrolled in",
  explore: 'Explore content from 5Mins',
  events: 'Events',
  experts: 'Meet in-house experts',
}

export interface HomeSections {
  bannerShown: boolean
  order: SectionKey[]
  /** Custom headings only; a missing or empty one means the default. */
  headings: Partial<Record<SectionKey, string>>
  hidden: Partial<Record<SectionKey, boolean>>
}

export const defaultHomeSections = (): HomeSections => ({
  bannerShown: true,
  order: [...SECTION_KEYS],
  headings: {},
  hidden: {},
})

const isKey = (v: unknown): v is SectionKey => SECTION_KEYS.includes(v as SectionKey)

/** Whatever was stored, made safe: unknown keys dropped, missing sections added at the end. */
export function normaliseHomeSections(stored: unknown): HomeSections {
  const base = defaultHomeSections()
  if (typeof stored !== 'object' || stored === null) return base
  const s = stored as Partial<HomeSections>
  const order = Array.isArray(s.order) ? [...new Set(s.order.filter(isKey))] : []
  for (const key of SECTION_KEYS) if (!order.includes(key)) order.push(key)
  const headings: HomeSections['headings'] = {}
  const hidden: HomeSections['hidden'] = {}
  for (const key of SECTION_KEYS) {
    const heading = s.headings?.[key]
    if (typeof heading === 'string' && heading.trim() && heading.trim() !== DEFAULT_HEADINGS[key]) headings[key] = heading.trim()
    if (s.hidden?.[key] === true) hidden[key] = true
  }
  return { bannerShown: s.bannerShown !== false, order, headings, hidden }
}

/** The heading learners see: the custom one, or the default when none is saved. */
export const headingFor = (config: HomeSections, key: SectionKey) => config.headings[key]?.trim() || DEFAULT_HEADINGS[key]

/** True when learners would see the same page: an empty or default heading is not a change. */
export function sameHomeSections(a: HomeSections, b: HomeSections) {
  const view = (c: HomeSections) =>
    JSON.stringify({
      banner: c.bannerShown,
      order: c.order,
      headings: SECTION_KEYS.map((k) => headingFor(c, k)),
      hidden: SECTION_KEYS.map((k) => !!c.hidden[k]),
    })
  return view(a) === view(b)
}

const STORAGE_KEY = '5mins-home-sections'
const listeners = new Set<() => void>()

function load(): HomeSections {
  try {
    return normaliseHomeSections(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'))
  } catch {
    /* storage unavailable or corrupt: the defaults */
    return defaultHomeSections()
  }
}

let current = load()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const getHomeSections = () => current

export function setHomeSections(next: HomeSections) {
  current = normaliseHomeSections(next)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  } catch {
    /* storage full or unavailable: the layout still applies for the session */
  }
  listeners.forEach((l) => l())
}

export function useHomeSections() {
  return useSyncExternalStore(subscribe, getHomeSections)
}
