import { test, expect } from '@playwright/test';

test('Resize Terminal', async ({ page }) => {
  await page.goto('http://localhost/');
  await page.getByLabel('Terminal input').click();
  await page.getByLabel('Terminal input').pressSequentially('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  await expect(page.getByText('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')).toBeVisible();
  const itemToMove = page.locator('.resizer')

  // Click and hold the item
  await itemToMove.hover();
  await page.mouse.down();

  // Move the mouse to the right (you may need to adjust the xOffset value based on your UI)
  await page.mouse.move(600, 100); // Move right by 100 pixels

  // Release the mouse button
  await page.mouse.up();
  await expect(page.getByText('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')).toBeVisible();

});