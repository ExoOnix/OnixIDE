import { test, expect } from '@playwright/test';

test('Test Terminal Response', async ({ page }) => {
  await page.goto('http://localhost/');
  await page.getByLabel('Terminal input').click();
  await page.getByLabel('Terminal input').pressSequentially('echo test');
  await page.getByLabel('Terminal input').press('Enter');
  
  
  
  await expect(page.getByText('test', { exact: true })).toBeVisible();

});