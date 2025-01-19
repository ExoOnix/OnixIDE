import { test, expect } from '@playwright/test';

test('Tabs', async ({ page }) => {
  await page.goto('http://localhost/');
  
  await page.getByRole('button').nth(4).click();
  await expect(page.getByRole('heading')).toContainText('AutoCompletions');
  await page.getByRole('button').first().click();
  await expect(page.getByRole('list')).toContainText('.gitkeep');
});