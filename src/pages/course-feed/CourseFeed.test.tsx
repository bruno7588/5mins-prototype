import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, test } from 'vitest'
import CourseFeed from './CourseFeed'
import { getCourseSituationalTest } from '@/data/courseFeed'

test('the feed opens on the brief and Start shows the first question', async () => {
  const situational = getCourseSituationalTest('c1')
  render(
    <MemoryRouter initialEntries={['/courses/c1/feed']}>
      <Routes>
        <Route path="/courses/:id/feed" element={<CourseFeed />} />
      </Routes>
    </MemoryRouter>,
  )
  /* The title shows on the brief card and again in the (collapsed) outline. */
  expect(screen.getAllByText(situational.title).length).toBeGreaterThan(0)
  /* The lessons stay locked until the test is answered through. */
  expect((screen.getByRole('button', { name: 'Next' }) as HTMLButtonElement).disabled).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'Start Situational Test' }))
  expect(await screen.findByText(`Question 1/${situational.questions.length}`)).toBeTruthy()
  expect(screen.getByText(situational.questions[0].text)).toBeTruthy()
})
