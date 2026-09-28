import { defineConfig, devices } from '@playwright/test';

// End-to-end checks against the built site (npm run build first; CI does).
// Served by tools/serve-dist.mjs, which applies _headers and _redirects like Cloudflare Pages.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'node tools/serve-dist.mjs dist 4321',
    url: 'http://127.0.0.1:4321/en/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
