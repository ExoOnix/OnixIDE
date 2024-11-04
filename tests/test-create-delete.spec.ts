import { test, expect } from '@playwright/test';

test('Creating and Deleting Files', async ({ page }) => {
  await page.goto('http://localhost/');
  await page.locator('div').filter({ hasText: /^OnixIDE$/ }).click({
    button: 'right'
  });
  await page.getByRole('menuitem', { name: 'Create File' }).click();
  await page.getByLabel('New Name').fill('testfile');
  await page.getByText('Create', { exact: true }).click();
  await expect(page.getByRole('list')).toContainText('testfile');
  await page.locator('div').filter({ hasText: /^testfile$/ }).nth(2).click({
    button: 'right'
  });
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await expect(page.getByRole('list')).not.toContainText('testfile');

});