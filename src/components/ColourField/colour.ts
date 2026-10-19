/* Pure colour helpers for ColourField. HSV: h 0-360, s and v 0-100. */

export interface Hsv {
  h: number
  s: number
  v: number
}

const HEX = /^#?([0-9a-f]{6})$/i

/** "#AbC123" or "abc123" to "#abc123"; null when it isn't six hex digits. */
export function normaliseHex(input: string): string | null {
  const m = HEX.exec(input.trim())
  return m ? `#${m[1].toLowerCase()}` : null
}

export function hexToHsv(hex: string): Hsv {
  const clean = normaliseHex(hex) ?? '#000000'
  const n = parseInt(clean.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)
  let h = 0
  if (d) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h: Math.round(h), s: Math.round(max ? (d / max) * 100 : 0), v: Math.round(max * 100) }
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const sat = s / 100
  const val = v / 100
  const f = (k: number) => {
    const x = (k + h / 60) % 6
    return val - val * sat * Math.max(0, Math.min(x, 4 - x, 1))
  }
  return `#${[f(5), f(3), f(1)].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('')}`
}

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
