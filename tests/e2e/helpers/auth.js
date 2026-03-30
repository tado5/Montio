/**
 * Authentication helpers for E2E tests
 */

export const TEST_USERS = {
  superadmin: {
    email: 'admin@montio.sk',
    password: 'admin123',
    role: 'superadmin',
  },
  // Add more test users as needed
};

/**
 * Login as a specific user
 * @param {import('@playwright/test').Page} page
 * @param {keyof TEST_USERS} userType
 */
export async function login(page, userType = 'superadmin') {
  const user = TEST_USERS[userType];

  await page.goto('/');
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');

  // Wait for successful login (redirect to dashboard)
  await page.waitForURL(/\/(superadmin|company|employee)/, { timeout: 5000 });
}

/**
 * Logout current user
 * @param {import('@playwright/test').Page} page
 */
export async function logout(page) {
  // Click user menu
  await page.click('[data-testid="user-menu"], button:has-text("admin@montio.sk")');

  // Click logout
  await page.click('text=Odhlásiť sa');

  // Wait for redirect to login
  await page.waitForURL('/', { timeout: 5000 });
}

/**
 * Check if user is logged in
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<boolean>}
 */
export async function isLoggedIn(page) {
  try {
    // Check for user menu or dashboard elements
    await page.waitForSelector('[data-testid="user-menu"], .dashboard', { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get auth token from localStorage
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<string|null>}
 */
export async function getAuthToken(page) {
  return await page.evaluate(() => localStorage.getItem('token'));
}

/**
 * Set auth token in localStorage (bypass login)
 * @param {import('@playwright/test').Page} page
 * @param {string} token
 */
export async function setAuthToken(page, token) {
  await page.evaluate((tkn) => {
    localStorage.setItem('token', tkn);
  }, token);
}
