// Checks the built site in dist/ (run `npm run build` first; `npm run check` does both).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
import { langs } from '../src/lib/i18n-core.ts';
import { checkSite } from '../tools/check-links.mjs';

const dist = new URL('../dist/', import.meta.url);
const read = (path) => readFileSync(new URL(path, dist), 'utf8');
const slugs = ['', 'for-brands/', 'automation/', 'hosting/', 'for-retailers/', 'developers/', 'directory/', 'downloads/', 'faq/', 'governance/', 'privacy/', 'cookies/', 'imprint/'];
const built = existsSync(new URL('index.html', dist));

test('every page exists in every language, with the right lang, canonical and hreflang set', { skip: !built && 'dist/ not built' }, () => {
  for (const lang of langs) {
    for (const slug of slugs) {
      const html = read(`${lang}/${slug}index.html`);
      assert.match(html, new RegExp(`<html lang="${lang}"`), `${lang}/${slug}`);
      assert.ok(html.includes(`<link rel="canonical" href="https://openbrandexchange.com/${lang}/${slug}"`), `${lang}/${slug} canonical`);
      const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
      assert.equal(alternates.length, 26, `${lang}/${slug} hreflang count`);
      const xDefault = alternates.find(([, h]) => h === 'x-default');
      assert.equal(xDefault[2], `https://openbrandexchange.com/en/${slug}`);
    }
  }
});

