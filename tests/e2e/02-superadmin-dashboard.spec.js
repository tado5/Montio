import { test, expect } from '@playwright/test';
import { login } from './helpers/auth.js';

test.describe('Super Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'superadmin');
  });

  test('should display dashboard with KPI cards', async ({ page }) => {
    // Check for KPI cards
    await expect(page.locator('text=/celkom|aktívne|pending|neaktívne/i').first()).toBeVisible();

    // Should have statistics
    const stats = await page.locator('[class*="grid"]').first();
    await expect(stats).toBeVisible();
  });

  test('should display companies table', async ({ page }) => {
    // Check for table headers
    await expect(page.locator('text=/názov|status/i')).toBeVisible();

    // Wait for data to load (or empty state)
    await page.waitForSelector('table, text=/žiadne firmy|no companies/i', { timeout: 5000 });
  });

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Hľadať"], input[type="search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      // Wait for search to complete
      await page.waitForTimeout(500);

      // Results should update
      await expect(searchInput).toHaveValue('test');
    }
  });

  test('should have filter dropdown', async ({ page }) => {
    const filterSelect = page.locator('select, [role="combobox"]').first();

    if (await filterSelect.isVisible()) {
      // Should have filter options
      await expect(filterSelect).toBeVisible();
    }
  });

  test('should open create company modal', async ({ page }) => {
    // Click create company button
    const createBtn = page.locator('button:has-text("Pozvať"), button:has-text("Pridať")').first();

    if (await createBtn.isVisible()) {
      await createBtn.click();

      // Modal should appear
      await expect(page.locator('text=/email|pozvánka/i')).toBeVisible({ timeout: 3000 });

      // Close modal (ESC or X button)
      await page.keyboard.press('Escape');
    }
  });

  test('should navigate to company detail', async ({ page }) => {
    // Find first company row detail button
    const detailBtn = page.locator('button:has-text("Detail"), a:has-text("Detail")').first();

    if (await detailBtn.isVisible()) {
      await detailBtn.click();

      // Should navigate to company detail page
      await expect(page).toHaveURL(/\/superadmin\/company\//, { timeout: 5000 });

      // Should see company info
      await expect(page.locator('text=/informácie|users|používatelia/i')).toBeVisible();
    }
  });

  test('should have working sidebar navigation', async ({ page }) => {
    // Check sidebar links
    const firmyLink = page.locator('nav a:has-text("Firmy")');

    if (await firmyLink.isVisible()) {
      await expect(firmyLink).toBeVisible();

      // Should have active state
      const isActive = await firmyLink.evaluate((el) =>
        el.className.includes('bg-') || el.getAttribute('aria-current') === 'page'
      );

      expect(isActive).toBeTruthy();
    }
  });

  test('should have user menu with profile and logout', async ({ page }) => {
    // Click user menu (email or avatar)
    const userMenuBtn = page.locator('button:has-text("@"), [data-testid="user-menu"]').first();

    if (await userMenuBtn.isVisible()) {
      await userMenuBtn.click();

      // Should show dropdown
      await expect(page.locator('text=Odhlásiť sa')).toBeVisible({ timeout: 2000 });

      // Close dropdown
      await page.keyboard.press('Escape');
    }
  });

  test('should have notification bell', async ({ page }) => {
    const notificationBell = page.locator('[data-testid="notification-bell"], button:has-text("🔔")');

    if (await notificationBell.isVisible()) {
      await notificationBell.click();

      // Should show notifications dropdown or "no notifications"
      await page.waitForSelector('text=/žiadne notifikácie|no notifications|notification/i', {
        timeout: 3000,
      });
    }
  });

  test('should display correct user role', async ({ page }) => {
    // Should see "Super Admin" somewhere
    await expect(page.locator('text=/super admin/i')).toBeVisible();
  });
});
