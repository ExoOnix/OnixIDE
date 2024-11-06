import { test, expect } from '@playwright/test';

test('Test Editor Sync', async ({ page, context }) => {
  await page.goto('http://localhost/');
  const page1 = await context.newPage();
  await page1.goto('http://localhost/');


  await page.getByText('test.txt', { exact: true }).click();
  await page.locator('.cm-content > div:nth-child(6)').click();
  await page.locator('main').filter({ hasText: /^91234567››Hello World from test\.txt$/ }).getByRole('textbox').pressSequentially("testtype");
  

  await expect(page1.getByText('testtype')).toBeVisible();
  await page1.getByText('testtype').click();

  for (let i = 0; i < 8; i++) {
    await page1.keyboard.press("Backspace");
  }

  await expect(page1.getByText('testtype')).not.toBeVisible();
});