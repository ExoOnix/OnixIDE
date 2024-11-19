import { test, expect } from '@playwright/test';

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

test('Chat send messages', async ({ page }) => {
  const testmessage = generateRandomString(10)
  const testusername = generateRandomString(4)

  await page.goto('http://localhost/');
  await page.locator('button:nth-child(3)').click();
  await page.getByPlaceholder('Enter your username').click();
  await page.getByPlaceholder('Enter your username').fill(testusername);
  await page.getByRole('button', { name: 'Set' }).click();
  await page.getByPlaceholder('Type your message...').click();
  await page.getByPlaceholder('Type your message...').fill(testmessage);
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.locator('body')).toContainText(testmessage);
  await expect(page.locator('body')).toContainText(testusername);
  await page.getByRole('button', { name: 'Change Username' }).click();
  await page.getByPlaceholder('Enter your username').click();
  await page.getByPlaceholder('Enter your username').fill('');
});