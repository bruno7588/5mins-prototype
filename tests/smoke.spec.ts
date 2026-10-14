import { expect, test } from '@playwright/test'

test('root redirects to workspace and shows its header', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/workspace$/)
  await expect(page.getByRole('banner')).toBeVisible()
})
