import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import App from './App'
import { ImpersonationProvider } from './impersonation/ImpersonationContext'

test('renders the workspace header', () => {
  render(
    <MemoryRouter initialEntries={['/workspace']}>
      <ImpersonationProvider>
        <App />
      </ImpersonationProvider>
    </MemoryRouter>,
  )
  expect(screen.getAllByRole('banner').length).toBeGreaterThan(0)
})
