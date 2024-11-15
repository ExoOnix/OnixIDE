import { test, expect } from '@playwright/test';

test('Test Git', async ({ page }) => {
  await page.goto('http://localhost/');


  await page.locator('button:nth-child(2)').first().click();
  await expect(page.locator('body')).toContainText('Git is disabled');

  await page.getByLabel('Terminal input').click();
  await page.getByLabel('Terminal input').pressSequentially('git init');
  await page.getByLabel('Terminal input').press('Enter');
  
  
  await expect(page.getByText('Branches+')).toBeVisible();
  await expect(page.locator('body')).toContainText('Commits');
  
  // Assure staging works
  await page.getByRole('button', { name: '+' }).first().click();
  await expect(page.locator('div').filter({ hasText: /^-test\.txt$/ }).getByRole('button')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^-\.gitkeep$/ }).getByRole('button')).toBeVisible();
  await page.getByRole('button', { name: '-' }).first().click();
  await expect(page.locator('div').filter({ hasText: /^\+\.gitkeep$/ }).getByRole('button')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^\+test\.txt$/ }).getByRole('button')).toBeVisible();

  await page.getByLabel('Terminal input').click();
  await page.getByLabel('Terminal input').pressSequentially('rm -rf ./.git');
  await page.getByLabel('Terminal input').press('Enter');
  await expect(page.locator('body')).toContainText('Git is disabled');


});