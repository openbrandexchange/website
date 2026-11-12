// Checks the built site in dist/ (run `npm run build` first; `npm run check` does both).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { langs } from '../src/lib/i18n-core.ts';
import { checkSite } from '../tools/check-links.mjs';

const dist = new URL('../dist/', import.meta.url);
const read = (path) => readFileSync(new URL(path, dist), 'utf8');
const slugs = ['', 'for-brands/', 'automation/', 'hosting/', 'partners/', 'for-retailers/', 'developers/', 'check/', 'directory/', 'downloads/', 'faq/', 'governance/', 'privacy/', 'cookies/', 'imprint/'];
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
        // schema.org data is not executed, so the policy does not apply; it must be valid JSON.
        if (/\stype="application\/ld\+json"/.test(attrs)) {
          assert.equal(JSON.parse(body)['@context'], 'https://schema.org', `${lang}/${slug}: JSON-LD`);
          continue;
        }
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

test('the imprint names the publisher on behalf of the foundation in formation, with address, KvK and contact addresses', { skip: !built && 'dist/ not built' }, () => {
  const en = read('en/imprint/index.html');
  assert.match(en, /Open Brand Exchange Foundation \(in formation\)/);
  assert.match(en, /published by webRidge on behalf of the Open Brand Exchange Foundation \(in formation\)/);
  assert.match(en, /sole proprietorship of Richard Lindhout/);
  assert.match(en, /Kreeftenstraat 36<br\s*\/?>\s*4691 KR Tholen<br\s*\/?>\s*Netherlands/);
  assert.match(en, /KvK 56845367/);
  assert.doesNotMatch(en, /\b(VAT|BTW)\b/);
  assert.match(read('nl/imprint/index.html'), /Nederland/);
  assert.match(read('en/privacy/index.html'), /controller for this website is webRidge/);
  assert.doesNotMatch(read('en/index.html'), /Richard Lindhout/);
  assert.match(en, /Dutch foundation \(stichting\)/);
  assert.match(en, /href="mailto:hello@openbrandexchange.com"/);
  assert.match(en, /href="mailto:security@openbrandexchange.com"/);
  // No phone number is published (src/data/imprint.json).
  assert.doesNotMatch(en, /href="tel:/);
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

test('the web hosting steps match the release: its file name, the writable folders, the setup code file and the cron job', { skip: !built && 'dist/ not built' }, () => {
  for (const lang of langs) {
    const html = read(`${lang}/hosting/index.html`);
    const steps = html.slice(html.indexOf('id="web-hosting"'), html.indexOf('id="docker"'));
    assert.ok(steps.includes('obx-portal-php-&lt;version&gt;.zip'), `${lang}: release file name`);
    assert.doesNotMatch(steps, /obx-node-php\.zip/, `${lang}: old file name`);
    assert.ok(steps.includes('data/SETUP-CODE.txt'), `${lang}: where the setup code is`);
    assert.match(steps, /775/, `${lang}: folder permissions`);
    assert.match(steps, /cron/i, `${lang}: cron job`);
    assert.ok(html.includes('./deploy/cloudrun.sh'), `${lang}: node-go's real deploy script`);
  }
});

test('the automation page names the admin menus as the portal shows them', { skip: !built && 'dist/ not built' }, async () => {
  const { readFile } = await import('node:fs/promises');
  for (const lang of langs) {
    const admin = JSON.parse(await readFile(new URL(`../../admin-ui/src/locales/${lang}.json`, import.meta.url), 'utf8').catch(() => 'null'));
    if (!admin) return; // admin-ui is not checked out next to the website (CI): nothing to compare
    const html = read(`${lang}/automation/index.html`).replaceAll('&gt;', '>').replaceAll('&#39;', "'").replaceAll('&amp;', '&');
    const nav = admin.admin.nav.automation;
    assert.ok(html.includes(`${nav} → ${admin.automation.tab.tokens}`), `${lang}: access keys path`);
    assert.ok(html.includes(`${nav} → ${admin.automation.tab.sources} → ${admin.sources.add}`), `${lang}: scheduled import path`);
  }
});

test('the automation page names the import modes and the connection test as the portal shows them', { skip: !built && 'dist/ not built' }, async () => {
  const { readFile } = await import('node:fs/promises');
  for (const lang of langs) {
    const admin = JSON.parse(await readFile(new URL(`../../admin-ui/src/locales/${lang}.json`, import.meta.url), 'utf8').catch(() => 'null'));
    if (!admin) return; // admin-ui is not checked out next to the website (CI): nothing to compare
    const html = read(`${lang}/automation/index.html`).replaceAll('&#39;', "'").replaceAll('&amp;', '&');
    for (const label of [admin.imports.modeUpsert, admin.imports.modeMirror, admin.sources.test]) assert.ok(html.includes(label), `${lang}: "${label}"`);
  }
});

test('the Cloudflare edition says which plan it needs and where its web versions come from', { skip: !built && 'dist/ not built' }, () => {
  for (const lang of langs) {
    assert.ok(read(`${lang}/hosting/index.html`).includes('Workers Paid'), `${lang}: hosting names the Workers Paid plan`);
    assert.match(read(`${lang}/automation/index.html`), /obx/, `${lang}: automation names obx`);
  }
  // A scheduled import delivers originals only; on Cloudflare it does not make web versions.
  assert.doesNotMatch(read('en/automation/index.html'), /use a scheduled import or obx: they make them/);
});

test('the example files are one download in every language', { skip: !built && 'dist/ not built' }, () => {
  const zip = readFileSync(new URL('downloads/kestrel-example.zip', dist));
  assert.equal(zip.subarray(0, 4).toString('latin1'), 'PK\x03\x04');
  const names = zip.toString('latin1');
  for (const f of ['kestrel-example/products.csv', 'kestrel-example/assets.csv', 'kestrel-example/images/KO-1001_NVY_1_front.png']) assert.ok(names.includes(f), f);
  assert.ok(!names.includes('images.json'), 'test metadata stays out');
  for (const lang of langs) assert.ok(read(`${lang}/downloads/index.html`).includes('href="/downloads/kestrel-example.zip"'), `${lang}: link`);
});

test('the Docker steps work when copied: the setup code is read from the log on stderr, the key is kept', { skip: !built && 'dist/ not built' }, () => {
  const html = read('en/hosting/index.html').replaceAll('&gt;', '>').replaceAll('&amp;', '&').replaceAll('&quot;', '"');
  // The node logs to standard error; "docker logs obx | grep" would find nothing.
  assert.ok(html.includes('docker logs obx 2>&1 | grep -i "setup code"'), 'setup code from both streams');
  assert.doesNotMatch(html, /OBX_SECRET_KEY="\$\(openssl/, 'a key generated inline cannot be kept');
  assert.ok(html.includes('OBX_TRUST_PROXY: "true"'), 'behind Caddy the node trusts its X-Forwarded-For');
  assert.ok(html.includes('DRY_RUN=1 ./deploy/cloudrun.sh'), 'Cloud Run dry run');
});

test('every error code has a page at its problem type URL, with its HTTP status', { skip: !built && 'dist/ not built' }, () => {
  const { errors, warnings, current_schema_version: current } = JSON.parse(readFileSync(new URL('../src/data/errors.json', import.meta.url), 'utf8'));
  const common = JSON.parse(read(`schemas/${current}/Common.json`)).$defs;
  assert.deepEqual(errors.map((e) => e.code).sort(), [...common.ErrorCode.enum].sort(), 'the pages cover exactly the error codes of the schemas');
  assert.deepEqual(warnings.map((w) => w.code).sort(), [...common.WarningCode.enum].sort(), 'and exactly the warning codes');
  for (const e of [...errors, ...warnings]) {
    const html = read(`errors/${e.code}/index.html`);
    if (e.status) {
      assert.ok(html.includes(`https://openbrandexchange.com/errors/${e.code}`), e.code);
      assert.match(html, new RegExp(`<dd>${e.status}</dd>`), `${e.code}: HTTP ${e.status}`);
    } else {
      assert.match(html, /never blocks/, `${e.code}: a warning never blocks publishing`);
      assert.ok(html.includes(`<code>${e.column}</code>`), `${e.code}: column ${e.column}`);
    }
    for (const [, attrs] of html.matchAll(/<script([^>]*)>/g)) assert.match(attrs, /\ssrc="/, `${e.code}: inline script`);
    assert.doesNotMatch(html, /<style[\s>]|\sstyle="/, `${e.code}: inline style`);
    assert.doesNotMatch(html, /[\w.+-]+@(?!openbrandexchange\.com)[\w-]+\.[\w.]+/, `${e.code}: e-mail address outside openbrandexchange.com`);
  }
  for (const w of ['fibre_composition_missing', 'animal_origin_unknown', 'footwear_materials_missing', 'fibre_percentages_not_100']) {
    assert.ok(warnings.some((x) => x.code === w), `warning ${w} (spec 0.2)`);
  }
});

test('the schemas are served at the address of their $id, and the API reference with them', { skip: !built && 'dist/ not built' }, () => {
  // Every version stays served: the frozen 0.1 copies next to the current 0.2 schemas.
  const versions = readdirSync(new URL('schemas/', dist)).filter((d) => /^v\d+\.\d+$/.test(d));
  for (const v of ['v0.1', 'v0.2']) assert.ok(versions.includes(v), `schemas/${v}/ is served`);
  for (const v of versions) {
    const files = readdirSync(new URL(`schemas/${v}/`, dist)).filter((f) => f.endsWith('.json'));
    assert.ok(files.length >= 40, `${v}: ${files.length} schemas`);
    for (const f of files) assert.equal(JSON.parse(read(`schemas/${v}/${f}`)).$id, `https://openbrandexchange.com/schemas/${v}/${f}`);
  }
  for (const f of ['Measurements.json', 'Features.json', 'FootwearMaterials.json', 'Certifications.json']) {
    assert.ok(existsSync(new URL(`schemas/v0.2/${f}`, dist)), `the 0.2 schema ${f}`);
  }
  for (const page of ['index', 'protocol', 'ingest', 'admin']) {
    assert.match(read(`reference/${page}.html`), /<meta http-equiv="Content-Security-Policy"/, `reference/${page}.html has its own policy`);
  }
  const headers = read('_headers');
  const rule = headers.slice(headers.indexOf('/reference/*'));
  assert.match(rule, /^\/reference\/\*\n {2}! Content-Security-Policy\n/, 'the site-wide policy is detached for /reference/ only');
});
