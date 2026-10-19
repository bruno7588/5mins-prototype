import { describe, expect, it } from 'vitest'
import { brandPalette, MAX_LIGHTNESS, MIN_CHROMA, MIN_LIGHTNESS, NEUTRAL_CHROMA, toLch } from './brandPalette'
import { DEFAULT_THEME } from './brandTheme'

const hueGap = (a: number, b: number) => Math.abs(((b - a + 540) % 360) - 180)

describe('brandPalette', () => {
  it('leads with the 5Mins amber by default', () => {
    const [accent] = brandPalette(DEFAULT_THEME.light)
    expect(hueGap(toLch(accent).h, toLch('#EDA30D').h)).toBeLessThan(3)
  })

  it('never emits a neutral, too dark or too pale colour', () => {
    const sets = [
      DEFAULT_THEME.light,
      { header: '#000000', nav: '#808080', selected: '#ffffff' },
      { header: '#2e2ede', nav: '#57f5c0', selected: '#e397a7' },
      { header: '#111111', nav: '#222222', selected: '#0a1a3a' },
      { header: '#ffffff', nav: '#fafafa', selected: '#fff8e0' },
    ]
    for (const set of sets) {
      for (const hex of brandPalette(set, 5)) {
        const { l, c } = toLch(hex)
        expect(c, hex).toBeGreaterThanOrEqual(Math.min(MIN_CHROMA, NEUTRAL_CHROMA) - 0.005)
        expect(l, hex).toBeGreaterThanOrEqual(MIN_LIGHTNESS - 0.01)
        expect(l, hex).toBeLessThanOrEqual(MAX_LIGHTNESS + 0.01)
      }
    }
  })

  it('falls back to amber when the accent is grey', () => {
    const [accent] = brandPalette({ header: '#000000', nav: '#808080', selected: '#888888' })
    expect(hueGap(toLch(accent).h, toLch('#EDA30D').h)).toBeLessThan(3)
  })

  it('pulls a clashing support hue next to the accent (red with green)', () => {
    const palette = brandPalette({ header: '#1fae3a', nav: '#454C5E', selected: '#d62020' }, 5)
    const accentHue = toLch(palette[0]).h
    for (const hex of palette) expect(hueGap(accentHue, toLch(hex).h), hex).toBeLessThanOrEqual(31)
  })

  it('keeps a close brand hue as it is', () => {
    const palette = brandPalette({ header: '#1e9ad6', nav: '#454C5E', selected: '#2e2ede' }, 4)
    expect(hueGap(toLch(palette[3]).h, toLch('#1e9ad6').h)).toBeLessThan(3)
  })

  it('returns 3 to 5 colours and is deterministic', () => {
    expect(brandPalette(DEFAULT_THEME.light, 1)).toHaveLength(3)
    expect(brandPalette(DEFAULT_THEME.light, 9)).toHaveLength(5)
    expect(brandPalette(DEFAULT_THEME.light, 4)).toEqual(brandPalette(DEFAULT_THEME.light, 4))
  })
})