test('no inline scripts or styles, so the strict Content-Security-Policy holds', { skip: !built && 'dist/ not built' }, () => {
  for (const lang of langs) {
    for (const slug of slugs) {
      const html = read(`${lang}/${slug}index.html`);
      for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
        assert.match(attrs, /\ssrc="/, `${lang}/${slug}: inline script`);
        assert.equal(body.trim(), '');
      }
      assert.doesNotMatch(html, /<style[\s>]/, `${lang}/${slug}: inline style element`);
      assert.doesNotMatch(html, /\sstyle="/, `${lang}/${slug}: style attribute`);
    }
  }
});

test('all internal links and anchors resolve', { skip: !built && 'dist/ not built' }, () => {
  const { problems } = checkSite(new URL('.', dist).pathname);
  assert.deepEqual(problems, []);
});

test('the sitemap lists every page in every language', { skip: !built && 'dist/ not built' }, () => {
  const xml = read('sitemap.xml');
  assert.equal([...xml.matchAll(/<loc>/g)].length, langs.length * slugs.length);
});

test('the directory page renders the demo entry, clearly marked', { skip: !built && 'dist/ not built' }, () => {
  const html = read('en/directory/index.html');
  assert.match(html, /Kestrel Outfitters/);
  assert.match(html, /class="badge demo">Demo entry</);
  assert.doesNotMatch(html, /href="https:\/\/brands\.kestrel\.example/, 'demo entry must not link to its fake portal');
});

test('the portal word follows the language', { skip: !built && 'dist/ not built' }, () => {
  assert.match(read('nl/for-retailers/index.html'), /Kestrel · Beeldbank/);
  assert.match(read('de/for-retailers/index.html'), /Kestrel · Händlerportal/);
});

test('switch-kit emails exist per language and link to that language', { skip: !built && 'dist/ not built' }, () => {
  for (const lang of langs) {
    const text = read(`downloads/switch-kit-${lang}.txt`);
    assert.ok(text.includes(`https://openbrandexchange.com/${lang}/for-brands/`), lang);
    assert.match(text, /\[/);
  }
});

/** Run the built /js/lang.js with a fake browser and return where it sends the visitor. */
function landing({ stored = null, languages = [], hash = '', storageThrows = false }) {
  let target = null;
  const context = {
    localStorage: {
      getItem: () => {
        if (storageThrows) throw new Error('blocked');
        return stored;
      },
    },
    navigator: { languages, language: languages[0] },
    location: { hash, replace: (to) => (target = to) },
  };
  vm.runInNewContext(read('js/lang.js'), context);
  return target;
}

test('the home address sends visitors to their language', { skip: !built && 'dist/ not built' }, () => {
  assert.equal(landing({ languages: ['de-AT', 'en'] }), '/de/');
  assert.equal(landing({ stored: 'fr', languages: ['de-AT'] }), '/fr/');
  assert.equal(landing({ stored: 'xx', languages: ['nn-NO'] }), '/nb/');
  assert.equal(landing({ languages: ['ja-JP'] }), '/nl/');
  assert.equal(landing({ languages: ['sv'], storageThrows: true, hash: '#x' }), '/sv/#x');
});

test('every page has a social preview image in its own language', { skip: !built && 'dist/ not built' }, () => {
  for (const lang of langs) {
    for (const slug of slugs) {
      const html = read(`${lang}/${slug}index.html`);
      const image = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
      assert.equal(image, `https://openbrandexchange.com/og/${lang}.jpg`, `${lang}/${slug}`);
      assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
    }
    assert.ok(existsSync(new URL(`og/${lang}.jpg`, dist)), `og/${lang}.jpg`);
  }
});

test('the downloads page offers both brochures in every language, and the files exist', { skip: !built && 'dist/ not built' }, () => {
  for (const lang of langs) {
    const html = read(`${lang}/downloads/index.html`);
    for (const kind of ['brands', 'retailers']) {
      for (const l of langs) {
        assert.ok(html.includes(`href="/downloads/${kind}-${l}.pdf"`), `${lang}: link to ${kind}-${l}.pdf`);
        assert.ok(existsSync(new URL(`downloads/${kind}-${l}.pdf`, dist)), `${kind}-${l}.pdf`);
      }
    }
  }
});

test('the imprint names the initiator and the foundation in formation, with the contact addresses', { skip: !built && 'dist/ not built' }, () => {
  const en = read('en/imprint/index.html');
  assert.match(en, /An initiative of Richard Lindhout · Open Brand Exchange Foundation \(in formation\)/);
  assert.match(en, /Dutch foundation \(stichting\)/);
  assert.match(en, /href="mailto:hello@openbrandexchange.com"/);
  assert.match(en, /href="mailto:security@openbrandexchange.com"/);
  // No address or phone is shown until the owner fills them in (src/data/imprint.json).
  assert.doesNotMatch(en, /Postal address|href="tel:/);
  assert.match(read('nl/imprint/index.html'), /Open Brand Exchange Foundation \(in oprichting\)/);
  assert.match(read('de/imprint/index.html'), /Open Brand Exchange Foundation \(in Gründung\)/);
  assert.match(read('fr/imprint/index.html'), /Open Brand Exchange Foundation \(en cours de constitution\)/);
});

test('every page footer links the imprint and the general contact address', { skip: !built && 'dist/ not built' }, () => {
  for (const lang of langs) {
    const html = read(`${lang}/index.html`);
    assert.ok(html.includes(`href="/${lang}/imprint/"`), lang);
    assert.ok(html.includes('href="mailto:hello@openbrandexchange.com"'), lang);
  }
});

test('the site never points people at a company address instead of the project addresses', { skip: !built && 'dist/ not built' }, () => {
  for (const lang of langs) {
    for (const slug of slugs) {
      const html = read(`${lang}/${slug}index.html`);
      assert.doesNotMatch(html, /[\w.+-]+@(?!openbrandexchange\.com)[\w-]+\.[\w.]+/, `${lang}/${slug}: an e-mail address outside openbrandexchange.com`);
    }
  }
});

test('the cookie statement and the privacy page say there are no cookies', { skip: !built && 'dist/ not built' }, () => {
  assert.match(read('en/cookies/index.html'), /This website sets no cookies\./);
  assert.match(read('en/privacy/index.html'), /Autoriteit Persoonsgegevens/);
});
