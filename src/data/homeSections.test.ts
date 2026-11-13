import { describe, expect, it } from 'vitest'
import { DEFAULT_HEADINGS, SECTION_KEYS, defaultHomeSections, headingFor, normaliseHomeSections, sameHomeSections } from './homeSections'

describe('homeSections', () => {
  it('falls back to the defaults when nothing is stored', () => {
    expect(normaliseHomeSections(null)).toEqual(defaultHomeSections())
    expect(defaultHomeSections().order).toEqual([...SECTION_KEYS])
    expect(defaultHomeSections().bannerShown).toBe(true)
  })

  it('uses the default heading when the custom one is empty', () => {
    const config = { ...defaultHomeSections(), headings: { explore: '   ' } }
    expect(headingFor(config, 'explore')).toBe(DEFAULT_HEADINGS.explore)
    expect(headingFor({ ...config, headings: { explore: ' Explore Content ' } }, 'explore')).toBe('Explore Content')
  })

  it('does not count an empty or default heading as a change', () => {
    const base = defaultHomeSections()
    expect(sameHomeSections(base, { ...base, headings: { events: '' } })).toBe(true)
    expect(sameHomeSections(base, { ...base, headings: { events: DEFAULT_HEADINGS.events } })).toBe(true)
    expect(sameHomeSections(base, { ...base, headings: { events: 'Workshops' } })).toBe(false)
    expect(sameHomeSections(base, { ...base, bannerShown: false })).toBe(false)
    expect(sameHomeSections(base, { ...base, hidden: { experts: true } })).toBe(false)
    expect(sameHomeSections(base, { ...base, order: ['explore', 'enrolled', 'events', 'experts'] })).toBe(false)
  })

  it('ignores unknown sections and adds missing ones at the end', () => {
    const stored = { bannerShown: false, order: ['events', 'suggestions', 'events', 'enrolled'], headings: { suggestions: 'x', events: ' Workshops ' }, hidden: { events: true } }
    expect(normaliseHomeSections(stored)).toEqual({
      bannerShown: false,
      order: ['events', 'enrolled', 'explore', 'experts'],
      headings: { events: 'Workshops' },
      hidden: { events: true },
    })
  })
})
