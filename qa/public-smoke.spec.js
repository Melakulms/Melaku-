import { test, expect } from '@playwright/test';

const BASE = process.env.MELA_QA_BASE_URL || 'http://127.0.0.1:4173';
const LANGS = [
  ['en', 'en-ET'],
  ['am', 'am-ET'],
  ['om', 'om-ET'],
  ['ti', 'ti-ET'],
  ['so', 'so-ET'],
  ['aa', 'aa-ET']
];

test('Mela pre-launch public shell stays connected, localized, and accessible', async ({ page }) => {
  // Do NOT intercept health checks - let the backend respond naturally
  // This allows the page to load live stats without blocking
  
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle(/Mela v\d+ Integrated Pre-Launch Preview/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-ET');
  await expect(page.locator('.skip')).toHaveAttribute('href', '#c');
  await expect(page.locator('#liveMasteryChip')).toHaveCount(1);
  await expect(page.locator('#liveMasteryProgress')).toHaveCount(1);

  // Wait for live stats to load from backend
  await expect(page.locator('#liveQuestions')).not.toHaveText('…', { timeout: 20000 });
  
  // Verify live stats loaded correctly
  await expect(page.locator('#liveQChip')).toContainText('active questions');
  await expect(page.locator('#liveMasteryChip')).toContainText('mastery-ready');
  await expect(page.locator('#liveMasteryProgress')).toContainText('mastery-ready');

  // Test language selection after page fully loads
  const langSelect = page.locator('#lang');
  await langSelect.selectOption('am');
  await expect(page.locator('html')).toHaveAttribute('lang', 'am-ET');
  await expect(page.locator('#hh')).toContainText('ክፍል');
  const localizedHero = await page.locator('#hp').textContent();

  // Verify live stats are still accessible after language change
  const numeric = async selector => Number((await page.locator(selector).innerText()).replace(/[^0-9]/g, ''));
  expect(await numeric('#liveQuestions')).toBeGreaterThan(100000);
  expect(await numeric('#liveWorkDomains')).toBeGreaterThanOrEqual(1000);
  expect(await numeric('#liveEduDomains')).toBeGreaterThanOrEqual(1000);

  // Localization should persist
  await expect(page.locator('#hp')).toHaveText(localizedHero || '');
  await expect(page.locator('#hh')).toContainText('ክፍል');

  // All language options should be available and functional
  for (const [code, tag] of LANGS) {
    await langSelect.selectOption(code);
    await expect(page.locator('html')).toHaveAttribute('lang', tag);
    await expect(page.locator('#hh')).not.toHaveText('');
  }

  // Sign-in UI should be accessible after language cycling
  await langSelect.selectOption('en');
  await page.locator('#open').click();
  await expect(page.locator('#login')).toBeVisible();
  await expect(page.locator('#signin')).toBeVisible();
  await expect(page.locator('#forgot')).toBeVisible();
  await expect(page.locator('#new')).toBeVisible();
});

test('Mela public shell stays usable when backend health is slow', async ({ page }) => {
  // Simulate slow backend (3 second delay)
  await page.route('**/functions/v1/mela-web/api/health', async route => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    await route.continue();
  });

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Mela v\d+ Integrated Pre-Launch Preview/);
  
  // UI should remain accessible even if backend is slow
  const langSelect = page.locator('#lang');
  
  // Language selection should work despite backend latency
  await langSelect.selectOption('so');
  await expect(page.locator('html')).toHaveAttribute('lang', 'so-ET');
  
  // Sign-in panel should open
  await page.locator('#open').click();
  await expect(page.locator('#login')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('#signin')).toBeVisible();
});

test('Mela public shell fails gracefully when backend health is temporarily offline', async ({ page }) => {
  // Simulate backend unavailability
  await page.route('**/functions/v1/mela-web/api/health', route => route.abort('failed'));
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Mela v\d+ Integrated Pre-Launch Preview/);
  
  // UI should still be interactive even if backend is unreachable
  const langSelect = page.locator('#lang');
  
  await langSelect.selectOption('om');
  await expect(page.locator('html')).toHaveAttribute('lang', 'om-ET');
  
  // Sign-in should still be accessible
  await page.locator('#open').click();
  await expect(page.locator('#login')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('#forgot')).toBeVisible();
});
