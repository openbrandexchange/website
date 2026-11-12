// The online compatibility check page: the form, accessibility, and the result rendering with a
// mocked /api/check (fixtures/check/ are real outputs of the conformance container) and a stub
// for Cloudflare Turnstile, so no test touches the network.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

const fixture = (name: string) => readFileSync(new URL(`./fixtures/check/${name}`, import.meta.url), 'utf8');
const SHARE_ID = 'k3stR3l-sample-id';
const API = (url: URL) => url.pathname === '/api/check';

/** The pass-with-key stream, with the share id the API adds to the final line. */
function passStream() {
  return fixture('pass-with-key.ndjson')
    .trim()
    .split('\n')
    .map((line) => {
      const msg = JSON.parse(line);
      if (msg.type === 'report') msg.id = SHARE_ID;
      return JSON.stringify(msg);
    })
    .join('\n') + '\n';
}

/** A fake Turnstile: renders a placeholder and always hands out a token. */
async function stubTurnstile(page: Page) {
  await page.route('https://challenges.cloudflare.com/**', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `window.turnstile = {
        render: function (el) { var p = document.createElement('p'); p.textContent = 'Turnstile stub'; el.appendChild(p); return 'w1'; },
        getResponse: function () { return 'test-token'; },
        reset: function () {}
      };`,
    }),
  );
}

async function watchCsp(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { cspViolations: string[] }).cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { cspViolations: string[] }).cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
}
const cspViolations = (page: Page) => page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations);

const axe = (page: Page) =>
  new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
const violations = (r: Awaited<ReturnType<typeof axe>>) => r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);

for (const scheme of ['light', 'dark'] as const) {
  test(`the check page renders the form and has no axe violations (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await stubTurnstile(page);
    await page.goto('/en/check/');
    await expect(page.getByRole('heading', { level: 1, name: 'Online compatibility check' })).toBeVisible();
    await expect(page.getByLabel('Portal address')).toBeVisible();
    await expect(page.getByLabel('Client id')).toBeVisible();
    await expect(page.getByLabel('Client secret')).toBeVisible();
    await expect(page.getByText('Use a test key and revoke it afterwards.')).toBeVisible();
    await expect(page.getByText('Turnstile stub')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start the check' })).toBeEnabled();
    expect(violations(await axe(page))).toEqual([]);
  });
}

test('a check streams its results in and shows an honest pass with a share link', async ({ page }) => {
  await watchCsp(page);
  await stubTurnstile(page);
  let sent: Record<string, string> | null = null;
  await page.route(API, (route) => {
    sent = route.request().postDataJSON();
    return route.fulfill({ status: 200, contentType: 'application/x-ndjson', body: passStream() });
  });
  await page.goto('/en/check/');
  await page.getByLabel('Portal address').fill('https://portal.example');
  await page.getByLabel('Client id').fill('test-client');
  await page.getByLabel('Client secret').fill('test-secret');
  await page.getByRole('button', { name: 'Start the check' }).click();

  const summary = page.locator('[data-check-summary]');
  await expect(summary.getByRole('heading', { name: 'Passes the online compatibility check' })).toBeVisible();
  expect(sent).toEqual({ url: 'https://portal.example', turnstile: 'test-token', client_id: 'test-client', client_secret: 'test-secret' });

  await expect(page.locator('.check-row')).toHaveCount(26);
  await expect(page.locator('[data-list="ran"] .check-row')).toHaveCount(18);
  await expect(page.locator('[data-list="local"] .check-row')).toHaveCount(6);
  const disc = page.locator('.check-row', { has: page.locator('code', { hasText: /^P-DISC-1$/ }) });
  await expect(disc).toContainText('Passed');
  await expect(disc).toContainText('/.well-known/obx');
  await expect(disc.getByRole('link', { name: /In the specification/ })).toHaveAttribute(
    'href',
    'https://github.com/openbrandexchange/spec/blob/main/docs/conformance.md#:~:text=P-DISC-1',
  );
  const partial = page.locator('.check-row', { has: page.locator('code', { hasText: /^P-AUTH-2$/ }) });
  await expect(partial).toContainText('only part of this check can run online');
  await expect(page.locator('[data-check-status]')).toHaveText('26 of 26 checks done');

  await expect(summary).toContainText('Only checked locally, with obx-conformance');
  await expect(summary.getByRole('link', { name: 'P-HOOK-1' })).toBeVisible();
  await expect(summary.getByRole('link', { name: 'How to get it confirmed' })).toHaveAttribute('href', '/en/partners/#test');
  await expect(page.locator('body')).not.toContainText('Compatible with Open Brand Exchange');

  await expect(page.getByLabel('Link to this result')).toHaveValue(new RegExp(`/en/check/\\?r=${SHARE_ID}$`));
  await expect(page.getByText('The link is valid for 30 days.')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/en/check/\\?r=${SHARE_ID}$`));
  await expect(summary).toBeFocused();
  expect(await cspViolations(page)).toEqual([]);
  expect(violations(await axe(page))).toEqual([]);
});

