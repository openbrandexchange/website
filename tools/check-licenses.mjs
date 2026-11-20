#!/usr/bin/env node
// Check the licences of every installed dependency (every package.json under node_modules/, so run
// `bun install` first) against a policy.
// The site ships only its own code and texts: dependencies are build tools. Permissive licences
// are always fine; MPL-2.0 (lightningcss, axe-core) and LGPL-3.0 (sharp's prebuilt libvips) are
// accepted because they are used unmodified at build time and never shipped in dist/.
// Fonts (OFL-1.1): Inter is served unmodified as the site's web font and embedded in the brochure
// PDFs, both of which the OFL allows. Anything else fails.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const permissive = ['MIT', 'ISC', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', '0BSD', 'BlueOak-1.0.0', 'CC0-1.0', 'Python-2.0', 'Unlicense', 'CC-BY-4.0'];
const buildOnly = ['MPL-2.0', 'LGPL-3.0-or-later', 'OFL-1.1'];
const allowed = new Set([...permissive, ...buildOnly]);

const root = new URL('../node_modules/', import.meta.url).pathname;
if (!existsSync(root)) {
  console.error('node_modules/ is missing: run `bun install` first.');
  process.exit(1);
}
// Every installed package once (name@version), also nested node_modules/ and bun's .bun/ store.
const installed = new Map();
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === '.bin' || entry.name === '.cache') continue;
    const path = join(dir, entry.name);
    if (entry.name.startsWith('@') || entry.name === '.bun') {
      walk(path);
      continue;
    }
    const manifest = join(path, 'package.json');
    if (existsSync(manifest)) {
      const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
      if (pkg.name && pkg.version) installed.set(`${pkg.name}@${pkg.version}`, pkg);
    }
    if (existsSync(join(path, 'node_modules'))) walk(join(path, 'node_modules'));
  }
};
walk(root);

const licenceOf = (pkg) => {
  if (typeof pkg.license === 'string') return pkg.license;
  if (pkg.license?.type) return pkg.license.type;
  if (Array.isArray(pkg.licenses)) return pkg.licenses.map((l) => l.type ?? l).join(' OR ');
  return '';
};
const problems = [];
const counts = {};
for (const [id, pkg] of installed) {
  const expr = licenceOf(pkg);
  // "A OR B": one allowed option is enough. "A AND B": every part must be allowed.
  const ok = expr.split(/\s+OR\s+/).some((alt) => alt.replace(/[()]/g, '').split(/\s+AND\s+/).every((part) => allowed.has(part.trim())));
  counts[expr || 'NONE'] = (counts[expr || 'NONE'] ?? 0) + 1;
  if (!ok) problems.push(`${id}: ${expr || 'no licence field'}`);
}
for (const [expr, n] of Object.entries(counts).sort()) console.log(`${String(n).padStart(4)}  ${expr}`);
if (problems.length) {
  console.error('\nDependencies with a licence outside the policy (tools/check-licenses.mjs):\n' + problems.join('\n'));
  process.exit(1);
}
console.log('\nAll dependency licences are within the policy.');
