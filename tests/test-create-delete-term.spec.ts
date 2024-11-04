import { test, expect } from '@playwright/test';

test('Create and Delete terminals', async ({ page }) => {
  await page.goto('http://localhost/');
  await page.getByRole('button', { name: 'New Terminal' }).click();

  await expect(page.getByRole('button', { name: '✕' }).nth(1)).toBeVisible();
  await page.getByRole('button', { name: '✕' }).nth(1).click();
  await expect(page.getByRole('button', { name: '✕' }).nth(1)).not.toBeVisible();

});
