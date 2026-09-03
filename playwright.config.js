import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: ['qa/**/*.spec.js', 'tests/e2e/**/*.spec.ts'],
  timeout: 30000,
  expect: { timeout: 15000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? [['line'], ['html', { outputFolder: 'playwright-report', open: 'never' }]] : 'line',
  use: {
    baseURL: process.env.MELA_QA_BASE_URL || 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'] } },
    { name: 'android-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'iphone-webkit', use: { ...devices['iPhone 15'] } }
  ]
});
