import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './qa',
  timeout: 30000,
  expect: { timeout: 15000 },
  fullyParallel: true,
  retries: 1,
  reporter: 'line',
  use: {
    baseURL: process.env.MELA_QA_BASE_URL || 'http://127.0.0.1:4173',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'] } },
    { name: 'android-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'iphone-webkit', use: { ...devices['iPhone 15'] } }
  ]
});
