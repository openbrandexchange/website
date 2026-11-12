// The Excel templates in public/downloads/ are copies of spec/templates/ (npm run sync:templates).
// Without a dependency: a small zip reader, then the Products/Assets sheet is compared value for
// value with products.csv/assets.csv of the Kestrel example zip (both come from the spec), so the
// two downloads cannot disagree. With a spec checkout next to this repo (or SPEC_DIR) the copies
// must also be byte-identical to spec/templates/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { inflateRawSync } from 'node:zlib';

const downloads = new URL('../public/downloads/', import.meta.url);
const spec = process.env.SPEC_DIR ?? new URL('../../spec', import.meta.url).pathname;
const TEMPLATES = { 'products.xlsx': 'Products', 'assets.xlsx': 'Assets' };

/** Entries of a zip file: name -> Buffer (stored or deflated). */
function unzip(buf) {
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  assert.ok(eocd >= 0, 'not a zip file');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const out = {};
  for (let i = 0; i < count; i++) {
    assert.equal(buf.readUInt32LE(p), 0x02014b50, 'bad central directory');
    const method = buf.readUInt16LE(p + 10);
    const size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nameLen).toString('utf8');
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const data = buf.subarray(start, start + size);
    out[name] = method === 0 ? data : inflateRawSync(data);
    p += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

const unescape = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&amp;/g, '&');
const colIndex = (ref) => [...ref.replace(/\d+$/, '')].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;

/** The sheets of an xlsx: name -> rows of strings. */
function sheets(buf) {
  const z = unzip(buf);
  const text = (n) => z[n]?.toString('utf8') ?? '';
  const shared = [...text('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => unescape(t[1])).join(''));
  const rels = Object.fromEntries([...text('xl/_rels/workbook.xml.rels').matchAll(/<Relationship ([^>]*)\/>/g)].map((m) => [/Id="([^"]+)"/.exec(m[1])[1], /Target="([^"]+)"/.exec(m[1])[1]]));
  const out = {};
  for (const m of text('xl/workbook.xml').matchAll(/<sheet ([^>]*)\/>/g)) {
    const name = unescape(/name="([^"]+)"/.exec(m[1])[1]);
    const file = 'xl/' + rels[/r:id="([^"]+)"/.exec(m[1])[1]].replace(/^\/?xl\//, '');
    const rows = [];
    for (const r of text(file).matchAll(/<row [^>]*>([\s\S]*?)<\/row>/g)) {
      const row = [];
      for (const c of r[1].matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const ref = /r="([A-Z]+\d+)"/.exec(c[1])[1];
        const type = /t="([^"]+)"/.exec(c[1])?.[1];
        const v = /<v>([\s\S]*?)<\/v>/.exec(c[2] ?? '')?.[1];
        const inline = /<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>/.exec(c[2] ?? '')?.[1];
        let value = '';
        if (type === 's' && v !== undefined) value = shared[Number(v)];
        else if (type === 'inlineStr') value = unescape(inline ?? '');
        else if (v !== undefined) value = unescape(v);
        row[colIndex(ref)] = value;
      }
      rows.push(Array.from(row, (x) => x ?? ''));
    }
    out[name] = rows;
  }
  return out;
}

/** RFC 4180 CSV. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"' && s[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((x) => x !== ''));
}

const example = unzip(readFileSync(new URL('kestrel-example.zip', downloads)));

for (const [file, sheet] of Object.entries(TEMPLATES)) {
  test(`downloads/${file} has the template sheets and the Kestrel example rows`, () => {
    const book = sheets(readFileSync(new URL(file, downloads)));
    assert.deepEqual(Object.keys(book), ['Read me', sheet, 'Explanation', 'Uitleg', 'Lists']);
    const csv = parseCsv(example[`kestrel-example/${file.replace('.xlsx', '.csv')}`].toString('utf8'));
    const [header, ...rows] = book[sheet];
    // products.xlsx has exactly the CSV's columns; assets.xlsx has every assets.csv column of the
    // import format, of which the example file uses some (in the same order).
    const idx = csv[0].map((c) => header.indexOf(c));
    assert.ok(idx.every((x, i) => x >= 0 && (i === 0 || x > idx[i - 1])), `${file}: columns of the example CSV missing or out of order`);
    if (file === 'products.xlsx') assert.deepEqual(header, csv[0]);
    assert.deepEqual(rows.map((r) => idx.map((i) => r[i] ?? '')), csv.slice(1), `${file}: example rows differ from the Kestrel example zip`);
    const explained = book.Explanation.map((r) => r[0]);
    for (const h of header) assert.ok(explained.includes(h), `${file}: column ${h} is not explained`);
    assert.ok(book['Read me'].flat().some((t) => t.includes('{style}_{color}_{position}')), `${file}: image naming rule`);
  });
}

test('downloads/*.xlsx are the spec templates', { skip: !existsSync(join(spec, 'templates')) && 'no spec checkout next to this repo' }, () => {
  for (const file of Object.keys(TEMPLATES)) {
    assert.ok(readFileSync(join(spec, 'templates', file)).equals(readFileSync(new URL(file, downloads))), `public/downloads/${file} differs from spec/templates/${file}; run npm run sync:templates`);
  }
});
