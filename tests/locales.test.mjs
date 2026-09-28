// Every locale must have exactly the shape of the English source, keep its placeholders,
// actually be translated, and follow the glossary (no protocol terms in brand/retailer copy).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { langs } from '../src/lib/i18n-core.ts';

const load = (lang) => JSON.parse(readFileSync(new URL(`../src/locales/${lang}.json`, import.meta.url), 'utf8'));
const en = load('en');

/** Flatten to [path, value] pairs; arrays keep their index in the path. */
function flatten(value, path = '') {
  if (Array.isArray(value)) return value.flatMap((v, i) => flatten(v, `${path}[${i}]`));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => flatten(v, path ? `${path}.${k}` : k));
  return [[path, value]];
}
const placeholders = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const brackets = (s) => (String(s).match(/\[[^\]]+\]/g) ?? []).length;
const enFlat = flatten(en);

for (const lang of langs) {
  test(`${lang}: same keys and array lengths as en.json`, () => {
    const flat = flatten(load(lang));
    assert.deepEqual(flat.map(([p]) => p), enFlat.map(([p]) => p));
  });

  test(`${lang}: no empty strings, same placeholders`, () => {
    const map = new Map(flatten(load(lang)));
    for (const [path, source] of enFlat) {
      const value = map.get(path);
      assert.equal(typeof value, typeof source, `${lang} ${path}: type`);
      if (typeof value !== 'string') continue;
      assert.ok(value.trim() !== '', `${lang} ${path}: empty`);
      assert.deepEqual(placeholders(value), placeholders(source), `${lang} ${path}: placeholders`);
    }
  });
}

test('the switch-kit email keeps its fill-in brackets in every language', () => {
  const expected = brackets(en.switchKit.body);
  for (const lang of langs) assert.equal(brackets(load(lang).switchKit.body), expected, lang);
});

test('every locale other than English is actually translated', () => {
  for (const lang of langs.filter((l) => l !== 'en')) {
    const map = new Map(flatten(load(lang)));
    const same = enFlat.filter(([p, v]) => typeof v === 'string' && v.length > 20 && map.get(p) === v);
    const long = enFlat.filter(([, v]) => typeof v === 'string' && v.length > 20);
    assert.ok(same.length / long.length < 0.1, `${lang}: ${same.length} of ${long.length} longer strings are still English, e.g. ${same.slice(0, 3).map(([p]) => p).join(', ')}`);
  }
});

test('the portal is named with the glossary word in the primary markets', () => {
  assert.equal(load('nl').portalWord, 'Beeldbank');
  assert.equal(load('de').portalWord, 'Händlerportal');
  assert.equal(load('fr').portalWord, 'Espace revendeurs');
  assert.equal(load('en').portalWord, 'Brand portal');
});

test('brand- and retailer-facing copy avoids protocol terms', () => {
  // The developers page and the API labels may name the APIs; everything else speaks plain language.
  const technical = /^(developers\.|automation\.(api|apiSpec|apiSdk|apiMore)|meta\.developers\.)/;
  const banned = /(?<![\w-])(node|nodes|ingest|tombstones?|cursor|grants?|GTIN|client credentials)(?![\w-])/i;
  for (const lang of langs) {
    for (const [path, value] of flatten(load(lang))) {
      if (typeof value !== 'string' || technical.test(path)) continue;
      assert.doesNotMatch(value, banned, `${lang} ${path}: "${value.match(banned)?.[0]}"`);
    }
  }
});
