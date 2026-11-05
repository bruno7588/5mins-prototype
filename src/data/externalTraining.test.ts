import { describe, expect, it } from 'vitest'
import { addMonthsClamped, dueState, retrainingDueDate, supersededBy, type ExternalRecord } from './externalTraining'

const r = (id: string, completionDate: string, due: string | null, result: ExternalRecord['result'] = 'Passed'): ExternalRecord => ({
  id, personId: '1', courseId: 'c1', providerId: 'p1', completionDate, retrainingDueDate: due,
  result, score: null, certificate: null, source: 'manual',
})

describe('addMonthsClamped', () => {
  it('clamps to the last day of the month', () => {
    expect(addMonthsClamped('2026-01-31', 1)).toBe('2026-02-28')
    expect(addMonthsClamped('2028-01-31', 1)).toBe('2028-02-29')
    expect(addMonthsClamped('2026-10-14', 36)).toBe('2029-10-14')
    expect(addMonthsClamped('2026-11-30', 3)).toBe('2027-02-28')
  })
})

describe('retrainingDueDate', () => {
  it('gives no date for Not Passed or No retraining', () => {
    expect(retrainingDueDate('2026-01-01', 12, 'Not Passed')).toBeNull()
    expect(retrainingDueDate('2026-01-01', null, 'Passed')).toBeNull()
    expect(retrainingDueDate('2026-01-01', 12, 'Passed')).toBe('2027-01-01')
  })
})

describe('dueState', () => {
  const today = '2026-11-05'
  it('flags overdue, due soon within 90 days, and upcoming', () => {
    expect(dueState(r('a', '2023-01-01', '2026-11-04'), [], today)).toBe('overdue')
    expect(dueState(r('a', '2025-01-01', '2027-02-03'), [], today)).toBe('due-soon')
    expect(dueState(r('a', '2025-01-01', '2027-02-04'), [], today)).toBe('upcoming')
  })

  it('supersedes by completion date, not entry order', () => {
    const newer = r('new', '2026-10-01', '2029-10-01')
    const older = r('old', '2023-10-01', '2026-10-01') // added later, still older
    const all = [newer, older]
    expect(dueState(older, all, today)).toBeNull()
    expect(dueState(newer, all, today)).toBe('upcoming')
  })

  it('a later Not Passed does not supersede the passed record', () => {
    const passed = r('p', '2023-12-01', '2026-12-01')
    const failed = r('f', '2026-10-01', null, 'Not Passed')
    const all = [passed, failed]
    expect(supersededBy(passed, all)).toBeNull()
    expect(dueState(passed, all, today)).toBe('due-soon')
    expect(dueState(failed, all, today)).toBeNull()
  })
})
