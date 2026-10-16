import { describe, expect, it } from 'vitest'
import { parsePreset, toPreset } from './preset'
import { DEFAULT_FRAMING, DEFAULT_LAB_STATE, type LabState } from './types'

const LAB: LabState = {
  ...DEFAULT_LAB_STATE,
  flowerId: '120-base-12345',
  gradient: { ...DEFAULT_LAB_STATE.gradient, sourceMode: 'mix', seed: 42, offsetX: -0.3 },
  noise: { ...DEFAULT_LAB_STATE.noise, type: 'fbm', blend: 'overlay' },
  motion: { ...DEFAULT_LAB_STATE.motion, grainFps: 24, loopSeconds: 12 },
}

const roundTrip = (lab: LabState) => JSON.parse(JSON.stringify(toPreset(lab, 'Spring')))

describe('preset', () => {
  it('round-trips toPreset -> JSON -> parsePreset -> toPreset unchanged', () => {
    const first = toPreset(LAB, 'Spring')
    const parsed = parsePreset(roundTrip(LAB))
    expect(toPreset({ ...LAB, ...parsed }, 'Spring')).toEqual(first)
  })

  it('bakes the palette in and stamps version 1', () => {
    const preset = toPreset(LAB, 'Spring')
    expect(preset.version).toBe(1)
    expect(preset.source.palette).toEqual(LAB.palette)
    expect(preset.source.palette).not.toBe(LAB.palette)
  })

  it('throws a readable error on bad input', () => {
    expect(() => parsePreset(null)).toThrow(/object/)
    expect(() => parsePreset('nope')).toThrow(/object/)
    expect(() => parsePreset({ ...roundTrip(LAB), version: 2 })).toThrow(/version 1/)

    const badType = roundTrip(LAB)
    badType.noise.type = 'perlin'
    expect(() => parsePreset(badType)).toThrow(/noise\.type/)

    const badColour = roundTrip(LAB)
    badColour.source.palette[0].color = 'red'
    expect(() => parsePreset(badColour)).toThrow(/colour/)

    const missing = roundTrip(LAB)
    delete missing.motion.speed
    expect(() => parsePreset(missing)).toThrow(/motion\.speed/)

    const badFps = roundTrip(LAB)
    badFps.motion.grainFps = 30
    expect(() => parsePreset(badFps)).toThrow(/grainFps/)

    const emptyPalette = roundTrip(LAB)
    emptyPalette.source.palette = []
    expect(() => parsePreset(emptyPalette)).toThrow(/palette/)
  })

  it('saves framing and reads it back', () => {
    const lab: LabState = { ...LAB, framing: { aspect: '9:16', renderSize: 2048, rotate: 270 } }
    const preset = toPreset(lab, 'Tall')
    expect(preset.framing).toEqual(lab.framing)
    expect(preset.framing).not.toBe(lab.framing)
    expect(parsePreset(JSON.parse(JSON.stringify(preset))).framing).toEqual(lab.framing)
  })

  it('gives presets without framing the default framing', () => {
    const json = roundTrip(LAB)
    delete json.framing
    expect(parsePreset(json).framing).toEqual(DEFAULT_FRAMING)
  })

  it('rejects invalid framing', () => {
    const badAspect = roundTrip(LAB)
    badAspect.framing.aspect = '2:1'
    expect(() => parsePreset(badAspect)).toThrow(/framing\.aspect/)

    const badSize = roundTrip(LAB)
    badSize.framing.renderSize = 4096
    expect(() => parsePreset(badSize)).toThrow(/framing\.renderSize/)

    const badRotate = roundTrip(LAB)
    badRotate.framing.rotate = 45
    expect(() => parsePreset(badRotate)).toThrow(/framing\.rotate/)

    const notObject = roundTrip(LAB)
    notObject.framing = 'square'
    expect(() => parsePreset(notObject)).toThrow(/framing must be an object/)
  })

  it('reads liquid back and gives older presets none', () => {
    const lab: LabState = { ...LAB, motion: { ...LAB.motion, liquid: 0.6 } }
    expect(parsePreset(JSON.parse(JSON.stringify(toPreset(lab, 'Ink')))).motion?.liquid).toBe(0.6)
    const old = roundTrip(LAB)
    delete old.motion.liquid
    expect(parsePreset(old).motion?.liquid).toBe(0)
    const bad = roundTrip(LAB)
    bad.motion.liquid = 'lots'
    expect(() => parsePreset(bad)).toThrow(/motion\.liquid/)
  })

  it('clamps out-of-range values to the documented ranges', () => {
    const json = roundTrip(LAB)
    json.gradient.softness = 20
    json.gradient.scale = 0
    json.gradient.seed = 1500.4
    json.noise.size = 0.1
    json.motion.speed = -1
    json.motion.warpOctaves = 2.6
    json.motion.loopSeconds = 90
    json.motion.liquid = 2
    json.source.palette[0].x = 3
    const parsed = parsePreset(json)
    expect(parsed.gradient?.softness).toBe(8)
    expect(parsed.gradient?.scale).toBe(0.25)
    expect(parsed.gradient?.seed).toBe(999)
    expect(parsed.noise?.size).toBe(0.5)
    expect(parsed.motion?.speed).toBe(0)
    expect(parsed.motion?.warpOctaves).toBe(3)
    expect(parsed.motion?.loopSeconds).toBe(30)
    expect(parsed.motion?.liquid).toBe(1)
    expect(parsed.palette?.[0].x).toBe(1)
  })
})
