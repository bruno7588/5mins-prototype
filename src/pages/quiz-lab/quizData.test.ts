import { describe, expect, it } from 'vitest'
import { gradeImageChoice, wrongAnswerCount } from './quizData'

describe('gradeImageChoice', () => {
  const correct = [0, 2]

  it('is right only for the exact correct set, in any order', () => {
    expect(gradeImageChoice([2, 0], correct)).toEqual({ right: true, hits: 2, wrongPicks: 0, missed: 0, total: 2 })
  })

  it('fails a subset and counts the missed image', () => {
    expect(gradeImageChoice([0], correct)).toEqual({ right: false, hits: 1, wrongPicks: 0, missed: 1, total: 2 })
  })

  it('fails a superset and counts the wrong pick', () => {
    expect(gradeImageChoice([0, 1, 2], correct)).toEqual({ right: false, hits: 2, wrongPicks: 1, missed: 0, total: 2 })
  })

  it('fails a mixed set and counts both', () => {
    expect(gradeImageChoice([0, 1], correct)).toEqual({ right: false, hits: 1, wrongPicks: 1, missed: 1, total: 2 })
  })

  it('fails when no pick is correct', () => {
    expect(gradeImageChoice([1], correct)).toEqual({ right: false, hits: 0, wrongPicks: 1, missed: 2, total: 2 })
  })
})

describe('wrongAnswerCount', () => {
  const correct = [0, 2, 3]

  it('counts the correct picks', () => {
    expect(wrongAnswerCount([0, 2], correct)).toBe('2 of 3 correct')
    expect(wrongAnswerCount([0, 1], correct)).toBe('1 of 3 correct')
  })

  it('says how many were picked when there are more picks than correct options', () => {
    expect(wrongAnswerCount([0, 1, 2, 3], correct)).toBe('4 picked, only 3 correct')
  })
})
