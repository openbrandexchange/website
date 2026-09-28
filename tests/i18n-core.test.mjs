import { test } from 'node:test';
import assert from 'node:assert/strict';
import { format, langs, localized, matchLang, parseAcceptLanguage, pickLang } from '../src/lib/i18n-core.ts';

test('there are exactly the 25 site languages', () => {
  assert.equal(langs.length, 25);
  assert.equal(new Set(langs).size, 25);
});

test('a remembered choice wins over the browser languages', () => {
  assert.equal(pickLang('fr', ['de-DE', 'en']), 'fr');
});

test('an unknown remembered value is ignored', () => {
  assert.equal(pickLang('xx', ['de-AT']), 'de');
});

test('the first supported browser language is used, by primary subtag', () => {
  assert.equal(pickLang(null, ['ja-JP', 'pt-BR', 'en']), 'pt');
  assert.equal(pickLang(null, ['en-US']), 'en');
});

test('Norwegian variants map to bokmål', () => {
  assert.equal(matchLang('no'), 'nb');
  assert.equal(matchLang('nn-NO'), 'nb');
  assert.equal(matchLang('nb'), 'nb');
});

test('Dutch is the fallback when nothing matches', () => {
  assert.equal(pickLang(undefined, ['ja', 'zh-CN']), 'nl');
  assert.equal(pickLang(undefined, []), 'nl');
});

test('Accept-Language is ordered by quality and drops q=0 and *', () => {
  assert.deepEqual(parseAcceptLanguage('en;q=0.5, de-CH, fr;q=0.8, *;q=0.1, it;q=0'), ['de-CH', 'fr', 'en']);
  assert.deepEqual(parseAcceptLanguage(''), []);
  assert.equal(pickLang(null, parseAcceptLanguage('ja, sv;q=0.9')), 'sv');
});

test('localized text falls back: language, then English, then the first value', () => {
  assert.equal(localized({ nl: 'Trui', en: 'Sweater' }, 'nl'), 'Trui');
  assert.equal(localized({ nl: 'Trui', en: 'Sweater' }, 'de'), 'Sweater');
  assert.equal(localized({ nl: 'Trui', fr: 'Pull' }, 'de'), 'Trui');
  assert.equal(localized({ nl: '', en: 'Sweater' }, 'nl'), 'Sweater');
  assert.equal(localized({ de: 'Pullover' }, 'de-AT'), 'Pullover');
  assert.equal(localized(null, 'en'), '');
});

test('format replaces known placeholders and keeps unknown ones', () => {
  assert.equal(format('Kestrel · {portal} {x}', { portal: 'Beeldbank' }), 'Kestrel · Beeldbank {x}');
});
