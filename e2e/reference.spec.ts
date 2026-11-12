// The developer pages that software links to: the API reference (the spec's rendered site at
// /reference/), the JSON Schemas at their $id and the problem types at /errors/<obx_error>.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const watchCsp = async (page: import('@playwright/test').Page) => {
  await page.addInitScript(() => {
    (window as unknown as { cspViolations: string[] }).cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { cspViolations: string[] }).cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
};
const violations = (page: import('@playwright/test').Page) => page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations);

test('the API reference runs under its own policy: the site-wide header is detached, the viewer starts', async ({ page }) => {
  await watchCsp(page);
  for (const path of ['/reference/', '/reference/protocol.html']) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    expect(response?.headers()['content-security-policy'], `${path}: no site-wide CSP header`).toBeUndefined();
    expect(response?.headers()['x-frame-options'], `${path}: still not frameable`).toBe('DENY');
    await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1);
  }
  await expect.poll(() => page.evaluate(() => typeof (window as unknown as { Redoc?: unknown }).Redoc)).toBe('object');
  // By design the page's policy blocks the viewer's Redocly logo from its CDN (the viewer then
  // hides it); anything else blocked is a failure.
  expect((await violations(page)).filter((v) => !v.includes('cdn.redoc.ly/redoc/logo-mini'))).toEqual([]);
});

test('a schema is served at the address of its $id, the current and the frozen version', async ({ request }) => {
  for (const path of ['/schemas/v0.2/Problem.json', '/schemas/v0.2/Measurements.json']) {
    const res = await request.get(path);
    expect(res.ok(), path).toBeTruthy();
    expect((await res.json()).$id).toBe(`https://openbrandexchange.com${path}`);
  }
});

test('a label completeness warning has its page too', async ({ page }) => {
  const response = await page.goto('/errors/fibre_composition_missing');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('fibre_composition_missing');
  await expect(page.locator('.lead')).toContainText('never blocks');
  await page.goto('/errors/');
  await expect(page.locator('tr#footwear_materials_missing')).toContainText('footwear_materials');
});

test('a problem type URL leads to its page: code, HTTP status and meaning', async ({ page }) => {
  await watchCsp(page);
  const response = await page.goto('/errors/validation_failed');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('validation_failed');
  await expect(page.locator('dd').first()).toHaveText('422');
  expect(await violations(page)).toEqual([]);
  await page.getByRole('link', { name: 'Error codes' }).first().click();
  await expect(page.locator('tr#cursor_expired')).toContainText('410');
});

for (const scheme of ['light', 'dark'] as const) {
  test(`the error pages have no axe violations (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    for (const path of ['/errors/', '/errors/rate_limited/', '/errors/animal_origin_unknown/']) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`), path).toEqual([]);
    }
  });
}
