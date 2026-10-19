import { DEFAULT_THEME, type ThemeSet } from './brandTheme'

/* Turns a tenant's theme colours (UI colours, not a palette) into shader colours.
   Fed in raw, black, grey and white make a muddy image, so:
   1. Neutrals (black, white, greys) never become shader colours; with no other brand
      hue, the support slots are pale shades of the accent.
   2. The selected menu item is the accent and leads; a neutral accent falls back to 5Mins amber.
   3. Lighter and darker versions of the accent give depth.
   4. The chromatic header bar and nav colours add up to two support hues, placed
      straight after the accent so they show in every shader, not only at 5 colours.
   5. A support hue far round the colour wheel from the accent (red with green) would
      blend through grey, so it is pulled to an analogous hue next to the accent.
   Every colour is held inside a lightness band with a chroma floor, so none goes
   muddy-dark or washed-out. Works in OKLCH, where lightness and chroma are perceptual. */

interface Lch {
  l: number
  c: number
  /** Degrees, 0-360 */
  h: number
}

/** Below this chroma a colour reads as grey. */
export const NEUTRAL_CHROMA = 0.04
/** No shader colour is darker than this or less saturated than this. */
export const MIN_LIGHTNESS = 0.38
export const MAX_LIGHTNESS = 0.92
export const MIN_CHROMA = 0.06
/** The accent and support sit in this band. */
const LEAD_L: [number, number] = [0.45, 0.85]
const LEAD_C = 0.08
/** Hues further apart than this clash when blended (red with green is ~117, teal with periwinkle ~95). */
const CLASH_DEGREES = 110
/** Analogous step used to replace a clashing hue. */
const ANALOGOUS_DEGREES = 30
/** Hues closer than this count as the same colour. */
const SAME_HUE_DEGREES = 12
/** ...unless their lightness differs by at least this much. */
const SAME_LIGHTNESS = 0.2
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const toSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

function hexToLch(hex: string): Lch {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => toLinear(v / 255))
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const h = (Math.atan2(bb, a) * 180) / Math.PI
  return { l: L, c: Math.hypot(a, bb), h: (h + 360) % 360 }
}

/** Linear sRGB for an LCh colour (may be out of gamut). */
function lchToLinear({ l: L, c, h }: Lch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

const inGamut = (rgb: number[]) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4)

/** #rrggbb, lowering chroma (keeping lightness and hue) until it fits sRGB. */
function lchToHex(lch: Lch): string {
  let { c } = lch
  if (!inGamut(lchToLinear(lch))) {
    let lo = 0
    let hi = c
    for (let i = 0; i < 16; i++) {
      const mid = (lo + hi) / 2
      if (inGamut(lchToLinear({ ...lch, c: mid }))) lo = mid
      else hi = mid
    }
    c = lo
  }
  const rgb = lchToLinear({ ...lch, c }).map((v) => Math.round(clamp(toSrgb(clamp(v, 0, 1)), 0, 1) * 255))
  return `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

/** Shortest signed turn from hue a to hue b, -180 to 180. */
const hueTurn = (a: number, b: number) => ((b - a + 540) % 360) - 180

const lead = (x: Lch): Lch => ({ l: clamp(x.l, ...LEAD_L), c: Math.max(x.c, LEAD_C), h: x.h })

/** Shader colours for a theme set: accent, support, darker accent, lighter accent, second support (or a tint). `count` is 3-5. */
export function brandPalette(set: ThemeSet, count = 4): string[] {
  const n = clamp(Math.round(count), 3, 5)
  const fallback = hexToLch(DEFAULT_THEME.light.selected)
  const picked = hexToLch(set.selected)
  const accent = lead(picked.c < NEUTRAL_CHROMA ? fallback : picked)

  const lighter: Lch = { l: Math.min(MAX_LIGHTNESS, accent.l + 0.15), c: Math.max(MIN_CHROMA, accent.c * 0.8), h: accent.h }
  // Darkened yellows turn olive; turning them towards orange keeps them warm.
  const olive = accent.h > 60 && accent.h < 115
  const darker: Lch = { l: Math.max(MIN_LIGHTNESS, accent.l - 0.18), c: Math.max(LEAD_C, accent.c), h: olive ? accent.h - 20 : accent.h }

  // A brand hue the accent (or the other brand colour) already covers adds nothing; skip it like a neutral.
  const supports: Lch[] = []
  for (const source of [set.header, set.nav].map(hexToLch)) {
    if (source.c < NEUTRAL_CHROMA) continue
    const turn = hueTurn(accent.h, source.h)
    // Clashing pair: keep the direction, but only an analogous step away from the accent.
    const h = Math.abs(turn) > CLASH_DEGREES ? (accent.h + Math.sign(turn) * ANALOGOUS_DEGREES + 360) % 360 : source.h
    // Same hue at a clearly different lightness (mint with teal) still reads as its own colour.
    if ([accent, ...supports].some((x) => Math.abs(hueTurn(x.h, h)) <= SAME_HUE_DEGREES && Math.abs(x.l - source.l) < SAME_LIGHTNESS)) continue
    supports.push(lead({ ...source, h }))
  }
  // No brand hue besides the accent (the 5Mins theme's grey header and nav): pale shades of the accent itself.
  const shade = (towardWhite: number, chroma: number): Lch => ({
    l: accent.l + (MAX_LIGHTNESS - accent.l) * towardWhite,
    c: Math.max(MIN_CHROMA, accent.c * chroma),
    h: accent.h,
  })
  const support = supports[0] ?? shade(0.5, 0.6)
  const second = supports[1] ?? (supports[0] ? { l: Math.min(MAX_LIGHTNESS, support.l + 0.12), c: Math.max(MIN_CHROMA, support.c * 0.7), h: support.h } : shade(1, 0.4))

  return [accent, support, darker, lighter, second].slice(0, n).map(lchToHex)
}

/** OKLCH of a hex colour, for tests and checks. */
export const toLch = hexToLch
