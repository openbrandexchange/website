#!/usr/bin/env node
// Product screenshots for the website, taken from the real admin-ui in its mock mode
// (the fictional brand Kestrel Outfitters, everything running in the browser).
//
//   node scripts/capture-screenshots.mjs                 # en, nl, de, fr
//   node scripts/capture-screenshots.mjs --lang nl       # one language
//   ADMIN_UI=../admin-ui node scripts/capture-screenshots.mjs
//
// Builds admin-ui in mock mode into a temporary folder (admin-ui itself is not changed), swaps
// the fixture swatches for product illustrations (scripts/screenshots/garments.mjs), serves it,
// logs in as the demo retailer and the demo brand admin and writes 2× WebP screenshots to
// src/assets/screens/<lang>/<name>.webp. Pages fall back to English for other languages.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { garmentSvg } from './screenshots/garments.mjs';

const root = resolve(import.meta.dirname, '..');
const adminUi = resolve(root, process.env.ADMIN_UI ?? '../admin-ui');
const args = process.argv.slice(2);
const langArg = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : null;
const langs = langArg ? [langArg] : ['en', 'nl', 'de', 'fr'];
const outRoot = join(root, 'src/assets/screens');
const VIEW = { width: 1280, height: 800 };

if (!existsSync(join(adminUi, 'package.json'))) {
  console.error(`admin-ui not found at ${adminUi} (set ADMIN_UI)`);
  process.exit(1);
}

// 1. Mock build into a temporary folder.
const tmp = mkdtempSync(join(tmpdir(), 'obx-screens-'));
const site = join(tmp, 'site');
console.log('building admin-ui (mock mode)…');
execFileSync('npx', ['vite', 'build', '--mode', 'mock', '--outDir', site, '--emptyOutDir', '--logLevel', 'warn'], { cwd: adminUi, stdio: 'inherit' });

const browser = await chromium.launch();

// 2. Product illustrations instead of the fixture swatches.
const fixtures = join(site, 'mock-fixtures/kestrel');
{
  const page = await browser.newPage({ viewport: { width: 1200, height: 1500 } });
  for (const file of readdirSync(fixtures).filter((f) => f.endsWith('.png'))) {
    await page.setContent(`<body style="margin:0">${garmentSvg(file)}</body>`);
    writeFileSync(join(fixtures, file), await page.locator('svg').screenshot({ type: 'png' }));
  }
  await page.close();
}

// 3. A static server with the single-page-app fallback, like `vite preview`.
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.csv': 'text/csv', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = join(site, path);
  if (!file.startsWith(site) || !existsSync(file) || path.endsWith('/')) file = join(site, 'index.html');
  res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Service-Worker-Allowed': '/' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const buyer = { email: 'buyer@shop.example', password: 'kestrel-shop-2026' };
const admin = { email: 'admin@kestrel.example', password: 'kestrel-admin-2026' };

async function session(lang, who) {
  const context = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 2, locale: lang, colorScheme: 'light', reducedMotion: 'reduce' });
  await context.addInitScript((l) => localStorage.setItem('obx.lang', l), lang);
  const page = await context.newPage();
  await page.goto(base + 'login?mock=reset');
  await page.locator('input[type=email]').fill(who.email);
  await page.locator('input[type=password]').first().fill(who.password);
  await page.locator('button[type=submit]').click();
  await page.waitForURL((u) => !u.pathname.includes('/login'));
  await settle(page);
  return { context, page };
}

async function settle(page) {
  await page.waitForLoadState('load');
  await page.waitForFunction(() => !document.querySelector('[role=status][aria-label="Loading…"]') && [...document.images].every((i) => i.complete));
  await page.waitForTimeout(400);
}

async function save(page, lang, name) {
  // The recipes print the portal's own address: show the fictional one, not this local server.
  await page.evaluate((local) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeValue.includes(local)) n.nodeValue = n.nodeValue.replaceAll(local, 'https://brands.kestrel.example');
    }
  }, base.replace(/\/$/, ''));
  const dir = join(outRoot, lang);
  mkdirSync(dir, { recursive: true });
  const png = await page.screenshot({ type: 'png' });
  await sharp(png).webp({ quality: 88, effort: 6 }).toFile(join(dir, `${name}.webp`));
  console.log(`  ${lang}/${name}.webp`);
}

for (const lang of langs) {
  console.log(`[${lang}]`);
  // Retailer portal.
  {
    const { context, page } = await session(lang, buyer);
    await page.goto(base);
    await settle(page);
    await save(page, lang, 'portal-catalog');

    await page.goto(base + 'ean');
    await settle(page);
    await page.locator('textarea').fill(['2000100101018', '2000100101025', '2000100201015', '2000100301012', '2000100401019', '2000999901010'].join('\n'));
    await page.locator('main button[type=submit], main form button').last().click();
    await page.waitForTimeout(1200);
    await settle(page);
    // A taller window, so the pasted codes, the result and the found articles are all in view.
    await page.setViewportSize({ width: VIEW.width, height: 960 });
    await settle(page);
    await save(page, lang, 'portal-ean');
    await page.setViewportSize(VIEW);

    await page.goto(base);
    await settle(page);
    await page.locator('main a[href*="products/"]').nth(1).click();
    await settle(page);
    await save(page, lang, 'portal-article');
    await context.close();
  }
  // Brand admin.
  {
    const { context, page } = await session(lang, admin);
    for (const [path, name] of [
      ['admin', 'admin-overview'],
      ['admin/catalog', 'admin-catalog'],
      ['admin/stats', 'admin-stats'],
      ['admin/automation?tab=recipes', 'admin-automation'],
    ]) {
      await page.goto(base + path);
      await settle(page);
      await save(page, lang, name);
    }
    await context.close();
  }
}

await browser.close();
server.close();
rmSync(tmp, { recursive: true, force: true });
console.log('done');
