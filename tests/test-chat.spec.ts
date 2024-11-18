import { test, expect } from '@playwright/test';

test('Chat send messages', async ({ page }) => {
  await page.goto('http://localhost/');
  await page.locator('button:nth-child(3)').click();
  await page.getByPlaceholder('Enter your username').click();
  await page.getByPlaceholder('Enter your username').fill('test');
  await page.getByRole('button', { name: 'Set' }).click();
  await page.getByPlaceholder('Type your message...').click();
  await page.getByPlaceholder('Type your message...').fill('testmessage');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.locator('body')).toContainText('testmessage');
  await expect(page.locator('body')).toContainText('test');
  await page.getByRole('button', { name: 'Change Username' }).click();
  await page.getByPlaceholder('Enter your username').click();
  await page.getByPlaceholder('Enter your username').fill('');
});