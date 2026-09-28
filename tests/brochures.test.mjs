// The brochure PDFs and social images in public/ are generated (npm run build:brochures).
// These tests make sure they exist for every language, are real PDFs with the expected pages,
// embed only the bundled font (so no glyph fell back to a system font), and are not stale.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { langs } from '../src/lib/i18n-core.ts';
import { inputsHash } from '../scripts/brochure/template.mjs';

const pub = new URL('../public/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('downloads/manifest.json', pub), 'utf8'));
const kinds = { brands: 6, retailers: 4 };

/** Font names in a PDF, from /BaseFont entries (also inside compressed object streams). */
function fontNames(buf) {
  const text = [buf.toString('latin1')];
  for (const m of buf.toString('latin1').matchAll(/stream\r?\n/g)) {
    try {
      text.push(inflateSync(buf.subarray(m.index + m[0].length)).toString('latin1'));
    } catch {
      /* not a flate stream */
    }
  }
  return new Set(text.flatMap((t) => [...t.matchAll(/\/BaseFont\s*\/(?:[A-Z]{6}\+)?([\w-]+)/g)].map((m) => m[1])));
}

for (const [kind, pages] of Object.entries(kinds)) {
  for (const lang of langs) {
    test(`${kind}-${lang}.pdf exists, has ${pages} pages, uses only Inter and matches the current texts`, () => {
      const name = `${kind}-${lang}.pdf`;
      const file = new URL(`downloads/${name}`, pub);
      assert.ok(existsSync(file), `${name} missing: run npm run build:brochures`);
      const buf = readFileSync(file);
      assert.equal(buf.subarray(0, 5).toString(), '%PDF-');
      const entry = manifest.files[name];
      assert.ok(entry, `${name} not in manifest`);
      assert.equal(entry.pages, pages);
      assert.equal(entry.hash, inputsHash(kind, lang), `${name} is stale: the texts or layout changed; run npm run build:brochures -- --lang ${lang}`);
      const fonts = [...fontNames(buf)];
      assert.ok(fonts.length > 0, 'no fonts found');
      for (const font of fonts) assert.match(font, /^Inter-/, `${name}: unexpected font ${font}`);
    });
  }
}

/** Width and height of a baseline or progressive JPEG. */
function jpegSize(buf) {
  let i = 2;
  while (i < buf.length) {
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc2) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return null;
}

test('every language has a 1200×630 social image that matches the current headline', () => {
  for (const lang of langs) {
    const file = new URL(`og/${lang}.jpg`, pub);
    assert.ok(existsSync(file), `og/${lang}.jpg`);
    assert.deepEqual(jpegSize(readFileSync(file)), { width: 1200, height: 630 }, lang);
    assert.equal(manifest.files[`og/${lang}.jpg`]?.hash, inputsHash('og', lang), `og/${lang}.jpg is stale`);
  }
});
