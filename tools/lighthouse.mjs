#!/usr/bin/env node
// Lighthouse on a few representative pages of the built site, with budgets.
//   npm run build && npm run lighthouse          (CHROME_PATH may point at Chrome)
// Serves dist/ with tools/serve-dist.mjs (real _headers), runs the mobile preset, prints the
// scores and fails when a category drops below its budget.
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';

const budgets = { performance: 0.9, accessibility: 1, 'best-practices': 0.95, seo: 1 };
const pages = ['/en/', '/el/for-brands/', '/bg/hosting/', '/de/for-retailers/'];
const port = 4399;
const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome = process.env.CHROME_PATH || (existsSync(mac) ? mac : undefined);

const server = spawn(process.execPath, ['tools/serve-dist.mjs', 'dist', String(port)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));
mkdirSync('.cache/lighthouse', { recursive: true });
let failed = false;
try {
  // Warm-up run, not scored: the first Lighthouse run after the server and Chrome start reports a
  // ~2 s unattributable long task on whichever page comes first (measured 2026-11-12: /en/ scored
  // 73 when first and 99 when second, with identical assets).
  execFileSync('npx', ['--yes', 'lighthouse@12', `http://127.0.0.1:${port}${pages[0]}`, '--quiet', '--output=json', '--output-path=.cache/lighthouse/warmup.json', '--chrome-flags=--headless=new --no-sandbox'], {
    stdio: 'ignore',
    env: { ...process.env, ...(chrome ? { CHROME_PATH: chrome } : {}) },
  });
  for (const page of pages) {
    const out = `.cache/lighthouse/${page.replace(/\//g, '_') || 'root'}.json`;
    execFileSync('npx', ['--yes', 'lighthouse@12', `http://127.0.0.1:${port}${page}`, '--quiet', '--output=json', `--output-path=${out}`, '--chrome-flags=--headless=new --no-sandbox'], {
      stdio: 'inherit',
      env: { ...process.env, ...(chrome ? { CHROME_PATH: chrome } : {}) },
    });
    const report = JSON.parse(readFileSync(out, 'utf8'));
    const scores = Object.fromEntries(Object.entries(report.categories).map(([k, v]) => [k, v.score]));
    const lcp = Math.round(report.audits['largest-contentful-paint'].numericValue);
    const cls = report.audits['cumulative-layout-shift'].numericValue;
    console.log(page, Object.entries(scores).map(([k, v]) => `${k} ${Math.round(v * 100)}`).join(', '), `LCP ${lcp} ms, CLS ${cls}`);
    if (cls > 0.05) {
      console.error(`  layout shift ${cls} is above the budget 0.05`);
      failed = true;
    }
    for (const [k, min] of Object.entries(budgets)) {
      if (scores[k] < min) {
        console.error(`  ${k} ${scores[k]} is below the budget ${min}`);
        failed = true;
      }
    }
  }
} finally {
  server.kill();
}
process.exit(failed ? 1 : 0);
