// functions/_middleware.js: www to apex, and page addresses without a language to the visitor's language.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest, langFor, PAGE_SLUGS } from '../functions/_middleware.js';
import { readFileSync } from 'node:fs';
import { langs } from '../src/lib/i18n-core.ts';

// The slugs from src/i18n.ts, read as text (it imports JSON through Vite).
const source = readFileSync(new URL('../src/i18n.ts', import.meta.url), 'utf8');
const block = source.slice(source.indexOf('export const slugs'), source.indexOf('};', source.indexOf('export const slugs')));
const slugs = [...block.matchAll(/^\s+\w+: '([^']*)',$/gm)].map((m) => m[1]);

const run = (path, headers = {}, host = 'openbrandexchange.com') =>
  onRequest({ request: new Request(`https://${host}${path}`, { headers }), next: async () => new Response('page') });

test('the middleware knows every page slug of the site', () => {
  assert.deepEqual([...PAGE_SLUGS].sort(), slugs.filter(Boolean).sort());
  for (const lang of langs) assert.equal(langFor(lang), lang);
});

test('a page without a language goes to the visitor language, Dutch when none matches', async () => {
  for (const [path, accept, to] of [
    ['/partners', 'de-DE,de;q=0.9,en;q=0.8', '/de/partners/'],
    ['/partners/', 'en-US', '/en/partners/'],
    ['/hosting', 'ja, zh;q=0.5', '/nl/hosting/'],
    ['/faq?x=1', 'nn-NO', '/nb/faq/?x=1'],
  ]) {
    const res = await run(path, { 'Accept-Language': accept });
    assert.equal(res.status, 302, path);
    assert.equal(res.headers.get('Location'), `https://openbrandexchange.com${to}`, path);
    assert.equal(res.headers.get('Vary'), 'Accept-Language');
  }
  assert.equal(langFor(undefined), 'nl');
});

test('other addresses pass through, www goes to the apex', async () => {
  for (const path of ['/', '/en/partners/', '/llms.txt', '/downloads/products.xlsx', '/partnersx']) {
    assert.equal(await (await run(path)).text(), 'page', path);
  }
  const www = await run('/en/', {}, 'www.openbrandexchange.com');
  assert.equal(www.status, 301);
  assert.equal(www.headers.get('Location'), 'https://openbrandexchange.com/en/');
});

test('schemas of an earlier version redirect to the current version', async () => {
  const { CURRENT_SCHEMA_VERSION } = await import('../functions/schema-version.js');
  for (const [path, to] of [['/schemas/v0.1/Problem.json', `/schemas/${CURRENT_SCHEMA_VERSION}/Problem.json`], ['/reference/schemas/v0.1/Common.json', `/reference/schemas/${CURRENT_SCHEMA_VERSION}/Common.json`]]) {
    const res = await run(path);
    assert.equal(res.status, 301, path);
    assert.equal(res.headers.get('Location'), `https://openbrandexchange.com${to}`);
  }
  assert.equal(await (await run(`/schemas/${CURRENT_SCHEMA_VERSION}/Problem.json`)).text(), 'page');
});
