// Keyboard use and the main flows a visitor takes.
import { test, expect } from '@playwright/test';
import { langs } from '../src/lib/i18n-core.ts';

test('the skip link is the first tab stop and moves focus to the content', async ({ page }) => {
  await page.goto('/en/for-brands/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('every link and button can be reached with Tab and shows a visible focus ring', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard focus is a desktop concern');
  await page.goto('/en/');
  const seen = new Set<string>();
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      const ring = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
      return { key: el.outerHTML.slice(0, 80), ring: ring || style.boxShadow !== 'none' };
    });
    if (!info) break;
    expect(info.ring, `no focus indicator on ${info.key}`).toBe(true);
    seen.add(info.key);
  }
  expect(seen.size).toBeGreaterThan(10);
});

test('the language menu opens with the keyboard and switches to the same page in German', async ({ page, isMobile }) => {
  await page.goto('/en/for-retailers/');
  if (isMobile) await page.getByRole('button', { name: 'Menu' }).click();
  const summary = page.locator('.lang-switch summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  const deutsch = page.getByRole('link', { name: 'Deutsch' });
  await expect(deutsch).toBeVisible();
  await deutsch.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/de\/for-retailers\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.getByText('Kestrel · Händlerportal').first()).toBeVisible();
});

test('the chosen language is remembered for the home address', async ({ page }) => {
  await page.goto('/fr/');
  await page.evaluate(() => localStorage.setItem('obx-lang', 'fr'));
  await page.goto('/');
  await expect(page).toHaveURL(/\/fr\/$/);
});

test('the mobile menu toggles and reports its state', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the menu button only shows on small screens');
  await page.goto('/en/');
  const button = page.getByRole('button', { name: 'Menu' });
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Main menu' }).getByRole('link', { name: 'For brands' })).toBeVisible();
});

test('no page in any language scrolls sideways on a phone', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone only');
  test.setTimeout(180_000);
  const slugs = ['', 'for-brands/', 'automation/', 'hosting/', 'for-retailers/', 'developers/', 'directory/', 'downloads/', 'faq/', 'governance/', 'privacy/', 'cookies/', 'imprint/'];
  const wide: string[] = [];
  for (const lang of langs) {
    for (const slug of slugs) {
      await page.goto(`/${lang}/${slug}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 0) wide.push(`/${lang}/${slug} (+${overflow}px)`);
    }
  }
  expect(wide).toEqual([]);
});

test('brochures download as PDF in the reader language', async ({ page, request }) => {
  await page.goto('/el/downloads/');
  const link = page.locator('a[href="/downloads/brands-el.pdf"]').first();
  await expect(link).toBeVisible();
  const res = await request.get('/downloads/brands-el.pdf');
  expect(res.status()).toBe(200);
  expect((await res.body()).subarray(0, 5).toString()).toBe('%PDF-');
});

test('the imprint shows the initiator, the foundation in formation and both addresses', async ({ page }) => {
  await page.goto('/nl/imprint/');
  await expect(page.getByText('Een initiatief van Richard Lindhout · Open Brand Exchange Foundation (in oprichting)').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'hello@openbrandexchange.com' }).first()).toHaveAttribute('href', 'mailto:hello@openbrandexchange.com');
  await expect(page.getByRole('link', { name: 'security@openbrandexchange.com' })).toHaveAttribute('href', 'mailto:security@openbrandexchange.com');
});

test('the directory search filters the list and says when nothing matches', async ({ page }) => {
  await page.goto('/en/directory/');
  const search = page.getByRole('searchbox');
  await search.fill('kestrel');
  await expect(page.getByText('Kestrel Outfitters').first()).toBeVisible();
  await search.fill('no-such-brand-xyz');
  await expect(page.getByText('No brands match your search.')).toBeVisible();
});

test('pages run under the strict Content-Security-Policy without violations', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { cspViolations: string[] }).cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { cspViolations: string[] }).cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  for (const path of ['/en/', '/de/for-retailers/', '/el/directory/', '/bg/automation/', '/nl/downloads/']) {
    const response = await page.goto(path);
    expect(response?.headers()['content-security-policy'], 'served with the _headers CSP').toContain("default-src 'self'");
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations), path).toEqual([]);
  }
});

test('security headers are served on pages, and CORS only on the public directory', async ({ request }) => {
  const page = await request.get('/en/');
  const h = page.headers();
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['strict-transport-security']).toContain('max-age=31536000');
  expect(h['access-control-allow-origin']).toBeUndefined();
  const dir = await request.get('/directory.json');
  expect(dir.headers()['access-control-allow-origin']).toBe('*');
  expect((await dir.json()).entries.length).toBeGreaterThan(0);
});

test('the desktop header stays on one row in every language', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the full navigation only shows on wide screens');
  test.setTimeout(120_000);
  const wrapped: string[] = [];
  for (const width of [1280, 1920]) {
    await page.setViewportSize({ width, height: 800 });
    for (const lang of langs) {
      await page.goto(`/${lang}/`);
      await page.evaluate(() => document.fonts.ready);
      const height = await page.locator('.header-row').evaluate((el) => el.getBoundingClientRect().height);
      if (height > 72) wrapped.push(`/${lang}/ at ${width}px (${Math.round(height)}px high)`);
    }
  }
  expect(wrapped).toEqual([]);
});
