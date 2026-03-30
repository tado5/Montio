import { test, expect } from '@playwright/test';
import { login, logout, TEST_USERS } from './helpers/auth.js';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/MONTIO/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator('text=/nesprávn|error|invalid/i')).toBeVisible({ timeout: 5000 });
  });

  test('should login successfully as superadmin', async ({ page }) => {
    await login(page, 'superadmin');

    // Should redirect to superadmin dashboard
    await expect(page).toHaveURL(/\/superadmin/);

    // Should see dashboard elements
    await expect(page.locator('text=/dashboard|firmy/i')).toBeVisible();
  });

  test('should persist session after page reload', async ({ page }) => {
    await login(page, 'superadmin');

    // Reload page
    await page.reload();

    // Should still be logged in
    await expect(page).toHaveURL(/\/superadmin/);
  });

  test('should logout successfully', async ({ page }) => {
    await login(page, 'superadmin');

    await logout(page);

    // Should redirect to login page
    await expect(page).toHaveURL('/');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('quick login buttons should work', async ({ page }) => {
    // Find and click super admin quick login
    const quickLoginBtn = page.locator('button:has-text("Super Admin")').first();

    if (await quickLoginBtn.isVisible()) {
      await quickLoginBtn.click();

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/superadmin/, { timeout: 5000 });
    } else {
      // Skip if quick login not available (production)
      test.skip();
    }
  });

  test('should validate empty form submission', async ({ page }) => {
    await page.click('button[type="submit"]');

    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    const isInvalid = await emailInput.evaluate((el) => !el.validity.valid);

    expect(isInvalid).toBeTruthy();
  });
});