test('a shared link shows the stored report, here a key that does not work', async ({ page }) => {
  await stubTurnstile(page);
  await page.route(API, (route) =>
    route.fulfill({
      json: { id: 'abc', created_at: '2026-11-12T17:00:00Z', expires_at: '2026-12-12T17:00:00Z', report: JSON.parse(fixture('wrong-key.json')) },
    }),
  );
  await page.goto('/nl/check/?r=abc');
  const summary = page.locator('[data-check-summary]');
  await expect(summary.getByRole('heading', { name: '15 van 15 checks mislukt' })).toBeVisible();
  await expect(summary).toContainText('De test-API-sleutel werkt niet');
  await expect(summary).toContainText('invalid_client');
  await expect(summary).not.toContainText('Slaagt voor de online compatibiliteitscheck');
  await expect(page.locator('.check-row.is-fail')).toHaveCount(15);
  await expect(page.getByLabel('Link naar dit resultaat')).toHaveValue(/\/nl\/check\/\?r=abc$/);
});

test('an address without OBX says so in plain language', async ({ page }) => {
  await stubTurnstile(page);
  const report = { ...JSON.parse(fixture('unreachable.json')), base_url: 'https://shop.example' };
  await page.route(API, (route) => route.fulfill({ json: { id: 'x1', report } }));
  await page.goto('/en/check/?r=x1');
  await expect(page.locator('[data-check-summary]')).toContainText(
    'No OBX discovery document found at https://shop.example/.well-known/obx. This address does not look like an OBX portal.',
  );
});

test('API errors and form mistakes are shown next to the form', async ({ page }) => {
  await stubTurnstile(page);
  await page.route(API, (route) =>
    route.fulfill({ status: 429, json: { error: { code: 'cooldown', message: 'checked recently', retry_after: 290 } } }),
  );
  await page.goto('/en/check/');
  await page.getByRole('button', { name: 'Start the check' }).click();
  const url = page.getByLabel('Portal address');
  await expect(url).toHaveAttribute('aria-invalid', 'true');
  await expect(url).toBeFocused();
  await expect(page.locator('#check-url-error')).toHaveText('Enter the address of the portal, starting with https://');

  await url.fill('https://portal.example');
  await page.getByLabel('Client id').fill('only-the-id');
  await page.getByRole('button', { name: 'Start the check' }).click();
  await expect(page.locator('#check-key-error')).toContainText('Enter both the client id and the client secret');

  await page.getByLabel('Client id').fill('');
  await page.getByRole('button', { name: 'Start the check' }).click();
  const alert = page.locator('[data-check-error]');
  await expect(alert).toContainText('This portal was checked in the last 10 minutes.');
  await expect(alert).toContainText('Try again in about 5 min.');
  await expect(page.locator('[data-check-results]')).toBeHidden();
});
