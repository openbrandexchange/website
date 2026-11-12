#!/usr/bin/env node
// Copy the Excel templates for brands from the specification (spec/templates/, generated there
// from the schemas and the Kestrel fixtures by `npm run templates`) to public/downloads/, so the
// Downloads page can link /downloads/products.xlsx and /downloads/assets.xlsx.
// tests/templates.test.mjs checks that the copies match the Kestrel example zip and, when a spec
// checkout is next to this repo, that they are byte-identical to spec/templates/.
//   npm run sync:templates                 # expects ../spec next to this repo
//   npm run sync:templates -- <path-to-spec-checkout>
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const TEMPLATES = ['products.xlsx', 'assets.xlsx'];
const here = (p) => new URL(p, import.meta.url).pathname;
const spec = process.argv[2] ?? here('../../spec');
const missing = TEMPLATES.filter((f) => !existsSync(join(spec, 'templates', f)));
if (missing.length) {
  console.error(`No ${missing.join(', ')} in ${join(spec, 'templates')}. Pass the path to a checkout of openbrandexchange/spec (run npm run templates there first).`);
  process.exit(1);
}
for (const f of TEMPLATES) copyFileSync(join(spec, 'templates', f), here(`../public/downloads/${f}`));
console.log(`Copied ${TEMPLATES.join(', ')} from ${join(spec, 'templates')} to public/downloads/.`);
