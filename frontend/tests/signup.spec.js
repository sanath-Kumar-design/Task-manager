
import { test, expect } from '@playwright/test';


test('you can sign up and complete username setup', async ({ page }) => {
  const uniqueEmail = `test${Date.now()}@example.com`;
  const password = 'TestPass@123'

  await page.goto('http://localhost:5173/');

  await page.getByPlaceholder('First name').fill('Test');
  await page.getByPlaceholder('Last name').fill('User');
  await page.getByPlaceholder('you@example.com').fill(uniqueEmail);
  await page.getByPlaceholder('Create a password').fill(password);
  await page.getByPlaceholder('Re-enter your password').fill(password);

  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page).toHaveURL(/\/username/);

  await page.getByPlaceholder('your_username').fill(`user${Date.now()}`);

  await page.getByRole('button', { name: /continue to workspace/i }).click();

  await expect(page).toHaveURL(/\/homepage/); 

})