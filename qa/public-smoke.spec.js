import { test, expect } from '@playwright/test';

const BASE = process.env.MELA_QA_BASE_URL || 'http://127.0.0.1:4173';
const LANGS = [
  ['en', 'en-ET'],
  ['am', 'am-ET'],
  ['om', 'om-ET'],
  ['ti', 'ti-ET'],
  ['so', 'so-ET']
];

test('Mela pre-launch public shell stays connected, localized, and accessible', async ({ page }) => {
  await page.route('**/functions/v1/mela-web/api/health', async route => {
    await new Promise(resolve => setTimeout(resolve, 500));
    await route.continue();
  });

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Mela v\d+ Integrated Pre-Launch Preview/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-ET');
  await expect(page.locator('.skip')).toHaveAttribute('href', '#c');
  await expect(page.locator('#liveMasteryChip')).toHaveCount(1);
  await expect(page.locator('#liveMasteryProgress')).toHaveCount(1);

  await page.locator('#lang').selectOption('am');
  await expect(page.locator('html')).toHaveAttribute('lang', 'am-ET');
  await expect(page.locator('#hh')).toContainText('ክፍል');
  const localizedHero = await page.locator('#hp').textContent();

  await expect(page.locator('#liveQuestions')).not.toHaveText('…', { timeout: 15000 });
  await expect(page.locator('#liveQChip')).toContainText('active questions');
  await expect(page.locator('#liveMasteryChip')).toContainText('mastery-ready');
  await expect(page.locator('#liveMasteryProgress')).toContainText('mastery-ready');
  await expect(page.locator('#liveReviewChip')).toContainText('review-required');
  await expect(page.locator('#liveProgramChip')).toContainText('programs below 500 mastery');

  const numeric = async selector => Number((await page.locator(selector).innerText()).replace(/[^0-9]/g, ''));
  expect(await numeric('#liveQuestions')).toBeGreaterThan(100000);
  expect(await numeric('#liveWorkDomains')).toBeGreaterThanOrEqual(1000);
  expect(await numeric('#liveEduDomains')).toBeGreaterThanOrEqual(1000);

  await expect(page.locator('#hp')).toHaveText(localizedHero || '');
  await expect(page.locator('#hh')).toContainText('ክፍል');

  for (const [code, tag] of LANGS) {
    await page.locator('#lang').selectOption(code);
    await expect(page.locator('html')).toHaveAttribute('lang', tag);
    await expect(page.locator('#hh')).not.toHaveText('');
  }

  await page.locator('#lang').selectOption('en');
  await page.locator('#open').click();
  await expect(page.locator('#login')).toBeVisible();
  await expect(page.locator('#signin')).toBeVisible();
  await expect(page.locator('#forgot')).toBeVisible();
  await expect(page.locator('#new')).toBeVisible();
});
