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

// src/data/glossary.json is a copy of admin-ui/src/i18n/glossary.json (npm run sync:glossary).
const glossary = JSON.parse(readFileSync(new URL('../src/data/glossary.json', import.meta.url), 'utf8')).terms;
const lower = (s) => s.toLocaleLowerCase();
// src/data/glossary-publisher.json comes from spec/docs/glossary.md ("The project and its publisher").
const publisher = JSON.parse(readFileSync(new URL('../src/data/glossary-publisher.json', import.meta.url), 'utf8')).languages;

test('the publisher line uses the glossary wording in every language', () => {
  assert.deepEqual(Object.keys(publisher).sort(), [...langs].sort());
  for (const lang of langs) {
    const { org } = load(lang);
    assert.equal(org.inFormation, publisher[lang].inFormation, `${lang} org.inFormation`);
  }
});

// The founder's name appears only where the law asks for a responsible person until the
// foundation is registered: the imprint and the privacy statement.
test('no text names a person outside the imprint and the privacy statement', () => {
  const allowed = new Set(['imprint.foundationP', 'privacy.sections.0.p']);
  for (const lang of langs) {
    const found = [];
    const walk = (o, path) => {
      if (typeof o === 'string') {
        if (o.includes('{person}') && !allowed.has(path)) found.push(path);
      } else if (o && typeof o === 'object') {
        for (const [k, v] of Object.entries(o)) walk(v, path ? `${path}.${k}` : k);
      }
    };
    walk(load(lang), '');
    assert.deepEqual(found, [], `${lang}: {person} used in ${found.join(', ')}`);
  }
});

test('the glossary covers exactly the site languages', () => {
  assert.deepEqual(Object.keys(glossary.portal).sort(), [...langs].sort());
});

for (const lang of langs) {
  test(`${lang}: portal, API key and automatic upload use the glossary words`, () => {
    const t = load(lang);
    assert.equal(t.portalWord, glossary.portal[lang]);
    assert.ok(lower(t.retailers.apiTitle).endsWith(lower(glossary.apiKey[lang])), `retailers.apiTitle "${t.retailers.apiTitle}" should end with "${glossary.apiKey[lang]}"`);
    assert.ok(lower(t.brochure.retailersReady[3]).includes(lower(glossary.apiKey[lang])), 'brochure.retailersReady[3]');
    assert.equal(t.brands.blocks[2].h, glossary.automaticUpload[lang]);
  });
}

test('brand- and retailer-facing copy avoids protocol terms', () => {
  // The developers page and the API labels may name the APIs; everything else speaks plain language.
  const technical = /^(developers\.|site\.home\.(dev|prompt)|automation\.(api|apiSpec|apiSdk|apiMore)|meta\.developers\.)/;
  const banned = /(?<![\w-])(node|nodes|ingest|tombstones?|cursor|grants?|GTIN|client credentials)(?![\w-])/i;
  for (const lang of langs) {
    for (const [path, value] of flatten(load(lang))) {
      if (typeof value !== 'string' || technical.test(path)) continue;
      assert.doesNotMatch(value, banned, `${lang} ${path}: "${value.match(banned)?.[0]}"`);
    }
  }
});
