import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import ProgressBar from './ProgressBar'

afterEach(cleanup)

const segs = (el: HTMLElement, mod: string) => el.querySelectorAll(`.ds-progress__seg--${mod}`).length

test('fills the nearest eighth and exposes the value', () => {
  render(<ProgressBar value={30} label="Course progress" />)
  const bar = screen.getByRole('progressbar', { name: 'Course progress' })
  expect(bar.children).toHaveLength(8)
  expect(segs(bar, 'filled')).toBe(2) // 30% of 8 = 2.4
  expect(bar.getAttribute('aria-valuenow')).toBe('30')
})

test('clamps out-of-range values', () => {
  render(<ProgressBar value={-20} label="a" />)
  expect(segs(screen.getByRole('progressbar'), 'filled')).toBe(0)
})

test('is complete at 100% or when complete is passed', () => {
  const { rerender } = render(<ProgressBar value={100} label="a" />)
  expect(screen.getByRole('progressbar').className).toContain('ds-progress--complete')
  rerender(<ProgressBar value={40} complete label="a" />)
  const bar = screen.getByRole('progressbar')
  expect(bar.className).toContain('ds-progress--complete')
  expect(segs(bar, 'filled')).toBe(8)
  expect(bar.getAttribute('aria-valuenow')).toBe('100')
})

test('draws done steps before the in-progress fill', () => {
  render(<ProgressBar value={50} doneValue={25} label="a" />)
  const bar = screen.getByRole('progressbar')
  expect(segs(bar, 'done')).toBe(2)
  expect(segs(bar, 'filled')).toBe(2)
})

test('shows the percentage when asked', () => {
  render(<ProgressBar value={62} showValue label="a" />)
  expect(screen.getByText('62%')).toBeTruthy()
})
