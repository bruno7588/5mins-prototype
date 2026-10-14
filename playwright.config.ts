import { defineConfig } from '@playwright/test'

// Pinned to 1.56: macOS 13 can't run newer Playwright browsers.
export default defineConfig({
  testDir: 'tests',
  use: { baseURL: 'http://localhost:5173' },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
})
