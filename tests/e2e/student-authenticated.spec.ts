import { test, expect } from '@playwright/test';

/**
 * Authenticated student acceptance flow.
 *
 * Required CI/staging secrets:
 *   MELA_TEST_STUDENT_EMAIL
 *   MELA_TEST_STUDENT_PASSWORD
 *
 * The account must be a real, active, verified student account with a
 * completed role selection. No production credentials belong in source control.
 */
const email = process.env.MELA_TEST_STUDENT_EMAIL;
const password = process.env.MELA_TEST_STUDENT_PASSWORD;

test.describe('Student authenticated workflow E2E', () => {
  test.skip(!email || !password, 'Set MELA_TEST_STUDENT_EMAIL and MELA_TEST_STUDENT_PASSWORD for the authenticated E2E gate.');

  test('login → student workspace → session restore → logout', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#open').click();
    await expect(page.locator('#login')).toBeVisible();

    await page.locator('#em').fill(email!);
    await page.locator('#pw').fill(password!);
    await page.locator('#signin').click();

    await expect(page.locator('#app')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('#out')).toBeVisible();
    await expect(page.locator('#c')).toBeVisible();

    // A valid student must land in the authenticated learner experience rather
    // than remaining on the public/login shell or an unauthorised role workspace.
    await expect(page.locator('#wel')).toBeVisible();
    await expect(page.locator('[data-tab="q"]')).toBeVisible();
    await expect(page.locator('[data-tab="learn"]')).toBeVisible();
    await expect(page.locator('[data-tab="account"]')).toBeVisible();

    // Verify the browser has a persisted authenticated session, then reload.
    const sessionBeforeReload = await page.evaluate(() => localStorage.getItem('melaSession'));
    expect(sessionBeforeReload).toBeTruthy();

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('#app')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('#out')).toBeVisible();
    await expect(page.locator('#wel')).toBeVisible();

    // Logout must remove the authenticated state and return to login/public shell.
    await page.locator('#out').click();
    await expect(page.locator('#login')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#app')).toBeHidden();
    const sessionAfterLogout = await page.evaluate(() => localStorage.getItem('melaSession'));
    expect(sessionAfterLogout).toBeNull();
  });

  test('student session cannot be replaced by an unauthenticated browser state', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#open').click();
    await page.locator('#em').fill(email!);
    await page.locator('#pw').fill(password!);
    await page.locator('#signin').click();
    await expect(page.locator('#app')).toBeVisible({ timeout: 20000 });

    await page.evaluate(() => localStorage.removeItem('melaSession'));
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Removing the persisted token must not leave an authenticated workspace open.
    await expect(page.locator('#login')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#app')).toBeHidden();
  });
});
