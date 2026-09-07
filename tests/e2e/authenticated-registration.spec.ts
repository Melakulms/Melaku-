import { test, expect } from '@playwright/test';

const BASE = process.env.MELA_QA_BASE_URL || 'http://127.0.0.1:4173';
const SUPABASE_URL = process.env.MELA_SUPABASE_URL || 'https://duizgtmbptmlbyipreqg.supabase.co';
const SUPABASE_ANON_KEY = process.env.MELA_SUPABASE_ANON_KEY || '';
const E2E_EMAIL = process.env.MELA_E2E_EMAIL || '';
const E2E_PASSWORD = process.env.MELA_E2E_PASSWORD || '';
const E2E_SERVICE_ROLE_KEY = process.env.MELA_E2E_SERVICE_ROLE_KEY || '';

function requireRegistrationSecrets() {
  test.skip(
    !E2E_EMAIL || !E2E_PASSWORD || !SUPABASE_ANON_KEY,
    'Authenticated registration E2E requires MELA_E2E_EMAIL, MELA_E2E_PASSWORD, and MELA_SUPABASE_ANON_KEY. Use a disposable test project/account with email confirmation disabled or a deterministic confirmation mechanism; never use a production user account.'
  );
}

test.describe('authenticated registration', () => {
  test('registers a real user, establishes an authenticated session, creates the profile, and completes onboarding', async ({ page }) => {
    requireRegistrationSecrets();

    const email = E2E_EMAIL.trim();
    const password = E2E_PASSWORD;
    const fullName = `MELA E2E ${Date.now()}`;
    let userId = '';

    try {
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });
      await page.locator('#open').click();
      await expect(page.locator('#login')).toBeVisible();

      await page.locator('#new').click();
      await expect(page.locator('#signup')).toBeVisible();
      await page.locator('#nm').fill(fullName);
      await page.locator('#se').fill(email);
      await page.locator('#sp').fill(password);
      await page.locator('#sl').selectOption('English');
      await page.locator('#create').click();

      // This test intentionally requires an authenticated session. If email confirmation is
      // enabled, run it against the disposable E2E environment with a deterministic test
      // confirmation mechanism instead of weakening the production authentication flow.
      await expect
        .poll(async () => {
          return await page.evaluate(() => {
            try {
              const raw = localStorage.getItem('melaSession');
              if (!raw) return false;
              const session = JSON.parse(raw);
              return Boolean(session?.access_token && session?.user?.id);
            } catch {
              return false;
            }
          });
        }, { timeout: 15000 })
        .toBe(true);

      const session = await page.evaluate(() => JSON.parse(localStorage.getItem('melaSession') || 'null'));
      expect(session?.access_token).toBeTruthy();
      expect(session?.user?.email).toBe(email);
      userId = session.user.id;

      const authHeaders = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      };

      const userResponse = await page.request.get(`${SUPABASE_URL}/auth/v1/user`, { headers: authHeaders });
      expect(userResponse.ok()).toBeTruthy();
      const user = await userResponse.json();
      expect(user.id).toBe(userId);
      expect(user.email).toBe(email);

      const profileResponse = await page.request.get(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,full_name,preferred_language,role,account_status,profile_completion,onboarding_step,role_selected_at,email_verified,phone_verified&limit=1`,
        { headers: { ...authHeaders, Accept: 'application/json' } }
      );
      expect(profileResponse.ok()).toBeTruthy();
      const profiles = await profileResponse.json();
      expect(profiles).toHaveLength(1);

      const profile = profiles[0];
      expect(profile.id).toBe(userId);
      expect(profile.full_name).toBe(fullName);
      expect(profile.role).toBe('student');
      expect(profile.account_status).toBeTruthy();
      expect(profile.role_selected_at).toBeTruthy();

      // The application must recognize the authenticated account rather than merely storing a token.
      await expect(page.locator('#app')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#out')).toBeVisible();
      await expect(page.locator('#wel')).toContainText(fullName);
      await expect(page.locator('[data-tab="account"]')).toBeVisible();
    } finally {
      // Cleanup is optional so the test can run without exposing a service-role key.
      // When supplied, it deletes only the disposable E2E user that this test created.
      if (userId && E2E_SERVICE_ROLE_KEY) {
        const cleanup = await page.request.delete(`${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${E2E_SERVICE_ROLE_KEY}`
          }
        });
        expect(cleanup.ok()).toBeTruthy();
      }
    }
  });
});
