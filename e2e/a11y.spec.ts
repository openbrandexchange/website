// Accessibility: axe (WCAG 2.2 A/AA rules) on every page type, in a Latin, a Greek and a
// Cyrillic language, in light and dark colour schemes.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['', 'for-brands/', 'automation/', 'hosting/', 'for-retailers/', 'developers/', 'directory/', 'downloads/', 'faq/', 'governance/', 'privacy/', 'cookies/', 'imprint/'];
const langs = ['en', 'el', 'bg'];

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme });
    for (const lang of langs) {
      for (const page of pages) {
        test(`/${lang}/${page} has no axe violations`, async ({ page: p }) => {
          await p.goto(`/${lang}/${page}`);
          const results = await new AxeBuilder({ page: p })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
            .analyze();
          const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
          expect(summary).toEqual([]);
        });
      }
    }
  });
}

test('the language chooser at / has no axe violations', async ({ page }) => {
  // Keep the chooser on screen: without /js/lang.js it is what visitors without JavaScript see.
  await page.route('**/js/lang.js', (route) => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Ελληνικά' })).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
});
