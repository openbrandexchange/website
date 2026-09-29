#!/usr/bin/env node
// Check the licences of every installed dependency (from package-lock.json) against a policy.
// The site ships only its own code and texts: dependencies are build tools. Permissive licences
// are always fine; MPL-2.0 (lightningcss, axe-core) and LGPL-3.0 (sharp's prebuilt libvips) are
// accepted because they are used unmodified at build time and never shipped in dist/.
// Fonts (OFL-1.1): Inter is served unmodified as the site's web font and embedded in the brochure
// PDFs, both of which the OFL allows. Anything else fails.
import { readFileSync } from 'node:fs';

const permissive = ['MIT', 'ISC', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', '0BSD', 'BlueOak-1.0.0', 'CC0-1.0', 'Python-2.0', 'Unlicense', 'CC-BY-4.0'];
const buildOnly = ['MPL-2.0', 'LGPL-3.0-or-later', 'OFL-1.1'];
const allowed = new Set([...permissive, ...buildOnly]);

const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
const problems = [];
const counts = {};
for (const [path, pkg] of Object.entries(lock.packages ?? {})) {
  if (!path) continue; // the root package
  const name = path.replace(/^.*node_modules\//, '');
  const expr = pkg.license ?? '';
  // "A OR B": one allowed option is enough. "A AND B": every part must be allowed.
  const ok = expr.split(/\s+OR\s+/).some((alt) => alt.replace(/[()]/g, '').split(/\s+AND\s+/).every((id) => allowed.has(id.trim())));
  counts[expr || 'NONE'] = (counts[expr || 'NONE'] ?? 0) + 1;
  if (!ok) problems.push(`${name}@${pkg.version}: ${expr || 'no licence field'}`);
}
for (const [expr, n] of Object.entries(counts).sort()) console.log(`${String(n).padStart(4)}  ${expr}`);
if (problems.length) {
  console.error('\nDependencies with a licence outside the policy (tools/check-licenses.mjs):\n' + problems.join('\n'));
  process.exit(1);
}
console.log('\nAll dependency licences are within the policy.');
