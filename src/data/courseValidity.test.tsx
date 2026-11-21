import { describe, expect, it } from 'vitest'
import { formatValidity, getCourseRule, setCourseRule, validUntil } from './courseValidity'

describe('validUntil', () => {
  it('is empty without a period or a completion', () => {
    expect(validUntil('2026-06-18', null)).toBeNull()
    expect(validUntil(null, 36)).toBeNull()
  })

  it('counts the period from the completion date', () => {
    expect(validUntil('2026-06-18', 36)).toBe('2029-06-18')
  })

  it('clamps to the end of a shorter month', () => {
    expect(validUntil('2026-01-31', 1)).toBe('2026-02-28')
  })

  it('gives two completions of one course their own dates', () => {
    expect(validUntil('2025-10-20', 36)).not.toBe(validUntil('2026-06-18', 36))
  })
})

describe('course rules', () => {
  it('defaults to No expiry and no certificate', () => {
    expect(getCourseRule('Unknown course')).toEqual({ validityMonths: null, certificate: false })
  })

  it('saves a new period for a course', () => {
    setCourseRule('Unknown course', { validityMonths: 24 })
    expect(getCourseRule('Unknown course').validityMonths).toBe(24)
  })

  it('formats whole years as years', () => {
    expect(formatValidity(36)).toBe('3 years')
    expect(formatValidity(12)).toBe('1 year')
    expect(formatValidity(35)).toBe('35 months')
  })
})
